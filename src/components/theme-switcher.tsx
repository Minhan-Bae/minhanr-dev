"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

// Tier 0 brand is "Minhan Bae" (see docs/brand-tenets.md). Storage key
// follows the public-facing brand name, not the internal system codename.
// Legacy "oikbas-theme" reads are migrated by the inline script in layout.tsx
// before paint, so this constant is the only place the writer needs to know.
const THEME_KEY = "minhanr-theme";

const THEME_CONFIG: Record<Theme, { label: string; icon: string }> = {
  dark: { label: "Dark", icon: "●" },
  light: { label: "Light", icon: "○" },
};

function getThemeFromDOM(): Theme {
  if (typeof document === "undefined") return "dark";
  const cl = document.documentElement.classList;
  if (cl.contains("light")) return "light";
  return "dark";
}

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    // Intentional setState-in-effect: the inline script in layout.tsx has
    // already applied the persisted theme class to <html> before hydration,
    // so reading documentElement post-mount is the only way to learn what
    // theme is actually live. The mounted gate below prevents the hydration
    // mismatch that would otherwise result.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(getThemeFromDOM());
    setMounted(true);
  }, []);

  function applyTheme(t: Theme) {
    const html = document.documentElement;
    html.classList.remove("dark", "light", "gray");
    html.classList.add(t);
    localStorage.setItem(THEME_KEY, t);
    setTheme(t);
  }

  function cycle() {
    applyTheme(theme === "dark" ? "light" : "dark");
  }

  // Prevent hydration mismatch - render nothing until mounted
  if (!mounted) {
    return <span className="w-10 h-4" />;
  }

  return (
    <button
      onClick={cycle}
      className="flex items-center gap-1.5 px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-200"
      title={`Theme: ${THEME_CONFIG[theme].label}`}
    >
      <span className="text-xs">{THEME_CONFIG[theme].icon}</span>
      <span className="text-xs hidden sm:inline">{THEME_CONFIG[theme].label}</span>
    </button>
  );
}
