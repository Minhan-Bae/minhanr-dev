"use client";

import { useEffect } from "react";

/**
 * SlideDeck — PowerPoint-style navigation for any page whose top-level
 * sections are marked with `data-slide`.
 *
 * One wheel tick = one slide. One arrow press = one slide. Space / PgDn
 * forward, Shift+Space / PgUp backward. Home / End jump to the ends.
 * Trackpad: small-delta wheel events are ignored so two-finger scroll
 * still works for nested scrollers, and we defer to CSS scroll-snap
 * for touch devices (browsers handle swipe snap natively).
 *
 * Transitions are driven by a rAF loop with an ease-in-out cubic
 * curve (`animateTo`). We deliberately do NOT rely on
 * `scrollIntoView({ behavior: "smooth" })` here: Chrome degrades that
 * smooth curve to `auto` (instant) when Windows has "Animation
 * effects" off (prefers-reduced-motion: reduce), so the transition
 * would pop instead of slide. Driving the scroll position ourselves
 * via `scrollTo({ behavior: "instant" })` each frame bypasses the
 * CSS scroll-behavior cascade entirely.
 *
 * This site is a portfolio; the animations ARE the design, so we
 * render them unconditionally. If a visitor's OS-level preference
 * conflicts, the one-slide-per-gesture pacing is already a strong
 * mitigation on its own.
 */

const COOLDOWN_MS = 820;
const TRANSITION_MS = 700;
/** Wheel deltas below this are treated as trackpad noise and ignored. */
const WHEEL_DEADBAND = 8;

/** Ease-in-out cubic — matches `cubic-bezier(0.65, 0, 0.35, 1)` */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function SlideDeck() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const slidesOf = () =>
      Array.from(document.querySelectorAll<HTMLElement>("[data-slide]"));

    let transitioning = false;
    let lastFire = 0;
    let animRaf: number | null = null;

    const currentIdx = () => {
      const ss = slidesOf();
      if (ss.length === 0) return 0;
      const centre = window.scrollY + window.innerHeight / 2;
      for (let i = 0; i < ss.length; i++) {
        const top = ss[i].offsetTop;
        const bot = top + ss[i].offsetHeight;
        if (centre >= top && centre < bot) return i;
      }
      // Past the last slide → treat as last.
      return ss.length - 1;
    };

    /** Own-rAF smooth scroll — does not depend on CSS scroll-behavior. */
    const animateTo = (targetY: number, duration = TRANSITION_MS) => {
      if (animRaf !== null) cancelAnimationFrame(animRaf);
      const startY = window.scrollY;
      const diff = targetY - startY;
      if (Math.abs(diff) < 1) return;
      const startT = performance.now();

      const step = (now: number) => {
        const t = Math.min((now - startT) / duration, 1);
        const y = startY + diff * easeInOutCubic(t);
        window.scrollTo({ top: y, behavior: "instant" });
        if (t < 1) {
          animRaf = requestAnimationFrame(step);
        } else {
          animRaf = null;
        }
      };
      animRaf = requestAnimationFrame(step);
    };

    const goto = (idx: number) => {
      const ss = slidesOf();
      if (idx < 0 || idx >= ss.length) return;
      transitioning = true;
      lastFire = performance.now();
      animateTo(ss[idx].offsetTop);
      window.setTimeout(() => {
        transitioning = false;
      }, COOLDOWN_MS);
    };

    const isInsideNestedScroller = (e: Event): boolean => {
      const path = e.composedPath();
      for (const node of path) {
        if (!(node instanceof HTMLElement)) continue;
        if (node === document.body || node === document.documentElement) break;
        const s = getComputedStyle(node);
        const scrollsY =
          (s.overflowY === "auto" || s.overflowY === "scroll") &&
          node.scrollHeight > node.clientHeight;
        if (scrollsY) return true;
      }
      return false;
    };

    const onWheel = (e: WheelEvent) => {
      if (slidesOf().length === 0) return;
      if (isInsideNestedScroller(e)) return;

      // A single two-finger "flick" on a trackpad can fire 30+ wheel
      // events rapidly — we only react to the first one per cooldown.
      e.preventDefault();
      if (transitioning) return;
      if (performance.now() - lastFire < COOLDOWN_MS) return;
      if (Math.abs(e.deltaY) < WHEEL_DEADBAND) return;

      const idx = currentIdx();
      if (e.deltaY > 0) goto(idx + 1);
      else goto(idx - 1);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (slidesOf().length === 0) return;
      // Ignore keypresses inside form fields so ⌘+arrow etc. still work.
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      ) {
        return;
      }

      const idx = currentIdx();
      const ss = slidesOf();
      let next = idx;
      switch (e.key) {
        case "ArrowDown":
        case "PageDown":
          next = idx + 1;
          break;
        case " ":
          next = e.shiftKey ? idx - 1 : idx + 1;
          break;
        case "ArrowUp":
        case "PageUp":
          next = idx - 1;
          break;
        case "Home":
          next = 0;
          break;
        case "End":
          next = ss.length - 1;
          break;
        default:
          return;
      }
      e.preventDefault();
      goto(Math.max(0, Math.min(ss.length - 1, next)));
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      if (animRaf !== null) cancelAnimationFrame(animRaf);
    };
  }, []);

  return null;
}
