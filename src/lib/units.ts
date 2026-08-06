// Recipe amount math: scaling by servings factor, metric/imperial conversion,
// and cook-friendly formatting with vulgar fractions.

export type Amount = { value: number; unit: string | null };

type UnitInfo = {
  system: "metric" | "imperial";
  toBase: number; // multiply to get base unit amount
  base: "g" | "ml";
  volume?: boolean;
};

export const CONVERTIBLE_UNITS: Record<string, UnitInfo> = {
  // metric mass
  mg: { system: "metric", toBase: 0.001, base: "g" },
  g: { system: "metric", toBase: 1, base: "g" },
  kg: { system: "metric", toBase: 1000, base: "g" },
  // metric volume
  ml: { system: "metric", toBase: 1, base: "ml", volume: true },
  l: { system: "metric", toBase: 1000, base: "ml", volume: true },
  // imperial mass
  oz: { system: "imperial", toBase: 28.35, base: "g" },
  lb: { system: "imperial", toBase: 453.6, base: "g" },
  lbs: { system: "imperial", toBase: 453.6, base: "g" },
  // imperial volume
  tsp: { system: "imperial", toBase: 4.93, base: "ml", volume: true },
  tbsp: { system: "imperial", toBase: 14.79, base: "ml", volume: true },
  cup: { system: "imperial", toBase: 236.6, base: "ml", volume: true },
  cups: { system: "imperial", toBase: 236.6, base: "ml", volume: true },
  "fl-oz": { system: "imperial", toBase: 29.57, base: "ml", volume: true },
};

function unitInfo(unit: string | null): UnitInfo | null {
  if (!unit) return null;
  return CONVERTIBLE_UNITS[unit.toLowerCase().trim()] ?? null;
}

const NICE_FRACTIONS = [0.25, 1 / 3, 0.5, 2 / 3, 0.75];

const FRACTION_GLYPHS: [number, string][] = [
  [0.25, "¼"],
  [1 / 3, "⅓"],
  [0.5, "½"],
  [2 / 3, "⅔"],
  [0.75, "¾"],
];

/**
 * Scale an amount. Imperial volume units snap to the nearest kitchen fraction
 * (quarters and thirds) when within 3%, so 0.34 cup becomes ⅓ cup.
 */
export function scaleAmount(a: Amount, factor: number): Amount {
  const raw = a.value * factor;
  const info = unitInfo(a.unit);

  if (info?.system === "imperial" && info.volume) {
    const whole = Math.floor(raw);
    const frac = raw - whole;
    for (const f of NICE_FRACTIONS) {
      if (frac > 0 && Math.abs(frac - f) / f <= 0.03) {
        return { value: whole + f, unit: a.unit };
      }
    }
  }

  return { value: Math.round(raw * 100) / 100, unit: a.unit };
}

/** "1½ cup", "250 g", "3" - vulgar fraction glyphs where they read naturally. */
export function formatAmount(a: Amount): string {
  const whole = Math.floor(a.value);
  const frac = a.value - whole;

  let valueStr: string | null = null;
  for (const [f, glyph] of FRACTION_GLYPHS) {
    if (Math.abs(frac - f) < 0.01) {
      valueStr = whole > 0 ? `${whole}${glyph}` : glyph;
      break;
    }
  }
  if (valueStr === null) {
    const rounded = Math.round(a.value * 100) / 100;
    valueStr = String(rounded);
  }

  return a.unit ? `${valueStr} ${a.unit}` : valueStr;
}

function pickReadableUnit(baseValue: number, base: "g" | "ml", system: "metric" | "imperial"): Amount {
  if (system === "metric") {
    if (base === "g") {
      return baseValue >= 1000
        ? { value: baseValue / 1000, unit: "kg" }
        : { value: baseValue, unit: "g" };
    }
    return baseValue >= 1000
      ? { value: baseValue / 1000, unit: "l" }
      : { value: baseValue, unit: "ml" };
  }
  // imperial
  if (base === "g") {
    return baseValue >= 453.6
      ? { value: baseValue / 453.6, unit: "lb" }
      : { value: baseValue / 28.35, unit: "oz" };
  }
  if (baseValue < 15) return { value: baseValue / 4.93, unit: "tsp" };
  if (baseValue < 59.15) return { value: baseValue / 14.79, unit: "tbsp" };
  return { value: baseValue / 236.6, unit: "cup" };
}

/**
 * Convert to the target measurement system, choosing the most readable unit
 * (480 ml -> 2 cup, 1500 g -> 3.3 lb). Unknown units pass through unchanged.
 */
export function convertUnit(a: Amount, target: "metric" | "imperial"): Amount {
  const info = unitInfo(a.unit);
  if (!info) return a;
  if (info.system === target) {
    // Re-pick within the same system so 1500 g still becomes 1.5 kg
    const converted = pickReadableUnit(a.value * info.toBase, info.base, target);
    return { value: Math.round(converted.value * 100) / 100, unit: converted.unit };
  }
  const converted = pickReadableUnit(a.value * info.toBase, info.base, target);
  return { value: Math.round(converted.value * 100) / 100, unit: converted.unit };
}
