#!/usr/bin/env node
/**
 * Generate time-of-day background scenes via Imagen 4 / Nano Banana Pro.
 *
 * Six editorial scenes rotate through the day on the public pages
 * (see src/lib/scenes.ts for the hour mapping). Each is a 16:9
 * full-bleed image designed to sit under the WebGL rain canvas —
 * lots of small bright highlights against a dark field give each
 * water droplet something visually rich to magnify.
 *
 *   node scripts/generate-backgrounds.mjs                     # all, skip existing
 *   node scripts/generate-backgrounds.mjs --force             # all, force
 *   node scripts/generate-backgrounds.mjs --scene forest      # one scene only
 *   node scripts/generate-backgrounds.mjs --dry               # print prompts, generate nothing
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
const OUT_DIR = path.resolve(ROOT, "public/scenes");
/** Legacy fallback file — kept in sync with the first scene so any
 *  surface hard-coded to /bg.jpg still looks like the current brand. */
const LEGACY_OUT = path.resolve(ROOT, "public/bg.jpg");

const ASPECT_RATIO = "16:9";

/** Shared palette / composition line appended to every prompt so all
 *  six scenes read as one family under the rain canvas. */
const COMMON = [
  "Editorial cinematic abstract background, medium format aesthetic.",
  "Palette leans deep Prussian-night blue overall,",
  "with Overcast Mist off-white highlights, Signal Cobalt mid-tones,",
  "a single Amethyst Shadow bloom in the far distance.",
  "Designed to be refracted by a rain-on-glass canvas layer on top —",
  "lots of small bright highlights against a dark field give each",
  "water droplet something visually rich to magnify.",
  "Wide cinematic aspect, shot on medium format film, long exposure.",
  "No text, no people, no logos, no readable signage, no vignette overlay,",
  "no anamorphic flares.",
  "Composition works as a seamless background — centre-weighted,",
  "edges fade to near-black for readable overlay text.",
].join(" ");

/** Dark-theme scenes share the `COMMON` stormy-blue suffix. */
const DARK_SCENES = [
  {
    name: "harbour",
    theme: "dark",
    label: "Pre-dawn harbour",
    prompt: [
      "Rainy harbour viewed from a dock at 4am,",
      "distant ship running lights glow as small warm-white pinpricks,",
      "volumetric fog rolls across the water,",
      "a thin cool signal-cobalt band on the horizon hints at sunrise,",
    ].join(" "),
  },
  {
    name: "forest",
    theme: "dark",
    label: "Misty forest morning",
    prompt: [
      "Deep pine forest at blue-hour morning,",
      "narrow shafts of cool signal-cobalt light pierce through",
      "a dense drift of fog between the trunks,",
      "tiny dewdrop-lit leaves catch the light like bokeh,",
    ].join(" "),
  },
  {
    name: "peaks",
    theme: "dark",
    label: "Cloud peaks",
    prompt: [
      "High mountain peaks rising above a dense cloud sea at midday,",
      "a pale Overcast Mist diffuses across the entire upper frame,",
      "scattered lens-flare pinpricks where stray sun catches moisture,",
      "a single Amethyst Shadow streak along the furthest ridge,",
    ].join(" "),
  },
  {
    name: "shore",
    theme: "dark",
    label: "Overcast shore",
    prompt: [
      "Stormy coastline seen through a sheet of drifting sea mist,",
      "wet sand reflects cold cobalt-blue sky,",
      "distant breaker crests read as small bright arcs,",
      "a far-off lighthouse beam diffused through the haze,",
    ].join(" "),
  },
  {
    name: "skyline",
    theme: "dark",
    label: "Dusk city skyline",
    prompt: [
      "City skyline at rain-heavy dusk,",
      "hundreds of warm-white window lights scattered across",
      "a deep Prussian-night backdrop like a field of bokeh stars,",
      "silhouetted architecture anchors the bottom third,",
      "a cool signal-cobalt atmospheric haze thickens toward the top,",
    ].join(" "),
  },
  {
    name: "night-city",
    theme: "dark",
    label: "Late-night downtown",
    prompt: [
      "Downtown intersection seen from above at 3am,",
      "reflective wet streets double every street-light as a bright pinprick,",
      "distant shop-window glow scatters in the fog,",
      "a single amethyst-violet neon sign bleeds through the rain moisture,",
    ].join(" "),
  },
];

/** Bright, clear-weather scenes for the Light theme. Compositionally
 *  the sunny counterpart to the rainy DARK set — same medium-format
 *  cinematic treatment, but the palette swings to warm golden +
 *  signal-blue sky instead of prussian-night. */
