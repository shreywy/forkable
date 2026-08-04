"use client";

import { useTheme } from "@/components/ThemeProvider";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-yellow-subtle dark:hover:bg-yellow-muted transition-colors overflow-hidden"
    >
      {/* Sun icon — visible in dark mode, sweeps out in light mode */}
      <Sun
        className="absolute w-4 h-4 transition-all duration-500 ease-in-out"
        style={{
          opacity: isDark ? 1 : 0,
          transform: isDark ? "rotate(0deg) scale(1)" : "rotate(-90deg) scale(0.5)",
        }}
      />
      {/* Moon icon — visible in light mode, sweeps out in dark mode */}
      <Moon
        className="absolute w-4 h-4 transition-all duration-500 ease-in-out"
        style={{
          opacity: isDark ? 0 : 1,
          transform: isDark ? "rotate(90deg) scale(0.5)" : "rotate(0deg) scale(1)",
        }}
      />
    </button>
  );
}
