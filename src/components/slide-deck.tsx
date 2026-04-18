"use client";

import { useEffect } from "react";

/**
 * SlideDeck — PowerPoint-style navigation for any page whose top-level
 * sections are marked with `data-slide`.
 *
 * Input:
 *   • Wheel        — one tick = one slide (cooldown prevents multi-advance
 *                    from a single trackpad flick firing 30+ wheel events)
 *   • Keyboard     — ↑↓, PgUp/PgDn, Space / Shift+Space, Home, End
 *   • Touch        — swipe ±10% of viewport height advances ±1 slide;
 *                    anything smaller snaps back to the current slide
 *   • Nested scroll — any child with its own overflow auto/scroll
 *                    passes through untouched (modals, code blocks)
 *
 * Transitions run on an own rAF loop with `easeOutExpo` (fast start,
 * long graceful deceleration — reads as physical momentum). We drive
 * the scroll position ourselves via `scrollTo({ behavior: "instant" })`
 * each frame, bypassing the browser's CSS scroll-behavior cascade
 * entirely. That matters because Chrome degrades the CSS smooth
 * curve to `auto` (instant) when the OS reports reduce-motion —
 * Windows 11's default — which would make our slides pop instead of
 * slide. Our rAF loop is unaffected.
 *
 * No CSS `scroll-snap-type` is set on html. We tried `y mandatory`
 * but it fought the rAF by snapping every intermediate frame to the
 * nearest snap point, which read as "딱딱" stuttering.
 */

const TRANSITION_MS = 950;
/** Cooldown > transition duration so a new gesture can't start mid-glide. */
const COOLDOWN_MS = TRANSITION_MS + 120;
/** Wheel deltas below this are treated as trackpad noise and ignored. */
const WHEEL_DEADBAND = 8;

/** Ease-out expo — fast start, long graceful deceleration. Reads as
 *  physical momentum rather than the symmetric "hesitate-rush-hesitate"
 *  of a cubic in-out curve. */
function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function SlideDeck() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const slidesOf = () =>
      Array.from(document.querySelectorAll<HTMLElement>("[data-slide]"));

    let transitioning = false;
    let lastFire = 0;
    let animRaf: number | null = null;
    let touchStartY: number | null = null;
    let touchStartIdx = 0;

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
        const y = startY + diff * easeOutExpo(t);
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

    // ── Touch (mobile swipe) ──────────────────────────────────────
    // We don't preventDefault during touchmove — natural scroll
    // provides tactile feedback as the finger drags. On touchend we
    // read the total gesture delta and navigate ±1 slide if it crossed
    // the threshold; otherwise we snap back to the starting slide.
    const SWIPE_THRESHOLD_RATIO = 0.1;

    const onTouchStart = (e: TouchEvent) => {
      if (transitioning) return;
      if (e.touches.length !== 1) return;
      touchStartY = e.touches[0].clientY;
      touchStartIdx = currentIdx();
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartY === null || transitioning) return;
      const endY = e.changedTouches[0].clientY;
      const delta = touchStartY - endY;
      const threshold = window.innerHeight * SWIPE_THRESHOLD_RATIO;

      let next = touchStartIdx;
      if (delta > threshold) next = touchStartIdx + 1;
      else if (delta < -threshold) next = touchStartIdx - 1;

      goto(Math.max(0, Math.min(slidesOf().length - 1, next)));
      touchStartY = null;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      if (animRaf !== null) cancelAnimationFrame(animRaf);
    };
  }, []);

  return null;
}
