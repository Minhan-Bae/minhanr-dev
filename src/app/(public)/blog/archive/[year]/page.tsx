import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getAllYears, getPostsByYear } from "@/lib/blog-taxonomy";
import { Typewriter } from "@/components/typewriter";

export function generateStaticParams() {
  return getAllYears().map((y) => ({ year: y.year }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string }>;
}): Promise<Metadata> {
  const { year } = await params;
  const posts = getPostsByYear(year);
  if (posts.length === 0) return { title: "Archive not found" };
  return {
    title: `${year} — Archive`,
    description: `${posts.length} post${posts.length === 1 ? "" : "s"} from ${year}.`,
  };
}

function formatShortDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return iso;
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${m}.${day}`;
}

export default async function ArchiveYearPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;
  if (!/^\d{4}$/.test(year)) notFound();
  const posts = getPostsByYear(year);
  if (posts.length === 0) notFound();

  // Group by month within the year.
  const byMonth = new Map<string, typeof posts>();
  for (const p of posts) {
    const m = p.date.slice(5, 7);
    if (!byMonth.has(m)) byMonth.set(m, []);
    byMonth.get(m)!.push(p);
  }
  const months = Array.from(byMonth.keys()).sort().reverse();

  const allYears = getAllYears();

  return (
    <>
      <section className="relative mx-auto w-full max-w-[1440px] px-6 pt-20 pb-12 sm:px-10 sm:pt-28 sm:pb-16">
        <Link
          href="/blog/archive"
          className="font-technical inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          All writing
        </Link>

        <div className="mt-10">
          <div
            aria-hidden
            className="animate-fade-in h-[3px] w-20 bg-primary"
            style={{ animationDelay: "360ms" }}
          />
          <p
            className="kicker mb-5 mt-6 animate-fade-up"
            style={{ animationDelay: "0ms" }}
          >
            Archive · {posts.length} {posts.length === 1 ? "piece" : "pieces"}
          </p>
          <Typewriter
            as="h1"
            lang="en"
            text={year}
            stagger={110}
            delay={120}
            className="font-display italic leading-[1.05] tracking-[-0.03em] block tabular-nums"
            style={{ fontSize: "var(--font-size-display)" }}
          />
          {allYears.length > 1 && (
            <nav
              className="mt-6 flex flex-wrap gap-x-4 gap-y-2 font-technical text-[12px] uppercase tracking-[0.18em] text-muted-foreground animate-fade-up"
              style={{ animationDelay: "240ms" }}
            >
              {allYears.map((y) => (
                <Link
                  key={y.year}
                  href={`/blog/archive/${y.year}`}
                  className={
                    y.year === year
                      ? "text-foreground"
                      : "transition-colors hover:text-foreground"
                  }
                  aria-current={y.year === year ? "page" : undefined}
                >
                  {y.year} <span className="tabular-nums opacity-60">{y.count}</span>
                </Link>
              ))}
            </nav>
          )}
        </div>
      </section>

      <section className="hairline-t mx-auto w-full max-w-[1440px] px-6 py-12 sm:px-10 sm:py-16 reveal-up">
        {months.map((m) => {
          const monthPosts = byMonth.get(m)!;
          const label = new Date(`${year}-${m}-01T00:00:00Z`).toLocaleDateString(
            "en-US",
            { month: "long", timeZone: "UTC" }
          );
          return (
            <section key={m} className="mb-12 last:mb-0">
              <header className="mb-4 flex items-baseline justify-between border-b border-[var(--hairline)] pb-2">
                <h2 className="font-display italic text-foreground" style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)" }}>
                  {label}
                </h2>
                <span className="font-technical text-[11px] uppercase tracking-[0.18em] text-muted-foreground tabular-nums">
                  {monthPosts.length}
                </span>
              </header>
              <ol>
                {monthPosts.map((post) => (
                  <li key={post.slug}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-4 border-b border-[var(--hairline)] py-3 transition-colors hover:bg-[var(--surface-1)]"
                    >
                      <time
                        dateTime={post.date}
                        className="font-technical tabular-nums text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
                      >
                        {formatShortDate(post.date)}
                      </time>
                      <h3 className="font-display italic tracking-[-0.01em] text-foreground transition-colors group-hover:text-primary" style={{ fontSize: "clamp(0.95rem, 1.3vw, 1.15rem)", lineHeight: "1.3" }}>
                        {post.title}
                      </h3>
                      <ArrowUpRight
                        className="text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                        strokeWidth={1.25}
                        size={16}
                      />
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </section>
    </>
  );
}
