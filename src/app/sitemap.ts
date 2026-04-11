import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

/**
 * Tier 1 (Public + indexed) 라우트만 포함.
 * Tier 2/3는 페이지 metadata의 `robots: { index: false, follow: false }`로
 * 이미 noindex 처리되어 있으므로 sitemap에서 제외한다.
 *
 * 정책 단일 출처: src/lib/vault-tiers.ts
 */
const SITE_URL = "https://minhanr.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const postEntries: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...postEntries];
}
