import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { WorkItem } from "@/lib/work";
import { WorkCover } from "@/components/work-cover";

interface WorkZigzagProps {
  items: WorkItem[];
}

/**
 * WorkZigzag — condense the three selected-work slides into one spread.
 *
 * Previous home deck had one 100svh slide per case study (OIKBAS · VFX
 * Research · minhanr.dev) — three wheels to get through the work act.
 * This component stacks all three into a single scrollable slide with
 * alternating cover/copy sides so the visitor reads it as an editorial
 * spread rather than a carousel:
 *
 *     ┌─ cover ─┐ ┌─ copy  ─┐
 *     │   01   │ │  OIKBAS │
 *     └────────┘ └─────────┘
 *     ┌─ copy  ─┐ ┌─ cover ─┐
 *     │  VFX   │ │   02    │
 *     └────────┘ └─────────┘
 *     ┌─ cover ─┐ ┌─ copy  ─┐
 *     │   03   │ │ minhanr │
 *     └────────┘ └─────────┘
 *
 * The slide overflows vertically (overflow-y-auto). SlideDeck's
 * isInsideNestedScroller check lets wheel events scroll this container
 * normally while still allowing the deck to advance once the scroll
 * bottom is reached — the wheel hand-off is the same pattern used for
 * modal dialogs and code blocks inside slides.
 */
export function WorkZigzag({ items }: WorkZigzagProps) {
  return (
    <section
      data-slide
      className="slide hairline-t relative mx-auto w-full max-w-[1440px] overflow-y-auto px-6 py-12 sm:px-10 sm:py-16"
    >
      {/* No repeated "Selected Work · 01" header — the preceding
          SectionKicker slide already opens the chapter. The numbered
          items below carry the rest of the information density. */}
      <ol className="space-y-14 sm:space-y-20">
        {items.map((item, i) => {
          const flip = i % 2 === 1;
          const n = String(i + 1).padStart(2, "0");
          return (
            <li key={item.slug}>
              <article className="grid gap-6 md:grid-cols-12 md:gap-10 lg:gap-14">
                <div
                  className={`md:col-span-6 ${flip ? "md:order-last" : ""}`}
                >
                  <Link
                    href={`/work/${item.slug}`}
                    className="media-zoom block w-full"
                  >
                    <WorkCover
                      src={item.coverImage}
                      alt={item.coverAlt ?? item.title}
                      label={item.title}
                      sublabel={item.subject}
                      aspect="frame-16x9"
                      sizes="(min-width: 768px) 48vw, 100vw"
                      priority={i === 0}
                    />
                  </Link>
                </div>

                <div className="flex flex-col justify-center md:col-span-6">
                  <div className="flex items-baseline justify-between border-b border-[var(--hairline)] pb-2">
                    <span
                      className="font-display italic tabular-nums text-primary"
                      style={{
                        fontSize: "clamp(1.5rem, 2.6vw, 2.25rem)",
                        lineHeight: "0.9",
                      }}
                    >
                      {n}
                    </span>
                    <span className="font-technical text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      {item.discipline} · {item.year}
                    </span>
                  </div>

                  <h3
                    className="mt-3 font-display italic tracking-[-0.02em] text-foreground"
                    style={{
                      fontSize: "clamp(1.5rem, 2.6vw, 2.25rem)",
                      lineHeight: "1.1",
                    }}
                  >
                    {item.title}
                  </h3>

                  <p className="mt-3 max-w-prose text-[14px] leading-[1.65] text-muted-foreground sm:text-[15px]">
                    {item.summary}
                  </p>

                  <Link
                    href={`/work/${item.slug}`}
                    className="mt-4 inline-flex items-center gap-2 font-technical text-[11px] uppercase tracking-[0.2em] text-foreground hover:text-primary"
                  >
                    <span className="link-underline">Read case</span>
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </Link>
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
