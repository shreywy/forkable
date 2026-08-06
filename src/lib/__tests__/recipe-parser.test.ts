import { describe, it, expect } from "vitest";
import {
  parseDuration,
  extractJsonLdRecipe,
  parseTextRecipe,
} from "@/lib/recipe-parser";

describe("parseDuration", () => {
  it("formats hours and minutes", () => {
    expect(parseDuration("PT1H30M")).toBe("1 hr 30 min");
  });

  it("formats minutes only", () => {
    expect(parseDuration("PT45M")).toBe("45 min");
  });

  it("formats hours only", () => {
    expect(parseDuration("PT2H")).toBe("2 hr");
  });

  it("returns undefined for undefined input", () => {
    expect(parseDuration(undefined)).toBeUndefined();
  });

  it("returns undefined for garbage input", () => {
    expect(parseDuration("not-a-duration")).toBeUndefined();
  });
});

const JSONLD_RECIPE = {
  "@context": "https://schema.org",
  "@type": "Recipe",
  name: "Classic Margherita Pizza",
  description: "A simple <b>Neapolitan</b> pizza.",
  image: ["https://example.com/pizza.jpg"],
  recipeYield: "4",
  prepTime: "PT20M",
  cookTime: "PT1H",
  keywords: "italian, pizza, weeknight",
  recipeIngredient: ["500g bread flour", "325ml warm water", "2 tsp salt"],
  recipeInstructions: [
    { "@type": "HowToStep", text: "Mix flour, water, and salt into a shaggy dough." },
    { "@type": "HowToStep", text: "Knead for ten minutes until smooth and elastic." },
  ],
  nutrition: {
    "@type": "NutritionInformation",
    calories: "270 kcal",
    proteinContent: "9 g",
    carbohydrateContent: "52 g",
    fatContent: "3 g",
  },
};

function htmlWith(jsonld: unknown): string {
  return `<html><head><script type="application/ld+json">${JSON.stringify(
    jsonld,
  )}</script></head><body><h1>Page</h1></body></html>`;
}

describe("extractJsonLdRecipe", () => {
  it("parses a direct schema.org Recipe block", () => {
    const parsed = extractJsonLdRecipe(htmlWith(JSONLD_RECIPE), "https://www.example.com/pizza");
    expect(parsed).not.toBeNull();
    expect(parsed!.name).toBe("Classic Margherita Pizza");
    expect(parsed!.description).toBe("A simple Neapolitan pizza."); // HTML stripped
    expect(parsed!.imageUrl).toBe("https://example.com/pizza.jpg");
    expect(parsed!.servings).toBe("4");
    expect(parsed!.prepTime).toBe("20 min");
    expect(parsed!.cookTime).toBe("1 hr");
    expect(parsed!.ingredients).toEqual(["500g bread flour", "325ml warm water", "2 tsp salt"]);
    expect(parsed!.instructions).toHaveLength(2);
    expect(parsed!.instructions[0]).toMatch(/shaggy dough/);
    expect(parsed!.tags).toEqual(["italian", "pizza", "weeknight"]);
    expect(parsed!.nutrition.calories).toBe("270 kcal");
    expect(parsed!.sourceSite).toBe("example.com");
    expect(parsed!.confidence).toBe("high");
  });

  it("finds a Recipe nested inside @graph", () => {
    const graph = { "@context": "https://schema.org", "@graph": [{ "@type": "WebPage", name: "x" }, JSONLD_RECIPE] };
    const parsed = extractJsonLdRecipe(htmlWith(graph));
    expect(parsed).not.toBeNull();
    expect(parsed!.name).toBe("Classic Margherita Pizza");
  });

  it("returns null when no recipe data exists", () => {
    const parsed = extractJsonLdRecipe(`<html><body><p>No structured data here.</p></body></html>`);
    expect(parsed).toBeNull();
  });

  it("skips malformed JSON blocks without throwing", () => {
    const html = `<script type="application/ld+json">{ not json</script>` + htmlWith(JSONLD_RECIPE);
    const parsed = extractJsonLdRecipe(html);
    expect(parsed).not.toBeNull();
    expect(parsed!.name).toBe("Classic Margherita Pizza");
  });
});

describe("parseTextRecipe", () => {
  const PASTED = [
    "Weeknight Fried Rice",
    "A fast way to use leftover rice.",
    "Serves: 2",
    "Ingredients:",
    "- 2 cups cooked rice",
    "- 2 eggs",
    "- 1 tbsp soy sauce",
    "Instructions:",
    "1. Heat a wok over high heat until smoking.",
    "2. Scramble the eggs, then add the rice and soy sauce.",
  ].join("\n");

  it("parses title, description, servings, ingredients, and steps", () => {
    const parsed = parseTextRecipe(PASTED);
    expect(parsed.name).toBe("Weeknight Fried Rice");
    expect(parsed.description).toBe("A fast way to use leftover rice.");
    expect(parsed.servings).toBe("2");
    expect(parsed.ingredients).toEqual(["2 cups cooked rice", "2 eggs", "1 tbsp soy sauce"]);
    expect(parsed.instructions).toEqual([
      "Heat a wok over high heat until smoking.",
      "Scramble the eggs, then add the rice and soy sauce.",
    ]);
    expect(parsed.confidence).toBe("medium");
  });

  it("auto-detects ingredients vs instructions without section headers", () => {
    const noHeaders = [
      "Garlic Butter Toast",
      "2 slices sourdough",
      "1 clove garlic",
      "Toast the bread until golden and rub with the garlic clove.",
    ].join("\n");
    const parsed = parseTextRecipe(noHeaders);
    expect(parsed.ingredients).toContain("2 slices sourdough");
    expect(parsed.ingredients).toContain("1 clove garlic");
    expect(parsed.instructions[0]).toMatch(/Toast the bread/);
  });

  it("returns low confidence for empty input", () => {
    const parsed = parseTextRecipe("");
    expect(parsed.confidence).toBe("low");
    expect(parsed.ingredients).toEqual([]);
  });
});
