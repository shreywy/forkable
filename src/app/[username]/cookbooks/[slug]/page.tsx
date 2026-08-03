import { notFound } from "next/navigation";
import Link from "next/link";
import { MOCK_COOKBOOKS, MOCK_RECIPES, MOCK_USERS, toCardData } from "@/lib/mock-data";
import { RecipeCard } from "@/components/RecipeCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Users, Plus } from "lucide-react";

interface Props {
  params: Promise<{ username: string; slug: string }>;
}

// ── Gradient per owner (deterministic based on username) ──────────────────────

const OWNER_GRADIENTS: Record<string, string> = {
  shrey:
    "linear-gradient(135deg, oklch(0.83 0.17 88) 0%, oklch(0.72 0.14 55) 100%)",
  vegan_vivienne:
    "linear-gradient(135deg, oklch(0.72 0.18 145) 0%, oklch(0.60 0.14 180) 100%)",
  kenji_tokyo:
    "linear-gradient(135deg, oklch(0.55 0.17 25) 0%, oklch(0.40 0.12 55) 100%)",
  nonna_rosa:
    "linear-gradient(135deg, oklch(0.68 0.16 30) 0%, oklch(0.55 0.12 20) 100%)",
  gluten_free_gary:
    "linear-gradient(135deg, oklch(0.60 0.15 230) 0%, oklch(0.50 0.10 260) 100%)",
};

const DEFAULT_GRADIENT =
  "linear-gradient(135deg, oklch(0.70 0.12 88) 0%, oklch(0.55 0.10 55) 100%)";

export default async function CookbookPage({ params }: Props) {
  const { username, slug } = await params;

  const cookbook = MOCK_COOKBOOKS.find(
    (c) => c.owner === username && c.slug === slug,
  );
  if (!cookbook) notFound();

  const owner = MOCK_USERS[cookbook.owner];
  const recipes = MOCK_RECIPES.filter((r) =>
    cookbook.recipeIds.includes(r.id),
  );

  const gradient = OWNER_GRADIENTS[username] ?? DEFAULT_GRADIENT;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Banner ──────────────────────────────────────────────────────────── */}
      <div
        className="h-32 w-full"
        style={{ background: gradient }}
        aria-hidden="true"
      />

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="max-w-[1280px] mx-auto px-4">
        <div className="pb-6 border-b border-border">
          {/* Cookbook icon + title */}
          <div className="flex items-start justify-between gap-4 mt-6">
            <div className="flex items-start gap-4">
              {/* Icon badge */}
              <div className="w-14 h-14 rounded-xl bg-yellow-brand flex items-center justify-center shrink-0 shadow-sm">
                <BookOpen className="w-7 h-7 text-[oklch(0.12_0_0)]" />
              </div>

              {/* Info */}
              <div>
                <h1 className="text-2xl font-bold text-foreground leading-tight">
                  {cookbook.name}
                </h1>
                {cookbook.description && (
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-xl">
                    {cookbook.description}
                  </p>
                )}

                {/* Meta row */}
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"}
                  </span>
                  <span className="text-border">·</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {cookbook.followers} follower{cookbook.followers !== 1 ? "s" : ""}
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

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0 mt-1">
              <button className="h-8 px-4 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                Follow cookbook
              </button>
              <button className="h-8 px-4 rounded-lg bg-yellow-brand text-[oklch(0.12_0_0)] text-sm font-semibold hover:bg-yellow-hover transition-colors flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Add recipe
              </button>
            </div>
          </div>

          {/* Owner row */}
          {owner && (
            <div className="mt-4">
              <Link
                href={`/${owner.username}`}
                className="inline-flex items-center gap-2 group"
              >
                <Avatar className="h-5 w-5">
                  <AvatarImage src={owner.avatarUrl} />
                  <AvatarFallback className="text-[10px] bg-yellow-light">
                    {owner.displayName[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  by{" "}
                  <span className="font-medium">{owner.displayName}</span>
                  <span className="ml-1 text-muted-foreground/60">@{owner.username}</span>
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* ── Recipe grid ─────────────────────────────────────────────────── */}
        <div className="py-8">
          {recipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={toCardData(recipe)} />
              ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <BookOpen className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                No recipes in this cookbook yet.
              </p>
              <button className="mt-3 h-8 px-4 rounded-lg bg-yellow-brand text-[oklch(0.12_0_0)] text-sm font-semibold hover:bg-yellow-hover transition-colors flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Add first recipe
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
