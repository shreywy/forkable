import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const rl = await checkRateLimit(`star:${userId}`, { limit: 60, windowSec: 60 });
  if (!rl.ok) return rateLimitResponse(rl.resetAt);

  const { recipeId } = await req.json();
  if (!recipeId) return NextResponse.json({ error: "recipeId required" }, { status: 400 });

  await prisma.$transaction([
    prisma.star.upsert({
      where: { userId_recipeId: { userId, recipeId } },
      create: { userId, recipeId },
      update: {},
    }),
    prisma.recipe.update({
      where: { id: recipeId },
      data: { starCount: { increment: 1 } },
    }),
  ]);

  return NextResponse.json({ starred: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const rl = await checkRateLimit(`star:${userId}`, { limit: 60, windowSec: 60 });
  if (!rl.ok) return rateLimitResponse(rl.resetAt);

  const { recipeId } = await req.json();
  if (!recipeId) return NextResponse.json({ error: "recipeId required" }, { status: 400 });

  const existing = await prisma.star.findUnique({
    where: { userId_recipeId: { userId, recipeId } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.star.delete({ where: { userId_recipeId: { userId, recipeId } } }),
      prisma.recipe.update({
        where: { id: recipeId },
        data: { starCount: { decrement: 1 } },
      }),
    ]);
  }

  return NextResponse.json({ starred: false });
}
