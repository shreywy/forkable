import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  const items = await prisma.pantryItem.findMany({
    where: { userId },
    include: { ingredient: { select: { id: true, slug: true, name: true } } },
    orderBy: { addedAt: "asc" },
  });

  return NextResponse.json(items.map((i) => ({
    ingredientId: i.ingredientId,
    slug: i.ingredient.slug,
    name: i.ingredient.name,
    addedAt: i.addedAt,
  })));
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;
  const { ingredientId } = await req.json();
  if (!ingredientId) {
    return NextResponse.json({ error: "ingredientId required" }, { status: 400 });
  }

  const item = await prisma.pantryItem.upsert({
    where: { userId_ingredientId: { userId, ingredientId } },
    create: { userId, ingredientId },
    update: {},
    include: { ingredient: { select: { id: true, slug: true, name: true } } },
  });

  return NextResponse.json({
    ingredientId: item.ingredientId,
    slug: item.ingredient.slug,
    name: item.ingredient.name,
    addedAt: item.addedAt,
  }, { status: 201 });
}
