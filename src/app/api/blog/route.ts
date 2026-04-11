/**
 * PUBLIC ENDPOINT — Intentionally unauthenticated.
 *
 * Returns blog post metadata (titles, slugs, dates) — already public at
 * /blog. RSS readers, link previewers, and external tools may rely on this
 * endpoint. No PII, no Tier 3 data, no mutation.
 *
 * Justified by docs/brand-tenets.md "Tenet 3: Gardener, not publisher".
 * Phase F-Critical decision (2026-04-11): keep public after audit.
 */
import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/blog";

export async function GET() {
  try {
    const allPosts = getAllPosts();

    const posts = allPosts.slice(0, 5).map((post) => ({
      title: post.title,
      slug: post.slug,
      date: post.date,
      url: `/blog/${post.slug}`,
    }));

    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ posts: [] });
  }
}
