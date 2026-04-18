/**
 * BRAND_TOKENS — single source of truth for hex color values used in
 * external surfaces (OG images, PWA manifest) where OKLCH cannot be
 * evaluated. `globals.css` is the master for in-site styling; this file
 * mirrors the dark theme as approximate sRGB hex for off-site consumers.
 *
 * When you change a color in globals.css's `.dark` block, update the
 * matching entry here in the same commit.
 *
 * Palette: "Phthalo" — 2026 color-of-the-year quartet.
 *   Cloud Dancer (Pantone 11-4201) #F0EFEB      — soft off-white
 *   Phthalo Green                  #123524      — deep botanic
 *   Transformative Teal (WGSN)     #2F6364      — primary accent
 *   Divine Damson (Graham & Brown) #4A2D3C      — secondary accent
 *
 * See docs/brand-tenets.md (v2) for the editorial rationale.
 */

export const BRAND_TOKENS = {
  // ── Surface (dark theme — the canonical brand face) ──
  background: "#0f2619",   // Phthalo base, slightly darker for UI depth
  card:       "#123524",   // Phthalo Green (raw)
  popover:    "#102c1e",

  // ── Text ──
  foreground:       "#f0efeb", // Cloud Dancer
  mutedForeground:  "#a8b0a5",
  muted:            "#173a28",

  // ── Brand accent ──
  primary:            "#2f6364", // Transformative Teal
  primaryForeground:  "#f0efeb",
  accent:             "#4a2d3c", // Divine Damson
  accentForeground:   "#f0efeb",

  // ── Hairline (thin separator) ──
  hairline: "rgba(240, 239, 235, 0.10)",
} as const;

/**
 * Brand identity strings. Used in metadata, OG, manifest, and anywhere
 * the wordmark/tagline render. Keep terse — the site itself does the
 * heavy lifting.
 */
export const BRAND_IDENTITY = {
  /** The person behind the work — Korean primary */
  person: "배민한",
  /** Latin romanisation — used in OG image, metadata, bilingual headings */
  personLatin: "Minhan Bae",
  /** Domain wordmark */
  domain: "minhanr.dev",
  /** Practice — short, shown under the wordmark */
  role: "AI · VFX · R&D",
  /** Korean role descriptor */
  roleKo: "인공지능·비주얼·연구 스튜디오",

  /** One-line meta description / OG tagline (Korean primary) */
  manifesto:
    "AI와 시각 시스템을 다루는 배민한의 작업과 글.",
  /** English mirror — for OG channels / consumers that don't render Korean well */
  manifestoEn:
    "Selected work in AI and visual systems by Minhan Bae.",
} as const;
