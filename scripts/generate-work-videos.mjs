#!/usr/bin/env node
/**
 * Generate short looping demo videos for every Work item in src/lib/work.ts.
 *
 *   node scripts/generate-work-videos.mjs              # generate missing
 *   node scripts/generate-work-videos.mjs --force      # regenerate all
 *   node scripts/generate-work-videos.mjs --slug=foo   # one slug
 *   node scripts/generate-work-videos.mjs --dry        # print prompts only
 *   node scripts/generate-work-videos.mjs --model=veo-3.0-generate-preview
 *
 * Uses Google Veo via the Generative Language API (api key auth).
 * Reads VERTEX_AI_API_KEY (or GEMINI_API_KEY) from workspace/.env.
 *
 * Video saved as MP4 at:
 *   public/work/<slug>/demo.mp4
 *
 * Veo is a long-running operation: the initial POST returns an operation
 * name; the script polls until `done: true`, then downloads the MP4.
 *
 * ⚠ Veo is not on the free tier — this burns Vertex AI billing. Use
 * --dry to inspect prompts before running for real.
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

const DEFAULT_MODEL = "veo-2.0-generate-001";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

// ── Prompts — one per work slug ──────────────────────────────────────
// Each prompt describes a 4–8 second silent atmospheric clip that will
// loop behind the Work grid / case study hero. Palette + tone match
// generate-work-images.mjs so the still cover and the motion loop read
// as one family.
const PROMPTS = {
  "oikbas-ecosystem": {
    aspectRatio: "9:16",
    durationSeconds: 6,
    prompt: [
      "Editorial cinematic slow-motion abstract sequence, medium format film aesthetic.",
      "Seven soft luminous nodes suspended in a deep Prussian-night atmospheric haze (#0E1A2E),",
      "connected by thin organic threads that gently pulse with traveling light.",
      "The nodes glow pale Overcast Mist off-white (#E8EEF7);",
      "one accented with Signal Cobalt (#3D7AB3), another with Amethyst Shadow violet (#5B5F99).",
      "Camera drifts laterally at an almost-still pace, slight parallax between node layers.",
      "Soft diffused studio light, fine film grain, matte finish, shallow depth of field.",
      "No text, no UI, no logos, no neon, no digital glow, no warm red, no green cast.",
      "Cool stormy atmosphere, grounded contemplative tone, seamlessly loopable.",
    ].join(" "),
  },
  "vfx-research-pipeline": {
    aspectRatio: "16:9",
    durationSeconds: 8,
    prompt: [
      "Cinematic silent still-motion sequence, editorial tone, shot on medium format film.",
      "A lone silhouetted figure in a dim Prussian-night studio (#0E1A2E),",
      "illuminated by a single soft beam of Signal Cobalt light (#3D7AB3)",
      "slowly sweeping across misty atmospheric haze.",
      "Projected abstract geometric forms drift across a wall —",
      "soft caustic patterns in Overcast Mist off-white (#E8EEF7),",
      "a faint Amethyst Shadow violet reflection (#5B5F99).",
      "Near-static camera, glacial movement, subtle film grain, natural matte surfaces.",
      "No text, no logos, no neon, no warm red, no green cast, no fast cuts.",
      "Wide cinematic composition, contemplative, seamlessly loopable.",
    ].join(" "),
  },
  "minhanr-dev": {
    aspectRatio: "9:16",
    durationSeconds: 6,
    prompt: [
      "Overhead cinematic macro sequence of an editorial flat-lay on Overcast Mist off-white paper (#E8EEF7),",
      "viewed through a rain-dotted windowpane. Water droplets slowly slide down the glass,",
      "catching pale highlights and refracting a single Signal Cobalt accent bar (#3D7AB3)",
      "positioned beside a large serif display letter in Prussian-night ink (#0E1A2E).",
      "A small Amethyst Shadow violet inkblot (#5B5F99) sits in the corner.",
      "Soft overhead natural light, long gentle shadow, medium format sharpness, matte texture.",
      "Almost-still camera, only the droplets and a faint paper breathing move.",
      "No neon, no digital glow, no warm red, no green cast, no text rendered by the model.",
      "Kinfolk-style editorial print quality, seamlessly loopable.",
    ].join(" "),
  },
};

// ── Utilities ────────────────────────────────────────────────────────

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
  const args = {
    force: false,
    dry: false,
    slug: null,
    model: DEFAULT_MODEL,
    pollIntervalMs: 10_000,
    pollMaxAttempts: 60, // ≈ 10 min ceiling per clip
  };
  for (const a of argv.slice(2)) {
    if (a === "--force") args.force = true;
    else if (a === "--dry" || a === "--dry-run") args.dry = true;
    else if (a.startsWith("--slug=")) args.slug = a.slice("--slug=".length);
    else if (a.startsWith("--model=")) args.model = a.slice("--model=".length);
    else if (a === "--help" || a === "-h") {
      console.log(
        "Usage: node scripts/generate-work-videos.mjs [--force] [--dry] [--slug=NAME] [--model=veo-2.0-generate-001]"
      );
      process.exit(0);
    }
  }
  return args;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** POST models/{model}:predictLongRunning → returns operation name. */
