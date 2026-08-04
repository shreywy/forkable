import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  // Get user's pantry ingredient IDs
  const pantryItems = await prisma.pantryItem.findMany({
    where: { userId },
    select: { ingredientId: true },
  });

  if (pantryItems.length === 0) {
    return NextResponse.json([]);
  }

  const pantryIngredientIds = new Set(pantryItems.map((p) => p.ingredientId));

  // Get all public recipes with their ingredient IDs
  const recipes = await prisma.recipe.findMany({
    where: { isPublic: true },
    include: {
      author: { select: { username: true, displayName: true, avatarUrl: true } },
      tags: { include: { tag: true }, take: 3 },
      forkedFrom: { include: { author: { select: { username: true } } } },
      components: {
        include: {
          ingredients: { select: { ingredientId: true } },
          children: { include: { ingredients: { select: { ingredientId: true } } } },
        },
      },
    },
    orderBy: { starCount: "desc" },
    take: 50,
  });

  // Compute match scores
  const matches = recipes
    .map((r) => {
      const ingredientIds = [
        ...new Set([
          ...r.components.flatMap((c) => c.ingredients.map((ci) => ci.ingredientId)),
          ...r.components.flatMap((c) =>
            c.children.flatMap((ch) => ch.ingredients.map((ci) => ci.ingredientId))
          ),
        ]),
      ];
      const total = ingredientIds.length;
      if (total === 0) return null;
      const matched = ingredientIds.filter((id) => pantryIngredientIds.has(id)).length;
      const pct = Math.round((matched / total) * 100);
      if (pct === 0) return null;
      return {
        pct,
        matched,
        total,
        recipe: {
          id: r.id,
          slug: r.slug,
          name: r.name,
          description: r.description,
          imageUrl: r.imageUrl,
          author: r.author,
          forkedFrom: r.forkedFrom
            ? { ownerUsername: r.forkedFrom.author.username, recipeSlug: r.forkedFrom.slug }
            : null,
          starCount: r.starCount,
          forkCount: r.forkCount,
          tasteTestCount: r.tasteTestCount,
          tweakCount: r.tweakCount,
          tags: r.tags.map((rt) => ({ name: rt.tag.name, label: rt.tag.label })),
          updatedAt: r.updatedAt.toISOString(),
        },
      };
    })
    .filter(Boolean)
    .sort((a, b) => b!.pct - a!.pct)
    .slice(0, 10);

  return NextResponse.json(matches);
}
