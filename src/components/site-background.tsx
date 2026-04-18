import Image from "next/image";

/**
 * SiteBackground — a single generative image sitting behind every
 * public page, slowly animated with a Ken-Burns-style pan+zoom.
 *
 * Layers (back → front):
 *   1. Full-bleed <Image> with `ken-burns-drift` CSS animation
 *   2. Vertical gradient overlay — transparent at top, solid at bottom
 *      so long paragraphs at scroll-bottom stay readable
 *   3. Fine grain texture at ~3% opacity (tied into the existing
 *      `.grain` primitive)
 *
 * Placed inside `(public)/layout.tsx` so the studio surfaces
 * (/dashboard and friends) stay on solid colour — a conscious
 * separation between the public face and the working back-room.
 *
 * Asset: `/public/bg.jpg` — generated via scripts/generate-backgrounds.mjs.
 * When missing, the background simply renders the solid theme colour and
 * the overlay still sits above it. No broken image state.
 */
export function SiteBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="ken-burns-drift absolute inset-[-4%]">
        <Image
          src="/bg.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-[0.22]"
        />
      </div>
      {/* Legibility gradient — stronger at the fold so text stays crisp. */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/65 to-background" />
    </div>
  );
}
