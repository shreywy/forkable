"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Save, FileJson, FileText, BookOpen,
  GitCommitHorizontal, Loader2, Plus, X, ChevronRight, ChevronDown,
  Folder, FolderOpen,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type EditIngredient = {
  id: string;
  ingredientId: string;
  name: string;
  amount: string;
  unit: string;
};

export type EditStep = {
  id: string;
  content: string;
};

export type EditComponent = {
  id: string;
  name: string;
  displayName: string;
  ingredients: EditIngredient[];
  steps: EditStep[];
};

export type EditRecipeData = {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string | null;
  tags: string[];
  components: EditComponent[];
};

// ── Constants ─────────────────────────────────────────────────────────────────

const UNITS = ["g", "kg", "ml", "L", "cups", "tbsp", "tsp", "oz", "lb", "whole", "bunch", "cloves", "to taste"];

const AVAILABLE_TAGS = [
  { slug: "vegan", label: "Vegan" },
  { slug: "vegetarian", label: "Vegetarian" },
  { slug: "baking", label: "Baking" },
  { slug: "quick", label: "Quick" },
  { slug: "breakfast", label: "Breakfast" },
  { slug: "soups", label: "Soups" },
  { slug: "asian", label: "Asian" },
  { slug: "bbq", label: "BBQ" },
  { slug: "world", label: "World" },
  { slug: "dinner", label: "Dinner" },
  { slug: "lunch", label: "Lunch" },
  { slug: "gluten-free", label: "Gluten-Free" },
  { slug: "high-protein", label: "High-Protein" },
  { slug: "italian", label: "Italian" },
  { slug: "mexican", label: "Mexican" },
  { slug: "japanese", label: "Japanese" },
  { slug: "thai", label: "Thai" },
];

let _uid = 0;
function uid() { return `new-${++_uid}`; }

// ── Selected file descriptor ──────────────────────────────────────────────────

type SelectedFile =
  | { kind: "readme" }
  | { kind: "ingredients"; componentId: string }
  | { kind: "instructions"; componentId: string };

// ── FileHeader ────────────────────────────────────────────────────────────────

function FileHeader({ filename, icon }: { filename: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/40 border border-border rounded-t-xl">
      {icon}
      <span className="text-xs font-mono font-medium text-foreground">{filename}</span>
    </div>
  );
}

// ── Main EditClient ───────────────────────────────────────────────────────────

interface Props {
  recipe: EditRecipeData;
  username: string;
}

