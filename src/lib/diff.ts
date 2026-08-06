// Structural diff between two recipe snapshots.
//
// Components are matched by name. Ingredients are matched by name within a
// component. Steps are matched by LCS over normalized content; non-matched
// steps with strong token overlap are reported as "modified" (with word-level
// detail available via diffWords), the rest as added/removed. Reordering
// identical steps produces an empty step diff.

import type { RecipeSnapshot, SnapshotIngredient } from "./snapshot";

export type FieldChange = {
  field: "name" | "description" | "servings";
  from: string;
  to: string;
};

export type IngredientChange =
  | { kind: "added"; component: string; ingredient: SnapshotIngredient }
  | { kind: "removed"; component: string; ingredient: SnapshotIngredient }
  | {
      kind: "changed";
      component: string;
      name: string;
      from: SnapshotIngredient;
      to: SnapshotIngredient;
    };

export type StepChange =
  | { kind: "added"; component: string; index: number; content: string }
  | { kind: "removed"; component: string; index: number; content: string }
  | { kind: "modified"; component: string; index: number; from: string; to: string };

export type RecipeDiff = {
  fields: FieldChange[];
  tags: { added: string[]; removed: string[] };
  ingredients: IngredientChange[];
  steps: StepChange[];
  /** added + changed/modified units (incl. tags and fields) */
  additions: number;
  /** removed units (incl. tags) */
  deletions: number;
};

export type WordDiffPart = { text: string; type: "same" | "added" | "removed" };

// ── Generic LCS ───────────────────────────────────────────────────────────────

/** Longest common subsequence over arrays; returns index pairs [i, j]. */
function lcsPairs<T>(a: T[], b: T[], eq: (x: T, y: T) => boolean): [number, number][] {
  const n = a.length;
  const m = b.length;
  // dp[i][j] = LCS length of a[i..] vs b[j..]
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = eq(a[i], b[j])
        ? dp[i + 1][j + 1] + 1
        : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const pairs: [number, number][] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (eq(a[i], b[j])) {
      pairs.push([i, j]);
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      i++;
    } else {
      j++;
    }
  }
  return pairs;
}

// ── Word-level diff ───────────────────────────────────────────────────────────

/** Word-level LCS diff for inline highlighting of modified steps. */
export function diffWords(from: string, to: string): WordDiffPart[] {
  const a = from.split(/\s+/).filter(Boolean);
  const b = to.split(/\s+/).filter(Boolean);
  const pairs = lcsPairs(a, b, (x, y) => x === y);

  const parts: WordDiffPart[] = [];
  const push = (text: string, type: WordDiffPart["type"]) => {
    const last = parts[parts.length - 1];
    if (last && last.type === type) last.text += ` ${text}`;
    else parts.push({ text, type });
  };

  let ai = 0;
  let bi = 0;
  for (const [pa, pb] of pairs) {
    while (ai < pa) push(a[ai++], "removed");
    while (bi < pb) push(b[bi++], "added");
    push(a[ai], "same");
    ai++;
    bi++;
  }
  while (ai < a.length) push(a[ai++], "removed");
  while (bi < b.length) push(b[bi++], "added");

  return parts;
}

// ── Step matching helpers ─────────────────────────────────────────────────────

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

function tokenOverlap(a: string, b: string): number {
  const ta = new Set(normalize(a).split(" "));
  const tb = new Set(normalize(b).split(" "));
  if (ta.size === 0 && tb.size === 0) return 1;
  let shared = 0;
  for (const t of ta) if (tb.has(t)) shared++;
  const unionSize = new Set([...ta, ...tb]).size;
  return unionSize === 0 ? 0 : shared / unionSize;
}

function sameIngredient(a: SnapshotIngredient, b: SnapshotIngredient): boolean {
  return (
    a.amount === b.amount &&
    a.unit === b.unit &&
    a.preparation === b.preparation &&
    a.isOptional === b.isOptional
  );
}

// ── Main diff ─────────────────────────────────────────────────────────────────

