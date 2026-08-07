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

  const existing = await prisma.star.findUnique({
    where: { userId_recipeId: { userId, recipeId } },
  });

  if (!existing) {
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      select: { authorId: true },
    });
    if (!recipe) return NextResponse.json({ error: "Recipe not found" }, { status: 404 });

    await prisma.$transaction([
      prisma.star.create({ data: { userId, recipeId } }),
      prisma.recipe.update({
        where: { id: recipeId },
        data: { starCount: { increment: 1 } },
      }),
    ]);

    if (recipe.authorId !== userId) {
      prisma.notification.create({
        data: {
          recipientId: recipe.authorId,
          actorId: userId,
          type: "NEW_STAR",
          entityId: recipeId,
          entityType: "Recipe",
        },
      }).catch(() => {});
    }
  }

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
