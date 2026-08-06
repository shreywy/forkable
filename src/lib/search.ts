// PostgreSQL full-text search over recipes, using the generated weighted
// tsvector column (name A, description B, story C) + GIN index.

import { prisma } from "@/lib/prisma";
import type { RecipeCardData } from "@/lib/types";

/** Sanitize raw user input for websearch_to_tsquery. Pure - unit tested. */
export function toWebsearchQuery(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").slice(0, 100);
}

/** Ranked ids of public recipes matching `q` (best first). */
export async function searchRecipeIds(q: string, limit = 50): Promise<string[]> {
  const query = toWebsearchQuery(q);
  if (!query) return [];
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT "id"
    FROM "Recipe"
    WHERE "isPublic" = true
      AND "searchVector" @@ websearch_to_tsquery('english', ${query})
    ORDER BY ts_rank("searchVector", websearch_to_tsquery('english', ${query})) DESC,
             "starCount" DESC
    LIMIT ${limit}
  `;
  return rows.map((r) => r.id);
}

/** Fetch full RecipeCardData for a list of ids, preserving the given order. */
export async function hydrateRecipeCards(ids: string[]): Promise<RecipeCardData[]> {
  if (ids.length === 0) return [];

  const recipes = await prisma.recipe.findMany({
    where: { id: { in: ids } },
    include: {
      author: { select: { username: true, displayName: true, avatarUrl: true } },
      tags: { include: { tag: true } },
      forkedFrom: { include: { author: { select: { username: true } } } },
    },
  });

  const rank = new Map(ids.map((id, i) => [id, i]));
  return recipes
    .sort((a, b) => rank.get(a.id)! - rank.get(b.id)!)
    .map((r) => ({
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
    }));
}

/** Full card data for recipes matching `q`, in rank order. */
export async function searchRecipes(q: string, limit = 24): Promise<RecipeCardData[]> {
  return hydrateRecipeCards(await searchRecipeIds(q, limit));
}

export type UserSearchResult = {
  username: string;
  displayName: string;
  avatarUrl: string | null;
};

export async function searchUsers(q: string, limit = 5): Promise<UserSearchResult[]> {
  const query = q.trim();
  if (!query) return [];
  return prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: query, mode: "insensitive" } },
        { displayName: { contains: query, mode: "insensitive" } },
      ],
    },
    select: { username: true, displayName: true, avatarUrl: true },
    orderBy: { followers: { _count: "desc" } },
    take: limit,
  });
}
