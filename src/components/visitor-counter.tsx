"use client";

import { useEffect, useState } from "react";

interface VisitStats {
  today: number;
  total: number;
}

const SESSION_KEY = "minhanr-visit-recorded";

/**
 * VisitorCounter — tiny visit ticker inside the site dock.
 *
 * Calls `/api/visits` once per browser-session to increment the day's
 * counter, then polls the shared count every 90s so multiple visitors
 * on the same day watch the number climb in near-real-time. Silent on
 * failure — the dock should never error out because the backend is
 * momentarily unreachable.
 */
export function VisitorCounter() {
  const [stats, setStats] = useState<VisitStats | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const recorded = sessionStorage.getItem(SESSION_KEY) === "1";
        const method = recorded ? "GET" : "POST";
        const resp = await fetch("/api/visits", {
          method,
          cache: "no-store",
          headers: { "content-type": "application/json" },
        });
        if (!resp.ok) return;
        const json = (await resp.json()) as VisitStats;
        if (!cancelled) {
          setStats(json);
          if (!recorded) sessionStorage.setItem(SESSION_KEY, "1");
        }
      } catch {
        // Silent — don't show errors on a decoration counter.
      }
    };

    load();
    const iv = window.setInterval(load, 90_000);
    return () => {
      cancelled = true;
      window.clearInterval(iv);
    };
  }, []);

  if (!stats) {
    return (
      <span
        aria-hidden
        className="inline-flex items-center gap-1 px-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground"
      >
        <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
      </span>
    );
  }

  return (
    <span
      title={`Today: ${stats.today.toLocaleString()} · Total: ${stats.total.toLocaleString()}`}
      className="inline-flex items-center gap-1.5 px-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground"
    >
      <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-emerald-400">
        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70" />
      </span>
      <span className="tabular-nums">{stats.today.toLocaleString()}</span>
      <span className="opacity-50">/</span>
      <span className="tabular-nums opacity-60">{stats.total.toLocaleString()}</span>
    </span>
  );
}
