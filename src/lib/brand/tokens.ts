/**
 * BRAND_TOKENS — Single source of truth for hex color values used in
 * external surfaces (OG images, PWA manifest) where OKLCH cannot be evaluated.
 *
 * `globals.css` remains the master for in-site styling (declarative OKLCH).
 * This file mirrors the `dark` theme of globals.css as approximate sRGB hex,
 * computed manually at commit time. Do not auto-derive — OKLCH→sRGB has gamut
 * clipping issues that hurt brand precision.
 *
 * When you change a color in globals.css's `.dark` block, update the matching
 * entry here in the same commit. A snapshot test that flags drift between the
 * two is a planned follow-up (`scripts/verify-brand-tokens.ts`).
 *
 * Why dark theme as the default for external surfaces:
 * - Twitter / Slack / iMessage embed previews are dark-friendly
 * - Local development and operation environment is dark
 * - The "ocean" identity reads strongest in dark
 *
 * Brand tier reference (see /root/.claude/plans/tingly-forging-turtle.md):
 *   Tier 0: Minhan Bae (person, primary brand)
 *   Tier 1: minhanr.dev (domain wordmark)
 *   Tier 2: OIKBAS (system, /colophon only)
 *   Tier 3: TrinityX (internal codename)
 */

export const BRAND_TOKENS = {
  // ── Surface (dark theme dark ocean base, hue 220) ──
  background: "#141a24",
  card: "#1d262f",
  popover: "#181f29",

  // ── Text ──
  foreground: "#f0f3f5",
  mutedForeground: "#a3b1b8",
  muted: "#1f2a33",

  // ── Brand colors ──
  primary: "#6cd5e8", // aqua, oklch(0.78 0.165 195)
  primaryForeground: "#141a24",
  accent: "#ee8868", // coral, oklch(0.74 0.155 25) — accent restricted to state signals on public surfaces
  accentForeground: "#141a24",

  // ── Gradient endpoints (aqua → coral, 135deg) ──
  gradientStart: "#6cd5e8",
  gradientEnd: "#ee8868",

  // ── State tokens (Tenet 2: Garage door open) ──
  stateGrowing: "#f08266", // recently modified, work-in-progress
  stateMature: "#d9b06a", // status: mature, polished but not shipped
  statePublished: "#69cab1", // status: published, formally shipped

  // ── Hairline (thin separators, 5% white) ──
  hairline: "rgba(255, 255, 255, 0.05)",
} as const;

/**
 * Brand identity strings — single source of truth for the 4-tier hierarchy.
 * Used in metadata, OG, manifest, and any place that needs the brand name.
 */
export const BRAND_IDENTITY = {
  /** Tier 0 — primary brand (the person) */
  person: "Minhan Bae",
  /** Tier 1 — domain wordmark */
  domain: "minhanr.dev",
  /** Tier 2 — system, mention only in /colophon */
  system: "OIKBAS",
  /** Tier 3 — internal codename */
  internal: "TrinityX",

  /** One-line manifesto, applied to meta description, OG description, footer tagline */
  manifesto:
    "Minhan Bae's public notebook, gardened by seven agents with the door open.",

  /** Concrete role descriptor (replaces vague "AI Researcher & Engineer") */
  role: "AI researcher. Knowledge automation.",
} as const;
