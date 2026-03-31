"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light" | "gray";

const THEME_CONFIG: Record<Theme, { label: string; icon: string }> = {
  dark: { label: "Dark", icon: "●" },
  light: { label: "Light", icon: "○" },
  gray: { label: "Gray", icon: "◐" },
};

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = localStorage.getItem("oikbas-theme") as Theme | null;
    if (saved && THEME_CONFIG[saved]) {
      setTheme(saved);
      applyTheme(saved);
    }
  }, []);

  function applyTheme(t: Theme) {
    const html = document.documentElement;
    html.classList.remove("dark", "light", "gray");
    html.classList.add(t);
    localStorage.setItem("oikbas-theme", t);
  }

  function cycle() {
    const order: Theme[] = ["dark", "gray", "light"];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
    applyTheme(next);
  }

  return (
    <button
      onClick={cycle}
      className="flex items-center gap-1 text-neutral-500 hover:text-neutral-300 transition-colors"
      title={`Theme: ${THEME_CONFIG[theme].label}`}
    >
      <span className="text-xs">{THEME_CONFIG[theme].icon}</span>
      <span className="text-[10px] hidden sm:inline">{THEME_CONFIG[theme].label}</span>
    </button>
  );
}
