import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const skip = Math.max(0, parseInt(searchParams.get("skip") ?? "0", 10));
  const take = Math.min(18, Math.max(1, parseInt(searchParams.get("take") ?? "9", 10)));

  const rows = await prisma.recipe.findMany({
    where: { isPublic: true },
    orderBy: [{ starCount: "desc" }, { id: "asc" }],
    skip,
    take: take + 1, // fetch one extra to know if there's a next page
    include: {
      author: { select: { username: true, displayName: true, avatarUrl: true } },
      tags: { include: { tag: true }, take: 3 },
      forkedFrom: { include: { author: { select: { username: true } } } },
    },
  });

  const hasMore = rows.length > take;
  const items = rows.slice(0, take).map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    imageUrl: r.imageUrl,
    author: r.author,
    forkedFrom: r.forkedFrom
      ? { ownerUsername: r.forkedFrom.author.username, recipeSlug: r.forkedFrom.slug }
      : null,
    starCount: r.starCount,
    forkCount: r.forkCount,
    tasteTestCount: r.tasteTestCount,
    tweakCount: r.tweakCount,
    tags: r.tags.map((rt) => ({ name: rt.tag.name, label: rt.tag.label })),
    updatedAt: r.updatedAt.toISOString(),
  }));

  return NextResponse.json({ items, hasMore, nextSkip: skip + take });
}
