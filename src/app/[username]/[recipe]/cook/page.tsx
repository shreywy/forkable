"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronLeft, ChevronRight, X, Timer, CheckCircle2,
  ChefHat, Maximize2, Thermometer, Layers, Check, ArrowRight, Loader2,
} from "lucide-react";

// ── Temperature conversion ─────────────────────────────────────────────────────

function convertTempsInText(text: string, displayUnit: "F" | "C"): string {
  if (displayUnit === "F") return text;
  const withoutCAnnotations = text.replace(/\s*\(\d+(?:\.\d+)?°C\)/g, "");
  return withoutCAnnotations.replace(/(\d+(?:\.\d+)?)\s*°F\b/g, (_, n) => {
    const c = Math.round((parseFloat(n) - 32) * 5 / 9);
    return `${c}°C`;
  });
}

function recipeHasTemps(steps: { text: string }[]): boolean {
  return steps.some((s) => /\d+°F\b/.test(s.text));
}

// ── Timer helpers ──────────────────────────────────────────────────────────────

interface TimerMatch { label: string; seconds: number; }

function detectTimers(text: string): TimerMatch[] {
  const results: TimerMatch[] = [];
  for (const m of text.matchAll(/(\d+(?:\.\d+)?)\s*(?:hr|hour|hours|hrs)\b/gi)) {
    results.push({ label: `${m[1]} hr timer`, seconds: Math.round(parseFloat(m[1]) * 3600) });
  }
  for (const m of text.matchAll(/(\d+(?:\.\d+)?)\s*min(?:ute|utes)?\b/gi)) {
    results.push({ label: `${m[1]} min timer`, seconds: Math.round(parseFloat(m[1]) * 60) });
  }
  for (const m of text.matchAll(/(\d+)\s*sec(?:ond|onds|s)?\b/gi)) {
    const n = parseInt(m[1]);
    if (n >= 5) results.push({ label: `${m[1]} sec timer`, seconds: n });
  }
  return results.filter((r, i, arr) => arr.findIndex((x) => x.seconds === r.seconds) === i);
}

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ── Recipe shape returned by the API ──────────────────────────────────────────

interface ApiComponent {
  name: string;
  displayName: string | null;
  type: string;
  steps: { step: number; text: string }[];
  subComponents: {
    name: string;
    displayName: string | null;
    type: string;
    steps: { step: number; text: string }[];
  }[];
}

interface ApiRecipe {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string | null;
  author: { username: string; displayName: string; avatarUrl: string | null };
  instructions: { step: number; text: string }[];
  components: ApiComponent[];
}

// ── Step types ─────────────────────────────────────────────────────────────────

interface CookStep {
  step: number;
  text: string;
  section: string;
  sectionIndex: number;
}

// ── Pre-flight component card ──────────────────────────────────────────────────

const COMPONENT_EMOJI: Record<string, string> = {
  "bolognese-sauce": "🥩",
  "bechamel": "🥛",
  "pasta-sheets": "🍝",
  "broth": "🍲",
  "tare": "🧂",
  "chashu-pork": "🥩",
  "assembly": "🍜",
};

function getComponentEmoji(name: string): string {
  return COMPONENT_EMOJI[name] ?? "🫙";
}

// ── Page ───────────────────────────────────────────────────────────────────────

type Phase = "preflight" | "cooking" | "done";

