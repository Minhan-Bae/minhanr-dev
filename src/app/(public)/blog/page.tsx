import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import type { BlogPostMeta } from "@/lib/blog";
import { BlogList } from "@/components/blog-list";
import { NotesGraph } from "@/components/notes-graph";
import { Typewriter } from "@/components/typewriter";
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
 * /blog — PowerPoint-style deck, three slides.
 *
 *   1. Masthead      — typewriter hero + tag/archive nav
 *   2. Notes map     — NotesGraph on a dark-glass panel
 *   3. Index         — full post list, scrollable inside the slide
 *
 * The list slide contains an internal scroll container so visitors
 * can browse all 119 posts without leaving the deck. SlideDeck's
 * wheel handler defers to nested scrollers so scrolling inside the
 * list doesn't advance slides; the right-side indicator dots (or
 * keyboard) handle inter-slide navigation.
 */
export default function WritingIndex() {
  const posts = getAllPosts();

  return (
    <SlideDeck>
      <MastheadSlide postCount={posts.length} />
      <NotesMapSlide posts={posts} />
      <IndexSlide posts={posts} />
    </SlideDeck>
  );
}

function MastheadSlide({ postCount }: { postCount: number }) {
  return (
    <section
      data-slide
      className="slide relative mx-auto flex w-full max-w-[1440px] flex-col justify-center px-6 sm:px-10"
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
        <Typewriter
          as="h1"
          lang="en"
          text="Notes from the studio."
          stagger={55}
          delay={120}
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
        <nav
          className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-technical text-[12px] uppercase tracking-[0.18em] text-muted-foreground animate-fade-up"
          style={{ animationDelay: "360ms" }}
        >
          <Link href="/blog/tags" className="link-underline hover:text-foreground">
            Browse tags →
          </Link>
          <Link
            href={`/blog/archive/${new Date().getFullYear()}`}
            className="link-underline hover:text-foreground"
          >
            Archive →
          </Link>
        </nav>
      </div>
    </section>
  );
}

function NotesMapSlide({ posts }: { posts: BlogPostMeta[] }) {
  return (
    <section
      data-slide
      className="slide hairline-t relative mx-auto flex w-full max-w-[1440px] flex-col justify-center px-6 py-8 sm:px-10 sm:py-12"
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

function IndexSlide({ posts }: { posts: BlogPostMeta[] }) {
  return (
    <section
      data-slide
      className="slide hairline-t relative mx-auto flex w-full max-w-[1440px] flex-col px-6 pt-10 sm:px-10 sm:pt-14"
    >
      <header className="mb-4 flex items-baseline justify-between">
        <div>
          <p className="kicker mb-1">Index</p>
          <h2
            className="font-display italic tracking-[-0.02em]"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
          >
            All writing.
          </h2>
        </div>
        <span className="font-technical tabular-nums text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {posts.length} pieces
        </span>
      </header>
      {/* Scrollable list container — SlideDeck's wheel handler defers
          to nested overflow-auto children, so scrolling here doesn't
          advance the deck. Users reach other slides via the right-
          side indicator dots or keyboard. */}
      <div className="flex-1 overflow-y-auto pb-10 pr-4">
        <BlogList posts={posts} />
      </div>
    </section>
  );
}
