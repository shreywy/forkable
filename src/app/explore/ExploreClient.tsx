"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { RecipeCard } from "@/components/RecipeCard";
import type { RecipeCardData } from "@/lib/types";
import {
  Search, SlidersHorizontal, Flame, Leaf, Cake,
  Coffee, Globe, Soup, Beef, Fish, Library, Users,
  GitFork, Star, X, Package, FlaskConical,
  ShoppingCart, CheckCircle2, AlertCircle, CircleDot,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ExploreRecipe = RecipeCardData & { ingredientNames: string[] };

export type ExploreCookbook = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  owner: { username: string; displayName: string; avatarUrl: string | null };
  recipeCount: number;
  coverImageUrl: string | null;
};

export type ExploreCook = {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  recipeCount: number;
  followerCount: number;
  totalStars: number;
};

interface ExploreClientProps {
  recipes: ExploreRecipe[];
  cookbooks: ExploreCookbook[];
  featuredCooks: ExploreCook[];
  allIngredients: { name: string }[];
}

// ── Tag definitions ────────────────────────────────────────────────────────────

const TAGS = [
  { label: "Vegan",     slug: "vegan",     icon: <Leaf className="w-3.5 h-3.5" /> },
  { label: "Baking",    slug: "baking",    icon: <Cake className="w-3.5 h-3.5" /> },
  { label: "Quick",     slug: "quick",     icon: <Flame className="w-3.5 h-3.5" /> },
  { label: "Breakfast", slug: "breakfast", icon: <Coffee className="w-3.5 h-3.5" /> },
  { label: "Soups",     slug: "soups",     icon: <Soup className="w-3.5 h-3.5" /> },
  { label: "Asian",     slug: "asian",     icon: <Fish className="w-3.5 h-3.5" /> },
  { label: "BBQ",       slug: "bbq",       icon: <Beef className="w-3.5 h-3.5" /> },
  { label: "World",     slug: "world",     icon: <Globe className="w-3.5 h-3.5" /> },
];

const SORT_OPTIONS = ["Most starred", "Most forked", "Most recent", "Most tweaked"];
const DIET_OPTIONS = ["Vegan", "Vegetarian", "Gluten-free", "Dairy-free", "Nut-free"];

type ExploreTab = "recipes" | "ingredients";

