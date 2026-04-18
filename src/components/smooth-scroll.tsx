"use client";

import { useEffect } from "react";

/**
 * SmoothScroll — intercepts mouse-wheel events and animates the scroll
 * position via requestAnimationFrame + linear interpolation.
 *
 * The problem: Windows default wheel scroll moves in coarse steps and
 * feels choppy ("드르륵"). Trackpads and Magic Mouse on macOS already
 * deliver smooth momentum; those we leave alone.
 *
 * Heuristic for "this is a coarse wheel, not a trackpad":
 *   • `deltaMode !== 0` (LINE or PAGE units) → definitely a wheel mouse
 *   • OR deltaY is a large quantised value (> 50px in pixel mode) that
 *     doesn't match trackpad granularity — also a wheel
 * Trackpad events (small deltaY, pixel mode, often every frame) fall
 * through to the browser's native smoothing.
 *
 * We hold the intended scroll position in `target` and lerp the actual
 * scroll toward it. This preserves:
 *   • `position: sticky` elements — the browser still drives layout
 *   • `animation-timeline: view()` — advances with real scroll position
 *   • `scroll-snap-type` — fires when we release the wheel
 * …because we're only changing HOW the scroll arrives, not where it is.
 *
 * Respects `prefers-reduced-motion`: does nothing at all.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    // ── State ─────────────────────────────────────────────────────
    let target = window.scrollY;
    let current = target;
    let running = false;

    /** Lerp factor per frame. Lower = silkier but slower to catch up. */
    const EASE = 0.12;
    /** Below this gap we snap to target and stop the rAF loop. */
    const EPSILON = 0.4;
    /** Anything larger than this in pixel mode is a coarse wheel tick. */
    const WHEEL_THRESHOLD = 40;

    const maxScroll = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const tick = () => {
      const diff = target - current;
      if (Math.abs(diff) < EPSILON) {
        current = target;
        window.scrollTo({ top: current, behavior: "instant" });
        running = false;
        return;
      }
      current += diff * EASE;
      window.scrollTo({ top: current, behavior: "instant" });
      requestAnimationFrame(tick);
    };

    const onWheel = (e: WheelEvent) => {
      // Only smooth coarse wheels, let trackpads flow natively.
      const isCoarse =
        e.deltaMode !== 0 /* LINE or PAGE */ ||
        Math.abs(e.deltaY) > WHEEL_THRESHOLD;
      if (!isCoarse) return;

      // Don't hijack if the target has its own scroll (e.g., a modal).
      const path = e.composedPath();
      for (const node of path) {
        if (!(node instanceof HTMLElement)) continue;
        if (node === document.body || node === document.documentElement) break;
        const style = getComputedStyle(node);
        const scrollableY =
          (style.overflowY === "auto" || style.overflowY === "scroll") &&
          node.scrollHeight > node.clientHeight;
        if (scrollableY) return;
      }

      e.preventDefault();

      // Reset the chase-position if the user scrolled manually (e.g.,
      // keyboard, anchor, scroll-snap correction) — keeps the lerp honest.
      if (Math.abs(window.scrollY - current) > 1) {
        current = window.scrollY;
      }

      target = Math.max(
        0,
        Math.min(maxScroll(), target + e.deltaY)
      );

      if (!running) {
        running = true;
        requestAnimationFrame(tick);
      }
    };

    // Keep target synced when scroll happens by other means (anchor
    // links, scroll-snap, keyboard) so the next wheel event doesn't
    // snap back to a stale target.
    const onScrollByOthers = () => {
      if (!running) {
        target = window.scrollY;
        current = target;
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScrollByOthers, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScrollByOthers);
    };
  }, []);

  return null;
}
