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
 * Transitions use `scrollIntoView({ behavior: "smooth" })` so the
 * actual slide movement is the browser's smooth scroll engine — same
 * curve as an anchor-link jump, but fired in response to the wheel.
 * A brief cooldown (`COOLDOWN_MS`) prevents a single wheel gesture
 * from eating multiple slides.
 *
 * We don't bail under `prefers-reduced-motion` — navigating one slide
 * per gesture IS a mitigation, not an aggravation, and the Ken-Burns
 * background (the only genuinely large motion) is already opted out.
 */

const COOLDOWN_MS = 820;
/** Wheel deltas below this are treated as trackpad noise and ignored. */
const WHEEL_DEADBAND = 8;

export function SlideDeck() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const slidesOf = () =>
      Array.from(document.querySelectorAll<HTMLElement>("[data-slide]"));

    let transitioning = false;
    let lastFire = 0;

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

    const goto = (idx: number) => {
      const ss = slidesOf();
      if (idx < 0 || idx >= ss.length) return;
      transitioning = true;
      lastFire = performance.now();
      ss[idx].scrollIntoView({ behavior: "smooth", block: "start" });
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
    };
  }, []);

  return null;
}
