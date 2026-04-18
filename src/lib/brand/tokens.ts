/**
 * BRAND_TOKENS — single source of truth for hex color values used in
 * external surfaces (OG images, PWA manifest) where OKLCH cannot be
 * evaluated. `globals.css` is the master for in-site styling; this file
 * mirrors the dark theme as approximate sRGB hex for off-site consumers.
 *
 * Palette: 2026 colour-of-the-year quartet.
 *   Cloud Dancer (Pantone 11-4201) #F0EFEB      — soft off-white
 *   Phthalo Green                  #123524      — deep botanic
 *   Transformative Teal (WGSN)     #2F6364      — primary accent
 *   Divine Damson (Graham & Brown) #4A2D3C      — secondary accent
 */

export const BRAND_TOKENS = {
  // ── Surface (dark theme — the canonical brand face) ──
  background: "#0f2619",
  card:       "#123524",
  popover:    "#102c1e",

  // ── Text ──
  foreground:       "#f0efeb",
  mutedForeground:  "#a8b0a5",
  muted:            "#173a28",

  // ── Brand accent ──
  primary:            "#2f6364",
  primaryForeground:  "#f0efeb",
  accent:             "#4a2d3c",
  accentForeground:   "#f0efeb",

  // ── Hairline ──
  hairline: "rgba(240, 239, 235, 0.10)",
} as const;

/**
 * Brand identity — studio wordmark only, no personal name on public surfaces.
 * Everything the public sees refers to the domain / studio.
 */
export const BRAND_IDENTITY = {
  /** Studio wordmark — lowercase, the thing on the header */
  studio: "minhanr",
  /** Domain — used in meta, OG, footer */
  domain: "minhanr.dev",
  /** Practice descriptor, short */
  role: "AI · VFX · R&D",
  /** Korean role descriptor */
  roleKo: "AI · 비주얼 · 연구 스튜디오",

  /** One-line manifesto for meta / OG / footer tagline */
  manifesto:
    "AI와 시각 시스템을 다루는 스튜디오의 작업과 글.",
  /** English mirror — used where Korean glyphs can't render (OG, some embeds) */
  manifestoEn:
    "Selected work in AI and visual systems.",
} as const;
