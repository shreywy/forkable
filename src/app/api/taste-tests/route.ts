import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const recipeId = searchParams.get("recipeId");
  if (!recipeId) return NextResponse.json({ error: "recipeId required" }, { status: 400 });

  const tasteTsts = await prisma.tasteTest.findMany({
    where: { recipeId },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { username: true, displayName: true, avatarUrl: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { username: true, displayName: true, avatarUrl: true } },
        },
      },
    },
  });

  return NextResponse.json(tasteTsts);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  const rl = await checkRateLimit(`taste-tests:${userId}`, { limit: 15, windowSec: 60 });
  if (!rl.ok) return rateLimitResponse(rl.resetAt);

  const { recipeId, type, body, rating, title, diff } = await req.json();
  if (!recipeId || !type) {
    return NextResponse.json({ error: "recipeId and type required" }, { status: 400 });
  }
  if (type === "COMMENT" && !body?.trim()) {
    return NextResponse.json({ error: "body required for comments" }, { status: 400 });
  }

  const tt = await prisma.tasteTest.create({
    data: {
      recipeId,
      authorId: userId,
      type,
      body: body ?? null,
      rating: rating ?? null,
      title: title ?? null,
      diff: diff ?? null,
    },
    include: {
      author: { select: { username: true, displayName: true, avatarUrl: true } },
      replies: true,
    },
  });

  // Increment counter on recipe
  await prisma.recipe.update({
    where: { id: recipeId },
    data: { tasteTestCount: { increment: 1 } },
  });

  return NextResponse.json(tt, { status: 201 });
}
