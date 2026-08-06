"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Compass, TrendingUp, Plus, ShoppingCart, Loader2, ChefHat, CornerDownLeft,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type RecipeHit = {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  author: { username: string; displayName: string; avatarUrl: string | null };
};

type UserHit = { username: string; displayName: string; avatarUrl: string | null };

type Item =
  | { kind: "link"; label: string; href: string; icon: React.ReactNode }
  | { kind: "recipe"; recipe: RecipeHit }
  | { kind: "user"; user: UserHit };

const QUICK_LINKS: { label: string; href: string; icon: React.ReactNode }[] = [
  { label: "Explore recipes", href: "/explore", icon: <Compass className="w-4 h-4" /> },
  { label: "Trending", href: "/trending", icon: <TrendingUp className="w-4 h-4" /> },
  { label: "New recipe", href: "/new", icon: <Plus className="w-4 h-4" /> },
  { label: "Shopping list", href: "/shopping-list", icon: <ShoppingCart className="w-4 h-4" /> },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [recipes, setRecipes] = useState<RecipeHit[]>([]);
  const [users, setUsers] = useState<UserHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Global Ctrl/Cmd+K. Opening resets state here, in the event handler.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) {
          setOpen(false);
        } else {
          setQuery("");
          setRecipes([]);
          setUsers([]);
          setSelected(0);
          setLoading(false);
          setOpen(true);
        }
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Focus the input once the dialog renders
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  // Debounced search - all state updates happen inside the timer callback
  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    const t = setTimeout(
      async () => {
        if (!q) {
          setRecipes([]);
          setUsers([]);
          setLoading(false);
          return;
        }
        setLoading(true);
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=all`, {
            signal: controller.signal,
          });
          if (res.ok) {
            const data = (await res.json()) as { recipes: RecipeHit[]; users: UserHit[] };
            setRecipes(data.recipes);
            setUsers(data.users);
            setSelected(0);
          }
        } catch {
          /* aborted or offline - keep previous results */
        } finally {
          setLoading(false);
        }
      },
      q ? 250 : 0,
    );
    return () => clearTimeout(t);
  }, [query, open]);

  const items: Item[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return QUICK_LINKS.map((l) => ({ kind: "link" as const, ...l }));
    const links = QUICK_LINKS.filter((l) => l.label.toLowerCase().includes(q)).map((l) => ({
      kind: "link" as const,
      ...l,
    }));
    return [
      ...recipes.map((recipe) => ({ kind: "recipe" as const, recipe })),
      ...users.map((user) => ({ kind: "user" as const, user })),
      ...links,
    ];
  }, [query, recipes, users]);

  const navigate = useCallback(
    (item: Item) => {
      setOpen(false);
      if (item.kind === "link") router.push(item.href);
      else if (item.kind === "recipe") router.push(`/${item.recipe.author.username}/${item.recipe.slug}`);
      else router.push(`/${item.user.username}`);
    },
    [router],
  );

  const onInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => (items.length ? (s + 1) % items.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => (items.length ? (s - 1 + items.length) % items.length : 0));
    } else if (e.key === "Enter" && items[selected]) {
      e.preventDefault();
      navigate(items[selected]);
    }
  };

  // Keep the selected row visible
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${selected}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  if (!open) return null;

  let runningIndex = -1;
  const row = (content: React.ReactNode, item: Item) => {
    runningIndex++;
    const index = runningIndex;
    return (
      <button
        key={index}
        data-index={index}
        role="option"
        aria-selected={index === selected}
        onMouseEnter={() => setSelected(index)}
        onClick={() => navigate(item)}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
          index === selected ? "bg-yellow-subtle dark:bg-yellow-muted" : "hover:bg-muted/60"
        }`}
      >
        {content}
        {index === selected && (
          <CornerDownLeft className="w-3 h-3 text-muted-foreground ml-auto shrink-0" />
        )}
      </button>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-2.5 px-4 border-b border-border">
          {loading ? (
            <Loader2 className="w-4 h-4 text-muted-foreground animate-spin shrink-0" />
          ) : (
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Search recipes and cooks..."
            className="flex-1 h-12 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-list"
          />
          <kbd className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5 shrink-0">
            esc
          </kbd>
        </div>

        <div
          ref={listRef}
          id="command-palette-list"
          role="listbox"
          className="max-h-[50vh] overflow-y-auto p-2 space-y-0.5"
        >
          {query.trim() && recipes.length > 0 && (
            <p className="px-3 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Recipes
            </p>
          )}
          {recipes.map((r) =>
            row(
              <>
                <div className="w-8 h-8 rounded-md overflow-hidden bg-muted shrink-0">
                  {r.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ChefHat className="w-4 h-4 m-2 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{r.name}</p>
                  <p className="text-xs text-muted-foreground truncate">by {r.author.username}</p>
                </div>
              </>,
              { kind: "recipe", recipe: r },
            ),
          )}

          {query.trim() && users.length > 0 && (
            <p className="px-3 pt-2 pb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Cooks
            </p>
          )}
          {users.map((u) =>
            row(
              <>
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={u.avatarUrl ?? undefined} />
                  <AvatarFallback className="text-xs bg-yellow-light">
                    {u.displayName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{u.displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">@{u.username}</p>
                </div>
              </>,
              { kind: "user", user: u },
            ),
          )}

          {items.some((i) => i.kind === "link") && (
            <p className="px-3 pt-2 pb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {query.trim() ? "Pages" : "Quick links"}
            </p>
          )}
          {items
            .filter((i): i is Extract<Item, { kind: "link" }> => i.kind === "link")
            .map((l) =>
              row(
                <>
                  <span className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                    {l.icon}
                  </span>
                  <span className="text-sm font-medium text-foreground">{l.label}</span>
                </>,
                l,
              ),
            )}

          {query.trim() && !loading && items.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No results for &ldquo;{query.trim()}&rdquo;
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
