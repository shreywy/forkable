import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { aiEnabled, suggestSubstitutions } from "@/lib/ai";
import { cached } from "@/lib/cache";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // AI costs money - require login
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!aiEnabled()) {
    return NextResponse.json({ error: "AI features not configured" }, { status: 503 });
  }

  const rl = await checkRateLimit(`ai:${session.user.id}`, { limit: 10, windowSec: 3600 });
  if (!rl.ok) return rateLimitResponse(rl.resetAt);

  const { recipeId } = (await req.json()) as { recipeId?: string };
  if (!recipeId) return NextResponse.json({ error: "recipeId required" }, { status: 400 });

  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: {
      isPublic: true,
      components: {
        select: { ingredients: { select: { ingredient: { select: { name: true } } } } },
      },
    },
  });
  if (!recipe || !recipe.isPublic) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  const ingredients = [
    ...new Set(
      recipe.components.flatMap((c) => c.ingredients.map((ci) => ci.ingredient.name)),
    ),
  ];

  // Same recipe = same answer; cache a day so repeat clicks cost nothing
  const substitutions = await cached(`ai:subs:${recipeId}`, 86400, () =>
    suggestSubstitutions(ingredients),
  );

  return NextResponse.json({ substitutions });
}
