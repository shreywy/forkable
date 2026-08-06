import Link from "next/link";
import {
  Star, GitFork, ChefHat, GitCommitHorizontal,
  Rss, BookOpen,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FollowButton } from "@/components/profile/FollowButton";

// ─── Types ────────────────────────────────────────────────────────────────────

type FeedActor = { username: string; displayName: string; avatarUrl: string | null };
type FeedRecipe = {
  id: string; slug: string; name: string; description: string;
  imageUrl: string | null; authorUsername: string; starCount: number; forkCount: number;
};
type FeedEvent = {
  id: string;
  sortDate: Date;
  type: "tweak" | "fork" | "taste-test" | "new-recipe";
  actor: FeedActor;
  recipe: FeedRecipe;
  message?: string | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelative(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "yesterday";
  if (diffD < 7) return `${diffD}d ago`;
  return `${Math.floor(diffD / 7)}w ago`;
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  fork: <GitFork className="w-3.5 h-3.5 text-blue-400" />,
  tweak: <GitCommitHorizontal className="w-3.5 h-3.5 text-muted-foreground" />,
  "taste-test": <ChefHat className="w-3.5 h-3.5 text-green-400" />,
  "new-recipe": <BookOpen className="w-3.5 h-3.5 text-yellow-brand" />,
};

const EVENT_LABEL: Record<string, string> = {
  fork: "forked",
  tweak: "tweaked",
  "taste-test": "left a taste test on",
  "new-recipe": "published",
};

// ─── Data fetching ────────────────────────────────────────────────────────────

const USER_SELECT = {
  username: true,
  displayName: true,
  avatarUrl: true,
} as const;

const RECIPE_AUTHOR_SELECT = {
  select: USER_SELECT,
} as const;

export default async function FeedPage() {
  const session = await auth();
  const currentUserId = session?.user?.id ?? null;

  // Determine which user IDs to filter by (following list)
  let followingIds: string[] | null = null;
  if (currentUserId) {
    const follows = await prisma.follow.findMany({
      where: { followerId: currentUserId },
      select: { followingId: true },
    });
    if (follows.length > 0) {
      followingIds = follows.map((f) => f.followingId);
    }
  }

  // Build optional author filter
  const authorFilter = followingIds ? { authorId: { in: followingIds } } : {};

  // ── 1. Tweaks (RecipeVersion) ──────────────────────────────────────────────
  const tweakRows = await prisma.recipeVersion.findMany({
    where: authorFilter,
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      author: { select: USER_SELECT },
      recipe: { include: { author: RECIPE_AUTHOR_SELECT } },
    },
  });

  const tweakEvents: FeedEvent[] = tweakRows.map((v) => ({
    id: `tweak-${v.id}`,
    sortDate: v.createdAt,
    type: "tweak",
    actor: v.author,
    recipe: {
      id: v.recipe.id,
      slug: v.recipe.slug,
      name: v.recipe.name,
      description: v.recipe.description,
      imageUrl: v.recipe.imageUrl,
      authorUsername: v.recipe.author.username,
      starCount: v.recipe.starCount,
      forkCount: v.recipe.forkCount,
    },
    message: v.message,
  }));

  // ── 2. Forks (Recipe with forkedFromId != null) ───────────────────────────
  const forkRows = await prisma.recipe.findMany({
    where: { ...authorFilter, NOT: { forkedFromId: null } },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      author: { select: USER_SELECT },
      forkedFrom: { include: { author: RECIPE_AUTHOR_SELECT } },
    },
  });

  const forkEvents: FeedEvent[] = forkRows
    .filter((r) => r.forkedFrom !== null)
    .map((r) => ({
      id: `fork-${r.id}`,
      sortDate: r.createdAt,
      type: "fork",
      actor: r.author,
      // Show the original recipe being forked, not the fork itself
      recipe: {
        id: r.forkedFrom!.id,
        slug: r.forkedFrom!.slug,
        name: r.forkedFrom!.name,
        description: r.forkedFrom!.description,
        imageUrl: r.forkedFrom!.imageUrl,
        authorUsername: r.forkedFrom!.author.username,
        starCount: r.forkedFrom!.starCount,
        forkCount: r.forkedFrom!.forkCount,
      },
    }));

  // ── 3. Taste Tests ────────────────────────────────────────────────────────
  const tasteTestRows = await prisma.tasteTest.findMany({
    where: authorFilter,
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      author: { select: USER_SELECT },
      recipe: { include: { author: RECIPE_AUTHOR_SELECT } },
    },
  });

  const tasteTestEvents: FeedEvent[] = tasteTestRows.map((t) => ({
    id: `taste-test-${t.id}`,
    sortDate: t.createdAt,
    type: "taste-test",
    actor: t.author,
    recipe: {
      id: t.recipe.id,
      slug: t.recipe.slug,
      name: t.recipe.name,
      description: t.recipe.description,
      imageUrl: t.recipe.imageUrl,
      authorUsername: t.recipe.author.username,
      starCount: t.recipe.starCount,
      forkCount: t.recipe.forkCount,
    },
    message: t.body ?? t.title,
  }));

  // ── 4. New Recipes ────────────────────────────────────────────────────────
  const newRecipeRows = await prisma.recipe.findMany({
    where: { ...authorFilter, forkedFromId: null, isPublic: true },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      author: { select: USER_SELECT },
    },
  });

  const newRecipeEvents: FeedEvent[] = newRecipeRows.map((r) => ({
    id: `new-recipe-${r.id}`,
    sortDate: r.createdAt,
    type: "new-recipe",
    actor: r.author,
    recipe: {
      id: r.id,
      slug: r.slug,
      name: r.name,
      description: r.description,
      imageUrl: r.imageUrl,
      authorUsername: r.author.username,
      starCount: r.starCount,
      forkCount: r.forkCount,
    },
  }));

  // ── Merge + sort all events ───────────────────────────────────────────────
  const allEvents: FeedEvent[] = [
    ...tweakEvents,
    ...forkEvents,
    ...tasteTestEvents,
    ...newRecipeEvents,
  ]
    .sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime())
    .slice(0, 10);

  // ── Sidebar: trending today ───────────────────────────────────────────────
  const trendingRecipes = await prisma.recipe.findMany({
    where: { isPublic: true },
    orderBy: { starCount: "desc" },
    take: 3,
    include: { author: { select: USER_SELECT } },
  });

  // ── Sidebar: who to follow ────────────────────────────────────────────────
  const alreadyFollowingIds = followingIds ?? [];
  const excludeIds = currentUserId
    ? [currentUserId, ...alreadyFollowingIds]
    : alreadyFollowingIds;

  const suggestions = await prisma.user.findMany({
    where: excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {},
    orderBy: { recipes: { _count: "desc" } },
    take: 2,
    select: USER_SELECT,
  });

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1080px] mx-auto px-4 py-10">
        <div className="flex gap-8">
          {/* ── Feed ──────────────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-6">
              <Rss className="w-5 h-5 text-yellow-brand" />
              <h1 className="text-xl font-bold text-foreground">Your feed</h1>
            </div>

            {allEvents.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground text-sm">
                Nothing in your feed yet - follow some cooks to see their activity here.
              </div>
            ) : (
              <div className="space-y-3">
                {allEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-xl border border-border bg-card overflow-hidden"
                  >
                    {/* Event header */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60 bg-muted/20">
                      <span className="shrink-0">{EVENT_ICONS[event.type]}</span>
                      <div className="flex items-center gap-2 flex-1 min-w-0 text-xs text-muted-foreground">
                        <Link href={`/${event.actor.username}`}>
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={event.actor.avatarUrl ?? undefined} />
                            <AvatarFallback className="text-[9px] bg-yellow-light">
                              {event.actor.displayName[0]}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <Link
                          href={`/${event.actor.username}`}
                          className="font-medium text-foreground hover:text-yellow-brand transition-colors"
                        >
                          {event.actor.displayName}
                        </Link>
                        <span>{EVENT_LABEL[event.type]}</span>
                        <Link
                          href={`/${event.recipe.authorUsername}/${event.recipe.slug}`}
                          className="font-medium text-foreground hover:text-yellow-brand transition-colors truncate"
                        >
                          {event.recipe.name}
                        </Link>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatRelative(event.sortDate)}
                      </span>
                    </div>

                    {/* Recipe preview */}
                    <Link
                      href={`/${event.recipe.authorUsername}/${event.recipe.slug}`}
                      className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors group"
                    >
                      <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={event.recipe.imageUrl ?? ""}
                          alt={event.recipe.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground group-hover:text-yellow-brand transition-colors truncate">
                          {event.recipe.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {event.recipe.description}
                        </p>
                        {event.message && (
                          <p className="mt-1.5 text-xs text-foreground/70 italic bg-muted rounded px-2 py-1 line-clamp-1">
                            &ldquo;{event.message}&rdquo;
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {event.recipe.starCount.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitFork className="w-3 h-3" />
                          {event.recipe.forkCount}
                        </span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Sidebar ───────────────────────────────────────────────────────── */}
          <aside className="w-72 shrink-0 hidden lg:block space-y-6">
            {/* Who to follow */}
            {suggestions.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">Who to follow</p>
                <div className="space-y-3">
                  {suggestions.map((u) => (
                    <div
                      key={u.username}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card"
                    >
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={u.avatarUrl ?? undefined} />
                        <AvatarFallback className="bg-yellow-light text-xs font-bold">
                          {u.displayName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/${u.username}`}
                          className="text-sm font-medium text-foreground hover:text-yellow-brand transition-colors block truncate"
                        >
                          {u.displayName}
                        </Link>
                        <p className="text-xs text-muted-foreground">@{u.username}</p>
                      </div>
                      <FollowButton username={u.username} compact />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending today */}
            {trendingRecipes.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">Trending today</p>
                <div className="space-y-3">
                  {trendingRecipes.map((r) => (
                    <Link
                      key={r.id}
                      href={`/${r.author.username}/${r.slug}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={r.imageUrl ?? ""}
                          alt={r.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground group-hover:text-yellow-brand transition-colors line-clamp-1">
                          {r.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          by {r.author.username} · ⭐ {r.starCount.toLocaleString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  href="/trending"
                  className="mt-3 block text-xs text-yellow-brand hover:underline"
                >
                  See all trending →
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
