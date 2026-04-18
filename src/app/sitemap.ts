import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { getAllWork } from "@/lib/work";
import { getAllTags, getAllYears } from "@/lib/blog-taxonomy";
import { SITE_URL } from "@/lib/site";

/**
 * Tier 1 (Public + indexed) 라우트만 포함.
 * Tier 2/3는 페이지 metadata의 `robots: { index: false, follow: false }`로
 * 이미 noindex 처리되어 있으므로 sitemap에서 제외한다.
 *
 * 정책 단일 출처: src/lib/vault-tiers.ts
 */

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
      url: `${SITE_URL}/work`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/blog/tags`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  const tagEntries: MetadataRoute.Sitemap = getAllTags().map((t) => ({
    url: `${SITE_URL}/blog/tag/${t.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const archiveEntries: MetadataRoute.Sitemap = getAllYears().map((y) => ({
    url: `${SITE_URL}/blog/archive/${y.year}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const workEntries: MetadataRoute.Sitemap = getAllWork().map((item) => ({
    url: `${SITE_URL}/work/${item.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const postEntries: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    ...staticEntries,
    ...workEntries,
    ...postEntries,
    ...tagEntries,
    ...archiveEntries,
  ];
}
