import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { buildSnapshot, countUnits, type RecipeSnapshot } from "@/lib/snapshot";
import { diffSnapshots } from "@/lib/diff";
import { fetchSnapshotSource } from "@/lib/snapshot-db";
import type { Prisma } from "@prisma/client";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string; slug: string }> },
) {
  const { username, slug } = await params;

  const recipe = await prisma.recipe.findFirst({
    where: { slug, author: { username } },
    include: {
      author: { select: { username: true, displayName: true, avatarUrl: true } },
      components: {
        where: { parentId: null },
        orderBy: { order: "asc" },
        include: {
          steps: { orderBy: { order: "asc" } },
          ingredients: { include: { ingredient: { select: { name: true } } } },
          children: {
            orderBy: { order: "asc" },
            include: {
              steps: { orderBy: { order: "asc" } },
              ingredients: { include: { ingredient: { select: { name: true } } } },
            },
          },
        },
      },
      tags: { include: { tag: true } },
    },
  });

  if (!recipe) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Shape a cook-friendly response
  const components = recipe.components.map((c) => {
    const steps = c.steps.map((s, i) => ({ step: i + 1, text: s.content }));
    const subComponents = c.children.map((ch) => ({
      name: ch.name,
      displayName: ch.displayName,
      type: ch.type,
      steps: ch.steps.map((s, i) => ({ step: i + 1, text: s.content })),
    }));
    return {
      name: c.name,
      displayName: c.displayName,
      type: c.type,
      steps,
      subComponents,
    };
  });

  const instructions = recipe.components
    .flatMap((c) => c.steps)
    .map((s, i) => ({ step: i + 1, text: s.content }));

  return NextResponse.json({
    id: recipe.id,
    slug: recipe.slug,
    name: recipe.name,
    description: recipe.description,
    imageUrl: recipe.imageUrl,
    author: recipe.author,
    servings: recipe.servings,
    calories: recipe.calories,
    proteinG: recipe.proteinG,
    carbsG: recipe.carbsG,
    fatG: recipe.fatG,
    fiberG: recipe.fiberG,
    starCount: recipe.starCount,
    forkCount: recipe.forkCount,
    tasteTestCount: recipe.tasteTestCount,
    tweakCount: recipe.tweakCount,
    tags: recipe.tags.map((rt) => ({ name: rt.tag.name, label: rt.tag.label })),
    updatedAt: recipe.updatedAt,
    components,
    instructions,
  });
}

// ── PUT — save edits + create a tweak (commit) ───────────────────────────────

type EditIngredient = { name: string; amount: string; unit: string };
type EditStep = { content: string };
type EditComponent = { id: string; ingredients: EditIngredient[]; steps: EditStep[] };

function toSlug(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "ingredient";
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ username: string; slug: string }> },
) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | null)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { username, slug } = await params;

  const recipe = await prisma.recipe.findFirst({
    where: { slug, author: { username } },
    select: { id: true, authorId: true, name: true },
  });
  if (!recipe) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (recipe.authorId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json() as {
    name: string;
    description: string;
    tags: string[];
    components: EditComponent[];
    tweakMessage: string;
  };

  await prisma.$transaction(async (tx) => {
    // 1. Update recipe metadata
    await tx.recipe.update({
      where: { id: recipe.id },
      data: {
        name: body.name.trim(),
        description: body.description.trim(),
        tweakCount: { increment: 1 },
      },
    });

    // 2. Replace tags
    await tx.recipeTag.deleteMany({ where: { recipeId: recipe.id } });
    for (const tagSlug of body.tags) {
      const label = tagSlug.charAt(0).toUpperCase() + tagSlug.slice(1);
      const tag = await tx.tag.upsert({
        where: { name: tagSlug },
        create: { name: tagSlug, label },
        update: {},
      });
      await tx.recipeTag.create({ data: { recipeId: recipe.id, tagId: tag.id } });
    }

    // 3. Update each component's ingredients + steps
    for (const comp of body.components) {
      // Delete and recreate ComponentIngredients
      await tx.componentIngredient.deleteMany({ where: { componentId: comp.id } });
      for (let i = 0; i < comp.ingredients.length; i++) {
        const ing = comp.ingredients[i];
        const name = ing.name.trim();
        if (!name) continue;
        const slug = toSlug(name);
        const ingredient = await tx.ingredient.upsert({
          where: { slug },
          create: { slug, name },
          update: {},
        });
        await tx.componentIngredient.create({
          data: {
            componentId: comp.id,
            ingredientId: ingredient.id,
            amount: ing.amount ? parseFloat(ing.amount) : null,
            unit: ing.unit || null,
            order: i,
          },
        });
      }

      // Delete and recreate Steps
      await tx.step.deleteMany({ where: { componentId: comp.id } });
      for (let i = 0; i < comp.steps.length; i++) {
        const text = comp.steps[i].content.trim();
        if (!text) continue;
        await tx.step.create({
          data: { componentId: comp.id, content: text, order: i },
        });
      }
    }

    // 4. Create RecipeVersion (tweak commit) with a content snapshot,
    //    diffed against the previous version for accurate +/- stats
    const source = await fetchSnapshotSource(tx, recipe.id);
    const snapshot = buildSnapshot(source!);
    const prevVersion = await tx.recipeVersion.findFirst({
      where: { recipeId: recipe.id },
      orderBy: { createdAt: "desc" },
      select: { snapshot: true },
    });
    const prevSnapshot = (prevVersion?.snapshot ?? null) as RecipeSnapshot | null;
    const diff = prevSnapshot ? diffSnapshots(prevSnapshot, snapshot) : null;

    await tx.recipeVersion.create({
      data: {
        recipeId: recipe.id,
        authorId: userId,
        message: body.tweakMessage.trim(),
        additions: diff?.additions ?? countUnits(snapshot),
        deletions: diff?.deletions ?? 0,
        snapshot: snapshot as unknown as Prisma.InputJsonValue,
      },
    });
  });

  return NextResponse.json({ success: true });
}
