"use client";

import { useEffect, useRef } from "react";
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
 * Theme-aware: dark → heavy rain; gray → drizzle; light → clear (no
 * rain, just refraction of the sunny scene). Rebuilds the engine when
 * the `<html>` class changes so the theme switcher swaps weather in
 * real time.
 */

const TEXTURE_BG_W = 512;
const TEXTURE_BG_H = 288; // 16:9
const TEXTURE_FG_W = 96;
const TEXTURE_FG_H = 54;

export function RainEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let raindrops: Raindrops | null = null;
    let renderer: RainRenderer | null = null;
    let cancelled = false;
    let currentTheme: SceneTheme = getActiveTheme();

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

    const unsubscribeTheme = observeTheme((next) => {
      if (next === currentTheme) return;
      currentTheme = next;
      build(next).catch(() => {});
    });

    return () => {
      cancelled = true;
      unsubscribeTheme();
      window.removeEventListener("resize", debouncedResize);
      if (resizeTimer != null) window.clearTimeout(resizeTimer);
      raindrops?.destroy();
      renderer?.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-[5]"
    />
  );
}
