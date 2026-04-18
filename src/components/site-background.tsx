"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  FALLBACK_SCENE,
  getActiveTheme,
  getCurrentScene,
  observeTheme,
  RAIN_PRESETS,
  type Scene,
  type SceneTheme,
} from "@/lib/scenes";

/**
 * SiteBackground — theme × time-of-day backdrop sitting behind every
 * public page.
 *
 * Resolves the scene set from the active theme (dark → storm-blue,
 * gray → overcast, light → sunny beach) and the hour. Acts as the
 * WebGL fallback for RainEffect.
 *
 * SSR renders the fallback (dark / harbour); the client useEffect
 * upgrades to the theme + hour-correct scene once mounted and
 * listens for class mutations on `<html>` to follow the theme
 * switcher live.
 */
export function SiteBackground() {
  const [scene, setScene] = useState<Scene>(FALLBACK_SCENE);
  const [theme, setTheme] = useState<SceneTheme>("dark");

  useEffect(() => {
    const t = getActiveTheme();
    setTheme(t);
    setScene(getCurrentScene(t));

    const unsub = observeTheme((next) => {
      setTheme(next);
      setScene(getCurrentScene(next));
    });

    // Re-evaluate every minute so a scene change at the hour boundary
    // doesn't require a full page reload. Cheap — one state set.
    const iv = window.setInterval(() => {
      setScene(getCurrentScene(getActiveTheme()));
    }, 60_000);

    return () => {
      unsub();
      window.clearInterval(iv);
    };
  }, []);

  const preset = RAIN_PRESETS[theme];

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="ken-burns-drift absolute inset-[-4%]">
        <Image
          key={scene.file}
          src={scene.file}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ opacity: preset.backdropOpacity }}
        />
      </div>
      {/* Legibility gradient — stronger on dark so the fallback still
          reads AAA, softer on light so the sunny scene can breathe. */}
      <div
        className="absolute inset-0"
        style={{ background: preset.overlayGradient }}
      />
    </div>
  );
}
