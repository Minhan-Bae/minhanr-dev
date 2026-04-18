import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { BlogPostMeta } from "@/lib/blog";

interface WritingIndexProps {
  posts: BlogPostMeta[];
  total: number;
}

/**
 * WritingIndex — numbered editorial list, no dividers.
 *
 * Vertical rhythm only, no hairlines between rows — relies on the large
 * Instrument Serif italic numerals and generous padding to define
 * structure. Each row reveals on scroll via `animation-timeline: view()`,
 * so the list builds downward as the viewer scrolls past it.
 */
export function WritingIndex({ posts, total }: WritingIndexProps) {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-6 py-20 sm:px-10 sm:py-32">
      <header className="mb-14 flex flex-col gap-3 sm:mb-20 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <p className="kicker mb-3">Writing · 02</p>
          <h2 className="display-lg font-display italic text-foreground">
            Notes from the studio.
          </h2>
        </div>
        <div className="flex items-baseline gap-6 font-technical text-[12px] uppercase tracking-[0.2em] text-muted-foreground">
          <span>
            <span className="tabular-nums text-foreground">{total}</span> pieces
          </span>
          <Link
            href="/blog"
            className="link-underline hover:text-foreground"
          >
            Index →
          </Link>
        </div>
      </header>

      <ol className="space-y-0">
        {posts.map((post, i) => {
          const n = String(i + 1).padStart(2, "0");
          return (
            <li key={post.slug} className="reveal-up">
              <Link
                href={`/blog/${post.slug}`}
                className="group grid grid-cols-[auto_1fr] items-baseline gap-6 border-t border-[var(--hairline)] py-7 sm:grid-cols-[auto_1fr_auto] sm:gap-10 sm:py-10"
              >
                <span
                  className="font-display italic tabular-nums text-muted-foreground transition-colors group-hover:text-primary"
                  style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", lineHeight: "0.9" }}
                >
                  {n}
                </span>

                <div className="min-w-0">
                  <h3
                    className="font-display italic tracking-[-0.015em] text-foreground transition-colors group-hover:text-primary"
                    style={{ fontSize: "clamp(1.25rem, 2.2vw, 1.875rem)", lineHeight: "1.15" }}
                  >
                    {post.title}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-technical text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    <time dateTime={post.date} className="tabular-nums">
                      {formatDate(post.date)}
                    </time>
                    {post.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="lowercase tracking-[0.14em] before:mr-2 before:content-['·']">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <ArrowUpRight
                  className="hidden self-center text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary sm:block"
                  strokeWidth={1.25}
                  size={28}
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
