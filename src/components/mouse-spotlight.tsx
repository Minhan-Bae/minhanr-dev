"use client";

import { useEffect, useRef } from "react";

/**
 * MouseSpotlight — a soft, lerp-smoothed "torch" following the pointer.
 *
 * A fixed, pointer-events-none overlay sitting above the content but
 * below the dock/colophon/datum. `mix-blend-mode: plus-lighter` adds
 * a tiny amount of cool-white light to whatever is under the cursor,
 * which reads as an ambient spotlight on the deep Prussian-night
 * background without tinting anything visibly.
 *
 * Implementation notes:
 *   • pointermove sets a target (tx, ty); a rAF loop lerps the
 *     rendered (x, y) toward the target at 16 % per frame — the torch
 *     trails the cursor instead of snapping, which feels luxurious
 *     rather than mechanical.
 *   • The loop stops when the cursor hasn't moved for a frame or two
 *     so we aren't burning CPU when the page is idle.
 *   • Light theme hides this overlay — daytime sunny scenes don't
 *     benefit from a spotlight. Scope lives in globals.css via
 *     `:root.light .mouse-spotlight { display: none }`.
 */
export function MouseSpotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let rafId = 0;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let x = tx;
    let y = ty;
    let hidden = true;

    const show = () => {
      if (hidden) {
        el.style.opacity = "1";
        hidden = false;
      }
    };
    const hide = () => {
      el.style.opacity = "0";
      hidden = true;
    };

    const tick = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
      if (Math.abs(tx - x) > 0.4 || Math.abs(ty - y) > 0.4) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = 0;
      }
    };

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      show();
      if (!rafId) rafId = requestAnimationFrame(tick);
    };
    const onLeave = () => hide();

    // Touch devices don't have a persistent pointer; keep the spotlight
    // hidden on coarse pointers so the tap doesn't trigger a lingering
    // halo after the finger lifts.
    if (matchMedia("(hover: hover)").matches) {
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerleave", onLeave);
      document.addEventListener("pointerleave", onLeave);
    } else {
      hide();
    }

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerleave", onLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return <div ref={ref} aria-hidden className="mouse-spotlight" />;
}
