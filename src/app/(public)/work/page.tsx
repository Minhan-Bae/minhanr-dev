import type { Metadata } from "next";
import Link from "next/link";
import { getAllWork } from "@/lib/work";
import { Typewriter } from "@/components/typewriter";
import { SlideDeck } from "@/components/slide-deck";
import { WorkSlide } from "@/components/home/work-showcase";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected case studies — AI systems, creative R&D, editorial engineering.",
  openGraph: {
    title: "Work — minhanr.dev",
    description: "Selected case studies — AI systems, creative R&D, editorial engineering.",
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
};

/**
 * /work — same PowerPoint-style deck as /, scoped to the full work
 * list. One hero slide, then one 100svh slide per case study reusing
 * the <WorkSlide> component so /work and the home's Selected Work
 * share a single renderer.
 */
export default function WorkIndex() {
  const all = getAllWork();

  return (
    <SlideDeck>
      <WorkIndexHeroSlide count={all.length} />
      {all.map((item, i) => (
        <WorkSlide
          key={item.slug}
          item={item}
          index={i}
          total={all.length}
          flip={i % 2 === 1}
        />
      ))}
    </SlideDeck>
  );
}

function WorkIndexHeroSlide({ count }: { count: number }) {
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
          Work · {count} {count === 1 ? "piece" : "pieces"}
        </p>
        <Typewriter
          as="h1"
          lang="en"
          text="Case studies."
          stagger={80}
          delay={120}
          className="font-display italic leading-[1.1] tracking-[-0.02em] block"
          style={{ fontSize: "var(--font-size-h1)" }}
        />
        <p
          className="mt-6 max-w-xl text-[15px] leading-[1.7] text-muted-foreground sm:text-base animate-fade-up"
          style={{ animationDelay: "360ms" }}
        >
          Ordered the way I&rsquo;d walk a visitor through them — not by date,
          not by scale. How the pieces interlock is what reads first.
          Wheel, swipe, or press space to advance.
        </p>
        <Link
          href="/blog"
          className="mt-10 inline-flex font-technical text-[13px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground animate-fade-up"
          style={{ animationDelay: "480ms" }}
        >
          Or read the writing →
        </Link>
      </div>
    </section>
  );
}
