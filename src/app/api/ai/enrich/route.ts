import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { aiEnabled, enrichRecipe } from "@/lib/ai";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  name: z.string().min(2).max(120),
  ingredients: z.array(z.string()).max(60),
  steps: z.array(z.string()).max(30),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!aiEnabled()) {
    return NextResponse.json({ error: "AI features not configured" }, { status: 503 });
  }

  const rl = await checkRateLimit(`ai:${session.user.id}`, { limit: 10, windowSec: 3600 });
  if (!rl.ok) return rateLimitResponse(rl.resetAt);

  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const enrichment = await enrichRecipe(parsed.data);
  if (!enrichment) {
    return NextResponse.json({ error: "Could not generate suggestions" }, { status: 502 });
  }

  return NextResponse.json(enrichment);
}
