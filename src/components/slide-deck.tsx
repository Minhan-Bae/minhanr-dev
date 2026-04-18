"use client";

import {
  Children,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

/**
 * SlideDeck — transform-driven PowerPoint-style deck.
 *
 * Architecture: the deck is a fixed-position viewport covering the
 * full window. Inside it, a single `.slide-track` div stacks every
 * child at 100svh each and is moved by `transform: translate3d(0,
 * -idx * 100svh, 0)`. A CSS transition on the transform does the
 * animation — the browser composites it on the GPU as a single
 * layer, so the motion is silky regardless of how heavy the slide
 * contents are. rAF-scrolled `window.scrollTo` cannot match this
 * because the browser re-paints scroll-dependent layers each frame.
 *
 * Because the deck is fixed, the document itself doesn't scroll,
 * which also eliminates any fight with CSS scroll-snap, sticky
 * positioning in child slides, or the browser's own smooth-scroll
 * degradation under reduce-motion.
 *
 * Input:
 *   • Wheel        — one tick = one slide (cooldown stops a trackpad
 *                    flick from burning through multiple slides)
 *   • Keyboard     — ↑↓, PgUp/PgDn, Space / Shift+Space, Home, End
 *   • Touch        — swipe ±10% of viewport height advances ±1 slide
 *   • Nested scroll — any descendant with its own overflow auto/scroll
 *                    passes through untouched (modals, code blocks)
 */

const DURATION_MS = 900;
/** Mirrors CSS ease-out-expo (fast start → long graceful deceleration). */
const CURVE = "cubic-bezier(0.16, 1, 0.3, 1)";
const COOLDOWN_MS = DURATION_MS + 80;
const WHEEL_DEADBAND = 8;
const SWIPE_THRESHOLD_RATIO = 0.1;

export function SlideDeck({ children }: { children: ReactNode }) {
  const kids = Children.toArray(children);
  const count = kids.length;

  const [idx, setIdx] = useState(0);
  // Mirror of `idx` for event handlers registered once on mount —
  // using state directly would mean re-registering every change.
  const idxRef = useRef(0);
  const animating = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const goto = (next: number) => {
      if (animating.current) return;
      if (next < 0 || next >= count) return;
      animating.current = true;
      idxRef.current = next;
      setIdx(next);
      window.setTimeout(() => {
        animating.current = false;
      }, COOLDOWN_MS);
    };

    const isInsideNestedScroller = (e: Event): boolean => {
      const path = e.composedPath();
      for (const n of path) {
        if (!(n instanceof HTMLElement)) continue;
        if (n === rootRef.current) break;
        const s = getComputedStyle(n);
        if (
          (s.overflowY === "auto" || s.overflowY === "scroll") &&
          n.scrollHeight > n.clientHeight
        ) {
          return true;
        }
      }
      return false;
    };

    const onWheel = (e: WheelEvent) => {
      if (isInsideNestedScroller(e)) return;
      e.preventDefault();
      if (animating.current) return;
      if (Math.abs(e.deltaY) < WHEEL_DEADBAND) return;
      goto(idxRef.current + (e.deltaY > 0 ? 1 : -1));
    };

    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      ) {
        return;
      }
      let next = idxRef.current;
      switch (e.key) {
        case "ArrowDown":
        case "PageDown":
          next = idxRef.current + 1;
          break;
        case "ArrowUp":
        case "PageUp":
          next = idxRef.current - 1;
          break;
        case " ":
          next = e.shiftKey ? idxRef.current - 1 : idxRef.current + 1;
          break;
        case "Home":
          next = 0;
          break;
        case "End":
          next = count - 1;
          break;
        default:
          return;
      }
      e.preventDefault();
      goto(Math.max(0, Math.min(count - 1, next)));
    };

    let touchStartY: number | null = null;
    let touchStartIdx = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (animating.current || e.touches.length !== 1) return;
      touchStartY = e.touches[0].clientY;
      touchStartIdx = idxRef.current;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (isInsideNestedScroller(e)) return;
      // Block body bounce and natural scroll — the deck is the scroller.
      e.preventDefault();
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartY === null || animating.current) return;
      const delta = touchStartY - e.changedTouches[0].clientY;
      const threshold = window.innerHeight * SWIPE_THRESHOLD_RATIO;
      let next = touchStartIdx;
      if (delta > threshold) next = touchStartIdx + 1;
      else if (delta < -threshold) next = touchStartIdx - 1;
      goto(Math.max(0, Math.min(count - 1, next)));
      touchStartY = null;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [count]);

  return (
    <div
      ref={rootRef}
      data-slide-deck="root"
      className="fixed inset-0 z-0 overflow-hidden"
    >
      <div
        className="will-change-transform"
        style={{
          transform: `translate3d(0, calc(${-idx} * 100svh), 0)`,
          transition: `transform ${DURATION_MS}ms ${CURVE}`,
        }}
      >
        {kids.map((child, i) => (
          <div
            key={i}
            className="relative h-[100svh] w-full overflow-hidden"
          >
            {child}
          </div>
        ))}
      </div>

      {/* Position indicator — small dots on the right, current slide
          highlighted in primary. Lets the visitor see where they are
          in the deck. */}
      <nav
        aria-label="Slide position"
        className="pointer-events-auto fixed right-4 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-3 sm:right-6"
      >
        {kids.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Slide ${i + 1}`}
            aria-current={i === idx}
            onClick={() => {
              if (animating.current || i === idx) return;
              animating.current = true;
              idxRef.current = i;
              setIdx(i);
              window.setTimeout(() => {
                animating.current = false;
              }, COOLDOWN_MS);
            }}
            className={`block h-2 w-2 rounded-full transition-all ${
              i === idx
                ? "scale-125 bg-primary"
                : "bg-foreground/30 hover:bg-foreground/60"
            }`}
          />
        ))}
      </nav>
    </div>
  );
}
