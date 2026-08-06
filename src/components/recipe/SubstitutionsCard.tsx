"use client";

import { useState } from "react";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";

type Substitution = { ingredient: string; substitute: string; note: string };

/**
 * "Sous Chef" substitutions: nothing is generated (or billed) until the
 * reader clicks. Hides itself when the server reports AI is not configured
 * or the viewer is logged out.
 */
export function SubstitutionsCard({
  recipeId,
  isLoggedIn,
}: {
  recipeId: string;
  isLoggedIn: boolean;
}) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "hidden">("idle");
  const [substitutions, setSubstitutions] = useState<Substitution[]>([]);

  if (!isLoggedIn || state === "hidden") return null;

  const load = async () => {
    setState("loading");
    try {
      const res = await fetch("/api/ai/substitutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId }),
      });
      if (res.status === 503) {
        setState("hidden"); // AI not configured on this deployment
        return;
      }
      if (!res.ok) {
        setState("idle");
        return;
      }
      const data = (await res.json()) as { substitutions: Substitution[] };
      setSubstitutions(data.substitutions);
      setState("done");
    } catch {
      setState("idle");
    }
  };

  if (state !== "done") {
    return (
      <button
        onClick={load}
        disabled={state === "loading"}
        className="w-full flex items-center justify-center gap-2 h-9 rounded-xl border border-dashed border-border hover:border-yellow-brand/60 hover:bg-yellow-subtle dark:hover:bg-yellow-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-70"
      >
        {state === "loading" ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Sparkles className="w-3.5 h-3.5 text-yellow-brand" />
        )}
        {state === "loading" ? "Asking the sous chef..." : "Suggest ingredient substitutions"}
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-muted/40 border-b border-border">
        <Sparkles className="w-3.5 h-3.5 text-yellow-brand" />
        <span className="text-xs font-semibold text-foreground">Sous chef suggestions</span>
        <span className="ml-auto text-[10px] text-muted-foreground">AI-generated</span>
      </div>
      {substitutions.length === 0 ? (
        <p className="px-4 py-3 text-xs text-muted-foreground">
          No obvious substitutions for this recipe.
        </p>
      ) : (
        <ul className="divide-y divide-border/60">
          {substitutions.map((s, i) => (
            <li key={i} className="px-4 py-2.5">
              <p className="text-sm flex items-center gap-1.5 flex-wrap">
                <span className="font-medium text-foreground">{s.ingredient}</span>
                <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                <span className="text-yellow-brand font-medium">{s.substitute}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.note}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
