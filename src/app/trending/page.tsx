"use client";

import { useState } from "react";
import { RecipeCard } from "@/components/RecipeCard";
import { MOCK_RECIPES, MOCK_USERS, toCardData } from "@/lib/mock-data";
import { TrendingUp, GitFork, Star, ChefHat, Flame } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TIME_FILTERS = ["Today", "This week", "This month", "All time"] as const;
type TimeFilter = (typeof TIME_FILTERS)[number];

// For Phase 1 UI, filters just re-rank mock data slightly to look different
function getMultiplier(filter: TimeFilter, i: number): number {
  const offsets: Record<TimeFilter, number[]> = {
    "Today":      [0, 2, 1, 3, 4],
    "This week":  [0, 1, 2, 3, 4],
    "This month": [1, 0, 2, 4, 3],
    "All time":   [2, 0, 1, 3, 4],
  };
  return offsets[filter][i] ?? i;
}

export default function TrendingPage() {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>("This week");

  // Re-order recipes per filter for visual variety
  const byStars  = [...MOCK_RECIPES].sort((a, b) => b.stars  - a.stars);
  const byForks  = [...MOCK_RECIPES].sort((a, b) => b.forks  - a.forks);
  const byTweaks = [...MOCK_RECIPES].sort((a, b) => b.tweaks - a.tweaks);

  // Rotate "hot right now" order based on filter
  const hotOrder = activeFilter === "Today"
    ? [2, 0, 3, 1, 4, 5]
    : activeFilter === "This month"
    ? [3, 1, 0, 4, 2, 5]
    : activeFilter === "All time"
    ? [4, 3, 2, 1, 0, 5]
    : [0, 1, 2, 3, 4, 5];

  const hotNow = hotOrder
    .map((i) => MOCK_RECIPES[i])
    .filter(Boolean)
    .slice(0, 6);

  // Label variation by filter
  const starLabel = activeFilter === "Today" ? "stars today" :
                    activeFilter === "This week" ? "stars this week" :
                    activeFilter === "This month" ? "stars this month" : "stars";

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="border-b border-border bg-card">
        <div className="max-w-[1280px] mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-1">
            <TrendingUp className="w-5 h-5 text-yellow-brand" />
            <h1 className="text-2xl font-bold text-foreground">Trending</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            The most-starred, most-forked, and most-tweaked recipes right now.
          </p>

          {/* Time filter */}
          <div className="mt-5 flex gap-2 flex-wrap">
            {TIME_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  f === activeFilter
                    ? "bg-yellow-brand border-yellow-brand text-[oklch(0.12_0_0)]"
                    : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 py-8 space-y-14">
        {/* ── Hot right now ─────────────────────────────────────────────────── */}
        <section>
          <LeaderboardHeading
            icon={<Flame className="w-4 h-4 text-yellow-brand" />}
            title={`Hot right now · ${activeFilter.toLowerCase()}`}
          />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotNow.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={toCardData(recipe)} />
            ))}
          </div>
        </section>

        {/* ── Top starred ───────────────────────────────────────────────────── */}
        <section>
          <LeaderboardHeading icon={<Star className="w-4 h-4 text-yellow-brand" />} title="Most starred" />
          <div className="mt-4 space-y-2">
            {byStars.slice(0, 5).map((recipe, i) => (
              <LeaderboardRow
                key={recipe.id}
                rank={i + 1}
                recipe={recipe}
                metric={`${recipe.stars.toLocaleString()} ${starLabel}`}
              />
            ))}
          </div>
        </section>

        {/* ── Most forked ───────────────────────────────────────────────────── */}
        <section>
          <LeaderboardHeading icon={<GitFork className="w-4 h-4 text-yellow-brand" />} title="Most forked" />
          <div className="mt-4 space-y-2">
            {byForks.slice(0, 5).map((recipe, i) => (
              <LeaderboardRow key={recipe.id} rank={i + 1} recipe={recipe} metric={`${recipe.forks} forks`} />
            ))}
          </div>
        </section>

        {/* ── Most tweaked ──────────────────────────────────────────────────── */}
        <section>
          <LeaderboardHeading icon={<ChefHat className="w-4 h-4 text-yellow-brand" />} title="Most active (tweaks)" />
          <div className="mt-4 space-y-2">
            {byTweaks.slice(0, 5).map((recipe, i) => (
              <LeaderboardRow key={recipe.id} rank={i + 1} recipe={recipe} metric={`${recipe.tweaks} tweaks`} />
            ))}
          </div>
        </section>

        {/* ── Rising cooks ──────────────────────────────────────────────────── */}
        <section>
          <LeaderboardHeading
            icon={<TrendingUp className="w-4 h-4 text-yellow-brand" />}
            title="Rising cooks"
          />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(MOCK_USERS).slice(0, 3).map((user) => (
              <Link
                key={user.username}
                href={`/${user.username}`}
                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-yellow-brand transition-all group"
              >
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                  <AvatarFallback className="bg-yellow-light text-sm font-bold">
                    {user.displayName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover:text-yellow-brand transition-colors truncate">
                    {user.displayName}
                  </p>
                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span>{user.recipeCount} recipes</span>
                    <span>·</span>
                    <span>{user.followers.toLocaleString()} followers</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function LeaderboardHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <div className="flex-1 h-px bg-border ml-1" />
    </div>
  );
}

function LeaderboardRow({
  rank,
  recipe,
  metric,
}: {
  rank: number;
  recipe: (typeof MOCK_RECIPES)[0];
  metric: string;
}) {
  return (
    <Link
      href={`/${recipe.owner.username}/${recipe.slug}`}
      className="flex items-center gap-4 px-4 py-3 rounded-xl border border-border bg-card hover:border-yellow-brand hover:bg-yellow-subtle dark:hover:bg-muted transition-all group"
    >
      {/* Rank */}
      <span className={`shrink-0 w-7 text-center text-sm font-bold ${rank <= 3 ? "text-yellow-brand" : "text-muted-foreground"}`}>
        {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`}
      </span>

      {/* Thumbnail */}
      <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate group-hover:text-yellow-brand transition-colors">
          {recipe.name}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Avatar className="h-4 w-4">
            <AvatarImage src={recipe.owner.avatarUrl} />
            <AvatarFallback className="text-[8px] bg-yellow-light">{recipe.owner.displayName[0]}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">{recipe.owner.username}</span>
        </div>
      </div>

      {/* Metric */}
      <span className="shrink-0 text-sm font-semibold text-yellow-brand">{metric}</span>
    </Link>
  );
}
