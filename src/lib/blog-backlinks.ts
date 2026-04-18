/**
 * Blog-internal backlinks — which posts link to which.
 *
 * Scans every markdown file under `src/content/posts/` once (on first
 * call, module-scope cache) for occurrences of `/blog/{slug}`. Produces
 * a reverse map: for each slug, the list of posts that link to it.
 *
 * This is the blog-side cousin of `vault-backlinks.ts`, which handles
 * Obsidian-style wikilinks against the companion vault repo. Here we
 * only need HTTP-path matches because blog posts cite one another
 * exclusively via the public URL shape.
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { getAllPosts, type BlogPostMeta } from "./blog";

const POSTS_DIR = path.join(process.cwd(), "src/content/posts");

/**
 * Module-scope cache. Built once per serverless instance.
 * Map<targetSlug, Array<sourceSlug>>
 */
let _backlinks: Map<string, string[]> | null = null;

/**
 * Walk every post file, extract `/blog/{slug}` references from the body,
 * and invert the graph so we can answer "who links to X?" in O(1).
 */
function build(): Map<string, string[]> {
  const meta = getAllPosts();
  const known = new Set(meta.map((m) => m.slug));
  const out = new Map<string, string[]>();

  let files: string[] = [];
  try {
    files = fs.readdirSync(POSTS_DIR);
  } catch {
    return out;
  }

  // Match `/blog/<slug>` — slug accepts latin alnum, hangul, hyphen,
  // underscore, dot, and percent-escapes. Anchored to a boundary on
  // the left so we don't match inside a longer path segment.
  const LINK_RE = /(?:^|[\s("'])\/blog\/([0-9a-zA-Z_\-.%\u3131-\uD79D]+)/g;

  for (const file of files) {
    if (!file.endsWith(".md")) continue;
    let raw: string;
    try {
      raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
    } catch {
      continue;
    }
    const parsed = matter(raw);
    const data = parsed.data as { slug?: unknown };
    const thisSlug =
      typeof data.slug === "string" && data.slug
        ? data.slug
        : file.replace(/\.md$/, "");
    const refs = new Set<string>();
    for (const m of parsed.content.matchAll(LINK_RE)) {
      const target = decodeURIComponent(m[1]);
      if (target === thisSlug) continue;
      if (!known.has(target)) continue;
      refs.add(target);
    }
    for (const target of refs) {
      if (!out.has(target)) out.set(target, []);
      out.get(target)!.push(thisSlug);
    }
  }

  return out;
}

export function getBacklinks(slug: string): BlogPostMeta[] {
  if (!_backlinks) _backlinks = build();
  const sources = _backlinks.get(slug) ?? [];
  if (sources.length === 0) return [];
  const bySlug = new Map(getAllPosts().map((m) => [m.slug, m]));
  return sources
    .map((s) => bySlug.get(s))
    .filter((p): p is BlogPostMeta => Boolean(p));
}
