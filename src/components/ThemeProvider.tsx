"use client";

import { createContext, useContext, useState, useEffect } from "react";

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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  // Read stored preference on mount
  useEffect(() => {
    const stored = localStorage.getItem("forkable-theme") as Theme | null;
    if (stored === "light" || stored === "dark") {
      setThemeState(stored);
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      setThemeState("light");
    }
    // else keep "dark" default
  }, []);

  // Apply class whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("forkable-theme", t);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme: theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
