import { notFound } from "next/navigation";
import { MOCK_RECIPES, MOCK_TWEAKS, MOCK_TASTE_TESTS } from "@/lib/mock-data";
import { RecipePageTabs } from "@/components/recipe/RecipePageTabs";

interface Props {
  params: Promise<{ username: string; recipe: string }>;
}

export default async function RecipePage({ params }: Props) {
  const { username, recipe: recipeSlug } = await params;

  const recipe = MOCK_RECIPES.find(
    (r) => r.owner.username === username && r.slug === recipeSlug,
  );
  if (!recipe) notFound();

  const forks = MOCK_RECIPES.filter(
    (r) => r.forkedFrom?.owner === username && r.forkedFrom?.recipe === recipeSlug,
  );

  return (
    <div className="min-h-screen bg-background">
      <RecipePageTabs
        recipe={recipe}
        tweaks={MOCK_TWEAKS}
        tasteTsts={MOCK_TASTE_TESTS}
        forks={forks}
      />
    </div>
  );
}
