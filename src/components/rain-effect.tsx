"use client";

import { useEffect, useRef, useState } from "react";
import { Raindrops } from "@/lib/rain/raindrops";
import { RainRenderer } from "@/lib/rain/rain-renderer";
import {
  getActiveTheme,
  getCurrentScene,
  observeTheme,
  RAIN_PRESETS,
  type SceneTheme,
} from "@/lib/scenes";

/**
 * RainEffect — WebGL rain-on-glass, ported from codrops/RainEffect.
 *
 * Dark-theme only. The light theme uses the clean sunny-beach scene
 * straight from SiteBackground, with no rain canvas overlaying it —
 * the blurred-BG texture that the shader composites was still dulling
 * the scene even with `raining: false`, which defeated the "clear
 * weather" read. Simpler: when the active theme is light, the
 * component renders nothing at all. On switch to dark it re-mounts
 * and re-initialises the engine.
 */

const TEXTURE_BG_W = 512;
const TEXTURE_BG_H = 288; // 16:9
const TEXTURE_FG_W = 96;
const TEXTURE_FG_H = 54;

export function RainEffect() {
  const [theme, setTheme] = useState<SceneTheme>("dark");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Track the active theme so we can mount/unmount the canvas + engine
  // on theme change. Initial value is set in a mount effect to avoid
  // the SSR/hydration mismatch from reading `<html>` at render time —
  // the post-mount setState is intentional (subscribe + initial sync
  // pattern from an external system, the DOM `<html>` class).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(getActiveTheme());
    return observeTheme((next) => setTheme(next));
  }, []);

  useEffect(() => {
    if (theme !== "dark") return; // light theme skips the rain engine entirely
    const canvas = canvasRef.current;
    if (!canvas) return;

    let raindrops: Raindrops | null = null;
    let renderer: RainRenderer | null = null;
    let cancelled = false;
    const currentTheme: SceneTheme = theme;

    const resize = () => {
      if (!canvas) return;
      const dpi = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpi;
      canvas.height = window.innerHeight * dpi;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    };
    resize();

    const loadImage = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    const build = async (theme: SceneTheme) => {
      const preset = RAIN_PRESETS[theme];
      const scene = getCurrentScene(theme);

      const [dropAlpha, dropColor, bgImage] = await Promise.all([
        loadImage("/rain/drop-alpha.png"),
        loadImage("/rain/drop-color.png"),
        loadImage(scene.file),
      ]);
      if (cancelled) return;

      const dpi = Math.min(window.devicePixelRatio || 1, 2);
      raindrops?.destroy();
      renderer?.destroy();

      raindrops = new Raindrops(
        canvas.width,
        canvas.height,
        dpi,
        dropAlpha,
        dropColor,
        {
          trailRate: preset.trailRate,
          trailScaleRange: [0.2, 0.45],
          collisionRadius: 0.45,
          dropletsCleaningRadiusMultiplier: 0.28,
          raining: preset.raining,
          rainChance: preset.rainChance,
          rainLimit: preset.rainLimit,
          dropletsRate: preset.dropletsRate,
          dropletsSize: [2, 4],
          minR: preset.minR,
          maxR: preset.maxR,
        }
      );

      // Foreground (sharp) and background (blurred) textures.
      const textureFg = document.createElement("canvas");
      textureFg.width = TEXTURE_FG_W;
      textureFg.height = TEXTURE_FG_H;
      const fgCtx = textureFg.getContext("2d")!;
      // Sunny scenes want the drops to read as clear glass, not tinted.
      // Stormy scenes want drops acting as lens+tint for codrops feel.
      fgCtx.filter =
        theme === "light"
          ? "brightness(1.0) saturate(1.05)"
          : "brightness(0.6) saturate(1.1)";
      fgCtx.drawImage(bgImage, 0, 0, TEXTURE_FG_W, TEXTURE_FG_H);
      fgCtx.filter = "none";

      const textureBg = document.createElement("canvas");
      textureBg.width = TEXTURE_BG_W;
      textureBg.height = TEXTURE_BG_H;
      const bgCtx = textureBg.getContext("2d")!;
      bgCtx.filter = `blur(${preset.bgBlurPx}px) brightness(${preset.bgBrightness}) saturate(0.95)`;
      bgCtx.drawImage(bgImage, 0, 0, TEXTURE_BG_W, TEXTURE_BG_H);
      bgCtx.filter = "none";
      if (preset.bgWashRgba && preset.bgWashRgba !== "rgba(255, 255, 255, 0)") {
        bgCtx.fillStyle = preset.bgWashRgba;
        bgCtx.fillRect(0, 0, TEXTURE_BG_W, TEXTURE_BG_H);
      }

      renderer = new RainRenderer(
        canvas,
        raindrops.canvas,
        textureFg,
        textureBg,
        null,
        {
          brightness: theme === "light" ? 1.1 : 1.04,
          alphaMultiply: 6,
          alphaSubtract: 3,
        }
      );
    };

    build(currentTheme).catch((err) => {
      console.warn("Rain effect failed to load textures:", err);
    });

    const onResize = () => {
      raindrops?.destroy();
      renderer?.destroy();
      raindrops = null;
      renderer = null;
      resize();
      build(currentTheme).catch(() => {});
    };

    let resizeTimer: number | null = null;
    const debouncedResize = () => {
      if (resizeTimer != null) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(onResize, 200);
    };
    window.addEventListener("resize", debouncedResize);

    // When the theme flips away from dark, this whole effect returns
    // early on the next run, and the cleanup below tears the engine
    // down. No in-effect theme observer needed here anymore — the
    // outer state+useEffect above owns that responsibility.

    return () => {
      cancelled = true;
      window.removeEventListener("resize", debouncedResize);
      if (resizeTimer != null) window.clearTimeout(resizeTimer);
      raindrops?.destroy();
      renderer?.destroy();
    };
  }, [theme]);

  if (theme !== "dark") return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-[5]"
    />
  );
}
