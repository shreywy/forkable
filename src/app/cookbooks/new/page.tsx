"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Library, Plus, X, Lock, Globe, ChevronRight, CheckCircle2 } from "lucide-react";
import { MOCK_RECIPES } from "@/lib/mock-data";

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function NewCookbookPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(new Set());
  const [created, setCreated] = useState(false);

  const slug = toSlug(name);

  const toggleRecipe = (id: string) => {
    setSelectedRecipes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Recipes by shrey
  const shreyRecipes = MOCK_RECIPES.filter((r) => r.owner.username === "shrey");
  const otherRecipes = MOCK_RECIPES.filter((r) => r.owner.username !== "shrey").slice(0, 6);

  if (created) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-sm w-full mx-auto px-4 text-center space-y-5">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-yellow-subtle dark:bg-yellow-muted mx-auto">
            <Library className="w-8 h-8 text-yellow-brand" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{name || "Cookbook"} created!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your cookbook is ready. Add more recipes anytime.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href={`/shrey/cookbooks/${slug || "my-cookbook"}`}
              className="h-10 rounded-lg bg-yellow-brand hover:bg-yellow-hover text-[oklch(0.12_0_0)] text-sm font-semibold transition-colors flex items-center justify-center"
            >
              View cookbook
            </Link>
            <Link
              href="/shrey"
              className="h-10 rounded-lg border border-border bg-background hover:bg-muted text-sm font-medium text-foreground transition-colors flex items-center justify-center"
            >
              Go to profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/shrey"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to profile
          </Link>
          <div className="flex items-center gap-3 mt-4">
            <Library className="w-6 h-6 text-yellow-brand" />
            <h1 className="text-2xl font-bold text-foreground">New cookbook</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Cookbooks let you organise recipes into themed collections.
          </p>
        </div>

        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Weeknight Wins"
              className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-yellow-brand placeholder:text-muted-foreground"
            />
            {name && (
              <p className="mt-1.5 text-xs text-muted-foreground font-mono">
                forkable.com/you/cookbooks/{slug}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="What's this collection about?"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-yellow-brand placeholder:text-muted-foreground resize-none"
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Visibility</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: true, icon: <Globe className="w-4 h-4" />, label: "Public", sub: "Anyone can view and follow this cookbook." },
                { value: false, icon: <Lock className="w-4 h-4" />, label: "Private", sub: "Only you can see this cookbook." },
              ].map(({ value, icon, label, sub }) => (
                <button
                  key={label}
                  onClick={() => setIsPublic(value)}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    isPublic === value
                      ? "border-yellow-brand bg-yellow-subtle dark:bg-yellow-muted"
                      : "border-border bg-card hover:border-yellow-brand/40"
                  }`}
                >
                  <span className={`mt-0.5 ${isPublic === value ? "text-yellow-brand" : "text-muted-foreground"}`}>
                    {icon}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Add recipes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-foreground">
                Add recipes
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  ({selectedRecipes.size} selected)
                </span>
              </label>
            </div>

            {/* Your recipes */}
            {shreyRecipes.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Your recipes</p>
                <div className="space-y-2">
                  {shreyRecipes.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => toggleRecipe(r.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                        selectedRecipes.has(r.id)
                          ? "border-yellow-brand bg-yellow-subtle dark:bg-yellow-muted"
                          : "border-border bg-card hover:border-yellow-brand/40"
                      }`}
                    >
                      <div className="shrink-0 w-10 h-10 rounded-md overflow-hidden bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{r.name}</p>
                        <p className="text-xs text-muted-foreground">⭐ {r.stars.toLocaleString()}</p>
                      </div>
                      {selectedRecipes.has(r.id) ? (
                        <CheckCircle2 className="w-4 h-4 text-yellow-brand shrink-0" />
                      ) : (
                        <Plus className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Other recipes */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Browse recipes</p>
              <div className="space-y-2">
                {otherRecipes.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => toggleRecipe(r.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                      selectedRecipes.has(r.id)
                        ? "border-yellow-brand bg-yellow-subtle dark:bg-yellow-muted"
                        : "border-border bg-card hover:border-yellow-brand/40"
                    }`}
                  >
                    <div className="shrink-0 w-10 h-10 rounded-md overflow-hidden bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{r.name}</p>
                      <p className="text-xs text-muted-foreground">by {r.owner.username} · ⭐ {r.stars.toLocaleString()}</p>
                    </div>
                    {selectedRecipes.has(r.id) ? (
                      <CheckCircle2 className="w-4 h-4 text-yellow-brand shrink-0" />
                    ) : (
                      <Plus className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Create button */}
          <button
            onClick={() => setCreated(true)}
            disabled={!name.trim()}
            className="w-full h-10 rounded-lg bg-yellow-brand hover:bg-yellow-hover text-[oklch(0.12_0_0)] text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Library className="w-4 h-4" />
            Create cookbook
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
