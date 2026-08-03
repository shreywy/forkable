/**
 * Forkable Recipe Parser
 *
 * Strategy (no LLM, no paid APIs):
 * 1. JSON-LD  — extract <script type="application/ld+json"> blocks containing @type:"Recipe"
 *               Most major sites (Allrecipes, BBC Good Food, Food Network, Serious Eats,
 *               Epicurious, Simply Recipes, Tasty, Bon Appétit…) use this for Google rich snippets.
 * 2. Text     — regex-based fallback for paste imports or sites without structured data.
 */

export type ParsedRecipe = {
  name: string;
  description: string;
  imageUrl?: string;
  servings?: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  ingredients: string[];   // raw strings: "2 cups all-purpose flour, sifted"
  instructions: string[];  // plain step strings
  tags: string[];
  nutrition: {
    calories?: string;
    protein?: string;
    carbs?: string;
    fat?: string;
    fiber?: string;
  };
  sourceUrl?: string;
  sourceSite?: string;
  confidence: "high" | "medium" | "low";
};

// ── ISO 8601 duration → human string ─────────────────────────────────────────

export function parseDuration(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return undefined;
  const h = parseInt(m[1] ?? "0");
  const min = parseInt(m[2] ?? "0");
  if (h && min) return `${h} hr ${min} min`;
  if (h) return `${h} hr`;
  if (min) return `${min} min`;
  return undefined;
}

// ── Flatten recipeInstructions (handles all schema.org variants) ──────────────

function flattenInstructions(raw: unknown): string[] {
  if (!raw) return [];

  // Plain string — split on newlines / numbered lists
  if (typeof raw === "string") {
    return raw
      .split(/\n+/)
      .map((s) => s.replace(/^\d+[\.\)]\s*/, "").trim())
      .filter((s) => s.length > 10);
  }

  if (!Array.isArray(raw)) return [];

  const steps: string[] = [];
  for (const item of raw) {
    if (typeof item === "string") {
      const text = item.replace(/^\d+[\.\)]\s*/, "").trim();
      if (text.length > 5) steps.push(text);
    } else if (item && typeof item === "object") {
      const obj = item as Record<string, unknown>;
      if (obj["@type"] === "HowToSection" && Array.isArray(obj.itemListElement)) {
        // Grouped steps — flatten them in
        for (const sub of obj.itemListElement as unknown[]) {
          const s = extractStepText(sub);
          if (s) steps.push(s);
        }
      } else {
        const s = extractStepText(item);
        if (s) steps.push(s);
      }
    }
  }
  return steps;
}

function extractStepText(item: unknown): string | null {
  if (typeof item === "string") return item.trim() || null;
  if (!item || typeof item !== "object") return null;
  const obj = item as Record<string, unknown>;
  const text = obj.text ?? obj.name ?? obj.description ?? "";
  return typeof text === "string" && text.trim().length > 5 ? text.trim() : null;
}

// ── Extract nutrition value ───────────────────────────────────────────────────

function extractNutritionValue(raw: unknown): string | undefined {
  if (!raw) return undefined;
  if (typeof raw === "string") return raw.replace(/\s+/g, " ").trim() || undefined;
  if (typeof raw === "number") return String(raw);
  return undefined;
}

// ── Get first image URL from schema.org image field ──────────────────────────

function extractImage(raw: unknown): string | undefined {
  if (!raw) return undefined;
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) return extractImage(raw[0]);
  if (typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    return typeof obj.url === "string" ? obj.url : undefined;
  }
  return undefined;
}

// ── Extract servings ──────────────────────────────────────────────────────────

function extractServings(raw: unknown): string | undefined {
  if (!raw) return undefined;
  if (typeof raw === "string") return raw;
  if (typeof raw === "number") return String(raw);
  if (Array.isArray(raw)) return extractServings(raw[0]);
  return undefined;
}

// ── Keywords → tags ───────────────────────────────────────────────────────────

function extractTags(raw: unknown): string[] {
  if (!raw) return [];
  const str = typeof raw === "string" ? raw : Array.isArray(raw) ? (raw as string[]).join(",") : "";
  return str
    .split(/[,;|]+/)
    .map((t) => t.trim().toLowerCase().replace(/\s+/g, "-"))
    .filter((t) => t.length > 1 && t.length < 40)
    .slice(0, 8);
}

