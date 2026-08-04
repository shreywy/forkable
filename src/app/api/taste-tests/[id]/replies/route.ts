import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const replies = await prisma.tasteTestReply.findMany({
    where: { tasteTestId: id },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { username: true, displayName: true, avatarUrl: true } },
    },
  });
  return NextResponse.json(replies);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;
  const { id } = await params;
  const { body } = await req.json();

  if (!body?.trim()) {
    return NextResponse.json({ error: "body required" }, { status: 400 });
  }

  // Verify taste test exists
  const tt = await prisma.tasteTest.findUnique({ where: { id } });
  if (!tt) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const reply = await prisma.tasteTestReply.create({
    data: { tasteTestId: id, authorId: userId, body: body.trim() },
    include: {
      author: { select: { username: true, displayName: true, avatarUrl: true } },
    },
  });

  return NextResponse.json(reply, { status: 201 });
}
