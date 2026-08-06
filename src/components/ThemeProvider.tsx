"use client";

import { createContext, useContext, useEffect, useCallback, useSyncExternalStore } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  resolvedTheme: "dark",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

const THEME_KEY = "forkable-theme";
const THEME_EVENT = "forkable-theme-change";

function subscribe(cb: () => void) {
  window.addEventListener(THEME_EVENT, cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === THEME_KEY) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(THEME_EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): Theme {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

// Server render (and the hydration pass) always assumes dark, the app default.
function getServerSnapshot(): Theme {
  return "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Apply class whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    localStorage.setItem(THEME_KEY, t);
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme: theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
