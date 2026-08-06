// Parse human amount strings like "250 g", "1/2 cup", "1 1/2 tbsp", "3"
// into a numeric amount + unit. Used when merging taste-test suggestions.

const UNICODE_FRACTIONS: Record<string, number> = {
  "½": 0.5,
  "¼": 0.25,
  "¾": 0.75,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "⅛": 0.125,
};

export function parseAmount(raw: string): { amount: number | null; unit: string | null } {
  const text = raw.trim();
  if (!text) return { amount: null, unit: null };

  // Replace unicode fractions with "+decimal" so "1½" becomes "1+0.5"
  let normalized = text;
  for (const [glyph, value] of Object.entries(UNICODE_FRACTIONS)) {
    normalized = normalized.replace(glyph, `+${value}`);
  }

  const m = normalized.match(/^([\d.\/+\s]+)\s*(.*)$/);
  if (!m || !m[1].trim()) {
    return { amount: null, unit: text || null };
  }

  const numberPart = m[1].trim();
  const unitPart = m[2].trim();

  // Evaluate "1 1/2", "1+0.5", "1/2", "2.5"
  let total = 0;
  const chunks = numberPart.split(/[\s+]+/).filter(Boolean);
  for (const chunk of chunks) {
    if (chunk.includes("/")) {
      const [num, den] = chunk.split("/").map(Number);
      if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) {
        return { amount: null, unit: text || null };
      }
      total += num / den;
    } else {
      const n = Number(chunk);
      if (!Number.isFinite(n)) return { amount: null, unit: text || null };
      total += n;
    }
  }

  return {
    amount: Math.round(total * 1000) / 1000,
    unit: unitPart || null,
  };
}
