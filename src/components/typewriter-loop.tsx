"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
} from "react";
import {
  ensureTypewriterAudio,
  playTypewriterClick,
} from "@/lib/typewriter-sfx";

type Phase = "typing" | "erasing";

interface TypewriterLoopProps {
  /** Text to type/erase on loop. */
  text: string;
  /** ms per character while typing in. */
  typeDelay?: number;
  /** ms per character while erasing. Usually faster than typing. */
  eraseDelay?: number;
  /** ms to hold the fully-typed word before erasing. */
  holdMs?: number;
  /** ms to wait at empty before typing again. */
  pauseMs?: number;
  /** Element tag to render the wrapper as (default: "span"). */
  as?: ElementType;
  /** Extra classes on the wrapper. */
  className?: string;
  /** Inline style on the wrapper. */
  style?: CSSProperties;
  /** Language hint (e.g. "en"). */
  lang?: string;
  /** Show a blinking cursor at the current typing head. */
  cursor?: boolean;
  /** Emit a synthesized key-click on each letter mount / unmount.
   *  OFF by default — the typing SFX is a Hero-specific signature;
   *  adding it to every subsequent slide turns the deck into a
   *  continuous clicking track, which reads as noise. Explicit
   *  `sfx={true}` on the hero opts in. */
  sfx?: boolean;
}

/**
 * TypewriterLoop — boomerang typewriter with a cursor that tracks the
 * typing head.
 *
 * Types in → holds → erases right-to-left → pauses → cycles. Each
 * letter fades and drops into place on mount; erased letters unmount
 * and read as a hard backspace.
 *
 * Visibility gating: the animation only runs while the wrapper is at
 * least partially in the viewport. When the home's SlideDeck moves to
 * another slide, `IntersectionObserver` fires with
 * `isIntersecting: false` and the state machine parks itself — no
 * more timers, no more synthesized clicks. On re-entry (visitor
 * scrolls back to this slide) the machine resumes from whatever phase
 * and count it was in.
 *
 * Client component — the server render is empty; JS fills in on mount.
 * The boomerang IS the brand motion, so the brief empty moment before
 * hydration is accepted as part of the design.
 */
export function TypewriterLoop({
  text,
  typeDelay = 140,
  eraseDelay = 70,
  holdMs = 2200,
  pauseMs = 820,
  as,
  className,
  style,
  lang,
  cursor = true,
  sfx = false,
}: TypewriterLoopProps) {
  const Tag = (as ?? "span") as ElementType;
  const letters = [...text];
  const [visibleCount, setVisibleCount] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");
  const [isActive, setIsActive] = useState(true);
  const timerRef = useRef<number | null>(null);
  const wrapperRef = useRef<HTMLElement | null>(null);

  // Prime the Web Audio context + hook first-gesture unlock once.
  useEffect(() => {
    ensureTypewriterAudio();
  }, []);

  // Visibility gate — pause the state machine when the wrapper is
  // scrolled (or SlideDeck-translated) out of view.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([entry]) => setIsActive(entry.isIntersecting),
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const clearTimer = () => {
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    if (!isActive) {
      // Parked — cancel any pending tick and emit no sound. When the
      // slide comes back into view, isActive flips true and this
      // effect re-fires from the current (phase, visibleCount).
      return clearTimer;
    }

    if (phase === "typing") {
      if (visibleCount < letters.length) {
        timerRef.current = window.setTimeout(() => {
          setVisibleCount((c) => c + 1);
          if (sfx) playTypewriterClick();
        }, typeDelay);
      } else {
        // Hold the fully-typed wordmark on screen, then flip straight to
        // erasing. Folding the hold into this timeout (rather than going
        // through an intermediate `phase = "hold"`) avoids a cascading
        // setState-in-effect render.
        timerRef.current = window.setTimeout(() => setPhase("erasing"), holdMs);
      }
    } else {
      if (visibleCount > 0) {
        timerRef.current = window.setTimeout(() => {
          setVisibleCount((c) => c - 1);
          if (sfx) playTypewriterClick({ volume: 0.07 });
        }, eraseDelay);
      } else {
        // Same trick on the empty side: pause, then jump straight back to
        // typing without an intermediate phase.
        timerRef.current = window.setTimeout(() => setPhase("typing"), pauseMs);
      }
    }

    return clearTimer;
  }, [phase, visibleCount, letters.length, typeDelay, eraseDelay, holdMs, pauseMs, isActive, sfx]);

  return (
    <Tag
      ref={wrapperRef as React.Ref<HTMLElement>}
      className={className}
      style={style}
      lang={lang}
      aria-label={text}
    >
      {letters.slice(0, visibleCount).map((char, i) => {
        if (char === " ") {
          return (
            <span key={i} aria-hidden>
              &nbsp;
            </span>
          );
        }
        return (
          <span key={i} aria-hidden className="tw-letter-loop">
            {char}
          </span>
        );
      })}
      {cursor && <span aria-hidden className="tw-cursor-loop">|</span>}
    </Tag>
  );
}
