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
// Each prompt is a cinematic editorial brief tuned to the brand palette
// (deep ink ground, ivory text, warm vermilion accent). Keep the subject
// abstract and visual — avoid literal UI screenshots.
const PROMPTS = {
  "oikbas-ecosystem": {
    aspectRatio: "4:5",
    prompt: [
      "Editorial cinematic photograph, medium format aesthetic.",
      "Abstract visualization of an autonomous knowledge system:",
      "seven glowing luminous nodes connected by soft flowing threads of light,",
      "suspended in a deep ink-blue volumetric haze.",
      "One node glows warm vermilion — the others pale ivory.",
      "Composition: negative space top-left, nodes clustered bottom-right.",
      "Soft caustic light, gentle film grain, shallow depth of field.",
      "No text, no UI, no logos. Editorial print quality.",
    ].join(" "),
  },
  "vfx-research-pipeline": {
    aspectRatio: "16:9",
    prompt: [
      "Cinematic still, editorial tone, shot on medium format film.",
      "A lone silhouetted figure in a dark studio,",
      "illuminated by a single volumetric beam of warm vermilion light",
      "cutting across dense atmospheric haze.",
      "The figure studies projected abstract geometric forms on a wall —",
      "soft caustic patterns, deep shadow, subtle film grain.",
      "Palette: deep ink blue-black, ivory highlights, warm vermilion accent.",
      "No text, no logos, no recognizable products. Wide cinematic composition.",
    ].join(" "),
  },
  "minhanr-dev": {
    aspectRatio: "4:5",
    prompt: [
      "Editorial flat-lay photograph on warm cream paper background.",
      "A minimal quiet-magazine composition: a single serif display letter rendered large,",
      "a thin vermilion accent bar to its left,",
      "fragments of typographic specimens and hairline-ruled paper sheets arranged asymmetrically.",
      "Overhead lighting, soft shadow, medium format sharpness.",
      "Palette: cream ivory, graphite ink, warm vermilion.",
      "No text content, no logos. Editorial print quality, Kinfolk-style.",
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
