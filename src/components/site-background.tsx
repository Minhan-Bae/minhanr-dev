"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FALLBACK_SCENE, getCurrentScene, type Scene } from "@/lib/scenes";

/**
 * SiteBackground — full-bleed time-of-day backdrop sitting behind every
 * public page.
 *
 * Picks one of six scenes from src/lib/scenes.ts based on the
 * visitor's local hour (pre-dawn harbour, misty forest, cloud peaks,
 * overcast shore, dusk skyline, late-night downtown). Acts as the
 * WebGL-fallback layer for RainEffect — when the rain renderer's
 * WebGL context initializes it paints an opaque canvas over this,
 * but if WebGL fails or hasn't loaded yet, this is what the visitor
 * sees.
 *
 * Scene selection runs inside `useEffect` so the server and client
 * renders agree on the fallback image (the hour on the server is
 * unknowable), then the client upgrades to the time-correct scene
 * once mounted.
 */
export function SiteBackground() {
  const [scene, setScene] = useState<Scene>(FALLBACK_SCENE);

  useEffect(() => {
    setScene(getCurrentScene());
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="ken-burns-drift absolute inset-[-4%]">
        <Image
          key={scene.file}
          src={scene.file}
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