export default function CookModePage() {
  const params = useParams<{ username: string; recipe: string }>();

  const [recipeData, setRecipeData] = useState<ApiRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [componentReady, setComponentReady] = useState<Record<string, boolean | null>>({});
  const [phase, setPhase] = useState<Phase>("preflight");
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [tempUnit, setTempUnit] = useState<"F" | "C">("F");

  useEffect(() => {
    fetch(`/api/recipes/${params.username}/${params.recipe}`)
      .then((res) => {
        if (res.status === 404) { setNotFound(true); setLoading(false); return null; }
        return res.json();
      })
      .then((data) => {
        if (data) {
          const recipe = data as ApiRecipe;
          setRecipeData(recipe);
          const subs = (recipe.components ?? []).filter(
            (c) => c.type === "FOLDER" && c.steps.length > 0,
          );
          setComponentReady(Object.fromEntries(subs.map((c) => [c.name, null])));
          if (subs.length === 0) setPhase("cooking");
        }
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [params.username, params.recipe]);

  // Derive sub-components: top-level folders that have steps
  const subComponents = (recipeData?.components ?? []).filter(
    (c) => c.type === "FOLDER" && c.steps.length > 0,
  );

  const allAnswered = subComponents.every((c) => componentReady[c.name] !== null);

  const mergedSteps: CookStep[] = (() => {
    if (!recipeData) return [];
    const steps: CookStep[] = [];

    subComponents.forEach((comp) => {
      if (componentReady[comp.name] === false) {
        comp.steps.forEach((s, i) => {
          steps.push({
            step: s.step,
            text: s.text,
            section: comp.displayName ?? comp.name,
            sectionIndex: i,
          });
        });
      }
    });

    const mainSteps = recipeData.instructions.length > 0
      ? recipeData.instructions
      : recipeData.components.flatMap((c) => c.steps);

    mainSteps.forEach((s, i) => {
      steps.push({ step: s.step, text: s.text, section: "Assembly", sectionIndex: i });
    });

    return steps;
  })();

  useEffect(() => {
    if (!timerRunning || timerSeconds === null || timerSeconds <= 0) return;
    const id = setInterval(() => {
      setTimerSeconds((s) => {
        if (s === null || s <= 1) { setTimerRunning(false); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning, timerSeconds]);

  // ── Loading / not-found ────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-yellow-brand animate-spin" />
      </div>
    );
  }

  if (notFound || !recipeData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Recipe not found.</p>
          <Link href="/" className="text-yellow-brand hover:underline text-sm mt-2 inline-block">Back to home</Link>
        </div>
      </div>
    );
  }

  const recipe = recipeData;

  const startCooking = () => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setPhase("cooking");
  };

  // ── PRE-FLIGHT SCREEN ────────────────────────────────────────────────────────

  if (phase === "preflight") {
    const skippedCount = subComponents.filter((c) => componentReady[c.name] === true).length;
    const needCount = subComponents.filter((c) => componentReady[c.name] === false).length;

    return (
      <div className="h-screen overflow-hidden bg-background flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
          <Link
            href={`/${params.username}/${params.recipe}`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
            Exit cook mode
          </Link>
          <div className="flex items-center gap-2">
            <ChefHat className="w-4 h-4 text-yellow-brand" />
            <span className="text-sm font-semibold text-foreground">{recipe.name}</span>
          </div>
          <div className="w-32" />
        </div>

        <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
          <div className="w-full max-w-lg space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-yellow-subtle dark:bg-yellow-muted mx-auto mb-4">
                <Layers className="w-6 h-6 text-yellow-brand" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Before we start</h1>
              <p className="text-sm text-muted-foreground">
                This recipe has {subComponents.length} sub-components. Let us know what you already have
                prepared so we can skip those steps.
              </p>
            </div>

            {/* Component cards */}
            <div className="space-y-3">
              {subComponents.map((comp) => {
                const state = componentReady[comp.name];
                return (
                  <div
                    key={comp.name}
                    className={`rounded-xl border p-4 transition-colors ${
                      state === null
                        ? "border-border bg-card"
                        : state === true
                          ? "border-green-500/30 bg-green-500/5"
                          : "border-yellow-brand/30 bg-yellow-subtle dark:bg-yellow-muted"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl shrink-0 mt-0.5">{getComponentEmoji(comp.name)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {comp.displayName ?? comp.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {comp.steps.length} steps
                          {state === true && " - skipping"}
                          {state === false && " - will walk you through it"}
                        </p>
                      </div>
                      {state !== null && (
                        <span className={`text-xs font-medium px-2 py-1 rounded-md shrink-0 ${
                          state ? "bg-green-500/15 text-green-600 dark:text-green-400" : "bg-yellow-brand/15 text-yellow-700 dark:text-yellow-brand"
                        }`}>
                          {state ? "Have it ✓" : "Need to make"}
                        </span>
                      )}
                    </div>

                    {state === null && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => setComponentReady((r) => ({ ...r, [comp.name]: true }))}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-green-500/30 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 text-sm font-medium transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Already have it
                        </button>
                        <button
                          onClick={() => setComponentReady((r) => ({ ...r, [comp.name]: false }))}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-border hover:border-yellow-brand/40 hover:bg-yellow-subtle dark:hover:bg-yellow-muted text-foreground text-sm font-medium transition-colors"
                        >
                          Need to make it
                        </button>
                      </div>
                    )}

                    {state !== null && (
                      <button
                        onClick={() => setComponentReady((r) => ({ ...r, [comp.name]: null }))}
                        className="mt-2 text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                      >
                        Change answer
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Summary + Start button */}
            {allAnswered && (
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  {skippedCount > 0 && (
                    <span className="text-green-600 dark:text-green-400">
                      Skipping {skippedCount} component{skippedCount > 1 ? "s" : ""}.
                    </span>
                  )}
                  {needCount > 0 && (
                    <span>
                      Making {needCount} component{needCount > 1 ? "s" : ""} from scratch.
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total steps:{" "}
                  <strong className="text-foreground">{mergedSteps.length}</strong>
                </p>
                <button
                  onClick={startCooking}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-yellow-brand hover:bg-yellow-hover text-[oklch(0.12_0_0)] text-sm font-semibold transition-colors"
                >
                  <ChefHat className="w-4 h-4" />
                  Start Cooking
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {!allAnswered && (
              <p className="text-center text-xs text-muted-foreground">
                Answer all questions above to continue
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── COOKING SCREEN ────────────────────────────────────────────────────────────

  const steps = mergedSteps.length > 0 ? mergedSteps : recipe.instructions.map((s, i) => ({
    ...s,
    section: "Main Recipe",
    sectionIndex: i,
  }));

  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const allStepTexts = steps.map((s) => ({ text: s.text }));
  const hasTemps = recipeHasTemps(allStepTexts);

  const displayText = step ? convertTempsInText(step.text, tempUnit) : "";
  const timers = step ? detectTimers(displayText) : [];

  const toggleComplete = (idx: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const sections: { name: string; steps: typeof steps; startIdx: number }[] = [];
  steps.forEach((s, i) => {
    const last = sections[sections.length - 1];
    if (!last || last.name !== s.section) {
      sections.push({ name: s.section, steps: [s], startIdx: i });
    } else {
      last.steps.push(s);
    }
  });

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col">
      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <Link
          href={`/${params.username}/${params.recipe}`}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
          Exit cook mode
        </Link>

        <div className="flex items-center gap-2">
          <ChefHat className="w-4 h-4 text-yellow-brand" />
          <span className="text-sm font-semibold text-foreground">{recipe.name}</span>
        </div>

        <div className="flex items-center gap-2">
          {hasTemps && (
            <button
              onClick={() => setTempUnit((u) => (u === "F" ? "C" : "F"))}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border hover:border-yellow-brand/50 bg-card hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Thermometer className="w-3 h-3" />
              °{tempUnit}
              <span className="text-muted-foreground/50">→</span>
              °{tempUnit === "F" ? "C" : "F"}
            </button>
          )}
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border hover:bg-muted text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Maximize2 className="w-3 h-3" />
            <span className="hidden sm:inline">Keep awake</span>
          </button>
        </div>
      </div>

      {/* ── Progress bar ───────────────────────────────────────────────────── */}
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-yellow-brand transition-all duration-500"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Step sidebar ─────────────────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col w-72 border-r border-border bg-card shrink-0 overflow-y-auto">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Steps</p>
          </div>
          <div className="p-2 space-y-1">
            {sections.map((section) => (
              <div key={section.name}>
                <div className="px-3 py-1.5 mt-2 first:mt-0">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{section.name}</p>
                </div>
                {section.steps.map((s, relIdx) => {
                  const absIdx = section.startIdx + relIdx;
                  return (
                    <button
                      key={absIdx}
                      onClick={() => setCurrentStep(absIdx)}
                      className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                        absIdx === currentStep ? "bg-yellow-subtle dark:bg-yellow-muted" : "hover:bg-muted"
                      }`}
                    >
                      <span className={`shrink-0 flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold mt-0.5 transition-colors ${
                        completedSteps.has(absIdx)
                          ? "bg-green-500 text-white"
                          : absIdx === currentStep
                            ? "bg-yellow-brand text-[oklch(0.12_0_0)]"
                            : "bg-muted text-muted-foreground"
                      }`}>
                        {completedSteps.has(absIdx) ? "✓" : s.step}
                      </span>
                      <p className={`text-xs leading-relaxed line-clamp-2 ${absIdx === currentStep ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                        {convertTempsInText(s.text, tempUnit)}
                      </p>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>

        {/* ── Main step view ───────────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col items-center justify-between p-6 overflow-y-auto">
          <div className="w-full max-w-2xl space-y-4">
            {/* Section label + step counter */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                {step?.section}
              </span>
              <span className="text-xs text-muted-foreground">{completedSteps.size} of {steps.length} done</span>
            </div>

            {/* Step number */}
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-brand text-[oklch(0.12_0_0)] text-lg font-bold shrink-0">
                {step?.step}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Step text */}
            <p className="text-2xl font-medium text-foreground leading-relaxed">
              {displayText}
            </p>

            {/* Timer suggestions */}
            {timers.length > 0 && (
              <div className="p-4 rounded-xl border border-yellow-brand/30 bg-yellow-subtle dark:bg-yellow-muted">
                <div className="flex items-center gap-2 mb-3">
                  <Timer className="w-4 h-4 text-yellow-brand" />
                  <p className="text-sm font-medium text-foreground">
                    {timers.length === 1 ? "Timer detected" : "Timers detected"}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {timers.map((t) => (
                    <button
                      key={t.seconds}
                      onClick={() => { setTimerSeconds(t.seconds); setTimerRunning(true); }}
                      className="px-3 py-1.5 rounded-lg bg-yellow-brand hover:bg-yellow-hover text-[oklch(0.12_0_0)] text-xs font-medium transition-colors"
                    >
                      Start {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Active timer */}
            {timerSeconds !== null && (
              <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
                <Timer className={`w-5 h-5 shrink-0 ${timerRunning ? "text-yellow-brand" : "text-muted-foreground"}`} />
                <span className={`text-3xl font-mono font-bold tabular-nums ${timerSeconds === 0 ? "text-red-500" : "text-foreground"}`}>
                  {timerSeconds === 0 ? "Done!" : formatTime(timerSeconds)}
                </span>
                <div className="flex gap-2 ml-auto">
                  {timerSeconds > 0 && (
                    <button
                      onClick={() => setTimerRunning((r) => !r)}
                      className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium transition-colors"
                    >
                      {timerRunning ? "Pause" : "Resume"}
                    </button>
                  )}
                  <button
                    onClick={() => { setTimerSeconds(null); setTimerRunning(false); }}
                    className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-muted-foreground transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Mark done */}
            <button
              onClick={() => toggleComplete(currentStep)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                completedSteps.has(currentStep)
                  ? "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400"
                  : "border-border bg-card hover:bg-muted text-muted-foreground"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {completedSteps.has(currentStep) ? "Marked as done" : "Mark step as done"}
            </button>
          </div>

          {/* ── Navigation ───────────────────────────────────────────────── */}
          <div className="w-full max-w-2xl flex items-center justify-between mt-8 pt-6 border-t border-border">
            <button
              onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
              disabled={isFirst}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-border bg-card hover:bg-muted text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {/* Mobile step pills */}
            <div className="flex gap-1.5 lg:hidden">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentStep ? "bg-yellow-brand" : completedSteps.has(i) ? "bg-green-500" : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>

            {isLast ? (
              <Link
                href={`/${params.username}/${params.recipe}`}
                className="inline-flex items-center gap-2 h-10 px-6 rounded-xl bg-yellow-brand hover:bg-yellow-hover text-[oklch(0.12_0_0)] text-sm font-medium transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Done cooking!
              </Link>
            ) : (
              <button
                onClick={() => {
                  toggleComplete(currentStep);
                  setCurrentStep((s) => Math.min(steps.length - 1, s + 1));
                }}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-yellow-brand hover:bg-yellow-hover text-[oklch(0.12_0_0)] text-sm font-medium transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
