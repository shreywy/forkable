import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const alt = "Recipe on Forkable";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const YELLOW = "#F5C518";
const CHARCOAL = "#1a1a1a";

function Fallback() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: CHARCOAL,
        color: "white",
        fontSize: 72,
        fontWeight: 700,
      }}
    >
      <div style={{ color: YELLOW, display: "flex" }}>Forkable</div>
      <div style={{ fontSize: 28, color: "#a0a0a0", marginTop: 12, display: "flex" }}>
        Version control for recipes
      </div>
    </div>
  );
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ username: string; recipe: string }>;
}) {
  const { username, recipe: recipeSlug } = await params;

  const recipe = await prisma.recipe.findFirst({
    where: { slug: recipeSlug, author: { username }, isPublic: true },
    select: {
      name: true,
      description: true,
      starCount: true,
      forkCount: true,
      tweakCount: true,
      author: { select: { username: true, displayName: true, avatarUrl: true } },
    },
  });

  if (!recipe) {
    return new ImageResponse(<Fallback />, size);
  }

  const name = recipe.name.length > 64 ? `${recipe.name.slice(0, 61)}...` : recipe.name;
  const description =
    recipe.description.length > 120
      ? `${recipe.description.slice(0, 117)}...`
      : recipe.description;

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
        {/* Brand accent bar */}
        <div style={{ width: 20, height: "100%", background: YELLOW, display: "flex" }} />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 72px",
          }}
        >
          {/* Header: wordmark */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: YELLOW,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: CHARCOAL,
                fontSize: 36,
                fontWeight: 700,
              }}
            >
              ⑂
            </div>
            <div style={{ fontSize: 36, fontWeight: 700, display: "flex" }}>Forkable</div>
          </div>

          {/* Recipe name + description */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.1, display: "flex" }}>
              {name}
            </div>
            <div style={{ fontSize: 30, color: "#b8b8b8", lineHeight: 1.4, display: "flex" }}>
              {description}
            </div>
          </div>

          {/* Footer: author + stats */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {recipe.author.avatarUrl ? (
                <img
                  src={recipe.author.avatarUrl}
                  alt=""
                  width={52}
                  height={52}
                  style={{ borderRadius: 26 }}
                />
              ) : (
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    background: YELLOW,
                    color: CHARCOAL,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 26,
                    fontWeight: 700,
                  }}
                >
                  {recipe.author.displayName[0]}
                </div>
              )}
              <div style={{ fontSize: 30, color: "#d8d8d8", display: "flex" }}>
                @{recipe.author.username}
              </div>
            </div>
            <div style={{ display: "flex", gap: 36, fontSize: 30, color: "#d8d8d8" }}>
              <div style={{ display: "flex", gap: 10 }}>
                <span style={{ color: YELLOW }}>★</span> {recipe.starCount}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <span style={{ color: YELLOW }}>⑂</span> {recipe.forkCount}
              </div>
              <div style={{ display: "flex", gap: 10 }}>{recipe.tweakCount} tweaks</div>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
