import { describe, it, expect } from "vitest";
import { toWebsearchQuery } from "@/lib/search";

describe("toWebsearchQuery", () => {
  it("trims and collapses whitespace", () => {
    expect(toWebsearchQuery("  spicy   chicken  ")).toBe("spicy chicken");
  });

  it("caps length at 100 characters", () => {
    expect(toWebsearchQuery("a".repeat(300))).toHaveLength(100);
  });

  it("returns empty string for whitespace-only input", () => {
    expect(toWebsearchQuery("   ")).toBe("");
  });

  it("preserves websearch operators like quotes and minus", () => {
    expect(toWebsearchQuery('"exact phrase" -spicy')).toBe('"exact phrase" -spicy');
  });
});
