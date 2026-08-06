"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  ChevronRight, ChevronLeft, Plus, X, Rocket, FileJson, FileText,
  GitFork, Image as ImageIcon, CheckCircle2, Tag, Loader2, Zap, Sparkles,
} from "lucide-react";
import { StepEditor } from "@/components/recipe/StepEditor";

// ── Types ─────────────────────────────────────────────────────────────────────

type Visibility = "public" | "private";

interface Ingredient {
  id: number;
  name: string;
  amount: string;
  unit: string;
  caloriesPer100g?: number; // fetched from OpenFoodFacts
}

interface Step {
  id: number;
  text: string;
}

// Global tag list - starts with defaults, users can add custom tags
const DEFAULT_TAGS = [
  "Vegan", "Baking", "Quick", "Breakfast", "Soups",
  "Asian", "BBQ", "World", "Dinner", "Lunch",
  "Italian", "Mexican", "Japanese", "Thai", "Gluten-Free",
  "High-Protein", "Dairy-Free", "Low-Carb", "Vegetarian", "Snack",
];

const UNITS = [
  "g", "kg", "ml", "L", "cups", "tbsp", "tsp", "oz", "lb", "whole", "bunch", "to taste",
];

// Mock nutritional data per 100g for common ingredients (simulates OpenFoodFacts)
const NUTRITION_DB: Record<string, { cal: number; protein: number; carbs: number; fat: number }> = {
  "eggs":           { cal: 147, protein: 13, carbs: 1,  fat: 10 },
  "egg":            { cal: 147, protein: 13, carbs: 1,  fat: 10 },
  "butter":         { cal: 717, protein: 1,  carbs: 0,  fat: 81 },
  "flour":          { cal: 364, protein: 10, carbs: 76, fat: 1  },
  "sugar":          { cal: 387, protein: 0,  carbs: 100,fat: 0  },
  "milk":           { cal: 61,  protein: 3,  carbs: 5,  fat: 3  },
  "olive oil":      { cal: 884, protein: 0,  carbs: 0,  fat: 100},
  "pasta":          { cal: 131, protein: 5,  carbs: 25, fat: 1  },
  "chicken":        { cal: 165, protein: 31, carbs: 0,  fat: 4  },
  "beef":           { cal: 250, protein: 26, carbs: 0,  fat: 17 },
  "pork":           { cal: 242, protein: 27, carbs: 0,  fat: 14 },
  "rice":           { cal: 130, protein: 3,  carbs: 28, fat: 0  },
  "potato":         { cal: 77,  protein: 2,  carbs: 17, fat: 0  },
  "onion":          { cal: 40,  protein: 1,  carbs: 9,  fat: 0  },
  "garlic":         { cal: 149, protein: 6,  carbs: 33, fat: 1  },
  "tomato":         { cal: 18,  protein: 1,  carbs: 4,  fat: 0  },
  "spinach":        { cal: 23,  protein: 3,  carbs: 4,  fat: 0  },
  "banana":         { cal: 89,  protein: 1,  carbs: 23, fat: 0  },
  "avocado":        { cal: 160, protein: 2,  carbs: 9,  fat: 15 },
  "coconut milk":   { cal: 230, protein: 2,  carbs: 6,  fat: 24 },
  "chocolate":      { cal: 546, protein: 5,  carbs: 60, fat: 31 },
  "tahini":         { cal: 595, protein: 17, carbs: 21, fat: 54 },
  "miso":           { cal: 199, protein: 12, carbs: 26, fat: 6  },
  "cream":          { cal: 340, protein: 2,  carbs: 3,  fat: 36 },
  "cheese":         { cal: 402, protein: 25, carbs: 1,  fat: 33 },
  "yogurt":         { cal: 97,  protein: 9,  carbs: 4,  fat: 5  },
  "black beans":    { cal: 132, protein: 9,  carbs: 24, fat: 1  },
  "lentils":        { cal: 116, protein: 9,  carbs: 20, fat: 1  },
  "oats":           { cal: 389, protein: 17, carbs: 66, fat: 7  },
};

function getNutrition(name: string) {
  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(NUTRITION_DB)) {
    if (lower.includes(key) || key.includes(lower)) return val;
  }
  return null;
}

