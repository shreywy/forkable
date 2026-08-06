// Replace a recipe's live content (components, ingredients, steps, tags,
// description, servings) with the contents of a snapshot. Used by version
// restore and taste-test merges. Must run inside a transaction.
//
// The recipe *name* is intentionally not restored: renames would change the
// slug/URL. UI copy should say "restores ingredients, steps, description and
// servings".

import type { Prisma } from "@prisma/client";
import type { RecipeSnapshot } from "@/lib/snapshot";
import { toSlug } from "@/lib/slug";
import { ensureTagTx, ensureIngredientTx } from "@/lib/catalog";

export async function applySnapshotTx(
  tx: Prisma.TransactionClient,
  recipeId: string,
  snap: RecipeSnapshot,
): Promise<void> {
  // 1. Scalar fields
  await tx.recipe.update({
    where: { id: recipeId },
    data: { description: snap.description, servings: snap.servings },
  });

  // 2. Tags: replace with the snapshot's set
  await tx.recipeTag.deleteMany({ where: { recipeId } });
  for (const tagSlug of snap.tags) {
    const tag = await ensureTagTx(tx, tagSlug);
    await tx.recipeTag.create({ data: { recipeId, tagId: tag.id } });
  }

  // 3. Components: drop and rebuild (cascades steps + componentIngredients)
  await tx.component.deleteMany({ where: { recipeId } });
  for (let ci = 0; ci < snap.components.length; ci++) {
    const comp = snap.components[ci];
    const component = await tx.component.create({
      data: {
        recipeId,
        name: toSlug(comp.name) || comp.name,
        displayName: comp.displayName ?? comp.name,
        type: comp.type,
        order: ci,
      },
    });

    for (let ii = 0; ii < comp.ingredients.length; ii++) {
      const ing = comp.ingredients[ii];
      const ingredient = await ensureIngredientTx(tx, ing.name);
      await tx.componentIngredient.create({
        data: {
          componentId: component.id,
          ingredientId: ingredient.id,
          amount: ing.amount,
          unit: ing.unit,
          preparation: ing.preparation,
          isOptional: ing.isOptional,
          order: ii,
        },
      });
    }

    let stepOrder = 0;
    for (const step of comp.steps) {
      const parent = await tx.step.create({
        data: { componentId: component.id, order: stepOrder++, content: step.content },
      });
      for (const sub of step.subSteps) {
        await tx.step.create({
          data: {
            componentId: component.id,
            order: stepOrder++,
            content: sub,
            parentStepId: parent.id,
          },
        });
      }
    }
  }
}
