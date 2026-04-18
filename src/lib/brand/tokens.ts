/**
 * BRAND_TOKENS — single source of truth for hex color values used in
 * external surfaces (OG images, PWA manifest) where OKLCH cannot be
 * evaluated. `globals.css` is the master for in-site styling; this file
 * mirrors the dark theme as approximate sRGB hex for off-site consumers.
 *
 * When you change a color in globals.css's `.dark` block, update the
 * matching entry here in the same commit.
 *
 * Palette: "Ink" — near-black cool ground, ivory text, cinematic vermilion
 * accent. See docs/brand-tenets.md (v2) for the rationale.
 */

export const BRAND_TOKENS = {
  // ── Surface (dark theme — the canonical brand face) ──
  background: "#0e0f14",   // deep ink
  card:       "#161822",
  popover:    "#131521",

  // ── Text ──
  foreground:       "#f3eee3", // warm ivory
  mutedForeground:  "#9e9789",
  muted:            "#1a1c26",

  // ── Brand accent ──
  primary:            "#e16a3e", // warm vermilion
  primaryForeground:  "#131521",
  accent:             "#e16a3e",
  accentForeground:   "#131521",

  // ── Hairline (thin separator) ──
  hairline: "rgba(255, 255, 255, 0.08)",
} as const;

/**
 * Brand identity strings. Used in metadata, OG, manifest, and anywhere
 * the wordmark/tagline render. Keep terse — the site itself does the
 * heavy lifting.
 */
export const BRAND_IDENTITY = {
  /** The person behind the work */
  person: "Minhan Bae",
  /** Domain wordmark */
  domain: "minhanr.dev",
  /** Practice — short, shown under the wordmark */
  role: "AI · VFX · R&D",

  /** One-line meta description / OG tagline */
  manifesto:
    "Selected work in AI and visual systems by Minhan Bae.",
} as const;
