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

export function SlideDeck({
  children,
  mode = "fullscreen",
}: {
  children: ReactNode;
  /** "fullscreen" — fixed inset-0, used on public pages where the
   *  deck IS the page. "inline" — absolute inset-0 inside a
   *  caller-provided relative parent of fixed height (e.g. dashboard
   *  inside the private layout's main element, so the sidebar and
   *  top header stay visible). */
  mode?: "fullscreen" | "inline";
}) {
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

    const isInsideDeck = (e: Event): boolean => {
      if (!rootRef.current) return false;
      const target = e.target as Node | null;
      return !!target && rootRef.current.contains(target);
    };

    const onWheel = (e: WheelEvent) => {
      // Inline decks share the page with sidebars, headers, and other
      // scrollables — only hijack wheel events that targeted the deck
      // itself. Fullscreen decks own the whole page so any wheel is
      // fair game.
      if (mode === "inline" && !isInsideDeck(e)) return;
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
      // Same scoping rule as wheel — inline decks only intercept
      // touches inside themselves.
      if (mode === "inline" && !isInsideDeck(e)) return;
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
  }, [count, mode]);

  // Fullscreen fills the viewport; inline fills its parent (which
  // must supply the height + `position: relative`). The per-slide
  // wrapper uses `100%` so inline decks adapt to whatever the parent
  // gives them, while fullscreen decks get 100svh directly via the
  // root's `inset-0`.
  const rootClass =
    mode === "fullscreen"
      ? "fixed inset-0 z-0 overflow-hidden"
      : "absolute inset-0 overflow-hidden";
  const slideClass =
    mode === "fullscreen"
      ? "relative h-[100svh] w-full overflow-hidden"
      : "relative h-full w-full overflow-hidden";
  const translateUnit = mode === "fullscreen" ? "100svh" : "100%";

  return (
    <div
      ref={rootRef}
      data-slide-deck="root"
      data-slide-deck-mode={mode}
      className={rootClass}
    >
      <div
        className="h-full will-change-transform"
        style={{
          transform: `translate3d(0, calc(${-idx} * ${translateUnit}), 0)`,
          transition: `transform ${DURATION_MS}ms ${CURVE}`,
        }}
      >
        {kids.map((child, i) => (
          <div key={i} className={slideClass}>
            {child}
          </div>
        ))}
      </div>

      {/* Position indicator — small dots on the right, current slide
          highlighted in primary. In inline mode the dots float inside
          the deck's own bounds (absolute) rather than viewport-fixed. */}
      <nav
        aria-label="Slide position"
        className={
          mode === "fullscreen"
            ? "pointer-events-auto fixed right-4 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-3 sm:right-6"
            : "pointer-events-auto absolute right-3 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-2.5"
        }
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
