#!/usr/bin/env node
/**
 * Generate editorial cover images for every Work item in src/lib/work.ts.
 *
 *   node scripts/generate-work-images.mjs              # generate missing
 *   node scripts/generate-work-images.mjs --force      # regenerate all
 *   node scripts/generate-work-images.mjs --slug=foo   # one slug
 *   node scripts/generate-work-images.mjs --dry        # print prompts only
 *
 * Uses Google's Imagen 3 via the Generative Language API (api key auth).
 * Reads VERTEX_AI_API_KEY (or GEMINI_API_KEY) from workspace/.env.
 *
 * Images are saved as JPEG at:
 *   public/work/<slug>/cover.jpg
 *
 * The site's WorkCover component auto-detects their presence; no code
 * changes needed after the script runs.
 *
 * Why JavaScript not TypeScript: no extra dev deps. Runs with plain Node.
 * Tested on Node 20+.
 */

import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const WORKSPACE_ENV = path.resolve(ROOT, "../.env");
const LOCAL_ENV = path.resolve(ROOT, ".env.local");
const OUT_ROOT = path.resolve(ROOT, "public/work");

// ── Prompts — one per work slug ──────────────────────────────────────
// Palette keywords tuned to the 2026 colour-of-the-year quartet so that
// generated imagery coheres with the site tokens:
//
//   Cloud Dancer   — soft off-white (#F0EFEB), Pantone 11-4201, 2026 COY
//   Phthalo Green  — deep botanic dark (#123524)
//   Transformative Teal — primary accent (#2F6364), WGSN/Coloro 2026 COY
//   Divine Damson  — warm secondary accent (#4A2D3C), Graham & Brown 2026
//
// Each prompt is an editorial brief. Avoid neon, saturated blues, or
// warm vermilion (previous palette). Favour natural, matte, grounded,
// organic texture — in line with Adobe's 2026 trend forecast.
const PROMPTS = {
  "oikbas-ecosystem": {
    aspectRatio: "4:5",
    prompt: [
      "Editorial cinematic still, medium format aesthetic.",
      "Abstract visualisation of an autonomous knowledge network:",
      "seven soft luminous nodes connected by thin organic threads,",
      "suspended in a deep phthalo green botanic haze (#123524).",
      "The nodes glow pale Cloud Dancer off-white (#F0EFEB);",
      "one node is accented with Transformative Teal (#2F6364),",
      "another with a subtle Divine Damson warm plum (#4A2D3C).",
      "Composition: generous negative space top-left, nodes clustered bottom-right.",
      "Soft diffused studio light, fine film grain, matte finish, shallow depth of field.",
      "No text, no UI, no logos, no neon, no digital glow. Organic editorial print quality.",
    ].join(" "),
  },
  "vfx-research-pipeline": {
    aspectRatio: "16:9",
    prompt: [
      "Cinematic still, editorial tone, shot on medium format film.",
      "A lone silhouetted figure in a dim phthalo-green studio (#123524),",
      "illuminated by a single soft beam of Transformative Teal light (#2F6364)",
      "cutting across misty atmospheric haze.",
      "The figure studies projected abstract geometric forms on a wall —",
      "soft caustic patterns in Cloud Dancer off-white (#F0EFEB),",
      "a faint Divine Damson plum reflection (#4A2D3C) in the backlight.",
      "Deep botanic shadow, subtle film grain, natural matte surfaces.",
      "No text, no logos, no neon, no warm red. Wide cinematic composition, grounded and contemplative.",
    ].join(" "),
  },
  "minhanr-dev": {
    aspectRatio: "4:5",
    prompt: [
      "Editorial flat-lay photograph on soft Cloud Dancer off-white paper (#F0EFEB).",
      "A quiet-magazine composition: a single serif display letter rendered large in deep phthalo green ink (#123524),",
      "a thin vertical Transformative Teal accent bar to its left (#2F6364),",
      "fragments of typographic specimens, pressed botanical leaves, and hairline-ruled paper sheets arranged asymmetrically,",
      "a small swatch of Divine Damson (#4A2D3C) as an inkblot in the corner.",
      "Soft overhead natural light, long gentle shadow, medium format sharpness, matte texture.",
      "Palette: Cloud Dancer, Phthalo Green, Transformative Teal, Divine Damson. No neon, no digital glow, no warm red.",
      "Kinfolk-style editorial print quality.",
    ].join(" "),
  },
};

// ── Utilities ────────────────────────────────────────────────────────

