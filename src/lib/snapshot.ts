// Recipe snapshots: a stable, JSON-serializable capture of everything that
// defines a recipe's content at one point in time. Stored on RecipeVersion
// rows and consumed by the diff engine, restore, and blame features.

export type SnapshotIngredient = {
  name: string;
  amount: number | null;
  unit: string | null;
  preparation: string | null;
  isOptional: boolean;
};

export type SnapshotStep = {
  content: string;
  subSteps: string[];
};

export type SnapshotComponent = {
  name: string;
  displayName: string | null;
  type: "FOLDER" | "FILE";
  ingredients: SnapshotIngredient[];
  steps: SnapshotStep[];
};

export type RecipeSnapshot = {
  name: string;
  description: string;
  servings: number;
  /** tag slugs, sorted */
  tags: string[];
  /** in display order */
  components: SnapshotComponent[];
};

/**
 * Structural input for buildSnapshot. Matches the shape of a Prisma Recipe
 * fetched with components { ingredients { ingredient }, steps } and
 * tags { tag }, but is defined structurally so tests can use plain fixtures.
 */
export type SnapshotSource = {
  name: string;
  description: string;
  servings: number;
  tags: { tag: { name: string } }[];
  components: {
    name: string;
    displayName: string | null;
    type: "FOLDER" | "FILE";
    order: number;
    ingredients: {
      order: number;
      amount: number | null;
      unit: string | null;
      preparation: string | null;
      isOptional: boolean;
      ingredient: { name: string };
    }[];
    steps: {
      id: string;
      order: number;
      content: string;
      parentStepId: string | null;
    }[];
  }[];
};

export function buildSnapshot(recipe: SnapshotSource): RecipeSnapshot {
  const components = [...recipe.components]
    .sort((a, b) => a.order - b.order)
    .map((c) => {
      const ingredients = [...c.ingredients]
        .sort((a, b) => a.order - b.order)
        .map((ci) => ({
          name: ci.ingredient.name,
          amount: ci.amount,
          unit: ci.unit,
          preparation: ci.preparation,
          isOptional: ci.isOptional,
        }));

      const sortedSteps = [...c.steps].sort((a, b) => a.order - b.order);
      const steps = sortedSteps
        .filter((s) => s.parentStepId === null)
        .map((s) => ({
          content: s.content,
          subSteps: sortedSteps
            .filter((sub) => sub.parentStepId === s.id)
            .map((sub) => sub.content),
        }));

      return {
        name: c.name,
        displayName: c.displayName,
        type: c.type,
        ingredients,
        steps,
      };
    });

  return {
    name: recipe.name,
    description: recipe.description,
    servings: recipe.servings,
    tags: recipe.tags.map((rt) => rt.tag.name).sort(),
    components,
  };
}

/** Total content units (ingredients + steps) - used for initial-commit stats. */
export function countUnits(s: RecipeSnapshot): number {
  return s.components.reduce(
    (sum, c) => sum + c.ingredients.length + c.steps.length,
    0,
  );
}
