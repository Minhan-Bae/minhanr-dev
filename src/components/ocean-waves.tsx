"use client";

/**
 * OceanWaves — light-theme ambient wave animation.
 *
 * Three stacked SVG wave paths that drift horizontally at different
 * speeds, pinned to the bottom ~30vh of the viewport. The waves are
 * translated by half their own width each cycle, and each viewBox
 * contains *two* seamless wave cycles, so the horizontal loop is
 * seamless — no visible jump at the wrap point.
 *
 * Scoped to the light theme via the `:root.light` selector in
 * globals.css — the dark/storm theme has the WebGL rain effect filling
 * the same visual role, and stacking the two would just compete. This
 * component is a pointer-events-none, z-negative fixed overlay; it
 * never steals input and sits behind the main content.
 *
 * Why SVG + CSS transforms instead of a full WebGL ocean shader:
 * the visual target here is "a hint of sea motion" underneath the
 * existing sunny-beach scene, not a physically-simulated water
 * surface. Three animated paths are a small, GPU-composited cost
 * (transform-only animation) and load no textures.
 */
export function OceanWaves() {
  return (
    <div aria-hidden className="ocean-waves">
      <svg
        className="ocean-waves__layer ocean-waves__layer--a"
        viewBox="0 0 2880 240"
        preserveAspectRatio="none"
      >
        <path
          d="M0,140 Q180,96 360,140 T720,140 T1080,140 T1440,140 T1800,140 T2160,140 T2520,140 T2880,140 L2880,240 L0,240 Z"
          fill="currentColor"
        />
      </svg>
      <svg
        className="ocean-waves__layer ocean-waves__layer--b"
        viewBox="0 0 2880 240"
        preserveAspectRatio="none"
      >
        <path
          d="M0,170 Q160,132 320,170 T640,170 T960,170 T1280,170 T1600,170 T1920,170 T2240,170 T2560,170 T2880,170 L2880,240 L0,240 Z"
          fill="currentColor"
        />
      </svg>
      <svg
        className="ocean-waves__layer ocean-waves__layer--c"
        viewBox="0 0 2880 240"
        preserveAspectRatio="none"
      >
        <path
          d="M0,198 Q240,172 480,198 T960,198 T1440,198 T1920,198 T2400,198 T2880,198 L2880,240 L0,240 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