// ── Parse a schema.org Recipe object ─────────────────────────────────────────

function parseSchemaRecipe(data: Record<string, unknown>, sourceUrl?: string): ParsedRecipe {
  const name = String(data.name ?? "").trim();
  const description = String(data.description ?? "").trim().replace(/<[^>]+>/g, "");
  const ingredients = Array.isArray(data.recipeIngredient)
    ? (data.recipeIngredient as unknown[]).map((i) => String(i).trim()).filter(Boolean)
    : [];
  const instructions = flattenInstructions(data.recipeInstructions);
  const nutrition = data.nutrition as Record<string, unknown> | undefined;

  return {
    name,
    description,
    imageUrl: extractImage(data.image),
    servings: extractServings(data.recipeYield ?? data.yield),
    prepTime: parseDuration(data.prepTime as string),
    cookTime: parseDuration(data.cookTime as string),
    totalTime: parseDuration(data.totalTime as string),
    ingredients,
    instructions,
    tags: extractTags(data.keywords ?? data.recipeCategory),
    nutrition: {
      calories: extractNutritionValue(nutrition?.calories ?? nutrition?.["@calories"]),
      protein:  extractNutritionValue(nutrition?.proteinContent),
      carbs:    extractNutritionValue(nutrition?.carbohydrateContent),
      fat:      extractNutritionValue(nutrition?.fatContent),
      fiber:    extractNutritionValue(nutrition?.fiberContent),
    },
    sourceUrl,
    sourceSite: sourceUrl ? new URL(sourceUrl).hostname.replace(/^www\./, "") : undefined,
    confidence: ingredients.length > 0 && instructions.length > 0 ? "high" : "medium",
  };
}

// ── Find Recipe in a parsed JSON-LD object ────────────────────────────────────

function findRecipeInJsonLd(obj: unknown): Record<string, unknown> | null {
  if (!obj || typeof obj !== "object") return null;

  // Direct Recipe
  const item = obj as Record<string, unknown>;
  const type = item["@type"];
  if (type === "Recipe" || (Array.isArray(type) && type.includes("Recipe"))) {
    return item;
  }

  // @graph array
  if (Array.isArray(item["@graph"])) {
    for (const node of item["@graph"] as unknown[]) {
      const found = findRecipeInJsonLd(node);
      if (found) return found;
    }
  }

  // Array at root
  if (Array.isArray(obj)) {
    for (const node of obj) {
      const found = findRecipeInJsonLd(node);
      if (found) return found;
    }
  }

  return null;
}

// ── Extract JSON-LD blocks from raw HTML ──────────────────────────────────────

export function extractJsonLdRecipe(html: string, sourceUrl?: string): ParsedRecipe | null {
  // Match all <script type="application/ld+json"> blocks
  // Handles both quoted (type="..." or type='...') and unquoted (type=application/ld+json) attributes
  const scriptRe = /<script[^>]+type=["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = scriptRe.exec(html)) !== null) {
    const raw = match[1].trim();
    try {
      const parsed = JSON.parse(raw);
      const recipe = findRecipeInJsonLd(parsed);
      if (recipe && recipe.name) {
        return parseSchemaRecipe(recipe, sourceUrl);
      }
    } catch {
      // malformed JSON — skip
    }
  }

  return null;
}

// ── Text paste parser ─────────────────────────────────────────────────────────

const MEASUREMENT_WORDS = [
  "cup", "cups", "tbsp", "tablespoon", "tablespoons", "tsp", "teaspoon", "teaspoons",
  "oz", "ounce", "ounces", "lb", "lbs", "pound", "pounds",
  "g", "gram", "grams", "kg", "ml", "liter", "liters", "l",
  "pinch", "handful", "clove", "cloves", "can", "cans", "jar", "jars",
  "bunch", "head", "slice", "slices", "piece", "pieces", "stalk", "stalks",
  "package", "packages", "bag", "bags", "stick", "sticks",
];

const MEASUREMENT_RE = new RegExp(
  `^(\\d[\\d\\s\\/\\-½¼¾⅓⅔⅛]*)\\s*(${MEASUREMENT_WORDS.join("|")})s?\\b`,
  "i",
);

