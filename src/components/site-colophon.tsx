import Link from "next/link";
import { Settings } from "lucide-react";
import { BRAND_IDENTITY } from "@/lib/brand/tokens";
import { createSupabaseServer } from "@/lib/supabase-server";

/**
 * SiteColophon — bottom-right editorial colophon.
 *
 * Consolidates what used to live scattered across three places (the
 * Hero's top-left "Studio № 01 / Seoul · 2026" corner, the top-right
 * "AI · R&D · Studio / Est. 2020" corner, and the compact footer
 * underneath the dock) into a single two-line block pinned to the
 * bottom-right corner. Pairs visually with SeoulDatum in the
 * top-right so the viewport frame reads as a four-corner magazine
 * masthead: wordmark (TL) · datum (TR) · dock (BC) · colophon (BR).
 *
 * Admin gear (⚙)
 *   Rendered only when the current visitor has a Supabase session.
 *   Opens /dashboard — the private workspace. Keeps the public chrome
 *   looking the same for visitors while giving the signed-in author
 *   a discreet entry point to admin without re-exposing /dashboard
 *   in the dock. Server-side auth check → zero flicker, no client
 *   auth logic.
 */
export async function SiteColophon() {
  const year = new Date().getFullYear();

  // Auth check is cheap — reuses the existing server client + cookies.
  // Silently swallow errors so a Supabase hiccup never breaks the
  // public frame.
  let isAdmin = false;
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isAdmin = Boolean(user);
  } catch {
    isAdmin = false;
  }

  return (
    <div
      aria-label="Colophon"
      className="pointer-events-none fixed right-[clamp(16px,2vw,32px)] bottom-[clamp(12px,1.8vh,24px)] z-40 flex flex-col items-end gap-0.5 font-technical text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80 sm:text-[11px]"
    >
      <div className="text-foreground/85">
        <span className="text-foreground">Studio № 01</span>
        <span className="mx-1.5 opacity-50">·</span>
        Seoul · {BRAND_IDENTITY.role}
        <span className="mx-1.5 opacity-50">·</span>
        Est. 2020
      </div>
      <div className="flex items-center gap-2 tabular-nums">
        <span>© {year} {BRAND_IDENTITY.domain} · All rights reserved.</span>
        {isAdmin && (
          <Link
            href="/dashboard"
            aria-label="Admin — /dashboard"
            title="Admin workspace"
            className="pointer-events-auto inline-flex h-5 w-5 items-center justify-center rounded-full border border-[var(--hairline)] bg-card/50 text-muted-foreground/80 transition-colors hover:border-primary/50 hover:text-foreground"
          >
            <Settings className="h-3 w-3" strokeWidth={1.75} aria-hidden />
          </Link>
        )}
      </div>
    </div>
  );
}