export function EditClient({ recipe: initialRecipe, username }: Props) {
  const router = useRouter();

  // Editable state
  const [name, setName] = useState(initialRecipe.name);
  const [description, setDescription] = useState(initialRecipe.description);
  const [tags, setTags] = useState<Set<string>>(new Set(initialRecipe.tags));
  const [components, setComponents] = useState<EditComponent[]>(initialRecipe.components);

  // UI state
  const [selected, setSelected] = useState<SelectedFile>({ kind: "readme" });
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(initialRecipe.components.map((c) => c.id)),
  );
  const [tweakMessage, setTweakMessage] = useState("");
  const [showCommit, setShowCommit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const toggleFolder = (id: string) =>
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const toggleTag = (slug: string) =>
    setTags((prev) => { const n = new Set(prev); if (n.has(slug)) n.delete(slug); else n.add(slug); return n; });

  // ── Ingredient helpers ───────────────────────────────────────────────────

  const updateIngredient = (compId: string, ingId: string, field: keyof EditIngredient, value: string) =>
    setComponents((prev) => prev.map((c) =>
      c.id !== compId ? c : {
        ...c,
        ingredients: c.ingredients.map((i) => i.id !== ingId ? i : { ...i, [field]: value }),
      }
    ));

  const addIngredient = (compId: string) =>
    setComponents((prev) => prev.map((c) =>
      c.id !== compId ? c : {
        ...c,
        ingredients: [...c.ingredients, { id: uid(), ingredientId: uid(), name: "", amount: "", unit: "g" }],
      }
    ));

  const removeIngredient = (compId: string, ingId: string) =>
    setComponents((prev) => prev.map((c) =>
      c.id !== compId ? c : { ...c, ingredients: c.ingredients.filter((i) => i.id !== ingId) }
    ));

  // ── Step helpers ─────────────────────────────────────────────────────────

  const updateStep = (compId: string, stepId: string, content: string) =>
    setComponents((prev) => prev.map((c) =>
      c.id !== compId ? c : {
        ...c,
        steps: c.steps.map((s) => s.id !== stepId ? s : { ...s, content }),
      }
    ));

  const addStep = (compId: string) =>
    setComponents((prev) => prev.map((c) =>
      c.id !== compId ? c : { ...c, steps: [...c.steps, { id: uid(), content: "" }] }
    ));

  const removeStep = (compId: string, stepId: string) =>
    setComponents((prev) => prev.map((c) =>
      c.id !== compId ? c : { ...c, steps: c.steps.filter((s) => s.id !== stepId) }
    ));

  // ── Save ─────────────────────────────────────────────────────────────────

  const handleCommit = async () => {
    if (!tweakMessage.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/recipes/${username}/${initialRecipe.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          tags: [...tags],
          components: components.map((c) => ({
            id: c.id,
            ingredients: c.ingredients.filter((i) => i.name.trim()),
            steps: c.steps.filter((s) => s.content.trim()),
          })),
          tweakMessage,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setSaveError(d.error ?? "Save failed");
        return;
      }
      setShowCommit(false);
      router.push(`/${username}/${initialRecipe.slug}`);
      router.refresh();
    } catch {
      setSaveError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Derive active component for editors ──────────────────────────────────

  const activeComponent =
    selected.kind !== "readme"
      ? components.find((c) => c.id === selected.componentId) ?? null
      : null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-14 z-40 border-b border-border bg-card">
        <div className="max-w-[1200px] mx-auto px-4 h-12 flex items-center gap-4">
          <Link
            href={`/${username}/${initialRecipe.slug}`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to recipe</span>
          </Link>
          <div className="flex-1" />
          <p className="text-sm text-muted-foreground hidden sm:block">
            Editing <span className="font-medium text-foreground">{name || initialRecipe.name}</span>
          </p>
          <div className="flex-1" />
          <button
            onClick={() => setShowCommit(true)}
            className="inline-flex items-center gap-1.5 h-8 px-4 rounded-lg bg-yellow-brand hover:bg-yellow-hover text-[oklch(0.12_0_0)] text-xs font-semibold transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            Save tweak
          </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* ── File tree sidebar ─────────────────────────────────────────── */}
          <aside className="w-56 shrink-0">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
              Files
            </p>
            <div className="space-y-0.5">
              {/* README.md */}
              <button
                onClick={() => setSelected({ kind: "readme" })}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-left transition-colors ${
                  selected.kind === "readme"
                    ? "bg-yellow-subtle dark:bg-yellow-muted text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <BookOpen className={`w-3.5 h-3.5 shrink-0 ${selected.kind === "readme" ? "text-yellow-brand" : ""}`} />
                <span className="font-mono text-xs">README.md</span>
              </button>

              {/* Component folders */}
              {components.map((comp) => {
                const isOpen = expandedFolders.has(comp.id);
                const ingSelected = selected.kind === "ingredients" && selected.componentId === comp.id;
                const stepsSelected = selected.kind === "instructions" && selected.componentId === comp.id;

                return (
                  <div key={comp.id}>
                    <button
                      onClick={() => toggleFolder(comp.id)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-left text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      {isOpen
                        ? <FolderOpen className="w-3.5 h-3.5 shrink-0 text-yellow-brand" />
                        : <Folder className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />}
                      <span className="font-mono text-xs truncate flex-1 text-left">{comp.displayName}</span>
                      {isOpen ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronRight className="w-3 h-3 shrink-0" />}
                    </button>

                    {isOpen && (
                      <div className="ml-5 mt-0.5 space-y-0.5">
                        <button
                          onClick={() => setSelected({ kind: "ingredients", componentId: comp.id })}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-left transition-colors ${
                            ingSelected
                              ? "bg-yellow-subtle dark:bg-yellow-muted text-foreground font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          <FileJson className={`w-3.5 h-3.5 shrink-0 ${ingSelected ? "text-yellow-brand" : ""}`} />
                          <span className="font-mono text-xs">ingredients.json</span>
                        </button>
                        <button
                          onClick={() => setSelected({ kind: "instructions", componentId: comp.id })}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-left transition-colors ${
                            stepsSelected
                              ? "bg-yellow-subtle dark:bg-yellow-muted text-foreground font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          <FileText className={`w-3.5 h-3.5 shrink-0 ${stepsSelected ? "text-yellow-brand" : ""}`} />
                          <span className="font-mono text-xs">instructions.md</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="mt-5 px-2 text-[11px] text-muted-foreground leading-relaxed">
              Select a file to edit. All changes commit together as one tweak.
            </p>
          </aside>

          {/* ── Editor panel ──────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* README.md */}
            {selected.kind === "readme" && (
              <div>
                <FileHeader filename="README.md" icon={<BookOpen className="w-3.5 h-3.5 text-yellow-brand" />} />
                <div className="border border-t-0 border-border rounded-b-xl p-5 bg-card space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Recipe name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-yellow-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
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
                      {AVAILABLE_TAGS.map((t) => (
                        <button
                          key={t.slug}
                          onClick={() => toggleTag(t.slug)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                            tags.has(t.slug)
                              ? "bg-yellow-brand border-yellow-brand text-[oklch(0.12_0_0)]"
                              : "border-border bg-background text-muted-foreground hover:border-yellow-brand/50 hover:text-foreground"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ingredients.json */}
            {selected.kind === "ingredients" && activeComponent && (
              <div>
                <FileHeader
                  filename={`${activeComponent.displayName}/ingredients.json`}
                  icon={<FileJson className="w-3.5 h-3.5 text-yellow-brand" />}
                />
                <div className="border border-t-0 border-border rounded-b-xl p-4 bg-card space-y-2">
                  <div className="grid grid-cols-[1fr_90px_110px_32px] gap-2 px-1 mb-1">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Ingredient</span>
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Amount</span>
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Unit</span>
                    <span />
                  </div>

                  {activeComponent.ingredients.map((ing) => (
                    <div key={ing.id} className="grid grid-cols-[1fr_90px_110px_32px] gap-2 items-center">
                      <input
                        type="text"
                        value={ing.name}
                        onChange={(e) => updateIngredient(activeComponent.id, ing.id, "name", e.target.value)}
                        placeholder="e.g. Olive oil"
                        className="h-9 px-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-yellow-brand placeholder:text-muted-foreground/50"
                      />
                      <input
                        type="text"
                        value={ing.amount}
                        onChange={(e) => updateIngredient(activeComponent.id, ing.id, "amount", e.target.value)}
                        placeholder="200"
                        className="h-9 px-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-yellow-brand placeholder:text-muted-foreground/50"
                      />
                      <select
                        value={ing.unit}
                        onChange={(e) => updateIngredient(activeComponent.id, ing.id, "unit", e.target.value)}
                        className="h-9 px-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-yellow-brand text-foreground"
                      >
                        {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                      </select>
                      <button
                        onClick={() => removeIngredient(activeComponent.id, ing.id)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => addIngredient(activeComponent.id)}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-1.5 rounded-lg border border-dashed border-border transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add ingredient
                  </button>
                </div>
              </div>
            )}

            {/* instructions.md */}
            {selected.kind === "instructions" && activeComponent && (
              <div>
                <FileHeader
                  filename={`${activeComponent.displayName}/instructions.md`}
                  icon={<FileText className="w-3.5 h-3.5 text-yellow-brand" />}
                />
                <div className="border border-t-0 border-border rounded-b-xl p-4 bg-card space-y-3">
                  {activeComponent.steps.map((step, idx) => (
                    <div key={step.id} className="flex gap-3 items-start">
                      <div className="shrink-0 w-7 h-7 rounded-full bg-yellow-brand flex items-center justify-center text-[oklch(0.12_0_0)] text-xs font-bold mt-1">
                        {idx + 1}
                      </div>
                      <textarea
                        value={step.content}
                        onChange={(e) => updateStep(activeComponent.id, step.id, e.target.value)}
                        rows={3}
                        placeholder={`Step ${idx + 1}…`}
                        className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-yellow-brand resize-none leading-relaxed placeholder:text-muted-foreground/50"
                      />
                      {activeComponent.steps.length > 1 && (
                        <button
                          onClick={() => removeStep(activeComponent.id, step.id)}
                          className="shrink-0 h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors mt-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={() => addStep(activeComponent.id)}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-1.5 rounded-lg border border-dashed border-border transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add step
                  </button>
                </div>
              </div>
            )}

            {/* Placeholder when nothing selected */}
            {selected.kind !== "readme" && !activeComponent && (
              <div className="rounded-xl border border-dashed border-border bg-card h-48 flex items-center justify-center text-sm text-muted-foreground">
                Select a file from the sidebar to start editing
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Commit dialog ─────────────────────────────────────────────────────── */}
      {showCommit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !saving && setShowCommit(false)} />
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
                autoFocus
              />
            </div>

            {saveError && (
              <p className="text-sm text-red-500 bg-red-500/10 rounded-lg px-3 py-2">{saveError}</p>
            )}

            <p className="text-xs text-muted-foreground">
              This tweak will be saved to the history of{" "}
              <span className="font-medium text-foreground">{name}</span>.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCommit(false)}
                disabled={saving}
                className="flex-1 h-9 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
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
