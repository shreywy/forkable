import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ViewsAreaChart, StatTile, type DayPoint } from "@/components/recipe/InsightsCharts";

export const dynamic = "force-dynamic";

// Date math lives outside the component body (react-hooks/purity)
function getTimeWindows() {
  const now = Date.now();
  return {
    since: new Date(now - 30 * 86_400_000),
    sevenDaysAgo: new Date(now - 7 * 86_400_000),
    days: Array.from({ length: 30 }, (_, idx) => {
      const d = new Date(now - (29 - idx) * 86_400_000);
      return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
        .toISOString()
        .slice(0, 10);
    }),
  };
}

export default async function InsightsPage({
  params,
}: {
  params: Promise<{ username: string; recipe: string }>;
}) {
  const { username, recipe: recipeSlug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const recipe = await prisma.recipe.findFirst({
    where: { slug: recipeSlug, author: { username } },
    select: {
      id: true,
      name: true,
      authorId: true,
      starCount: true,
      forkCount: true,
      tasteTestCount: true,
      tweakCount: true,
    },
  });
  if (!recipe) notFound();
  if (recipe.authorId !== session.user.id) redirect(`/${username}/${recipeSlug}`);

  const { since, sevenDaysAgo, days } = getTimeWindows();

  const [stats, stars7d, forks7d, tasteTests7d] = await Promise.all([
    prisma.recipeDailyStat.findMany({
      where: { recipeId: recipe.id, day: { gte: since } },
      orderBy: { day: "asc" },
    }),
    prisma.star.count({ where: { recipeId: recipe.id, createdAt: { gte: sevenDaysAgo } } }),
    prisma.fork.count({ where: { sourceId: recipe.id, createdAt: { gte: sevenDaysAgo } } }),
    prisma.tasteTest.count({ where: { recipeId: recipe.id, createdAt: { gte: sevenDaysAgo } } }),
  ]);

  // Fill all 30 days so the chart has a continuous series
  const byDay = new Map(stats.map((s) => [s.day.toISOString().slice(0, 10), s.views]));
  const points: DayPoint[] = days.map((key) => ({ day: key, views: byDay.get(key) ?? 0 }));
  const views30d = points.reduce((s, p) => s + p.views, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[860px] mx-auto px-4 py-8">
        <Link
          href={`/${username}/${recipeSlug}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {recipe.name}
        </Link>

        <h1 className="flex items-center gap-2.5 text-xl font-bold text-foreground mb-1">
          <BarChart3 className="w-5 h-5 text-yellow-brand" />
          Insights
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Only you can see this dashboard.
        </p>

        {/* Stat tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatTile label="Views (30 days)" value={views30d} />
          <StatTile label="Stars" value={recipe.starCount} delta={stars7d} />
          <StatTile label="Forks" value={recipe.forkCount} delta={forks7d} />
          <StatTile label="Taste tests" value={recipe.tasteTestCount} delta={tasteTests7d} />
        </div>

        {/* Views chart */}
        <ViewsAreaChart points={points} />

        <p className="text-[11px] text-muted-foreground mt-3">
          Views are counted once per visitor per hour after 5 seconds on the page.
          {" "}{recipe.tweakCount} tweaks recorded all-time.
        </p>
      </div>
    </div>
  );
}
