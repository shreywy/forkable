// schema.org structured data builders.
//
// Nice symmetry: Forkable's importer parses schema.org Recipe JSON-LD from
// other sites, and these builders emit the same format - so a Forkable page
// can itself be imported into Forkable.

export type RecipeJsonLdInput = {
  name: string;
  description: string;
  imageUrl: string | null;
  authorName: string;
  authorUrl: string;
  datePublished: Date | string;
  servings: number;
  ingredientLines: string[];
  steps: string[];
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  fiberG: number | null;
  starCount: number;
  tags: string[];
};

export function recipeJsonLd(r: RecipeJsonLdInput): Record<string, unknown> {
  const jsonld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: r.name,
    description: r.description,
    author: {
      "@type": "Person",
      name: r.authorName,
      url: r.authorUrl,
    },
    datePublished:
      typeof r.datePublished === "string" ? r.datePublished : r.datePublished.toISOString(),
    recipeYield: `${r.servings} servings`,
    recipeIngredient: r.ingredientLines,
    recipeInstructions: r.steps.map((text) => ({ "@type": "HowToStep", text })),
    keywords: r.tags.join(", "),
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: { "@type": "LikeAction" },
      userInteractionCount: r.starCount,
    },
  };

  if (r.imageUrl) jsonld.image = [r.imageUrl];

  if (r.calories !== null) {
    const nutrition: Record<string, string> = {
      "@type": "NutritionInformation",
      calories: `${r.calories} kcal`,
    };
    if (r.proteinG !== null) nutrition.proteinContent = `${r.proteinG} g`;
    if (r.carbsG !== null) nutrition.carbohydrateContent = `${r.carbsG} g`;
    if (r.fatG !== null) nutrition.fatContent = `${r.fatG} g`;
    if (r.fiberG !== null) nutrition.fiberContent = `${r.fiberG} g`;
    jsonld.nutrition = nutrition;
  }

  return jsonld;
}

export function profileJsonLd(u: {
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  url: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: u.displayName,
      alternateName: `@${u.username}`,
      description: u.bio ?? undefined,
      image: u.avatarUrl ?? undefined,
      url: u.url,
    },
  };
}

/** Serialize for a <script type="application/ld+json"> tag, escaping `<`. */
export function jsonLdScript(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
