import { getAllPosts } from "@/lib/blog";
import { getSelectedWork } from "@/lib/work";
import { Hero } from "@/components/home/hero";
import { WorkShowcase } from "@/components/home/work-showcase";
import { WritingIndex } from "@/components/home/writing-index";
import { Closer } from "@/components/home/closer";
import { SectionKicker } from "@/components/home/section-kicker";
import { SlideDeck } from "@/components/slide-deck";

/**
 * Home — slide deck (v4).
 *
 * Seven 100svh slides, navigated one-per-gesture by the SlideDeck
 * client component. Wheel, arrow keys, PageUp/Down, Space, Home/End.
 * Touch devices use native CSS scroll-snap (mandatory + stop:always).
 *
 *   0. Hero — giant typewriter wordmark + corner meta
 *   1. Work chapter title ("Selected Work")
 *   2. Work 01  ─ 3. Work 02  ─ 4. Work 03
 *   5. Writing — compact numbered list, top 5 posts
 *   6. Closer — manifesto quote + nav rail
 */
export default function Home() {
  const selected = getSelectedWork();
  const allPosts = getAllPosts();
  const recentPosts = allPosts.slice(0, 5);

  return (
    <>
      <SlideDeck />
      <Hero workCount={selected.length} writingCount={allPosts.length} />
      <SectionKicker
        kicker="Selected Work · 01"
        headline="Made, shipped, running."
        note="Hand-picked case studies — one slide per project. Wheel, swipe, or press space to advance."
      />
      <WorkShowcase items={selected} />
      <WritingIndex posts={recentPosts} total={allPosts.length} />
      <Closer />
    </>
  );
}
