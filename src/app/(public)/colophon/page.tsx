import Link from "next/link";
import { Radio, Layers, Zap } from "lucide-react";
import type { Metadata } from "next";
import { BRAND_IDENTITY } from "@/lib/brand/tokens";

/**
 * Colophon — the one place where the system (OIKBAS, TrinityX) is named
 * in full. This page exists so the home doesn't have to do the explaining.
 *
 * Per docs/brand-tenets.md: Tier 0 brand is the person, the system is
 * Tier 2 and only mentioned here.
 *
 * This is a Phase C stub. A richer about-page-style colophon (full agent
 * roster, axis details, build pipeline diagram) is a planned follow-up.
 */

export const metadata: Metadata = {
  title: "Colophon",
  description: BRAND_IDENTITY.manifesto,
};

const AXES = [
  {
    name: "Acquisition",
    label: "수집",
    desc: "Web, papers, news harvested by autonomous agents on a daily cadence.",
    icon: Radio,
    colorClass: "text-chart-1",
    borderClass: "border-chart-1/30",
    bgClass: "bg-chart-1/5",
  },
  {
    name: "Convergence",
    label: "수렴",
    desc: "Tag, link, summary, and synthesis passes that turn raw notes into evergreens.",
    icon: Layers,
    colorClass: "text-chart-2",
    borderClass: "border-chart-2/30",
    bgClass: "bg-chart-2/5",
  },
  {
    name: "Amplification",
    label: "확산",
    desc: "Auto-publication into the public surface (this site) and outbound channels.",
    icon: Zap,
    colorClass: "text-chart-3",
    borderClass: "border-chart-3/30",
    bgClass: "bg-chart-3/5",
  },
];

export default function ColophonPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-16 sm:py-20 space-y-16">
      {/* ── Header ── */}
      <header className="space-y-4 border-b border-[var(--hairline)] pb-10">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Colophon
        </p>
        <h1
          className="font-bold tracking-tight leading-[1.1]"
          style={{ fontSize: "var(--font-size-h1)" }}
        >
          How this site is gardened
        </h1>
        <p
          className="text-foreground/85 leading-relaxed max-w-2xl"
          style={{ fontSize: "var(--font-size-body-lg)" }}
        >
          {BRAND_IDENTITY.manifesto}
        </p>
      </header>

      {/* ── The system: OIKBAS ── */}
      <section className="space-y-6">
        <h2
          className="font-semibold tracking-tight"
          style={{ fontSize: "var(--font-size-h2)" }}
        >
          The system
        </h2>
        <p className="text-foreground/85 leading-relaxed">
          The pipeline behind <span className="font-mono text-primary">{BRAND_IDENTITY.domain}</span>{" "}
          is named <strong className="text-foreground">{BRAND_IDENTITY.system}</strong> — Open
          Intelligence Knowledge-Base Agent System. Seven autonomous agents read,
          write, and curate an Obsidian vault that lives in a private GitHub
          repository. A Next.js layer renders a thin slice of that vault as the
          public surface you are reading right now. The internal codename for
          the orchestration runtime is <span className="font-mono">{BRAND_IDENTITY.internal}</span>.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The site is intentionally not a portfolio. It is a working notebook
          with the garage door left open. See the{" "}
          <a
            href="https://github.com/Minhan-Bae/minhanr-dev/blob/main/docs/brand-tenets.md"
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            brand tenets
          </a>{" "}
          for the rules of this place.
        </p>
      </section>

      {/* ── 3 axes ── */}
      <section className="space-y-6">
        <h2
          className="font-semibold tracking-tight"
          style={{ fontSize: "var(--font-size-h2)" }}
        >
          Three axes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {AXES.map((axis) => {
            const Icon = axis.icon;
            return (
              <div
                key={axis.name}
                className={`rounded-xl border ${axis.borderClass} ${axis.bgClass} p-5 space-y-3`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${axis.colorClass}`} />
                  <span className={`text-sm font-bold ${axis.colorClass}`}>
                    {axis.name}
                  </span>
                  <span className="text-xs text-muted-foreground/70">
                    {axis.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {axis.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Voice ── */}
      <section className="space-y-6">
        <h2
          className="font-semibold tracking-tight"
          style={{ fontSize: "var(--font-size-h2)" }}
        >
          Voice
        </h2>
        <p className="text-foreground/85 leading-relaxed">
          I write in first person. Posts are dated, half-finished, and
          revised in place — the garage door stays open. When I don&rsquo;t
          know something, the page says so instead of hiding behind a
          coming-soon. When a number comes from the vault, it&rsquo;s the
          number; when it can&rsquo;t be obtained, it shows a placeholder
          rather than a lie.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The agents draft and curate, but the voice that ships to a public
          surface is mine. They are gardening tools, not ghostwriters.
        </p>
      </section>

      {/* ── Stack ── */}
      <section className="space-y-6">
        <h2
          className="font-semibold tracking-tight"
          style={{ fontSize: "var(--font-size-h2)" }}
        >
          Stack
        </h2>
        <ul className="text-sm text-muted-foreground space-y-2 font-mono">
          <li>
            <span className="text-foreground">Next.js</span> — App Router,
            Server Components, Edge runtime for OG
          </li>
          <li>
            <span className="text-foreground">Supabase</span> — auth gating
            for Tier 3 surfaces (dashboard, finance, command)
          </li>
          <li>
            <span className="text-foreground">Claude</span> — model behind
            most agent reasoning
          </li>
          <li>
            <span className="text-foreground">GitHub Actions</span> — vault
            sync, blog auto-publish, scheduled harvests
          </li>
          <li>
            <span className="text-foreground">Vercel</span> — host, OG image
            generation, ISR
          </li>
        </ul>
      </section>

      {/* ── Subscribe ── */}
      <section className="space-y-4">
        <h2
          className="font-semibold tracking-tight"
          style={{ fontSize: "var(--font-size-h2)" }}
        >
          Subscribe
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          New posts are syndicated as RSS at{" "}
          <a
            href="/feed.xml"
            className="text-primary hover:underline font-mono"
          >
            /feed.xml
          </a>{" "}
          for readers who already speak the language of feeds. There is no
          newsletter — the linear feed is a 2nd-class surface here, the
          home index is the canonical entry point.
        </p>
      </section>

      {/* ── Back link ── */}
      <div className="border-t border-[var(--hairline)] pt-8">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-primary transition-colors font-mono"
        >
          ← back to {BRAND_IDENTITY.domain}
        </Link>
      </div>
    </div>
  );
}
