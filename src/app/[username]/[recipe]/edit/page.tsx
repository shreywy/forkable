"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Save, FileJson, FileText, Plus, X,
  BookOpen, GitCommitHorizontal, Loader2,
} from "lucide-react";
import { MOCK_RECIPES } from "@/lib/mock-data";

const UNITS = [
  "g", "kg", "ml", "L", "cups", "tbsp", "tsp", "oz", "lb", "whole", "bunch", "to taste",
];

const AVAILABLE_TAGS = [
  "Vegan", "Baking", "Quick", "Breakfast", "Soups",
  "Asian", "BBQ", "World", "Dinner", "Lunch",
  "Gluten-Free", "High-Protein", "Italian", "Mexican", "Japanese", "Thai",
];

let nextId = 100;
function uid() { return nextId++; }

type ActiveFile = "readme" | "ingredients" | "instructions";

function FileHeader({ filename, icon }: { filename: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/40 border border-border rounded-t-xl">
      {icon}
      <span className="text-xs font-mono font-medium text-foreground">{filename}</span>
    </div>
  );
}

export default function RecipeEditPage() {
  const params = useParams<{ username: string; recipe: string }>();
  const router = useRouter();

  const recipe = MOCK_RECIPES.find(
    (r) => r.owner.username === params.username && r.slug === params.recipe,
  );

  const [activeFile, setActiveFile] = useState<ActiveFile>("readme");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tweakMessage, setTweakMessage] = useState("");
  const [showCommitDialog, setShowCommitDialog] = useState(false);

  // Editable state seeded from recipe
  const [name, setName] = useState(recipe?.name ?? "");
  const [description, setDescription] = useState(recipe?.description ?? "");
  const [tags, setTags] = useState<Set<string>>(new Set(recipe?.tags ?? []));

  // Mock ingredients (derived from recipe name — in Phase 2 from DB)
  const [ingredients, setIngredients] = useState([
    { id: uid(), name: "Main ingredient", amount: "200", unit: "g" },
    { id: uid(), name: "Secondary ingredient", amount: "2", unit: "whole" },
    { id: uid(), name: "Seasoning", amount: "1", unit: "tsp" },
  ]);

  const [steps, setSteps] = useState(
    recipe?.instructions.map((s) => ({ id: uid(), text: s.text })) ?? [],
  );

  if (!recipe) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">Recipe not found.</p>
          <Link href="/" className="text-yellow-brand hover:underline text-sm">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  // Only the owner can edit
  if (params.username !== "shrey") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">You don&apos;t have permission to edit this recipe.</p>
          <Link
            href={`/${params.username}/${params.recipe}`}
            className="text-yellow-brand hover:underline text-sm"
          >
            View recipe
          </Link>
        </div>
      </div>
    );
  }

  const toggleTag = (tag: string) => {
    setTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag); else next.add(tag);
      return next;
    });
  };

  const updateIngredient = (id: number, field: "name" | "amount" | "unit", value: string) =>
    setIngredients((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  const updateStep = (id: number, text: string) =>
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, text } : s)));

  const handleSave = () => {
    setShowCommitDialog(true);
  };

  const handleCommit = () => {
    setSaving(true);
    // Simulate save delay
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setShowCommitDialog(false);
      setTimeout(() => {
        router.push(`/${params.username}/${params.recipe}`);
      }, 1000);
    }, 1200);
  };

  const FILES: { id: ActiveFile; label: string; icon: React.ReactNode }[] = [
    { id: "readme",       label: "README.md",       icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: "ingredients",  label: "ingredients.json", icon: <FileJson className="w-3.5 h-3.5" /> },
    { id: "instructions", label: "instructions.md",  icon: <FileText className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="sticky top-14 z-40 border-b border-border bg-card">
        <div className="max-w-[1080px] mx-auto px-4 h-12 flex items-center gap-4">
          <Link
            href={`/${params.username}/${params.recipe}`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to recipe</span>
          </Link>

          <div className="flex-1" />

          <p className="text-sm text-muted-foreground hidden sm:block">
            Editing{" "}
            <span className="font-medium text-foreground">{recipe.name}</span>
          </p>

          <div className="flex-1" />

          {saved && (
            <span className="text-sm text-green-500 font-medium">Saved!</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 h-8 px-4 rounded-lg bg-yellow-brand hover:bg-yellow-hover text-[oklch(0.12_0_0)] text-xs font-semibold transition-colors disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Save tweak
          </button>
        </div>
      </div>

      <div className="max-w-[1080px] mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* ── File tree sidebar ────────────────────────────────────────────── */}
          <aside className="w-52 shrink-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
              Files
            </p>
            <div className="space-y-0.5">
              {FILES.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFile(f.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                    activeFile === f.id
                      ? "bg-yellow-subtle dark:bg-yellow-muted text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <span className={activeFile === f.id ? "text-yellow-brand" : ""}>{f.icon}</span>
                  <span className="font-mono text-xs truncate">{f.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 px-2">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Click a file to edit it. Changes are committed as a single tweak.
              </p>
            </div>
          </aside>

          {/* ── Editor ──────────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* README.md */}
            {activeFile === "readme" && (
              <div>
                <FileHeader
                  filename="README.md"
                  icon={<BookOpen className="w-3.5 h-3.5 text-yellow-brand" />}
                />
                <div className="border border-t-0 border-border rounded-b-xl p-5 space-y-5 bg-card">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Recipe name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-yellow-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-yellow-brand resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_TAGS.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                            tags.has(tag)
                              ? "bg-yellow-brand border-yellow-brand text-[oklch(0.12_0_0)]"
                              : "border-border bg-background text-muted-foreground hover:border-yellow-brand/50 hover:text-foreground"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ingredients.json */}
            {activeFile === "ingredients" && (
              <div>
                <FileHeader
                  filename="ingredients.json"
                  icon={<FileJson className="w-3.5 h-3.5 text-yellow-brand" />}
                />
                <div className="border border-t-0 border-border rounded-b-xl p-4 space-y-2 bg-card">
                  <div className="grid grid-cols-[1fr_100px_120px_28px] gap-2 px-1">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Ingredient</span>
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Amount</span>
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Unit</span>
                    <span />
                  </div>

                  {ingredients.map((ing) => (
                    <div key={ing.id} className="grid grid-cols-[1fr_100px_120px_28px] gap-2 items-center">
                      <input
                        type="text"
                        value={ing.name}
                        onChange={(e) => updateIngredient(ing.id, "name", e.target.value)}
                        className="h-9 px-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-yellow-brand"
                      />
                      <input
                        type="number"
                        value={ing.amount}
                        onChange={(e) => updateIngredient(ing.id, "amount", e.target.value)}
                        min={0}
                        className="h-9 px-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-yellow-brand"
                      />
                      <select
                        value={ing.unit}
                        onChange={(e) => updateIngredient(ing.id, "unit", e.target.value)}
                        className="h-9 px-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-yellow-brand text-foreground"
                      >
                        {UNITS.map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setIngredients((prev) => prev.filter((i) => i.id !== ing.id))}
                        className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => setIngredients((prev) => [...prev, { id: uid(), name: "", amount: "", unit: "g" }])}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-1.5 rounded-lg border border-dashed border-border transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add ingredient
                  </button>
                </div>
              </div>
            )}

            {/* instructions.md */}
            {activeFile === "instructions" && (
              <div>
                <FileHeader
                  filename="instructions.md"
                  icon={<FileText className="w-3.5 h-3.5 text-yellow-brand" />}
                />
                <div className="border border-t-0 border-border rounded-b-xl p-4 space-y-3 bg-card">
                  {steps.map((s, idx) => (
                    <div key={s.id} className="flex gap-3 items-start">
                      <div className="shrink-0 w-7 h-7 rounded-full bg-yellow-brand flex items-center justify-center text-[oklch(0.12_0_0)] text-xs font-bold mt-1">
                        {idx + 1}
                      </div>
                      <textarea
                        value={s.text}
                        onChange={(e) => updateStep(s.id, e.target.value)}
                        rows={3}
                        className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-yellow-brand resize-none leading-relaxed"
                      />
                      {steps.length > 1 && (
                        <button
                          onClick={() => setSteps((prev) => prev.filter((st) => st.id !== s.id))}
                          className="shrink-0 h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors mt-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={() => setSteps((prev) => [...prev, { id: uid(), text: "" }])}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-1.5 rounded-lg border border-dashed border-border transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add step
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Commit dialog ────────────────────────────────────────────────────── */}
      {showCommitDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowCommitDialog(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <GitCommitHorizontal className="w-5 h-5 text-yellow-brand" />
              <h2 className="text-base font-semibold text-foreground">Commit changes</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Tweak message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={tweakMessage}
                onChange={(e) => setTweakMessage(e.target.value)}
                rows={2}
                placeholder="Describe what you changed and why…"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-yellow-brand resize-none placeholder:text-muted-foreground"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              This tweak will be saved to the history of{" "}
              <span className="font-medium text-foreground">{recipe.name}</span>.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCommitDialog(false)}
                className="flex-1 h-9 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCommit}
                disabled={!tweakMessage.trim() || saving}
                className="flex-1 h-9 rounded-lg bg-yellow-brand hover:bg-yellow-hover text-[oklch(0.12_0_0)] text-sm font-semibold transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Commit tweak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
