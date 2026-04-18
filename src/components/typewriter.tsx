import type { CSSProperties, ElementType, ReactNode } from "react";

interface TypewriterProps {
  /** The text to animate letter-by-letter. */
  text: string;
  /** ms between each letter landing (default: 120). */
  stagger?: number;
  /** ms delay before the first letter starts (default: 0). */
  delay?: number;
  /** Show a blinking cursor after the last letter (default: true). */
  cursor?: boolean;
  /** Extra ms after the last letter before the cursor appears. */
  cursorBuffer?: number;
  /** Element tag to render the wrapper as (default: "span"). */
  as?: ElementType;
  /** Extra classes on the wrapper. */
  className?: string;
  /** Inline style on the wrapper. Useful for one-off font-size overrides. */
  style?: CSSProperties;
  /** Language hint for the wrapper (e.g. "en" for Instrument Serif italic). */
  lang?: string;
  /** Optional children rendered after the cursor (e.g. a `.dev` suffix). */
  children?: ReactNode;
}

/**
 * Typewriter — per-letter drop-in animation followed by an optional
 * blinking cursor. Extracted from the home Hero so any page hero can
 * adopt the same identity-defining entry motion.
 *
 * Each letter is a `<span class="tw-letter">` with an inline
 * `animationDelay`. The CSS for `.tw-letter` and `.tw-cursor` lives in
 * globals.css and uses `animation-fill-mode: both` so letters stay
 * invisible before their delay and visible after their animation ends.
 *
 * Because animation delays are encoded inline, this component is a
 * pure server component — no "use client" needed. Animations run
 * purely on CSS, triggered on mount.
 */
export function Typewriter({
  text,
  stagger = 120,
  delay = 0,
  cursor = true,
  cursorBuffer = 180,
  as,
  className,
  style,
  lang,
  children,
}: TypewriterProps) {
  const Tag = (as ?? "span") as ElementType;
  const letters = [...text];
  const cursorDelay = delay + letters.length * stagger + cursorBuffer;

  return (
    <Tag className={className} style={style} lang={lang} aria-label={text}>
      {letters.map((char, i) => {
        // Preserve spaces as non-animated, full-width gaps so the
        // word shape doesn't collapse while characters drop in.
        if (char === " ") {
          return (
            <span key={i} aria-hidden>
              &nbsp;
            </span>
          );
        }
        return (
          <span
            key={i}
            aria-hidden
            className="tw-letter"
            style={{ animationDelay: `${delay + i * stagger}ms` }}
          >
            {char}
          </span>
        );
      })}
      {cursor && (
        <span
          aria-hidden
          className="tw-cursor"
          style={{ animationDelay: `${cursorDelay}ms` }}
        >
          |
        </span>
      )}
      {children}
    </Tag>
  );
}
