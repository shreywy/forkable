import Link from "next/link";
import {
  Star, GitFork, ChefHat, GitCommitHorizontal,
  Rss, BookOpen, UserPlus,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MOCK_RECIPES, MOCK_USERS } from "@/lib/mock-data";
import { RecipeCard } from "@/components/RecipeCard";

// Mock feed events — in Phase 2 generated from followers' activity
const FEED_EVENTS = [
  {
    id: "e1",
    type: "star" as const,
    actor: MOCK_USERS.nonna_rosa,
    recipe: MOCK_RECIPES.find((r) => r.slug === "tonkotsu-ramen")!,
    time: "2m ago",
  },
  {
    id: "e2",
    type: "fork" as const,
    actor: MOCK_USERS.vegan_vivienne,
    recipe: MOCK_RECIPES.find((r) => r.slug === "moms-lasagna")!,
    time: "1h ago",
  },
  {
    id: "e3",
    type: "tweak" as const,
    actor: MOCK_USERS.kenji_tokyo,
    recipe: MOCK_RECIPES.find((r) => r.slug === "tahini-chocolate-chip-cookies")!,
    time: "3h ago",
    message: "Reduced oven temp to 350°F for a chewier cookie",
  },
  {
    id: "e4",
    type: "taste-test" as const,
    actor: MOCK_USERS.nonna_rosa,
    recipe: MOCK_RECIPES.find((r) => r.slug === "green-goddess-pasta")!,
    time: "5h ago",
    message: "Suggest adding toasted pine nuts for texture",
  },
  {
    id: "e5",
    type: "new-recipe" as const,
    actor: MOCK_USERS.vegan_vivienne,
    recipe: MOCK_RECIPES.find((r) => r.slug === "thai-green-curry")!,
    time: "1d ago",
  },
  {
    id: "e6",
    type: "tweak" as const,
    actor: MOCK_USERS.kenji_tokyo,
    recipe: MOCK_RECIPES.find((r) => r.slug === "tonkotsu-ramen")!,
    time: "1d ago",
    message: "Add 1 tsp white pepper to tare for more depth",
  },
  {
    id: "e7",
    type: "fork" as const,
    actor: MOCK_USERS.nonna_rosa,
    recipe: MOCK_RECIPES.find((r) => r.slug === "miso-banana-bread")!,
    time: "2d ago",
  },
];

const EVENT_ICONS: Record<string, React.ReactNode> = {
  star: <Star className="w-3.5 h-3.5 text-yellow-brand fill-yellow-brand/30" />,
  fork: <GitFork className="w-3.5 h-3.5 text-blue-400" />,
  tweak: <GitCommitHorizontal className="w-3.5 h-3.5 text-muted-foreground" />,
  "taste-test": <ChefHat className="w-3.5 h-3.5 text-green-400" />,
  "new-recipe": <BookOpen className="w-3.5 h-3.5 text-yellow-brand" />,
};

const EVENT_LABEL: Record<string, string> = {
  star: "starred",
  fork: "forked",
  tweak: "tweaked",
  "taste-test": "left a taste test on",
  "new-recipe": "published",
};

// Suggestions: who to follow
const SUGGESTIONS = [MOCK_USERS.kenji_tokyo, MOCK_USERS.gluten_free_gary];

export default function FeedPage() {
  const recentRecipes = MOCK_RECIPES.filter(
    (r) => r.owner.username !== "shrey",
  ).slice(0, 3);

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

            <div className="space-y-3">
              {FEED_EVENTS.map((event) => {
                if (!event.recipe) return null;
                return (
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
                            <AvatarImage src={event.actor.avatarUrl} />
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
                          href={`/${event.recipe.owner.username}/${event.recipe.slug}`}
                          className="font-medium text-foreground hover:text-yellow-brand transition-colors truncate"
                        >
                          {event.recipe.name}
                        </Link>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">{event.time}</span>
                    </div>

                    {/* Recipe preview */}
                    <Link
                      href={`/${event.recipe.owner.username}/${event.recipe.slug}`}
                      className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors group"
                    >
                      <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={event.recipe.imageUrl}
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
                          {event.recipe.stars.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitFork className="w-3 h-3" />
                          {event.recipe.forks}
                        </span>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Sidebar ───────────────────────────────────────────────────────── */}
          <aside className="w-72 shrink-0 hidden lg:block space-y-6">
            {/* Who to follow */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">Who to follow</p>
              <div className="space-y-3">
                {SUGGESTIONS.map((u) => (
                  <div
                    key={u.username}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card"
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={u.avatarUrl} />
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
                    <button className="shrink-0 h-7 px-3 rounded-lg bg-yellow-brand hover:bg-yellow-hover text-[oklch(0.12_0_0)] text-xs font-medium transition-colors flex items-center gap-1">
                      <UserPlus className="w-3 h-3" />
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending today */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">Trending today</p>
              <div className="space-y-3">
                {recentRecipes.map((r) => (
                  <Link
                    key={r.id}
                    href={`/${r.owner.username}/${r.slug}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground group-hover:text-yellow-brand transition-colors line-clamp-1">
                        {r.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        by {r.owner.username} · ⭐ {r.stars.toLocaleString()}
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
          </aside>
        </div>
      </div>
    </div>
  );
}
