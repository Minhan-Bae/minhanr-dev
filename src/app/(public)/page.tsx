import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getAllPosts } from "@/lib/blog";
import { getSelectedWork } from "@/lib/work";
import { BRAND_IDENTITY } from "@/lib/brand/tokens";
import { WorkCover } from "@/components/work-cover";

/**
 * Home — editorial portfolio index, per brand-tenets v2.
 *
 *   1. Masthead       — wordmark, practice, vermilion bar
 *   2. Lede           — one-sentence manifesto
 *   3. Selected Work  — curator-ordered case grid (asymmetric)
 *   4. Selected Writing — 3 most recent posts
 *   5. Contact        — one line, direct
 */
export default function Home() {
  const selected = getSelectedWork();
  const recentPosts = getAllPosts().slice(0, 3);

  return (
    <>
      {/* ─── 1. Masthead ────────────────────────────────────────────── */}
      <section className="relative mx-auto w-full max-w-[1440px] px-6 pt-20 pb-16 sm:px-10 sm:pt-32 sm:pb-24">
        {/* Vermilion accent bar */}
        <div
          aria-hidden
          className="absolute left-6 top-20 h-24 w-[3px] bg-primary sm:left-10 sm:top-32 sm:h-32"
        />

        <div className="ml-8 sm:ml-12">
          <p className="kicker mb-6">{BRAND_IDENTITY.domain}</p>
          <h1
            className="font-display leading-[0.92] tracking-[-0.03em]"
            style={{ fontSize: "var(--font-size-display)" }}
          >
            {BRAND_IDENTITY.person}
          </h1>
          <p className="mt-8 max-w-xl font-technical text-base text-muted-foreground sm:text-lg">
            <span className="text-foreground">{BRAND_IDENTITY.role}.</span>{" "}
            Selected work in intelligent systems and visual computing —
            building tools that think in the language of the craft they serve.
          </p>
        </div>
      </section>

      {/* ─── 2. Selected Work ────────────────────────────────────────── */}
      <section className="hairline-y mx-auto w-full max-w-[1440px] px-6 py-16 sm:px-10 sm:py-24">
        <header className="mb-12 flex items-baseline justify-between sm:mb-20">
          <div>
            <p className="kicker mb-3">Selected Work</p>
            <h2
              className="font-display tracking-[-0.02em]"
              style={{ fontSize: "var(--font-size-h2)" }}
            >
              Things that shipped.
            </h2>
          </div>
          <Link
            href="/work"
            className="font-technical link-underline hidden text-sm text-muted-foreground hover:text-foreground sm:inline-block"
          >
            All work
          </Link>
        </header>

        <div className="grid gap-x-8 gap-y-16 sm:grid-cols-12 sm:gap-y-24">
          {selected.map((item, i) => {
            // Asymmetric editorial grid:
            //   1st item : 7 cols (wide, leading)
            //   2nd item : 5 cols, offset top
            //   3rd item : 7 cols, offset right
            //   rest     : 6 cols each
            const layout =
              i === 0
                ? "sm:col-span-7"
                : i === 1
                ? "sm:col-span-5 sm:mt-24"
                : i === 2
                ? "sm:col-span-7 sm:col-start-6"
                : "sm:col-span-6";
            return (
              <article key={item.slug} className={layout}>
                <Link
                  href={`/work/${item.slug}`}
                  className="group block tap-scale"
                >
                  <div className="media-zoom">
                    <WorkCover
                      src={item.coverImage}
                      alt={item.coverAlt ?? item.title}
                      label={item.title}
                      sublabel={item.subject}
                      aspect={i === 0 ? "frame-4x5" : i === 2 ? "frame-16x9" : "frame-4x5"}
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      priority={i < 2}
                    />
                  </div>

                  <div className="mt-5 flex items-start justify-between gap-6">
                    <div className="min-w-0">
                      <h3
                        className="font-display tracking-[-0.015em] transition-colors group-hover:text-primary"
                        style={{ fontSize: "var(--font-size-h3)" }}
                      >
                        {item.title}
                      </h3>
                      <p className="font-technical mt-1 text-[13px] uppercase tracking-[0.16em] text-muted-foreground">
                        {item.discipline} · {item.year}
                      </p>
                      <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-muted-foreground">
                        {item.summary}
                      </p>
                    </div>
                    <ArrowUpRight
                      className="mt-1 h-5 w-5 flex-none text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                      strokeWidth={1.5}
                    />
                  </div>
                </Link>
              </article>
            );
          })}
        </div>

        <div className="mt-16 text-center sm:hidden">
          <Link
            href="/work"
            className="font-technical link-underline text-sm text-muted-foreground"
          >
            All work
          </Link>
        </div>
      </section>

      {/* ─── 3. Selected Writing ────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-[1440px] px-6 py-16 sm:px-10 sm:py-24">
        <header className="mb-12 flex items-baseline justify-between">
          <div>
            <p className="kicker mb-3">Writing</p>
            <h2
              className="font-display tracking-[-0.02em]"
              style={{ fontSize: "var(--font-size-h2)" }}
            >
              Notes from the studio.
            </h2>
          </div>
          <Link
            href="/blog"
            className="font-technical link-underline hidden text-sm text-muted-foreground hover:text-foreground sm:inline-block"
          >
            All writing
          </Link>
        </header>

        <ul className="divide-y divide-[var(--hairline)] hairline-t">
          {recentPosts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-6 py-6 transition-colors hover:bg-[var(--surface-1)]"
              >
                <time
                  dateTime={post.date}
                  className="font-technical w-20 text-[12px] uppercase tracking-[0.16em] text-muted-foreground tabular-nums"
                >
                  {formatDate(post.date)}
                </time>
                <div className="min-w-0">
                  <h3
                    className="font-display tracking-[-0.01em] transition-colors group-hover:text-primary"
                    style={{ fontSize: "var(--font-size-h4)" }}
                  >
                    {post.title}
                  </h3>
                  {post.summary && (
                    <p className="mt-1 line-clamp-1 text-[14px] text-muted-foreground">
                      {post.summary}
                    </p>
                  )}
                </div>
                <ArrowUpRight
                  className="h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                  strokeWidth={1.5}
                />
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10 text-center sm:hidden">
          <Link
            href="/blog"
            className="font-technical link-underline text-sm text-muted-foreground"
          >
            All writing
          </Link>
        </div>
      </section>

      {/* ─── 4. Contact ─────────────────────────────────────────────── */}
      <section className="hairline-t mx-auto w-full max-w-[1440px] px-6 py-20 sm:px-10 sm:py-28">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="kicker mb-3">Contact</p>
            <p
              className="font-display tracking-[-0.02em]"
              style={{ fontSize: "var(--font-size-h2)" }}
            >
              Working on something unusual?{" "}
              <Link
                href="/about"
                className="text-primary underline decoration-primary/40 underline-offset-[6px] transition hover:decoration-primary"
              >
                Let's talk.
              </Link>
            </p>
          </div>
          <div className="font-technical text-sm text-muted-foreground">
            <p>Currently based in Seoul.</p>
            <p>Open to select collaborations.</p>
          </div>
        </div>
      </section>
    </>
  );
}

/** YYYY-MM-DD → "MAR 22 '26" short editorial stamp. */
function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return iso;
  const month = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase();
  const day = String(d.getUTCDate()).padStart(2, "0");
  const year = String(d.getUTCFullYear()).slice(-2);
  return `${month} ${day} '${year}`;
}
