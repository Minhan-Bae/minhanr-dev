import Link from "next/link";
import { BRAND_IDENTITY } from "@/lib/brand/tokens";

/**
 * SiteWordmark — discreet top-left brand anchor.
 *
 * With navigation now living in a floating bottom pill (see `<SiteDock />`),
 * the top of the viewport no longer carries a sticky header bar. A small
 * wordmark in the upper-left corner preserves the "you're on minhanr.dev"
 * signal on deep routes (blog posts, individual case studies) without
 * swallowing a full row of chrome.
 *
 * On the home page this wordmark is visually dominated by the Hero's
 * giant typewriter headline; it's intentionally small here so the hero
 * still lands as the focal point. On inner pages it acts as the return
 * affordance to `/`.
 */
export function SiteWordmark() {
  return (
    <Link
      href="/"
      aria-label="Home"
      className="group pointer-events-auto fixed left-5 top-4 z-40 inline-flex items-baseline gap-1.5 tap-scale sm:left-8 sm:top-6"
    >
      <span className="font-display text-xl leading-none tracking-[-0.02em] transition-colors group-hover:text-primary sm:text-2xl">
        {BRAND_IDENTITY.studio}
      </span>
      <span className="font-technical text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:text-[11px]">
        .dev
      </span>
    </Link>
  );
}
