import { SiteBackground } from "@/components/site-background";
import { RainEffect } from "@/components/rain-effect";
import { SiteWordmark } from "@/components/site-wordmark";
import { SiteDock } from "@/components/site-dock";
import { BRAND_IDENTITY } from "@/lib/brand/tokens";

/**
 * Public layout — minimal chrome, heavy atmosphere.
 *
 * Chrome order (stacking):
 *   • z-[-10] SiteBackground — ken-burns scene for the active theme
 *   • z-[-5]  RainEffect — WebGL rain-on-glass
 *   • z-40    SiteWordmark — tiny top-left `MinhanR.dev` return anchor
 *   • z-40    SiteDock — floating bottom-center nav pill
 *
 * Auth state no longer branches the UI — the supabase middleware takes
 * care of bouncing unauthenticated visitors from `/dashboard` to
 * `/login`, so the layout stays purely presentational.
 */
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const year = new Date().getFullYear();

  return (
    <div className="relative flex min-h-svh flex-col">
      <SiteBackground />
      <RainEffect />
      <SiteWordmark />

      <main className="flex-1 pb-24 sm:pb-28">{children}</main>

      <SiteDock />

      {/* Minimal footer — most wayfinding lives in the dock. A single
          baseline copyright line keeps the legal surface clean without
          stealing attention from the dock above it. */}
      <footer className="font-technical relative z-0 px-6 pb-6 pt-2 text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 sm:px-10 sm:pb-8">
        © {year} {BRAND_IDENTITY.domain} · Studio № 01 · Seoul
      </footer>
    </div>
  );
}
