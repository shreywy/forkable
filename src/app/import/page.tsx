"use client";

import { useState } from "react";
import {
  Link2,
  ClipboardPaste,
  ChefHat,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  X,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";
import type { ParsedRecipe } from "@/lib/recipe-parser";
import { parseTextRecipe } from "@/lib/recipe-parser";

type ImportTab = "url" | "paste";

const CONFIRMED_SITES = [
  "BBC Good Food",
  "Bon Appétit",
  "RecipeTin Eats",
  "Taste of Home",
  "The Pioneer Woman",
  "Love & Lemons",
];

const BLOCKED_SITES = [
  "Allrecipes",
  "Serious Eats",
  "Simply Recipes",
];

const CONFIDENCE_LABEL: Record<ParsedRecipe["confidence"], { label: string; color: string }> = {
  high:   { label: "High confidence - ready to publish", color: "text-green-500" },
  medium: { label: "Medium - review before publishing",   color: "text-yellow-500" },
  low:    { label: "Low - needs manual editing",           color: "text-red-500" },
};

export default function ImportRecipePage() {
  const [tab, setTab] = useState<ImportTab>("url");
  const [url, setUrl]             = useState("");
  const [pasteText, setPasteText] = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [recipe, setRecipe]       = useState<ParsedRecipe | null>(null);

  // ── Editable fields ─────────────────────────────────────────────────────────
  const [name, setName]                 = useState("");
  const [description, setDescription]  = useState("");
  const [ingredients, setIngredients]  = useState<string[]>([]);
  const [instructions, setInstructions]= useState<string[]>([]);

  function populateEditable(r: ParsedRecipe) {
    setName(r.name);
    setDescription(r.description);
    setIngredients(r.ingredients);
    setInstructions(r.instructions);
  }

  // ── Import from URL ──────────────────────────────────────────────────────────
  async function handleUrlImport() {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setRecipe(null);

    try {
      const res = await fetch("/api/import/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        // 403 usually means Cloudflare/bot protection (Allrecipes, Serious Eats, etc.)
        const msg = res.status === 502 && data.error?.includes("403")
          ? "This site blocks automated access. Open the recipe page, copy all the text, and use the 'Paste text' tab instead."
          : (data.error ?? "Something went wrong");
        setError(msg);
      } else {
        setRecipe(data as ParsedRecipe);
        populateEditable(data as ParsedRecipe);
      }
    } catch {
      setError("Network error - please try again");
    } finally {
      setLoading(false);
    }
  }

  // ── Import from paste ────────────────────────────────────────────────────────
  function handlePasteImport() {
    if (!pasteText.trim()) return;
    const parsed = parseTextRecipe(pasteText);
    setRecipe(parsed);
    populateEditable(parsed);
    setError(null);
  }

  // ── Remove helpers ───────────────────────────────────────────────────────────
  function removeIngredient(i: number) {
    setIngredients((prev) => prev.filter((_, idx) => idx !== i));
  }
  function removeInstruction(i: number) {
    setInstructions((prev) => prev.filter((_, idx) => idx !== i));
  }

  const conf = recipe ? CONFIDENCE_LABEL[recipe.confidence] : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* Heading */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Import a recipe</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pull in a recipe from a URL or paste text - we&apos;ll parse it automatically.
          </p>
        </div>

        {/* ── Input card ──────────────────────────────────────────────────── */}
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          {/* Tab bar */}
          <div className="flex border-b border-border">
            {(["url", "paste"] as ImportTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  tab === t
                    ? "bg-yellow-subtle dark:bg-yellow-muted text-foreground border-b-2 border-yellow-brand -mb-px"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {t === "url" ? <Link2 className="w-4 h-4" /> : <ClipboardPaste className="w-4 h-4" />}
                {t === "url" ? "From URL" : "Paste text"}
              </button>
            ))}
          </div>

          <div className="p-6">
            {tab === "url" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Recipe URL
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => { setUrl(e.target.value); setError(null); }}
                        onKeyDown={(e) => e.key === "Enter" && handleUrlImport()}
                        placeholder="https://www.allrecipes.com/recipe/..."
                        className="w-full h-10 pl-9 pr-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-yellow-brand placeholder:text-muted-foreground"
                      />
                    </div>
                    <button
                      onClick={handleUrlImport}
                      disabled={!url.trim() || loading}
                      className="h-10 px-5 rounded-lg bg-yellow-brand text-[oklch(0.12_0_0)] text-sm font-semibold hover:bg-yellow-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Import
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Confirmed working:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {CONFIRMED_SITES.map((site) => (
                      <span
                        key={site}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 text-xs text-green-400 border border-green-500/20"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {site}
                      </span>
                    ))}
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-xs text-muted-foreground border border-border">
                      + most food blogs
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-0.5">
                    <span className="text-muted-foreground/60">Bot-blocked (use paste instead): </span>
                    {BLOCKED_SITES.join(", ")}
                  </p>
                </div>
              </div>
            )}

            {tab === "paste" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Paste recipe text
                  </label>
                  <textarea
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    rows={8}
                    placeholder={"Chocolate Chip Cookies\n\nIngredients\n2 cups all-purpose flour\n1 tsp baking soda\n...\n\nInstructions\n1. Preheat oven to 375°F\n2. ..."}
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-yellow-brand placeholder:text-muted-foreground resize-none leading-relaxed min-h-40 font-mono"
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Tip: Include the title on the first line, then ingredient amounts, then numbered steps.
                  </p>
                </div>
                <button
                  onClick={handlePasteImport}
                  disabled={!pasteText.trim()}
                  className="w-full h-10 rounded-lg bg-yellow-brand text-[oklch(0.12_0_0)] text-sm font-semibold hover:bg-yellow-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Parse &amp; Preview
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Error ─────────────────────────────────────────────────────────── */}
        {error && (
          <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="flex-1">{error}</span>
            {error.includes("Paste text") && (
              <button
                onClick={() => { setTab("paste"); setError(null); }}
                className="shrink-0 text-xs underline underline-offset-2 hover:text-red-300 whitespace-nowrap"
              >
                Switch to paste →
              </button>
            )}
          </div>
        )}

        {/* ── Preview ───────────────────────────────────────────────────────── */}
        <div className="mt-6">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Preview
          </p>

          {!recipe ? (
            <div className="rounded-xl border-2 border-dashed border-border p-12 flex flex-col items-center justify-center text-center bg-card">
              <ChefHat className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">Recipe preview will appear here</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                After importing, you can review and edit before publishing.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card overflow-hidden">

              {/* Confidence banner */}
              {conf && (
                <div className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b border-border ${
                  recipe.confidence === "high"
                    ? "bg-green-500/10 text-green-400"
                    : recipe.confidence === "medium"
                    ? "bg-yellow-500/10 text-yellow-400"
                    : "bg-red-500/10 text-red-400"
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {conf.label}
                  {recipe.sourceUrl && (
                    <a
                      href={recipe.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto flex items-center gap-1 opacity-70 hover:opacity-100"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {recipe.sourceSite}
                    </a>
                  )}
                </div>
              )}

              <div className="p-5 space-y-5">

                {/* Image */}
                {recipe.imageUrl && (
                  <div className="relative rounded-lg overflow-hidden bg-muted aspect-video">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={recipe.imageUrl}
                      alt={name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
                {!recipe.imageUrl && (
                  <div className="rounded-lg bg-muted aspect-video flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Recipe name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 px-3 text-sm font-semibold rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-yellow-brand"
                  />
                </div>

                {/* Description */}
                {description && (
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-yellow-brand resize-none leading-relaxed"
                    />
                  </div>
                )}

                {/* Meta row */}
                {(recipe.servings || recipe.prepTime || recipe.cookTime || recipe.totalTime) && (
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {recipe.servings && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {recipe.servings}
                      </span>
                    )}
                    {recipe.prepTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Prep: {recipe.prepTime}
                      </span>
                    )}
                    {recipe.cookTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Cook: {recipe.cookTime}
                      </span>
                    )}
                    {recipe.totalTime && (
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <Clock className="w-3.5 h-3.5" /> Total: {recipe.totalTime}
                      </span>
                    )}
                  </div>
                )}

                {/* Tags */}
                {recipe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {recipe.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground border border-border">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Ingredients */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">
                    Ingredients ({ingredients.length})
                  </label>
                  <ul className="space-y-1.5">
                    {ingredients.map((ing, i) => (
                      <li key={i} className="flex items-start gap-2 group">
                        <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-yellow-brand shrink-0 mt-2" />
                        <span className="flex-1 text-sm text-foreground leading-snug">{ing}</span>
                        <button
                          onClick={() => removeIngredient(i)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400 shrink-0 mt-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">
                    Instructions ({instructions.length} steps)
                  </label>
                  <ol className="space-y-2">
                    {instructions.map((step, i) => (
                      <li key={i} className="flex items-start gap-3 group">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-yellow-brand text-[oklch(0.12_0_0)] text-xs font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        <span className="flex-1 text-sm text-foreground leading-relaxed">{step}</span>
                        <button
                          onClick={() => removeInstruction(i)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400 shrink-0 mt-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Nutrition */}
                {Object.values(recipe.nutrition).some(Boolean) && (
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2">
                      Nutrition (per serving)
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {([
                        ["Calories", recipe.nutrition.calories],
                        ["Protein",  recipe.nutrition.protein],
                        ["Carbs",    recipe.nutrition.carbs],
                        ["Fat",      recipe.nutrition.fat],
                        ["Fiber",    recipe.nutrition.fiber],
                      ] as [string, string | undefined][]).map(([label, val]) =>
                        val ? (
                          <div key={label} className="text-center p-2 rounded-lg bg-muted">
                            <p className="text-[10px] text-muted-foreground">{label}</p>
                            <p className="text-xs font-semibold text-foreground mt-0.5">{val}</p>
                          </div>
                        ) : null
                      )}
                    </div>
                  </div>
                )}

                {/* Publish button */}
                <div className="pt-2 flex gap-3">
                  <button
                    disabled={!name.trim() || ingredients.length === 0 || instructions.length === 0}
                    className="flex-1 h-10 rounded-lg bg-yellow-brand text-[oklch(0.12_0_0)] text-sm font-semibold hover:bg-yellow-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Publish to my profile
                  </button>
                  <button
                    onClick={() => { setRecipe(null); setUrl(""); setPasteText(""); setError(null); }}
                    className="h-10 px-4 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    Start over
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
