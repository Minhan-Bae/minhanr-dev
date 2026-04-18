"use client";

import { useEffect, useState, useRef } from "react";

interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export function TableOfContents({ headings }: { headings: TocHeading[] }) {
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -80% 0px", threshold: 0 }
    );

    elements.forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav
      aria-label="차례"
      className="hidden lg:block sticky top-24 max-h-[calc(100svh-7rem)] overflow-y-auto font-technical"
    >
      <p className="kicker mb-4">차례 · Contents</p>
      <ul className="space-y-[2px] border-l border-[var(--hairline)] text-[13px]">
        {headings.map((h) => {
          const active = activeId === h.id;
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                className={`block py-[5px] leading-snug transition-all duration-300 ${
                  h.level === 3 ? "pl-6" : "pl-3"
                } ${
                  active
                    ? "-ml-px border-l-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                style={{
                  // Subtle indent shift on active — the eye catches motion
                  // cheaply without colour change doing all the work.
                  transform: active ? "translateX(2px)" : undefined,
                }}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
