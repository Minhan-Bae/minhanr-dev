#!/usr/bin/env node
/**
 * Generate PWA icons (and favicon source) from a single inline SVG,
 * rasterised to the exact brand tokens. Keeps the visual identity
 * aligned with BRAND_TOKENS without a design detour.
 *
 *   node scripts/generate-icons.mjs
 *
 * Outputs:
 *   public/icon-192.png
 *   public/icon-512.png
 *
 * Sharp is already in the tree as a transitive of @vercel/og + next,
 * so there's no new dependency.
 */

import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

/** Brand tokens — mirror src/lib/brand/tokens.ts (dark face). */
const PRUSSIAN_NIGHT = "#0E1A2E";
const SIGNAL_COBALT = "#3D7AB3";
const OVERCAST_MIST = "#E8EEF7";

/** SVG template — renders an `m` lowercase Instrument-Serif-style mark
 *  over a Prussian-night square, with a thin Signal Cobalt keyline. */
function markSvg(size) {
  const bar = size * 0.018;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" rx="${size * 0.18}" fill="${PRUSSIAN_NIGHT}"/>
    <rect x="${size * 0.16}" y="${size * 0.2}" width="${bar}" height="${size * 0.6}" fill="${SIGNAL_COBALT}"/>
    <text
      x="${size * 0.52}"
      y="${size * 0.72}"
      text-anchor="middle"
      font-family="Georgia, 'Times New Roman', serif"
      font-style="italic"
      font-weight="400"
      font-size="${size * 0.72}"
      fill="${OVERCAST_MIST}"
      letter-spacing="${-size * 0.02}"
    >m</text>
  </svg>`;
}

async function renderIcon(size, outName) {
  const svg = Buffer.from(markSvg(size));
  const outPath = path.resolve(ROOT, "public", outName);
  await sharp(svg, { density: 400 }).png().toFile(outPath);
  return outPath;
}

async function main() {
  const out192 = await renderIcon(192, "icon-192.png");
  const out512 = await renderIcon(512, "icon-512.png");
  console.log(`[ok] ${path.relative(ROOT, out192)}`);
  console.log(`[ok] ${path.relative(ROOT, out512)}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
