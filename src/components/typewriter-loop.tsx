"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
} from "react";

type Phase = "typing" | "hold" | "erasing" | "pause";

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
}

/**
 * TypewriterLoop — boomerang typewriter with a cursor that tracks the
 * typing head.
 *
 * Only letters that have been typed are rendered in the DOM; the
 * blinking cursor is rendered immediately after the last visible
 * letter. That way the cursor "advances" with the text as it types in
 * and "retreats" as it erases, instead of camping at the end of the
 * full word. Each newly-mounted letter runs `tw-letter-in` so it
 * fades-and-drops into place; erased letters are unmounted and read
 * as a hard backspace — fast and legible.
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
}: TypewriterLoopProps) {
  const Tag = (as ?? "span") as ElementType;
  const letters = [...text];
  const [visibleCount, setVisibleCount] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const clearTimer = () => {
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    if (phase === "typing") {
      if (visibleCount < letters.length) {
        timerRef.current = window.setTimeout(
          () => setVisibleCount((c) => c + 1),
          typeDelay
        );
      } else {
        timerRef.current = window.setTimeout(() => setPhase("hold"), holdMs);
      }
    } else if (phase === "hold") {
      setPhase("erasing");
    } else if (phase === "erasing") {
      if (visibleCount > 0) {
        timerRef.current = window.setTimeout(
          () => setVisibleCount((c) => c - 1),
          eraseDelay
        );
      } else {
        timerRef.current = window.setTimeout(() => setPhase("pause"), pauseMs);
      }
    } else if (phase === "pause") {
      setPhase("typing");
    }

    return clearTimer;
  }, [phase, visibleCount, letters.length, typeDelay, eraseDelay, holdMs, pauseMs]);

  return (
    <Tag className={className} style={style} lang={lang} aria-label={text}>
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
