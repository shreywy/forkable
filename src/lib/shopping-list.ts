// Shopping list merge engine: combine ingredients from multiple recipes
// (each scaled by a servings factor) into one de-duplicated list.

import { CONVERTIBLE_UNITS, convertUnit, type Amount } from "./units";

export type ShoppingListEntry = {
  recipeId: string;
  recipeName: string;
  recipeSlug: string;
  authorUsername: string;
  servingsFactor: number;
  addedAt: string;
};

export const SHOPPING_LIST_KEY = "forkable:shopping-list:v1";
export const SHOPPING_CHECKED_KEY = "forkable:shopping-checked:v1";

export type MergedItem = {
  /** normalized (lowercase) ingredient name */
  name: string;
  /** individual scaled amounts when they could not be combined */
  amounts: Amount[];
  /** single combined amount when all contributions were compatible */
  merged: Amount | null;
  /** recipe names contributing this ingredient */
  recipes: string[];
};

type InputList = {
  recipeName: string;
  factor: number;
  ingredients: { name: string; amount: number | null; unit: string | null }[];
};

function unitBase(unit: string | null): { base: "g" | "ml"; toBase: number } | null {
  if (!unit) return null;
  const info = CONVERTIBLE_UNITS[unit.toLowerCase().trim()];
  return info ? { base: info.base, toBase: info.toBase } : null;
}

export function mergeIngredients(lists: InputList[]): MergedItem[] {
  type Contribution = { amount: number | null; unit: string | null; recipeName: string };
  const groups = new Map<string, Contribution[]>();

  for (const list of lists) {
    for (const ing of list.ingredients) {
      const key = ing.name.trim().toLowerCase();
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push({
        amount: ing.amount === null ? null : ing.amount * list.factor,
        unit: ing.unit,
        recipeName: list.recipeName,
      });
    }
  }

  const items: MergedItem[] = [];

  for (const [name, contributions] of groups) {
    const recipes = [...new Set(contributions.map((c) => c.recipeName))];
    const withAmount = contributions.filter((c) => c.amount !== null);

    if (withAmount.length === 0) {
      items.push({ name, amounts: [], merged: null, recipes });
      continue;
    }

    // Case 1: every amount converts to the same base (g or ml) - sum in base
    const bases = withAmount.map((c) => unitBase(c.unit));
    if (bases.every((b) => b !== null) && new Set(bases.map((b) => b!.base)).size === 1) {
      const base = bases[0]!.base;
      const total = withAmount.reduce((sum, c, i) => sum + c.amount! * bases[i]!.toBase, 0);
      const readable = convertUnit({ value: total, unit: base }, "metric");
      items.push({ name, amounts: [], merged: readable, recipes });
      continue;
    }

    // Case 2: identical unit strings (including unknown units) - sum values
    const units = new Set(withAmount.map((c) => (c.unit ?? "").toLowerCase().trim()));
    if (units.size === 1 && withAmount.length === contributions.length) {
      const total = withAmount.reduce((sum, c) => sum + c.amount!, 0);
      items.push({
        name,
        amounts: [],
        merged: { value: Math.round(total * 100) / 100, unit: withAmount[0].unit },
        recipes,
      });
      continue;
    }

    // Case 3: incompatible - list amounts separately
    items.push({
      name,
      amounts: withAmount.map((c) => ({ value: c.amount!, unit: c.unit })),
      merged: null,
      recipes,
    });
  }

  return items.sort((a, b) => a.name.localeCompare(b.name));
}
