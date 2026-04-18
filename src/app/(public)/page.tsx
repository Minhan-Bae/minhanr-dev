import { getAllPosts } from "@/lib/blog";
import { getSelectedWork } from "@/lib/work";
import { Hero } from "@/components/home/hero";
import { WorkSlide } from "@/components/home/work-showcase";
import { WritingIndex } from "@/components/home/writing-index";
import { Closer } from "@/components/home/closer";
import { SectionKicker } from "@/components/home/section-kicker";
import { SlideDeck } from "@/components/slide-deck";

/**
 * Home — transform-driven slide deck (v5).
 *
 * SlideDeck is a wrapper that fixed-positions its children over the
 * viewport and moves between them via CSS transform (GPU-composited).
 * Every direct child below is treated as one slide; put the work
 * items inline rather than routing through a `<WorkShowcase>` wrapper
 * so React.Children.toArray can count them individually.
 */
export default function Home() {
  const selected = getSelectedWork();
  const allPosts = getAllPosts();
  const recentPosts = allPosts.slice(0, 5);
  // Most recent publish date on the site — posts are date-sorted desc,
  // so the first one is our practical "last update" signal. Formatted
  // `YYYY.MM` so the hero counter row stays compact.
  const lastUpdatedISO = allPosts[0]?.date ?? "";
  const lastUpdated = lastUpdatedISO
    ? `${lastUpdatedISO.slice(0, 4)}.${lastUpdatedISO.slice(5, 7)}`
    : "";

  return (
    <SlideDeck>
      <Hero
        workCount={selected.length}
        writingCount={allPosts.length}
        lastUpdated={lastUpdated}
      />
      <SectionKicker
        kicker="Selected Work · 01"
        headline="Made, shipped, running."
        note="Hand-picked case studies — one slide per project. Wheel, swipe, or press space to advance."
      />
      {selected.map((item, i) => (
        <WorkSlide
          key={item.slug}
          item={item}
          index={i}
          total={selected.length}
          flip={i % 2 === 1}
        />
      ))}
      <WritingIndex posts={recentPosts} total={allPosts.length} />
      <Closer />
    </SlideDeck>
  );
}
