/**
 * Scenes — time-of-day background rotation.
 *
 * Six editorial scenes (see scripts/generate-backgrounds.mjs for the
 * prompts that produce the JPGs) divide the 24-hour clock into
 * blocks so the public pages' rain-on-glass background shifts along
 * with the visitor's local hour.
 *
 * Selection is intentionally done on the client — on the server we
 * don't know the viewer's clock, and picking at render time would
 * cause a hydration mismatch. RainEffect + SiteBackground call
 * `getCurrentScene()` from `useEffect`.
 */

export interface Scene {
  key: string;
  label: string;
  /** Image file under `/public/` — full URL-path style. */
  file: string;
  /** Hours (0–23, local time) during which this scene is active. */
  hours: number[];
}

export const SCENES: Scene[] = [
  {
    key: "harbour",
    label: "Pre-dawn harbour",
    file: "/scenes/harbour.jpg",
    hours: [0, 1, 2, 3, 4, 5],
  },
  {
    key: "forest",
    label: "Misty forest",
    file: "/scenes/forest.jpg",
    hours: [6, 7, 8, 9],
  },
  {
    key: "peaks",
    label: "Cloud peaks",
    file: "/scenes/peaks.jpg",
    hours: [10, 11, 12, 13],
  },
  {
    key: "shore",
    label: "Overcast shore",
    file: "/scenes/shore.jpg",
    hours: [14, 15, 16, 17],
  },
  {
    key: "skyline",
    label: "Dusk skyline",
    file: "/scenes/skyline.jpg",
    hours: [18, 19, 20, 21],
  },
  {
    key: "night-city",
    label: "Late-night downtown",
    file: "/scenes/night-city.jpg",
    hours: [22, 23],
  },
];

/** First scene is the legacy fallback — also copied to /bg.jpg for the
 *  no-JS / WebGL-unavailable case by the generator script. */
export const FALLBACK_SCENE: Scene = SCENES[0];

/**
 * Pick the scene whose hour-range contains the current local hour.
 * Safe to call only on the client (uses `new Date()`); returns
 * FALLBACK_SCENE if somehow no scene matches (defensive — every hour
 * 0–23 is currently accounted for).
 */
export function getCurrentScene(date: Date = new Date()): Scene {
  const h = date.getHours();
  return SCENES.find((s) => s.hours.includes(h)) ?? FALLBACK_SCENE;
}
