import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const alt = "Cook profile on Forkable";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const YELLOW = "#F5C518";
const CHARCOAL = "#1a1a1a";

export default async function OgImage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      _count: { select: { recipes: true, followers: true } },
    },
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: CHARCOAL,
          color: "white",
        }}
      >
        <div style={{ width: 20, height: "100%", background: YELLOW, display: "flex" }} />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 28,
            padding: "0 80px",
          }}
        >
          {user?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt=""
              width={160}
              height={160}
              style={{ borderRadius: 80, border: `6px solid ${YELLOW}` }}
            />
          ) : (
            <div
              style={{
                width: 160,
                height: 160,
                borderRadius: 80,
                background: YELLOW,
                color: CHARCOAL,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 80,
                fontWeight: 700,
              }}
            >
              {(user?.displayName ?? "F")[0]}
            </div>
          )}
          <div style={{ fontSize: 64, fontWeight: 800, display: "flex" }}>
            {user?.displayName ?? "Forkable"}
          </div>
          {user && (
            <div style={{ fontSize: 32, color: "#b8b8b8", display: "flex" }}>
              @{user.username}
            </div>
          )}
          {user && (
            <div style={{ display: "flex", gap: 48, fontSize: 30, color: "#d8d8d8" }}>
              <div style={{ display: "flex" }}>{user._count.recipes} recipes</div>
              <div style={{ display: "flex" }}>{user._count.followers} followers</div>
            </div>
          )}
          <div style={{ fontSize: 26, color: YELLOW, display: "flex", marginTop: 8 }}>
            forkable · version control for recipes
          </div>
        </div>
      </div>
    ),
    size,
  );
}
