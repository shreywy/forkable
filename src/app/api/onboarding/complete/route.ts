import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | null)?.id;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const data = (await request.json()) as {
    displayName?: string;
    username?: string;
    bio?: string;
    location?: string;
    website?: string;
    twitter?: string;
    instagram?: string;
    githubHandle?: string;
    avatarUrl?: string;
    cuisineTags?: string[];
    dietaryTags?: string[];
    styleTags?: string[];
    theme?: string;
  };

  // Check username uniqueness if provided
  if (data.username) {
    const conflict = await prisma.user.findFirst({
      where: { username: data.username, NOT: { id: userId } },
      select: { id: true },
    });
    if (conflict) {
      return Response.json({ error: "Username already taken" }, { status: 409 });
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.displayName ? { displayName: data.displayName } : {}),
      ...(data.username ? { username: data.username } : {}),
      ...(data.bio !== undefined ? { bio: data.bio } : {}),
      ...(data.location !== undefined ? { location: data.location } : {}),
      ...(data.website !== undefined ? { websiteUrl: data.website } : {}),
      ...(data.twitter !== undefined ? { twitterHandle: data.twitter } : {}),
      ...(data.instagram !== undefined ? { instagramHandle: data.instagram } : {}),
      ...(data.githubHandle !== undefined ? { githubHandle: data.githubHandle } : {}),
      ...(data.avatarUrl ? { avatarUrl: data.avatarUrl } : {}),
      ...(data.cuisineTags ? { cuisineTags: data.cuisineTags } : {}),
      ...(data.dietaryTags ? { dietaryTags: data.dietaryTags } : {}),
      ...(data.styleTags ? { styleTags: data.styleTags } : {}),
      ...(data.theme ? { themePreference: data.theme } : {}),
    },
  });

  return Response.json({ success: true });
}
