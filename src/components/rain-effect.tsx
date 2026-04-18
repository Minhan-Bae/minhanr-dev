"use client";

import { useEffect, useRef } from "react";

/**
 * RainEffect — Canvas-2D droplets-on-glass overlay, inspired by
 * codrops/RainEffect. A full WebGL shader port would be heavier
 * than this site needs; instead we paint translucent droplets with
 * a radial gradient and a highlight spec, add a simple forming-in
 * phase so they "bead up" rather than pop in, then occasionally let
 * a large drop detach and slide down leaving a trail of smaller
 * ones — the visual shorthand for rain-on-glass without loading a
 * 10 000-line shader library.
 *
 * Runs behind all content (fixed, negative z-index, pointer-events:
 * none) so it layers over the site-wide `bg.jpg` but under every
 * slide and article. Self-clamps drop count and DPR-aware resizes
 * on window resize. No React state involved in the loop — all drop
 * bookkeeping happens in the rAF closure so the component
 * re-renders at most once on mount.
 */

interface Drop {
  x: number;
  y: number;
  /** Target radius after forming completes. */
  rTarget: number;
  /** Current rendered radius — tweens toward rTarget during forming. */
  r: number;
  vy: number;
  sticky: boolean;
  /** ms since spawned. */
  age: number;
  /** ms of forming-in phase. */
  formingMs: number;
  /** ms total lifespan before fade-out. */
  maxAgeMs: number;
}

const MAX_DROPS = 220;
/** Seed density: one drop per N pixels² of viewport. Lower = denser. */
const SEED_DENSITY = 9500;
/** Per-frame probability a large sticky drop detaches. */
const DETACH_P = 0.00018;
/** Min radius for a drop to be eligible to detach and slide. */
const DETACH_R_MIN = 3.6;

export function RainEffect() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;
    let W = window.innerWidth;
    let H = window.innerHeight;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const drops: Drop[] = [];
    const seedCount = Math.min(
      MAX_DROPS / 2,
      Math.floor((W * H) / SEED_DENSITY)
    );
    for (let i = 0; i < seedCount; i++) {
      const r = 1.2 + Math.random() * 4.2;
      drops.push({
        x: Math.random() * W,
        y: Math.random() * H,
        rTarget: r,
        r: r * (0.3 + Math.random() * 0.7),
        vy: 0,
        sticky: true,
        age: Math.random() * 8000,
        formingMs: 500 + Math.random() * 900,
        maxAgeMs: 14000 + Math.random() * 12000,
      });
    }

    const spawn = () => {
      if (drops.length >= MAX_DROPS) return;
      const r = 1.4 + Math.random() * 5;
      drops.push({
        x: Math.random() * W,
        y: Math.random() * H * 0.92,
        rTarget: r,
        r: 0,
        vy: 0,
        sticky: true,
        age: 0,
        formingMs: 420 + Math.random() * 900,
        maxAgeMs: 10000 + Math.random() * 12000,
      });
    };

    let last = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const dt = Math.min(50, now - last);
      last = now;

      ctx.clearRect(0, 0, W, H);

      // Spawn rate — roughly one drop per frame on average at 60fps.
      if (Math.random() < 0.06 * (dt / 16)) spawn();

      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.age += dt;

        // Forming — tween current radius toward target.
        if (d.age < d.formingMs) {
          const t = d.age / d.formingMs;
          const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic
          d.r = d.rTarget * ease;
        } else {
          d.r = d.rTarget;
        }

        // Large sticky drops occasionally detach.
        if (d.sticky && d.r >= DETACH_R_MIN) {
          if (Math.random() < DETACH_P * dt) {
            d.sticky = false;
          }
        }

        // Falling drops accelerate, shrink, and drip a trail.
        if (!d.sticky) {
          d.vy += 0.09 * (dt / 16);
          d.y += d.vy;
          d.r = Math.max(0.6, d.r - 0.004 * dt);

          // Leave a trail of tiny sticky drops at random intervals.
          if (Math.random() < 0.45 && drops.length < MAX_DROPS) {
            drops.push({
              x: d.x + (Math.random() - 0.5) * 1.6,
              y: d.y - d.rTarget * 0.9,
              rTarget: Math.max(0.8, d.rTarget * 0.3),
              r: 0,
              vy: 0,
              sticky: true,
              age: 0,
              formingMs: 200 + Math.random() * 400,
              maxAgeMs: 2400 + Math.random() * 3600,
            });
          }
        }

        // Fade-out toward end of life.
        const lifeT = d.age / d.maxAgeMs;
        const alpha = lifeT < 0.8 ? 1 : Math.max(0, 1 - (lifeT - 0.8) / 0.2);

        // Cull.
        if (d.age > d.maxAgeMs || d.y - d.r > H + 10 || d.r < 0.5) {
          drops.splice(i, 1);
          continue;
        }

        // Body — radial gradient, cool-blue tinted.
        const g = ctx.createRadialGradient(
          d.x - d.r * 0.35,
          d.y - d.r * 0.35,
          0,
          d.x,
          d.y,
          d.r
        );
        g.addColorStop(0, `rgba(225, 238, 255, ${0.28 * alpha})`);
        g.addColorStop(0.55, `rgba(160, 195, 235, ${0.1 * alpha})`);
        g.addColorStop(1, `rgba(90, 130, 180, 0)`);
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        // Specular highlight — the bright pinprick that sells the
        // "dimensional droplet" read over a flat circle.
        if (d.r > 1) {
          ctx.beginPath();
          ctx.arc(
            d.x - d.r * 0.34,
            d.y - d.r * 0.34,
            Math.max(0.4, d.r * 0.22),
            0,
            Math.PI * 2
          );
          ctx.fillStyle = `rgba(255, 255, 255, ${0.36 * alpha})`;
          ctx.fill();
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-[5] opacity-90"
    />
  );
}