function estimateMacros(ingredients: Ingredient[], servings: number) {
  let totalCal = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
  for (const ing of ingredients) {
    if (!ing.name.trim()) continue;
    const n = getNutrition(ing.name);
    if (!n) continue;
    const grams = ing.unit === "g" ? parseFloat(ing.amount) || 0
      : ing.unit === "kg" ? (parseFloat(ing.amount) || 0) * 1000
      : ing.unit === "tbsp" ? (parseFloat(ing.amount) || 0) * 15
      : ing.unit === "tsp" ? (parseFloat(ing.amount) || 0) * 5
      : ing.unit === "cups" ? (parseFloat(ing.amount) || 0) * 240
      : ing.unit === "whole" ? (parseFloat(ing.amount) || 0) * 100
      : (parseFloat(ing.amount) || 0) * 10;
    totalCal += (n.cal * grams) / 100;
    totalProtein += (n.protein * grams) / 100;
    totalCarbs += (n.carbs * grams) / 100;
    totalFat += (n.fat * grams) / 100;
  }
  const s = Math.max(servings, 1);
  return {
    calories: Math.round(totalCal / s),
    protein: Math.round(totalProtein / s),
    carbs: Math.round(totalCarbs / s),
    fat: Math.round(totalFat / s),
  };
}

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

let nextId = 1;
function uid() { return nextId++; }

// ── Step indicator ─────────────────────────────────────────────────────────────

