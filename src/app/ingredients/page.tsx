import type { Metadata } from "next";
import Link from "next/link";
import { Carrot, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Ingredient catalog",
  description: "Every ingredient used across Forkable recipes, with verified macros.",
};

export const dynamic = "force-dynamic";

const PER_PAGE = 48;

export default async function IngredientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1") || 1);
  const query = q?.trim();

  const where = query
    ? { name: { contains: query, mode: "insensitive" as const } }
    : {};

  const [ingredients, total] = await Promise.all([
    prisma.ingredient.findMany({
      where,
      orderBy: { usages: { _count: "desc" } },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        slug: true,
        name: true,
        calories: true,
        protein: true,
        macroSource: true,
        _count: { select: { usages: true } },
      },
    }),
    prisma.ingredient.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1280px] mx-auto px-4 py-8">
        <div className="flex items-center gap-2.5 mb-1">
          <Carrot className="w-5 h-5 text-yellow-brand" />
          <h1 className="text-xl font-bold text-foreground">Ingredient catalog</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          {total.toLocaleString()} ingredients used across Forkable recipes.
        </p>

        {/* Search */}
        <form method="GET" className="relative max-w-sm mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            name="q"
            defaultValue={query ?? ""}
            placeholder="Search ingredients..."
            className="w-full h-9 pl-8 pr-3 text-sm bg-muted rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-yellow-brand placeholder:text-muted-foreground"
          />
        </form>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {ingredients.map((ing) => (
            <Link
              key={ing.slug}
              href={`/ingredients/${ing.slug}`}
              className="rounded-xl border border-border bg-card p-4 hover:border-yellow-brand transition-colors group"
            >
              <p className="text-sm font-semibold text-foreground capitalize group-hover:text-yellow-brand transition-colors truncate">
                {ing.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {ing._count.usages} recipe{ing._count.usages === 1 ? "" : "s"}
              </p>
              {ing.calories !== null && (
                <p className="text-[11px] text-muted-foreground mt-2 font-mono">
                  {ing.calories} kcal
                  {ing.protein !== null && ` · ${ing.protein}g protein`}
                  <span className="text-muted-foreground/60"> /100g</span>
                </p>
              )}
            </Link>
          ))}
        </div>

        {ingredients.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-16">
            No ingredients match &ldquo;{query}&rdquo;.
          </p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8 text-sm">
            {page > 1 ? (
              <Link
                href={`/ingredients?${query ? `q=${encodeURIComponent(query)}&` : ""}page=${page - 1}`}
                className="inline-flex items-center gap-1 px-3 h-8 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 h-8 rounded-lg border border-border text-muted-foreground/40">
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </span>
            )}
            <span className="text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            {page < totalPages ? (
              <Link
                href={`/ingredients?${query ? `q=${encodeURIComponent(query)}&` : ""}page=${page + 1}`}
                className="inline-flex items-center gap-1 px-3 h-8 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 h-8 rounded-lg border border-border text-muted-foreground/40">
                Next <ChevronRight className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
