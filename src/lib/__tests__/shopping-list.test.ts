import { describe, it, expect } from "vitest";
import { mergeIngredients } from "@/lib/shopping-list";

describe("mergeIngredients", () => {
  it("merges compatible units across recipes into one readable amount", () => {
    const merged = mergeIngredients([
      {
        recipeName: "Cookies",
        factor: 1,
        ingredients: [{ name: "Butter", amount: 200, unit: "g" }],
      },
      {
        recipeName: "Pie",
        factor: 1,
        ingredients: [{ name: "butter", amount: 0.5, unit: "lb" }],
      },
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0].name).toBe("butter");
    expect(merged[0].merged).not.toBeNull();
    expect(merged[0].merged!.value).toBeCloseTo(426.8, 0);
    expect(merged[0].merged!.unit).toBe("g");
    expect(merged[0].recipes).toEqual(["Cookies", "Pie"]);
  });

  it("merges identical unknown units numerically", () => {
    const merged = mergeIngredients([
      { recipeName: "A", factor: 1, ingredients: [{ name: "garlic", amount: 2, unit: "cloves" }] },
      { recipeName: "B", factor: 1, ingredients: [{ name: "Garlic", amount: 3, unit: "cloves" }] },
    ]);
    expect(merged[0].merged).toEqual({ value: 5, unit: "cloves" });
  });

  it("keeps incompatible amounts separate with a null merged value", () => {
    const merged = mergeIngredients([
      { recipeName: "A", factor: 1, ingredients: [{ name: "egg", amount: 2, unit: null }] },
      { recipeName: "B", factor: 1, ingredients: [{ name: "egg", amount: 100, unit: "g" }] },
    ]);
    expect(merged[0].merged).toBeNull();
    expect(merged[0].amounts).toHaveLength(2);
  });

  it("scales by the per-recipe factor before merging", () => {
    const merged = mergeIngredients([
      { recipeName: "A", factor: 2, ingredients: [{ name: "flour", amount: 250, unit: "g" }] },
    ]);
    expect(merged[0].merged!.value).toBeCloseTo(500, 5);
  });

  it("promotes large merged amounts to a bigger unit", () => {
    const merged = mergeIngredients([
      { recipeName: "A", factor: 1, ingredients: [{ name: "stock", amount: 700, unit: "ml" }] },
      { recipeName: "B", factor: 1, ingredients: [{ name: "stock", amount: 600, unit: "ml" }] },
    ]);
    expect(merged[0].merged!.unit).toBe("l");
    expect(merged[0].merged!.value).toBeCloseTo(1.3, 5);
  });

  it("handles ingredients with no amount at all", () => {
    const merged = mergeIngredients([
      { recipeName: "A", factor: 1, ingredients: [{ name: "salt", amount: null, unit: null }] },
    ]);
    expect(merged[0].merged).toBeNull();
    expect(merged[0].amounts).toHaveLength(0);
  });

  it("sorts results alphabetically by name", () => {
    const merged = mergeIngredients([
      {
        recipeName: "A",
        factor: 1,
        ingredients: [
          { name: "zucchini", amount: 1, unit: null },
          { name: "apple", amount: 2, unit: null },
        ],
      },
    ]);
    expect(merged.map((m) => m.name)).toEqual(["apple", "zucchini"]);
  });
});
