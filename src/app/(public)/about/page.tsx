import type { Metadata } from "next";
import { BRAND_IDENTITY } from "@/lib/brand/tokens";
import { TypewriterLoop } from "@/components/typewriter-loop";
import { SlideDeck } from "@/components/slide-deck";

export const metadata: Metadata = {
  title: "About",
  description: `${BRAND_IDENTITY.domain} — ${BRAND_IDENTITY.role}.`,
  openGraph: {
    title: `About — ${BRAND_IDENTITY.studio}`,
    description: BRAND_IDENTITY.manifestoEn,
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
};

/**
 * /about — four-slide PowerPoint deck.
 *
 *   1. Masthead   — wordmark + role (boomerang typewriter, same hero
 *                   vocabulary as the home)
 *   2. Bio        — three drop-cap paragraphs
 *   3. Practice   — three areas of work (kicker + dl grid)
 *   4. Closer     — one-line manifesto over colophon footnote; the
 *                   SiteDock + SiteColophon already cover nav+©, so
 *                   the old "Elsewhere" nav rail is gone.
 *
 * Each slide reserves `pb-[clamp(140px,18vh,200px)]` so the bottom-
 * anchored chrome (dock, colophon, theme toggle) never overlaps
 * content, matching the home vocabulary.
 */
const SLIDE_PB = "pb-[clamp(140px,18vh,200px)]";

export default function AboutPage() {
  return (
    <SlideDeck>
      <MastheadSlide />
      <BioSlide />
      <PracticeSlide />
      <CloserSlide />
    </SlideDeck>
  );
}

function MastheadSlide() {
  return (
    <section
      data-slide
      className={`slide relative mx-auto flex w-full max-w-[1440px] flex-col justify-center px-6 sm:px-10 ${SLIDE_PB}`}
    >
      <div
        aria-hidden
        className="animate-fade-in absolute left-6 top-[38%] h-24 w-[3px] bg-primary sm:left-10"
        style={{ animationDelay: "360ms" }}
      />
      <div className="ml-8 sm:ml-12">
        <p className="kicker mb-5 animate-fade-up" style={{ animationDelay: "0ms" }}>
          About
        </p>
        <TypewriterLoop
          as="h1"
          lang="en"
          text={BRAND_IDENTITY.studio}
          typeDelay={140}
          eraseDelay={70}
          holdMs={5000}
          pauseMs={900}
          sfx
          className="font-display italic leading-[1.05] tracking-[-0.03em] block"
          style={{ fontSize: "var(--font-size-display)" }}
        />
        <p
          className="mt-6 font-technical text-[15px] text-muted-foreground sm:text-base animate-fade-up"
          style={{ animationDelay: "240ms" }}
        >
          {BRAND_IDENTITY.role}
        </p>
      </div>
    </section>
  );
}

function BioSlide() {
  return (
    <section
      data-slide
      className={`slide hairline-t relative mx-auto flex w-full max-w-[900px] flex-col justify-center px-6 sm:px-10 ${SLIDE_PB}`}
    >
      <p className="kicker mb-6">Bio</p>
      <div className="space-y-6 text-[15px] leading-[1.8] text-foreground/90 sm:text-[17px] sm:leading-[1.85]">
        <p className="drop-cap">
          {BRAND_IDENTITY.studio}.dev is a one-person studio designing
          and building the tools that sit between people and machines.
          AI research systems, production pipelines, and editorial
          surfaces like the one you&apos;re reading — a single practice,
          not a discipline list.
        </p>
        <p>
          Most projects fold two problems into one. A good research
          tool is a good production tool; a good production tool shapes
          taste; and taste, eventually, ships. I work where those three
          don&apos;t fight each other.
        </p>
        <p>
          Writing goes up only when there&apos;s something specific that&apos;s
          useful to someone else. A finished perspective saves more
          time than a running commentary on process.
        </p>
      </div>
    </section>
  );
}

function PracticeSlide() {
  return (
    <section
      data-slide
      className={`slide hairline-t relative mx-auto flex w-full max-w-[1440px] flex-col justify-center px-6 sm:px-10 ${SLIDE_PB}`}
    >
      <div className="grid gap-10 sm:grid-cols-12 sm:gap-16">
        <div className="sm:col-span-4">
          <p className="kicker mb-3">Practice</p>
          <h2
            className="font-display italic tracking-[-0.025em] text-foreground"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: "1.02" }}
          >
            Three areas.
          </h2>
          <p className="mt-6 max-w-sm text-[13px] leading-[1.7] text-muted-foreground">
            Next.js + React on Vercel&apos;s edge; Instrument Serif for
            Latin, Pretendard for Hangul, Geist Mono for labels. Palette
            mapped in OKLCH across the rain-glass quartet.
          </p>
        </div>
        <div className="sm:col-span-8">
          <dl className="divide-y divide-[var(--hairline)] hairline-t hairline-b">
            {PRACTICE.map((p) => (
              <div
                key={p.label}
                className="grid gap-3 py-6 sm:grid-cols-[160px_1fr] sm:gap-10 sm:py-7"
              >
                <dt className="font-technical text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {p.label}
                </dt>
                <dd className="text-[14px] leading-[1.7] text-foreground/90 sm:text-[15px]">
                  {p.body}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function CloserSlide() {
  return (
    <section
      data-slide
      className={`slide hairline-t relative mx-auto flex w-full max-w-[1440px] items-center px-6 sm:px-10 ${SLIDE_PB}`}
    >
      <div className="w-full">
        <p className="kicker mb-5">Closer</p>
        <p
          className="font-display italic leading-[1.08] tracking-[-0.02em] text-foreground"
          style={{ fontSize: "clamp(2.25rem, 6vw, 5rem)" }}
        >
          Read the writing if you like —<br />
          but please look at the work.
        </p>
        <p className="mt-8 max-w-xl text-[14px] leading-[1.7] text-muted-foreground sm:text-[15px]">
          The content model is deliberately conservative — every work
          piece and post is hand-committed to version control, no live
          database faces the public. What&apos;s shown is shown; the rest
          stays in the studio.
        </p>
      </div>
    </section>
  );
}

const PRACTICE = [
  {
    label: "AI Research",
    body:
      "Agent systems, retrieval, and the less glamorous infrastructure that keeps them running. The research I care about is the kind that eventually ships.",
  },
  {
    label: "Creative R&D",
    body:
      "Pipelines, shaders, and generative-model integration inside the studio graph. A good production tool disappears the moment the artist opens it.",
  },
  {
    label: "Editorial Systems",
    body:
      "Websites, design systems, and publications built for practitioners. The site you're reading is one of them.",
  },
];
