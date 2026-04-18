import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { WorkItem } from "@/lib/work";
import { WorkCover } from "@/components/work-cover";

interface WorkShowcaseProps {
  items: WorkItem[];
}

/**
 * WorkShowcase — emits one 100svh slide per work item.
 *
 * Each slide is a split editorial spread: oversized cover on one side,
 * number + title + discipline + summary + facts + CTA on the other.
 * Every second item flips left/right so the deck reads like a
 * magazine spread turning over.
 *
 * No sticky-pin logic here — the page-level SlideDeck component
 * drives navigation, and each work item is its own snap target.
 */
export function WorkShowcase({ items }: WorkShowcaseProps) {
  return (
    <>
      {items.map((item, i) => (
        <WorkSlide
          key={item.slug}
          item={item}
          index={i}
          total={items.length}
          flip={i % 2 === 1}
        />
      ))}
    </>
  );
}

function WorkSlide({
  item,
  index,
  total,
  flip,
}: {
  item: WorkItem;
  index: number;
  total: number;
  flip: boolean;
}) {
  const number = String(index + 1).padStart(2, "0");
  const totalStr = String(total).padStart(2, "0");

  return (
    <section
      data-slide
      className="slide hairline-t relative mx-auto flex w-full max-w-[1440px] items-center px-6 py-10 sm:px-10"
    >
      <div className="grid w-full gap-6 md:grid-cols-12 md:gap-12">
        {/* Cover */}
        <div
          className={`md:col-span-7 ${flip ? "md:order-last" : ""}`}
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
              aspect={flip ? "frame-4x5" : "frame-16x9"}
              sizes="(min-width: 768px) 58vw, 100vw"
              priority={index === 0}
            />
          </Link>
        </div>

        {/* Copy */}
        <div className="flex flex-col justify-center md:col-span-5">
          <div className="flex items-baseline justify-between border-b border-[var(--hairline)] pb-3">
            <span
              className="font-display italic tabular-nums text-primary"
              style={{ fontSize: "clamp(2rem, 3.6vw, 3rem)", lineHeight: "0.9" }}
            >
              {number}
            </span>
            <span className="font-technical text-[10px] uppercase tracking-[0.22em] text-muted-foreground tabular-nums">
              {number} / {totalStr}
            </span>
          </div>

          <p className="mt-5 font-technical text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {item.discipline} · {item.year}
          </p>

          <h3
            className="mt-3 font-display italic tracking-[-0.02em] text-foreground"
            style={{
              fontSize: "clamp(1.75rem, 3.6vw, 3rem)",
              lineHeight: "1.05",
            }}
          >
            {item.title}
          </h3>

          <p className="mt-5 max-w-prose text-[14px] leading-[1.7] text-muted-foreground sm:text-[15px]">
            {item.summary}
          </p>

          {item.facts && item.facts.length > 0 && (
            <dl className="mt-6 hidden gap-x-6 gap-y-2 font-technical text-[11px] sm:grid sm:grid-cols-2">
              {item.facts.slice(0, 4).map((f) => (
                <div
                  key={f.label}
                  className="flex justify-between gap-4 border-t border-[var(--hairline)] py-2"
                >
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
            className="mt-8 inline-flex items-center gap-2 font-technical text-[12px] uppercase tracking-[0.2em] text-foreground hover:text-primary"
          >
            <span className="link-underline">Read case</span>
            <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </section>
  );
}
