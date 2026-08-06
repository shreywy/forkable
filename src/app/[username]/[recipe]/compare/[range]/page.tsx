import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { diffSnapshots } from "@/lib/diff";
import type { RecipeSnapshot } from "@/lib/snapshot";
import { DiffView } from "@/components/recipe/DiffView";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, GitCommitHorizontal, MoveRight } from "lucide-react";

export const dynamic = "force-dynamic";

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function VersionCard({
  label,
  message,
  author,
  createdAt,
}: {
  label: string;
  message: string;
  author: { username: string; displayName: string; avatarUrl: string | null };
  createdAt: Date;
}) {
  return (
    <div className="flex-1 min-w-0 rounded-xl border border-border bg-card px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground truncate flex items-center gap-2">
        <GitCommitHorizontal className="w-4 h-4 text-yellow-brand shrink-0" />
        {message}
      </p>
      <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
        <Avatar className="h-4 w-4">
          <AvatarImage src={author.avatarUrl ?? undefined} />
          <AvatarFallback className="text-[8px] bg-yellow-light">
            {author.displayName[0]}
          </AvatarFallback>
        </Avatar>
        <span>{author.username}</span>
        <span>·</span>
        <span>{fmtDate(createdAt)}</span>
      </div>
    </div>
  );
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ username: string; recipe: string; range: string }>;
}) {
  const { username, recipe: recipeSlug, range } = await params;

  const decoded = decodeURIComponent(range);
  const [fromId, toId] = decoded.split("...");
  if (!fromId || !toId) notFound();

  const recipe = await prisma.recipe.findFirst({
    where: { slug: recipeSlug, author: { username }, isPublic: true },
    select: { id: true, name: true },
  });
  if (!recipe) notFound();

  const [fromVersion, toVersion] = await Promise.all([
    prisma.recipeVersion.findUnique({
      where: { id: fromId },
      include: { author: { select: { username: true, displayName: true, avatarUrl: true } } },
    }),
    prisma.recipeVersion.findUnique({
      where: { id: toId },
      include: { author: { select: { username: true, displayName: true, avatarUrl: true } } },
    }),
  ]);

  if (
    !fromVersion ||
    !toVersion ||
    fromVersion.recipeId !== recipe.id ||
    toVersion.recipeId !== recipe.id ||
    !fromVersion.snapshot ||
    !toVersion.snapshot
  ) {
    notFound();
  }

  const diff = diffSnapshots(
    fromVersion.snapshot as unknown as RecipeSnapshot,
    toVersion.snapshot as unknown as RecipeSnapshot,
  );

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

        <h1 className="text-xl font-bold text-foreground mb-1">Comparing tweaks</h1>
        <p className="text-sm text-muted-foreground mb-6">
          <span className="text-green-600 dark:text-green-400 font-mono">+{diff.additions}</span>{" "}
          <span className="text-red-500 font-mono">-{diff.deletions}</span> changes between these
          two versions
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
          <VersionCard
            label="From"
            message={fromVersion.message}
            author={fromVersion.author}
            createdAt={fromVersion.createdAt}
          />
          <MoveRight className="w-5 h-5 text-muted-foreground shrink-0 self-center rotate-90 sm:rotate-0" />
          <VersionCard
            label="To"
            message={toVersion.message}
            author={toVersion.author}
            createdAt={toVersion.createdAt}
          />
        </div>

        <DiffView diff={diff} />
      </div>
    </div>
  );
}
