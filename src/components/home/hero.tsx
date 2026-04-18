import { BRAND_IDENTITY } from "@/lib/brand/tokens";
import { TypewriterLoop } from "@/components/typewriter-loop";

interface HeroProps {
  workCount: number;
  writingCount: number;
}

/** Per-letter delay for the boomerang typewriter hero. */
const TYPE_DELAY_MS = 170;
/** Erase is snappier than typing so the word reads as being rewound. */
const ERASE_DELAY_MS = 80;
/** ms the fully-typed wordmark sits on-screen before erasing. */
const HOLD_MS = 3200;
/** ms the hero sits empty between cycles. */
const PAUSE_MS = 900;

/**
 * Hero — 100svh cinematic masthead.
 *
 * The four-corner magazine frame is provided by the public layout
 * (wordmark TL · SeoulDatum TR · SiteColophon BR · SiteDock BC), so
 * this component focuses on just the centerpiece type + a quiet
 * Selected / Writing counter rail at the bottom.
 */
export function Hero({ workCount, writingCount }: HeroProps) {
  const word = BRAND_IDENTITY.studio;

  return (
    <section
      data-slide
      className="slide relative flex w-full flex-col overflow-hidden"
    >
      {/* ─── Centerpiece wordmark ───────────────────────────────────── */}
      <div className="relative z-0 flex flex-1 items-center justify-center px-6 sm:px-10">
        <div className="relative">
          <TypewriterLoop
            as="h1"
            lang="en"
            text={word}
            typeDelay={TYPE_DELAY_MS}
            eraseDelay={ERASE_DELAY_MS}
            holdMs={HOLD_MS}
            pauseMs={PAUSE_MS}
            sfx
            className="display-hero font-display italic text-foreground"
          />

          {/* Suffix badge — picks up the teal keyline brand signature */}
          <span
            aria-hidden
            className="font-technical absolute bottom-3 right-0 translate-x-[110%] text-[11px] uppercase tracking-[0.3em] text-primary sm:text-[13px]"
          >
            .dev
          </span>

          {/* Hairline under the wordmark */}
          <span
            aria-hidden
            className="absolute -bottom-4 left-0 block h-px w-full bg-foreground/20"
          />
        </div>
      </div>

      {/* ─── Bottom rail — quiet scope counter ──────────────────────
          Left-aligned single line, well clear of the bottom-right
          SiteColophon and the bottom-center SiteDock. Selected /
          Writing totals live here as a single line of editorial
          metadata (e.g. "Selected 12 · Writing 42"), not as large
          display numbers — the hero's focal point is the typewriter,
          not the counts. */}
      <div className="relative z-10 px-6 pb-28 sm:px-10 sm:pb-32">
        <div className="font-technical text-[10px] uppercase tracking-[0.24em] text-muted-foreground sm:text-[11px]">
          <span className="text-foreground">Selected</span>
          <span className="mx-1.5 tabular-nums text-foreground/80">
            {String(workCount).padStart(2, "0")}
          </span>
          <span className="mx-2 opacity-40">·</span>
          <span className="text-foreground">Writing</span>
          <span className="ml-1.5 tabular-nums text-foreground/80">
            {String(writingCount).padStart(2, "0")}
          </span>
        </div>
      </div>
    </section>
  );
}