async function startVideoGeneration({
  apiKey,
  model,
  prompt,
  aspectRatio,
  durationSeconds,
}) {
  const url = `${API_BASE}/models/${model}:predictLongRunning?key=${apiKey}`;
  const body = {
    instances: [{ prompt }],
    parameters: {
      aspectRatio,
      durationSeconds,
      personGeneration: "allow_adult",
      sampleCount: 1,
    },
  };
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Veo start ${resp.status}: ${txt.slice(0, 400)}`);
  }
  const data = await resp.json();
  if (!data.name) {
    throw new Error(
      `Veo start: missing operation name — ${JSON.stringify(data).slice(0, 300)}`
    );
  }
  return data.name; // e.g. "models/veo-2.0-generate-001/operations/abcd1234"
}

/** GET operation status until done: true. Returns the final op payload. */
async function pollOperation({ apiKey, opName, intervalMs, maxAttempts }) {
  const url = `${API_BASE}/${opName}?key=${apiKey}`;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const resp = await fetch(url);
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(
        `Veo poll ${resp.status} (attempt ${attempt}): ${txt.slice(0, 300)}`
      );
    }
    const data = await resp.json();
    if (data.done) {
      if (data.error) {
        throw new Error(`Veo failed: ${JSON.stringify(data.error)}`);
      }
      return data;
    }
    process.stdout.write(".");
    await sleep(intervalMs);
  }
  throw new Error(`Veo polling timed out after ${maxAttempts} attempts`);
}

/** Extract MP4 bytes from a completed Veo operation payload. */
async function extractVideoBytes({ apiKey, opResult }) {
  // Two possible response shapes depending on API revision:
  //   1) response.generatedSamples[0].video.uri  (requires GET with key)
  //   2) response.predictions[0].bytesBase64Encoded
  //   3) response.generateVideoResponse.generatedSamples[0].video.uri
  const resp = opResult.response ?? {};
  const tryBase64 = resp.predictions?.[0]?.bytesBase64Encoded;
  if (tryBase64) return Buffer.from(tryBase64, "base64");

  const sample =
    resp.generatedSamples?.[0] ??
    resp.generateVideoResponse?.generatedSamples?.[0];
  const uri = sample?.video?.uri ?? sample?.uri;
  if (uri) {
    const sep = uri.includes("?") ? "&" : "?";
    const dl = await fetch(`${uri}${sep}key=${apiKey}`);
    if (!dl.ok) {
      throw new Error(
        `Veo download ${dl.status}: ${(await dl.text()).slice(0, 200)}`
      );
    }
    return Buffer.from(await dl.arrayBuffer());
  }

  throw new Error(
    `Veo returned no recognizable video payload: ${JSON.stringify(resp).slice(0, 300)}`
  );
}

async function generate({
  apiKey,
  model,
  prompt,
  aspectRatio,
  durationSeconds,
  pollIntervalMs,
  pollMaxAttempts,
}) {
  const opName = await startVideoGeneration({
    apiKey,
    model,
    prompt,
    aspectRatio,
    durationSeconds,
  });
  console.log(`  op: ${opName}`);
  const opResult = await pollOperation({
    apiKey,
    opName,
    intervalMs: pollIntervalMs,
    maxAttempts: pollMaxAttempts,
  });
  return await extractVideoBytes({ apiKey, opResult });
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv);

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

  const slugs = args.slug ? [args.slug] : Object.keys(PROMPTS);

  for (const slug of slugs) {
    const spec = PROMPTS[slug];
    if (!spec) {
      console.warn(`[skip] no prompt configured for ${slug}`);
      continue;
    }

    const outDir = path.join(OUT_ROOT, slug);
    const outFile = path.join(outDir, "demo.mp4");

    if (existsSync(outFile) && !args.force) {
      console.log(`[skip] ${slug} — demo.mp4 exists. Use --force to regenerate.`);
      continue;
    }

    if (args.dry) {
      console.log(
        `\n── ${slug} (${spec.aspectRatio}, ${spec.durationSeconds}s, ${args.model}) ──`
      );
      console.log(spec.prompt);
      continue;
    }

    console.log(
      `[gen ] ${slug} (${spec.aspectRatio}, ${spec.durationSeconds}s)`
    );
    try {
      const bytes = await generate({
        apiKey,
        model: args.model,
        prompt: spec.prompt,
        aspectRatio: spec.aspectRatio,
        durationSeconds: spec.durationSeconds,
        pollIntervalMs: args.pollIntervalMs,
        pollMaxAttempts: args.pollMaxAttempts,
      });
      await fs.mkdir(outDir, { recursive: true });
      await fs.writeFile(outFile, bytes);
      console.log(
        `\n[ok  ] ${path.relative(ROOT, outFile)} — ${(bytes.length / 1024 / 1024).toFixed(2)} MB`
      );
    } catch (err) {
      console.error(`\n[fail] ${slug}: ${err.message}`);
    }
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
