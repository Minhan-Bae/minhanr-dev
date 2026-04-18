import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { BlogPostMeta } from "@/lib/blog";

interface WritingIndexProps {
  posts: BlogPostMeta[];
  total: number;
}

/**
 * WritingIndex — 100svh slide with a compact, numbered editorial list.
 *
 * Fewer rows than a full index (5 max) so everything fits in-viewport
 * without scroll-within-slide. Generous row padding gives the list
 * the confidence of a magazine masthead.
 */
export function WritingIndex({ posts, total }: WritingIndexProps) {
  const rows = posts.slice(0, 5);

  return (
    <section
      data-slide
      className="slide hairline-t relative mx-auto flex w-full max-w-[1440px] flex-col justify-center px-6 py-10 sm:px-10"
    >
      <header className="mb-8 flex flex-col gap-3 sm:mb-12 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <p className="kicker mb-3">Writing · 02</p>
          <h2
            className="font-display italic tracking-[-0.025em] text-foreground"
            style={{ fontSize: "clamp(2rem, 5.5vw, 4rem)", lineHeight: "1.02" }}
          >
            Notes from the studio.
          </h2>
        </div>
        <div className="flex items-baseline gap-6 font-technical text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <span>
            <span className="tabular-nums text-foreground">{total}</span> pieces
          </span>
          <Link href="/blog" className="link-underline hover:text-foreground">
            Index →
          </Link>
        </div>
      </header>

      <ol>
        {rows.map((post, i) => {
          const n = String(i + 1).padStart(2, "0");
          return (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group grid grid-cols-[auto_1fr] items-baseline gap-5 border-t border-[var(--hairline)] py-4 sm:grid-cols-[auto_1fr_auto] sm:gap-8 sm:py-5"
              >
                <span
                  className="font-display italic tabular-nums text-muted-foreground transition-colors group-hover:text-primary"
                  style={{ fontSize: "clamp(1.5rem, 2.6vw, 2.25rem)", lineHeight: "0.9" }}
                >
                  {n}
                </span>

                <div className="min-w-0">
                  <h3
                    className="font-display italic tracking-[-0.015em] text-foreground transition-colors group-hover:text-primary"
                    style={{
                      fontSize: "clamp(1.05rem, 1.8vw, 1.5rem)",
                      lineHeight: "1.2",
                    }}
                  >
                    {post.title}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-technical text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    <time dateTime={post.date} className="tabular-nums">
                      {formatDate(post.date)}
                    </time>
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="lowercase tracking-[0.14em] before:mr-2 before:content-['·']"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <ArrowUpRight
                  className="hidden self-center text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary sm:block"
                  strokeWidth={1.25}
                  size={22}
                />
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return iso;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}
