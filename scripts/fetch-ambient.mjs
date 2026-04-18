#!/usr/bin/env node
/**
 * Fetch commercially-usable ambient audio tracks to `/public/ambient/`.
 *
 * Usage:
 *   node scripts/fetch-ambient.mjs                # all tracks, skip existing
 *   node scripts/fetch-ambient.mjs --force        # re-download
 *   node scripts/fetch-ambient.mjs --track rain   # single track
 *
 * URL sources below are sane defaults. If one breaks (CDN rotation /
 * takedown), edit the TRACKS table — every URL is preserved here so
 * an audit can verify the license of the artifact we actually shipped.
 *
 * All URLs listed MUST be from sources that explicitly allow commercial
 * use with no attribution:
 *   • Pixabay Content License — https://pixabay.com/service/license-summary/
 *   • Mixkit Free License     — https://mixkit.co/license
 *   • CC0 (public domain)     — https://creativecommons.org/publicdomain/zero/1.0/
 */

import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.resolve(ROOT, "public/ambient");

/** Per-track candidate URLs — the fetcher tries each in order and
 *  stops at the first 200. Edit to swap a track; keep at least one
 *  working source per name to avoid a missing file in production. */
const TRACKS = {
  rain: {
    label: "Rain on glass (dark theme)",
    license: "Pixabay Content License — commercial use, no attribution",
    candidates: [
      "https://cdn.pixabay.com/audio/2022/03/15/audio_ec3f1a4c35.mp3",
      "https://cdn.pixabay.com/audio/2022/10/21/audio_fa5ac1c8a5.mp3",
    ],
  },
  wind: {
    label: "Soft wind (gray theme)",
    license: "Pixabay Content License — commercial use, no attribution",
    candidates: [
      "https://cdn.pixabay.com/audio/2022/03/24/audio_d5f3c84eae.mp3",
      "https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3",
    ],
  },
  nature: {
    label: "Birdsong / grass (light theme)",
    license: "Pixabay Content License — commercial use, no attribution",
    candidates: [
      "https://cdn.pixabay.com/audio/2022/05/16/audio_db6591201e.mp3",
      "https://cdn.pixabay.com/audio/2022/11/22/audio_febc508a8c.mp3",
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
