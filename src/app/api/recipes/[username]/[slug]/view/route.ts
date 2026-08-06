import { prisma } from "@/lib/prisma";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";

// Anonymous view counter. Rate-limited per ip+recipe so refresh spam does not
// inflate numbers. Always returns 204 - view tracking must never surface errors.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ username: string; slug: string }> },
) {
  const { username, slug } = await params;

  try {
    const key = `view:${clientKey(null, req)}:${username}/${slug}`;
    const rl = await checkRateLimit(key, { limit: 3, windowSec: 3600 });
    if (rl.ok) {
      const recipe = await prisma.recipe.findFirst({
        where: { slug, author: { username }, isPublic: true },
        select: { id: true },
      });
      if (recipe) {
        const today = new Date();
        const day = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
        await prisma.recipeDailyStat.upsert({
          where: { recipeId_day: { recipeId: recipe.id, day } },
          create: { recipeId: recipe.id, day, views: 1 },
          update: { views: { increment: 1 } },
        });
      }
    }
  } catch {
    /* never fail the caller */
  }

  return new Response(null, { status: 204 });
}
