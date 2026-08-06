// Shared tag / ingredient upsert helpers, usable inside transactions.

import type { Prisma } from "@prisma/client";
import { toSlug } from "@/lib/slug";

type Db = Prisma.TransactionClient;

export async function ensureTagTx(tx: Db, name: string) {
  const slug = toSlug(name);
  return tx.tag.upsert({
    where: { name: slug },
    update: { useCount: { increment: 1 } },
    create: { name: slug, label: name, isGlobal: false },
  });
}

export async function ensureIngredientTx(tx: Db, name: string) {
  const slug = toSlug(name) || "ingredient";
  return tx.ingredient.upsert({
    where: { slug },
    update: {},
    create: { slug, name: name.toLowerCase(), aliases: [name] },
  });
}
