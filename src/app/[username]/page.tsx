import { notFound } from "next/navigation";
import Link from "next/link";
import {
  GitFork, Star, Users, BookOpen,
  Link as LinkIcon, MapPin, Calendar,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { FollowButton } from "@/components/profile/FollowButton";
import type { RecipeCardData, CookbookData } from "@/lib/types";

// Derive a gradient banner from the user's avatar seed (deterministic per user)
function getBannerBg(username: string): string {
  // Simple hash → pick from a set of warm gradients
  const gradients = [
    "linear-gradient(135deg, oklch(0.83 0.17 88 / 40%), oklch(0.83 0.17 88 / 8%))",   // yellow
    "linear-gradient(135deg, oklch(0.70 0.15 50 / 40%), oklch(0.70 0.15 50 / 8%))",   // orange
    "linear-gradient(135deg, oklch(0.65 0.15 145 / 35%), oklch(0.65 0.15 145 / 6%))", // green
    "linear-gradient(135deg, oklch(0.60 0.12 240 / 35%), oklch(0.60 0.12 240 / 6%))", // blue
    "linear-gradient(135deg, oklch(0.65 0.20 25 / 35%), oklch(0.65 0.20 25 / 6%))",   // red
  ];
  let hash = 0;
  for (const ch of username) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff;
  return gradients[hash % gradients.length];
}

function mapRecipe(r: {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string | null;
  starCount: number;
  forkCount: number;
  tasteTestCount: number;
  tweakCount: number;
  updatedAt: Date;
  forkedFrom: { slug: string; author: { username: string } } | null;
  author: { username: string; displayName: string; avatarUrl: string | null };
  tags: { tag: { name: string; label: string } }[];
}): RecipeCardData {
  return {
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
    updatedAt: r.updatedAt,
  };
}

interface Props {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;

  const [session, user] = await Promise.all([
    auth(),
    prisma.user.findUnique({
      where: { username },
      include: {
        recipes: {
          where: { isPublic: true },
          orderBy: { starCount: "desc" },
          take: 24,
          include: {
            author: { select: { username: true, displayName: true, avatarUrl: true } },
            tags: { include: { tag: true }, take: 3 },
            forkedFrom: { include: { author: { select: { username: true } } } },
          },
        },
        cookbooks: {
          where: { isPublic: true },
          take: 8,
          include: { _count: { select: { recipes: true } } },
        },
        _count: { select: { followers: true, following: true, recipes: true } },
        stars: {
          take: 8,
          orderBy: { createdAt: "desc" },
          include: {
            recipe: {
              include: {
                author: { select: { username: true, displayName: true, avatarUrl: true } },
                tags: { include: { tag: true }, take: 3 },
                forkedFrom: { include: { author: { select: { username: true } } } },
              },
            },
          },
        },
      },
    }),
  ]);

  if (!user) notFound();

  const isOwnProfile = session?.user && (session.user as { username?: string }).username === username;

  // Check if the logged-in user is already following this profile
  const sessionUserId = (session?.user as { id?: string } | null)?.id;
  const isFollowing = !!(sessionUserId && !isOwnProfile && await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: sessionUserId, followingId: user.id } },
    select: { followerId: true },
  }));

  // Map recipes
  const userRecipes: RecipeCardData[] = user.recipes.map(mapRecipe);
  const forkedRecipes = userRecipes.filter((r) => r.forkedFrom !== null);
  const starredRecipes: RecipeCardData[] = user.stars.map((s) => mapRecipe(s.recipe));

  // Cookbooks
  const userCookbooks: CookbookData[] = user.cookbooks.map((cb) => ({
    id: cb.id,
    slug: cb.slug,
    name: cb.name,
    description: cb.description,
    isPublic: cb.isPublic,
    recipeCount: cb._count.recipes,
  }));

  // Cover recipes for cookbooks (first recipe in each cookbook)
  const cookbookCovers = await Promise.all(
    user.cookbooks.map(async (cb) => {
      const first = await prisma.cookbookRecipe.findFirst({
        where: { cookbookId: cb.id },
        orderBy: { order: "asc" },
        include: {
          recipe: {
            include: {
              author: { select: { username: true, displayName: true, avatarUrl: true } },
              tags: { include: { tag: true }, take: 3 },
              forkedFrom: { include: { author: { select: { username: true } } } },
            },
          },
        },
      });
      return { id: cb.id, recipe: first ? mapRecipe(first.recipe) : undefined };
    }),
  );
  const coverRecipes: Record<string, RecipeCardData | undefined> = Object.fromEntries(
    cookbookCovers.map((c) => [c.id, c.recipe]),
  );

  const totalStars = user.recipes.reduce((sum, r) => sum + r.starCount, 0);
  const bannerBg = getBannerBg(username);

  const socials = [
    user.githubHandle    && { href: `https://github.com/${user.githubHandle}`,       icon: "GH",  label: user.githubHandle },
    user.twitterHandle   && { href: `https://twitter.com/${user.twitterHandle}`,     icon: "𝕏",   label: `@${user.twitterHandle}` },
    user.instagramHandle && { href: `https://instagram.com/${user.instagramHandle}`, icon: "IG",  label: `@${user.instagramHandle}` },
    user.websiteUrl      && { href: user.websiteUrl, icon: <LinkIcon className="w-3.5 h-3.5" />, label: user.websiteUrl.replace(/^https?:\/\//, "") },
  ].filter(Boolean) as { href: string; icon: React.ReactNode; label: string }[];

  return (
    <div className="min-h-screen bg-background">
      {/* ── Banner ──────────────────────────────────────────────────────────── */}
      <div className="h-32 border-b border-border" style={{ background: bannerBg }} />

      <div className="max-w-[1280px] mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Sidebar ───────────────────────────────────────────────────────── */}
          <aside className="lg:w-64 shrink-0">
            {/* Avatar overlaps banner */}
            <div className="-mt-14 mb-4">
              <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
                <AvatarImage src={user.avatarUrl ?? undefined} alt={user.displayName} />
                <AvatarFallback className="text-2xl font-bold bg-yellow-light">
                  {user.displayName[0]}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold text-foreground leading-tight">{user.displayName}</h1>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              </div>
            </div>

            {user.bio && (
              <p className="mt-3 text-sm text-foreground/80 leading-relaxed">{user.bio}</p>
            )}

            <FollowButton
              username={username}
              isOwnProfile={!!isOwnProfile}
              initialIsFollowing={isFollowing}
              initialFollowerCount={user._count.followers}
            />

            <Separator className="my-4" />

            {/* Meta info */}
            <div className="space-y-2 text-sm text-muted-foreground">
              {user.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>{user.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>Joined {user.createdAt.getFullYear()}</span>
              </div>
            </div>

            {/* Socials */}
            {socials.length > 0 && (
              <div className="mt-3 space-y-2">
                {socials.map((s) => (
                  <a
                    key={s.href}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-yellow-brand transition-colors"
                  >
                    {s.icon}
                    <span className="truncate">{s.label}</span>
                  </a>
                ))}
              </div>
            )}

            <Separator className="my-4" />

            {/* Stats */}
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="w-4 h-4" />
                <span><span className="font-semibold text-foreground">{user._count.recipes}</span> recipes</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <GitFork className="w-4 h-4" />
                <span><span className="font-semibold text-foreground">{forkedRecipes.length}</span> forks</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>
                  <Link href={`/${username}/followers`} className="font-semibold text-foreground hover:text-yellow-brand transition-colors">
                    {user._count.followers}
                  </Link>{" "}
                  followers
                  {" · "}
                  <Link href={`/${username}/following`} className="font-semibold text-foreground hover:text-yellow-brand transition-colors">
                    {user._count.following}
                  </Link>{" "}
                  following
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Star className="w-4 h-4" />
                <span><span className="font-semibold text-foreground">{totalStars.toLocaleString()}</span> stars earned</span>
              </div>
            </div>
          </aside>

          {/* ── Main ──────────────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 pt-4 pb-14">
            <ProfileTabs
              username={username}
              userRecipes={userRecipes}
              forkedRecipes={forkedRecipes}
              userCookbooks={userCookbooks}
              starredRecipes={starredRecipes}
              coverRecipes={coverRecipes}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
