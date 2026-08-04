import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { RecipeCard } from "@/components/RecipeCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Users, Plus } from "lucide-react";
import type { RecipeCardData } from "@/lib/types";

interface Props {
  params: Promise<{ username: string; slug: string }>;
}

function getBannerGradient(username: string): string {
  const gradients = [
    "linear-gradient(135deg, oklch(0.83 0.17 88) 0%, oklch(0.72 0.14 55) 100%)",
    "linear-gradient(135deg, oklch(0.72 0.18 145) 0%, oklch(0.60 0.14 180) 100%)",
    "linear-gradient(135deg, oklch(0.55 0.17 25) 0%, oklch(0.40 0.12 55) 100%)",
    "linear-gradient(135deg, oklch(0.68 0.16 30) 0%, oklch(0.55 0.12 20) 100%)",
    "linear-gradient(135deg, oklch(0.60 0.15 230) 0%, oklch(0.50 0.10 260) 100%)",
  ];
  let hash = 0;
  for (const ch of username) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff;
  return gradients[hash % gradients.length];
}

export default async function CookbookPage({ params }: Props) {
  const { username, slug } = await params;

  const [session, user] = await Promise.all([
    auth(),
    prisma.user.findUnique({ where: { username }, select: { id: true } }),
  ]);

  if (!user) notFound();

  const cookbook = await prisma.cookbook.findUnique({
    where: { ownerId_slug: { ownerId: user.id, slug } },
    include: {
      owner: { select: { username: true, displayName: true, avatarUrl: true } },
      recipes: {
        orderBy: { order: "asc" },
        include: {
          recipe: {
            include: {
              author: { select: { username: true, displayName: true, avatarUrl: true } },
              tags: { include: { tag: true }, take: 3 },
              forkedFrom: { include: { author: { select: { username: true } } } },
            },
          },
        },
      },
      _count: { select: { recipes: true } },
    },
  });

  if (!cookbook) notFound();

  const sessionUserId = (session?.user as { id?: string } | null)?.id;
  const isOwner = sessionUserId === user.id;

  if (!cookbook.isPublic && !isOwner) notFound();

  const recipes: RecipeCardData[] = cookbook.recipes.map(({ recipe: r }) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    imageUrl: r.imageUrl,
    author: r.author,
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

  const gradient = getBannerGradient(username);

  return (
    <div className="min-h-screen bg-background">
      <div className="h-32 w-full" style={{ background: gradient }} aria-hidden="true" />

      <div className="max-w-[1280px] mx-auto px-4">
        <div className="pb-6 border-b border-border">
          <div className="flex items-start justify-between gap-4 mt-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-yellow-brand flex items-center justify-center shrink-0 shadow-sm">
                <BookOpen className="w-7 h-7 text-[oklch(0.12_0_0)]" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-foreground leading-tight">
                  {cookbook.name}
                </h1>
                {cookbook.description && (
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-xl">
                    {cookbook.description}
                  </p>
                )}

                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {cookbook._count.recipes} {cookbook._count.recipes === 1 ? "recipe" : "recipes"}
                  </span>
                  {!cookbook.isPublic && (
                    <>
                      <span className="text-border">·</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[11px] border border-border">
                        Private
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {isOwner && (
              <div className="flex items-center gap-2 shrink-0 mt-1">
                <button className="h-8 px-4 rounded-lg bg-yellow-brand text-[oklch(0.12_0_0)] text-sm font-semibold hover:bg-yellow-hover transition-colors flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Add recipe
                </button>
              </div>
            )}
          </div>

          <div className="mt-4">
            <Link href={`/${cookbook.owner.username}`} className="inline-flex items-center gap-2 group">
              <Avatar className="h-5 w-5">
                <AvatarImage src={cookbook.owner.avatarUrl ?? undefined} />
                <AvatarFallback className="text-[10px] bg-yellow-light">
                  {cookbook.owner.displayName[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                by <span className="font-medium">{cookbook.owner.displayName}</span>
                <span className="ml-1 text-muted-foreground/60">@{cookbook.owner.username}</span>
              </span>
            </Link>
          </div>
        </div>

        <div className="py-8">
          {recipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <BookOpen className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No recipes in this cookbook yet.</p>
              {isOwner && (
                <button className="mt-3 h-8 px-4 rounded-lg bg-yellow-brand text-[oklch(0.12_0_0)] text-sm font-semibold hover:bg-yellow-hover transition-colors flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Add first recipe
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
