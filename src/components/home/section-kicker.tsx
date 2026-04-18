import { TypewriterLoop } from "@/components/typewriter-loop";

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
 * The headline now boomerangs via TypewriterLoop so the home deck
 * carries the same identity-defining type motion on every slide, not
 * just the hero. Visibility-gated — the loop only runs while the
 * slide is on-screen (see TypewriterLoop's IntersectionObserver), so
 * the synthesized click SFX and animation stop whenever the deck
 * moves to a different slide.
 */
export function SectionKicker({ kicker, headline, note }: SectionKickerProps) {
  return (
    <section
      data-slide
      className="slide hairline-t relative mx-auto flex w-full max-w-[1440px] items-center px-6 sm:px-10"
    >
      <div className="max-w-4xl">
        <p className="kicker mb-6">{kicker}</p>
        <TypewriterLoop
          as="h2"
          text={headline}
          typeDelay={85}
          eraseDelay={45}
          holdMs={5200}
          pauseMs={900}
          className="font-display italic tracking-[-0.025em] text-foreground block"
          style={{
            fontSize: "clamp(2.75rem, 9vw, 7.5rem)",
            lineHeight: "1.02",
          }}
        />
        {note && (
          <p className="mt-10 max-w-xl text-[15px] leading-[1.7] text-muted-foreground sm:text-[16px]">
            {note}
          </p>
        )}
      </div>
    </section>
  );
}
