import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { WorkItem } from "@/lib/work";
import { WorkCover } from "@/components/work-cover";

interface WorkShowcaseProps {
  items: WorkItem[];
}

/**
 * WorkShowcase — sticky-pin case-study sequence.
 *
 * Layout per item:
 *   • Desktop — image is position:sticky in the right half of the grid,
 *     text scrolls in the left half. Each `pin-stage` is 180vh so the
 *     image stays framed while the copy advances, then unsticks and
 *     hands off to the next item. Every second item flips left/right.
 *   • Mobile — pin utilities unset themselves via media query, so the
 *     section collapses to a natural media-over-text stack.
 *
 * This replaces the former asymmetric grid. Intent: one project at a
 * time, full attention, magazine-spread feel. Scroll-driven reveal
 * animates headings and facts in via `animation-timeline: view()`.
 */
export function WorkShowcase({ items }: WorkShowcaseProps) {
  return (
    <section className="w-full">
      {/* Section kicker band */}
      <div className="mx-auto flex max-w-[1440px] items-baseline justify-between px-6 py-10 sm:px-10 sm:py-14">
        <div>
          <p className="kicker mb-3">선별 작업 · Selected Work</p>
          <h2 className="display-lg font-display italic text-foreground">
            실제로 출시된 것들.
          </h2>
        </div>
        <Link
          href="/work"
          className="font-technical link-underline hidden text-[13px] uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground md:inline-block"
        >
          전체 보기
        </Link>
      </div>

      {/* Pinned stages */}
      {items.map((item, i) => (
        <WorkStage
          key={item.slug}
          item={item}
          index={i}
          flip={i % 2 === 1}
          isLast={i === items.length - 1}
        />
      ))}

      {/* Mobile fallback CTA */}
      <div className="mt-4 flex justify-center pb-6 md:hidden">
        <Link
          href="/work"
          className="font-technical link-underline text-[13px] uppercase tracking-[0.16em] text-muted-foreground"
        >
          작업 전체 보기
        </Link>
      </div>
    </section>
  );
}

function WorkStage({
  item,
  index,
  flip,
  isLast,
}: {
  item: WorkItem;
  index: number;
  flip: boolean;
  isLast: boolean;
}) {
  const number = String(index + 1).padStart(2, "0");

  return (
    <article
      className={`pin-stage hairline-t ${isLast ? "hairline-b" : ""} relative`}
    >
      <div className="mx-auto grid max-w-[1440px] gap-8 px-6 sm:px-10 md:grid-cols-12 md:gap-12">
        {/* Image — sticks on desktop, regular block on mobile */}
        <div
          className={`pin-media md:col-span-7 md:flex md:items-center md:justify-center ${
            flip ? "md:order-last" : ""
          }`}
        >
          <div className="w-full py-10 md:py-0">
            <Link
              href={`/work/${item.slug}`}
              className="media-zoom block w-full"
            >
              <WorkCover
                src={item.coverImage}
                alt={item.coverAlt ?? item.title}
                label={item.title}
                sublabel={item.subject}
                aspect={flip ? "frame-4x5" : "frame-16x9"}
                sizes="(min-width: 768px) 60vw, 100vw"
                priority={index === 0}
              />
            </Link>
          </div>
        </div>

        {/* Copy rail */}
        <div className="md:col-span-5 md:flex md:min-h-[100svh] md:items-center">
          <div className="w-full max-w-md space-y-6 pb-16 md:py-24">
            <div className="flex items-baseline gap-4">
              <span
                className="font-display italic tabular-nums text-primary"
                style={{ fontSize: "clamp(2.25rem, 4vw, 3.25rem)", lineHeight: "0.9" }}
              >
                {number}
              </span>
              <span className="font-technical text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                {item.discipline} · {item.year}
              </span>
            </div>

            <h3
              className="reveal-up font-display italic tracking-[-0.02em] text-foreground"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", lineHeight: "1.05" }}
            >
              {item.title}
            </h3>

            <p className="reveal-up max-w-prose text-[15px] leading-[1.75] text-muted-foreground sm:text-[16px]">
              {item.summary}
            </p>

            {item.facts && item.facts.length > 0 && (
              <dl className="reveal-up grid gap-x-6 gap-y-2 pt-2 font-technical text-[12px] sm:grid-cols-2">
                {item.facts.slice(0, 4).map((f) => (
                  <div key={f.label} className="flex justify-between gap-4 border-t border-[var(--hairline)] py-2">
                    <dt className="uppercase tracking-[0.16em] text-muted-foreground">
                      {f.label}
                    </dt>
                    <dd className="text-right text-foreground">{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <Link
              href={`/work/${item.slug}`}
              className="reveal-up inline-flex items-center gap-2 pt-2 font-technical text-[13px] uppercase tracking-[0.18em] text-foreground hover:text-primary"
            >
              <span className="link-underline">케이스 스터디 읽기</span>
              <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
