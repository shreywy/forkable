"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { buildSnapshot, type RecipeSnapshot } from "@/lib/snapshot";
import { diffSnapshots } from "@/lib/diff";
import { fetchSnapshotSource } from "@/lib/snapshot-db";
import { parseAmount } from "@/lib/parse-amount";
import type { Prisma } from "@prisma/client";

const CommentSchema = z.object({
  recipeId: z.string(),
  body:     z.string().min(4).max(2000),
  rating:   z.number().int().min(1).max(5).optional(),
});

const SuggestionSchema = z.object({
  recipeId: z.string(),
  title:    z.string().min(4).max(120),
  body:     z.string().max(2000).optional(),
  diff:     z.array(z.object({
    ingredient: z.string(),
    from:       z.string(),
    to:         z.string(),
  })),
});

export async function createComment(input: z.infer<typeof CommentSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sign in to leave a taste test" };

  const parsed = CommentSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { recipeId, body, rating } = parsed.data;

  await prisma.$transaction([
    prisma.tasteTest.create({
      data: {
        recipeId,
        authorId: session.user.id,
        type:     "COMMENT",
        body,
        rating,
      },
    }),
    prisma.recipe.update({
      where: { id: recipeId },
      data:  { tasteTestCount: { increment: 1 } },
    }),
  ]);

  // Notify author
  const recipe = await prisma.recipe.findUnique({ where: { id: recipeId }, select: { authorId: true } });
  if (recipe && recipe.authorId !== session.user.id) {
    prisma.notification.create({
      data: {
        recipientId: recipe.authorId,
        actorId:     session.user.id,
        type:        "NEW_TASTE_TEST",
        entityId:    recipeId,
        entityType:  "TasteTest",
      },
    }).catch(() => {});
  }

  const r = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: { slug: true, author: { select: { username: true } } },
  });
  if (r) revalidatePath(`/${r.author.username}/${r.slug}`);

  return { success: true };
}

export async function createSuggestion(input: z.infer<typeof SuggestionSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sign in to suggest changes" };

  const parsed = SuggestionSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { recipeId, title, body, diff } = parsed.data;

  await prisma.$transaction([
    prisma.tasteTest.create({
      data: {
        recipeId,
        authorId: session.user.id,
        type:     "SUGGESTION",
        title,
        body,
        diff,
      },
    }),
    prisma.recipe.update({
      where: { id: recipeId },
      data:  { tasteTestCount: { increment: 1 } },
    }),
  ]);

  const r = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: { slug: true, author: { select: { username: true } } },
  });
  if (r) revalidatePath(`/${r.author.username}/${r.slug}`);

  return { success: true };
}

/**
 * Merge an open suggestion into the recipe (a one-click cherry-pick):
 * applies each diff entry to the matching ingredient, records a new version
 * credited to the SUGGESTION AUTHOR, and marks the suggestion merged.
 */
export async function mergeSuggestion(tasteTestId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const tt = await prisma.tasteTest.findUnique({
    where: { id: tasteTestId },
    include: {
      recipe: { select: { id: true, authorId: true, slug: true, author: { select: { username: true } } } },
    },
  });
  if (!tt) return { error: "Not found" };
  if (tt.recipe.authorId !== session.user.id) return { error: "Not authorised" };
  if (tt.type !== "SUGGESTION") return { error: "Only suggestions can be merged" };
  if (tt.status !== "OPEN") return { error: "This suggestion is already resolved" };

  const diffEntries =
    (tt.diff as { ingredient: string; from: string; to: string }[] | null) ?? [];

  await prisma.$transaction(async (tx) => {
    // 1. Apply each suggested ingredient change
    for (const entry of diffEntries) {
      const ci = await tx.componentIngredient.findFirst({
        where: {
          component: { recipeId: tt.recipe.id },
          ingredient: { name: { equals: entry.ingredient, mode: "insensitive" } },
        },
        select: { id: true, amount: true, unit: true },
      });
      if (!ci) continue; // ingredient no longer in the recipe - skip gracefully
      const parsed = parseAmount(entry.to);
      await tx.componentIngredient.update({
        where: { id: ci.id },
        data: {
          amount: parsed.amount ?? ci.amount,
          unit: parsed.unit ?? ci.unit,
        },
      });
    }

    // 2. Record a version, credited to the suggestion author
    const source = await fetchSnapshotSource(tx, tt.recipe.id);
    const snapshot = buildSnapshot(source!);
    const prevVersion = await tx.recipeVersion.findFirst({
      where: { recipeId: tt.recipe.id },
      orderBy: { createdAt: "desc" },
      select: { snapshot: true },
    });
    const prevSnapshot = (prevVersion?.snapshot ?? null) as RecipeSnapshot | null;
    const diff = prevSnapshot ? diffSnapshots(prevSnapshot, snapshot) : null;

    await tx.recipeVersion.create({
      data: {
        recipeId: tt.recipe.id,
        authorId: tt.authorId,
        message: `Merge taste test: "${tt.title ?? "suggestion"}"`,
        additions: diff?.additions ?? diffEntries.length,
        deletions: diff?.deletions ?? 0,
        snapshot: snapshot as unknown as Prisma.InputJsonValue,
      },
    });

    await tx.recipe.update({
      where: { id: tt.recipe.id },
      data: { tweakCount: { increment: 1 } },
    });

    await tx.tasteTest.update({
      where: { id: tasteTestId },
      data: { status: "MERGED" },
    });
  });

  if (tt.authorId !== session.user.id) {
    prisma.notification.create({
      data: {
        recipientId: tt.authorId,
        actorId:     session.user.id,
        type:        "SUGGESTION_MERGED",
        entityId:    tasteTestId,
        entityType:  "TasteTest",
      },
    }).catch(() => {});
  }

  revalidatePath(`/${tt.recipe.author.username}/${tt.recipe.slug}`);
  return { success: true };
}

export async function closeSuggestion(tasteTestId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const tt = await prisma.tasteTest.findUnique({
    where: { id: tasteTestId },
    include: {
      recipe: { select: { authorId: true, slug: true, author: { select: { username: true } } } },
    },
  });
  if (!tt) return { error: "Not found" };
  if (tt.recipe.authorId !== session.user.id) return { error: "Not authorised" };
  if (tt.status !== "OPEN") return { error: "This suggestion is already resolved" };

  await prisma.tasteTest.update({
    where: { id: tasteTestId },
    data:  { status: "CLOSED" },
  });

  if (tt.authorId !== session.user.id) {
    prisma.notification.create({
      data: {
        recipientId: tt.authorId,
        actorId:     session.user.id,
        type:        "SUGGESTION_CLOSED",
        entityId:    tasteTestId,
        entityType:  "TasteTest",
      },
    }).catch(() => {});
  }

  revalidatePath(`/${tt.recipe.author.username}/${tt.recipe.slug}`);
  return { success: true };
}
