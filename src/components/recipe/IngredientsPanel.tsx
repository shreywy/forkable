"use client";

import { useMemo, useState } from "react";
import { Carrot, Minus, Plus, ShoppingCart, Check } from "lucide-react";
import { scaleAmount, convertUnit, formatAmount } from "@/lib/units";
import { useLocalStorage } from "@/lib/use-local-storage";
import { SHOPPING_LIST_KEY, type ShoppingListEntry } from "@/lib/shopping-list";

export type PanelIngredient = {
  component: string | null;
  name: string;
  amount: number | null;
  unit: string | null;
  preparation: string | null;
  isOptional: boolean;
};

type UnitSystem = "original" | "metric" | "imperial";

interface Props {
  ingredients: PanelIngredient[];
  baseServings: number;
  recipe: { id: string; name: string; slug: string; authorUsername: string };
}

export function IngredientsPanel({ ingredients, baseServings, recipe }: Props) {
  const [servings, setServings] = useState(baseServings);
  const [system, setSystem] = useState<UnitSystem>("original");
  const factor = servings / baseServings;

  // Shopping list membership
  const [listRaw, setListRaw] = useLocalStorage(SHOPPING_LIST_KEY);
  const entries = useMemo<ShoppingListEntry[]>(() => {
    try {
      return listRaw ? (JSON.parse(listRaw) as ShoppingListEntry[]) : [];
    } catch {
      return [];
    }
  }, [listRaw]);
  const inList = entries.some((e) => e.recipeId === recipe.id);

  const toggleShoppingList = () => {
    const next = inList
      ? entries.filter((e) => e.recipeId !== recipe.id)
      : [
          ...entries,
          {
            recipeId: recipe.id,
            recipeName: recipe.name,
            recipeSlug: recipe.slug,
            authorUsername: recipe.authorUsername,
            servingsFactor: factor,
            addedAt: new Date().toISOString(),
          },
        ];
    setListRaw(JSON.stringify(next));
  };

  const display = (ing: PanelIngredient): string => {
    if (ing.amount === null) {
      return ing.unit ?? "to taste";
    }
    let amount = scaleAmount({ value: ing.amount, unit: ing.unit }, factor);
    if (system !== "original") amount = convertUnit(amount, system);
    return formatAmount(amount);
  };

  // Group by component, preserving order; a single unnamed group renders flat
  const groups = useMemo(() => {
    const map = new Map<string | null, PanelIngredient[]>();
    for (const ing of ingredients) {
      const key = ing.component;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ing);
    }
    return [...map.entries()];
  }, [ingredients]);

  if (ingredients.length === 0) return null;

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 bg-muted/40 border-b border-border">
        <span className="flex items-center gap-2 text-xs font-mono font-medium text-foreground">
          <Carrot className="w-3.5 h-3.5 text-muted-foreground" />
          ingredients.json
        </span>

        <div className="ml-auto flex items-center gap-3">
          {/* Servings stepper */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setServings((s) => Math.max(1, s - 1))}
              aria-label="Decrease servings"
              className="w-6 h-6 rounded-md border border-border bg-background hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-xs font-medium text-foreground min-w-[70px] text-center">
              {servings} serving{servings === 1 ? "" : "s"}
            </span>
            <button
              onClick={() => setServings((s) => Math.min(100, s + 1))}
              aria-label="Increase servings"
              className="w-6 h-6 rounded-md border border-border bg-background hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Unit system toggle */}
          <div className="flex items-center rounded-md border border-border overflow-hidden text-[11px] font-medium">
            {(["original", "metric", "imperial"] as UnitSystem[]).map((s) => (
              <button
                key={s}
                onClick={() => setSystem(s)}
                aria-pressed={system === s}
                className={`px-2 py-1 capitalize transition-colors ${
                  system === s
                    ? "bg-yellow-brand text-[oklch(0.12_0_0)]"
                    : "bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {s === "original" ? "As written" : s}
              </button>
            ))}
          </div>

          {/* Shopping list toggle */}
          <button
            onClick={toggleShoppingList}
            className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md border text-[11px] font-medium transition-colors ${
              inList
                ? "border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-400"
                : "border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {inList ? <Check className="w-3 h-3" /> : <ShoppingCart className="w-3 h-3" />}
            {inList ? "On shopping list" : "Add to shopping list"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-4 space-y-4">
        {groups.map(([component, items]) => (
          <div key={component ?? "_"}>
            {component && groups.length > 1 && (
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                {component}
              </p>
            )}
            <ul className="space-y-1.5">
              {items.map((ing, i) => (
                <li key={i} className="flex items-baseline gap-2.5 text-sm">
                  <span className="font-mono text-yellow-brand min-w-[84px] text-right shrink-0">
                    {display(ing)}
                  </span>
                  <span className="text-foreground">
                    {ing.name}
                    {ing.preparation && (
                      <span className="text-muted-foreground">, {ing.preparation}</span>
                    )}
                    {ing.isOptional && (
                      <span className="text-muted-foreground text-xs ml-1.5">(optional)</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
