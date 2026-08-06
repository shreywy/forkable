// DB fetch helper shaping a recipe into a SnapshotSource.
// Accepts either the Prisma client or a transaction client.

import type { PrismaClient, Prisma } from "@prisma/client";
import type { SnapshotSource } from "./snapshot";

type Db = PrismaClient | Prisma.TransactionClient;

export async function fetchSnapshotSource(
  db: Db,
  recipeId: string,
): Promise<SnapshotSource | null> {
  const recipe = await db.recipe.findUnique({
    where: { id: recipeId },
    include: {
      tags: { include: { tag: { select: { name: true } } } },
      components: {
        orderBy: { order: "asc" },
        include: {
          steps: { orderBy: { order: "asc" } },
          ingredients: {
            orderBy: { order: "asc" },
            include: { ingredient: { select: { name: true } } },
          },
        },
      },
    },
  });
  return recipe;
}
