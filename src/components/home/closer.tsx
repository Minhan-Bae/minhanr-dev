import Link from "next/link";
import { BRAND_IDENTITY } from "@/lib/brand/tokens";

/**
 * Closer — manifesto pull-quote as the last section before the footer.
 *
 * Aggressive editorial: oversized italic serif, hanging quotation mark
 * in Divine Damson, and a single CTA link below. Full-width, no grid.
 * Scroll-driven reveal via `animation-timeline: view()`.
 */
export function Closer() {
  return (
    <section className="relative mx-auto w-full max-w-[1440px] px-6 py-28 sm:px-10 sm:py-40">
      <div className="relative">
        <span
          aria-hidden
          className="font-display italic absolute -left-2 -top-16 select-none text-accent/80 sm:-left-6 sm:-top-24"
          style={{ fontSize: "clamp(8rem, 18vw, 16rem)", lineHeight: "0.8" }}
        >
          &ldquo;
        </span>

        <blockquote className="reveal-up relative max-w-[18ch] font-display italic tracking-[-0.025em] text-foreground sm:max-w-[20ch]"
          style={{ fontSize: "clamp(2.5rem, 7.5vw, 6rem)", lineHeight: "1.05" }}
        >
          {BRAND_IDENTITY.manifesto}
        </blockquote>

        <p className="reveal-up mt-12 font-technical text-[11px] uppercase tracking-[0.22em] text-muted-foreground sm:mt-16">
          — {BRAND_IDENTITY.studio}.dev · brand tenets v2
        </p>
      </div>

      <div className="reveal-up mt-16 flex flex-wrap gap-x-10 gap-y-4 border-t border-[var(--hairline)] pt-10 font-technical text-[13px] uppercase tracking-[0.2em] sm:mt-24">
        <Link href="/work" className="link-underline text-foreground hover:text-primary">
          작업 →
        </Link>
        <Link href="/blog" className="link-underline text-foreground hover:text-primary">
          글 →
        </Link>
        <Link href="/about" className="link-underline text-foreground hover:text-primary">
          소개 →
        </Link>
      </div>
    </section>
  );
}