const LIGHT_SCENES = [
  {
    name: "sunrise-beach",
    theme: "light",
    label: "Sunrise beach",
    prompt: [
      "Wide empty beach at golden sunrise,",
      "soft pastel peach and signal-cobalt sky, low sun behind thin cirrus,",
      "lines of retreating foam on wet sand,",
      "a single distant fishing boat silhouette,",
      "warm-white highlights scattered across calm water,",
    ].join(" "),
  },
  {
    name: "noon-beach",
    theme: "light",
    label: "Bright noon beach",
    prompt: [
      "Tropical lagoon at midday in brilliant sun,",
      "turquoise signal-cobalt water against white sand,",
      "sharp specular highlights on every wavelet,",
      "a scatter of pale wildflowers in the sand dunes at frame edges,",
      "high sun, clear sky, no clouds except a single distant contrail,",
    ].join(" "),
  },
  {
    name: "sunset-beach",
    theme: "light",
    label: "Golden hour shore",
    prompt: [
      "Quiet shoreline at golden hour,",
      "sun just off-frame low-right, warm amber washing over wet sand,",
      "long-shadow dunes reading as soft amethyst-shadow silhouettes,",
      "gentle surf leaves glassy reflective sheets,",
      "a lone driftwood form anchors the foreground,",
    ].join(" "),
  },
];

/** Fog-leaning scenes for the Gray theme — compositionally calm, lots
 *  of grey diffuse light, a mid-tone neutral cast for the daytime
 *  interior-lit working mode. */
const GRAY_SCENES = [
  {
    name: "morning-fog",
    theme: "gray",
    label: "Morning fog bank",
    prompt: [
      "Rolling pasture drowned in morning fog,",
      "desaturated cool-grey tonality throughout,",
      "a line of barely-visible tree silhouettes recedes into white-out,",
      "glistening dew catches what little light there is as tiny specular points,",
      "quiet, contemplative, evenly-lit from above,",
    ].join(" "),
  },
  {
    name: "overcast-harbour",
    theme: "gray",
    label: "Overcast harbour",
    prompt: [
      "Working harbour under solid grey overcast sky,",
      "cold signal-cobalt water, restrained greys dominate the frame,",
      "a moored ferry silhouette mid-distance,",
      "warm pinpoint dock lights already on despite daylight,",
      "weather flat and diffuse with no shadow direction,",
    ].join(" "),
  },
];

const SCENES = [...DARK_SCENES, ...LIGHT_SCENES, ...GRAY_SCENES];

// ── Env loader ───────────────────────────────────────────────────

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
  const args = { force: false, dry: false, scene: null };
  const a = argv.slice(2);
  for (let i = 0; i < a.length; i++) {
    const tok = a[i];
    if (tok === "--force") args.force = true;
    else if (tok === "--dry" || tok === "--dry-run") args.dry = true;
    else if (tok === "--scene" && i + 1 < a.length) {
      args.scene = a[i + 1];
      i++;
    } else if (tok === "--help" || tok === "-h") {
      console.log(
        "Usage: node scripts/generate-backgrounds.mjs [--force] [--dry] [--scene <name>]"
      );
      console.log("Scenes:", SCENES.map((s) => s.name).join(", "));
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
  const selected = args.scene
    ? SCENES.filter((s) => s.name === args.scene)
    : SCENES;

  if (selected.length === 0) {
    console.error(`No scene matches "${args.scene}". Known:`, SCENES.map((s) => s.name).join(", "));
    process.exit(1);
  }

  if (args.dry) {
    for (const s of selected) {
      console.log(`── ${s.name} (${s.label}) ──`);
      console.log(`${s.prompt} ${COMMON}\n`);
    }
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

  await fs.mkdir(OUT_DIR, { recursive: true });

  for (const scene of selected) {
    const outFile = path.resolve(OUT_DIR, `${scene.name}.jpg`);
    if (existsSync(outFile) && !args.force) {
      console.log(`[skip] ${path.relative(ROOT, outFile)} exists. Use --force to regenerate.`);
      continue;
    }
    console.log(`[gen ] ${scene.name} — ${scene.label}`);
    const prompt = `${scene.prompt} ${COMMON}`;
    const bytes = await generate({ apiKey, prompt, aspectRatio: ASPECT_RATIO });
    await fs.writeFile(outFile, bytes);
    console.log(
      `[ok  ] ${path.relative(ROOT, outFile)} — ${(bytes.length / 1024).toFixed(0)} KB`
    );
  }

  // Mirror the first requested scene into /public/bg.jpg as the
  // legacy fallback. Anything that still hard-codes /bg.jpg (OG image
  // placeholder, no-JS fallback) picks up the new palette without
  // touching every call site.
  const first = selected[0];
  const sourceFile = path.resolve(OUT_DIR, `${first.name}.jpg`);
  if (existsSync(sourceFile)) {
    await fs.copyFile(sourceFile, LEGACY_OUT);
    console.log(`[copy] ${first.name}.jpg → public/bg.jpg (legacy fallback)`);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
