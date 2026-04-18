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
  "Selected, not streamed",
  "Tools, not toys",
  "Research becomes craft",
  "A quiet magazine",
  "Studio as system",
  "Only the shippable",
  "Made in Seoul",
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
  // Display row: editorial italic serif — pairs the rail visually.
  const latinCls =
    "font-technical uppercase font-medium tracking-[0.22em] text-[clamp(0.8rem,1.35vw,1.1rem)] leading-none";
  const displayCls =
    "font-display italic tracking-[-0.015em] text-[clamp(1.25rem,2.6vw,2rem)] leading-none";

  const chipCls = variant === "latin" ? latinCls : displayCls;
  const dotCls =
    variant === "latin"
      ? "text-primary text-[0.5em] leading-none opacity-70"
      : "text-primary text-[0.4em] leading-none opacity-70";

  // EXACTLY two copies so the -50% translate wraps to a pixel-identical
  // frame. More copies break the seamless loop because the translate
  // math assumes 2 × content width. Changing duplication without
  // updating @keyframes causes the visible stall we had previously.
  const loop = [...items, ...items];

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