/** Parse a KEY=value style .env file into a plain object. */
async function loadEnvFile(file) {
  if (!existsSync(file)) return {};
  const txt = await fs.readFile(file, "utf8");
  const map = {};
  for (const rawLine of txt.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    map[key] = value;
  }
  return map;
}

function parseArgs(argv) {
  const args = { force: false, dry: false, slug: null };
  for (const a of argv.slice(2)) {
    if (a === "--force") args.force = true;
    else if (a === "--dry" || a === "--dry-run") args.dry = true;
    else if (a.startsWith("--slug=")) args.slug = a.slice("--slug=".length);
    else if (a === "--help" || a === "-h") {
      console.log(
        "Usage: node scripts/generate-work-images.mjs [--force] [--dry] [--slug=NAME]"
      );
      process.exit(0);
    }
  }
  return args;
}

/** Call Imagen 3 with a prompt; return JPEG bytes. */
async function generateWithImagen({ apiKey, prompt, aspectRatio }) {
  const model = "imagen-3.0-generate-002";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`;
  const body = {
    instances: [{ prompt }],
    parameters: {
      sampleCount: 1,
      aspectRatio,
      personGeneration: "allow_adult",
      safetyFilterLevel: "block_some",
    },
  };
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const txt = await resp.text();
    const err = new Error(`Imagen ${resp.status}: ${txt.slice(0, 400)}`);
    err.status = resp.status;
    err.detail = txt;
    throw err;
  }
  const data = await resp.json();
  const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) {
    throw new Error(
      `Imagen returned no image: ${JSON.stringify(data).slice(0, 300)}`
    );
  }
  return Buffer.from(b64, "base64");
}

/** Fallback: Gemini 2.0 Flash with image response modality. */
async function generateWithGemini({ apiKey, prompt }) {
  const model = "gemini-2.0-flash-exp-image-generation";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
  };
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const txt = await resp.text();
    const err = new Error(`Gemini ${resp.status}: ${txt.slice(0, 400)}`);
    err.status = resp.status;
    err.detail = txt;
    throw err;
  }
  const data = await resp.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  for (const p of parts) {
    if (p.inlineData?.data) return Buffer.from(p.inlineData.data, "base64");
  }
  throw new Error(
    `Gemini returned no image: ${JSON.stringify(data).slice(0, 300)}`
  );
}

async function generate({ apiKey, prompt, aspectRatio }) {
  try {
    return await generateWithImagen({ apiKey, prompt, aspectRatio });
  } catch (err) {
    console.warn(
      `  [imagen fallback] ${err.message.split("\n")[0].slice(0, 160)}`
    );
    return await generateWithGemini({ apiKey, prompt });
  }
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv);

  // Merge env: workspace/.env first, local overrides.
  const env = {
    ...(await loadEnvFile(WORKSPACE_ENV)),
    ...(await loadEnvFile(LOCAL_ENV)),
  };
  const apiKey = env.VERTEX_AI_API_KEY || env.GEMINI_API_KEY;

  if (!args.dry && !apiKey) {
    console.error(
      "Missing VERTEX_AI_API_KEY (or GEMINI_API_KEY) in workspace/.env or .env.local"
    );
    process.exit(1);
  }

  const slugs = args.slug
    ? [args.slug]
    : Object.keys(PROMPTS);

  for (const slug of slugs) {
    const spec = PROMPTS[slug];
    if (!spec) {
      console.warn(`[skip] no prompt configured for ${slug}`);
      continue;
    }

    const outDir = path.join(OUT_ROOT, slug);
    const outFile = path.join(outDir, "cover.jpg");

    if (existsSync(outFile) && !args.force) {
      console.log(`[skip] ${slug} — cover exists. Use --force to regenerate.`);
      continue;
    }

    if (args.dry) {
      console.log(`\n── ${slug} (${spec.aspectRatio}) ──`);
      console.log(spec.prompt);
      continue;
    }

    console.log(`[gen ] ${slug} (${spec.aspectRatio})`);
    try {
      const bytes = await generate({
        apiKey,
        prompt: spec.prompt,
        aspectRatio: spec.aspectRatio,
      });
      await fs.mkdir(outDir, { recursive: true });
      await fs.writeFile(outFile, bytes);
      console.log(
        `[ok  ] ${path.relative(ROOT, outFile)} — ${(bytes.length / 1024).toFixed(0)} KB`
      );
    } catch (err) {
      console.error(`[fail] ${slug}: ${err.message}`);
    }
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
