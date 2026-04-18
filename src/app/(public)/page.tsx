import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getAllPosts } from "@/lib/blog";
import { getSelectedWork } from "@/lib/work";
import { BRAND_IDENTITY } from "@/lib/brand/tokens";
import { WorkCover } from "@/components/work-cover";
import { NotesGraph } from "@/components/notes-graph";

/**
 * Home — editorial portfolio index, per brand-tenets v2.
 * Korean-first copy. Latin wordmark treated as a secondary typographic
 * line, not the lede.
 *
 *   1. Masthead        — Korean name (hero) + Latin subtitle + intro
 *   2. Selected Work   — curator-ordered asymmetric case grid
 *   3. Selected Writing — 3 most recent posts
 *   4. Contact         — one direct line
 */
export default function Home() {
  const selected = getSelectedWork();
  const allPosts = getAllPosts();
  const recentPosts = allPosts.slice(0, 3);

  return (
    <>
      {/* ─── 1. Masthead ────────────────────────────────────────────── */}
      <section className="relative mx-auto w-full max-w-[1440px] px-6 pt-20 pb-16 sm:px-10 sm:pt-28 sm:pb-24">
        {/* Teal keyline bar — brand signature */}
        <div
          aria-hidden
          className="absolute left-6 top-20 h-20 w-[3px] bg-primary sm:left-10 sm:top-28 sm:h-24"
        />

        <div className="ml-8 sm:ml-12">
          <p className="kicker mb-6">2026 · {BRAND_IDENTITY.role}</p>
          <h1
            className="font-display leading-[1.05] tracking-[-0.03em]"
            style={{ fontSize: "var(--font-size-display)" }}
          >
            {BRAND_IDENTITY.studio}
            <span className="text-muted-foreground">.dev</span>
          </h1>
          <p className="mt-6 max-w-xl font-technical text-[15px] leading-[1.7] text-muted-foreground sm:mt-8 sm:text-base">
            인공지능과 시각 시스템 사이에서 일하는 작은 스튜디오입니다.
            장인이 쓰는 연장처럼 읽히는 도구를 만들고, 완성된 상태로
            공개할 수 있는 작업만 이곳에 둡니다.
          </p>
        </div>
      </section>

      {/* ─── 2. Notes constellation — interactive vault map ─────────── */}
      <section className="hairline-t mx-auto w-full max-w-[1440px] px-6 py-12 sm:px-10 sm:py-16">
        <header className="mb-6 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <p className="kicker mb-3">노트 지도 · Notes</p>
            <h2
              className="font-display tracking-[-0.02em]"
              style={{ fontSize: "var(--font-size-h2)" }}
            >
              스튜디오의 노트들.
            </h2>
          </div>
          <p className="font-technical max-w-md text-[12px] leading-relaxed text-muted-foreground sm:text-right">
            색은 카테고리, 거리는 시간입니다. 점 위에 커서를 올리면
            같은 태그끼리 연결되고, 클릭하면 그 글이 열립니다.
            중앙의 다섯 점은 공개되지 않은 카테고리입니다.
          </p>
        </header>
        <NotesGraph posts={allPosts} />
      </section>

      {/* ─── 3. Selected Work ────────────────────────────────────────── */}
      <section className="hairline-y mx-auto w-full max-w-[1440px] px-6 py-16 sm:px-10 sm:py-24">
        <header className="mb-12 flex items-baseline justify-between sm:mb-20">
          <div>
            <p className="kicker mb-3">선별 작업 · Selected Work</p>
            <h2
              className="font-display tracking-[-0.02em]"
              style={{ fontSize: "var(--font-size-h2)" }}
            >
              실제로 출시된 것들.
            </h2>
          </div>
          <Link
            href="/work"
            className="font-technical link-underline hidden text-sm text-muted-foreground hover:text-foreground sm:inline-block"
          >
            작업 전체 보기
          </Link>
        </header>

        <div className="grid gap-x-8 gap-y-16 sm:grid-cols-12 sm:gap-y-24">
          {selected.map((item, i) => {
            // Asymmetric editorial grid
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
                      <p className="font-technical mt-1 text-[12px] uppercase tracking-[0.16em] text-muted-foreground">
                        {item.discipline} · {item.year}
                      </p>
                      <p className="mt-4 max-w-prose text-[15px] leading-[1.65] text-muted-foreground">
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
            작업 전체 보기
          </Link>
        </div>
      </section>

      {/* ─── 3. Selected Writing ────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-[1440px] px-6 py-16 sm:px-10 sm:py-24">
        <header className="mb-12 flex items-baseline justify-between">
          <div>
            <p className="kicker mb-3">글 · Writing</p>
            <h2
              className="font-display tracking-[-0.02em]"
              style={{ fontSize: "var(--font-size-h2)" }}
            >
              스튜디오의 메모.
            </h2>
          </div>
          <Link
            href="/blog"
            className="font-technical link-underline hidden text-sm text-muted-foreground hover:text-foreground sm:inline-block"
          >
            전체 글
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
                    className="font-display tracking-[-0.01em] leading-snug transition-colors group-hover:text-primary"
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
            전체 글
          </Link>
        </div>
      </section>

    </>
  );
}

/** YYYY-MM-DD → "2026.03.22" short date stamp. Korean-friendly. */
function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return iso;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}
