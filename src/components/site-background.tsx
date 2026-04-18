import Image from "next/image";

/**
 * SiteBackground — the full-bleed generative image sitting behind every
 * public page.
 *
 * Works together with RainEffect: the image here is rendered with a
 * soft `filter: blur(…)` so that each rain drop — which uses
 * `background-attachment: fixed` on the same `bg.jpg` — can act as a
 * clear lens over a blurred window. That's the codrops/RainEffect
 * trick: un-blur through the drops, not blur inside them.
 *
 * Layers (back → front):
 *   1. Blurred <Image> with `ken-burns-drift` animation
 *   2. Gradient overlay — transparent at top, solid at bottom — kept
 *      muted enough that the rain lenses still have something to look at
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
          className="object-cover opacity-[0.55]"
          style={{ filter: "blur(6px) saturate(0.9)" }}
        />
      </div>
      {/* Softer legibility gradient — rain lenses need something to
          magnify, so we back off the previous near-opaque bottom fill. */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/35 to-background/55" />
    </div>
  );
}
