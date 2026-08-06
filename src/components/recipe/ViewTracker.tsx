"use client";

import { useEffect } from "react";

/**
 * Fires one view ping after the reader has stayed 5 seconds on the page
 * (skips bounces). Renders nothing.
 */
export function ViewTracker({ username, slug }: { username: string; slug: string }) {
  useEffect(() => {
    const t = setTimeout(() => {
      fetch(`/api/recipes/${username}/${slug}/view`, {
        method: "POST",
        keepalive: true,
      }).catch(() => {});
    }, 5000);
    return () => clearTimeout(t);
  }, [username, slug]);

  return null;
}
