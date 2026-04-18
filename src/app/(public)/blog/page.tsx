import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { BlogList } from "@/components/blog-list";
import { NotesGraph } from "@/components/notes-graph";
import { Typewriter } from "@/components/typewriter";

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
 * /blog — archive surface. Intentionally NOT a SlideDeck.
 *
 * This page is browse-oriented: search, filter, read. Forcing the
 * home's wheel-locked slide navigation would get in the way of the
 * primary action (scanning 119 posts). Instead the page is a
 * three-section vertical flow with motion provided by:
 *
 *   • Typewriter on the hero H1 (keeps the identity entry beat)
 *   • Scroll-driven reveal on the sections below the fold
 *   • `animation-timeline: view()` section entries feel like a
 *     gentle "section change" without any scroll hijacking
 *
 * The full-width SlideDeck lives on / and /work and /about where the
 * content naturally fits a slide structure.
 */
export default function WritingIndex() {
  const posts = getAllPosts();

  return (
    <>
      {/* ─── Masthead ─────────────────────────────────────────────── */}
      <section className="relative mx-auto w-full max-w-[1440px] px-6 pt-20 pb-16 sm:px-10 sm:pt-28 sm:pb-20">
        <div
          aria-hidden
          className="animate-fade-in absolute left-6 top-20 h-20 w-[3px] bg-primary sm:left-10 sm:top-28"
          style={{ animationDelay: "360ms" }}
        />
        <div className="ml-8 sm:ml-12">
          <p
            className="kicker mb-5 animate-fade-up"
            style={{ animationDelay: "0ms" }}
          >
            Writing · {posts.length} pieces
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
              {posts.length}
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

      {/* ─── Notes map ────────────────────────────────────────────── */}
      <section className="hairline-t mx-auto w-full max-w-[1440px] px-6 py-12 sm:px-10 sm:py-16 reveal-up">
        <header className="mb-6 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <p className="kicker mb-3">Notes map</p>
            <h2
              className="font-display italic tracking-[-0.02em]"
              style={{ fontSize: "var(--font-size-h2)" }}
            >
              How these pieces call each other.
            </h2>
          </div>
          <p className="font-technical max-w-md text-[12px] leading-relaxed text-muted-foreground sm:text-right">
            Each node is one piece; colour marks the practice area.
            Drag, hover, click.
          </p>
        </header>
        <div className="graph-panel relative overflow-hidden rounded-lg border border-[var(--hairline)]">
          <NotesGraph posts={posts} />
        </div>
      </section>

      {/* ─── Index ────────────────────────────────────────────────── */}
      <section className="hairline-t mx-auto w-full max-w-[1440px] space-y-8 px-6 py-12 sm:px-10 sm:py-16 reveal-up">
        <BlogList posts={posts} />
      </section>
    </>
  );
}
