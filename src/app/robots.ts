import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * 크롤링 정책
 *
 * 1) Standard crawlers (검색 엔진 봇)
 *    - Tier 1 (allow): /, /blog, /blog/[slug], /about, /studio
 *    - Tier 3 (disallow): 인증 필요 surface. 미들웨어가 /login으로
 *      리다이렉트하지만 robots에서도 명시적으로 차단해 크롤 예산을
 *      낭비하지 않게 한다.
 *    - /notes 는 prefix 매칭으로 Tier 2 /notes/{whitelist} 를
 *      잘라낼 수 없어 미들웨어 + 페이지 noindex 로 보호한다.
 *
 * 2) AI / LLM 학습 크롤러 (별도 block)
 *    수집한 콘텐츠가 학습 데이터로 빨려 들어가는 걸 원하지 않는다.
 *    Known bot User-Agent 전부를 `disallow: "/"` 로 일괄 차단.
 *    완전한 차단은 불가능 (악성 크롤러는 UA 위장) — 합법적이고
 *    UA를 명시하는 쪽만 막는다. 나머지는 Cloudflare 방어막 수준.
 */
const AI_CRAWLERS = [
  "GPTBot",            // OpenAI
  "ChatGPT-User",      // OpenAI — realtime browsing
  "OAI-SearchBot",     // OpenAI — search index
  "ClaudeBot",         // Anthropic
  "Claude-Web",        // Anthropic — realtime
  "anthropic-ai",      // Anthropic (legacy UA)
  "Google-Extended",   // Google Bard/Vertex learning signal
  "GoogleOther",       // Google — product dev/training
  "CCBot",             // Common Crawl (Apache)
  "PerplexityBot",     // Perplexity AI
  "Amazonbot",         // Amazon Alexa / Rufus
  "Applebot-Extended", // Apple Intelligence
  "Bytespider",        // ByteDance / Doubao
  "Meta-ExternalAgent",// Meta LLM training
  "FacebookBot",       // Meta older UA
  "cohere-ai",         // Cohere
  "DuckAssistBot",     // DuckDuckGo AI answers
  "YouBot",            // You.com
  "Omgilibot",         // Omgili / Webz.io
  "Diffbot",           // Diffbot crawler
  "ImagesiftBot",      // ByteDance image crawl
  "magpie-crawler",    // Brandwatch
  "SemrushBot",        // SEO — not LLM but aggressive
  "AhrefsBot",         // SEO — aggressive
];

export default function robots(): MetadataRoute.Robots {
  const tier3Disallow = [
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
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: tier3Disallow,
      },
      // LLM / AI training crawlers — full site block.
      ...AI_CRAWLERS.map((ua) => ({
        userAgent: ua,
        disallow: "/",
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
