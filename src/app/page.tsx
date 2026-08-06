import Link from "next/link";
import { RecipeCard } from "@/components/RecipeCard";
import { PantryCarousel } from "@/components/PantryCarousel";
import { DiscoverFeed } from "@/components/DiscoverFeed";
import { prisma } from "@/lib/prisma";
import { TrendingUp, Globe, Flame, Leaf, Cake, Coffee, Soup, Beef, Fish } from "lucide-react";
import type { RecipeCardData } from "@/lib/types";

export const revalidate = 300; // 5-minute ISR

const GENRES = [
  { label: "Vegan",      icon: <Leaf className="w-5 h-5" />,        slug: "vegan" },
  { label: "Baking",     icon: <Cake className="w-5 h-5" />,        slug: "baking" },
  { label: "Quick",      icon: <Flame className="w-5 h-5" />,       slug: "quick" },
  { label: "Breakfast",  icon: <Coffee className="w-5 h-5" />,      slug: "breakfast" },
  { label: "Soups",      icon: <Soup className="w-5 h-5" />,        slug: "soups" },
  { label: "Asian",      icon: <Fish className="w-5 h-5" />,        slug: "asian" },
  { label: "BBQ",        icon: <Beef className="w-5 h-5" />,        slug: "bbq" },
  { label: "World",      icon: <Globe className="w-5 h-5" />,       slug: "world" },
];

const TRENDING_TAKE = 3;
const DISCOVER_TAKE = 9; // first page of infinite feed

function mapRecipe(r: {
  id: string; slug: string; name: string; description: string; imageUrl: string | null;
  starCount: number; forkCount: number; tasteTestCount: number; tweakCount: number;
  updatedAt: Date;
  author: { username: string; displayName: string; avatarUrl: string | null };
  forkedFrom: { slug: string; author: { username: string } } | null;
  tags: { tag: { name: string; label: string } }[];
}): RecipeCardData {
  return {
    id: r.id, slug: r.slug, name: r.name, description: r.description, imageUrl: r.imageUrl,
    author: r.author,
    forkedFrom: r.forkedFrom
      ? { ownerUsername: r.forkedFrom.author.username, recipeSlug: r.forkedFrom.slug }
      : null,
    starCount: r.starCount, forkCount: r.forkCount,
    tasteTestCount: r.tasteTestCount, tweakCount: r.tweakCount,
    tags: r.tags.map((rt) => ({ name: rt.tag.name, label: rt.tag.label })),
    updatedAt: r.updatedAt,
  };
}

export default async function HomePage() {
  // Fetch trending (first 3) + first discover page (next 9) in one query
  const rows = await prisma.recipe.findMany({
    where: { isPublic: true },
    orderBy: [{ starCount: "desc" }, { id: "asc" }],
    take: TRENDING_TAKE + DISCOVER_TAKE,
    include: {
      author: { select: { username: true, displayName: true, avatarUrl: true } },
      tags: { include: { tag: true }, take: 3 },
      forkedFrom: { include: { author: { select: { username: true } } } },
    },
  });

  const trending = rows.slice(0, TRENDING_TAKE).map(mapRecipe);
  const discover = rows.slice(TRENDING_TAKE).map(mapRecipe);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-[oklch(0.94_0.09_88)] dark:bg-yellow-subtle border-b border-border transition-colors duration-300">
        <div className="max-w-[1280px] mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
            Fork recipes.{" "}
            <span className="text-yellow-brand">Cook together.</span>
          </h1>
          <p className="mt-4 max-w-lg mx-auto text-base text-muted-foreground leading-relaxed">
            Remix recipes, track every tweak, and send taste-test suggestions
            back to the original cook.
          </p>

          {/* ── CTAs ─────────────────────────────────────────────────────── */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/explore"
              className="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-yellow-brand hover:bg-yellow-hover text-foreground font-medium text-sm transition-colors shadow-sm"
            >
              Explore recipes
            </Link>
            <Link
              href="/new"
              className="inline-flex items-center justify-center h-10 px-6 rounded-lg border border-border bg-background hover:bg-yellow-subtle dark:hover:bg-yellow-muted text-foreground font-medium text-sm transition-colors"
            >
              Add your first recipe
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pantry carousel (only visible when logged in + has pantry) ─────── */}
      <PantryCarousel />

      <div className="max-w-[1280px] mx-auto px-4 py-10 space-y-14">
        {/* ── Genre categories ──────────────────────────────────────────────── */}
        <section>
          <SectionHeading icon={<Globe className="w-4 h-4 text-yellow-brand" />} title="Browse by category" />
          <div className="mt-4 grid grid-cols-4 sm:grid-cols-8 gap-3">
            {GENRES.map((g) => (
              <Link
                key={g.slug}
                href={`/explore?tag=${g.slug}`}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-card hover:border-yellow-brand hover:bg-yellow-subtle dark:hover:bg-yellow-muted transition-all duration-150 group"
              >
                <span className="text-muted-foreground group-hover:text-yellow-brand transition-colors">
                  {g.icon}
                </span>
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {g.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Trending ──────────────────────────────────────────────────────── */}
        <section>
          <SectionHeading icon={<TrendingUp className="w-4 h-4 text-yellow-brand" />} title="Trending this week" />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trending.map((recipe, i) => (
              <RecipeCard key={recipe.id} recipe={recipe} priority={i === 0} />
            ))}
          </div>
        </section>

        {/* ── Discover (infinite scroll) ─────────────────────────────────── */}
        <DiscoverFeed
          initialRecipes={discover}
          initialSkip={TRENDING_TAKE + DISCOVER_TAKE}
        />
      </div>
    </div>
  );
}

function SectionHeading({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <div className="flex-1 h-px bg-border ml-2" />
    </div>
  );
}
