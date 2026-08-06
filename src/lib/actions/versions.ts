"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { applySnapshotTx } from "@/lib/apply-snapshot";
import { buildSnapshot, type RecipeSnapshot } from "@/lib/snapshot";
import { diffSnapshots } from "@/lib/diff";
import { fetchSnapshotSource } from "@/lib/snapshot-db";
import type { Prisma } from "@prisma/client";

/**
 * Restore a previous version's content as a new tweak (like `git revert` to a
 * known-good state). Owner only. Restores ingredients, steps, description,
 * servings, and tags - not the recipe name.
 */
export async function restoreVersion(
  versionId: string,
): Promise<{ success?: true; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const version = await prisma.recipeVersion.findUnique({
    where: { id: versionId },
    include: {
      recipe: {
        select: { id: true, authorId: true, slug: true, author: { select: { username: true } } },
      },
    },
  });
  if (!version) return { error: "Version not found" };
  if (version.recipe.authorId !== session.user.id) return { error: "Not authorised" };
  if (!version.snapshot) return { error: "This version has no snapshot to restore" };

  const restored = version.snapshot as unknown as RecipeSnapshot;

  // Diff against current content for accurate +/- stats on the restore tweak
  const currentSource = await fetchSnapshotSource(prisma, version.recipe.id);
  const current = buildSnapshot(currentSource!);
  const diff = diffSnapshots(current, restored);

  await prisma.$transaction(async (tx) => {
    await applySnapshotTx(tx, version.recipe.id, restored);
    await tx.recipeVersion.create({
      data: {
        recipeId: version.recipe.id,
        authorId: session.user.id,
        message: `Restore: "${version.message}"`,
        additions: diff.additions,
        deletions: diff.deletions,
        snapshot: restored as unknown as Prisma.InputJsonValue,
      },
    });
    await tx.recipe.update({
      where: { id: version.recipe.id },
      data: { tweakCount: { increment: 1 } },
    });
  });

  revalidatePath(`/${version.recipe.author.username}/${version.recipe.slug}`);
  return { success: true };
}
