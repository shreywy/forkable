import { describe, it, expect } from "vitest";
import { parseAmount } from "@/lib/parse-amount";

describe("parseAmount", () => {
  it("parses integer with unit", () => {
    expect(parseAmount("250 g")).toEqual({ amount: 250, unit: "g" });
  });

  it("parses attached unit", () => {
    expect(parseAmount("250g")).toEqual({ amount: 250, unit: "g" });
  });

  it("parses decimals", () => {
    expect(parseAmount("2.5 tbsp")).toEqual({ amount: 2.5, unit: "tbsp" });
  });

  it("parses simple fractions", () => {
    expect(parseAmount("1/2 cup")).toEqual({ amount: 0.5, unit: "cup" });
  });

  it("parses mixed numbers", () => {
    expect(parseAmount("1 1/2 tsp")).toEqual({ amount: 1.5, unit: "tsp" });
  });

  it("parses unicode fractions", () => {
    expect(parseAmount("1½ cups")).toEqual({ amount: 1.5, unit: "cups" });
  });

  it("parses bare numbers with no unit", () => {
    expect(parseAmount("3")).toEqual({ amount: 3, unit: null });
  });

  it("returns the text as unit when there is no number", () => {
    expect(parseAmount("a splash")).toEqual({ amount: null, unit: "a splash" });
  });

  it("handles empty input", () => {
    expect(parseAmount("")).toEqual({ amount: null, unit: null });
  });

  it("rejects division by zero", () => {
    expect(parseAmount("1/0 cup").amount).toBeNull();
  });
});
