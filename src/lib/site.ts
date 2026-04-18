/**
 * Site-wide constants. Single source of truth for the production URL
 * so sitemap, robots, feed, canonical tags, and OG endpoints don't
 * drift apart.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://minhanr.dev";

/** Primary language tag used in RSS feed, `<html lang>`, etc. Mixed
 *  KO/EN content — we tag as `en` because headlines, metadata, and
 *  case-study copy are English-first after the 2026 redesign. */
export const SITE_LANG = "en";
