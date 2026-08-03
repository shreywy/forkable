import { RecipeCard } from "@/components/RecipeCard";
import { prisma } from "@/lib/prisma";
import { TrendingUp, Compass, Flame, Leaf, Cake, Coffee, Globe, Soup, Beef, Fish } from "lucide-react";
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

export default async function HomePage() {
  const rows = await prisma.recipe.findMany({
    where: { isPublic: true },
    orderBy: { starCount: "desc" },
    take: 12,
    include: {
      author: { select: { username: true, displayName: true, avatarUrl: true } },
      tags: { include: { tag: true }, take: 3 },
      forkedFrom: { include: { author: { select: { username: true } } } },
    },
  });

  const recipes: RecipeCardData[] = rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    imageUrl: r.imageUrl,
    author: {
      username: r.author.username,
      displayName: r.author.displayName,
      avatarUrl: r.author.avatarUrl,
    },
    forkedFrom: r.forkedFrom
      ? { ownerUsername: r.forkedFrom.author.username, recipeSlug: r.forkedFrom.slug }
      : null,
    starCount: r.starCount,
    forkCount: r.forkCount,
    tasteTestCount: r.tasteTestCount,
    tweakCount: r.tweakCount,
    tags: r.tags.map((rt) => ({ name: rt.tag.name, label: rt.tag.label })),
    updatedAt: r.updatedAt,
  }));

  const trending = recipes.slice(0, 3);
  const discover = recipes.slice(3);

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
            <a
              href="/explore"
              className="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-yellow-brand hover:bg-yellow-hover text-foreground font-medium text-sm transition-colors shadow-sm"
            >
              Explore recipes
            </a>
            <a
              href="/new"
              className="inline-flex items-center justify-center h-10 px-6 rounded-lg border border-border bg-background hover:bg-yellow-subtle dark:hover:bg-yellow-muted text-foreground font-medium text-sm transition-colors"
            >
              Add your first recipe
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-[1280px] mx-auto px-4 py-10 space-y-14">
        {/* ── Genre categories ──────────────────────────────────────────────── */}
        <section>
          <SectionHeading icon={<Globe className="w-4 h-4 text-yellow-brand" />} title="Browse by category" />
          <div className="mt-4 grid grid-cols-4 sm:grid-cols-8 gap-3">
            {GENRES.map((g) => (
              <a
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
              </a>
            ))}
          </div>
        </section>

        {/* ── Trending ──────────────────────────────────────────────────────── */}
        <section>
          <SectionHeading icon={<TrendingUp className="w-4 h-4 text-yellow-brand" />} title="Trending this week" />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trending.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </section>

        {/* ── Discover ──────────────────────────────────────────────────────── */}
        <section>
          <SectionHeading icon={<Compass className="w-4 h-4 text-yellow-brand" />} title="Discover more" />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {discover.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </section>
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
