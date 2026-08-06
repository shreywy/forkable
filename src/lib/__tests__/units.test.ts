import { describe, it, expect } from "vitest";
import { scaleAmount, formatAmount, convertUnit } from "@/lib/units";

describe("scaleAmount", () => {
  it("scales metric amounts and rounds cleanly", () => {
    expect(scaleAmount({ value: 250, unit: "g" }, 2)).toEqual({ value: 500, unit: "g" });
  });

  it("rounds awkward decimals to 2 decimal places", () => {
    expect(scaleAmount({ value: 1, unit: "g" }, 1 / 3).value).toBeCloseTo(0.33, 2);
  });

  it("snaps imperial volume amounts to nice fractions", () => {
    // 0.75 cup * 2/3 = 0.5 cups exactly; 1 cup * 0.34 = 0.34 -> snaps to 1/3
    expect(scaleAmount({ value: 1, unit: "cup" }, 0.34).value).toBeCloseTo(1 / 3, 5);
  });

  it("does not snap metric units", () => {
    expect(scaleAmount({ value: 100, unit: "g" }, 0.33).value).toBeCloseTo(33, 5);
  });

  it("handles null-ish scale of unknown units", () => {
    expect(scaleAmount({ value: 2, unit: "cloves" }, 1.5)).toEqual({ value: 3, unit: "cloves" });
  });
});

describe("formatAmount", () => {
  it("renders whole metric amounts plainly", () => {
    expect(formatAmount({ value: 250, unit: "g" })).toBe("250 g");
  });

  it("renders vulgar fractions for imperial volume units", () => {
    expect(formatAmount({ value: 1.5, unit: "cup" })).toBe("1½ cup");
    expect(formatAmount({ value: 0.5, unit: "tsp" })).toBe("½ tsp");
    expect(formatAmount({ value: 0.25, unit: "cup" })).toBe("¼ cup");
  });

  it("renders unitless amounts", () => {
    expect(formatAmount({ value: 3, unit: null })).toBe("3");
  });

  it("keeps non-fraction decimals readable", () => {
    expect(formatAmount({ value: 2.7, unit: "g" })).toBe("2.7 g");
  });
});

describe("convertUnit", () => {
  it("converts grams to imperial ounces", () => {
    const r = convertUnit({ value: 250, unit: "g" }, "imperial");
    expect(r.unit).toBe("oz");
    expect(r.value).toBeCloseTo(8.8, 1);
  });

  it("converts large gram amounts to pounds", () => {
    const r = convertUnit({ value: 1500, unit: "g" }, "imperial");
    expect(r.unit).toBe("lb");
    expect(r.value).toBeCloseTo(3.3, 1);
  });

  it("converts cups to millilitres and picks readable metric unit", () => {
    const r = convertUnit({ value: 2, unit: "cups" }, "metric");
    expect(r.unit).toBe("ml");
    expect(r.value).toBeCloseTo(473, 0);
  });

  it("converts millilitres to a readable imperial unit", () => {
    const r = convertUnit({ value: 480, unit: "ml" }, "imperial");
    expect(r.unit).toBe("cup");
    expect(r.value).toBeCloseTo(2, 1);
  });

  it("scales metric up to kg / l for large values", () => {
    expect(convertUnit({ value: 1500, unit: "g" }, "metric").unit).toBe("kg");
    expect(convertUnit({ value: 2000, unit: "ml" }, "metric").unit).toBe("l");
  });

  it("returns unknown units unchanged", () => {
    expect(convertUnit({ value: 2, unit: "cloves" }, "imperial")).toEqual({
      value: 2,
      unit: "cloves",
    });
  });

  it("returns null-unit amounts unchanged", () => {
    expect(convertUnit({ value: 3, unit: null }, "metric")).toEqual({ value: 3, unit: null });
  });

  it("keeps small ml values as tsp in imperial", () => {
    const r = convertUnit({ value: 5, unit: "ml" }, "imperial");
    expect(r.unit).toBe("tsp");
    expect(r.value).toBeCloseTo(1, 1);
  });
});
