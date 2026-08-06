import { describe, it, expect } from "vitest";
import { computeBlame, type BlameVersion } from "@/lib/blame";
import type { RecipeSnapshot } from "@/lib/snapshot";

const AUTHOR_A = { username: "alice", displayName: "Alice", avatarUrl: null };
const AUTHOR_B = { username: "bob", displayName: "Bob", avatarUrl: null };

function makeSnap(steps: string[], ingredients: string[]): RecipeSnapshot {
  return {
    name: "R",
    description: "d",
    servings: 4,
    tags: [],
    components: [
      {
        name: "main",
        displayName: "Main",
        type: "FOLDER",
        ingredients: ingredients.map((name) => ({
          name,
          amount: 1,
          unit: "g",
          preparation: null,
          isOptional: false,
        })),
        steps: steps.map((content) => ({ content, subSteps: [] })),
      },
    ],
  };
}

function version(id: string, author: typeof AUTHOR_A, snapshot: RecipeSnapshot): BlameVersion {
  return { id, message: `tweak ${id}`, createdAt: new Date(`2026-01-0${id}`), author, snapshot };
}

describe("computeBlame", () => {
  it("returns null with no versions", () => {
    expect(computeBlame([])).toBeNull();
  });

  it("blames everything on the first version initially", () => {
    const result = computeBlame([
      version("1", AUTHOR_A, makeSnap(["Mix it well.", "Bake it."], ["flour"])),
    ])!;
    expect(result.steps).toHaveLength(2);
    expect(result.steps.every((s) => s.blame.versionId === "1")).toBe(true);
    expect(result.ingredients[0].blame.versionId).toBe("1");
  });

  it("re-attributes a modified step and an added ingredient", () => {
    const v1 = version("1", AUTHOR_A, makeSnap(["Mix it well.", "Bake it at 180C."], ["flour"]));
    const v2 = version("2", AUTHOR_B, makeSnap(["Mix it well.", "Bake it at 200C."], ["flour", "salt"]));
    const result = computeBlame([v1, v2])!;

    const mix = result.steps.find((s) => s.content === "Mix it well.")!;
    const bake = result.steps.find((s) => s.content === "Bake it at 200C.")!;
    expect(mix.blame.versionId).toBe("1");
    expect(bake.blame.versionId).toBe("2");
    expect(bake.blame.author.username).toBe("bob");

    const flour = result.ingredients.find((i) => i.name === "flour")!;
    const salt = result.ingredients.find((i) => i.name === "salt")!;
    expect(flour.blame.versionId).toBe("1");
    expect(salt.blame.versionId).toBe("2");
  });

  it("drops items removed in later versions", () => {
    const v1 = version("1", AUTHOR_A, makeSnap(["Mix it well.", "Rest the dough."], ["flour"]));
    const v2 = version("2", AUTHOR_B, makeSnap(["Mix it well."], ["flour"]));
    const result = computeBlame([v1, v2])!;
    expect(result.steps.map((s) => s.content)).toEqual(["Mix it well."]);
  });

  it("keeps blame through untouched middle versions", () => {
    const v1 = version("1", AUTHOR_A, makeSnap(["Mix it well."], ["flour"]));
    const v2 = version("2", AUTHOR_B, makeSnap(["Mix it well."], ["flour", "salt"]));
    const v3 = version("3", AUTHOR_A, makeSnap(["Mix it well."], ["flour", "salt", "yeast"]));
    const result = computeBlame([v1, v2, v3])!;
    expect(result.steps[0].blame.versionId).toBe("1");
    expect(result.ingredients.find((i) => i.name === "salt")!.blame.versionId).toBe("2");
    expect(result.ingredients.find((i) => i.name === "yeast")!.blame.versionId).toBe("3");
  });
});
