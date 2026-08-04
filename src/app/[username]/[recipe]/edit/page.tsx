import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EditClient } from "./EditClient";
import type { EditRecipeData } from "./EditClient";

interface Props {
  params: Promise<{ username: string; recipe: string }>;
}

export default async function RecipeEditPage({ params }: Props) {
  const { username, recipe: recipeSlug } = await params;

  const session = await auth();
  const userId = (session?.user as { id?: string } | null)?.id;
  if (!userId) redirect("/login");

  const recipe = await prisma.recipe.findFirst({
    where: { slug: recipeSlug, author: { username } },
    include: {
      author: { select: { username: true, displayName: true } },
      tags: { include: { tag: true } },
      components: {
        where: { parentId: null },
        orderBy: { order: "asc" },
        include: {
          steps: { orderBy: { order: "asc" } },
          ingredients: {
            orderBy: { order: "asc" },
            include: { ingredient: { select: { id: true, name: true } } },
          },
          children: {
            orderBy: { order: "asc" },
            include: {
              steps: { orderBy: { order: "asc" } },
              ingredients: {
                orderBy: { order: "asc" },
                include: { ingredient: { select: { id: true, name: true } } },
              },
            },
          },
        },
      },
    },
  });

  if (!recipe) notFound();

  if (recipe.authorId !== userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-foreground font-medium">You don&apos;t have permission to edit this recipe.</p>
          <Link href={`/${username}/${recipeSlug}`} className="text-sm text-yellow-brand hover:underline">
            View recipe
          </Link>
        </div>
      </div>
    );
  }

  // Flatten components (top-level + their children) for the editor
  const allComponents = recipe.components.flatMap((c) => [c, ...c.children]);

  const editData: EditRecipeData = {
    id: recipe.id,
    slug: recipe.slug,
    name: recipe.name,
    description: recipe.description,
    imageUrl: recipe.imageUrl,
    tags: recipe.tags.map((rt) => rt.tag.name),
    components: allComponents.map((c) => ({
      id: c.id,
      name: c.name,
      displayName: c.displayName ?? c.name,
      ingredients: c.ingredients.map((ci) => ({
        id: ci.id,
        ingredientId: ci.ingredient.id,
        name: ci.ingredient.name,
        amount: ci.amount?.toString() ?? "",
        unit: ci.unit ?? "g",
      })),
      steps: c.steps.map((s) => ({
        id: s.id,
        content: s.content,
      })),
    })),
  };

  return <EditClient recipe={editData} username={username} />;
}
