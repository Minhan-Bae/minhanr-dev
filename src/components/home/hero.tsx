import { BRAND_IDENTITY } from "@/lib/brand/tokens";

interface HeroProps {
  workCount: number;
  writingCount: number;
}

/** Per-letter drop-in delay for the typewriter hero. */
const LETTER_STAGGER_MS = 140;
/** Extra pause before the cursor appears, after the last letter lands. */
const POST_WORD_MS = 180;

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
  const letters = [...word];
  const cursorDelayMs = letters.length * LETTER_STAGGER_MS + POST_WORD_MS;

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
          <h1
            lang="en"
            aria-label={word}
            className="display-hero font-display italic text-foreground"
          >
            {/* Typewriter letters — each drops in on its own delay. */}
            {letters.map((char, i) => (
              <span
                key={`${char}-${i}`}
                aria-hidden
                className="tw-letter"
                style={{ animationDelay: `${i * LETTER_STAGGER_MS}ms` }}
              >
                {char}
              </span>
            ))}
            {/* Blinking cursor — appears after the last letter lands. */}
            <span
              aria-hidden
              className="tw-cursor"
              style={{ animationDelay: `${cursorDelayMs}ms` }}
            >
              |
            </span>
          </h1>

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

      {/* ─── Bottom rail ────────────────────────────────────────────── */}
      <div className="relative z-10 grid grid-cols-[1fr_auto_1fr] items-end gap-6 px-6 pb-10 sm:px-10 sm:pb-12">
        <div className="font-technical text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <div className="text-[9px] sm:text-[10px]">Selected</div>
          <div
            className="mt-1 font-display italic tabular-nums text-foreground"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", lineHeight: "0.9" }}
          >
            {String(workCount).padStart(2, "0")}
          </div>
        </div>

        <div className="hidden items-center gap-3 font-technical text-[10px] uppercase tracking-[0.3em] text-muted-foreground sm:flex">
          <span>Scroll</span>
          <span
            aria-hidden
            className="block h-px w-14 bg-foreground/60 [animation:scroll-hint_2.6s_ease-in-out_infinite]"
          />
        </div>

        <div className="text-right font-technical text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <div className="text-[9px] sm:text-[10px]">Writing</div>
          <div
            className="mt-1 font-display italic tabular-nums text-foreground"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", lineHeight: "0.9" }}
          >
            {String(writingCount).padStart(2, "0")}
          </div>
        </div>
      </div>
    </section>
  );
}
