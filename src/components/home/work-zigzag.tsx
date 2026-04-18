import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { WorkItem } from "@/lib/work";
import { WorkCover } from "@/components/work-cover";

interface WorkZigzagProps {
  items: WorkItem[];
}

/**
 * WorkZigzag — three case studies on a single fit-to-viewport slide.
 *
 * Rows alternate cover/copy sides so the eye bounces diagonally down
 * the page like a magazine spread. Row height is tuned so three rows
 * + slide padding + gaps fit inside 100 svh without internal scroll
 * on a standard 1280×800 laptop — no drag needed to see every case.
 *
 *   ┌─cover─┐ ┌─copy ─┐
 *   │  01   │ │ title │
 *   └───────┘ └───────┘
 *   ┌─copy ─┐ ┌─cover─┐
 *   │ title │ │  02   │
 *   └───────┘ └───────┘
 *   ┌─cover─┐ ┌─copy ─┐
 *   │  03   │ │ title │
 *   └───────┘ └───────┘
 *
 * Covers use a wide aspect (≈ 16:7) so each row stays short and the
 * whole column reads as cinematic panels stacked, not as three square
 * stills. Hover on a cover gently zooms the image (1.08 scale over
 * 1.2 s) via the `.media-zoom` utility — the "mouse over → gradually
 * expanding" feel the author asked for.
 */
export function WorkZigzag({ items }: WorkZigzagProps) {
  return (
    <section
      data-slide
      className="slide hairline-t relative mx-auto flex w-full max-w-[1440px] flex-col justify-center px-6 pt-[clamp(24px,4vh,60px)] pb-[clamp(140px,18vh,200px)] sm:px-10"
    >
      {/* Asymmetric padding — extra bottom clearance (pb-40/44) keeps
          the three rows above the four-corner chrome (HomeStats +
          ThemeToggle on the left, SiteDock centered, SiteColophon on
          the right) which share the bottom ~160 px of the viewport.
          `justify-center` on the flex-col centres the stack inside
          the remaining vertical band so the composition still reads
          as balanced rather than top-heavy. */}
      <ol className="space-y-3 sm:space-y-5">
        {items.map((item, i) => {
          const flip = i % 2 === 1;
          const n = String(i + 1).padStart(2, "0");
          return (
            <li key={item.slug}>
              <article className="grid gap-4 md:grid-cols-12 md:gap-6">
                <div
                  className={`md:col-span-5 ${flip ? "md:order-last" : ""}`}
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
                      aspect="frame-3x1"
                      sizes="(min-width: 768px) 36vw, 100vw"
                      priority={i === 0}
                    />
                  </Link>
                </div>

                <div className="flex flex-col justify-center md:col-span-7">
                  <div className="flex items-baseline justify-between border-b border-[var(--hairline)] pb-1.5">
                    <span
                      className="font-display italic tabular-nums text-primary"
                      style={{
                        fontSize: "clamp(1.25rem, 2.2vw, 1.75rem)",
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
                    className="mt-2 font-display italic tracking-[-0.02em] text-foreground"
                    style={{
                      fontSize: "clamp(1.25rem, 2.2vw, 1.85rem)",
                      lineHeight: "1.1",
                    }}
                  >
                    {item.title}
                  </h3>

                  <p className="mt-2 line-clamp-2 max-w-prose text-[13px] leading-[1.55] text-muted-foreground sm:text-[14px]">
                    {item.summary}
                  </p>

                  <Link
                    href={`/work/${item.slug}`}
                    className="mt-2 inline-flex items-center gap-1.5 font-technical text-[10px] uppercase tracking-[0.2em] text-foreground hover:text-primary"
                  >
                    <span className="link-underline">Read case</span>
                    <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
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
