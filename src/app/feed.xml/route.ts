/**
 * RSS 2.0 feed — public blog posts only.
 *
 * Tenet 3 ("Gardener, not publisher"): the linear feed is a 2nd-class
 * surface, but it has utility for digital-garden subscribers using
 * Reeder, NetNewsWire, Inoreader, etc. /blog remains the canonical
 * exploratory surface; /feed.xml is a thin projection of it for
 * subscribers who already speak the language of feeds.
 *
 * Output: RSS 2.0 with `<channel>` + `<item>` per blog post. Sorted
 * newest-first by post date. Caches at the route level (5min ISR)
 * because blog posts come from the filesystem and only change on
 * deploy.
 */

import { getAllPosts } from "@/lib/blog";
import { BRAND_IDENTITY } from "@/lib/brand/tokens";
import { SITE_URL, SITE_LANG } from "@/lib/site";

export const revalidate = 300; // 5 min ISR — same cadence as vault

/** RSS-safe escape for XML special characters in text content. */
function xmlEscape(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Convert YYYY-MM-DD to RFC-822 date (RSS 2.0 spec). */
function toRfc822(dateStr: string): string {
  if (!dateStr) return new Date().toUTCString();
  // YYYY-MM-DD → midnight UTC of that day
  const d = new Date(dateStr + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return new Date().toUTCString();
  return d.toUTCString();
}

export async function GET(): Promise<Response> {
  const posts = getAllPosts();
  const lastBuildDate = new Date().toUTCString();
  const latestPostDate = posts[0]?.date ? toRfc822(posts[0].date) : lastBuildDate;

  const items = posts
    .map((post) => {
      const link = `${SITE_URL}/blog/${post.slug}`;
      const pubDate = toRfc822(post.date);
      const description = post.summary || post.title;
      const categories = post.categories
        .map((c) => `      <category>${xmlEscape(c)}</category>`)
        .join("\n");
      return `    <item>
      <title>${xmlEscape(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${xmlEscape(description)}</description>${categories ? "\n" + categories : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(BRAND_IDENTITY.domain)} — ${xmlEscape(BRAND_IDENTITY.role)}</title>
    <link>${SITE_URL}</link>
    <description>${xmlEscape(BRAND_IDENTITY.manifestoEn)}</description>
    <language>${SITE_LANG}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <pubDate>${latestPostDate}</pubDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
