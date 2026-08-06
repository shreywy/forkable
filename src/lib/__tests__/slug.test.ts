import { describe, it, expect } from "vitest";
import { toSlug } from "@/lib/slug";

describe("toSlug", () => {
  it("converts a display name to kebab case", () => {
    expect(toSlug("Mom's Lasagna")).toBe("mom-s-lasagna");
  });

  it("strips leading and trailing junk", () => {
    expect(toSlug("  Hello!! ")).toBe("hello");
  });

  it("collapses runs of non-alphanumerics into a single hyphen", () => {
    expect(toSlug("Spicy   &   Sweet -- Chicken")).toBe("spicy-sweet-chicken");
  });

  it("drops accented characters (non a-z) as separators", () => {
    expect(toSlug("Crème Brûlée")).toBe("cr-me-br-l-e");
  });

  it("returns empty string for empty input", () => {
    expect(toSlug("")).toBe("");
  });

  it("returns empty string for symbols-only input", () => {
    expect(toSlug("!!!")).toBe("");
  });
});
