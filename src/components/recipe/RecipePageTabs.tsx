"use client";

import { useState } from "react";

function fmtDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen, GitCommitHorizontal, GitFork, ChefHat,
  Star, Plus, GitMerge, X, Check, ChevronDown, ChevronUp,
  Eye, Share2, Utensils, Copy, Pencil, Loader2, Send, MessageSquare,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileTree } from "@/components/recipe/FileTree";
import type { RecipePageData, TweakData, TasteTestData, TasteTestReplyData, RecipeCardData } from "@/lib/types";

type Tab = "recipe" | "tweaks" | "forks" | "taste-tests";

interface CurrentUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
}

interface Props {
  recipe: RecipePageData;
  tweaks: TweakData[];
  tasteTsts: TasteTestData[];
  forks: RecipeCardData[];
  currentUser?: CurrentUser | null;
  /** If the current user already forked this recipe, the URL of their fork */
  existingForkUrl?: string | null;
  initialIsStarred?: boolean;
}

export function RecipePageTabs({ recipe, tweaks, tasteTsts: initialTasteTsts, forks, currentUser, existingForkUrl, initialIsStarred = false }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("recipe");
  const [copied, setCopied] = useState(false);
  const [forking, setForking] = useState(false);
  const [forkCount, setForkCount] = useState(recipe.forkCount);
  const [myForkUrl, setMyForkUrl] = useState<string | null>(existingForkUrl ?? null);
  const [tasteTsts, setTasteTsts] = useState<TasteTestData[]>(initialTasteTsts);
  const [tasteTestCount, setTasteTestCount] = useState(recipe.tasteTestCount);
  const [isStarred, setIsStarred] = useState(initialIsStarred);
  const [starCount, setStarCount] = useState(recipe.starCount);
  const [starring, setStarring] = useState(false);
  const router = useRouter();
  const owner = recipe.author;
  const isOwnRecipe = currentUser?.id !== undefined && recipe.author.username === currentUser?.username;

  const tabs = [
    { id: "recipe"      as Tab, icon: <BookOpen className="w-3.5 h-3.5" />,            label: "Recipe",      count: null },
    { id: "tweaks"      as Tab, icon: <GitCommitHorizontal className="w-3.5 h-3.5" />, label: "Tweaks",      count: recipe.tweakCount },
    { id: "forks"       as Tab, icon: <GitFork className="w-3.5 h-3.5" />,             label: "Forks",       count: forkCount },
    { id: "taste-tests" as Tab, icon: <ChefHat className="w-3.5 h-3.5" />,            label: "Taste Tests", count: tasteTestCount },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFork = async () => {
    if (!currentUser) { router.push("/login"); return; }
    if (myForkUrl) { router.push(myForkUrl); return; }
    setForking(true);
    try {
      const res = await fetch("/api/fork", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceRecipeId: recipe.id }),
      });
      const data = await res.json();
      if (data.url) {
        if (!data.alreadyForked) setForkCount((c) => c + 1);
        setMyForkUrl(data.url);
        router.push(data.url);
      }
    } finally {
      setForking(false);
    }
  };

  const handleStar = async () => {
    if (!currentUser) { router.push("/login"); return; }
    if (starring) return;
    setStarring(true);
    const newStarred = !isStarred;
    setIsStarred(newStarred);
    setStarCount((c) => c + (newStarred ? 1 : -1));
    try {
      await fetch("/api/star", {
        method: newStarred ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId: recipe.id }),
      });
    } catch {
      // revert on failure
      setIsStarred(!newStarred);
      setStarCount((c) => c + (newStarred ? -1 : 1));
    } finally {
      setStarring(false);
    }
  };

  const handleAddTasteTest = (tt: TasteTestData) => {
    setTasteTsts((prev) => [tt, ...prev]);
    setTasteTestCount((c) => c + 1);
  };

  const shareOnX = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out "${recipe.name}" on Forkable`);
    window.open(`https://x.com/intent/tweet?url=${url}&text=${text}`, "_blank");
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`Check out "${recipe.name}" on Forkable: ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <>
      {/* ── Recipe header ─────────────────────────────────────────────────── */}
      <div className="border-b border-border bg-card">
        <div className="max-w-[1280px] mx-auto px-4 pt-6 pb-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm mb-3">
            <Link
              href={`/${owner.username}`}
              className="flex items-center gap-1.5 text-foreground hover:text-yellow-brand font-medium transition-colors"
            >
              <Avatar className="h-5 w-5">
                <AvatarImage src={owner.avatarUrl ?? undefined} />
                <AvatarFallback className="text-[10px] bg-yellow-light">
                  {owner.displayName[0]}
                </AvatarFallback>
              </Avatar>
              {owner.username}
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link
              href={`/${owner.username}/${recipe.slug}`}
              className="font-semibold text-foreground hover:text-yellow-brand transition-colors"
            >
              {recipe.slug}
            </Link>
            <Badge
              variant="outline"
              className="ml-1 text-[11px] px-2 py-0 h-5 border-border text-muted-foreground font-normal"
            >
              Public
            </Badge>
            {recipe.forkedFrom && (
              <span className="ml-2 text-xs text-muted-foreground flex items-center gap-1">
                <GitFork className="w-3 h-3" />
                forked from{" "}
                <Link
                  href={`/${recipe.forkedFrom.ownerUsername}/${recipe.forkedFrom.recipeSlug}`}
                  className="hover:text-yellow-brand hover:underline transition-colors"
                >
                  {recipe.forkedFrom.ownerUsername}/{recipe.forkedFrom.recipeSlug}
                </Link>
              </span>
            )}
          </div>

          {/* Action bar */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <ActionButton icon={<Eye className="w-3.5 h-3.5" />} label="Watch" count={42} />
            {/* Star button — live wired */}
            <button
              onClick={handleStar}
              disabled={starring}
              className={`inline-flex items-center h-8 rounded-md border text-xs font-medium transition-colors overflow-hidden ${
                isStarred
                  ? "border-yellow-brand bg-yellow-subtle dark:bg-yellow-muted"
                  : "border-yellow-brand/40 hover:border-yellow-brand"
              }`}
            >
              <span className={`flex items-center gap-1.5 px-3 h-full border-r border-border transition-colors ${
                isStarred ? "text-yellow-hover" : "bg-card hover:bg-yellow-subtle text-foreground"
              }`}>
                <Star className={`w-3.5 h-3.5 ${isStarred ? "fill-yellow-brand text-yellow-brand" : ""}`} />
                {isStarred ? "Starred" : "Star"}
              </span>
              <span className="px-2.5 h-full flex items-center bg-yellow-subtle/50 hover:bg-yellow-subtle transition-colors text-muted-foreground">
                {starCount.toLocaleString()}
              </span>
            </button>
            {/* Fork button — live wired */}
            {!isOwnRecipe && (
              <button
                onClick={handleFork}
                disabled={forking}
                className={`inline-flex items-center gap-1.5 h-7 px-3 rounded-lg border text-xs font-medium transition-colors ${
                  myForkUrl
                    ? "border-yellow-brand bg-yellow-subtle dark:bg-yellow-muted text-yellow-hover"
                    : "border-border bg-background text-muted-foreground hover:text-foreground hover:border-yellow-brand/40"
                }`}
              >
                {forking ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <GitFork className="w-3.5 h-3.5" />
                )}
                {myForkUrl ? "View your fork" : "Fork"}
                <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-muted text-[10px] font-semibold">
                  {forkCount}
                </span>
              </button>
            )}
            {isOwnRecipe && (
              <ActionButton
                icon={<GitFork className="w-3.5 h-3.5" />}
                label="Fork"
                count={forkCount}
              />
            )}

            <div className="ml-auto flex items-center gap-2">
              {/* Share dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-colors outline-none">
                  <Share2 className="w-3.5 h-3.5" />
                  Share
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleCopyLink}>
                    <Copy className="w-3.5 h-3.5 mr-2 shrink-0" />
                    {copied ? "Copied!" : "Copy link"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={shareOnX}>
                    <span className="mr-2 font-bold text-xs w-3.5 shrink-0">𝕏</span>
                    Share on X
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={shareOnWhatsApp}>
                    <span className="mr-2 text-sm w-3.5 shrink-0">💬</span>
                    Share on WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span className="mr-2 text-sm w-3.5 shrink-0">📸</span>
                    Share on Instagram
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Edit button - only for the recipe owner (shrey in Phase 1) */}
              {owner.username === "shrey" && (
                <button
                  onClick={() => router.push(`/${owner.username}/${recipe.slug}/edit`)}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
              )}

              {/* Cook Mode */}
              <button
                onClick={() => router.push(`/${owner.username}/${recipe.slug}/cook`)}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-yellow-brand hover:bg-yellow-hover text-[oklch(0.12_0_0)] text-xs font-medium transition-colors"
              >
                <Utensils className="w-3.5 h-3.5" />
                Cook Mode
              </button>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-yellow-brand text-foreground font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-yellow-brand/40"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== null && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab content ─────────────────────────────────────────────────────── */}
      <div className="max-w-[1280px] mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Main column */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* ── RECIPE TAB ──────────────────────────────────────────────── */}
            {activeTab === "recipe" && (
              <>
                {/* Branch selector row */}
                <div className="flex items-center gap-2 text-sm">
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-card hover:bg-muted text-sm font-medium transition-colors">
                    <span className="text-xs text-muted-foreground mr-1">branch:</span>
                    main
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </button>
                  <span className="text-muted-foreground text-xs">
                    <span className="font-medium text-foreground">{tweaks.length}</span> tweaks
                  </span>
                  <span className="text-muted-foreground text-xs">·</span>
                  <span className="text-muted-foreground text-xs">
                    Latest: <span className="text-foreground">{tweaks[0]?.message}</span>
                  </span>
                </div>

                {recipe.components.length > 0 && (
                  <FileTree
                    items={recipe.components}
                    recipe={recipe}
                  />
                )}

                {/* README */}
                <SectionFile icon={<BookOpen className="w-3.5 h-3.5" />} filename="README.md">
                  {recipe.imageUrl && (
                    <div className="relative h-52 rounded-lg overflow-hidden mb-5 bg-muted">
                      <Image
                        src={recipe.imageUrl}
                        alt={recipe.name}
                        fill
                        priority
                        className="object-cover"
                        sizes="800px"
                      />
                    </div>
                  )}
                  <h2 className="text-xl font-bold text-foreground mb-2">{recipe.name}</h2>
                  <p className="text-muted-foreground leading-relaxed">{recipe.description}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {recipe.tags.map((tag) => (
                      <Badge
                        key={tag.name}
                        variant="secondary"
                        className="bg-yellow-muted text-foreground/70 border-0 text-xs font-normal"
                      >
                        {tag.label}
                      </Badge>
                    ))}
                  </div>
                </SectionFile>

                {/* Instructions */}
                {recipe.instructions.length > 0 && (
                  <SectionFile
                    icon={<ChefHat className="w-3.5 h-3.5" />}
                    filename="instructions.md"
                  >
                    <ol className="space-y-4">
                      {recipe.instructions.map((s) => (
                        <li key={s.step} className="flex gap-4">
                          <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-yellow-brand text-[oklch(0.12_0_0)] text-xs font-bold mt-0.5">
                            {s.step}
                          </span>
                          <p className="text-sm text-foreground leading-relaxed">{s.text}</p>
                        </li>
                      ))}
                    </ol>
                  </SectionFile>
                )}

                {/* Macros */}
                <SectionFile
                  icon={<span className="text-xs">⚡</span>}
                  filename="macros.json"
                  rightSlot={
                    <span className="text-[11px] text-muted-foreground">
                      per serving · {recipe.servings} servings
                    </span>
                  }
                >
                  <div className="grid grid-cols-5 divide-x divide-border -mx-6">
                    {[
                      { label: "Calories", value: recipe.calories,  unit: "kcal" },
                      { label: "Protein",  value: recipe.proteinG,  unit: "g" },
                      { label: "Carbs",    value: recipe.carbsG,    unit: "g" },
                      { label: "Fat",      value: recipe.fatG,      unit: "g" },
                      { label: "Fiber",    value: recipe.fiberG,    unit: "g" },
                    ].map((m) => (
                      <div key={m.label} className="flex flex-col items-center py-3 px-2">
                        <span className="text-xl font-bold text-foreground">{m.value ?? "–"}</span>
                        <span className="text-[10px] text-muted-foreground">{m.unit}</span>
                        <span className="text-xs text-muted-foreground mt-0.5">{m.label}</span>
                      </div>
                    ))}
                  </div>
                </SectionFile>
              </>
            )}

            {/* ── TWEAKS TAB ──────────────────────────────────────────────── */}
            {activeTab === "tweaks" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{tweaks.length}</span> tweaks on{" "}
                    <span className="font-medium text-foreground">main</span>
                  </p>
                  <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium transition-colors">
                    <Plus className="w-3 h-3" />
                    Save a tweak
                  </button>
                </div>

                <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
                  {tweaks.map((tweak) => (
                    <TweakRow key={tweak.id} tweak={tweak} />
                  ))}
                </div>
              </div>
            )}

            {/* ── FORKS TAB ───────────────────────────────────────────────── */}
            {activeTab === "forks" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{recipe.forkCount}</span> forks of this
                    recipe
                  </p>
                  <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-yellow-brand hover:bg-yellow-hover text-[oklch(0.12_0_0)] text-xs font-medium transition-colors">
                    <GitFork className="w-3 h-3" />
                    Fork this recipe
                  </button>
                </div>

                {forks.length > 0 ? (
                  <div className="space-y-3">
                    {forks.map((fork) => (
                      <Link
                        key={fork.id}
                        href={`/${fork.author.username}/${fork.slug}`}
                        className="flex gap-4 p-4 rounded-xl border border-border bg-card hover:border-yellow-brand transition-all group"
                      >
                        <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-muted">
                          {fork.imageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={fork.imageUrl}
                              alt={fork.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Avatar className="h-4 w-4">
                              <AvatarImage src={fork.author.avatarUrl ?? undefined} />
                              <AvatarFallback className="text-[8px] bg-yellow-light">
                                {fork.author.displayName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              {fork.author.username}
                            </span>
                            <span className="text-xs text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground">
                              updated {fmtDate(fork.updatedAt)}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-foreground group-hover:text-yellow-brand transition-colors">
                            {fork.name}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {fork.description}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              {fork.starCount.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <GitCommitHorizontal className="w-3 h-3" />
                              {fork.tweakCount} tweaks
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  /* Placeholder fork network */
                  <div className="space-y-3">
                    {[
                      {
                        user: "gluten_free_gary",
                        name: `${recipe.name} (GF)`,
                        tweaks: 8,
                        stars: 312,
                        change: "Swapped flour for rice-flour alternative",
                      },
                      {
                        user: "vegan_vivienne",
                        name: `${recipe.name} (Vegan)`,
                        tweaks: 5,
                        stars: 204,
                        change: "Replaced dairy and eggs with plant-based alternatives",
                      },
                      {
                        user: "shrey",
                        name: `${recipe.name} (Weeknight)`,
                        tweaks: 3,
                        stars: 88,
                        change: "Simplified to a 30-min weeknight version",
                      },
                    ].map((f) => (
                      <div
                        key={f.user}
                        className="flex gap-4 p-4 rounded-xl border border-border bg-card hover:border-yellow-brand/50 transition-all"
                      >
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage
                            src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${f.user}`}
                          />
                          <AvatarFallback className="bg-yellow-light text-xs">
                            {f.user[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">{f.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">by {f.user}</p>
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            &ldquo;{f.change}&rdquo;
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              {f.stars}
                            </span>
                            <span className="flex items-center gap-1">
                              <GitCommitHorizontal className="w-3 h-3" />
                              {f.tweaks} tweaks
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── TASTE TESTS TAB ─────────────────────────────────────────── */}
            {activeTab === "taste-tests" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{tasteTestCount}</span> taste
                    tests {tasteTsts.filter((t) => t.type === "SUGGESTION" && t.status === "OPEN").length > 0 && (
                      <>— <span className="text-yellow-brand font-medium">
                        {tasteTsts.filter((t) => t.type === "SUGGESTION" && t.status === "OPEN").length} open suggestions
                      </span></>
                    )}
                  </p>
                </div>

                {/* Comment form */}
                <AddCommentForm
                  recipeId={recipe.id}
                  currentUser={currentUser}
                  onAdded={handleAddTasteTest}
                />

                <div className="space-y-3">
                  {tasteTsts.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground text-sm">
                      No taste tests yet. Be the first to leave a comment!
                    </div>
                  )}
                  {tasteTsts.map((tt) =>
                    tt.type === "SUGGESTION" ? (
                      <SuggestionCard key={tt.id} tt={tt} currentUser={currentUser} />
                    ) : (
                      <CommentCard key={tt.id} tt={tt} currentUser={currentUser} />
                    ),
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar (only on Recipe tab) */}
          {activeTab === "recipe" && (
            <aside className="w-64 shrink-0 hidden lg:block space-y-5">
              <div>
                <h3 className="text-sm font-semibold mb-2">About</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {recipe.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {recipe.tags.map((tag) => (
                    <Badge
                      key={tag.name}
                      variant="secondary"
                      className="bg-yellow-muted text-foreground/70 border-0 text-xs font-normal"
                    >
                      {tag.label}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="space-y-2.5">
                <StatRow
                  icon={<Star className="w-4 h-4" />}
                  label="Stars"
                  value={starCount.toLocaleString()}
                />
                <StatRow
                  icon={<GitFork className="w-4 h-4" />}
                  label="Forks"
                  value={recipe.forkCount.toString()}
                />
                <StatRow
                  icon={<ChefHat className="w-4 h-4" />}
                  label="Taste Tests"
                  value={recipe.tasteTestCount.toString()}
                />
                <StatRow
                  icon={<GitCommitHorizontal className="w-4 h-4" />}
                  label="Tweaks"
                  value={recipe.tweakCount.toString()}
                />
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold mb-3">Recent Tweaks</h3>
                <div className="space-y-2.5">
                  {tweaks.slice(0, 3).map((tweak) => (
                    <div key={tweak.id} className="flex items-start gap-2">
                      <GitCommitHorizontal className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-foreground leading-snug line-clamp-2">
                          {tweak.message}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {fmtDate(tweak.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────────── */

function ActionButton({
  icon,
  label,
  count,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  highlight?: boolean;
}) {
  return (
    <button
      className={`inline-flex items-center h-8 rounded-md border text-xs font-medium transition-colors overflow-hidden ${
        highlight
          ? "border-yellow-brand/40 hover:border-yellow-brand"
          : "border-border hover:bg-yellow-subtle"
      }`}
    >
      <span className="flex items-center gap-1.5 px-3 h-full bg-card hover:bg-yellow-subtle transition-colors border-r border-border">
        {icon}
        {label}
      </span>
      <span className="px-2.5 h-full flex items-center bg-yellow-subtle/50 hover:bg-yellow-subtle transition-colors text-muted-foreground">
        {count.toLocaleString()}
      </span>
    </button>
  );
}

function SectionFile({
  icon,
  filename,
  rightSlot,
  children,
}: {
  icon: React.ReactNode;
  filename: string;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/40 border-b border-border">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-xs font-medium text-muted-foreground">{filename}</span>
        {rightSlot && <span className="ml-auto">{rightSlot}</span>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function TweakRow({ tweak }: { tweak: TweakData }) {
  const [expanded, setExpanded] = useState(false);
  const dateStr = fmtDate(tweak.createdAt);
  return (
    <div className="px-4 py-3 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3">
        <GitCommitHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 text-sm font-medium text-foreground text-left hover:text-yellow-brand transition-colors"
        >
          {tweak.message}
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-green-500 font-mono">+{tweak.additions}</span>
          <span className="text-xs text-red-400 font-mono">-{tweak.deletions}</span>
          <Avatar className="h-5 w-5">
            <AvatarImage src={tweak.author.avatarUrl ?? undefined} />
            <AvatarFallback className="text-[8px] bg-yellow-light">
              {tweak.author.displayName[0]}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground hidden sm:inline">{dateStr}</span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="mt-3 ml-7 rounded-lg border border-border overflow-hidden text-xs font-mono">
          <div className="bg-green-500/10 border-b border-border px-3 py-2 text-green-600 dark:text-green-400">
            + {tweak.message} - added by {tweak.author.username} on {dateStr}
          </div>
          <div className="px-3 py-2 text-muted-foreground bg-muted/30">
            <p className="text-[11px]">
              sha: {tweak.id}a3f9c2d · {tweak.author.username} committed on {dateStr}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Add comment form ────────────────────────────────────────────────────────

function AddCommentForm({
  recipeId,
  currentUser,
  onAdded,
}: {
  recipeId: string;
  currentUser?: { id: string; username: string; displayName: string; avatarUrl?: string | null } | null;
  onAdded: (tt: TasteTestData) => void;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  if (!currentUser) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-yellow-brand hover:underline font-medium">Sign in</Link> to leave a taste test.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/taste-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId, type: "COMMENT", body: body.trim(), rating: rating || null }),
      });
      if (res.ok) {
        const tt = await res.json();
        onAdded({ ...tt, createdAt: tt.createdAt, replies: [] });
        setBody("");
        setRating(0);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-4">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={currentUser.avatarUrl ?? undefined} />
          <AvatarFallback className="text-xs bg-yellow-light">{currentUser.displayName[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Leave a taste test — what worked, what you'd tweak, substitutions tried..."
            rows={3}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-yellow-brand/40 focus:border-yellow-brand/60 transition-colors"
          />
          <div className="flex items-center justify-between mt-2">
            {/* Star rating */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground mr-1">Rating:</span>
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(rating === i ? 0 : i)}
                  onMouseEnter={() => setHoverRating(i)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <Star
                    className={`w-4 h-4 transition-colors ${
                      i <= (hoverRating || rating)
                        ? "text-yellow-brand fill-yellow-brand/60"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <button type="button" onClick={() => setRating(0)} className="text-[11px] text-muted-foreground hover:text-foreground ml-1">clear</button>
              )}
            </div>
            <button
              type="submit"
              disabled={submitting || !body.trim()}
              className="inline-flex items-center gap-1.5 h-8 px-4 rounded-lg bg-yellow-brand hover:bg-yellow-hover disabled:opacity-50 text-[oklch(0.12_0_0)] text-xs font-medium transition-colors"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Post
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

// ── Reply thread ─────────────────────────────────────────────────────────────

function ReplyThread({
  tasteTestId,
  initialReplies,
  currentUser,
}: {
  tasteTestId: string;
  initialReplies: TasteTestReplyData[];
  currentUser?: { id: string; username: string; displayName: string; avatarUrl?: string | null } | null;
}) {
  const [replies, setReplies] = useState<TasteTestReplyData[]>(initialReplies);
  const [open, setOpen] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim() || !currentUser) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/taste-tests/${tasteTestId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyBody.trim() }),
      });
      if (res.ok) {
        const reply = await res.json();
        setReplies((prev) => [...prev, reply]);
        setReplyBody("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border-t border-border">
      {/* Toggle replies */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-left"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        {replies.length > 0 ? `${replies.length} repl${replies.length === 1 ? "y" : "ies"}` : "Reply"}
        {open ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {replies.map((r) => (
            <div key={r.id} className="flex gap-2.5">
              <Avatar className="h-6 w-6 shrink-0">
                <AvatarImage src={r.author.avatarUrl ?? undefined} />
                <AvatarFallback className="text-[9px] bg-yellow-light">{r.author.displayName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 bg-muted/40 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-foreground">{r.author.displayName}</span>
                  <span className="text-[11px] text-muted-foreground">{fmtDate(r.createdAt)}</span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">{r.body}</p>
              </div>
            </div>
          ))}

          {currentUser && (
            <form onSubmit={handleReply} className="flex gap-2.5">
              <Avatar className="h-6 w-6 shrink-0">
                <AvatarImage src={currentUser.avatarUrl ?? undefined} />
                <AvatarFallback className="text-[9px] bg-yellow-light">{currentUser.displayName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <input
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-brand/40 focus:border-yellow-brand/60 transition-colors"
                />
                <button
                  type="submit"
                  disabled={submitting || !replyBody.trim()}
                  className="inline-flex items-center gap-1 h-8 px-3 rounded-lg bg-yellow-brand hover:bg-yellow-hover disabled:opacity-50 text-[oklch(0.12_0_0)] text-xs font-medium transition-colors shrink-0"
                >
                  {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function SuggestionCard({ tt, currentUser }: { tt: TasteTestData; currentUser?: { id: string; username: string; displayName: string; avatarUrl?: string | null } | null }) {
  const statusColor =
    tt.status === "OPEN"
      ? "text-green-500 bg-green-500/10 border-green-500/20"
      : tt.status === "MERGED"
        ? "text-purple-500 bg-purple-500/10 border-purple-500/20"
        : "text-muted-foreground bg-muted border-border";
  const StatusIcon =
    tt.status === "MERGED" ? GitMerge : tt.status === "OPEN" ? GitFork : X;
  const dateStr = fmtDate(tt.createdAt);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        <span
          className={`mt-0.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium shrink-0 ${statusColor}`}
        >
          <StatusIcon className="w-3 h-3" />
          {tt.status.toLowerCase()}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{tt.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <Avatar className="h-4 w-4">
              <AvatarImage src={tt.author.avatarUrl ?? undefined} />
              <AvatarFallback className="text-[8px] bg-yellow-light">
                {tt.author.displayName[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              by {tt.author.username} · {dateStr}
            </span>
          </div>
        </div>
        {tt.status === "OPEN" && (
          <div className="flex gap-2 shrink-0">
            <button className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 text-xs font-medium transition-colors border border-green-500/20">
              <Check className="w-3 h-3" /> Merge
            </button>
            <button className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground text-xs font-medium transition-colors">
              <X className="w-3 h-3" /> Close
            </button>
          </div>
        )}
      </div>

      {tt.diff && (
        <div className="border-t border-border font-mono text-xs">
          {tt.diff.map((d, i) => (
            <div key={i}>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-red-500/5 text-red-500 border-b border-border/50">
                <span className="w-4 shrink-0 font-bold">−</span>
                <span className="text-muted-foreground mr-2">{d.ingredient}:</span>
                <span>{d.from}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-green-500/5 text-green-600 dark:text-green-400">
                <span className="w-4 shrink-0 font-bold">+</span>
                <span className="text-muted-foreground mr-2">{d.ingredient}:</span>
                <span>{d.to}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ReplyThread
        tasteTestId={tt.id}
        initialReplies={tt.replies ?? []}
        currentUser={currentUser}
      />
    </div>
  );
}

function CommentCard({ tt, currentUser }: { tt: TasteTestData; currentUser?: { id: string; username: string; displayName: string; avatarUrl?: string | null } | null }) {
  const dateStr = fmtDate(tt.createdAt);
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex gap-3 p-4">
        <Avatar className="h-8 w-8 shrink-0 mt-0.5">
          <AvatarImage src={tt.author.avatarUrl ?? undefined} />
          <AvatarFallback className="text-xs bg-yellow-light">
            {tt.author.displayName[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-foreground">{tt.author.displayName}</span>
            <span className="text-xs text-muted-foreground">· {dateStr}</span>
            {tt.rating && (
              <span className="ml-auto flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < tt.rating!
                        ? "text-yellow-brand fill-yellow-brand/60"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </span>
            )}
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed">{tt.body}</p>
        </div>
      </div>

      <ReplyThread
        tasteTestId={tt.id}
        initialReplies={tt.replies ?? []}
        currentUser={currentUser}
      />
    </div>
  );
}

function StatRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto font-medium text-foreground">{value}</span>
    </div>
  );
}
