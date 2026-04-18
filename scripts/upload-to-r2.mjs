#!/usr/bin/env node
/**
 * Upload all files under public/images/posts/ to R2 bucket minhanr-dev-images
 * under the `posts/` prefix. Uses wrangler CLI (already authenticated).
 *
 *   public/images/posts/<slug>/fig-1.png
 *     → r2://minhanr-dev-images/posts/<slug>/fig-1.png
 *
 * Concurrency-limited because each `wrangler r2 object put` invocation
 * spawns its own wrangler process (~1s startup each).
 */

import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const BUCKET = "minhanr-dev-images";
const LOCAL_DIR = path.resolve("public/images/posts");
const CONCURRENCY = 6;

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile()) yield full;
  }
}

function runWrangler(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn("npx", ["wrangler", ...args], {
      stdio: ["ignore", "pipe", "pipe"],
      shell: true,
    });
    let stderr = "";
    proc.stderr.on("data", (b) => (stderr += b.toString()));
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`exit ${code}: ${stderr.slice(-400)}`));
    });
  });
}

async function uploadOne(localPath) {
  const rel = path.relative(LOCAL_DIR, localPath).split(path.sep).join("/");
  const key = `posts/${rel}`;
  await runWrangler([
    "r2",
    "object",
    "put",
    `${BUCKET}/${key}`,
    `--file=${localPath}`,
    "--remote",
  ]);
  return key;
}

async function main() {
  const files = [];
  for await (const f of walk(LOCAL_DIR)) files.push(f);
  console.log(`Uploading ${files.length} files to r2://${BUCKET}/posts/  (concurrency=${CONCURRENCY})`);

  let done = 0;
  let failed = 0;
  let idx = 0;
  const started = Date.now();

  async function worker() {
    while (idx < files.length) {
      const i = idx++;
      const f = files[i];
      try {
        await uploadOne(f);
        done++;
        if (done % 25 === 0 || done === files.length) {
          const dt = ((Date.now() - started) / 1000).toFixed(0);
          console.log(`  ${done}/${files.length}  (${dt}s elapsed)`);
        }
      } catch (e) {
        failed++;
        console.error(`  FAIL ${path.relative(LOCAL_DIR, f)} — ${e.message.split("\n")[0]}`);
      }
    }
  }

  await Promise.all(Array(CONCURRENCY).fill(0).map(() => worker()));
  const dt = ((Date.now() - started) / 1000).toFixed(0);
  console.log(`\ndone in ${dt}s.  uploaded=${done}  failed=${failed}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
