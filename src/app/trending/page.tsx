import { prisma } from "@/lib/prisma";
import { TrendingClient } from "./TrendingClient";

export default async function TrendingPage() {
  const [topByStars, topByForks, topByTweaks, hotNow, risingCooks] = await Promise.all([
    prisma.recipe.findMany({
      where: { isPublic: true },
      orderBy: { starCount: "desc" },
      take: 5,
      include: { author: { select: { username: true, displayName: true, avatarUrl: true } } },
    }),
    prisma.recipe.findMany({
      where: { isPublic: true },
      orderBy: { forkCount: "desc" },
      take: 5,
      include: { author: { select: { username: true, displayName: true, avatarUrl: true } } },
    }),
    prisma.recipe.findMany({
      where: { isPublic: true },
      orderBy: { tweakCount: "desc" },
      take: 5,
      include: { author: { select: { username: true, displayName: true, avatarUrl: true } } },
    }),
    prisma.recipe.findMany({
      where: { isPublic: true },
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: { author: { select: { username: true, displayName: true, avatarUrl: true } } },
    }),
    prisma.user.findMany({
      take: 3,
      orderBy: { followers: { _count: "desc" } },
      select: {
        username: true,
        displayName: true,
        avatarUrl: true,
        _count: { select: { recipes: true, followers: true } },
      },
    }),
  ]);

  const mapRecipe = (r: (typeof topByStars)[0]) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    imageUrl: r.imageUrl,
    starCount: r.starCount,
    forkCount: r.forkCount,
    tweakCount: r.tweakCount,
    author: r.author,
  });

  return (
    <TrendingClient
      topByStars={topByStars.map(mapRecipe)}
      topByForks={topByForks.map(mapRecipe)}
      topByTweaks={topByTweaks.map(mapRecipe)}
      hotNow={hotNow.map(mapRecipe)}
      risingCooks={risingCooks.map((u) => ({
        username: u.username,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
        recipeCount: u._count.recipes,
        followerCount: u._count.followers,
      }))}
    />
  );
}