function StepIndicator({ current, published }: { current: number; published: boolean }) {
  const steps = [
    { n: 1, label: "Basics" },
    { n: 2, label: "Ingredients" },
    { n: 3, label: "Instructions" },
    { n: 4, label: "Finish" },
  ];

  if (published) {
    return (
      <div className="flex items-center justify-center gap-2 mb-10">
        <CheckCircle2 className="w-5 h-5 text-green-500" />
        <span className="text-sm font-medium text-green-500">Recipe published!</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${
                s.n < current
                  ? "bg-yellow-brand border-yellow-brand text-[oklch(0.12_0_0)]"
                  : s.n === current
                  ? "border-yellow-brand text-yellow-brand bg-background"
                  : "border-border text-muted-foreground bg-background"
              }`}
            >
              {s.n < current ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : s.n}
            </div>
            <span className={`mt-1.5 text-xs font-medium ${s.n === current ? "text-foreground" : "text-muted-foreground"}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-16 h-0.5 -mt-5 mx-1 transition-colors ${s.n < current ? "bg-yellow-brand" : "bg-border"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function FileHeader({ filename, icon }: { filename: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/40 border border-border rounded-t-xl">
      {icon}
      <span className="text-xs font-mono font-medium text-foreground">{filename}</span>
    </div>
  );
}

function MacroField({ label, unit, value, onChange }: {
  label: string; unit: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="w-full h-9 px-3 pr-9 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-yellow-brand placeholder:text-muted-foreground"
        />
        {unit && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}

// ── Tag input with custom creation ────────────────────────────────────────────

function TagSelector({
  availableTags,
  selected,
  onToggle,
  onAddTag,
}: {
  availableTags: string[];
  selected: Set<string>;
  onToggle: (tag: string) => void;
  onAddTag: (tag: string) => void;
}) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
    if (!availableTags.includes(formatted)) onAddTag(formatted);
    onToggle(formatted);
    setInput("");
  };

  const filtered = availableTags.filter((t) =>
    !input || t.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {/* Custom tag input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
            placeholder="Add a custom tag…"
            className="w-full h-8 pl-8 pr-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-yellow-brand placeholder:text-muted-foreground"
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!input.trim()}
          className="h-8 px-3 rounded-lg bg-yellow-brand text-[oklch(0.12_0_0)] text-xs font-semibold hover:bg-yellow-hover transition-colors disabled:opacity-40"
        >
          Add
        </button>
      </div>

      {/* Tag pills */}
      <div className="flex flex-wrap gap-2">
        {filtered.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onToggle(tag)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              selected.has(tag)
                ? "bg-yellow-brand border-yellow-brand text-[oklch(0.12_0_0)]"
                : "border-border bg-background text-muted-foreground hover:border-yellow-brand/50 hover:text-foreground"
            }`}
          >
            {tag}
          </button>
        ))}
        {input && !availableTags.some((t) => t.toLowerCase() === input.toLowerCase()) && (
          <button
            type="button"
            onClick={handleAdd}
            className="px-3 py-1.5 rounded-full text-xs font-medium border border-dashed border-yellow-brand/50 text-yellow-brand hover:bg-yellow-subtle transition-colors flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Create &ldquo;{input.trim()}&rdquo;
          </button>
        )}
      </div>
      {selected.size > 0 && (
        <p className="text-[11px] text-muted-foreground">
          {selected.size} tag{selected.size !== 1 ? "s" : ""} selected · Tags you create are added to the global site catalog.
        </p>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function NewRecipePage() {
  const [step, setStep] = useState(1);
  const [published, setPublished] = useState(false);

  // Step 1
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [tags, setTags] = useState<Set<string>>(new Set());
  const [availableTags, setAvailableTags] = useState<string[]>(DEFAULT_TAGS);

  // Step 2
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: uid(), name: "", amount: "", unit: "g" },
    { id: uid(), name: "", amount: "", unit: "g" },
    { id: uid(), name: "", amount: "", unit: "g" },
  ]);
  const [servingsForEstimate, setServingsForEstimate] = useState("4");
  const [fetchingNutrition, setFetchingNutrition] = useState(false);

  // Step 3
  const [steps, setSteps] = useState<Step[]>([
    { id: uid(), text: "" },
    { id: uid(), text: "" },
  ]);

  // AI enrichment ("Suggest with AI" on the description field)
  const [aiAvailable, setAiAvailable] = useState(true); // optimistic; hidden on first 503
  const [aiLoading, setAiLoading] = useState(false);
  const handleAiSuggest = async () => {
    if (aiLoading || !name.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          ingredients: ingredients.map((i) => i.name).filter(Boolean),
          steps: steps.map((s) => s.text).filter(Boolean),
        }),
      });
      if (res.status === 503) {
        setAiAvailable(false);
        return;
      }
      if (!res.ok) return;
      const data = (await res.json()) as { description: string; tags: string[] };
      setDescription(data.description);
      setAvailableTags((prev) => [...new Set([...prev, ...data.tags])]);
      setTags((prev) => new Set([...prev, ...data.tags]));
    } catch {
      /* leave fields untouched */
    } finally {
      setAiLoading(false);
    }
  };

  // Step 4
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [servings, setServings] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [nutritionEstimated, setNutritionEstimated] = useState(false);

  const slug = toSlug(name);

  const toggleTag = (tag: string) => {
    setTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag); else next.add(tag);
      return next;
    });
  };

  const addCustomTag = (tag: string) => {
    setAvailableTags((prev) => [...prev, tag]);
  };

  const addIngredient = () =>
    setIngredients((prev) => [...prev, { id: uid(), name: "", amount: "", unit: "g" }]);
  const removeIngredient = (id: number) =>
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  const updateIngredient = (id: number, field: keyof Omit<Ingredient, "id" | "caloriesPer100g">, value: string) =>
    setIngredients((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  const addStep = () => setSteps((prev) => [...prev, { id: uid(), text: "" }]);
  const removeStep = (id: number) => setSteps((prev) => prev.filter((s) => s.id !== id));
  const updateStep = (id: number, text: string) =>
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, text } : s)));

  const handleEstimateNutrition = () => {
    setFetchingNutrition(true);
    // Simulate async API fetch
    setTimeout(() => {
      const est = estimateMacros(ingredients, parseInt(servingsForEstimate) || 4);
      setServings(servingsForEstimate);
      setCalories(est.calories > 0 ? est.calories.toString() : "");
      setProtein(est.protein > 0 ? est.protein.toString() : "");
      setCarbs(est.carbs > 0 ? est.carbs.toString() : "");
      setFat(est.fat > 0 ? est.fat.toString() : "");
      setNutritionEstimated(true);
      setFetchingNutrition(false);
    }, 900);
  };

  // ── Published success screen ──────────────────────────────────────────────────
  if (published) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4 text-center space-y-6">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{name || "Your recipe"} is live!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your recipe has been published to Forkable. Others can now view, star, and fork it.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card text-sm font-mono text-muted-foreground">
            <GitFork className="w-3.5 h-3.5 text-yellow-brand shrink-0" />
            <span className="truncate">forkable.com/you/{slug || "my-recipe"}</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/shrey/${slug || "miso-banana-bread"}`}
              className="flex-1 h-10 rounded-lg bg-yellow-brand hover:bg-yellow-hover text-[oklch(0.12_0_0)] text-sm font-semibold transition-colors flex items-center justify-center"
            >
              View recipe
            </Link>
            <Link
              href="/new"
              onClick={() => window.location.reload()}
              className="flex-1 h-10 rounded-lg border border-border bg-background hover:bg-muted text-sm font-medium text-foreground transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create another
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Create a new recipe</h1>
          <p className="mt-1 text-sm text-muted-foreground">Build your recipe step-by-step. You can always edit later.</p>
        </div>

        <StepIndicator current={step} published={published} />

        {/* ── Step 1: Basics ─────────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Recipe name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Miso Banana Bread"
                className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-yellow-brand placeholder:text-muted-foreground"
              />
              {name && (
                <p className="mt-1.5 text-xs text-muted-foreground font-mono">forkable.com/you/{slug}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-foreground">Description</label>
                {aiAvailable && (
                  <button
                    type="button"
                    onClick={handleAiSuggest}
                    disabled={!name.trim() || aiLoading}
                    title="Fill the description and tags with AI suggestions based on your recipe"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                  >
                    {aiLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-yellow-brand" />
                    )}
                    Suggest with AI
                  </button>
                )}
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="A brief description of this recipe - what makes it special?"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-yellow-brand placeholder:text-muted-foreground resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Visibility</label>
              <div className="grid grid-cols-2 gap-3">
                {(["public", "private"] as Visibility[]).map((v) => (
                  <button
                    key={v}
                    onClick={() => setVisibility(v)}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                      visibility === v
                        ? "border-yellow-brand bg-yellow-subtle dark:bg-yellow-muted"
                        : "border-border bg-card hover:border-yellow-brand/40"
                    }`}
                  >
                    <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${visibility === v ? "border-yellow-brand" : "border-border"}`}>
                      {visibility === v && <div className="w-2 h-2 rounded-full bg-yellow-brand" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground capitalize">{v}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {v === "public" ? "Anyone can view and fork this recipe." : "Only you can see this recipe."}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tags
                <span className="ml-2 text-xs font-normal text-muted-foreground">select existing or create your own</span>
              </label>
              <TagSelector
                availableTags={availableTags}
                selected={tags}
                onToggle={toggleTag}
                onAddTag={addCustomTag}
              />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!name.trim()}
              className="w-full h-10 rounded-lg bg-yellow-brand text-[oklch(0.12_0_0)] text-sm font-semibold hover:bg-yellow-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Step 2: Ingredients ────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <FileHeader filename="ingredients.json" icon={<FileJson className="w-3.5 h-3.5 text-yellow-brand" />} />
              <div className="border border-t-0 border-border rounded-b-xl p-4 space-y-2 bg-card">
                <div className="grid grid-cols-[1fr_90px_110px_28px] gap-2 px-1">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Ingredient</span>
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Amount</span>
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Unit</span>
                  <span />
                </div>

                {ingredients.map((ing) => (
                  <div key={ing.id} className="grid grid-cols-[1fr_90px_110px_28px] gap-2 items-center">
                    <input
                      type="text"
                      value={ing.name}
                      onChange={(e) => updateIngredient(ing.id, "name", e.target.value)}
                      placeholder="e.g. ripe bananas"
                      className="h-9 px-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-yellow-brand placeholder:text-muted-foreground"
                    />
                    <input
                      type="number"
                      value={ing.amount}
                      onChange={(e) => updateIngredient(ing.id, "amount", e.target.value)}
                      placeholder="3"
                      min={0}
                      className="h-9 px-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-yellow-brand placeholder:text-muted-foreground"
                    />
                    <select
                      value={ing.unit}
                      onChange={(e) => updateIngredient(ing.id, "unit", e.target.value)}
                      className="h-9 px-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-yellow-brand text-foreground"
                    >
                      {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <button
                      onClick={() => removeIngredient(ing.id)}
                      className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <button
                  onClick={addIngredient}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-1.5 rounded-lg border border-dashed border-border transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add ingredient
                </button>
              </div>
            </div>

            {/* Nutrition estimate shortcut */}
            <div className="p-3 rounded-xl border border-border bg-card flex items-center gap-3">
              <Zap className="w-4 h-4 text-yellow-brand shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">Estimate nutrition automatically</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">We&apos;ll look up your ingredients and calculate macros per serving.</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="number"
                  min={1}
                  value={servingsForEstimate}
                  onChange={(e) => setServingsForEstimate(e.target.value)}
                  className="w-14 h-7 px-2 text-xs rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-yellow-brand text-center"
                  placeholder="4"
                />
                <span className="text-xs text-muted-foreground">servings</span>
                <button
                  onClick={handleEstimateNutrition}
                  disabled={fetchingNutrition || ingredients.every((i) => !i.name.trim())}
                  className="h-7 px-2.5 rounded-lg bg-yellow-brand text-[oklch(0.12_0_0)] text-xs font-semibold hover:bg-yellow-hover transition-colors disabled:opacity-40 flex items-center gap-1"
                >
                  {fetchingNutrition ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                  Estimate
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(1)} className="flex-1 h-10 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2">
                <ChevronLeft className="w-4 h-4" />Back
              </button>
              <button onClick={() => setStep(3)} className="flex-1 h-10 rounded-lg bg-yellow-brand text-[oklch(0.12_0_0)] text-sm font-semibold hover:bg-yellow-hover transition-colors flex items-center justify-center gap-2">
                Continue<ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Instructions ───────────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <FileHeader filename="instructions.md" icon={<FileText className="w-3.5 h-3.5 text-yellow-brand" />} />
              <div className="border border-t-0 border-border rounded-b-xl p-4 space-y-3 bg-card">
                <p className="text-[11px] text-muted-foreground">
                  Use <code className="bg-muted px-1 rounded font-mono">**bold**</code>, <code className="bg-muted px-1 rounded font-mono">*italic*</code>, <code className="bg-muted px-1 rounded font-mono">- bullet</code>, or toolbar buttons per step.
                </p>

                {steps.map((s, idx) => (
                  <div key={s.id} className="flex gap-3 items-start">
                    <div className="shrink-0 w-7 h-7 rounded-full bg-yellow-brand flex items-center justify-center text-[oklch(0.12_0_0)] text-xs font-bold mt-2">
                      {idx + 1}
                    </div>
                    <StepEditor
                      value={s.text}
                      onChange={(text) => updateStep(s.id, text)}
                      placeholder={`Step ${idx + 1}…`}
                      stepNumber={idx + 1}
                    />
                    {steps.length > 1 && (
                      <button
                        onClick={() => removeStep(s.id)}
                        className="shrink-0 h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors mt-2"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  onClick={addStep}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-1.5 rounded-lg border border-dashed border-border transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add step
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(2)} className="flex-1 h-10 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2">
                <ChevronLeft className="w-4 h-4" />Back
              </button>
              <button onClick={() => setStep(4)} className="flex-1 h-10 rounded-lg bg-yellow-brand text-[oklch(0.12_0_0)] text-sm font-semibold hover:bg-yellow-hover transition-colors flex items-center justify-center gap-2">
                Continue<ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Cover & Nutrition ──────────────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-6">
            {/* Cover photo */}
            <div>
              <p className="text-sm font-medium text-foreground mb-2">
                Cover photo
                <span className="ml-2 text-xs font-normal text-muted-foreground">optional</span>
              </p>
              {coverPreview ? (
                <div className="relative rounded-xl overflow-hidden border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverPreview} alt="Cover preview" className="w-full h-48 object-cover" />
                  <button
                    onClick={() => setCoverPreview(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-3 h-40 rounded-xl border-2 border-dashed border-border bg-card hover:border-yellow-brand/50 transition-colors cursor-pointer group">
                  <ImageIcon className="w-8 h-8 text-muted-foreground group-hover:text-yellow-brand transition-colors" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Click to upload a cover photo</p>
                    <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG or WEBP · Max 5 MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setCoverPreview(URL.createObjectURL(file));
                    }}
                  />
                </label>
              )}
            </div>

            {/* Nutrition */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-foreground">
                  Nutrition info
                  <span className="ml-2 text-xs font-normal text-muted-foreground">per serving</span>
                </p>
                <button
                  onClick={handleEstimateNutrition}
                  disabled={fetchingNutrition}
                  className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-yellow-brand/40 text-xs text-yellow-brand hover:bg-yellow-subtle transition-colors"
                >
                  {fetchingNutrition ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                  Re-estimate from ingredients
                </button>
              </div>

              {nutritionEstimated && (
                <div className="mb-3 p-2.5 rounded-lg bg-yellow-subtle dark:bg-yellow-muted/30 border border-yellow-brand/20 text-xs text-muted-foreground flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-yellow-brand shrink-0" />
                  Estimated from your ingredients via OpenFoodFacts. Edit any value below.
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <MacroField label="Servings" unit="" value={servings} onChange={setServings} />
                <MacroField label="Calories" unit="kcal" value={calories} onChange={setCalories} />
                <MacroField label="Protein" unit="g" value={protein} onChange={setProtein} />
                <MacroField label="Carbs" unit="g" value={carbs} onChange={setCarbs} />
                <MacroField label="Fat" unit="g" value={fat} onChange={setFat} />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(3)} className="flex-1 h-10 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2">
                <ChevronLeft className="w-4 h-4" />Back
              </button>
              <button
                onClick={() => setPublished(true)}
                className="flex-1 h-10 rounded-lg bg-yellow-brand text-[oklch(0.12_0_0)] text-sm font-semibold hover:bg-yellow-hover transition-colors flex items-center justify-center gap-2"
              >
                <Rocket className="w-4 h-4" />
                Publish Recipe
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
