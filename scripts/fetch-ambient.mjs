#!/usr/bin/env node
/**
 * Fetch CC0-licensed ambient audio tracks to `/public/ambient/`.
 *
 * Usage:
 *   node scripts/fetch-ambient.mjs                # all tracks, skip existing
 *   node scripts/fetch-ambient.mjs --force        # re-download
 *   node scripts/fetch-ambient.mjs --track rain   # single track
 *
 * Sources are Internet Archive items explicitly marked CC0 1.0
 * (public domain, commercial use OK, no attribution required). URLs
 * are preserved here so a later audit can confirm the license status
 * of the artifact actually shipped.
 */

import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.resolve(ROOT, "public/ambient");

/** Per-track candidate URLs — the fetcher tries each in order and
 *  stops at the first 200. Keep at least two CC0-verified sources
 *  per track so a CDN hiccup doesn't brick the script. */
const TRACKS = {
  rain: {
    label: "Rain on glass (dark theme)",
    license:
      "CC0 1.0 Universal — Internet Archive, relaxingrainsounds collection",
    candidates: [
      "https://archive.org/download/relaxingrainsounds/Rain%20Sounds.mp3",
      "https://archive.org/download/relaxingrainsounds/Tropical%20Rain.mp3",
      "https://archive.org/download/relaxingrainsounds/Light%20Gentle%20Rain%20Part%201.mp3",
    ],
  },
  waves: {
    label: "Gentle ocean waves (light theme)",
    license:
      "CC0 1.0 Universal — Internet Archive, ocean-sea-sounds collection",
    candidates: [
      "https://archive.org/download/ocean-sea-sounds/Gentle%20Ocean.mp3",
      "https://archive.org/download/ocean-sea-sounds/Ocean%20Sound%20Nature%20Sounds.mp3",
      "https://archive.org/download/ocean-sea-sounds/Those_Relaxing_Sounds_of_Waves_-_Ocean_Sounds_1080p_HD_Video_with_Tropical_Beaches%20Part%201.mp3",
    ],
  },
};

function parseArgs(argv) {
  const args = { force: false, track: null };
  const a = argv.slice(2);
  for (let i = 0; i < a.length; i++) {
    const tok = a[i];
    if (tok === "--force") args.force = true;
    else if (tok === "--track" && i + 1 < a.length) {
      args.track = a[i + 1];
      i++;
    } else if (tok === "--help" || tok === "-h") {
      console.log(
        "Usage: node scripts/fetch-ambient.mjs [--force] [--track <name>]"
      );
      console.log("Tracks:", Object.keys(TRACKS).join(", "));
      process.exit(0);
    }
  }
  return args;
}

async function tryFetch(url) {
  const resp = await fetch(url, {
    redirect: "follow",
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${url}`);
  const buf = Buffer.from(await resp.arrayBuffer());
  if (buf.length < 10_000) {
    throw new Error(`Suspiciously small payload (${buf.length}b) — probably HTML`);
  }
  return buf;
}

async function downloadTrack(name, spec, { force }) {
  const outFile = path.resolve(OUT_DIR, `${name}.mp3`);
  if (existsSync(outFile) && !force) {
    console.log(`[skip] ${name}.mp3 exists — use --force to re-download`);
    return;
  }
  console.log(`[try ] ${name} — ${spec.label}`);
  for (const url of spec.candidates) {
    try {
      const bytes = await tryFetch(url);
      await fs.writeFile(outFile, bytes);
      console.log(
        `[ok  ] ${path.relative(ROOT, outFile)} — ${(bytes.length / 1024).toFixed(0)} KB — ${url}`
      );
      return;
    } catch (err) {
      console.log(`[miss] ${url} — ${String(err).slice(0, 140)}`);
    }
  }
  console.error(
    `[fail] ${name} — all candidate URLs failed. Add a working URL or place the file at ${path.relative(ROOT, outFile)} manually.`
  );
}

async function main() {
  const args = parseArgs(process.argv);
  await fs.mkdir(OUT_DIR, { recursive: true });
  const names = args.track ? [args.track] : Object.keys(TRACKS);
  for (const name of names) {
    const spec = TRACKS[name];
    if (!spec) {
      console.error(`Unknown track: ${name}`);
      process.exit(1);
    }
    await downloadTrack(name, spec, { force: args.force });
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
