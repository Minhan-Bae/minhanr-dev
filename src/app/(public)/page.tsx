import { getAllPosts } from "@/lib/blog";
import { getSelectedWork } from "@/lib/work";
import { Hero } from "@/components/home/hero";
import { Marquee } from "@/components/home/marquee";
import { WorkShowcase } from "@/components/home/work-showcase";
import { WritingIndex } from "@/components/home/writing-index";
import { Closer } from "@/components/home/closer";

/**
 * Home — editorial cinematic (v3, aggressive).
 *
 *   1. Hero         — 100svh cinematic masthead, giant italic wordmark
 *                     over the Ken-Burns background, corner metadata.
 *   2. Marquee      — two counter-scrolling ticker rails.
 *   3. Work         — sticky-pin case studies, one per viewport on
 *                     desktop, stacked on mobile.
 *   4. Writing      — numbered editorial list, reveal on scroll.
 *   5. Closer       — oversized italic manifesto, nav links.
 *
 * The notes graph has moved to `/blog` (it's an index over the writing,
 * not a self-introduction). The home page now lives for the work.
 */
export default function Home() {
  const selected = getSelectedWork();
  const allPosts = getAllPosts();
  const recentPosts = allPosts.slice(0, 6);

  return (
    <>
      <Hero workCount={selected.length} writingCount={allPosts.length} />
      <Marquee />
      <WorkShowcase items={selected} />
      <WritingIndex posts={recentPosts} total={allPosts.length} />
      <Closer />
    </>
  );
}
