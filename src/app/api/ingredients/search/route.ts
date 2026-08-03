import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { searchOFF, slugifyIngredient } from "@/lib/off";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase();
  if (!q || q.length < 2) {
    return Response.json({ results: [] });
  }

  // 1. Check local DB for cached ingredients
  const cached = await prisma.ingredient.findMany({
    where: {
      OR: [
        { name:    { contains: q } },
        { aliases: { has:      q } },
        { slug:    { contains: slugifyIngredient(q) } },
      ],
    },
    take: 8,
    orderBy: { updatedAt: "desc" },
  });

  // 2. If we have fresh results, return them
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const freshCached = cached.filter((c) => c.updatedAt > thirtyDaysAgo);
  if (freshCached.length >= 3) {
    return Response.json({
      results: freshCached.map((c) => ({
        id:       c.id,
        name:     c.name,
        slug:     c.slug,
        calories: c.calories,
        protein:  c.protein,
        carbs:    c.carbs,
        fat:      c.fat,
        fiber:    c.fiber,
        source:   c.macroSource,
      })),
      source: "cache",
    });
  }

  // 3. Fetch from OpenFoodFacts
  const offResults = await searchOFF(q);

  // 4. Upsert into DB
  const upserted = await Promise.all(
    offResults.map(async (p) => {
      const slug = slugifyIngredient(p.name);
      return prisma.ingredient.upsert({
        where: { slug },
        update: {
          calories:    p.calories ?? undefined,
          protein:     p.protein  ?? undefined,
          carbs:       p.carbs    ?? undefined,
          fat:         p.fat      ?? undefined,
          fiber:       p.fiber    ?? undefined,
          macroSource: "OPEN_FOOD_FACTS",
          offId:       p.offId,
          updatedAt:   new Date(),
        },
        create: {
          slug,
          name:        p.name.toLowerCase(),
          aliases:     [p.name],
          calories:    p.calories ?? undefined,
          protein:     p.protein  ?? undefined,
          carbs:       p.carbs    ?? undefined,
          fat:         p.fat      ?? undefined,
          fiber:       p.fiber    ?? undefined,
          macroSource: "OPEN_FOOD_FACTS",
          offId:       p.offId,
        },
      });
    }),
  );

  // Merge with any remaining cached results not in OFFs response
  const allSlugs = new Set(upserted.map((u) => u.slug));
  const extra = cached.filter((c) => !allSlugs.has(c.slug));
  const combined = [...upserted, ...extra].slice(0, 8);

  return Response.json({
    results: combined.map((c) => ({
      id:       c.id,
      name:     c.name,
      slug:     c.slug,
      calories: c.calories,
      protein:  c.protein,
      carbs:    c.carbs,
      fat:      c.fat,
      fiber:    c.fiber,
      source:   c.macroSource,
    })),
    source: "openfoodfacts",
  });
}
