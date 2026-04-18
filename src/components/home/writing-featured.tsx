import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { BlogPostMeta } from "@/lib/blog";

interface WritingFeaturedProps {
  /** 3 posts — latest first — surfaced as the featured act of /blog. */
  posts: BlogPostMeta[];
}

/**
 * WritingFeatured — zigzag spread of the three latest posts.
 *
 * Sits between the Masthead slide and the Notes map. Each row is a
 * post: dynamic OG cover on one side (alternating left/right) and
 * the copy column on the other — kicker (category · date), display-
 * italic title, 2-line summary, and a "Read" deep link into
 * /blog/[slug]. The layout rhyme with the home's WorkZigzag is
 * intentional: selected work spreads like this on the home; selected
 * writing spreads like this on /blog.
 *
 * Fit-to-viewport: three rows with a wide 3:1 cover aspect and tight
 * vertical rhythm (`space-y-3 sm:space-y-5`) so the whole spread
 * lives in one 100svh slide without internal scroll. Bottom padding
 * reserves the chrome strip (SiteDock + footer) per the home rule.
 */
export function WritingFeatured({ posts }: WritingFeaturedProps) {
  const rows = posts.slice(0, 3);

  return (
    <section
      data-slide
      className="slide hairline-t relative mx-auto flex w-full max-w-[1440px] flex-col justify-center px-6 pt-[clamp(24px,4vh,60px)] pb-[clamp(140px,18vh,200px)] sm:px-10"
    >
      <ol className="space-y-3 sm:space-y-5">
        {rows.map((post, i) => {
          const flip = i % 2 === 1;
          const n = String(i + 1).padStart(2, "0");
          const category = post.categories[0] ?? "Writing";
          const dateLabel = formatShortDate(post.date);
          return (
            <li key={post.slug}>
              <article className="grid gap-4 md:grid-cols-12 md:gap-6">
                <div
                  className={`md:col-span-5 ${flip ? "md:order-last" : ""}`}
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="media-zoom relative block w-full overflow-hidden rounded-sm border border-[var(--hairline)] bg-[var(--surface-2)] frame-3x1"
                  >
                    {post.cover?.image ? (
                      <Image
                        src={post.cover.image}
                        alt={post.cover.alt ?? post.title}
                        fill
                        sizes="(min-width: 768px) 36vw, 100vw"
                        priority={i === 0}
                        // Skip the /_next/image proxy for these covers —
                        // they already come from the /api/og edge route
                        // pre-rendered at the right aspect, and the
                        // proxy's localPatterns matcher rejects URLs
                        // whose pathname + query combination isn't in
                        // the exact allowed shape.
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center px-4">
                        <span className="font-display italic text-muted-foreground/50 text-center text-sm">
                          {post.title}
                        </span>
                      </div>
                    )}
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
                      {category} · {dateLabel}
                    </span>
                  </div>

                  <h3
                    className="mt-2 font-display italic tracking-[-0.02em] text-foreground"
                    style={{
                      fontSize: "clamp(1.2rem, 2.1vw, 1.75rem)",
                      lineHeight: "1.15",
                    }}
                  >
                    {post.title}
                  </h3>

                  {post.summary && (
                    <p className="mt-2 line-clamp-2 max-w-prose text-[13px] leading-[1.55] text-muted-foreground sm:text-[14px]">
                      {post.summary}
                    </p>
                  )}

                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-2 inline-flex items-center gap-1.5 font-technical text-[10px] uppercase tracking-[0.2em] text-foreground hover:text-primary"
                  >
                    <span className="link-underline">Read</span>
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

function formatShortDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return iso;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}
