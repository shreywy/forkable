"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { toSlug } from "@/lib/slug";
import { buildSnapshot, countUnits, type RecipeSnapshot } from "@/lib/snapshot";
import { diffSnapshots } from "@/lib/diff";
import { fetchSnapshotSource } from "@/lib/snapshot-db";
import { ensureTagTx, ensureIngredientTx } from "@/lib/catalog";
import type { Prisma } from "@prisma/client";

// ── Schemas ────────────────────────────────────────────────────────────────────

const IngredientInputSchema = z.object({
  name:        z.string().min(1),
  amount:      z.number().optional(),
  unit:        z.string().optional(),
  preparation: z.string().optional(),
});

const StepInputSchema = z.object({
  content: z.string().min(1),
});

const ComponentInputSchema = z.object({
  name:        z.string().min(1),
  displayName: z.string().optional(),
  type:        z.enum(["FOLDER", "FILE"]).default("FOLDER"),
  steps:       z.array(StepInputSchema).default([]),
  ingredients: z.array(IngredientInputSchema).default([]),
});

const CreateRecipeSchema = z.object({
  name:        z.string().min(2).max(120),
  description: z.string().max(1000),
  tags:        z.array(z.string()).max(8).default([]),
  components:  z.array(ComponentInputSchema).default([]),
  servings:    z.number().int().min(1).max(100).default(4),
  imageUrl:    z.string().url().optional(),
});

export type CreateRecipeInput = z.infer<typeof CreateRecipeSchema>;

// ── Helpers ───────────────────────────────────────────────────────────────────

// ── Actions ───────────────────────────────────────────────────────────────────

export async function createRecipe(input: CreateRecipeInput) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const parsed = CreateRecipeSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { name, description, tags, components, servings, imageUrl } = parsed.data;
  const slug = toSlug(name);

  // Check slug uniqueness for this user
  const existing = await prisma.recipe.findUnique({
    where: { authorId_slug: { authorId: session.user.id, slug } },
    select: { id: true },
  });
  if (existing) return { error: "You already have a recipe with this name." };

  // Create everything in a transaction
  const recipe = await prisma.$transaction(async (tx) => {
    // 1. Create recipe
    const r = await tx.recipe.create({
      data: {
        slug,
        name,
        description,
        servings,
        imageUrl,
        authorId: session.user.id,
        tweakCount: 1, // initial commit
      },
    });

    // 2. Tags
    for (const tagName of tags) {
      const tag = await ensureTagTx(tx, tagName);
      await tx.recipeTag.create({
        data: { recipeId: r.id, tagId: tag.id },
      });
    }

    // 3. Components
    for (let ci = 0; ci < components.length; ci++) {
      const comp = components[ci];
      const component = await tx.component.create({
        data: {
          recipeId: r.id,
          name: toSlug(comp.name),
          displayName: comp.displayName ?? comp.name,
          type: comp.type,
          order: ci,
        },
      });

      // Steps
      for (let si = 0; si < comp.steps.length; si++) {
        await tx.step.create({
          data: {
            componentId: component.id,
            order: si,
            content: comp.steps[si].content,
          },
        });
      }

      // Ingredients
      for (let ii = 0; ii < comp.ingredients.length; ii++) {
        const ing = comp.ingredients[ii];
        const ingredient = await ensureIngredientTx(tx, ing.name);
        await tx.componentIngredient.create({
          data: {
            componentId:  component.id,
            ingredientId: ingredient.id,
            amount:       ing.amount,
            unit:         ing.unit,
            preparation:  ing.preparation,
            order:        ii,
          },
        });
      }
    }

    // 4. Initial commit with a full content snapshot
    const source = await fetchSnapshotSource(tx, r.id);
    const snapshot = buildSnapshot(source!);
    await tx.recipeVersion.create({
      data: {
        recipeId: r.id,
        authorId: session.user.id,
        message:  "Initial commit",
        additions: countUnits(snapshot),
        snapshot: snapshot as unknown as Prisma.InputJsonValue,
      },
    });

    return r;
  });

  revalidatePath("/");
  revalidatePath(`/${session.user.username}`);

  return { success: true, slug: recipe.slug, username: session.user.username };
}

export async function deleteRecipe(recipeId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: { authorId: true, slug: true },
  });
  if (!recipe) return { error: "Recipe not found" };
  if (recipe.authorId !== session.user.id) return { error: "Not authorised" };

  await prisma.recipe.delete({ where: { id: recipeId } });

  revalidatePath("/");
  revalidatePath(`/${session.user.username}`);
  redirect(`/${session.user.username}`);
}

export async function createTweak(recipeId: string, message: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  if (message.trim().length < 4) return { error: "Tweak message must be at least 4 characters" };
  if (message.length > 200)      return { error: "Tweak message too long" };

  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: { authorId: true, slug: true },
    // In Phase 3: allow collaborators too
  });
  if (!recipe) return { error: "Recipe not found" };
  if (recipe.authorId !== session.user.id) return { error: "Not authorised" };

  // Snapshot the current content and diff against the previous version
  const source = await fetchSnapshotSource(prisma, recipeId);
  const snapshot = buildSnapshot(source!);
  const prevVersion = await prisma.recipeVersion.findFirst({
    where: { recipeId },
    orderBy: { createdAt: "desc" },
    select: { snapshot: true },
  });
  const prevSnapshot = (prevVersion?.snapshot ?? null) as RecipeSnapshot | null;
  const diff = prevSnapshot ? diffSnapshots(prevSnapshot, snapshot) : null;

  await prisma.$transaction([
    prisma.recipeVersion.create({
      data: {
        recipeId,
        authorId: session.user.id,
        message: message.trim(),
        additions: diff?.additions ?? countUnits(snapshot),
        deletions: diff?.deletions ?? 0,
        snapshot: snapshot as unknown as Prisma.InputJsonValue,
      },
    }),
    prisma.recipe.update({
      where: { id: recipeId },
      data: { tweakCount: { increment: 1 }, updatedAt: new Date() },
    }),
  ]);

  const slug = recipe.slug;
  revalidatePath(`/${session.user.username}/${slug}`);
  return { success: true };
}
