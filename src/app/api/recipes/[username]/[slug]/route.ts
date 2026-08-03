import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string; slug: string }> },
) {
  const { username, slug } = await params;

  const recipe = await prisma.recipe.findFirst({
    where: { slug, author: { username } },
    include: {
      author: { select: { username: true, displayName: true, avatarUrl: true } },
      components: {
        where: { parentId: null },
        orderBy: { order: "asc" },
        include: {
          steps: { orderBy: { order: "asc" } },
          ingredients: { include: { ingredient: { select: { name: true } } } },
          children: {
            orderBy: { order: "asc" },
            include: {
              steps: { orderBy: { order: "asc" } },
              ingredients: { include: { ingredient: { select: { name: true } } } },
            },
          },
        },
      },
      tags: { include: { tag: true } },
    },
  });

  if (!recipe) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Shape a cook-friendly response
  const components = recipe.components.map((c) => {
    const steps = c.steps.map((s, i) => ({ step: i + 1, text: s.content }));
    const subComponents = c.children.map((ch) => ({
      name: ch.name,
      displayName: ch.displayName,
      type: ch.type,
      steps: ch.steps.map((s, i) => ({ step: i + 1, text: s.content })),
    }));
    return {
      name: c.name,
      displayName: c.displayName,
      type: c.type,
      steps,
      subComponents,
    };
  });

  const instructions = recipe.components
    .flatMap((c) => c.steps)
    .map((s, i) => ({ step: i + 1, text: s.content }));

  return NextResponse.json({
    id: recipe.id,
    slug: recipe.slug,
    name: recipe.name,
    description: recipe.description,
    imageUrl: recipe.imageUrl,
    author: recipe.author,
    servings: recipe.servings,
    calories: recipe.calories,
    proteinG: recipe.proteinG,
    carbsG: recipe.carbsG,
    fatG: recipe.fatG,
    fiberG: recipe.fiberG,
    starCount: recipe.starCount,
    forkCount: recipe.forkCount,
    tasteTestCount: recipe.tasteTestCount,
    tweakCount: recipe.tweakCount,
    tags: recipe.tags.map((rt) => ({ name: rt.tag.name, label: rt.tag.label })),
    updatedAt: recipe.updatedAt,
    components,
    instructions,
  });
}
