import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

// Rendered on demand: querying the DB at build time would break CI builds
export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [recipes, users] = await Promise.all([
    prisma.recipe.findMany({
      where: { isPublic: true },
      orderBy: { starCount: "desc" },
      take: 5000,
      select: { slug: true, updatedAt: true, author: { select: { username: true } } },
    }),
    prisma.user.findMany({
      take: 1000,
      select: { username: true, updatedAt: true },
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: APP_URL, changeFrequency: "daily", priority: 1 },
    { url: `${APP_URL}/explore`, changeFrequency: "daily", priority: 0.9 },
    { url: `${APP_URL}/trending`, changeFrequency: "daily", priority: 0.8 },
  ];

  return [
    ...staticRoutes,
    ...recipes.map((r) => ({
      url: `${APP_URL}/${r.author.username}/${r.slug}`,
      lastModified: r.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...users.map((u) => ({
      url: `${APP_URL}/${u.username}`,
      lastModified: u.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
