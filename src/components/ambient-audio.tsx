"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getActiveTheme,
  observeTheme,
  type SceneTheme,
} from "@/lib/scenes";

/**
 * Ambient audio by theme, with a single user-facing toggle.
 *
 *   • dark  → steady rain on glass (CC0 / Internet Archive)
 *   • light → blustery wind loop (CC0 / Internet Archive)
 *
 * Browser autoplay policies require a user gesture before any audio
 * plays, so the toggle is OFF by default. Once the visitor enables it,
 * we persist the preference under `minhanr-ambient` and restart the
 * right loop whenever the theme changes.
 *
 * Audio files live under `/public/ambient/` and are sourced from
 * Internet Archive CC0 collections (see public/ambient/README.md). A
 * missing file fails gracefully — the `<audio>` tag silently skips to
 * nothing and the toggle disables itself.
 */

const AMBIENT_KEY = "minhanr-ambient";

const TRACKS: Record<SceneTheme, string> = {
  dark: "/ambient/rain.mp3",
  light: "/ambient/wind.mp3",
};

const FADE_MS = 1200;
const TARGET_VOLUME = 0.32;

export function AmbientToggle() {
  const [enabled, setEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number | null>(null);
  const themeRef = useRef<SceneTheme>("dark");

  const fadeTo = useCallback((target: number, onEnd?: () => void) => {
    const a = audioRef.current;
    if (!a) return;
    if (fadeRef.current != null) window.clearInterval(fadeRef.current);
    const start = a.volume;
    const t0 = performance.now();
    fadeRef.current = window.setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / FADE_MS);
      a.volume = start + (target - start) * k;
      if (k >= 1) {
        if (fadeRef.current != null) {
          window.clearInterval(fadeRef.current);
          fadeRef.current = null;
        }
        onEnd?.();
      }
    }, 40);
  }, []);

  const switchTrack = useCallback(
    (theme: SceneTheme) => {
      const a = audioRef.current;
      if (!a) return;
      themeRef.current = theme;
      if (!enabled) {
        a.src = TRACKS[theme];
        return;
      }
      fadeTo(0, () => {
        a.src = TRACKS[theme];
        a.load();
        a.play()
          .then(() => fadeTo(TARGET_VOLUME))
          .catch(() => {
            // Autoplay was revoked — drop back to disabled so the UI reflects reality.
            setEnabled(false);
          });
      });
    },
    [enabled, fadeTo]
  );

  // Mount: restore persisted preference, but never auto-play without gesture.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AMBIENT_KEY);
      if (saved === "1") setEnabled(true);
    } catch {}
    const t = getActiveTheme();
    themeRef.current = t;
    if (audioRef.current) {
      audioRef.current.src = TRACKS[t];
      audioRef.current.volume = 0;
    }
    setMounted(true);
  }, []);

  // Follow theme changes.
  useEffect(() => {
    return observeTheme((next) => {
      if (next === themeRef.current) return;
      switchTrack(next);
    });
  }, [switchTrack]);

  // React to toggle state.
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (enabled) {
      try {
        localStorage.setItem(AMBIENT_KEY, "1");
      } catch {}
      if (!a.src || a.src.endsWith("/")) a.src = TRACKS[themeRef.current];
      a.volume = 0;
      a.play()
        .then(() => fadeTo(TARGET_VOLUME))
        .catch(() => setEnabled(false));
    } else {
      try {
        localStorage.setItem(AMBIENT_KEY, "0");
      } catch {}
      fadeTo(0, () => {
        a.pause();
      });
    }
  }, [enabled, fadeTo]);

  if (!mounted) {
    return <span aria-hidden className="w-8 h-6" />;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setEnabled((v) => !v)}
        aria-label={enabled ? "Mute ambient sound" : "Play ambient sound"}
        aria-pressed={enabled}
        title={enabled ? "Ambient: on" : "Ambient: off"}
        className="flex h-7 items-center gap-1.5 rounded-full px-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <SpeakerIcon on={enabled} />
      </button>
      <audio
        ref={audioRef}
        preload="none"
        loop
        playsInline
        crossOrigin="anonymous"
      />
    </>
  );
}

function SpeakerIcon({ on }: { on: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 10v4a1 1 0 0 0 1 1h3l4 4V5L8 9H5a1 1 0 0 0-1 1Z" />
      {on ? (
        <>
          <path d="M16 9c.8 1 1.2 2 1.2 3s-.4 2-1.2 3" />
          <path d="M19 6.5c1.5 1.6 2.3 3.5 2.3 5.5s-.8 3.9-2.3 5.5" />
        </>
      ) : (
        <path d="M16 9l6 6M22 9l-6 6" />
      )}
    </svg>
  );
}
