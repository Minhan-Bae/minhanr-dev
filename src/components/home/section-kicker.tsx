interface SectionKickerProps {
  /** Small-caps kicker label, e.g. "Selected Work · 01" */
  kicker: string;
  /** Large display headline, e.g. "Made, shipped, running." */
  headline: string;
  /** Optional supporting paragraph below the headline. */
  note?: string;
}

/**
 * SectionKicker — a 100svh "chapter title" slide that separates the
 * work, writing, and closing acts. Editorial style: kicker → display
 * headline → one-line note, all left-aligned on a generous canvas.
 *
 * Kept in its own component so page.tsx can slot it wherever a new
 * act begins. Marked `data-slide` so the SlideDeck treats it as its
 * own stop.
 */
export function SectionKicker({ kicker, headline, note }: SectionKickerProps) {
  return (
    <section
      data-slide
      className="slide hairline-t relative mx-auto flex w-full max-w-[1440px] items-center px-6 sm:px-10"
    >
      <div className="max-w-4xl">
        <p className="kicker mb-6">{kicker}</p>
        <h2
          className="font-display italic tracking-[-0.025em] text-foreground"
          style={{
            fontSize: "clamp(2.75rem, 9vw, 7.5rem)",
            lineHeight: "1.02",
          }}
        >
          {headline}
        </h2>
        {note && (
          <p className="mt-10 max-w-xl text-[15px] leading-[1.7] text-muted-foreground sm:text-[16px]">
            {note}
          </p>
        )}
      </div>
    </section>
  );
}
