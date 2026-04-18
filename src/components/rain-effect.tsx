"use client";

import { useEffect, useState } from "react";

/**
 * RainEffect — codrops/RainEffect style, in pure CSS.
 *
 * The trick: we don't try to blur the background through the drops.
 * Instead the whole site background is pre-blurred (see
 * SiteBackground), and each drop paints a fragment of the *un-blurred*
 * `bg.jpg` via `background-attachment: fixed`. Because the fixed
 * attachment anchors the image to the viewport, the pixels visible
 * inside a drop are exactly the pixels at that viewport position —
 * so each drop reads as a clear lens over the foggy window behind.
 *
 *   viewport → blurred bg.jpg (SiteBackground)
 *              ↑  the window is foggy
 *   drops   → sharp   bg.jpg via attachment: fixed
 *              ↑  lens view, aligned by position
 *
 * Rim shadows + a top-left specular highlight sell the glass bead
 * depth. A subset of drops is tagged as "falling" and slides down the
 * viewport with a vertical squash. All motion is CSS; React owns the
 * list and re-spawns on a 2.4s interval so the window keeps evolving.
 *
 *   • fixed, -z-[5], pointer-events: none
 *   • 34 static beads + 5 falling drops
 *   • GPU-composited — 40 drops is cheap
 */

interface Drop {
  id: number;
  /** percentage across viewport */
  leftPct: number;
  /** percentage down viewport */
  topPct: number;
  /** px diameter */
  size: number;
  /** true = animates falling down */
  falling: boolean;
  /** seconds of fall animation */
  fallDuration: number;
  /** seconds delay before the fall starts */
  fallDelay: number;
}

const STATIC_COUNT = 34;
const FALLING_COUNT = 5;
const MIN_SIZE = 18;
const MAX_SIZE = 74;

let nextId = 0;

function makeDrop(falling: boolean): Drop {
  const size = falling
    ? MAX_SIZE * (0.7 + Math.random() * 0.3)
    : MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE) * 0.85;

  return {
    id: nextId++,
    leftPct: Math.random() * 98 + 1,
    topPct: falling ? Math.random() * 30 : Math.random() * 90 + 5,
    size,
    falling,
    fallDuration: falling ? 5 + Math.random() * 5 : 0,
    fallDelay: falling ? Math.random() * 4 : 0,
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

    const interval = window.setInterval(() => {
      setDrops((prev) => {
        const retireCount = 3 + Math.floor(Math.random() * 3);
        const kept = prev.slice(retireCount);
        const fresh = [
          ...Array.from({ length: retireCount - 1 }, () => makeDrop(false)),
          makeDrop(Math.random() < 0.4),
        ];
        return [...kept, ...fresh];
      });
    }, 2600);

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
            animationDuration: d.falling
              ? `${d.fallDuration}s`
              : undefined,
          }}
        />
      ))}
    </div>
  );
}
