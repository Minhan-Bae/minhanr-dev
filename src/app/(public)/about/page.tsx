import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { BRAND_IDENTITY } from "@/lib/brand/tokens";

export const metadata: Metadata = {
  title: "소개",
  description: `${BRAND_IDENTITY.domain} — ${BRAND_IDENTITY.roleKo}.`,
  openGraph: {
    title: `About — ${BRAND_IDENTITY.studio}`,
    description: BRAND_IDENTITY.manifestoEn,
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
};

export default function AboutPage() {
  return (
    <>
      {/* ─── Masthead ──────────────────────────────────────────────── */}
      <section className="relative mx-auto w-full max-w-[1440px] px-6 pt-20 pb-12 sm:px-10 sm:pt-28">
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
            About · 소개
          </p>
          <h1
            className="font-display leading-[1.05] tracking-[-0.03em] animate-fade-up"
            style={{ fontSize: "var(--font-size-display)", animationDelay: "120ms" }}
          >
            {BRAND_IDENTITY.studio}
            <span className="text-muted-foreground">.dev</span>
          </h1>
          <p
            className="mt-6 font-technical text-[15px] text-muted-foreground sm:text-base animate-fade-up"
            style={{ animationDelay: "240ms" }}
          >
            {BRAND_IDENTITY.role}
          </p>
        </div>
      </section>

      {/* ─── Bio ──────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-[900px] px-6 py-16 sm:px-10 sm:py-20 reveal-up">
        <div className="space-y-8 text-[16px] leading-[1.85] text-foreground/90 sm:text-[17px]">
          <p className="drop-cap">
            {BRAND_IDENTITY.studio}.dev is a one-person studio designing
            and building the tools that sit between people and machines.
            AI research systems, VFX pipelines, and editorial surfaces
            like the one you're reading — a single practice, not a
            discipline list.
          </p>
          <p>
            Most projects fold two problems into one. A good research
            tool is a good production tool; a good production tool
            shapes taste; and taste, eventually, ships. I work where
            those three don't fight each other.
          </p>
          <p>
            Writing goes up only when there's something specific that's
            useful to someone else. A finished perspective saves more
            time than a running commentary on process.
          </p>
        </div>
      </section>

      {/* ─── Practice ─────────────────────────────────────────────── */}
      <section className="hairline-t mx-auto w-full max-w-[1440px] px-6 py-20 sm:px-10 sm:py-28 reveal-up">
        <div className="grid gap-12 sm:grid-cols-12 sm:gap-16">
          <div className="sm:col-span-4">
            <p className="kicker mb-3">Practice</p>
            <h2
              className="font-display italic tracking-[-0.02em]"
              style={{ fontSize: "var(--font-size-h2)" }}
            >
              Three areas.
            </h2>
          </div>
          <div className="sm:col-span-8">
            <dl className="divide-y divide-[var(--hairline)] hairline-t hairline-b">
              {PRACTICE.map((p) => (
                <div
                  key={p.label}
                  className="grid gap-4 py-8 sm:grid-cols-[160px_1fr] sm:gap-10 reveal-up"
                >
                  <dt className="font-technical text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {p.label}
                  </dt>
                  <dd className="text-[15px] leading-[1.8] text-foreground/90 sm:text-base">
                    {p.body}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ─── Colophon ─────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-[1440px] px-6 py-20 sm:px-10 sm:py-28 reveal-up">
        <div className="grid gap-12 sm:grid-cols-12 sm:gap-16">
          <div className="sm:col-span-4">
            <p className="kicker mb-3">Colophon</p>
            <h2
              className="font-display italic tracking-[-0.02em]"
              style={{ fontSize: "var(--font-size-h2)" }}
            >
              How this site was built.
            </h2>
          </div>
          <div className="sm:col-span-8 space-y-6 text-[15px] leading-[1.85] text-foreground/90 sm:text-base">
            <p>
              Next.js and React on Vercel's edge. Display Latin is
              Instrument Serif, Hangul is Pretendard Variable via
              glyph-level fallback. Geist Mono carries labels and
              timestamps.
            </p>
            <p>
              The palette is a rain-glass quartet — Overcast Mist as
              the ground, Prussian Night for the dark face, Signal
              Cobalt on the keyline, Amethyst Shadow as the cooled
              accent. Mapped in OKLCH so all three theme surfaces
              keep their contrast promises. A Canvas-2D droplet
              layer paints weather on top of the whole site.
            </p>
            <p>
              The content model is deliberately conservative. Every
              work piece and post is hand-committed to version control
              — no live database faces the public. What's shown is
              shown; the rest stays in the studio.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Contact ──────────────────────────────────────────────── */}
      <section className="hairline-t mx-auto w-full max-w-[1440px] px-6 py-20 sm:px-10 sm:py-28 reveal-up">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="kicker mb-3">Elsewhere</p>
            <p
              className="font-display italic leading-[1.2] tracking-[-0.02em]"
              style={{ fontSize: "var(--font-size-h2)" }}
            >
              Read the writing if you like —<br />
              but please look at the work.
            </p>
          </div>
          <ul className="font-technical flex flex-wrap gap-x-6 gap-y-3 text-[12px] uppercase tracking-[0.16em] text-muted-foreground">
            {LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noreferrer" : undefined}
                  className="group inline-flex items-center gap-2 transition-colors hover:text-foreground"
                >
                  {link.label}
                  {link.external && (
                    <ArrowUpRight
                      className="h-3.5 w-3.5 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      strokeWidth={1.5}
                    />
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

const PRACTICE = [
  {
    label: "AI Research",
    body:
      "Agent systems, retrieval, and the less glamorous infrastructure that keeps them running. The research I care about is the kind that eventually ships.",
  },
  {
    label: "VFX R&D",
    body:
      "Pipelines, shaders, and generative-model integration inside the studio graph. A good VFX tool disappears the moment the artist opens it.",
  },
  {
    label: "Editorial Systems",
    body:
      "Websites, design systems, and publications built for practitioners. The site you're reading is one of them.",
  },
];

const LINKS = [
  { label: "Writing", href: "/blog", external: false },
  { label: "Work", href: "/work", external: false },
  { label: "GitHub", href: "https://github.com/Minhan-Bae", external: true },
  { label: "RSS", href: "/feed.xml", external: false },
];
