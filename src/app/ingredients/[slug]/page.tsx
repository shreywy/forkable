import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Carrot } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { RecipeCard } from "@/components/RecipeCard";
import { PantryToggleButton } from "@/components/PantryToggleButton";
import { hydrateRecipeCards } from "@/lib/search";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const ingredient = await prisma.ingredient.findUnique({
    where: { slug },
    select: { name: true, _count: { select: { usages: true } } },
  });
  if (!ingredient) return { title: "Ingredient not found" };
  return {
    title: `${ingredient.name} - ingredient`,
    description: `Nutrition facts for ${ingredient.name} and the ${ingredient._count.usages} Forkable recipes that use it.`,
  };
}

const SOURCE_LABEL: Record<string, string> = {
  OPEN_FOOD_FACTS: "OpenFoodFacts",
  MANUAL: "Manually entered",
  ESTIMATED: "Estimated",
};

export default async function IngredientPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const ingredient = await prisma.ingredient.findUnique({
    where: { slug },
    include: { _count: { select: { usages: true } } },
  });
  if (!ingredient) notFound();

  const [recipeRows, pantryItem] = await Promise.all([
    prisma.recipe.findMany({
      where: {
        isPublic: true,
        components: { some: { ingredients: { some: { ingredientId: ingredient.id } } } },
      },
      orderBy: { starCount: "desc" },
      take: 12,
      select: { id: true },
    }),
    userId
      ? prisma.pantryItem.findUnique({
          where: { userId_ingredientId: { userId, ingredientId: ingredient.id } },
        })
      : Promise.resolve(null),
  ]);

  const recipes = await hydrateRecipeCards(recipeRows.map((r) => r.id));

  const macros = [
    { label: "Calories", value: ingredient.calories, unit: "kcal" },
    { label: "Protein", value: ingredient.protein, unit: "g" },
    { label: "Carbs", value: ingredient.carbs, unit: "g" },
    { label: "Fat", value: ingredient.fat, unit: "g" },
    { label: "Fiber", value: ingredient.fiber, unit: "g" },
  ];
  const hasMacros = macros.some((m) => m.value !== null);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1280px] mx-auto px-4 py-8">
        <Link
          href="/ingredients"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5"
        >
          <ArrowLeft className="w-4 h-4" />
          Ingredient catalog
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="flex items-center gap-2.5 text-2xl font-bold text-foreground capitalize">
              <Carrot className="w-6 h-6 text-yellow-brand" />
              {ingredient.name}
            </h1>
            {ingredient.aliases.length > 1 && (
              <p className="text-xs text-muted-foreground mt-1">
                Also known as: {ingredient.aliases.filter((a) => a.toLowerCase() !== ingredient.name.toLowerCase()).join(", ") || "-"}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              Used in {ingredient._count.usages} recipe{ingredient._count.usages === 1 ? "" : "s"}
            </p>
          </div>
          {userId && (
            <PantryToggleButton ingredientId={ingredient.id} initialInPantry={!!pantryItem} />
          )}
        </div>

        {/* Macros panel */}
        {hasMacros && (
          <div className="rounded-xl border border-border bg-card overflow-hidden mb-8 max-w-2xl">
            <div className="flex items-center justify-between px-4 py-2 bg-muted/40 border-b border-border">
              <span className="text-xs font-mono font-medium text-foreground">
                nutrition per 100 g
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-yellow-subtle dark:bg-yellow-muted text-foreground/70">
                {SOURCE_LABEL[ingredient.macroSource] ?? ingredient.macroSource}
              </span>
            </div>
            <div className="grid grid-cols-5 divide-x divide-border">
              {macros.map((m) => (
                <div key={m.label} className="flex flex-col items-center py-3 px-2">
                  <span className="text-lg font-bold text-foreground">{m.value ?? "-"}</span>
                  <span className="text-[10px] text-muted-foreground">{m.unit}</span>
                  <span className="text-xs text-muted-foreground mt-0.5">{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recipes using this ingredient */}
        <h2 className="text-sm font-semibold text-foreground mb-4">
          Recipes with {ingredient.name}
        </h2>
        {recipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recipes.map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No public recipes use this ingredient yet.</p>
        )}
      </div>
    </div>
  );
}