const FRACTION_MAP: Record<string, string> = { "½": "1/2", "¼": "1/4", "¾": "3/4", "⅓": "1/3", "⅔": "2/3", "⅛": "1/8" };

function normalizeLine(line: string): string {
  return Object.entries(FRACTION_MAP).reduce((s, [k, v]) => s.replace(k, v), line);
}

function looksLikeIngredient(line: string): boolean {
  const l = normalizeLine(line.trim());
  // Starts with a number (possibly fractional)
  if (/^[\d½¼¾⅓⅔⅛]/.test(l)) {
    if (MEASUREMENT_RE.test(l)) return true;
    // "2 eggs", "3 cloves garlic", etc
    if (/^[\d][\d\s\/]*\s+\w/.test(l)) return true;
  }
  // Starts with measurement word ("Pinch of salt", "A handful of...")
  if (new RegExp(`^(a\\s+)?(${MEASUREMENT_WORDS.join("|")})s?\\b`, "i").test(l)) return true;
  return false;
}

function looksLikeInstruction(line: string): boolean {
  const l = line.trim();
  // Numbered step: "1. ...", "1) ..."
  if (/^\d+[\.\)]\s+\w/.test(l)) return true;
  // Long sentence (> 30 chars) starting with a verb or capital
  if (l.length > 30 && /^[A-Z]/.test(l) && !looksLikeIngredient(l)) return true;
  return false;
}

const SECTION_HEADERS: Record<string, "ingredients" | "instructions" | "ignore"> = {
  ingredients: "ingredients", ingredient: "ingredients", "what you need": "ingredients",
  directions: "instructions", instructions: "instructions", steps: "instructions",
  method: "instructions", preparation: "instructions", "how to make": "instructions",
  notes: "ignore", tips: "ignore", nutrition: "ignore",
};

function getSectionType(line: string): "ingredients" | "instructions" | "ignore" | null {
  const lower = line.trim().toLowerCase().replace(/[:\s]+$/, "");
  return SECTION_HEADERS[lower] ?? null;
}

export function parseTextRecipe(text: string): ParsedRecipe {
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    return { name: "", description: "", ingredients: [], instructions: [], tags: [], nutrition: {}, confidence: "low" };
  }

  // First non-empty line is the title
  const name = lines[0];
  let currentSection: "ingredients" | "instructions" | "description" | "unknown" = "description";
  const descLines: string[] = [];
  const ingredients: string[] = [];
  const instructions: string[] = [];
  let servings: string | undefined;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // Section header detection
    const sectionType = getSectionType(line);
    if (sectionType) {
      currentSection = sectionType === "ignore" ? "unknown" : sectionType;
      continue;
    }

    // Servings detection
    const servingsMatch = line.match(/(?:serves?|yield|servings?|makes?)[\s:]+(\d+(?:\s*-\s*\d+)?(?:\s+\w+)?)/i);
    if (servingsMatch) { servings = servingsMatch[1].trim(); continue; }

    // Content routing
    if (currentSection === "ingredients") {
      const clean = line.replace(/^[-•*]\s*/, "").trim();
      if (clean) ingredients.push(clean);
    } else if (currentSection === "instructions") {
      const clean = line.replace(/^\d+[\.\)]\s*/, "").trim();
      if (clean.length > 5) instructions.push(clean);
    } else if (currentSection === "description") {
      descLines.push(line);
    } else {
      // Unknown section — auto-detect
      const clean = line.replace(/^[-•*\d\.\)]\s*/, "").trim();
      if (looksLikeIngredient(line)) { ingredients.push(clean); }
      else if (looksLikeInstruction(line)) { instructions.push(clean.replace(/^\d+[\.\)]\s*/, "")); }
      else if (clean.length > 3) { descLines.push(clean); }
    }
  }

  const confidence: ParsedRecipe["confidence"] =
    ingredients.length > 2 && instructions.length > 1 ? "medium" : "low";

  return {
    name,
    description: descLines.slice(0, 3).join(" ").trim(),
    servings,
    ingredients,
    instructions,
    tags: [],
    nutrition: {},
    confidence,
  };
}
