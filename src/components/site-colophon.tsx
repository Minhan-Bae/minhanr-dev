import { BRAND_IDENTITY } from "@/lib/brand/tokens";

/**
 * SiteColophon — bottom-right editorial colophon.
 *
 * Consolidates what used to live scattered across three places (the
 * Hero's top-left "Studio № 01 / Seoul · 2026" corner, the top-right
 * "AI · R&D · Studio / Est. 2020" corner, and the compact footer
 * underneath the dock) into a single two-line block pinned to the
 * bottom-right corner. Pairs visually with SeoulDatum in the
 * top-right so the viewport frame reads as a four-corner magazine
 * masthead: wordmark (TL) · datum (TR) · dock (BC) · colophon (BR).
 */
export function SiteColophon() {
  const year = new Date().getFullYear();
  return (
    <div
      aria-label="Colophon"
      className="pointer-events-none fixed right-[clamp(16px,2vw,32px)] bottom-[clamp(12px,1.8vh,24px)] z-40 flex flex-col items-end gap-0.5 font-technical text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80 sm:text-[11px]"
    >
      <div className="text-foreground/85">
        <span className="text-foreground">Studio № 01</span>
        <span className="mx-1.5 opacity-50">·</span>
        Seoul · {BRAND_IDENTITY.role}
        <span className="mx-1.5 opacity-50">·</span>
        Est. 2020
      </div>
      <div className="tabular-nums">
        © {year} {BRAND_IDENTITY.domain} · All rights reserved.
      </div>
    </div>
  );
}
