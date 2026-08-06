import { Sparkles } from "lucide-react";
import { RecipeCard } from "@/components/RecipeCard";
import type { RecipeCardData } from "@/lib/types";

export function SimilarRecipes({ recipes }: { recipes: RecipeCardData[] }) {
  if (recipes.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
        <Sparkles className="w-4 h-4 text-yellow-brand" />
        You might also like
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {recipes.map((r) => (
          <RecipeCard key={r.id} recipe={r} />
        ))}
      </div>
    </section>
  );
}
