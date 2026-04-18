"use client";

import { useEffect, useState } from "react";

type IconKey =
  | "sun"
  | "partly-cloudy"
  | "cloudy"
  | "rain"
  | "storm"
  | "snow"
  | "fog"
  | "night"
  | "unknown";

interface Weather {
  temp: number | null;
  condition: string;
  iconKey: IconKey;
}

/**
 * SeoulDatum — top-right editorial datum strip.
 *
 * Renders three things side-by-side in the top-right corner:
 *   1. today's KST date (YYYY.MM.DD · DOW)
 *   2. current KST clock, ticking every second
 *   3. Seoul weather (temperature + tiny glyph), refreshed every 30 min
 *
 * Everything formats client-side via `Intl.DateTimeFormat` with
 * `timeZone: "Asia/Seoul"` so the widget reads the same regardless of
 * the visitor's own timezone. Weather comes from `/api/weather`, which
 * proxies wttr.in and caches 30 min on the edge.
 */
export function SeoulDatum() {
  const [now, setNow] = useState<Date>(() => new Date());
  const [weather, setWeather] = useState<Weather | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const resp = await fetch("/api/weather", { cache: "no-store" });
        if (!resp.ok) return;
        const json = (await resp.json()) as Weather;
        if (!cancelled) setWeather(json);
      } catch {}
    };
    load();
    const id = window.setInterval(load, 30 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const dateStr = formatDate(now);
  const timeStr = formatTime(now);

  return (
    <div
      aria-label="Seoul, Korea — date, time, weather"
      className="pointer-events-none fixed right-5 top-4 z-40 flex flex-col items-end gap-0.5 font-technical text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:right-8 sm:top-6 sm:text-[11px]"
    >
      <div className="text-foreground/90">{dateStr}</div>
      <div className="tabular-nums text-foreground">{timeStr} <span className="text-muted-foreground">KST</span></div>
      <div className="flex items-center gap-1.5">
        <WeatherGlyph icon={weather?.iconKey ?? "unknown"} />
        <span className="tabular-nums">
          {weather?.temp == null ? "—" : `${Math.round(weather.temp)}°`}
        </span>
        <span className="max-w-[10ch] truncate text-muted-foreground">
          {weather?.condition ?? "—"}
        </span>
      </div>
    </div>
  );
}

function formatDate(d: Date): string {
  // Example: "2026.04.18 · SAT"
  const dateParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const y = dateParts.find((p) => p.type === "year")?.value ?? "";
  const m = dateParts.find((p) => p.type === "month")?.value ?? "";
  const day = dateParts.find((p) => p.type === "day")?.value ?? "";
  const dow = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    weekday: "short",
  })
    .format(d)
    .toUpperCase();
  return `${y}.${m}.${day} · ${dow}`;
}

function formatTime(d: Date): string {
  // Example: "22:47:03"
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(d);
}

function WeatherGlyph({ icon }: { icon: IconKey }) {
  const shared = {
    width: 12,
    height: 12,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (icon) {
    case "sun":
      return (
        <svg {...shared}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4" />
        </svg>
      );
    case "partly-cloudy":
      return (
        <svg {...shared}>
          <circle cx="8" cy="10" r="3" />
          <path d="M14 16a4 4 0 0 0 0-8 5 5 0 0 0-9 2" />
        </svg>
      );
    case "cloudy":
      return (
        <svg {...shared}>
          <path d="M7 17a4 4 0 0 1 .5-8A6 6 0 0 1 19 11a4 4 0 0 1 0 8H7Z" />
        </svg>
      );
    case "rain":
      return (
        <svg {...shared}>
          <path d="M7 15a4 4 0 0 1 .5-8A6 6 0 0 1 19 9a4 4 0 0 1 0 8H7Z" />
          <path d="M8 19v2M12 19v2M16 19v2" />
        </svg>
      );
    case "storm":
      return (
        <svg {...shared}>
          <path d="M7 14a4 4 0 0 1 .5-8A6 6 0 0 1 19 8a4 4 0 0 1 0 8H7Z" />
          <path d="M11 17l-2 4h3l-1 3" />
        </svg>
      );
    case "snow":
      return (
        <svg {...shared}>
          <path d="M7 15a4 4 0 0 1 .5-8A6 6 0 0 1 19 9a4 4 0 0 1 0 8H7Z" />
          <path d="M8 20l.4-.4M12 20l.4-.4M16 20l.4-.4" />
        </svg>
      );
    case "fog":
      return (
        <svg {...shared}>
          <path d="M4 10h16M3 14h18M5 18h14" />
        </svg>
      );
    case "night":
      return (
        <svg {...shared}>
          <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
        </svg>
      );
    default:
      return (
        <svg {...shared}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}
