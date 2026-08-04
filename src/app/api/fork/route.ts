import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { sourceRecipeId } = await req.json();
  if (!sourceRecipeId) {
    return NextResponse.json({ error: "sourceRecipeId required" }, { status: 400 });
  }

  // Load source recipe with all content
  const source = await prisma.recipe.findUnique({
    where: { id: sourceRecipeId },
    include: {
      components: {
        include: {
          steps: { orderBy: { order: "asc" } },
          ingredients: { orderBy: { order: "asc" } },
          children: {
            include: {
              steps: { orderBy: { order: "asc" } },
              ingredients: { orderBy: { order: "asc" } },
            },
          },
        },
        where: { parentId: null },
        orderBy: { order: "asc" },
      },
      tags: true,
    },
  });

  if (!source) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  // Check not forking own recipe
  if (source.authorId === userId) {
    return NextResponse.json({ error: "Cannot fork your own recipe" }, { status: 400 });
  }

  // Check already forked
  const existingFork = await prisma.fork.findUnique({
    where: { userId_sourceId: { userId, sourceId: sourceRecipeId } },
    include: { recipe: { include: { author: { select: { username: true } } } } },
  });
  if (existingFork) {
    return NextResponse.json({
      alreadyForked: true,
      url: `/${existingFork.recipe.author.username}/${existingFork.recipe.slug}`,
    });
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Generate unique slug (append -2, -3 etc. if collision)
  let slug = source.slug;
  let counter = 2;
  while (await prisma.recipe.findUnique({ where: { authorId_slug: { authorId: userId, slug } } })) {
    slug = `${source.slug}-${counter++}`;
  }

  // Create forked recipe + copy all content in a transaction
  const forked = await prisma.$transaction(async (tx) => {
    const newRecipe = await tx.recipe.create({
      data: {
        slug,
        name: source.name,
        description: source.description,
        story: source.story,
        imageUrl: source.imageUrl,
        isPublic: source.isPublic,
        forkedFromId: source.id,
        authorId: userId,
        servings: source.servings,
        calories: source.calories,
        proteinG: source.proteinG,
        carbsG: source.carbsG,
        fatG: source.fatG,
        fiberG: source.fiberG,
        tags: { create: source.tags.map((rt) => ({ tagId: rt.tagId })) },
      },
    });

    // Copy components + steps + ingredients (top-level only; children handled below)
    const componentIdMap = new Map<string, string>(); // old id → new id

    for (const comp of source.components) {
      const newComp = await tx.component.create({
        data: {
          recipeId: newRecipe.id,
          name: comp.name,
          displayName: comp.displayName,
          type: comp.type,
          order: comp.order,
        },
      });
      componentIdMap.set(comp.id, newComp.id);

      for (const step of comp.steps) {
        await tx.step.create({
          data: { componentId: newComp.id, order: step.order, content: step.content },
        });
      }
      for (const ci of comp.ingredients) {
        await tx.componentIngredient.create({
          data: {
            componentId: newComp.id,
            ingredientId: ci.ingredientId,
            amount: ci.amount,
            unit: ci.unit,
            preparation: ci.preparation,
            order: ci.order,
            isOptional: ci.isOptional,
          },
        });
      }

      // Copy children
      for (const child of comp.children) {
        const newChild = await tx.component.create({
          data: {
            recipeId: newRecipe.id,
            name: child.name,
            displayName: child.displayName,
            type: child.type,
            order: child.order,
            parentId: newComp.id,
          },
        });
        for (const step of child.steps) {
          await tx.step.create({
            data: { componentId: newChild.id, order: step.order, content: step.content },
          });
        }
        for (const ci of child.ingredients) {
          await tx.componentIngredient.create({
            data: {
              componentId: newChild.id,
              ingredientId: ci.ingredientId,
              amount: ci.amount,
              unit: ci.unit,
              preparation: ci.preparation,
              order: ci.order,
              isOptional: ci.isOptional,
            },
          });
        }
      }
    }

    // Create initial version
    await tx.recipeVersion.create({
      data: {
        recipeId: newRecipe.id,
        authorId: userId,
        message: `Forked from ${source.name}`,
        additions: source.components.reduce((sum, c) => sum + c.steps.length + c.ingredients.length, 0),
        deletions: 0,
      },
    });

    // Record fork + increment source forkCount
    await tx.fork.create({
      data: { userId, recipeId: newRecipe.id, sourceId: source.id },
    });
    await tx.recipe.update({
      where: { id: source.id },
      data: { forkCount: { increment: 1 } },
    });

    return newRecipe;
  });

  return NextResponse.json({ url: `/${user.username}/${forked.slug}` }, { status: 201 });
}
