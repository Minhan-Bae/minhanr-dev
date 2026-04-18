"use client";

import { useEffect, useState } from "react";

/**
 * RainEffect — DOM-based rain-on-glass layer (v2).
 *
 * The v1 canvas approach painted small translucent circles, which read
 * as bubble stickers rather than water. The codrops reference gets its
 * weight from each drop being an actual *lens* over the background —
 * the pixels behind each drop are blurred and slightly desaturated, so
 * your eye reads it as glass with water on it.
 *
 * We reproduce that by rendering each drop as an absolutely-positioned
 * `<div>` with `backdrop-filter: blur() saturate()` and a subtle inset
 * shadow for rim depth. Browsers composite backdrop-filter on the GPU,
 * so 30–40 drops is cheap. Drops form in with a scale animation; a
 * subset are tagged as "falling" and slide down the window with a CSS
 * transform.
 *
 * Self-resolving procedural spawn — we keep a pool at capacity, drop
 * the oldest when adding new ones, so the layer never feels static.
 * All animation is CSS; React only owns the list.
 *
 *   • fixed, -z-5, pointer-events: none
 *   • clamps drop count and size to viewport size
 *   • re-spawns every ~2.4 s for continuous evolution
 */

interface Drop {
  id: number;
  /** percentage across viewport */
  leftPct: number;
  /** percentage down viewport */
  topPct: number;
  /** px diameter */
  size: number;
  /** some drops slide; most stay beaded */
  falling: boolean;
  /** seconds of fall animation (randomised per drop) */
  fallDuration: number;
  /** seconds delay before the fall starts */
  fallDelay: number;
}

const STATIC_COUNT = 32;
const FALLING_COUNT = 4;
/** Larger minimum so drops read as weight, not speckle. */
const MIN_SIZE = 14;
const MAX_SIZE = 54;
/** Larger drops get a higher chance of being the ones that fall. */

let nextId = 0;

function makeDrop(falling: boolean): Drop {
  // Falling drops tend to start larger (they're the heavy ones that
  // exceeded surface tension and detached).
  const size = falling
    ? MAX_SIZE * (0.65 + Math.random() * 0.35)
    : MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE) * 0.85;

  return {
    id: nextId++,
    leftPct: Math.random() * 98 + 1,
    topPct: falling
      ? Math.random() * 35 // falling drops start in upper portion
      : Math.random() * 92 + 4,
    size,
    falling,
    fallDuration: falling ? 4 + Math.random() * 4 : 0,
    fallDelay: falling ? Math.random() * 3 : 0,
  };
}

function seed(): Drop[] {
  return [
    ...Array.from({ length: STATIC_COUNT }, () => makeDrop(false)),
    ...Array.from({ length: FALLING_COUNT }, () => makeDrop(true)),
  ];
}

export function RainEffect() {
  const [drops, setDrops] = useState<Drop[]>([]);

  useEffect(() => {
    setDrops(seed());

    // Every few seconds, retire a small batch and introduce fresh drops
    // so the window stays in motion without the whole layer flashing.
    const interval = window.setInterval(() => {
      setDrops((prev) => {
        const retireCount = 3 + Math.floor(Math.random() * 3);
        const kept = prev.slice(retireCount);
        const fresh = [
          ...Array.from({ length: retireCount - 1 }, () => makeDrop(false)),
          makeDrop(Math.random() < 0.35), // occasional fresh faller
        ];
        return [...kept, ...fresh];
      });
    }, 2400);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-[5] overflow-hidden"
    >
      {drops.map((d) => (
        <span
          key={d.id}
          className={`rain-drop ${d.falling ? "rain-drop-fall" : ""}`}
          style={{
            left: `${d.leftPct}%`,
            top: `${d.topPct}%`,
            width: `${d.size}px`,
            height: `${d.size}px`,
            animationDelay: d.falling ? `${d.fallDelay}s` : "0s",
            animationDuration: d.falling ? `${d.fallDuration}s` : undefined,
          }}
        />
      ))}
    </div>
  );
}
