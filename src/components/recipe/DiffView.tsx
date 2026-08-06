import { Tag, Carrot, ListOrdered, FileText, Equal } from "lucide-react";
import { diffWords, type RecipeDiff } from "@/lib/diff";

// GitHub-style structural diff renderer. Server-safe (no client hooks).

function WordDiff({ from, to }: { from: string; to: string }) {
  const parts = diffWords(from, to);
  return (
    <p className="text-sm leading-relaxed">
      {parts.map((p, i) => {
        if (p.type === "removed") {
          return (
            <del key={i} className="mx-0.5 rounded px-0.5 bg-red-500/15 text-red-600 dark:text-red-400">
              {p.text}
            </del>
          );
        }
        if (p.type === "added") {
          return (
            <span key={i} className="mx-0.5 rounded px-0.5 bg-green-500/15 text-green-700 dark:text-green-400">
              {p.text}
            </span>
          );
        }
        return <span key={i}> {p.text} </span>;
      })}
    </p>
  );
}

function formatAmountUnit(amount: number | null, unit: string | null): string {
  if (amount === null && unit === null) return "to taste";
  return [amount, unit].filter((x) => x !== null && x !== "").join(" ") || "to taste";
}

function SectionHeading({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {icon}
      {label}
    </h3>
  );
}

export function DiffView({ diff }: { diff: RecipeDiff }) {
  const isEmpty =
    diff.fields.length === 0 &&
    diff.tags.added.length === 0 &&
    diff.tags.removed.length === 0 &&
    diff.ingredients.length === 0 &&
    diff.steps.length === 0;

  if (isEmpty) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <Equal className="w-8 h-8 mx-auto mb-3 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">These versions are identical.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fields */}
      {diff.fields.length > 0 && (
        <section className="space-y-2">
          <SectionHeading icon={<FileText className="w-3.5 h-3.5" />} label="Details" />
          <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
            {diff.fields.map((f) => (
              <div key={f.field} className="px-4 py-2.5 text-sm bg-card flex items-baseline gap-2">
                <span className="font-medium capitalize w-24 shrink-0">{f.field}</span>
                <span className="text-red-600 dark:text-red-400 line-through decoration-red-500/50">
                  {f.from}
                </span>
                <span className="text-muted-foreground">to</span>
                <span className="text-green-700 dark:text-green-400">{f.to}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tags */}
      {(diff.tags.added.length > 0 || diff.tags.removed.length > 0) && (
        <section className="space-y-2">
          <SectionHeading icon={<Tag className="w-3.5 h-3.5" />} label="Tags" />
          <div className="flex flex-wrap gap-1.5">
            {diff.tags.added.map((t) => (
              <span
                key={`a-${t}`}
                className="inline-flex items-center h-6 px-2 rounded-full text-xs font-medium bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/30"
              >
                + {t}
              </span>
            ))}
            {diff.tags.removed.map((t) => (
              <span
                key={`r-${t}`}
                className="inline-flex items-center h-6 px-2 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 line-through"
              >
                - {t}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Ingredients */}
      {diff.ingredients.length > 0 && (
        <section className="space-y-2">
          <SectionHeading icon={<Carrot className="w-3.5 h-3.5" />} label="Ingredients" />
          <div className="rounded-xl border border-border overflow-hidden divide-y divide-border font-mono text-sm">
            {diff.ingredients.map((c, i) => {
              if (c.kind === "added") {
                return (
                  <div key={i} className="px-4 py-2 bg-green-500/10 text-green-700 dark:text-green-400 flex gap-2">
                    <span className="select-none">+</span>
                    <span>
                      {formatAmountUnit(c.ingredient.amount, c.ingredient.unit)} {c.ingredient.name}
                      <span className="text-muted-foreground font-sans text-xs ml-2">in {c.component}</span>
                    </span>
                  </div>
                );
              }
              if (c.kind === "removed") {
                return (
                  <div key={i} className="px-4 py-2 bg-red-500/10 text-red-600 dark:text-red-400 flex gap-2">
                    <span className="select-none">-</span>
                    <span className="line-through decoration-red-500/50">
                      {formatAmountUnit(c.ingredient.amount, c.ingredient.unit)} {c.ingredient.name}
                    </span>
                    <span className="text-muted-foreground font-sans text-xs no-underline">in {c.component}</span>
                  </div>
                );
              }
              return (
                <div key={i} className="px-4 py-2 bg-yellow-brand/5 flex gap-2 items-baseline">
                  <span className="select-none text-yellow-brand">~</span>
                  <span className="text-foreground">{c.name}</span>
                  <span className="text-red-600 dark:text-red-400 line-through decoration-red-500/50">
                    {formatAmountUnit(c.from.amount, c.from.unit)}
                  </span>
                  <span className="text-green-700 dark:text-green-400">
                    {formatAmountUnit(c.to.amount, c.to.unit)}
                  </span>
                  {c.from.preparation !== c.to.preparation && (
                    <span className="text-xs text-muted-foreground font-sans">
                      ({c.from.preparation ?? "plain"} to {c.to.preparation ?? "plain"})
                    </span>
                  )}
                  <span className="text-muted-foreground font-sans text-xs ml-auto">in {c.component}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Steps */}
      {diff.steps.length > 0 && (
        <section className="space-y-2">
          <SectionHeading icon={<ListOrdered className="w-3.5 h-3.5" />} label="Steps" />
          <div className="space-y-2">
            {diff.steps.map((s, i) => {
              if (s.kind === "modified") {
                return (
                  <div key={i} className="rounded-xl border border-border bg-card px-4 py-3">
                    <p className="text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
                      Step {s.index + 1} · {s.component} · edited
                    </p>
                    <WordDiff from={s.from} to={s.to} />
                  </div>
                );
              }
              const added = s.kind === "added";
              return (
                <div
                  key={i}
                  className={`rounded-xl border px-4 py-3 ${
                    added
                      ? "border-green-500/30 bg-green-500/5"
                      : "border-red-500/30 bg-red-500/5"
                  }`}
                >
                  <p className="text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
                    Step {s.index + 1} · {s.component} · {added ? "added" : "removed"}
                  </p>
                  <p
                    className={`text-sm leading-relaxed ${
                      added
                        ? "text-green-700 dark:text-green-400"
                        : "text-red-600 dark:text-red-400 line-through decoration-red-500/40"
                    }`}
                  >
                    {s.content}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
