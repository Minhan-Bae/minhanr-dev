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
  const latinCls =
    "font-display italic text-[clamp(1.5rem,3.2vw,2.5rem)] leading-none";
  const hangulCls =
    "font-technical uppercase tracking-[0.24em] text-[clamp(0.75rem,1.1vw,0.9rem)]";

  const chipCls = variant === "latin" ? latinCls : hangulCls;
  const dotCls =
    variant === "latin"
      ? "text-primary text-[clamp(1.5rem,3.2vw,2.5rem)] leading-none"
      : "text-primary text-[clamp(0.75rem,1.1vw,0.9rem)]";

  const loop = [...items, ...items];

  return (
    <div className="marquee-host relative">
      <div
        className={`marquee-track ${
          reverse ? "marquee-track-reverse" : ""
        } items-center gap-10 whitespace-nowrap text-foreground sm:gap-14`}
      >
        {loop.map((chip, i) => (
          <span key={`${chip}-${i}`} className="flex items-center gap-10 sm:gap-14">
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
