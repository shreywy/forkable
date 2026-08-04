import { prisma } from "@/lib/prisma";
import { ExploreClient } from "./ExploreClient";

export default async function ExplorePage() {
  const [recipes, cookbooks, featuredCooks, allIngredients] = await Promise.all([
    prisma.recipe.findMany({
      where: { isPublic: true },
      orderBy: { starCount: "desc" },
      include: {
        author: { select: { username: true, displayName: true, avatarUrl: true } },
        tags: { include: { tag: true } },
        forkedFrom: { include: { author: { select: { username: true } } } },
        components: {
          include: {
            ingredients: {
              include: { ingredient: { select: { name: true } } },
            },
          },
        },
      },
    }),

    prisma.cookbook.findMany({
      where: { isPublic: true },
      orderBy: { updatedAt: "desc" },
      take: 8,
      include: {
        owner: { select: { username: true, displayName: true, avatarUrl: true } },
        recipes: {
          take: 1,
          orderBy: { order: "asc" },
          include: { recipe: { select: { imageUrl: true } } },
        },
        _count: { select: { recipes: true } },
      },
    }),

    prisma.user.findMany({
      take: 4,
      orderBy: { followers: { _count: "desc" } },
      include: {
        _count: { select: { recipes: true, followers: true } },
        recipes: { select: { starCount: true } },
      },
    }),

    prisma.ingredient.findMany({
      distinct: ["name"],
      select: { name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <ExploreClient
      recipes={recipes.map((r) => ({
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
        tweakCount: r.tweakCount,
        tasteTestCount: r.tasteTestCount,
        tags: r.tags.map((rt) => ({ name: rt.tag.name, label: rt.tag.label })),
        updatedAt: r.updatedAt,
        ingredientNames: [
          ...new Set(
            r.components.flatMap((c) => c.ingredients.map((ci) => ci.ingredient.name))
          ),
        ],
      }))}
      cookbooks={cookbooks.map((cb) => ({
        id: cb.id,
        slug: cb.slug,
        name: cb.name,
        description: cb.description,
        owner: cb.owner,
        recipeCount: cb._count.recipes,
        coverImageUrl: cb.recipes[0]?.recipe.imageUrl ?? null,
      }))}
      featuredCooks={featuredCooks.map((u) => ({
        username: u.username,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
        bio: u.bio,
        recipeCount: u._count.recipes,
        followerCount: u._count.followers,
        totalStars: u.recipes.reduce((s, r) => s + r.starCount, 0),
      }))}
      allIngredients={allIngredients}
    />
  );
}
