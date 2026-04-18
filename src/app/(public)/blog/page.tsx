import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getAllPosts } from "@/lib/blog";
import type { BlogPostMeta } from "@/lib/blog";
import { getAllTags, getAllYears } from "@/lib/blog-taxonomy";
import { NotesGraph } from "@/components/notes-graph";
import { TypewriterLoop } from "@/components/typewriter-loop";
import { SlideDeck } from "@/components/slide-deck";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Notes from the studio — AI systems, creative R&D, and editorial engineering.",
  openGraph: {
    title: "Writing — minhanr.dev",
    description:
      "Notes from the studio — AI systems, creative R&D, and editorial engineering.",
    type: "website",
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Writing — minhanr.dev",
    description:
      "Notes from the studio — AI systems, creative R&D, and editorial engineering.",
    images: ["/api/og"],
  },
};

/**
 * /blog — landing deck, three slides.
 *
 *   1. Masthead    — boomerang typewriter hero + framing
 *   2. Notes map   — force-directed NotesGraph on a dark glass panel
 *   3. Explore     — tag cloud · year jumps · latest 3 · archive CTA
 *
 * Every slide reserves `pb-[clamp(140px,18vh,200px)]` so the four-
 * corner chrome (dock + colophon + theme toggle + wordmark) never
 * covers content, matching the home deck's vocabulary exactly.
 */
const SLIDE_PB = "pb-[clamp(140px,18vh,200px)]";

export default function WritingIndex() {
  const posts = getAllPosts();
  const tags = getAllTags().slice(0, 18);
  const years = getAllYears();
  const latest = posts.slice(0, 3);

  return (
    <SlideDeck>
      <MastheadSlide postCount={posts.length} />
      <NotesMapSlide posts={posts} />
      <ExploreSlide
        postCount={posts.length}
        tags={tags}
        years={years}
        latest={latest}
      />
    </SlideDeck>
  );
}

function MastheadSlide({ postCount }: { postCount: number }) {
  return (
    <section
      data-slide
      className={`slide relative mx-auto flex w-full max-w-[1440px] flex-col justify-center px-6 sm:px-10 ${SLIDE_PB}`}
    >
      <div
        aria-hidden
        className="animate-fade-in absolute left-6 top-[36%] h-20 w-[3px] bg-primary sm:left-10"
        style={{ animationDelay: "360ms" }}
      />
      <div className="ml-8 sm:ml-12">
        <p
          className="kicker mb-5 animate-fade-up"
          style={{ animationDelay: "0ms" }}
        >
          Writing · {postCount} pieces
        </p>
        <TypewriterLoop
          as="h1"
          lang="en"
          text="Notes from the studio."
          typeDelay={60}
          eraseDelay={28}
          holdMs={5000}
          pauseMs={900}
          className="font-display italic leading-[1.1] tracking-[-0.02em] block"
          style={{ fontSize: "var(--font-size-h1)" }}
        />
        <p
          className="mt-6 max-w-xl text-[15px] leading-[1.7] text-muted-foreground sm:text-base animate-fade-up"
          style={{ animationDelay: "240ms" }}
        >
          Essays on AI systems, production pipelines, and the tools
          that sit between them —{" "}
          <span className="font-technical tabular-nums text-foreground">
            {postCount}
          </span>{" "}
          pieces.
        </p>
      </div>
    </section>
  );
}

function NotesMapSlide({ posts }: { posts: BlogPostMeta[] }) {
  return (
    <section
      data-slide
      className={`slide hairline-t relative mx-auto flex w-full max-w-[1440px] flex-col justify-center px-6 pt-[clamp(24px,4vh,48px)] sm:px-10 ${SLIDE_PB}`}
    >
      <header className="mb-5 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <p className="kicker mb-2">Notes map</p>
          <h2
            className="font-display italic tracking-[-0.02em]"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
          >
            How these pieces call each other.
          </h2>
        </div>
        <p className="font-technical max-w-sm text-[11px] leading-relaxed text-muted-foreground sm:text-right">
          Each node is one piece; colour marks the practice area.
          Drag, hover, click.
        </p>
      </header>
      <div className="graph-panel relative flex-1 overflow-hidden rounded-lg border border-[var(--hairline)]">
        <NotesGraph posts={posts} />
      </div>
    </section>
  );
}

interface ExploreSlideProps {
  postCount: number;
  tags: ReturnType<typeof getAllTags>;
  years: ReturnType<typeof getAllYears>;
  latest: BlogPostMeta[];
}

function ExploreSlide({ postCount, tags, years, latest }: ExploreSlideProps) {
  return (
    <section
      data-slide
      className={`slide hairline-t relative mx-auto flex w-full max-w-[1440px] flex-col justify-center px-6 pt-[clamp(24px,4vh,48px)] sm:px-10 ${SLIDE_PB}`}
    >
      <header className="mb-8 flex flex-col gap-3 sm:mb-12 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <p className="kicker mb-3">Explore</p>
          <h2
            className="font-display italic tracking-[-0.025em] text-foreground"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: "1.02" }}
          >
            Pick an entry point.
          </h2>
        </div>
        <Link
          href="/blog/archive"
          className="font-technical inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.18em] text-foreground transition-colors hover:text-primary"
        >
          <span className="link-underline">All {postCount} pieces</span>
          <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
        </Link>
      </header>

      <div className="grid gap-8 sm:grid-cols-12 sm:gap-12">
        {/* Tag cloud */}
        <div className="sm:col-span-6">
          <p className="kicker mb-3">By tag</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 leading-none">
            {tags.map((t) => {
              const size = 0.85 + Math.log2(1 + t.count) * 0.3;
              return (
                <li key={t.slug}>
                  <Link
                    href={`/blog/tag/${t.slug}`}
                    className="font-display italic text-foreground/85 transition-colors hover:text-primary"
                    style={{ fontSize: `${size.toFixed(2)}rem` }}
                  >
                    {t.tag}
                    <span className="ml-1 align-super font-technical text-[9px] not-italic tracking-[0.16em] text-muted-foreground">
                      {t.count}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href="/blog/tags"
            className="link-underline mt-4 inline-block font-technical text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
          >
            All tags →
          </Link>
        </div>

        {/* Year + Latest */}
        <div className="sm:col-span-6 space-y-8">
          <div>
            <p className="kicker mb-3">By year</p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 font-display italic">
              {years.map((y) => (
                <li key={y.year}>
                  <Link
                    href={`/blog/archive/${y.year}`}
                    className="text-foreground/85 transition-colors hover:text-primary"
                    style={{ fontSize: "clamp(1.25rem, 2.2vw, 1.75rem)" }}
                  >
                    {y.year}
                    <span className="ml-1 align-super font-technical text-[9px] not-italic tracking-[0.16em] text-muted-foreground">
                      {y.count}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="kicker mb-3">Latest</p>
            <ol className="divide-y divide-[var(--hairline)] hairline-t">
              {latest.map((post, i) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-4 py-3 transition-colors hover:text-primary"
                  >
                    <span className="font-display italic tabular-nums text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-display italic tracking-[-0.01em] text-foreground transition-colors group-hover:text-primary" style={{ fontSize: "clamp(0.95rem, 1.4vw, 1.15rem)", lineHeight: "1.3" }}>
                      {post.title}
                    </h3>
                    <ArrowUpRight
                      className="text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                      strokeWidth={1.25}
                      size={14}
                    />
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
