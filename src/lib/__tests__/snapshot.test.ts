import { describe, it, expect } from "vitest";
import { buildSnapshot, countUnits, type SnapshotSource } from "@/lib/snapshot";

const FIXTURE: SnapshotSource = {
  name: "Mom's Lasagna",
  description: "The family classic.",
  servings: 6,
  tags: [{ tag: { name: "italian" } }, { tag: { name: "comfort" } }],
  components: [
    {
      name: "assembly",
      displayName: "Assembly",
      type: "FOLDER",
      order: 1,
      ingredients: [],
      steps: [
        { id: "s3", order: 0, content: "Layer everything.", parentStepId: null },
      ],
    },
    {
      name: "bolognese",
      displayName: "Bolognese Sauce",
      type: "FOLDER",
      order: 0,
      ingredients: [
        {
          order: 1,
          amount: 2,
          unit: "cloves",
          preparation: "minced",
          isOptional: false,
          ingredient: { name: "garlic" },
        },
        {
          order: 0,
          amount: 500,
          unit: "g",
          preparation: null,
          isOptional: false,
          ingredient: { name: "ground beef" },
        },
      ],
      steps: [
        { id: "s1", order: 0, content: "Make the sauce.", parentStepId: null },
        { id: "s1a", order: 1, content: "Brown the beef.", parentStepId: "s1" },
        { id: "s1b", order: 2, content: "Add the garlic.", parentStepId: "s1" },
        { id: "s2", order: 3, content: "Simmer for two hours.", parentStepId: null },
      ],
    },
  ],
};

describe("buildSnapshot", () => {
  it("orders components, ingredients, and steps by their order fields", () => {
    const snap = buildSnapshot(FIXTURE);
    expect(snap.components.map((c) => c.name)).toEqual(["bolognese", "assembly"]);
    expect(snap.components[0].ingredients.map((i) => i.name)).toEqual([
      "ground beef",
      "garlic",
    ]);
  });

  it("nests child steps as subSteps under their parent", () => {
    const snap = buildSnapshot(FIXTURE);
    const bolognese = snap.components[0];
    expect(bolognese.steps).toHaveLength(2);
    expect(bolognese.steps[0].content).toBe("Make the sauce.");
    expect(bolognese.steps[0].subSteps).toEqual(["Brown the beef.", "Add the garlic."]);
    expect(bolognese.steps[1].subSteps).toEqual([]);
  });

  it("sorts tags and captures scalar fields", () => {
    const snap = buildSnapshot(FIXTURE);
    expect(snap.tags).toEqual(["comfort", "italian"]);
    expect(snap.name).toBe("Mom's Lasagna");
    expect(snap.servings).toBe(6);
  });
});

describe("countUnits", () => {
  it("counts ingredients plus top-level steps", () => {
    const snap = buildSnapshot(FIXTURE);
    // 2 ingredients + 2 top-level steps (bolognese) + 1 step (assembly)
    expect(countUnits(snap)).toBe(5);
  });
});
