// Shared shape + link/text resolution for notifications, used by both the
// Navbar dropdown and the /notifications page so their rendering stays in
// sync with a single source of truth.

import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";

export type ResolvedNotification = {
  id: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  actor: { username: string; displayName: string; avatarUrl: string | null } | null;
  /** Where clicking the notification should navigate */
  href: string;
  /** Human-readable sentence, e.g. "nonna_rosa starred your Cacio e Pepe" */
  text: string;
};

const TYPE_VERB: Record<NotificationType, string> = {
  NEW_STAR: "starred",
  NEW_FORK: "forked",
  NEW_FOLLOWER: "started following you",
  NEW_TASTE_TEST: "left a taste test on",
  SUGGESTION_MERGED: "had their suggestion merged into",
  SUGGESTION_CLOSED: "had their suggestion closed on",
  MENTION: "mentioned you in",
};

/**
 * Fetch and resolve the most recent notifications for a user, along with the
 * href to navigate to and human-readable text. Handles the two different
 * entityId conventions in use (`entityType: "Recipe"` with a recipe id, and
 * `entityType: "TasteTest"` which historically stores either a taste-test id
 * or - for NEW_TASTE_TEST - the recipe id directly) by trying a TasteTest
 * lookup first and falling back to treating the id as a Recipe id.
 */
export async function fetchNotifications(
  userId: string,
  limit = 20,
): Promise<ResolvedNotification[]> {
  const rows = await prisma.notification.findMany({
    where: { recipientId: userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      actor: { select: { username: true, displayName: true, avatarUrl: true } },
    },
  });

  // Batch-resolve entity links: split by declared entityType, look each kind
  // up in one query rather than N+1.
  const recipeIds = new Set<string>();
  const tasteTestIds = new Set<string>();
  for (const n of rows) {
    if (!n.entityId) continue;
    if (n.entityType === "Recipe") recipeIds.add(n.entityId);
    else if (n.entityType === "TasteTest") tasteTestIds.add(n.entityId);
  }

  const [recipesById, tasteTestsById] = await Promise.all([
    recipeIds.size
      ? prisma.recipe.findMany({
          where: { id: { in: [...recipeIds] } },
          select: { id: true, slug: true, name: true, author: { select: { username: true } } },
        })
      : Promise.resolve([]),
    tasteTestIds.size
      ? prisma.tasteTest.findMany({
          where: { id: { in: [...tasteTestIds] } },
          select: {
            id: true,
            recipe: { select: { slug: true, name: true, author: { select: { username: true } } } },
          },
        })
      : Promise.resolve([]),
  ]);
  const recipeMap = new Map(recipesById.map((r) => [r.id, r]));
  const tasteTestMap = new Map(tasteTestsById.map((t) => [t.id, t]));

  // NEW_TASTE_TEST stores the recipe id under entityType "TasteTest" - any id
  // in that bucket that isn't a real TasteTest is treated as a Recipe id.
  const fallbackRecipeIds = [...tasteTestIds].filter((id) => !tasteTestMap.has(id));
  const fallbackRecipes = fallbackRecipeIds.length
    ? await prisma.recipe.findMany({
        where: { id: { in: fallbackRecipeIds } },
        select: { id: true, slug: true, name: true, author: { select: { username: true } } },
      })
    : [];
  const fallbackRecipeMap = new Map(fallbackRecipes.map((r) => [r.id, r]));

  const resolved: ResolvedNotification[] = [];
  for (const n of rows) {
    const actorName = n.actor?.displayName ?? n.actor?.username ?? "Someone";
    let href = "/notifications";
    let target = "";

    if (n.type === "NEW_FOLLOWER") {
      href = n.actor ? `/${n.actor.username}` : "/notifications";
    } else if (n.entityType === "Recipe" && n.entityId) {
      const r = recipeMap.get(n.entityId);
      if (r) { href = `/${r.author.username}/${r.slug}`; target = r.name; }
    } else if (n.entityType === "TasteTest" && n.entityId) {
      const t = tasteTestMap.get(n.entityId);
      if (t) {
        href = `/${t.recipe.author.username}/${t.recipe.slug}`;
        target = t.recipe.name;
      } else {
        const r = fallbackRecipeMap.get(n.entityId);
        if (r) { href = `/${r.author.username}/${r.slug}`; target = r.name; }
      }
    }

    const verb = TYPE_VERB[n.type];
    const text =
      n.type === "NEW_FOLLOWER"
        ? `${actorName} ${verb}`
        : target
          ? `${actorName} ${verb} your ${target}`
          : `${actorName} ${verb} your recipe`;

    resolved.push({
      id: n.id,
      type: n.type,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
      actor: n.actor,
      href,
      text,
    });
  }

  return resolved;
}
