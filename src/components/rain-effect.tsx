"use client";

import { useEffect, useRef } from "react";
import { Raindrops } from "@/lib/rain/raindrops";
import { RainRenderer } from "@/lib/rain/rain-renderer";

/**
 * RainEffect — WebGL rain-on-glass, ported from codrops/RainEffect.
 *
 * A 2D canvas (Raindrops) simulates water beading, collision/merging,
 * and drips. That canvas is then handed to a WebGL fragment shader
 * (RainRenderer / water.frag) that refracts a sharp "foreground"
 * texture through the drops while a blurred "background" texture
 * fills everywhere else — the hallmark codrops lens-through-fog look.
 *
 * Our foreground and background are both the same site bg.jpg:
 *   • textureFg — drawn into a small canvas at full sharpness
 *   • textureBg — drawn into a small canvas pre-blurred
 *
 * Both are rendered into their own small HTMLCanvasElement at startup
 * so we don't need any additional weather texture files from the
 * upstream demo. The drop-alpha / drop-color PNGs ship in public/rain/
 * — those are genuinely hand-designed textures that can't be
 * reproduced procedurally without quality loss.
 *
 * Sits behind all content (fixed, -z-5, pointer-events: none).
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

    Promise.all([
      loadImage("/rain/drop-alpha.png"),
      loadImage("/rain/drop-color.png"),
      loadImage("/bg.jpg"),
    ])
      .then(([dropAlpha, dropColor, bgImage]) => {
        if (cancelled) return;

        const dpi = Math.min(window.devicePixelRatio || 1, 2);
        raindrops = new Raindrops(
          canvas.width,
          canvas.height,
          dpi,
          dropAlpha,
          dropColor,
          {
            trailRate: 1,
            trailScaleRange: [0.2, 0.45],
            collisionRadius: 0.45,
            dropletsCleaningRadiusMultiplier: 0.28,
            raining: true,
            rainChance: 0.3,
            rainLimit: 3,
            dropletsRate: 50,
            dropletsSize: [2, 4],
            minR: 10,
            maxR: 40,
          }
        );

        // Foreground (sharp) and background (blurred) textures — both
        // are painted from bg.jpg into small offscreen canvases so we
        // don't need a CDN trip for anything else.
        const textureFg = document.createElement("canvas");
        textureFg.width = TEXTURE_FG_W;
        textureFg.height = TEXTURE_FG_H;
        const fgCtx = textureFg.getContext("2d")!;
        fgCtx.drawImage(bgImage, 0, 0, TEXTURE_FG_W, TEXTURE_FG_H);

        const textureBg = document.createElement("canvas");
        textureBg.width = TEXTURE_BG_W;
        textureBg.height = TEXTURE_BG_H;
        const bgCtx = textureBg.getContext("2d")!;
        bgCtx.filter = "blur(3px)";
        bgCtx.drawImage(bgImage, 0, 0, TEXTURE_BG_W, TEXTURE_BG_H);
        bgCtx.filter = "none";

        renderer = new RainRenderer(
          canvas,
          raindrops.canvas,
          textureFg,
          textureBg,
          null,
          {
            brightness: 1.04,
            alphaMultiply: 6,
            alphaSubtract: 3,
          }
        );
      })
      .catch((err) => {
        console.warn("Rain effect failed to load textures:", err);
      });

    const onResize = () => {
      // A full resize tears and rebuilds both engines — the underlying
      // Raindrops owns its canvas internally, so rather than trying to
      // re-wire textures we just rebuild when the viewport changes.
      raindrops?.destroy();
      renderer?.destroy();
      raindrops = null;
      renderer = null;
      resize();
      // Re-run the setup (same code path).
      Promise.all([
        loadImage("/rain/drop-alpha.png"),
        loadImage("/rain/drop-color.png"),
        loadImage("/bg.jpg"),
      ])
        .then(([dropAlpha, dropColor, bgImage]) => {
          if (cancelled || !canvas) return;
          const dpi = Math.min(window.devicePixelRatio || 1, 2);
          raindrops = new Raindrops(
            canvas.width,
            canvas.height,
            dpi,
            dropAlpha,
            dropColor,
            {
              trailRate: 1,
              trailScaleRange: [0.2, 0.45],
              collisionRadius: 0.45,
              dropletsCleaningRadiusMultiplier: 0.28,
              raining: true,
            }
          );
          const textureFg = document.createElement("canvas");
          textureFg.width = TEXTURE_FG_W;
          textureFg.height = TEXTURE_FG_H;
          textureFg.getContext("2d")!.drawImage(bgImage, 0, 0, TEXTURE_FG_W, TEXTURE_FG_H);

          const textureBg = document.createElement("canvas");
          textureBg.width = TEXTURE_BG_W;
          textureBg.height = TEXTURE_BG_H;
          const bgCtx = textureBg.getContext("2d")!;
          bgCtx.filter = "blur(3px)";
          bgCtx.drawImage(bgImage, 0, 0, TEXTURE_BG_W, TEXTURE_BG_H);
          bgCtx.filter = "none";

          renderer = new RainRenderer(
            canvas,
            raindrops.canvas,
            textureFg,
            textureBg,
            null,
            { brightness: 1.04, alphaMultiply: 6, alphaSubtract: 3 }
          );
        })
        .catch(() => {});
    };

    // Debounce the resize handler — plenty of environments fire many
    // events per gesture (address-bar show/hide, devtools toggle).
    let resizeTimer: number | null = null;
    const debouncedResize = () => {
      if (resizeTimer != null) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(onResize, 200);
    };
    window.addEventListener("resize", debouncedResize);

    return () => {
      cancelled = true;
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
