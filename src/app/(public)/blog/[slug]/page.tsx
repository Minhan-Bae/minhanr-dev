import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import {
  getPostBySlug,
  getAllSlugs,
  getAllPosts,
  extractHeadings,
} from "@/lib/blog";
import { ReadingProgress } from "@/components/reading-progress";
import { RelatedPosts } from "@/components/related-posts";
import { TableOfContents } from "@/components/toc";
import { RevealOnScroll } from "@/components/reveal-on-scroll";

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };

  const title = post.title;
  const description = post.summary || post.title;
  const category = post.categories[0] ?? "Writing";
  const ogSearch = new URLSearchParams({
    variant: "note",
    title: post.title,
    category,
    date: post.date,
  }).toString();

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.date,
      authors: [post.author || "minhanr"],
      images: [{ url: `/api/og?${ogSearch}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og?${ogSearch}`],
    },
  };
}

function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, "");
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

/** ISO YYYY-MM-DD → "2026년 3월 22일" — Korean long form */
function formatLongDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const readingTime = estimateReadingTime(post.content);
  const headings = extractHeadings(post.content);
  const allPosts = getAllPosts();
  const primaryCategory = post.categories[0];

  return (
    <>
      <ReadingProgress />

      {/* ─── Masthead ─────────────────────────────────────────────── */}
      <section className="relative mx-auto w-full max-w-[1440px] px-6 pt-12 sm:px-10 sm:pt-16">
        <Link
          href="/blog"
          className="font-technical inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          전체 글
        </Link>

        <div className="mx-auto mt-10 max-w-[900px] sm:mt-16">
          <p className="kicker mb-5">
            {primaryCategory ?? "Writing"} · {formatLongDate(post.date)} ·{" "}
            {readingTime}분
          </p>
          <h1
            className="font-display leading-[1.15] tracking-[-0.02em]"
            style={{ fontSize: "var(--font-size-h1)" }}
          >
            {post.title}
          </h1>
          {post.summary && (
            <p className="mt-6 font-display italic text-lg leading-snug text-muted-foreground sm:text-xl">
              {post.summary}
            </p>
          )}
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-technical text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
            <span>글 {post.author || "minhanr"}</span>
            {post.tags.length > 0 && (
              <span className="flex gap-x-3">
                {post.tags.slice(0, 4).map((t) => (
                  <span key={t}>#{t}</span>
                ))}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ─── Optional cover image — editorial treatment ──────────── */}
      {post.cover?.image && (
        <section className="mx-auto mt-16 w-full max-w-[1440px] px-6 sm:mt-20 sm:px-10">
          <figure className="media-zoom overflow-hidden rounded-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.cover.image}
              alt={post.cover.alt || post.title}
              className="w-full object-cover"
              style={{ aspectRatio: "21 / 9" }}
            />
          </figure>
          {post.cover.alt && (
            <figcaption className="font-technical mx-auto mt-3 max-w-[900px] text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
              {post.cover.alt}
            </figcaption>
          )}
        </section>
      )}

      {/* ─── Body ─────────────────────────────────────────────────── */}
      <section className="mx-auto mt-16 w-full max-w-[1440px] px-6 pb-24 sm:mt-20 sm:px-10 sm:pb-32">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,900px)_minmax(180px,220px)] lg:justify-center lg:gap-16">
          <RevealOnScroll as="div">
          <article
            className="prose prose-lg dark:prose-invert max-w-none
              prose-headings:font-display prose-headings:font-normal prose-headings:tracking-[-0.015em] prose-headings:text-foreground
              prose-h2:text-[clamp(1.75rem,3vw,2.25rem)] prose-h2:mt-16 prose-h2:mb-5 prose-h2:leading-tight prose-h2:scroll-mt-24
              prose-h3:text-[clamp(1.35rem,2vw,1.625rem)] prose-h3:mt-10 prose-h3:mb-3 prose-h3:scroll-mt-24
              prose-h4:text-lg prose-h4:mt-8 prose-h4:mb-2
              prose-p:text-foreground/90 prose-p:leading-[1.8] prose-p:text-[17px]
              prose-p:my-6
              prose-a:text-primary prose-a:font-medium prose-a:no-underline prose-a:[text-underline-offset:6px] hover:prose-a:underline hover:prose-a:decoration-primary/60
              prose-strong:text-foreground prose-strong:font-semibold
              prose-em:font-display prose-em:italic prose-em:text-foreground
              prose-code:font-mono prose-code:text-[0.9em] prose-code:bg-[var(--surface-2)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-sm prose-code:before:content-[''] prose-code:after:content-['']
              prose-pre:bg-[var(--surface-1)] prose-pre:border prose-pre:border-[var(--hairline)] prose-pre:rounded-md prose-pre:text-[13px] prose-pre:leading-relaxed
              prose-img:rounded-sm prose-img:border prose-img:border-[var(--hairline)]
              prose-figure:my-10
              prose-figcaption:font-technical prose-figcaption:text-xs prose-figcaption:uppercase prose-figcaption:tracking-[0.14em] prose-figcaption:text-muted-foreground
              prose-blockquote:border-l-2 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:font-display prose-blockquote:not-italic prose-blockquote:text-xl prose-blockquote:text-foreground/90 prose-blockquote:my-10
              prose-ul:my-6 prose-ol:my-6
              prose-li:text-foreground/90 prose-li:leading-[1.8]
              prose-hr:border-[var(--hairline)] prose-hr:my-14
              prose-table:text-sm prose-table:border-collapse
              prose-th:text-foreground prose-th:font-semibold prose-th:border-b prose-th:border-[var(--hairline)] prose-th:py-3 prose-th:px-4
              prose-td:border-b prose-td:border-[var(--hairline)] prose-td:py-3 prose-td:px-4"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          </RevealOnScroll>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <TableOfContents headings={headings} />
          </aside>
        </div>
      </section>

      {/* ─── Related + footer ────────────────────────────────────── */}
      <section className="hairline-t mx-auto w-full max-w-[1440px] px-6 py-20 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-[900px]">
          <RelatedPosts
            currentSlug={post.slug}
            currentCategories={post.categories}
            currentTags={post.tags}
            allPosts={allPosts}
          />
          <div className="mt-16 flex items-center justify-between">
            <Link
              href="/blog"
              className="group font-technical inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft
                className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
                strokeWidth={1.5}
              />
              전체 글
            </Link>
            <a
              href="/feed.xml"
              className="group font-technical inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
            >
              RSS 구독
              <ArrowUpRight
                className="h-4 w-4 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                strokeWidth={1.5}
              />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
