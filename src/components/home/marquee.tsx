/**
 * Marquee — two edge-to-edge ticker rails, counter-direction.
 *
 * The top rail names the practice in English small-caps; the bottom
 * rail carries a Korean descriptor in the display face. Opposing
 * directions give the band visual texture without shouting.
 *
 * Pure CSS — the track width is `max-content` and the animation
 * translates by -50%. We render the chip list twice so the loop is
 * seamless. No JS, no clones at runtime, no IntersectionObserver.
 * Hovering the rail pauses the motion (see `.marquee-host:hover` in
 * globals.css) — a small courtesy for anyone trying to read a chip.
 */

const PRIMARY_CHIPS = [
  "AI Systems",
  "VFX Research",
  "Creative Technology",
  "Knowledge Automation",
  "Editorial Design",
  "Pipeline Engineering",
  "Generative Visual",
  "Studio Practice",
];

const SECONDARY_CHIPS = [
  "선별된 작업",
  "장인의 연장",
  "연구에서 도구로",
  "조용한 매거진",
  "시스템으로서의 스튜디오",
  "공개 가능한 것만",
];

export function Marquee() {
  return (
    <section
      aria-hidden
      className="hairline-y relative w-full overflow-hidden bg-[var(--surface-1)]/40 py-4 sm:py-5"
    >
      {/* Top rail — Latin practice labels */}
      <MarqueeRail items={PRIMARY_CHIPS} variant="latin" />

      {/* Bottom rail — Korean manifesto fragments, reversed */}
      <div className="mt-3 sm:mt-4">
        <MarqueeRail items={SECONDARY_CHIPS} variant="hangul" reverse />
      </div>
    </section>
  );
}

function MarqueeRail({
  items,
  reverse,
  variant,
}: {
  items: readonly string[];
  reverse?: boolean;
  variant: "latin" | "hangul";
}) {
  // Latin row: wide-tracked uppercase sans — scans horizontally,
  // no tall italic glyphs. Feels like modern Swiss kiosk signage.
  // Hangul row: display face at a confident size — Pretendard heavy
  // carries the visual weight since Instrument Serif has no Hangul.
  const latinCls =
    "font-technical uppercase font-medium tracking-[0.22em] text-[clamp(0.8rem,1.35vw,1.1rem)] leading-none";
  const hangulCls =
    "font-display font-bold tracking-[-0.015em] text-[clamp(1.25rem,2.6vw,2rem)] leading-none";

  const chipCls = variant === "latin" ? latinCls : hangulCls;
  const dotCls =
    variant === "latin"
      ? "text-primary text-[0.5em] leading-none opacity-70"
      : "text-primary text-[0.4em] leading-none opacity-70";

  // Triple the content so the -50% wrap boundary is never the first
  // thing a visitor sees, and the loop looks continuous from any scroll
  // position. `display: flex` + width:max-content keeps the track on
  // one horizontal row regardless.
  const loop = [...items, ...items, ...items];

  return (
    <div className="marquee-host relative">
      <div
        className={`marquee-track ${reverse ? "marquee-track-reverse" : ""} whitespace-nowrap text-foreground`}
        style={{ alignItems: "center" }}
      >
        {loop.map((chip, i) => (
          <span
            key={`${chip}-${i}`}
            className="inline-flex shrink-0 items-center whitespace-nowrap"
            style={{ columnGap: "clamp(1.75rem, 3vw, 2.75rem)", paddingRight: "clamp(1.75rem, 3vw, 2.75rem)" }}
          >
            <span className={chipCls}>{chip}</span>
            <span aria-hidden className={dotCls}>
              ●
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
