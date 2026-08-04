import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const { name, description, isPublic, recipeIds } = await req.json() as {
    name: string;
    description?: string;
    isPublic?: boolean;
    recipeIds?: string[];
  };

  if (!name?.trim()) return NextResponse.json({ error: "name required" }, { status: 400 });

  const baseSlug = toSlug(name) || "cookbook";

  // Ensure slug uniqueness within this user's cookbooks
  let slug = baseSlug;
  let attempt = 0;
  while (true) {
    const conflict = await prisma.cookbook.findUnique({
      where: { ownerId_slug: { ownerId: userId, slug } },
      select: { id: true },
    });
    if (!conflict) break;
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  const cookbook = await prisma.cookbook.create({
    data: {
      slug,
      name: name.trim(),
      description: description?.trim() || null,
      isPublic: isPublic ?? true,
      ownerId: userId,
      ...(recipeIds?.length
        ? {
            recipes: {
              create: recipeIds.map((recipeId, order) => ({ recipeId, order })),
            },
          }
        : {}),
    },
    include: { owner: { select: { username: true } } },
  });

  return NextResponse.json({ slug: cookbook.slug, username: cookbook.owner.username }, { status: 201 });
}
