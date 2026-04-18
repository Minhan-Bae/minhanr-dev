import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { BRAND_IDENTITY } from "@/lib/brand/tokens";

export const metadata: Metadata = {
  title: "About",
  description: `${BRAND_IDENTITY.person} — ${BRAND_IDENTITY.role}.`,
  openGraph: {
    title: `About — ${BRAND_IDENTITY.person}`,
    description: BRAND_IDENTITY.manifesto,
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
          className="absolute left-6 top-20 h-20 w-[3px] bg-primary sm:left-10 sm:top-28"
        />
        <div className="ml-8 sm:ml-12">
          <p className="kicker mb-5">About</p>
          <h1
            className="font-display leading-[0.95] tracking-[-0.03em]"
            style={{ fontSize: "var(--font-size-display)" }}
          >
            {BRAND_IDENTITY.person}
          </h1>
          <p className="mt-6 font-technical text-base text-muted-foreground sm:text-lg">
            {BRAND_IDENTITY.role}.
          </p>
        </div>
      </section>

      {/* ─── Bio ──────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-[900px] px-6 py-16 sm:px-10 sm:py-20">
        <div className="space-y-8 text-lg leading-[1.7] text-foreground/90 sm:text-xl">
          <p className="drop-cap">
            I design and build tools that sit between artists and machines —
            research systems for AI, pipelines for VFX, small editorial
            surfaces like the one you are reading. The practice is a single
            studio, not a list of roles.
          </p>
          <p>
            My work tends to collapse two problems into one. A good research
            tool is a production tool; a good production tool is a taste-maker;
            a good taste-maker ships. I build for the place where those three
            stop fighting each other.
          </p>
          <p>
            I write when a finding is concrete enough to be useful to someone
            else, and I publish under my own name because anonymity in this
            field has never paid.
          </p>
        </div>
      </section>

      {/* ─── Practice ─────────────────────────────────────────────── */}
      <section className="hairline-t mx-auto w-full max-w-[1440px] px-6 py-20 sm:px-10 sm:py-28">
        <div className="grid gap-12 sm:grid-cols-12 sm:gap-16">
          <div className="sm:col-span-4">
            <p className="kicker mb-3">Practice</p>
            <h2
              className="font-display tracking-[-0.02em]"
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
                  className="grid gap-4 py-8 sm:grid-cols-[160px_1fr] sm:gap-10"
                >
                  <dt className="font-technical text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {p.label}
                  </dt>
                  <dd className="text-base leading-relaxed text-foreground/90 sm:text-lg">
                    {p.body}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ─── Colophon ─────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-[1440px] px-6 py-20 sm:px-10 sm:py-28">
        <div className="grid gap-12 sm:grid-cols-12 sm:gap-16">
          <div className="sm:col-span-4">
            <p className="kicker mb-3">Colophon</p>
            <h2
              className="font-display tracking-[-0.02em]"
              style={{ fontSize: "var(--font-size-h2)" }}
            >
              How this site is made.
            </h2>
          </div>
          <div className="sm:col-span-8 space-y-6 text-base leading-relaxed text-foreground/90 sm:text-lg">
            <p>
              Built with Next.js and React on Vercel's edge. Typeset in
              Instrument Serif for display, Geist for running text, and
              Geist Mono for labels and timestamps. The palette is a 2026
              quartet — Cloud Dancer off-white, Phthalo Green ground,
              Transformative Teal keyline, Divine Damson warm accent —
              chosen for the way they read across dark and paper backgrounds
              without reaching for neon.
            </p>
            <p>
              The content model is deliberate. Every piece of work and every
              essay is lifted into version control by hand. There is no
              live database rendering on the public surface — what you see
              is what has been chosen to be seen.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Contact ──────────────────────────────────────────────── */}
      <section className="hairline-t mx-auto w-full max-w-[1440px] px-6 py-20 sm:px-10 sm:py-28">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="kicker mb-3">Elsewhere</p>
            <p
              className="font-display tracking-[-0.02em]"
              style={{ fontSize: "var(--font-size-h2)" }}
            >
              Write, or don't —<br />but do look at the work.
            </p>
          </div>
          <ul className="font-technical flex flex-wrap gap-6 text-[13px] uppercase tracking-[0.16em] text-muted-foreground">
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
      "Agent systems, retrieval, and the boring infrastructure that makes them reliable. The research I care about is the kind that ends up in production.",
  },
  {
    label: "VFX R&D",
    body:
      "Pipelines, shader work, and generative-model integration for studios. I believe a VFX tool is a writing instrument — it should disappear once an artist opens it.",
  },
  {
    label: "Editorial systems",
    body:
      "Websites, design systems, and publications for practitioners. The site you are on is one.",
  },
];

const LINKS = [
  { label: "Writing", href: "/blog", external: false },
  { label: "Work", href: "/work", external: false },
  { label: "GitHub", href: "https://github.com/Minhan-Bae", external: true },
  { label: "RSS", href: "/feed.xml", external: false },
];
