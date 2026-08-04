import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({
    take: 4,
    orderBy: { followers: { _count: "desc" } },
    select: {
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      _count: { select: { followers: true } },
    },
  });

  return Response.json(
    users.map((u) => ({
      username: u.username,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
      bio: u.bio,
      followerCount: u._count.followers,
    })),
  );
}
