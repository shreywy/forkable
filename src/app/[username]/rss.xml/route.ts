import { prisma } from "@/lib/prisma";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      username: true,
      displayName: true,
      recipes: {
        where: { isPublic: true },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { slug: true, name: true, description: true, createdAt: true },
      },
    },
  });

  if (!user) return new Response("Not found", { status: 404 });

  const items = user.recipes
    .map(
      (r) => `    <item>
      <title>${escapeXml(r.name)}</title>
      <link>${APP_URL}/${user.username}/${r.slug}</link>
      <guid>${APP_URL}/${user.username}/${r.slug}</guid>
      <description>${escapeXml(r.description)}</description>
      <pubDate>${r.createdAt.toUTCString()}</pubDate>
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(user.displayName)} on Forkable</title>
    <link>${APP_URL}/${user.username}</link>
    <description>Latest recipes by ${escapeXml(user.displayName)}</description>
    <language>en</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
