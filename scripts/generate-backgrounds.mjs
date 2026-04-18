#!/usr/bin/env node
/**
 * Generate the full-page background image via Imagen 4.
 *
 * The site background is a single 16:9 landscape placed behind every
 * public page. A slow Ken-Burns CSS animation on top gives it the
 * "gentle video" feel without the weight (or API cost, or autoplay
 * restrictions) of an actual video file.
 *
 *   node scripts/generate-backgrounds.mjs              # skip if exists
 *   node scripts/generate-backgrounds.mjs --force      # regenerate
 *   node scripts/generate-backgrounds.mjs --dry        # print prompt only
 *
 * Uses the same VERTEX_AI_API_KEY as the work-cover pipeline and the
 * same Nano-Banana-Pro → Imagen-4 primary/fallback shape.
 */

import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const WORKSPACE_ENV = path.resolve(ROOT, "../.env");
const LOCAL_ENV = path.resolve(ROOT, ".env.local");
const OUT_FILE = path.resolve(ROOT, "public/bg.jpg");

const PROMPT = [
  "Editorial cinematic abstract background, medium format aesthetic.",
  "Deep phthalo-green water surface viewed from slightly above,",
  "slow-moving volumetric fog drifting across the frame,",
  "scattered pinpoints of soft ember-warm light like distant lanterns,",
  "a cool teal glow bleeding through from the horizon line,",
  "organic negative space, painterly depth, subtle film grain.",
  "Palette: deep phthalo green, Cloud Dancer off-white highlights,",
  "Transformative Teal in the distant haze, a single Divine Damson ember.",
  "Wide cinematic aspect, shot on medium format film, soft focus,",
  "no text, no people, no logos, no neon, no vignette overlay.",
  "Composition works as a seamless background — centre-weighted,",
  "edges fade to dark for readable overlay text.",
].join(" ");

const ASPECT_RATIO = "16:9";

// ── Env loader (copy-aligned with generate-work-images.mjs) ──────────

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
  const args = { force: false, dry: false };
  for (const a of argv.slice(2)) {
    if (a === "--force") args.force = true;
    else if (a === "--dry" || a === "--dry-run") args.dry = true;
    else if (a === "--help" || a === "-h") {
      console.log("Usage: node scripts/generate-backgrounds.mjs [--force] [--dry]");
      process.exit(0);
    }
  }
  return args;
}

async function generateWithNanoBanana({ apiKey, prompt, aspectRatio }) {
  const model = "gemini-3-pro-image-preview";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const body = {
    contents: [
      {
        parts: [{ text: `${prompt}\n\n(aspect ratio: ${aspectRatio})` }],
      },
    ],
    generationConfig: {
      responseModalities: ["IMAGE"],
      imageConfig: { aspectRatio },
    },
  };
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`NanoBanana ${resp.status}: ${txt.slice(0, 400)}`);
  }
  const data = await resp.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  for (const p of parts) {
    if (p.inlineData?.data) return Buffer.from(p.inlineData.data, "base64");
  }
  throw new Error(`NanoBanana returned no image: ${JSON.stringify(data).slice(0, 300)}`);
}

async function generateWithImagen({ apiKey, prompt, aspectRatio }) {
  const model = "imagen-4.0-generate-001";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`;
  const body = {
    instances: [{ prompt }],
    parameters: {
      sampleCount: 1,
      aspectRatio,
      personGeneration: "dont_allow",
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
    throw new Error(`Imagen ${resp.status}: ${txt.slice(0, 400)}`);
  }
  const data = await resp.json();
  const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) throw new Error(`Imagen returned no image: ${JSON.stringify(data).slice(0, 300)}`);
  return Buffer.from(b64, "base64");
}

async function generate({ apiKey, prompt, aspectRatio }) {
  try {
    return await generateWithNanoBanana({ apiKey, prompt, aspectRatio });
  } catch (err) {
    console.warn(`  [nano banana → imagen fallback] ${String(err).slice(0, 180)}`);
    return await generateWithImagen({ apiKey, prompt, aspectRatio });
  }
}

async function main() {
  const args = parseArgs(process.argv);

  if (args.dry) {
    console.log(`── background (${ASPECT_RATIO}) ──`);
    console.log(PROMPT);
    return;
  }

  const env = {
    ...(await loadEnvFile(WORKSPACE_ENV)),
    ...(await loadEnvFile(LOCAL_ENV)),
  };
  const apiKey = env.VERTEX_AI_API_KEY || env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Missing VERTEX_AI_API_KEY in workspace/.env or .env.local");
    process.exit(1);
  }

  if (existsSync(OUT_FILE) && !args.force) {
    console.log(`[skip] ${path.relative(ROOT, OUT_FILE)} exists. Use --force to regenerate.`);
    return;
  }

  console.log(`[gen ] background (${ASPECT_RATIO})`);
  const bytes = await generate({ apiKey, prompt: PROMPT, aspectRatio: ASPECT_RATIO });
  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
  await fs.writeFile(OUT_FILE, bytes);
  console.log(
    `[ok  ] ${path.relative(ROOT, OUT_FILE)} — ${(bytes.length / 1024).toFixed(0)} KB`
  );
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
