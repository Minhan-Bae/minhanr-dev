import { SiteBackground } from "@/components/site-background";
import { RainEffect } from "@/components/rain-effect";
import { MouseSpotlight } from "@/components/mouse-spotlight";
import { SiteWordmark } from "@/components/site-wordmark";
import { SiteDock } from "@/components/site-dock";
import { SeoulDatum } from "@/components/seoul-datum";
import { SiteColophon } from "@/components/site-colophon";

/**
 * Public layout — minimal chrome, heavy atmosphere.
 *
 * Four-corner magazine frame sitting over every public page:
 *   • z-[-10] SiteBackground — ken-burns scene for the active theme
 *   • z-[-5]  RainEffect — WebGL rain-on-glass
 *   • z-[15]  MouseSpotlight — soft torch on hover (dark theme only)
 *   • z-40    SiteWordmark — tiny top-left `MinhanR.dev` return anchor
 *   • z-40    SeoulDatum — top-right KST date / time / weather
 *   • z-40    SiteColophon — bottom-right consolidated copyright
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
  return (
    <div className="relative flex min-h-svh flex-col">
      <SiteBackground />
      <RainEffect />
      <SiteWordmark />
      <SeoulDatum />

      <main className="flex-1 pb-28 sm:pb-32">{children}</main>

      <SiteColophon />
      <SiteDock />
      <MouseSpotlight />
    </div>
  );
}
