// "Sous Chef" AI features, powered by Claude Haiku (cheapest Claude model -
// this is a free-tier portfolio project, so cost control matters).
//
// Strictly env-gated: when ANTHROPIC_API_KEY is absent every function returns
// an empty result and the UI hides the features. Errors never propagate to
// callers - AI is a garnish, not a dependency.

import { z } from "zod";

const MODEL = "claude-haiku-4-5";

export function aiEnabled(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

async function askClaudeForJson(prompt: string): Promise<unknown> {
  if (!aiEnabled()) return null;
  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic();
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });
    const text = response.content
      .filter((b): b is Extract<typeof b, { type: "text" }> => b.type === "text")
      .map((b) => b.text)
      .join("");
    // Tolerate accidental prose around the JSON
    const start = text.search(/[[{]/);
    const end = Math.max(text.lastIndexOf("]"), text.lastIndexOf("}"));
    if (start === -1 || end === -1) return null;
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

// ── Ingredient substitutions ──────────────────────────────────────────────────

const SubstitutionsSchema = z.array(
  z.object({
    ingredient: z.string(),
    substitute: z.string(),
    note: z.string(),
  }),
);

export type Substitution = z.infer<typeof SubstitutionsSchema>[number];

export async function suggestSubstitutions(
  ingredients: string[],
  dietary?: string,
): Promise<Substitution[]> {
  if (ingredients.length === 0) return [];
  const prompt = [
    "You are a professional chef's assistant. Suggest practical substitutions for ingredients in this recipe.",
    dietary ? `Dietary constraint: ${dietary}.` : "",
    `Ingredients: ${ingredients.slice(0, 30).join(", ")}`,
    'Pick the 3-5 ingredients where a substitution is most useful. Respond with ONLY a JSON array, no prose, in this exact shape: [{"ingredient": "original name", "substitute": "replacement", "note": "one short sentence on ratio or effect"}]',
  ]
    .filter(Boolean)
    .join("\n");

  const raw = await askClaudeForJson(prompt);
  const parsed = SubstitutionsSchema.safeParse(raw);
  return parsed.success ? parsed.data.slice(0, 5) : [];
}

// ── Recipe enrichment (description + tags for the new-recipe wizard) ─────────

const EnrichmentSchema = z.object({
  description: z.string(),
  tags: z.array(z.string()).max(8),
});

export type Enrichment = z.infer<typeof EnrichmentSchema>;

export async function enrichRecipe(input: {
  name: string;
  ingredients: string[];
  steps: string[];
}): Promise<Enrichment | null> {
  const prompt = [
    "You are helping a cook publish a recipe on a social recipe platform.",
    `Recipe name: ${input.name}`,
    `Ingredients: ${input.ingredients.slice(0, 30).join(", ")}`,
    `Steps: ${input.steps.slice(0, 15).join(" | ")}`,
    'Write an appetizing 1-2 sentence description (max 200 characters, no emoji) and suggest 3-6 lowercase single-word or hyphenated tags (cuisine, diet, meal type, cooking style). Respond with ONLY a JSON object, no prose: {"description": "...", "tags": ["...", "..."]}',
  ].join("\n");

  const raw = await askClaudeForJson(prompt);
  const parsed = EnrichmentSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}
