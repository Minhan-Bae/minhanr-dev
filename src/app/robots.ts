import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * 3-Tier 정책 (src/lib/vault-tiers.ts):
 * - Tier 1 (allow): /, /blog, /blog/[slug]
 * - Tier 2 (페이지 metadata noindex로 처리, robots에선 차단하지 않음):
 *   /papers, /projects, /notes/{whitelisted}/...md 는 OG 언펄/공유 페치를
 *   허용해야 하므로 disallow하지 않는다.
 * - Tier 3 (disallow): 인증 필요 surface. 미들웨어가 /login으로 redirect하지만,
 *   robots에서도 명시적으로 차단해 크롤 예산 낭비 방지.
 *
 * NOTE: /notes는 disallow에서 제외한다. 정확 매칭(/notes 검색 인덱스)만 Tier 3이고
 * /notes/{...}는 Tier 2일 수 있는데, robots.txt prefix 매칭으로는 둘을 구분할 수
 * 없다. 인덱스 페이지는 미들웨어 + 페이지 noindex로 충분히 보호된다.
 */

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/dashboard",
        "/command",
        "/calendar",
        "/finance",
        "/trends",
        "/review",
        "/deadlines",
        "/links",
        "/tags",
        "/statistics",
        "/api/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
