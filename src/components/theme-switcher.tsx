"use client";

import { useEffect, useState } from "react";
import { useSyncExternalStore } from "react";

type Theme = "dark" | "light" | "gray";

const THEME_CONFIG: Record<Theme, { label: string; icon: string }> = {
  dark: { label: "Dark", icon: "●" },
  light: { label: "Light", icon: "○" },
  gray: { label: "Gray", icon: "◐" },
};

function getThemeFromDOM(): Theme {
  if (typeof document === "undefined") return "dark";
  const cl = document.documentElement.classList;
  if (cl.contains("light")) return "light";
  if (cl.contains("gray")) return "gray";
  return "dark";
}

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(getThemeFromDOM());
    setMounted(true);
  }, []);

  function applyTheme(t: Theme) {
    const html = document.documentElement;
    html.classList.remove("dark", "light", "gray");
    html.classList.add(t);
    localStorage.setItem("oikbas-theme", t);
    setTheme(t);
  }

  function cycle() {
    const order: Theme[] = ["dark", "gray", "light"];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    applyTheme(next);
  }

  // Prevent hydration mismatch - render nothing until mounted
  if (!mounted) {
    return <span className="w-10 h-4" />;
  }

  return (
    <button
      onClick={cycle}
      className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
      title={`Theme: ${THEME_CONFIG[theme].label}`}
    >
      <span className="text-xs">{THEME_CONFIG[theme].icon}</span>
      <span className="text-[10px] hidden sm:inline">{THEME_CONFIG[theme].label}</span>
    </button>
  );
}
