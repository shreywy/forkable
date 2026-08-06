import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Forkable",
    short_name: "Forkable",
    description: "Version control for recipes. Fork, remix, and cook together.",
    start_url: "/",
    display: "standalone",
    background_color: "#1a1a1a",
    theme_color: "#F5C518",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
