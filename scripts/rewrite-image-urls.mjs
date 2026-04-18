#!/usr/bin/env node
/**
 * Rewrite local /images/posts/ references in published posts to the
 * R2 public URL. Run once after upload-to-r2.mjs has finished.
 *
 *   /images/posts/<slug>/fig-1.png
 *     → https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev/posts/<slug>/fig-1.png
 *
 * Body only; frontmatter preserved.
 */

import fs from "node:fs/promises";
import path from "node:path";

const POSTS_DIR = path.resolve("src/content/posts");
const R2_BASE = "https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev";
const LOCAL_PREFIX = "/images/posts/";
const R2_PREFIX = `${R2_BASE}/posts/`;

const args = process.argv.slice(2);
const DRY = args.includes("--dry");

async function main() {
  const files = (await fs.readdir(POSTS_DIR)).filter((f) => f.endsWith(".md"));
  let changed = 0;
  let hits = 0;
  for (const f of files) {
    const full = path.join(POSTS_DIR, f);
    const raw = await fs.readFile(full, "utf8");
    if (!raw.includes(LOCAL_PREFIX)) continue;
    const n = (raw.match(/\/images\/posts\//g) || []).length;
    const next = raw.split(LOCAL_PREFIX).join(R2_PREFIX);
    if (next === raw) continue;
    hits += n;
    changed++;
    if (DRY) {
      console.log(`  [dry]   ${f}  (${n} refs)`);
    } else {
      await fs.writeFile(full, next);
      console.log(`  [write] ${f}  (${n} refs)`);
    }
  }
  console.log(`\nfiles=${changed}  refs=${hits}  dry=${DRY}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
