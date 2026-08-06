import { describe, it, expect } from "vitest";
import { diffSnapshots, diffWords } from "@/lib/diff";
import type { RecipeSnapshot, SnapshotIngredient } from "@/lib/snapshot";

function ing(name: string, amount: number | null = null, unit: string | null = null): SnapshotIngredient {
  return { name, amount, unit, preparation: null, isOptional: false };
}

function snap(overrides: Partial<RecipeSnapshot> = {}): RecipeSnapshot {
  return {
    name: "Test Recipe",
    description: "A test.",
    servings: 4,
    tags: ["easy"],
    components: [
      {
        name: "main",
        displayName: "Main",
        type: "FOLDER",
        ingredients: [ing("flour", 500, "g"), ing("water", 300, "ml")],
        steps: [
          { content: "Mix the flour and water.", subSteps: [] },
          { content: "Knead for ten minutes.", subSteps: [] },
          { content: "Bake at 220C until golden.", subSteps: [] },
        ],
      },
    ],
    ...overrides,
  };
}

describe("diffSnapshots", () => {
  it("returns an empty diff for identical snapshots", () => {
    const d = diffSnapshots(snap(), snap());
    expect(d.fields).toEqual([]);
    expect(d.ingredients).toEqual([]);
    expect(d.steps).toEqual([]);
    expect(d.tags).toEqual({ added: [], removed: [] });
    expect(d.additions).toBe(0);
    expect(d.deletions).toBe(0);
  });

  it("detects an ingredient amount change as 'changed'", () => {
    const a = snap();
    const b = snap();
    b.components[0].ingredients[0] = ing("flour", 600, "g");
    const d = diffSnapshots(a, b);
    expect(d.ingredients).toHaveLength(1);
    expect(d.ingredients[0]).toMatchObject({
      kind: "changed",
      component: "main",
      name: "flour",
    });
    expect(d.additions).toBe(1);
    expect(d.deletions).toBe(0);
  });

  it("detects added and removed ingredients", () => {
    const a = snap();
    const b = snap();
    b.components[0].ingredients = [ing("flour", 500, "g"), ing("salt", 10, "g")];
    const d = diffSnapshots(a, b);
    const kinds = d.ingredients.map((i) => i.kind).sort();
    expect(kinds).toEqual(["added", "removed"]);
  });

  it("reports a lightly reworded step as 'modified'", () => {
    const a = snap();
    const b = snap();
    b.components[0].steps[1] = { content: "Knead for about ten minutes.", subSteps: [] };
    const d = diffSnapshots(a, b);
    expect(d.steps).toHaveLength(1);
    expect(d.steps[0]).toMatchObject({ kind: "modified", component: "main" });
  });

  it("treats reordered identical steps as no change", () => {
    const a = snap();
    const b = snap();
    const [s0, s1, s2] = b.components[0].steps;
    b.components[0].steps = [s0, s2, s1];
    const d = diffSnapshots(a, b);
    expect(d.steps).toEqual([]);
    expect(d.additions).toBe(0);
    expect(d.deletions).toBe(0);
  });

  it("counts a whole new component as additions", () => {
    const a = snap();
    const b = snap();
    b.components = [
      ...b.components,
      {
        name: "glaze",
        displayName: "Glaze",
        type: "FOLDER" as const,
        ingredients: [ing("sugar", 100, "g")],
        steps: [{ content: "Melt the sugar into a glaze.", subSteps: [] }],
      },
    ];
    const d = diffSnapshots(a, b);
    expect(d.additions).toBe(2);
    expect(d.deletions).toBe(0);
  });

  it("diffs tags and scalar fields", () => {
    const a = snap();
    const b = snap({ tags: ["easy", "vegan"], servings: 8 });
    const d = diffSnapshots(a, b);
    expect(d.tags.added).toEqual(["vegan"]);
    expect(d.fields).toEqual([{ field: "servings", from: "4", to: "8" }]);
  });
});

describe("diffWords", () => {
  it("marks unchanged text as same", () => {
    expect(diffWords("knead the dough", "knead the dough")).toEqual([
      { text: "knead the dough", type: "same" },
    ]);
  });

  it("highlights inserted and removed words", () => {
    const parts = diffWords("simmer for 2 hours", "simmer gently for 3 hours");
    expect(parts).toEqual([
      { text: "simmer", type: "same" },
      { text: "gently", type: "added" },
      { text: "for", type: "same" },
      { text: "2", type: "removed" },
      { text: "3", type: "added" },
      { text: "hours", type: "same" },
    ]);
  });

  it("handles fully different strings", () => {
    const parts = diffWords("aaa bbb", "ccc ddd");
    expect(parts).toEqual([
      { text: "aaa bbb", type: "removed" },
      { text: "ccc ddd", type: "added" },
    ]);
  });
});
