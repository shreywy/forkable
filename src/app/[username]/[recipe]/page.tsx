import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { RecipePageTabs } from "@/components/recipe/RecipePageTabs";
import type { RecipePageData, FileTreeNode, TweakData, TasteTestData, RecipeCardData } from "@/lib/types";

interface Props {
  params: Promise<{ username: string; recipe: string }>;
}

export default async function RecipePage({ params }: Props) {
  const { username, recipe: recipeSlug } = await params;

  const [session, recipe] = await Promise.all([
    auth(),
    prisma.recipe.findFirst({
      where: { slug: recipeSlug, author: { username } },
      include: {
        author: { select: { username: true, displayName: true, avatarUrl: true } },
        forkedFrom: {
          include: { author: { select: { username: true } } },
        },
        components: {
          orderBy: { order: "asc" },
          include: {
            children: {
              orderBy: { order: "asc" },
              include: {
                steps: { orderBy: { order: "asc" } },
                ingredients: { include: { ingredient: true } },
              },
            },
            steps: { orderBy: { order: "asc" } },
            ingredients: { include: { ingredient: true } },
          },
        },
        tags: { include: { tag: true } },
        versions: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            author: { select: { username: true, displayName: true, avatarUrl: true } },
          },
        },
        tasteTests: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            author: { select: { username: true, displayName: true, avatarUrl: true } },
          },
        },
        // Recipe.forks = Recipe[] (children that forked from this recipe)
        forks: {
          take: 10,
          include: {
            author: { select: { username: true, displayName: true, avatarUrl: true } },
            tags: { include: { tag: true }, take: 3 },
            forkedFrom: { include: { author: { select: { username: true } } } },
          },
        },
      },
    }),
  ]);

  if (!recipe) notFound();

  // Helpers
  type TopComp = (typeof recipe.components)[number];
  type ChildComp = TopComp["children"][number];

  function mapComponent(c: TopComp | ChildComp): FileTreeNode {
    const isFolder = c.type === "FOLDER";
    const steps = c.steps.map((s, i) => ({ step: i + 1, text: s.content }));

    // Build nested sub-component children (real DB children)
    const dbChildren = "children" in c && c.children.length > 0
      ? (c.children as ChildComp[]).map(mapComponent)
      : [];

    // For folders: synthesize virtual ingredients.json + instructions.md file entries
    // so the file tree shows browsable files inside each component folder.
    const virtualFiles: FileTreeNode[] = [];
    if (isFolder) {
      if (c.ingredients.length > 0) {
        virtualFiles.push({
          type: "file",
          name: "ingredients.json",
          displayName: "ingredients.json",
          updatedAt: c.updatedAt,
          lastTweak: c.lastTweak ?? null,
          // Encode real ingredient data into subSteps for getFileContent to use
          subSteps: c.ingredients.map((ci, i) => ({
            step: i + 1,
            text: `${ci.ingredient.name}|${ci.amount ?? ""}|${ci.unit ?? ""}`,
          })),
        });
      }
      if (steps.length > 0) {
        virtualFiles.push({
          type: "file",
          name: "instructions.md",
          displayName: "instructions.md",
          updatedAt: c.updatedAt,
          lastTweak: c.lastTweak ?? null,
          subSteps: steps,
        });
      }
    }

    const children = [...dbChildren, ...virtualFiles];

    return {
      type: isFolder ? "folder" : "file",
      name: c.name,
      displayName: c.displayName,
      updatedAt: c.updatedAt,
      lastTweak: c.lastTweak ?? null,
      children: children.length > 0 ? children : undefined,
      subSteps: steps,
    };
  }

  const components: FileTreeNode[] = recipe.components
    .filter((c) => c.parentId === null)
    .map(mapComponent);

  // Flatten top-level FILE steps for the instructions panel
  const instructions: { step: number; text: string }[] = recipe.components
    .filter((c) => c.parentId === null && c.type === "FILE")
    .flatMap((c) => c.steps)
    .map((s, i) => ({ step: i + 1, text: s.content }));

  // Build RecipePageData
  const recipeData: RecipePageData = {
    id: recipe.id,
    slug: recipe.slug,
    name: recipe.name,
    description: recipe.description,
    imageUrl: recipe.imageUrl,
    author: recipe.author,
    forkedFrom: recipe.forkedFrom
      ? { ownerUsername: recipe.forkedFrom.author.username, recipeSlug: recipe.forkedFrom.slug }
      : null,
    starCount: recipe.starCount,
    forkCount: recipe.forkCount,
    tasteTestCount: recipe.tasteTestCount,
    tweakCount: recipe.tweakCount,
    tags: recipe.tags.map((rt) => ({ name: rt.tag.name, label: rt.tag.label })),
    updatedAt: recipe.updatedAt,
    servings: recipe.servings,
    calories: recipe.calories,
    proteinG: recipe.proteinG,
    carbsG: recipe.carbsG,
    fatG: recipe.fatG,
    fiberG: recipe.fiberG,
    components,
    instructions,
  };

  // Tweaks (recipe versions / commits)
  const tweaks: TweakData[] = recipe.versions.map((v) => ({
    id: v.id,
    message: v.message,
    author: v.author,
    createdAt: v.createdAt,
    additions: v.additions,
    deletions: v.deletions,
  }));

  // Taste tests
  const tasteTsts: TasteTestData[] = recipe.tasteTests.map((tt) => ({
    id: tt.id,
    type: tt.type,
    status: tt.status,
    author: tt.author,
    createdAt: tt.createdAt,
    body: tt.body,
    rating: tt.rating,
    title: tt.title,
    diff: tt.diff as TasteTestData["diff"],
  }));

  // Forked recipes (Recipe.forks = child Recipe[])
  const forks: RecipeCardData[] = recipe.forks.map((f) => ({
    id: f.id,
    slug: f.slug,
    name: f.name,
    description: f.description,
    imageUrl: f.imageUrl,
    author: f.author,
    forkedFrom: f.forkedFrom
      ? { ownerUsername: f.forkedFrom.author.username, recipeSlug: f.forkedFrom.slug }
      : null,
    starCount: f.starCount,
    forkCount: f.forkCount,
    tasteTestCount: f.tasteTestCount,
    tweakCount: f.tweakCount,
    tags: f.tags.map((rt) => ({ name: rt.tag.name, label: rt.tag.label })),
    updatedAt: f.updatedAt,
  }));

  // Suppress unused session warning — will be used for auth-gated actions in Phase 3
  void session;

  return (
    <div className="min-h-screen bg-background">
      <RecipePageTabs
        recipe={recipeData}
        tweaks={tweaks}
        tasteTsts={tasteTsts}
        forks={forks}
      />
    </div>
  );
}
