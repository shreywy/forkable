"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { RecipeCard } from "@/components/RecipeCard";
import { Compass, Loader2 } from "lucide-react";
import type { RecipeCardData } from "@/lib/types";

interface Props {
  /** Recipes pre-loaded by the server (skip=3, take=9 by default) */
  initialRecipes: RecipeCardData[];
  /** The offset to start the next fetch from */
  initialSkip: number;
}

/** One skeleton card matching RecipeCard dimensions */
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden animate-pulse">
      <div className="h-48 bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-5/6" />
        <div className="flex gap-2 mt-4">
          <div className="h-5 w-16 bg-muted rounded-full" />
          <div className="h-5 w-12 bg-muted rounded-full" />
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE = 9;

export function DiscoverFeed({ initialRecipes, initialSkip }: Props) {
  const [recipes, setRecipes]   = useState<RecipeCardData[]>(initialRecipes);
  const [skip, setSkip]         = useState(initialSkip);
  const [hasMore, setHasMore]   = useState(true);
  const [loading, setLoading]   = useState(false);
  const sentinelRef             = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res  = await fetch(`/api/recipes/feed?skip=${skip}&take=${PAGE_SIZE}`);
      const data = await res.json() as { items: RecipeCardData[]; hasMore: boolean; nextSkip: number };
      setRecipes((prev) => [...prev, ...data.items]);
      setHasMore(data.hasMore);
      setSkip(data.nextSkip);
    } catch {
      // network failure — silently stop trying
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, skip]);

  // IntersectionObserver: fire loadMore when sentinel comes into view
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" }, // trigger 200px before sentinel is visible
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <section className="mt-14">
      {/* Section heading */}
      <div className="flex items-center gap-2 mb-4">
        <Compass className="w-4 h-4 text-yellow-brand" />
        <h2 className="text-base font-semibold text-foreground">Discover more</h2>
        <div className="flex-1 h-px bg-border ml-2" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}

        {/* Loading skeletons — 3 at a time to fill a row */}
        {loading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}
      </div>

      {/* Sentinel div — IntersectionObserver target */}
      <div ref={sentinelRef} className="h-1 mt-4" />

      {/* End-of-feed indicator */}
      {!hasMore && !loading && recipes.length > 0 && (
        <div className="mt-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="w-3.5 h-3.5 opacity-30" />
          You&apos;ve seen all {recipes.length} recipes. Try{" "}
          <Link href="/explore" className="text-yellow-brand hover:underline">
            Explore
          </Link>{" "}
          for filters &amp; search
        </div>
      )}
    </section>
  );
}
