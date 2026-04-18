import Image from "next/image";

/**
 * SiteBackground — full-bleed bg.jpg sitting behind every public page.
 *
 * Acts as the WebGL-fallback layer for RainEffect: when the rain
 * renderer's WebGL context initializes it paints an opaque canvas
 * over this (so the user sees the rain scene instead), but if WebGL
 * fails or hasn't loaded yet, this image is what they see.
 *
 * The rain renderer applies its own blur internally when building
 * its offscreen `textureBg`, so no CSS blur is needed here.
 *
 * Placed inside `(public)/layout.tsx` so the studio surfaces
 * (/dashboard and friends) stay on solid colour.
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
      {/* Legibility gradient — stronger at the fold so fallback text
          stays crisp if the rain canvas never initializes. */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/65 to-background" />
    </div>
  );
}
