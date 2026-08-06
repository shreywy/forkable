"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";

interface Props {
  ingredientId: string;
  initialInPantry: boolean;
}

export function PantryToggleButton({ ingredientId, initialInPantry }: Props) {
  const [inPantry, setInPantry] = useState(initialInPantry);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (loading) return;
    setLoading(true);
    const prev = inPantry;
    setInPantry(!prev);
    try {
      const res = prev
        ? await fetch(`/api/pantry/${ingredientId}`, { method: "DELETE" })
        : await fetch("/api/pantry", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ingredientId }),
          });
      if (!res.ok) setInPantry(prev);
    } catch {
      setInPantry(prev);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium transition-colors disabled:opacity-60 ${
        inPantry
          ? "border-yellow-brand/50 bg-yellow-subtle dark:bg-yellow-muted text-foreground"
          : "border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
      }`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : inPantry ? (
        <BookmarkCheck className="w-3.5 h-3.5 text-yellow-brand" />
      ) : (
        <Bookmark className="w-3.5 h-3.5" />
      )}
      {inPantry ? "In your pantry" : "Add to pantry"}
    </button>
  );
}
