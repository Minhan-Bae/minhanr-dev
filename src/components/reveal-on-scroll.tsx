"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * RevealOnScroll — single-intersection fade-up wrapper.
 *
 * Renders children in a wrapper that starts invisible and slid-down
 * 12px, then fades up + settles once it first crosses the viewport.
 * Uses IntersectionObserver so the animation fires exactly once per
 * page view, and respects prefers-reduced-motion (children render
 * fully visible immediately, no transitions).
 *
 * Intended for non-critical editorial motion only — section headings,
 * cards as they enter, the first paragraph of a post. Never wrap the
 * hero or anything above-the-fold; those should paint visible from t=0.
 */
export function RevealOnScroll({
  children,
  delayMs = 0,
  as: Tag = "div",
  className = "",
}: {
  children: ReactNode;
  /** Animation delay in ms. Use small stagger values (30–100ms) for lists. */
  delayMs?: number;
  /** Element tag to render. Defaults to div. */
  as?: ElementType;
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduce) {
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.style.transitionDelay = `${delayMs}ms`;
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
            io.unobserve(el);
          }
        }
      },
      // Trigger a bit before the element is fully on-screen so users
      // rarely see the pre-animation state.
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delayMs]);

  const Element = Tag as "div";
  return (
    <Element
      ref={ref as React.RefObject<HTMLDivElement>}
      className={className}
      style={{
        opacity: 0,
        transform: "translateY(12px)",
        transition:
          "opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)",
        willChange: "opacity, transform",
      }}
    >
      {children}
    </Element>
  );
}
