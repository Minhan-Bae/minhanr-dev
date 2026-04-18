interface HomeStatsProps {
  workCount: number;
  writingCount: number;
  /** `YYYY.MM` — most recent publish on the site. */
  lastUpdated?: string;
}

/**
 * HomeStats — bottom-left editorial counter.
 *
 * Paired visually with `SiteColophon` in the bottom-right corner;
 * between them they bracket the viewport's footer with the site's
 * current scope. Home-only (rendered by `app/(public)/page.tsx`
 * outside the SlideDeck), fixed so it stays put while the deck
 * transforms slide to slide.
 */
export function HomeStats({ workCount, writingCount, lastUpdated }: HomeStatsProps) {
  return (
    <div
      aria-label="Site stats"
      className="pointer-events-none fixed left-[clamp(16px,2vw,32px)] bottom-[clamp(12px,1.8vh,24px)] z-40 font-technical text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:text-[11px]"
    >
      <span className="text-foreground">Selected</span>
      <span className="ml-1.5 tabular-nums text-foreground/80">
        ({String(workCount).padStart(2, "0")})
      </span>
      <span className="mx-2 opacity-40">·</span>
      <span className="text-foreground">Writing</span>
      <span className="ml-1.5 tabular-nums text-foreground/80">
        ({String(writingCount).padStart(2, "0")})
      </span>
      {lastUpdated && (
        <>
          <span className="mx-2 opacity-40">·</span>
          <span>Updated</span>
          <span className="ml-1.5 tabular-nums text-foreground/80">
            {lastUpdated}
          </span>
        </>
      )}
    </div>
  );
}
