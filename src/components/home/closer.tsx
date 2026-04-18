import Link from "next/link";
import { BRAND_IDENTITY } from "@/lib/brand/tokens";

/**
 * Closer — final slide. Oversized italic manifesto with a hanging
 * Damson quotation mark; nav rail across the bottom.
 */
export function Closer() {
  return (
    <section
      data-slide
      className="slide relative mx-auto flex w-full max-w-[1440px] flex-col justify-between px-6 py-12 sm:px-10 sm:py-20"
    >
      <div className="flex flex-1 items-center">
        <div className="relative">
          <span
            aria-hidden
            className="font-display italic absolute -left-2 -top-14 select-none text-accent/80 sm:-left-6 sm:-top-20"
            style={{
              fontSize: "clamp(7rem, 16vw, 14rem)",
              lineHeight: "0.8",
            }}
          >
            &ldquo;
          </span>

          <blockquote
            className="relative max-w-[18ch] font-display italic tracking-[-0.025em] text-foreground sm:max-w-[22ch]"
            style={{
              fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
              lineHeight: "1.05",
            }}
          >
            {BRAND_IDENTITY.manifestoEn}
          </blockquote>

          <p className="mt-10 font-technical text-[11px] uppercase tracking-[0.22em] text-muted-foreground sm:mt-12">
            — {BRAND_IDENTITY.studio}.dev · brand tenets v2
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-4 border-t border-[var(--hairline)] pt-6 font-technical text-[12px] uppercase tracking-[0.2em]">
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <Link
            href="/work"
            className="link-underline text-foreground hover:text-primary"
          >
            Work →
          </Link>
          <Link
            href="/blog"
            className="link-underline text-foreground hover:text-primary"
          >
            Writing →
          </Link>
          <Link
            href="/about"
            className="link-underline text-foreground hover:text-primary"
          >
            About →
          </Link>
        </div>
        <div className="text-[10px] tabular-nums text-muted-foreground">
          © {new Date().getFullYear()} {BRAND_IDENTITY.domain}
        </div>
      </div>
    </section>
  );
}