export function ExploreClient({ recipes, cookbooks, featuredCooks, allIngredients }: ExploreClientProps) {
  const searchParams = useSearchParams();
  const [exploreTab, setExploreTab] = useState<ExploreTab>("recipes");

  const [includedTags, setIncludedTags] = useState<Set<string>>(new Set());
  const [excludedTags, setExcludedTags] = useState<Set<string>>(new Set());

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setQuery(q);
  }, [searchParams]);

  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0]);
  const [selectedDiets, setSelectedDiets] = useState<Set<string>>(new Set());

  const [ingredientQuery, setIngredientQuery] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());

  // ── Tag click handlers ─────────────────────────────────────────────────────
  const handleTagClick = (slug: string) => {
    setIncludedTags((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
        setExcludedTags((ex) => { const n = new Set(ex); n.delete(slug); return n; });
      }
      return next;
    });
  };

  const handleTagDoubleClick = (slug: string) => {
    setExcludedTags((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
        setIncludedTags((inc) => { const n = new Set(inc); n.delete(slug); return n; });
      }
      return next;
    });
  };

  const clearAllTags = () => { setIncludedTags(new Set()); setExcludedTags(new Set()); };

  // ── Filtered recipes ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...recipes];

    if (includedTags.size > 0) {
      list = list.filter((r) =>
        [...includedTags].every((t) => r.tags.some((rt) => rt.name === t)),
      );
    }
    if (excludedTags.size > 0) {
      list = list.filter((r) =>
        ![...excludedTags].some((t) => r.tags.some((rt) => rt.name === t)),
      );
    }
    if (selectedDiets.size > 0) {
      list = list.filter((r) =>
        [...selectedDiets].every((d) =>
          r.tags.some((rt) => rt.name.toLowerCase() === d.toLowerCase()),
        ),
      );
    }

    if (sortBy === "Most starred")  list.sort((a, b) => b.starCount - a.starCount);
    if (sortBy === "Most forked")   list.sort((a, b) => b.forkCount - a.forkCount);
    if (sortBy === "Most tweaked")  list.sort((a, b) => b.tweakCount - a.tweakCount);
    if (sortBy === "Most recent")   list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return list;
  }, [recipes, includedTags, excludedTags, selectedDiets, sortBy]);

  // ── Dynamic search results ─────────────────────────────────────────────────
  const q = query.trim().toLowerCase();
  const directMatches = q
    ? filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.slug.toLowerCase().includes(q) ||
          r.author.username.toLowerCase().includes(q),
      )
    : filtered;

  const indirectMatches = q
    ? filtered.filter(
        (r) =>
          !directMatches.includes(r) &&
          (r.description.toLowerCase().includes(q) ||
            r.tags.some((rt) => rt.name.toLowerCase().includes(q) || rt.label.toLowerCase().includes(q))),
      )
    : [];

  // ── Ingredient catalog filtered ────────────────────────────────────────────
  const iq = ingredientQuery.trim().toLowerCase();

  // Count how many recipes each ingredient appears in
  const ingredientRecipeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of recipes) {
      for (const ing of r.ingredientNames) {
        const key = ing.toLowerCase();
        counts[key] = (counts[key] ?? 0) + 1;
      }
    }
    return counts;
  }, [recipes]);

  const filteredIngredients = useMemo(() => {
    const base = iq
      ? allIngredients.filter((i) => i.name.toLowerCase().includes(iq))
      : allIngredients;
    return [...base].sort((a, b) => {
      const aSelected = selectedIngredients.has(a.name.toLowerCase());
      const bSelected = selectedIngredients.has(b.name.toLowerCase());
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      // When no search, sort by recipe count (most-used first) for discoverability
      if (!iq) {
        const aCount = ingredientRecipeCounts[a.name.toLowerCase()] ?? 0;
        const bCount = ingredientRecipeCounts[b.name.toLowerCase()] ?? 0;
        if (bCount !== aCount) return bCount - aCount;
      }
      return a.name.localeCompare(b.name);
    });
  }, [iq, allIngredients, selectedIngredients, ingredientRecipeCounts]);

  const recipeMatches = useMemo(() => {
    if (selectedIngredients.size === 0) return [];
    return recipes.map((recipe) => {
      const total = recipe.ingredientNames.length;
      const matched = recipe.ingredientNames.filter((ing) =>
        [...selectedIngredients].some((sel) => {
          const s = sel.toLowerCase();
          const r = ing.toLowerCase();
          return (
            r.includes(s) ||
            s.includes(r) ||
            r.split(" ").some((w) => w.length > 3 && s.includes(w))
          );
        })
      );
      const missing = recipe.ingredientNames.filter((ing) => !matched.includes(ing));
      const pct = total > 0 ? Math.round((matched.length / total) * 100) : 0;
      return { recipe, matched: matched.length, total, pct, missing };
    })
      .filter((r) => r.pct > 0)
      .sort((a, b) => b.pct - a.pct);
  }, [recipes, selectedIngredients]);

  const activeFilters = includedTags.size + excludedTags.size + selectedDiets.size;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="border-b border-border bg-card">
        <div className="max-w-[1280px] mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">Explore</h1>
          <p className="text-sm text-muted-foreground">
            Discover recipes, cooks, and cookbooks from the community.
          </p>

          <div className="mt-5 flex gap-0 border-b border-border -mb-8">
            <button
              onClick={() => setExploreTab("recipes")}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm border-b-2 transition-colors -mb-px ${
                exploreTab === "recipes"
                  ? "border-yellow-brand text-foreground font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Recipes
            </button>
            <button
              onClick={() => setExploreTab("ingredients")}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm border-b-2 transition-colors -mb-px ${
                exploreTab === "ingredients"
                  ? "border-yellow-brand text-foreground font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              Ingredient Catalog
            </button>
          </div>
        </div>
      </div>

      {/* ── RECIPES TAB ───────────────────────────────────────────────────────── */}
      {exploreTab === "recipes" && (
        <div className="max-w-[1280px] mx-auto px-4 pt-8">
          {/* Search + filter bar */}
          <div className="flex gap-3 flex-wrap mb-4">
            <div className="relative flex-1 min-w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search recipes, cooks, or cookbooks…"
                className="w-full h-9 pl-9 pr-4 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-yellow-brand placeholder:text-muted-foreground"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`inline-flex items-center gap-2 h-9 px-3 rounded-lg border text-sm transition-colors ${
                showFilters || activeFilters > 0
                  ? "border-yellow-brand bg-yellow-subtle dark:bg-yellow-muted text-foreground"
                  : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
              {activeFilters > 0 && (
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-yellow-brand text-[oklch(0.12_0_0)] text-[10px] font-bold">
                  {activeFilters}
                </span>
              )}
            </button>
          </div>

          {/* Tag pills */}
          <div className="flex gap-2 flex-wrap mb-2">
            {TAGS.map((tag) => {
              const included = includedTags.has(tag.slug);
              const excluded = excludedTags.has(tag.slug);
              return (
                <button
                  key={tag.slug}
                  onClick={() => handleTagClick(tag.slug)}
                  onDoubleClick={() => handleTagDoubleClick(tag.slug)}
                  title="Click to include · Double-click to exclude"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors select-none ${
                    included
                      ? "bg-yellow-brand border-yellow-brand text-[oklch(0.12_0_0)]"
                      : excluded
                        ? "bg-red-500/10 border-red-500/40 text-red-500"
                        : "border-border bg-background text-muted-foreground hover:border-yellow-brand/50 hover:text-foreground"
                  }`}
                >
                  {tag.icon}
                  {tag.label}
                  {excluded && <X className="w-3 h-3 ml-0.5" />}
                </button>
              );
            })}
            {(includedTags.size > 0 || excludedTags.size > 0) && (
              <button
                onClick={clearAllTags}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs text-muted-foreground hover:text-foreground border border-border/50 hover:border-border transition-colors"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mb-4">
            Click to include · Double-click to exclude
          </p>

          {/* ── Filters panel ─────────────────────────────────────────────── */}
          {showFilters && (
            <div className="mb-6 p-4 rounded-xl border border-border bg-card space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Filters</p>
                <button
                  onClick={() => { setSelectedDiets(new Set()); setSortBy(SORT_OPTIONS[0]); clearAllTags(); }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Reset all
                </button>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Sort by</p>
                <div className="flex gap-2 flex-wrap">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSortBy(opt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        sortBy === opt
                          ? "bg-yellow-brand border-yellow-brand text-[oklch(0.12_0_0)]"
                          : "border-border bg-background text-muted-foreground hover:text-foreground hover:border-yellow-brand/40"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Dietary</p>
                <div className="flex gap-2 flex-wrap">
                  {DIET_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() =>
                        setSelectedDiets((prev) => {
                          const next = new Set(prev);
                          if (next.has(opt)) next.delete(opt);
                          else next.add(opt);
                          return next;
                        })
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        selectedDiets.has(opt)
                          ? "bg-yellow-brand border-yellow-brand text-[oklch(0.12_0_0)]"
                          : "border-border bg-background text-muted-foreground hover:text-foreground hover:border-yellow-brand/40"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="pb-14 space-y-12">
            {q ? (
              <>
                <section>
                  <SectionHeading title={`Results for "${query}"`} count={directMatches.length} />
                  {directMatches.length > 0 ? (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {directMatches.map((r) => <RecipeCard key={r.id} recipe={r} />)}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-muted-foreground">No direct matches found.</p>
                  )}
                </section>

                {indirectMatches.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <FlaskConical className="w-4 h-4 text-muted-foreground" />
                      <h2 className="text-base font-semibold text-foreground">
                        Recipes containing &ldquo;{query}&rdquo;
                      </h2>
                      <span className="px-1.5 py-0.5 rounded-full bg-muted text-[11px] text-muted-foreground">
                        {indirectMatches.length}
                      </span>
                      <div className="flex-1 h-px bg-border ml-1" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {indirectMatches.map((r) => <RecipeCard key={r.id} recipe={r} />)}
                    </div>
                  </section>
                )}
              </>
            ) : (
              <>
                {/* ── All recipes ─────────────────────────────────────────── */}
                <section>
                  <SectionHeading title="All recipes" count={directMatches.length} />
                  {directMatches.length > 0 ? (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {directMatches.map((r) => <RecipeCard key={r.id} recipe={r} />)}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-muted-foreground">
                      No recipes match the selected filters.{" "}
                      <button onClick={clearAllTags} className="text-yellow-brand hover:underline">
                        Clear filters
                      </button>
                    </p>
                  )}
                </section>

                {/* ── Cookbooks ───────────────────────────────────────────── */}
                {cookbooks.length > 0 && (
                  <section>
                    <SectionHeading
                      title="Cookbooks"
                      icon={<Library className="w-4 h-4 text-yellow-brand" />}
                      count={cookbooks.length}
                    />
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {cookbooks.map((cb) => (
                        <Link
                          key={cb.id}
                          href={`/${cb.owner.username}/cookbooks/${cb.slug}`}
                          className="group rounded-xl border border-border bg-card overflow-hidden hover:border-yellow-brand transition-all"
                        >
                          <div className="h-28 bg-muted overflow-hidden">
                            {cb.coverImageUrl && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={cb.coverImageUrl}
                                alt={cb.name}
                                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                              />
                            )}
                          </div>
                          <div className="p-3">
                            <p className="text-sm font-semibold text-foreground truncate">{cb.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">{cb.description}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <Avatar className="h-4 w-4">
                                <AvatarImage src={cb.owner.avatarUrl ?? undefined} />
                                <AvatarFallback className="text-[8px] bg-yellow-light">{cb.owner.displayName[0]}</AvatarFallback>
                              </Avatar>
                              <span className="text-[11px] text-muted-foreground">{cb.owner.username}</span>
                              <span className="ml-auto text-[11px] text-muted-foreground">{cb.recipeCount} recipes</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {/* ── Featured cooks ──────────────────────────────────────── */}
                {featuredCooks.length > 0 && (
                  <section>
                    <SectionHeading
                      title="Cooks to follow"
                      icon={<Users className="w-4 h-4 text-yellow-brand" />}
                    />
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {featuredCooks.map((cook) => (
                        <Link
                          key={cook.username}
                          href={`/${cook.username}`}
                          className="flex flex-col items-center text-center p-5 rounded-xl border border-border bg-card hover:border-yellow-brand hover:bg-yellow-subtle dark:hover:bg-muted transition-all group"
                        >
                          <Avatar className="h-14 w-14 mb-3">
                            <AvatarImage src={cook.avatarUrl ?? undefined} />
                            <AvatarFallback className="text-lg bg-yellow-light">{cook.displayName[0]}</AvatarFallback>
                          </Avatar>
                          <p className="text-sm font-semibold text-foreground group-hover:text-yellow-brand transition-colors">{cook.displayName}</p>
                          <p className="text-xs text-muted-foreground">@{cook.username}</p>
                          {cook.bio && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{cook.bio}</p>}
                          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Star className="w-3 h-3" />{cook.totalStars.toLocaleString()}</span>
                            <span className="flex items-center gap-1"><GitFork className="w-3 h-3" />{cook.recipeCount}</span>
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{cook.followerCount.toLocaleString()}</span>
                          </div>
                          <button className="mt-3 w-full h-7 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:border-yellow-brand hover:text-foreground transition-colors">
                            Follow
                          </button>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── INGREDIENT CATALOG TAB ────────────────────────────────────────────── */}
      {exploreTab === "ingredients" && (
        <div className="max-w-[1280px] mx-auto px-4 pt-8 pb-14">
          <div className="mb-6 p-4 rounded-xl border border-yellow-brand/20 bg-yellow-subtle dark:bg-yellow-muted/30 flex items-start gap-3">
            <ShoppingCart className="w-5 h-5 text-yellow-brand shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">What&apos;s in your fridge?</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Select ingredients you have on hand - we&apos;ll rank every recipe by how many you already own.
                Spot recipes that need just 1–2 more things to buy.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            {/* ── Left: ingredient browser ──────────────────────────────── */}
            <div className="w-72 shrink-0">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={ingredientQuery}
                  onChange={(e) => setIngredientQuery(e.target.value)}
                  placeholder="Search ingredients…"
                  className="w-full h-9 pl-9 pr-8 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-yellow-brand placeholder:text-muted-foreground"
                />
                {ingredientQuery && (
                  <button
                    onClick={() => setIngredientQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {selectedIngredients.size > 0 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      In your fridge ({selectedIngredients.size})
                    </span>
                    <button
                      onClick={() => setSelectedIngredients(new Set())}
                      className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" /> Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[...selectedIngredients].sort().map((ing) => (
                      <span
                        key={ing}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-brand text-[oklch(0.12_0_0)] text-[11px] font-medium"
                      >
                        {ing}
                        <button
                          onClick={() =>
                            setSelectedIngredients((prev) => {
                              const next = new Set(prev);
                              next.delete(ing);
                              return next;
                            })
                          }
                          className="ml-0.5 opacity-70 hover:opacity-100"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="border border-border rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/40 border-b border-border">
                  <Package className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">ingredient-catalog/</span>
                  <span className="ml-auto text-[11px] text-muted-foreground" title="Number of recipes using each ingredient">
                    {filteredIngredients.length} · # recipes
                  </span>
                </div>
                <div className="divide-y divide-border max-h-[520px] overflow-y-auto">
                  {filteredIngredients.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                      No ingredients match &ldquo;{ingredientQuery}&rdquo;
                    </div>
                  ) : (
                    filteredIngredients.map((ing) => {
                      const isSelected = selectedIngredients.has(ing.name.toLowerCase());
                      const recipeCount = ingredientRecipeCounts[ing.name.toLowerCase()] ?? 0;
                      return (
                        <button
                          key={ing.name}
                          onClick={() =>
                            setSelectedIngredients((prev) => {
                              const next = new Set(prev);
                              const key = ing.name.toLowerCase();
                              if (next.has(key)) next.delete(key);
                              else next.add(key);
                              return next;
                            })
                          }
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors ${
                            isSelected
                              ? "bg-yellow-subtle dark:bg-yellow-muted/40"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? "bg-yellow-brand border-yellow-brand"
                              : "border-border bg-background"
                          }`}>
                            {isSelected && (
                              <svg className="w-2.5 h-2.5 text-[oklch(0.12_0_0)]" viewBox="0 0 10 10" fill="none">
                                <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </span>
                          <span className={`flex-1 text-sm ${isSelected ? "text-yellow-brand font-medium" : "text-foreground"}`}>
                            {ing.name}
                          </span>
                          {recipeCount > 0 && (
                            <span className={`text-[10px] tabular-nums shrink-0 ${isSelected ? "text-yellow-brand/70" : "text-muted-foreground/60"}`}>
                              {recipeCount}
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* ── Right: ranked recipe results ──────────────────────────── */}
            <div className="flex-1 min-w-0">
              {selectedIngredients.size === 0 ? (
                <div className="h-full flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 px-8 text-center">
                  <ShoppingCart className="w-10 h-10 text-muted-foreground/20 mb-4" />
                  <p className="text-sm font-medium text-foreground mb-1">Your ingredient list is empty</p>
                  <p className="text-xs text-muted-foreground max-xs leading-relaxed">
                    Tick ingredients on the left to see which recipes you can cook right now.
                  </p>
                </div>
              ) : recipeMatches.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-10 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No recipes match any of your ingredients.</p>
                  <button
                    onClick={() => setSelectedIngredients(new Set())}
                    className="mt-2 text-xs text-yellow-brand hover:underline"
                  >
                    Clear selection
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {recipeMatches.filter((m) => m.pct === 100).length > 0 && (
                    <section>
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <h3 className="text-sm font-semibold text-foreground">Perfect match</h3>
                        <span className="px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-[11px] font-medium">
                          {recipeMatches.filter((m) => m.pct === 100).length}
                        </span>
                        <div className="flex-1 h-px bg-border ml-1" />
                      </div>
                      <div className="space-y-3">
                        {recipeMatches.filter((m) => m.pct === 100).map((item) => (
                          <IngredientRecipeCard key={item.recipe.id} item={item} tier="perfect" />
                        ))}
                      </div>
                    </section>
                  )}

                  {recipeMatches.filter((m) => m.pct >= 70 && m.pct < 100).length > 0 && (
                    <section>
                      <div className="flex items-center gap-2 mb-3">
                        <CircleDot className="w-4 h-4 text-yellow-brand" />
                        <h3 className="text-sm font-semibold text-foreground">Almost there</h3>
                        <span className="px-1.5 py-0.5 rounded-full bg-yellow-brand/10 text-yellow-brand text-[11px] font-medium">
                          {recipeMatches.filter((m) => m.pct >= 70 && m.pct < 100).length}
                        </span>
                        <span className="text-[11px] text-muted-foreground">≥ 70% match</span>
                        <div className="flex-1 h-px bg-border ml-1" />
                      </div>
                      <div className="space-y-3">
                        {recipeMatches.filter((m) => m.pct >= 70 && m.pct < 100).map((item) => (
                          <IngredientRecipeCard key={item.recipe.id} item={item} tier="close" />
                        ))}
                      </div>
                    </section>
                  )}

                  {recipeMatches.filter((m) => m.pct < 70).length > 0 && (
                    <section>
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        <h3 className="text-sm font-semibold text-foreground">Worth a look</h3>
                        <span className="px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[11px] font-medium">
                          {recipeMatches.filter((m) => m.pct < 70).length}
                        </span>
                        <span className="text-[11px] text-muted-foreground">partial match - needs more shopping</span>
                        <div className="flex-1 h-px bg-border ml-1" />
                      </div>
                      <div className="space-y-3">
                        {recipeMatches.filter((m) => m.pct < 70).map((item) => (
                          <IngredientRecipeCard key={item.recipe.id} item={item} tier="partial" />
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeading({ title, icon, count }: { title: string; icon?: React.ReactNode; count?: number }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {count !== undefined && (
        <span className="px-1.5 py-0.5 rounded-full bg-muted text-[11px] text-muted-foreground">{count}</span>
      )}
      <div className="flex-1 h-px bg-border ml-1" />
    </div>
  );
}

type MatchItem = {
  recipe: ExploreRecipe;
  matched: number;
  total: number;
  pct: number;
  missing: string[];
};

function IngredientRecipeCard({ item, tier }: { item: MatchItem; tier: "perfect" | "close" | "partial" }) {
  const { recipe, matched, total, pct, missing } = item;

  const borderClass =
    tier === "perfect" ? "border-green-500/40 dark:border-green-500/30" :
    tier === "close"   ? "border-yellow-brand/30" :
    "border-border";

  const badgeBg =
    tier === "perfect" ? "bg-green-500/10 text-green-600 dark:text-green-400" :
    tier === "close"   ? "bg-yellow-brand/10 text-yellow-brand" :
    "bg-orange-500/10 text-orange-600 dark:text-orange-400";

  const barColor =
    tier === "perfect" ? "bg-green-500" :
    tier === "close"   ? "bg-yellow-brand" :
    "bg-orange-500";

  return (
    <Link
      href={`/${recipe.author.username}/${recipe.slug}`}
      className={`flex gap-4 p-4 rounded-xl border bg-card hover:shadow-sm transition-all group ${borderClass}`}
    >
      <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted">
        {recipe.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={recipe.imageUrl}
            alt={recipe.name}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1.5">
          <p className="flex-1 text-sm font-semibold text-foreground group-hover:text-yellow-brand transition-colors truncate">
            {recipe.name}
          </p>
          <span className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${badgeBg}`}>
            {pct}%
          </span>
        </div>

        <p className="text-[11px] text-muted-foreground mb-2">
          by {recipe.author.username} · {matched}/{total} ingredients
        </p>

        <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-2">
          <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
        </div>

        {missing.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {missing.slice(0, 5).map((ing) => (
              <span
                key={ing}
                className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-red-500/8 border border-red-500/20 text-red-600 dark:text-red-400 text-[10px] font-medium"
              >
                + {ing}
              </span>
            ))}
            {missing.length > 5 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px]">
                +{missing.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
