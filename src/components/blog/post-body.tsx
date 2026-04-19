"use client";

import { useEffect, useRef } from "react";

/**
 * Post body with soft crawl / clipboard defence.
 *
 * Not a security boundary — HTML is already sent to the client in the
 * page render, and anyone who opens devtools can copy it. The intent
 * is a friction layer against trivial "right-click → select all →
 * copy" harvesting, and against the most common low-effort content
 * scrapers. Combined with the AI-bot User-Agent block in robots.ts,
 * it raises the cost of casual copying without making the page
 * hostile to legitimate readers (text is still selectable for
 * screen-reader-driven highlight, accessibility navigation, etc.).
 *
 * Blocks:
 *   • copy / cut events → preventDefault
 *   • contextmenu (right-click) → preventDefault
 *   • image dragstart → preventDefault
 *
 * Does NOT block selection — readers can still highlight to track
 * their place visually without triggering copy.
 */
export function PostBody({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const block = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    el.addEventListener("copy", block);
    el.addEventListener("cut", block);
    el.addEventListener("contextmenu", block);
    el.addEventListener("dragstart", block);

    return () => {
      el.removeEventListener("copy", block);
      el.removeEventListener("cut", block);
      el.removeEventListener("contextmenu", block);
      el.removeEventListener("dragstart", block);
    };
  }, [html]);

  return (
    <article
      ref={ref}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
