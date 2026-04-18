/**
 * Taxonomy helpers — aggregate posts by tag / category / year.
 *
 * The blog post index is a flat list (see src/lib/blog.ts). These
 * helpers build drill-down views without requiring every consumer to
 * re-scan the posts array.
 *
 * All functions operate on the already-cached `getAllPosts()` result,
 * so they're O(N) once per request and free on subsequent calls.
 */

import type { BlogPostMeta } from "@/lib/blog";
import { getAllPosts } from "@/lib/blog";

/** URL-safe slug for a tag. Keeps Hangul characters intact; only
 *  lowercases Latin and replaces whitespace with hyphens. */
export function tagSlug(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-\u3131-\uD79D]/g, "");
}

export interface TagCount {
  tag: string;
  slug: string;
  count: number;
}

/** All unique tags with post counts, sorted by count desc → alpha. */
export function getAllTags(): TagCount[] {
  const counts = new Map<string, { tag: string; count: number }>();
  for (const post of getAllPosts()) {
    for (const raw of post.tags) {
      if (!raw) continue;
      const tag = raw.trim();
      if (!tag) continue;
      const key = tag.toLowerCase();
      const existing = counts.get(key);
      if (existing) existing.count++;
      else counts.set(key, { tag, count: 1 });
    }
  }
  return Array.from(counts.values())
    .map(({ tag, count }) => ({ tag, slug: tagSlug(tag), count }))
    .sort((a, b) => (b.count - a.count) || a.tag.localeCompare(b.tag));
}

/** Resolve a tag slug back to the canonical tag label + matching posts. */
export function getPostsByTag(slug: string): {
  tag: string | null;
  posts: BlogPostMeta[];
} {
  const target = slug.toLowerCase();
  let tagLabel: string | null = null;
  const posts = getAllPosts().filter((p) =>
    p.tags.some((t) => {
      if (tagSlug(t) === target) {
        if (!tagLabel) tagLabel = t.trim();
        return true;
      }
      return false;
    })
  );
  return { tag: tagLabel, posts };
}

export interface YearCount {
  year: string;
  count: number;
}

/** All post years (descending) with counts. */
export function getAllYears(): YearCount[] {
  const counts = new Map<string, number>();
  for (const post of getAllPosts()) {
    if (!post.date) continue;
    const y = post.date.slice(0, 4);
    if (!/^\d{4}$/.test(y)) continue;
    counts.set(y, (counts.get(y) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => (b.year > a.year ? 1 : -1));
}

/** All posts from a given year, already sorted newest-first by the
 *  upstream `getAllPosts()` contract. */
export function getPostsByYear(year: string): BlogPostMeta[] {
  return getAllPosts().filter((p) => p.date.startsWith(year));
}
