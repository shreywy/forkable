"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ShoppingCart, X, Loader2, Copy, Check, Printer, Trash2, ChefHat,
} from "lucide-react";
import { useLocalStorage } from "@/lib/use-local-storage";
import {
  mergeIngredients,
  SHOPPING_LIST_KEY,
  SHOPPING_CHECKED_KEY,
  type ShoppingListEntry,
  type MergedItem,
} from "@/lib/shopping-list";
import { formatAmount } from "@/lib/units";

type FetchedRecipe = {
  ingredients: { name: string; amount: number | null; unit: string | null }[];
};

export function ShoppingListClient() {
  const [listRaw, setListRaw] = useLocalStorage(SHOPPING_LIST_KEY);
  const [checkedRaw, setCheckedRaw] = useLocalStorage(SHOPPING_CHECKED_KEY);
  const [fetched, setFetched] = useState<Map<string, FetchedRecipe>>(new Map());
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const entries = useMemo<ShoppingListEntry[]>(() => {
    try {
      return listRaw ? (JSON.parse(listRaw) as ShoppingListEntry[]) : [];
    } catch {
      return [];
    }
  }, [listRaw]);

  const checked = useMemo<Record<string, boolean>>(() => {
    try {
      return checkedRaw ? (JSON.parse(checkedRaw) as Record<string, boolean>) : {};
    } catch {
      return {};
    }
  }, [checkedRaw]);

  // Fetch ingredient data for entries we haven't loaded yet
  useEffect(() => {
    const missing = entries.filter((e) => !fetched.has(e.recipeId));
    if (missing.length === 0) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const results = await Promise.all(
        missing.map(async (e): Promise<[string, FetchedRecipe]> => {
          try {
            const res = await fetch(`/api/recipes/${e.authorUsername}/${e.recipeSlug}`);
            if (!res.ok) return [e.recipeId, { ingredients: [] }];
            const data = (await res.json()) as FetchedRecipe;
            return [e.recipeId, { ingredients: data.ingredients ?? [] }];
          } catch {
            return [e.recipeId, { ingredients: [] }];
          }
        }),
      );
      if (!cancelled) {
        setFetched((prev) => {
          const next = new Map(prev);
          for (const [id, data] of results) next.set(id, data);
          return next;
        });
        setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  const merged: MergedItem[] = useMemo(() => {
    const lists = entries
      .filter((e) => fetched.has(e.recipeId))
      .map((e) => ({
        recipeName: e.recipeName,
        factor: e.servingsFactor,
        ingredients: fetched.get(e.recipeId)!.ingredients,
      }));
    return mergeIngredients(lists);
  }, [entries, fetched]);

  const setChecked = (name: string, value: boolean) => {
    setCheckedRaw(JSON.stringify({ ...checked, [name]: value }));
  };

  const removeRecipe = (recipeId: string) => {
    setListRaw(JSON.stringify(entries.filter((e) => e.recipeId !== recipeId)));
  };

  const clearChecked = () => setCheckedRaw(JSON.stringify({}));

  const itemLabel = (item: MergedItem): string => {
    if (item.merged) return `${formatAmount(item.merged)} ${item.name}`;
    if (item.amounts.length > 0) {
      return `${item.name} (${item.amounts.map(formatAmount).join(" + ")})`;
    }
    return item.name;
  };

  const copyAsText = async () => {
    const text = merged.map((m) => `- ${itemLabel(m)}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <style>{`@media print { nav, header, footer, .no-print { display: none !important; } }`}</style>
      <div className="max-w-[720px] mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-1">
          <ShoppingCart className="w-5 h-5 text-yellow-brand" />
          <h1 className="text-xl font-bold text-foreground">Shopping list</h1>
          {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Ingredients from your selected recipes, combined and de-duplicated. Stored on this
          device only.
        </p>

        {entries.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center">
            <ChefHat className="w-8 h-8 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground mb-3">
              Your list is empty. Open a recipe and press &ldquo;Add to shopping list&rdquo;.
            </p>
            <Link href="/explore" className="text-sm text-yellow-brand hover:underline">
              Browse recipes
            </Link>
          </div>
        ) : (
          <>
            {/* Source recipes */}
            <div className="flex flex-wrap gap-2 mb-6 no-print">
              {entries.map((e) => (
                <span
                  key={e.recipeId}
                  className="inline-flex items-center gap-1.5 h-7 pl-2.5 pr-1.5 rounded-full border border-border bg-card text-xs font-medium text-foreground"
                >
                  <Link
                    href={`/${e.authorUsername}/${e.recipeSlug}`}
                    className="hover:text-yellow-brand transition-colors"
                  >
                    {e.recipeName}
                  </Link>
                  {e.servingsFactor !== 1 && (
                    <span className="text-muted-foreground">x{Math.round(e.servingsFactor * 100) / 100}</span>
                  )}
                  <button
                    onClick={() => removeRecipe(e.recipeId)}
                    aria-label={`Remove ${e.recipeName}`}
                    className="p-0.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mb-4 no-print">
              <button
                onClick={copyAsText}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy as text"}
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium transition-colors"
              >
                <Printer className="w-3 h-3" />
                Print
              </button>
              <button
                onClick={clearChecked}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium transition-colors ml-auto"
              >
                <Trash2 className="w-3 h-3" />
                Uncheck all
              </button>
            </div>

            {/* Merged list */}
            <div className="rounded-xl border border-border bg-card divide-y divide-border/60 overflow-hidden">
              {merged.map((item) => {
                const isChecked = !!checked[item.name];
                return (
                  <label
                    key={item.name}
                    className="flex items-start gap-3 px-4 py-2.5 cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => setChecked(item.name, e.target.checked)}
                      className="mt-1 accent-[#F5C518]"
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${
                          isChecked
                            ? "line-through text-muted-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {item.merged && (
                          <span className="font-mono text-yellow-brand mr-2">
                            {formatAmount(item.merged)}
                          </span>
                        )}
                        <span className="capitalize">{item.name}</span>
                        {!item.merged && item.amounts.length > 0 && (
                          <span className="text-muted-foreground ml-2 text-xs">
                            ({item.amounts.map(formatAmount).join(" + ")})
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {item.recipes.join(", ")}
                      </p>
                    </div>
                  </label>
                );
              })}
              {merged.length === 0 && !loading && (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                  Loading ingredients...
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
