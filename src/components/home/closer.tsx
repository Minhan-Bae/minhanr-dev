import { BRAND_IDENTITY } from "@/lib/brand/tokens";

/**
 * Closer — final slide. Oversized italic manifesto with a hanging
 * Amethyst quotation mark. The previous internal nav rail and
 * copyright line were removed because they duplicated the
 * SiteDock (bottom-center) and SiteColophon (bottom-right) already
 * present in the public layout.
 */
export function Closer() {
  return (
    <section
      data-slide
      className="slide relative mx-auto flex w-full max-w-[1440px] items-center px-6 pt-[clamp(40px,6vh,80px)] pb-[clamp(140px,18vh,200px)] sm:px-10"
    >
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
    </section>
  );
}
