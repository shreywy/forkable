// OpenFoodFacts API client
// Docs: https://world.openfoodfacts.org/data

export interface OFFProduct {
  offId:    string;
  name:     string;
  calories: number | null;
  protein:  number | null;
  carbs:    number | null;
  fat:      number | null;
  fiber:    number | null;
}

export async function searchOFF(query: string): Promise<OFFProduct[]> {
  const url = new URL("https://world.openfoodfacts.org/cgi/search.pl");
  url.searchParams.set("search_terms",  query);
  url.searchParams.set("search_simple", "1");
  url.searchParams.set("action",        "process");
  url.searchParams.set("json",          "1");
  url.searchParams.set("page_size",     "5");
  url.searchParams.set("fields",        "id,product_name,nutriments");

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 86400 }, // cache 24h via Next.js data cache
    });
    if (!res.ok) return [];

    const data = await res.json();
    return ((data.products as unknown[]) ?? [])
      .filter((p): p is Record<string, unknown> => typeof p === "object" && p !== null)
      .map((p) => {
        const n = p.nutriments as Record<string, number> | undefined;
        return {
          offId:    String(p.id ?? ""),
          name:     String(p.product_name ?? query),
          calories: n?.["energy-kcal_100g"] ?? null,
          protein:  n?.["proteins_100g"]     ?? null,
          carbs:    n?.["carbohydrates_100g"]?? null,
          fat:      n?.["fat_100g"]           ?? null,
          fiber:    n?.["fiber_100g"]         ?? null,
        };
      })
      .filter((p) => p.name && p.name.trim().length > 0);
  } catch {
    return [];
  }
}

/** Slugify an ingredient name for the catalog */
export function slugifyIngredient(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
