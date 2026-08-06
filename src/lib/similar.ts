// "You might also like": ingredient-overlap similarity in a single SQL query.
// score = shared ingredients * 2 + shared tags. Excludes the recipe itself,
// its direct forks, and private recipes.

import { prisma } from "@/lib/prisma";
import { cached } from "@/lib/cache";
import { hydrateRecipeCards } from "@/lib/search";
import type { RecipeCardData } from "@/lib/types";

export async function getSimilarRecipes(
  recipeId: string,
  limit = 4,
): Promise<RecipeCardData[]> {
  return cached(`similar:${recipeId}:${limit}`, 3600, async () => {
    const rows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT r."id"
      FROM "Recipe" r
      LEFT JOIN (
        SELECT c2."recipeId" AS rid, COUNT(DISTINCT ci2."ingredientId")::int AS shared
        FROM "ComponentIngredient" ci2
        JOIN "Component" c2 ON c2."id" = ci2."componentId"
        WHERE ci2."ingredientId" IN (
          SELECT ci."ingredientId"
          FROM "ComponentIngredient" ci
          JOIN "Component" c ON c."id" = ci."componentId"
          WHERE c."recipeId" = ${recipeId}
        )
        GROUP BY c2."recipeId"
      ) ing ON ing.rid = r."id"
      LEFT JOIN (
        SELECT rt2."recipeId" AS rid, COUNT(*)::int AS shared
        FROM "RecipeTag" rt2
        WHERE rt2."tagId" IN (
          SELECT rt."tagId" FROM "RecipeTag" rt WHERE rt."recipeId" = ${recipeId}
        )
        GROUP BY rt2."recipeId"
      ) tg ON tg.rid = r."id"
      WHERE r."isPublic" = true
        AND r."id" <> ${recipeId}
        AND (r."forkedFromId" IS NULL OR r."forkedFromId" <> ${recipeId})
        AND (COALESCE(ing.shared, 0) + COALESCE(tg.shared, 0)) > 0
      ORDER BY (COALESCE(ing.shared, 0) * 2 + COALESCE(tg.shared, 0)) DESC,
               r."starCount" DESC
      LIMIT ${limit}
    `;
    return hydrateRecipeCards(rows.map((r) => r.id));
  });
}
