"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ShoppingBasket, Bookmark } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { RecipeCardData } from "@/lib/types";

type PantryMatch = {
  pct: number;
  matched: number;
  total: number;
  recipe: RecipeCardData;
};

export function PantryCarousel() {
  const [matches, setMatches] = useState<PantryMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/pantry/matches")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: PantryMatch[]) => setMatches(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };

  // Don't render anything while loading or if no matches
  if (loading || matches.length === 0) return null;

  return (
    <section className="bg-yellow-subtle dark:bg-yellow-muted/20 border-y border-yellow-brand/20 py-8">
      <div className="max-w-[1280px] mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-yellow-brand/20 flex items-center justify-center">
              <ShoppingBasket className="w-4 h-4 text-yellow-brand" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground leading-tight">
                Cook from your pantry
              </h2>
              <p className="text-xs text-muted-foreground">
                Recipes you can make with ingredients you already have
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scroll("left")}
              className="w-7 h-7 rounded-full border border-border bg-card hover:bg-muted flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-7 h-7 rounded-full border border-border bg-card hover:bg-muted flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <Link
              href="/explore?tab=ingredients"
              className="ml-2 text-xs text-muted-foreground hover:text-yellow-brand flex items-center gap-1 transition-colors"
            >
              <Bookmark className="w-3 h-3" />
              Manage pantry
            </Link>
          </div>
        </div>

        {/* Scrollable carousel */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: "none" }}
        >
          {matches.map((item) => (
            <PantryCard key={item.recipe.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PantryCard({ item }: { item: PantryMatch }) {
  const { recipe, pct, matched, total } = item;
  const pctColor =
    pct === 100
      ? "bg-green-500 text-white"
      : pct >= 70
        ? "bg-yellow-brand text-[oklch(0.12_0_0)]"
        : "bg-muted text-muted-foreground";

  return (
    <Link
      href={`/${recipe.author.username}/${recipe.slug}`}
      className="group flex-shrink-0 w-56 snap-start rounded-xl border border-border bg-card hover:border-yellow-brand/60 hover:shadow-sm transition-all"
    >
      {/* Image */}
      <div className="relative h-32 rounded-t-xl overflow-hidden bg-muted">
        {recipe.imageUrl ? (
          <Image
            src={recipe.imageUrl}
            alt={recipe.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="224px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/20 text-3xl">
            🍳
          </div>
        )}
        {/* Match badge */}
        <span className={`absolute top-2 right-2 text-[11px] font-bold px-2 py-0.5 rounded-full ${pctColor}`}>
          {pct}%
        </span>
      </div>

      {/* Content */}
      <div className="p-3">
        <p className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-yellow-brand transition-colors">
          {recipe.name}
        </p>

        {/* Author */}
        <div className="flex items-center gap-1.5 mt-1.5">
          <Avatar className="h-4 w-4">
            <AvatarImage src={recipe.author.avatarUrl ?? undefined} />
            <AvatarFallback className="text-[8px] bg-yellow-light">
              {recipe.author.displayName[0]}
            </AvatarFallback>
          </Avatar>
          <span className="text-[11px] text-muted-foreground">{recipe.author.username}</span>
        </div>

        {/* Match bar */}
        <div className="mt-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted-foreground">{matched}/{total} ingredients</span>
          </div>
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                pct === 100 ? "bg-green-500" : pct >= 70 ? "bg-yellow-brand" : "bg-muted-foreground/40"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Tags */}
        {recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {recipe.tags.slice(0, 2).map((t) => (
              <Badge
                key={t.name}
                variant="secondary"
                className="text-[10px] px-1.5 py-0 h-4 bg-yellow-muted/60 text-foreground/60 border-0 font-normal"
              >
                {t.label}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
