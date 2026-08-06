import { NextResponse } from "next/server";
import { z } from "zod";
import { searchRecipes, searchUsers } from "@/lib/search";
import { checkRateLimit, clientKey, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const QuerySchema = z.object({
  q: z.string().min(1).max(100),
  type: z.enum(["recipes", "users", "all"]).default("all"),
});

export async function GET(req: Request) {
  const rl = await checkRateLimit(`search:${clientKey(null, req)}`, {
    limit: 30,
    windowSec: 60,
  });
  if (!rl.ok) return rateLimitResponse(rl.resetAt);

  const { searchParams } = new URL(req.url);
  const parsed = QuerySchema.safeParse({
    q: searchParams.get("q") ?? "",
    type: searchParams.get("type") ?? "all",
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const { q, type } = parsed.data;
  const [recipes, users] = await Promise.all([
    type === "users" ? Promise.resolve([]) : searchRecipes(q, 8),
    type === "recipes" ? Promise.resolve([]) : searchUsers(q, 5),
  ]);

  return NextResponse.json({ recipes, users });
}
