import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAllPosts } from "@/lib/blog";
import { BlogList } from "@/components/blog-list";
import { getAllYears } from "@/lib/blog-taxonomy";
import { Typewriter } from "@/components/typewriter";

export const metadata: Metadata = {
  title: "Archive",
  description:
    "The full studio archive — search, filter, and browse every post.",
};

/**
 * /blog/archive — the browsable archive, split from /blog's landing
 * deck. Every post, searchable + filterable via the existing
 * <BlogList> (search, tag/category filter, time-grouped rendering).
 * This is the page people actually read on; /blog is the cinematic
 * doorway.
 */
export default function ArchiveIndex() {
  const posts = getAllPosts();
  const years = getAllYears();

  return (
    <>
      <section className="relative mx-auto w-full max-w-[1440px] px-6 pt-20 pb-12 sm:px-10 sm:pt-28 sm:pb-16">
        <Link
          href="/blog"
          className="font-technical inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          Back to landing
        </Link>
        <div
          aria-hidden
          className="animate-fade-in mt-10 h-[3px] w-20 bg-primary"
          style={{ animationDelay: "360ms" }}
        />
        <p
          className="kicker mb-5 mt-6 animate-fade-up"
          style={{ animationDelay: "0ms" }}
        >
          Archive · {posts.length} pieces
        </p>
        <Typewriter
          as="h1"
          lang="en"
          text="Every piece."
          stagger={90}
          delay={120}
          className="font-display italic leading-[1.1] tracking-[-0.02em] block"
          style={{ fontSize: "var(--font-size-h1)" }}
        />
        <p
          className="mt-6 max-w-xl text-[15px] leading-[1.7] text-muted-foreground sm:text-base animate-fade-up"
          style={{ animationDelay: "240ms" }}
        >
          Search, filter, and browse the full studio archive. Grouped
          newest-first with month + year headers once it gets beyond
          the current quarter.
        </p>
        <nav
          className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-technical text-[12px] uppercase tracking-[0.18em] text-muted-foreground animate-fade-up"
          style={{ animationDelay: "360ms" }}
        >
          <Link href="/blog/tags" className="link-underline hover:text-foreground">
            By tag →
          </Link>
          {years.map((y) => (
            <Link
              key={y.year}
              href={`/blog/archive/${y.year}`}
              className="link-underline hover:text-foreground"
            >
              {y.year}{" "}
              <span className="tabular-nums opacity-60">{y.count}</span>
            </Link>
          ))}
        </nav>
      </section>

      <section className="hairline-t mx-auto w-full max-w-[1440px] space-y-8 px-6 py-12 sm:px-10 sm:py-16 reveal-up">
        <BlogList posts={posts} />
      </section>
    </>
  );
}
