"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

type Theme = "dark" | "light";

// Same storage key as theme-switcher.tsx — any page can use either
// component and they read/write to the same key + the same class on
// <html>.
const THEME_KEY = "minhanr-theme";

/**
 * ThemeToggle — sun/moon icon fixed above the bottom-left counter.
 *
 * Pulled out of the SiteDock so the dock can keep its row tight and
 * focused on primary navigation. The icon reads as a symbolic mode
 * indicator — a sun in dark mode (click to go to light), a moon in
 * light mode (click to go to dark) — which the author preferred over
 * the "●/○ DARK" text chip inside the dock.
 *
 * Mount gate avoids the first-paint flash: the pre-paint script in
 * layout.tsx has already applied the persisted theme before hydration,
 * but React doesn't know about it until useEffect runs — so we return
 * a zero-sized placeholder during SSR + first render.
 */
export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(
      document.documentElement.classList.contains("light") ? "light" : "dark"
    );
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const html = document.documentElement;
    html.classList.remove("dark", "light", "gray");
    html.classList.add(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {}
    setTheme(next);
  }

  if (!mounted) {
    return (
      <span
        aria-hidden
        className="fixed left-5 bottom-14 z-40 block h-4 w-4 sm:left-8 sm:bottom-16"
      />
    );
  }

  const Icon = theme === "dark" ? Sun : Moon;
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      title={`Theme: ${theme === "dark" ? "Dark" : "Light"}`}
      className="pointer-events-auto fixed left-5 bottom-14 z-40 inline-flex h-6 w-6 items-center justify-center text-muted-foreground transition-colors hover:text-foreground sm:left-8 sm:bottom-16"
    >
      <Icon className="h-4 w-4" strokeWidth={1.4} />
    </button>
  );
}