export function diffSnapshots(from: RecipeSnapshot, to: RecipeSnapshot): RecipeDiff {
  const fields: FieldChange[] = [];
  if (from.name !== to.name) fields.push({ field: "name", from: from.name, to: to.name });
  if (from.description !== to.description)
    fields.push({ field: "description", from: from.description, to: to.description });
  if (from.servings !== to.servings)
    fields.push({ field: "servings", from: String(from.servings), to: String(to.servings) });

  const fromTags = new Set(from.tags);
  const toTags = new Set(to.tags);
  const tags = {
    added: to.tags.filter((t) => !fromTags.has(t)),
    removed: from.tags.filter((t) => !toTags.has(t)),
  };

  const ingredients: IngredientChange[] = [];
  const steps: StepChange[] = [];

  const fromComps = new Map(from.components.map((c) => [c.name, c]));
  const toComps = new Map(to.components.map((c) => [c.name, c]));
  const allComponentNames = [
    ...from.components.map((c) => c.name),
    ...to.components.filter((c) => !fromComps.has(c.name)).map((c) => c.name),
  ];

  for (const compName of allComponentNames) {
    const fc = fromComps.get(compName);
    const tc = toComps.get(compName);

    // Component only in `to`: everything added
    if (!fc && tc) {
      tc.ingredients.forEach((ing) =>
        ingredients.push({ kind: "added", component: compName, ingredient: ing }),
      );
      tc.steps.forEach((s, i) =>
        steps.push({ kind: "added", component: compName, index: i, content: s.content }),
      );
      continue;
    }
    // Component only in `from`: everything removed
    if (fc && !tc) {
      fc.ingredients.forEach((ing) =>
        ingredients.push({ kind: "removed", component: compName, ingredient: ing }),
      );
      fc.steps.forEach((s, i) =>
        steps.push({ kind: "removed", component: compName, index: i, content: s.content }),
      );
      continue;
    }
    if (!fc || !tc) continue;

    // Ingredients: match by lowercased name
    const fromIngs = new Map(fc.ingredients.map((i) => [i.name.toLowerCase(), i]));
    const toIngs = new Map(tc.ingredients.map((i) => [i.name.toLowerCase(), i]));
    for (const [name, fi] of fromIngs) {
      const ti = toIngs.get(name);
      if (!ti) {
        ingredients.push({ kind: "removed", component: compName, ingredient: fi });
      } else if (!sameIngredient(fi, ti)) {
        ingredients.push({
          kind: "changed",
          component: compName,
          name: ti.name,
          from: fi,
          to: ti,
        });
      }
    }
    for (const [name, ti] of toIngs) {
      if (!fromIngs.has(name)) {
        ingredients.push({ kind: "added", component: compName, ingredient: ti });
      }
    }

    // Steps: LCS on normalized content
    const fromSteps = fc.steps.map((s) => s.content);
    const toSteps = tc.steps.map((s) => s.content);
    const pairs = lcsPairs(fromSteps, toSteps, (x, y) => normalize(x) === normalize(y));

    const matchedFrom = new Set(pairs.map(([i]) => i));
    const matchedTo = new Set(pairs.map(([, j]) => j));
    const leftoverFrom = fromSteps.map((_, i) => i).filter((i) => !matchedFrom.has(i));
    const leftoverTo = toSteps.map((_, j) => j).filter((j) => !matchedTo.has(j));

    // Pair leftovers in order; strong token overlap means "modified"
    const pairCount = Math.min(leftoverFrom.length, leftoverTo.length);
    const consumedFrom = new Set<number>();
    const consumedTo = new Set<number>();
    for (let k = 0; k < pairCount; k++) {
      const fi = leftoverFrom[k];
      const ti = leftoverTo[k];
      // Identical content that fell out of the LCS is a pure reorder - no change.
      if (normalize(fromSteps[fi]) === normalize(toSteps[ti])) {
        consumedFrom.add(fi);
        consumedTo.add(ti);
        continue;
      }
      if (tokenOverlap(fromSteps[fi], toSteps[ti]) > 0.5) {
        steps.push({
          kind: "modified",
          component: compName,
          index: ti,
          from: fromSteps[fi],
          to: toSteps[ti],
        });
        consumedFrom.add(fi);
        consumedTo.add(ti);
      }
    }
    for (const fi of leftoverFrom) {
      if (!consumedFrom.has(fi)) {
        steps.push({ kind: "removed", component: compName, index: fi, content: fromSteps[fi] });
      }
    }
    for (const ti of leftoverTo) {
      if (!consumedTo.has(ti)) {
        steps.push({ kind: "added", component: compName, index: ti, content: toSteps[ti] });
      }
    }
  }

  const additions =
    fields.length +
    tags.added.length +
    ingredients.filter((i) => i.kind !== "removed").length +
    steps.filter((s) => s.kind !== "removed").length;
  const deletions =
    tags.removed.length +
    ingredients.filter((i) => i.kind === "removed").length +
    steps.filter((s) => s.kind === "removed").length;

  return { fields, tags, ingredients, steps, additions, deletions };
}
