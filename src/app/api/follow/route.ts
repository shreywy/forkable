import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | null)?.id;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await checkRateLimit(`follow:${userId}`, { limit: 60, windowSec: 60 });
  if (!rl.ok) return rateLimitResponse(rl.resetAt);

  const { targetUsername, action } = (await request.json()) as {
    targetUsername: string;
    action: "follow" | "unfollow";
  };

  if (!targetUsername || !action) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { username: targetUsername },
    select: { id: true },
  });
  if (!target) return Response.json({ error: "User not found" }, { status: 404 });

  if (target.id === userId) {
    return Response.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  if (action === "follow") {
    await prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: target.id,
        },
      },
      create: { followerId: userId, followingId: target.id },
      update: {},
    });
  } else {
    await prisma.follow.deleteMany({
      where: { followerId: userId, followingId: target.id },
    });
  }

  // Return the updated follower count
  const followerCount = await prisma.follow.count({
    where: { followingId: target.id },
  });

  return Response.json({ success: true, followerCount });
}
