/**
 * Scenes — theme × time-of-day background rotation.
 *
 * Two themes own their own scene set:
 *   • dark — storm-blue rain scenes (six slots, hourly)
 *   • light — sunny, clear-weather scenes (morning / noon / golden hour)
 *
 * Selection is intentionally done on the client — on the server we
 * don't know the viewer's clock or theme class (the pre-paint script
 * applies the theme after the document arrives). RainEffect +
 * SiteBackground read `document.documentElement.classList` and the
 * local hour inside `useEffect`.
 */

export type SceneTheme = "dark" | "light";

export interface Scene {
  key: string;
  label: string;
  /** Image file under `/public/` — full URL-path style. */
  file: string;
  /** Hours (0–23, local time) during which this scene is active. */
  hours: number[];
  /** Theme the scene belongs to. */
  theme: SceneTheme;
}

export const SCENES_DARK: Scene[] = [
  { theme: "dark", key: "harbour",    label: "Pre-dawn harbour",    file: "/scenes/harbour.jpg",    hours: [0, 1, 2, 3, 4, 5] },
  { theme: "dark", key: "forest",     label: "Misty forest",         file: "/scenes/forest.jpg",     hours: [6, 7, 8, 9] },
  { theme: "dark", key: "peaks",      label: "Cloud peaks",          file: "/scenes/peaks.jpg",      hours: [10, 11, 12, 13] },
  { theme: "dark", key: "shore",      label: "Overcast shore",       file: "/scenes/shore.jpg",      hours: [14, 15, 16, 17] },
  { theme: "dark", key: "skyline",    label: "Dusk skyline",         file: "/scenes/skyline.jpg",    hours: [18, 19, 20, 21] },
  { theme: "dark", key: "night-city", label: "Late-night downtown",  file: "/scenes/night-city.jpg", hours: [22, 23] },
];

export const SCENES_LIGHT: Scene[] = [
  { theme: "light", key: "sunrise-beach", label: "Sunrise beach",  file: "/scenes/sunrise-beach.jpg", hours: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
  { theme: "light", key: "noon-beach",    label: "Bright noon beach", file: "/scenes/noon-beach.jpg", hours: [9, 10, 11, 12, 13, 14] },
  { theme: "light", key: "sunset-beach",  label: "Golden hour shore", file: "/scenes/sunset-beach.jpg", hours: [15, 16, 17, 18, 19, 20, 21, 22, 23] },
];

export const SCENES_BY_THEME: Record<SceneTheme, Scene[]> = {
  dark: SCENES_DARK,
  light: SCENES_LIGHT,
};

/** Full flat list — used by SSR fallback helpers and asset audits. */
export const SCENES: Scene[] = [...SCENES_DARK, ...SCENES_LIGHT];

/** First dark scene is the legacy fallback — also copied to /bg.jpg
 *  for the no-JS / WebGL-unavailable case by the generator script. */
export const FALLBACK_SCENE: Scene = SCENES_DARK[0];

/**
 * Rain-engine presets, per theme. Rain intensity mirrors the weather
 * family of each scene set: clear on light, storm on dark.
 */
export interface RainPreset {
  raining: boolean;
  rainChance: number;
  rainLimit: number;
  trailRate: number;
  dropletsRate: number;
  minR: number;
  maxR: number;
  /** Post-process: bg blur + darken strength on the foggy layer. */
  bgBlurPx: number;
  bgBrightness: number;
  bgWashRgba: string;
  /** SiteBackground opacity for the underlying image (before rain canvas). */
  backdropOpacity: number;
  /** Legibility overlay strength — stronger on dark, lighter on light. */
  overlayGradient: string;
}

export const RAIN_PRESETS: Record<SceneTheme, RainPreset> = {
  dark: {
    raining: true,
    rainChance: 0.3,
    rainLimit: 3,
    trailRate: 1,
    dropletsRate: 50,
    minR: 10,
    maxR: 40,
    bgBlurPx: 3,
    bgBrightness: 0.4,
    bgWashRgba: "rgba(14, 26, 46, 0.35)",
    backdropOpacity: 0.22,
    overlayGradient:
      "linear-gradient(to bottom, color-mix(in oklch, var(--background) 25%, transparent), color-mix(in oklch, var(--background) 65%, transparent) 50%, var(--background))",
  },
  light: {
    raining: false,
    rainChance: 0,
    rainLimit: 0,
    trailRate: 0,
    dropletsRate: 0,
    minR: 8,
    maxR: 20,
    bgBlurPx: 0,
    bgBrightness: 1.0,
    bgWashRgba: "rgba(255, 255, 255, 0)",
    backdropOpacity: 0.55,
    overlayGradient:
      "linear-gradient(to bottom, transparent, color-mix(in oklch, var(--background) 25%, transparent) 60%, color-mix(in oklch, var(--background) 70%, transparent))",
  },
};

/**
 * Pick the scene whose theme + hour-range contains the current local
 * hour. Safe to call only on the client. Falls back to the dark pre-dawn
 * harbour if no scene matches (defensive — every hour in every theme
 * is covered by construction).
 */
export function getCurrentScene(
  theme: SceneTheme = "dark",
  date: Date = new Date()
): Scene {
  const set = SCENES_BY_THEME[theme] ?? SCENES_DARK;
  const h = date.getHours();
  return set.find((s) => s.hours.includes(h)) ?? set[0] ?? FALLBACK_SCENE;
}

/** Detect the active theme from the <html> element. SSR-safe — returns
 *  "dark" when `document` is unavailable. */
export function getActiveTheme(): SceneTheme {
  if (typeof document === "undefined") return "dark";
  const cl = document.documentElement.classList;
  if (cl.contains("light")) return "light";
  return "dark";
}

/** Subscribe to changes of the theme class on <html>. Returns a cleanup. */
export function observeTheme(onChange: (t: SceneTheme) => void): () => void {
  if (typeof document === "undefined") return () => {};
  const obs = new MutationObserver(() => onChange(getActiveTheme()));
  obs.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => obs.disconnect();
}
