"use client";

import * as React from "react";

type Theme = "light" | "dark" | "system";
const STORAGE_KEY = "cluxe-theme";

type ThemeContextType = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolvedTheme: "light" | "dark";
};

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(theme: Theme): "light" | "dark" {
  return theme === "system" ? getSystemTheme() : theme;
}

function applyTheme(resolved: "light" | "dark") {
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">("light");

  // Read initial value (the inline script in layout already applied the class
  // to <html>; we just sync our state from localStorage here)
  React.useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "system";
    setThemeState(stored);
    const resolved = resolveTheme(stored);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, []);

  // Listen to system preference changes when in "system" mode
  React.useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const resolved = getSystemTheme();
      setResolvedTheme(resolved);
      applyTheme(resolved);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = React.useCallback((next: Theme) => {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
    const resolved = resolveTheme(next);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, []);

  const value = React.useMemo(
    () => ({ theme, setTheme, resolvedTheme }),
    [theme, setTheme, resolvedTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    // Allow components outside the provider to render with sane defaults
    return {
      theme: "system" as Theme,
      setTheme: () => {},
      resolvedTheme: "light" as const,
    };
  }
  return ctx;
}
