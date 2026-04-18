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
 * Layered composition on top of `<SiteBackground />`:
 *   • Corner metadata (00, SEOUL 2026, role) anchors the frame.
 *   • Giant serif italic wordmark is the lede — magazine-cover energy.
 *   • Bottom rail pairs a Korean tagline, scroll affordance, and
 *     two tabular counters (selected / writing) so the visitor grasps
 *     scope in one glance.
 *
 * No background of its own; sits transparently over `bg.jpg` so the
 * Ken-Burns drift shows through. The bottom gradient in SiteBackground
 * hands off to the first content section below.
 */
export function Hero({ workCount, writingCount }: HeroProps) {
  const word = BRAND_IDENTITY.studio;

  return (
    <section
      data-slide
      className="slide relative flex w-full flex-col overflow-hidden"
    >
      {/* ─── Top rail ───────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-start justify-between px-6 pt-20 font-technical text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:px-10 sm:pt-24 sm:text-[11px]">
        <div>
          <div className="text-foreground">Studio № 01</div>
          <div className="mt-1 tabular-nums">Seoul · 2026</div>
        </div>
        <div className="text-right">
          <div className="text-foreground">{BRAND_IDENTITY.role}</div>
          <div className="mt-1 tabular-nums">Est. 2020</div>
        </div>
      </div>

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

      {/* ─── Bottom rail ────────────────────────────────────────────────
          Positioned above the floating SiteDock (which occupies roughly
          72–88px at the viewport bottom). We reserve ~128px of bottom
          padding so the counters clear the dock on every breakpoint,
          and we drop the old centre "Scroll" hint — the dock already
          communicates navigation, so a second scroll affordance just
          competed with it for attention. */}
      <div className="relative z-10 flex items-end justify-between gap-6 px-6 pb-28 sm:px-10 sm:pb-32">
        <div className="font-technical text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <div className="text-[9px] sm:text-[10px]">Selected</div>
          <div
            className="mt-1 font-display italic tabular-nums text-foreground"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", lineHeight: "0.9" }}
          >
            {String(workCount).padStart(2, "0")}
          </div>
        </div>

        <div className="text-right font-technical text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <div className="text-[9px] sm:text-[10px]">Writing</div>
          <div
            className="mt-1 font-display italic tabular-nums text-foreground"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", lineHeight: "0.9" }}
          >
            {String(writingCount).padStart(2, "0")}
          </div>
        </div>
      </div>
    </section>
  );
}
