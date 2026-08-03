"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ── Star / Unstar ─────────────────────────────────────────────────────────────

export async function toggleStar(recipeId: string): Promise<{ starred: boolean; count: number } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sign in to star recipes" };

  const existing = await prisma.star.findUnique({
    where: { userId_recipeId: { userId: session.user.id, recipeId } },
  });

  if (existing) {
    // Unstar
    await prisma.$transaction([
      prisma.star.delete({ where: { userId_recipeId: { userId: session.user.id, recipeId } } }),
      prisma.recipe.update({ where: { id: recipeId }, data: { starCount: { decrement: 1 } } }),
    ]);
    const recipe = await prisma.recipe.findUnique({ where: { id: recipeId }, select: { starCount: true } });
    return { starred: false, count: recipe?.starCount ?? 0 };
  } else {
    // Star + create notification for recipe author
    const [, recipe] = await prisma.$transaction([
      prisma.star.create({ data: { userId: session.user.id, recipeId } }),
      prisma.recipe.update({ where: { id: recipeId }, data: { starCount: { increment: 1 } } }),
    ]);

    // Notify author (fire-and-forget, don't await)
    createNotification(recipeId, session.user.id, "NEW_STAR").catch(() => {});

    return { starred: true, count: recipe.starCount };
  }
}

// ── Fork ──────────────────────────────────────────────────────────────────────

export async function forkRecipe(sourceRecipeId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sign in to fork recipes" };

  const source = await prisma.recipe.findUnique({
    where: { id: sourceRecipeId },
    include: {
      author: { select: { username: true } },
      components: {
        include: {
          steps:       { orderBy: { order: "asc" } },
          ingredients: { orderBy: { order: "asc" } },
        },
        orderBy: { order: "asc" },
      },
      tags: { include: { tag: true } },
    },
  });

  if (!source) return { error: "Recipe not found" };
  if (!source.isPublic) return { error: "Cannot fork a private recipe" };

  // Generate unique slug
  let slug = source.slug;
  const existingSlugs = await prisma.recipe.findMany({
    where: { authorId: session.user.id, slug: { startsWith: slug } },
    select: { slug: true },
  });
  if (existingSlugs.length > 0) {
    slug = `${slug}-fork-${Date.now().toString(36)}`;
  }

  const forked = await prisma.$transaction(async (tx) => {
    // Create forked recipe
    const r = await tx.recipe.create({
      data: {
        slug,
        name:        source.name,
        description: source.description,
        imageUrl:    source.imageUrl,
        authorId:    session.user.id,
        forkedFromId: sourceRecipeId,
        tweakCount:  1,
        servings:    source.servings,
        calories:    source.calories,
        proteinG:    source.proteinG,
        carbsG:      source.carbsG,
        fatG:        source.fatG,
        fiberG:      source.fiberG,
      },
    });

    // Deep copy components
    for (const comp of source.components) {
      const newComp = await tx.component.create({
        data: {
          recipeId:    r.id,
          name:        comp.name,
          displayName: comp.displayName,
          type:        comp.type,
          order:       comp.order,
          lastTweak:   comp.lastTweak,
        },
      });

      for (const step of comp.steps) {
        await tx.step.create({
          data: {
            componentId: newComp.id,
            order:       step.order,
            content:     step.content,
          },
        });
      }

      for (const ing of comp.ingredients) {
        await tx.componentIngredient.create({
          data: {
            componentId:  newComp.id,
            ingredientId: ing.ingredientId,
            amount:       ing.amount,
            unit:         ing.unit,
            preparation:  ing.preparation,
            order:        ing.order,
          },
        });
      }
    }

    // Copy tags
    for (const rt of source.tags) {
      await tx.recipeTag.create({ data: { recipeId: r.id, tagId: rt.tagId } });
    }

    // Record fork + increment source counter + initial commit
    await Promise.all([
      tx.fork.create({
        data: { userId: session.user.id, recipeId: r.id, sourceId: sourceRecipeId },
      }),
      tx.recipe.update({ where: { id: sourceRecipeId }, data: { forkCount: { increment: 1 } } }),
      tx.recipeVersion.create({
        data: {
          recipeId: r.id,
          authorId: session.user.id,
          message:  `Forked from ${source.author?.username ?? "unknown"}/${source.slug}`,
        },
      }),
    ]);

    return r;
  });

  // Notify original author
  createNotification(sourceRecipeId, session.user.id, "NEW_FORK").catch(() => {});

  revalidatePath("/");
  revalidatePath(`/${session.user.username}`);

  return { success: true, username: session.user.username, slug: forked.slug };
}

// ── Follow / Unfollow ─────────────────────────────────────────────────────────

export async function toggleFollow(targetUserId: string): Promise<{ following: boolean } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sign in to follow users" };
  if (session.user.id === targetUserId) return { error: "Cannot follow yourself" };

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: session.user.id, followingId: targetUserId } },
  });

  if (existing) {
    await prisma.follow.delete({
      where: { followerId_followingId: { followerId: session.user.id, followingId: targetUserId } },
    });
    return { following: false };
  } else {
    await prisma.follow.create({
      data: { followerId: session.user.id, followingId: targetUserId },
    });
    // Notify new follower
    prisma.notification.create({
      data: {
        recipientId: targetUserId,
        actorId:     session.user.id,
        type:        "NEW_FOLLOWER",
        entityType:  "Follow",
      },
    }).catch(() => {});
    return { following: true };
  }
}

// ── Internal helper ───────────────────────────────────────────────────────────

async function createNotification(
  recipeId: string,
  actorId:  string,
  type:     "NEW_STAR" | "NEW_FORK",
) {
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: { authorId: true },
  });
  if (!recipe || recipe.authorId === actorId) return; // don't notify yourself

  await prisma.notification.create({
    data: {
      recipientId: recipe.authorId,
      actorId,
      type,
      entityId:   recipeId,
      entityType: "Recipe",
    },
  });
}
