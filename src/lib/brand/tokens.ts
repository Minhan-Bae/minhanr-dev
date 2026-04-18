/**
 * BRAND_TOKENS — single source of truth for hex color values used in
 * external surfaces (OG images, PWA manifest) where OKLCH cannot be
 * evaluated. `globals.css` is the master for in-site styling; this file
 * mirrors the dark theme as approximate sRGB hex for off-site consumers.
 *
 * Palette: rain-glass quartet (v2).
 *   Overcast Mist     #E8EEF7  — cool off-white ground
 *   Prussian Night    #0E1A2E  — deep stormy dark
 *   Signal Cobalt     #3D7AB3  — primary accent, rain-lit blue
 *   Amethyst Shadow   #5B5F99  — secondary accent, cooled violet
 */

export const BRAND_TOKENS = {
  // ── Surface (dark theme — the canonical brand face) ──
  background: "#0e1a2e",
  card:       "#15243b",
  popover:    "#112039",

  // ── Text ──
  foreground:       "#e8eef7",
  mutedForeground:  "#a5b2c6",
  muted:            "#1b2a43",

  // ── Brand accent ──
  primary:            "#3d7ab3",
  primaryForeground:  "#0a1425",
  accent:             "#5b5f99",
  accentForeground:   "#e8eef7",

  // ── Hairline ──
  hairline: "rgba(232, 238, 247, 0.10)",
} as const;

/**
 * Brand identity — studio wordmark only, no personal name on public surfaces.
 * Everything the public sees refers to the domain / studio.
 */
export const BRAND_IDENTITY = {
  /** Studio wordmark — camelcased signature, the thing on the header */
  studio: "MinhanR",
  /** Domain — used in meta, OG, footer */
  domain: "minhanr.dev",
  /** Practice descriptor, short */
  role: "AI · R&D · Studio",
  /** Korean role descriptor */
  roleKo: "AI · 연구 · 스튜디오",

  /** One-line manifesto for meta / OG / footer tagline */
  manifesto:
    "AI와 시각 시스템을 다루는 스튜디오의 작업과 글.",
  /** English mirror — used where Korean glyphs can't render (OG, some embeds) */
  manifestoEn:
    "Selected work in AI and visual systems.",
} as const;

/**
 * Public contact / collaboration channels used by the Studio
 * engagement surface. Values here are what shows up in the footer
 * rail, the /studio deck, and any "contact" CTA. Nullable fields are
 * gated in the UI so unset channels just don't render — no dead links.
 */
export const BRAND_CONTACT = {
  email: "hi@minhanr.dev",
  github: "https://github.com/Minhan-Bae",
  location: "Seoul, South Korea",
  /** ISO year the studio's been operating as a named practice. */
  est: 2020,
} as const;
