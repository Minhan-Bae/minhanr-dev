#!/usr/bin/env node
/**
 * Enrich blog posts with author-published images from referenced sources.
 *
 * Flow per post:
 *   1. Extract arXiv IDs (bare `arXiv 2603.12621` refs + full URLs) and
 *      other http URLs from body
 *   2. For each arXiv ID: try arxiv.org/html/<id>vN for the first real
 *      paper figure (ltx_figure class). Fall back to HF Papers thumb.
 *   3. For other URLs: fetch and read og:image, filtered against generic
 *      logos.
 *   4. Download up to MAX_FIGURES images → public/images/posts/<slug>/fig-N.<ext>
 *   5. Insert figure block (with source attribution) into the body after
 *      the opening blockquote if present, else after the first h1.
 *   6. Frontmatter is preserved byte-for-byte — body-only edit.
 *
 * No image generation — collection only. Posts that already contain
 * /images/posts/ references are skipped.
 *
 * Usage:
 *   node scripts/enrich-posts.mjs --slug=<slug> --dry       # preview one
 *   node scripts/enrich-posts.mjs --slug=<slug>             # apply one
 *   node scripts/enrich-posts.mjs --all --dry               # preview all
 *   node scripts/enrich-posts.mjs --all                     # apply all
 *   node scripts/enrich-posts.mjs --all --limit 5           # first 5 only
 */

import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";

const POSTS_DIR = path.resolve("src/content/posts");
const TMP_DIR = path.join(os.tmpdir(), "enrich-posts-cache");
const R2_BUCKET = "minhanr-dev-images";
const R2_PUBLIC_BASE = "https://pub-bf98fbd7060e48f2890b4674e66d02b1.r2.dev";
const MAX_FIGURES = 2;
const MIN_IMAGE_BYTES = 10_000;
const ARXIV_VERSIONS = ["v1", "v2", "v3"];
const UA = "Mozilla/5.0 (compatible; minhanr.dev-enrich/0.3; +https://minhanr.dev)";
const FETCH_TIMEOUT_MS = 8000;

const BAD_IMAGE_PATTERNS = [
  /arxiv-logo/i,
  /github-logo|github-octocat|github-default/i,
  /huggingface-logo|hf-logo/i,
  /\/favicon/i,
  /default[-_]social/i,
  /open[-_]graph[-_]default/i,
];

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n) => {
  const eq = args.find((a) => a.startsWith(`${n}=`));
  if (eq) return eq.slice(n.length + 1);
  const i = args.indexOf(n);
  return i >= 0 && i + 1 < args.length ? args[i + 1] : null;
};
const DRY = flag("--dry");
const SLUG = opt("--slug");
const ALL = flag("--all");
const LIMIT = parseInt(opt("--limit") || "0", 10) || 0;

function splitFrontmatter(raw) {
  if (!raw.startsWith("---")) return { fm: "", body: raw };
  const end = raw.indexOf("\n---", 3);
  if (end < 0) return { fm: "", body: raw };
  const fmEnd = end + 4;
  return { fm: raw.slice(0, fmEnd), body: raw.slice(fmEnd).replace(/^\r?\n/, "") };
}

function gatherSources(body) {
  const arxivIds = new Set();
  const otherUrls = new Set();
  for (const m of body.matchAll(/\b(?:arXiv|HF)[\s:]+(\d{4}\.\d{4,5})\b/gi)) {
    arxivIds.add(m[1]);
  }
  for (const m of body.matchAll(/https?:\/\/[^\s)>\]"']+/g)) {
    const clean = m[0].replace(/[.,;:!?]+$/, "");
    const arxivMatch = clean.match(/arxiv\.org\/(?:abs|pdf|html)\/(\d{4}\.\d{4,5})/i);
    if (arxivMatch) arxivIds.add(arxivMatch[1]);
    else otherUrls.add(clean);
  }
  return { arxivIds: [...arxivIds], otherUrls: [...otherUrls] };
}

async function fetchWithTimeout(url, init = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      headers: { "User-Agent": UA, ...(init.headers || {}) },
      redirect: "follow",
      signal: ctrl.signal,
    });
  } finally {
    clearTimeout(t);
  }
}

function resolveArxivFigure(src, arxivId, version) {
  // arxiv's rendered HTML is inconsistent: some papers use paths like
  // "2603.12621v1/x1.png" (absolute from /html/ root), others use bare
  // "x1.png" (relative to the paper's directory). We normalise by
  // detecting the version prefix and picking the right base.
  const hasVersionPrefix = new RegExp(`^${arxivId}v\\d+/`).test(src);
  const base = hasVersionPrefix
    ? `https://arxiv.org/html/`
    : `https://arxiv.org/html/${arxivId}${version}/`;
  return new URL(src, base).toString();
}

async function fetchArxivFirstFigure(arxivId) {
  for (const v of ARXIV_VERSIONS) {
    const pageUrl = `https://arxiv.org/html/${arxivId}${v}`;
    try {
      const res = await fetchWithTimeout(pageUrl);
      if (!res.ok) continue;
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("text/html")) continue;
      const html = await res.text();
      const m = html.match(
        /<figure[^>]+class="[^"]*\bltx_figure\b[^"]*"[^>]*>[\s\S]{0,500}?<img[^>]+src="([^"]+)"/i
      );
      if (m && m[1]) {
        const abs = resolveArxivFigure(m[1], arxivId, v);
        return { source: `https://arxiv.org/abs/${arxivId}`, image: abs, kind: "arxiv-figure" };
      }
      return null;
    } catch {
      continue;
    }
  }
  return null;
}

async function fetchOgImage(url) {
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("text/html")) return null;
    const html = await res.text();
    const og =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    if (!og) return null;
    const abs = new URL(og[1], url).toString();
    if (BAD_IMAGE_PATTERNS.some((p) => p.test(abs))) return null;
    return { source: url, image: abs, kind: "og-image" };
  } catch {
    return null;
  }
}

async function gatherCandidates(arxivIds, otherUrls) {
  const cands = [];
  const seenImage = new Set();
  const push = (c) => {
    if (!c || seenImage.has(c.image)) return;
    seenImage.add(c.image);
    cands.push(c);
  };
  for (const id of arxivIds) {
    if (cands.length >= MAX_FIGURES) break;
    let c = await fetchArxivFirstFigure(id);
    if (!c) c = await fetchOgImage(`https://huggingface.co/papers/${id}`);
    push(c);
  }
  for (const url of otherUrls) {
    if (cands.length >= MAX_FIGURES) break;
    push(await fetchOgImage(url));
  }
  return cands;
}

function extFromContentType(ct) {
  if (ct.includes("png")) return "png";
  if (ct.includes("webp")) return "webp";
  if (ct.includes("gif")) return "gif";
  if (ct.includes("svg")) return "svg";
  return "jpg";
}

async function downloadImage(url, outDir, basename) {
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const ct = res.headers.get("content-type") || "";
  const ext = extFromContentType(ct);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < MIN_IMAGE_BYTES) throw new Error(`too small (${buf.length}b — likely a logo)`);
  await fs.mkdir(outDir, { recursive: true });
  const file = path.join(outDir, `${basename}.${ext}`);
  await fs.writeFile(file, buf);
  return { file, ext, bytes: buf.length };
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
      else reject(new Error(`wrangler exit ${code}: ${stderr.slice(-300)}`));
    });
  });
}

async function uploadToR2(localPath, r2Key) {
  await runWrangler([
    "r2",
    "object",
    "put",
    `${R2_BUCKET}/${r2Key}`,
    `--file=${localPath}`,
    "--remote",
  ]);
}

function findInsertIdx(lines) {
  const firstH1 = lines.findIndex((l) => /^#\s/.test(l));
  if (firstH1 < 0) return 0;
  let i = firstH1 + 1;
  while (i < lines.length) {
    const t = lines[i].trim();
    if (t === "" || t.startsWith(">")) {
      i++;
      continue;
    }
    break;
  }
  return i;
}

function sourceLabel(c) {
  if (c.kind === "arxiv-figure") {
    const m = c.source.match(/\/abs\/(\d{4}\.\d{4,5})/);
    return m ? `arXiv ${m[1]} (Fig. 1)` : "arXiv";
  }
  try {
    const u = new URL(c.source);
    if (u.hostname === "huggingface.co") return `Hugging Face · ${u.pathname.slice(1)}`;
    if (u.hostname === "github.com") {
      const repo = u.pathname.split("/").filter(Boolean).slice(0, 2).join("/");
      return repo ? `GitHub · ${repo}` : "GitHub";
    }
    return u.hostname.replace(/^www\./, "");
  } catch {
    return c.source;
  }
}

async function enrichPost(slug, { dry }) {
  const postPath = path.join(POSTS_DIR, `${slug}.md`);
  const raw = await fs.readFile(postPath, "utf8");
  const { fm, body } = splitFrontmatter(raw);
  // Skip if the body already contains a figure block (either legacy
  // /images/posts/ path or an already-uploaded R2 URL).
  if (body.includes("/images/posts/") || body.includes(`${R2_PUBLIC_BASE}/posts/`)) {
    return { slug, skip: "already enriched" };
  }

  const { arxivIds, otherUrls } = gatherSources(body);
  if (!arxivIds.length && !otherUrls.length) return { slug, skip: "no sources" };

  const cands = await gatherCandidates(arxivIds, otherUrls);
  if (!cands.length) {
    return {
      slug,
      skip: `no images (arxiv=${arxivIds.length} urls=${otherUrls.length})`,
    };
  }

  if (dry) {
    return { slug, candidates: cands.map((c) => ({ label: sourceLabel(c), img: c.image })) };
  }

  // Download to OS temp dir, then push each file to R2. The final URL
  // written into the post is the R2 public URL — the local copy only
  // exists long enough to hand off to wrangler, then gets cleaned up.
  const tmpDir = path.join(TMP_DIR, slug);
  const figures = [];
  for (let i = 0; i < cands.length; i++) {
    const basename = `fig-${i + 1}`;
    try {
      const { file, ext, bytes } = await downloadImage(cands[i].image, tmpDir, basename);
      const r2Key = `posts/${slug}/${basename}.${ext}`;
      await uploadToR2(file, r2Key);
      figures.push({
        publicPath: `${R2_PUBLIC_BASE}/${r2Key}`,
        cand: cands[i],
        bytes,
      });
    } catch (e) {
      console.error(`  ! ${slug} fig-${i + 1}: ${e.message.split("\n")[0]}`);
    }
  }
  // Temp cleanup — best-effort, never fails the run.
  await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  if (!figures.length) return { slug, skip: "all downloads failed" };

  const lines = body.split("\n");
  const at = findInsertIdx(lines);
  const block = figures
    .map(
      (f, i) =>
        `![Figure ${i + 1}](${f.publicPath})\n*Source: [${sourceLabel(f.cand)}](${f.cand.source})*`
    )
    .join("\n\n");
  lines.splice(at, 0, block, "");
  await fs.writeFile(postPath, `${fm}\n${lines.join("\n")}`);
  return { slug, enriched: figures.length, bytes: figures.reduce((s, f) => s + f.bytes, 0) };
}

async function listSlugs() {
  if (SLUG) return [SLUG];
  const files = await fs.readdir(POSTS_DIR);
  const slugs = files.filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -3));
  return LIMIT ? slugs.slice(0, LIMIT) : slugs;
}

async function main() {
  if (!SLUG && !ALL && !DRY) {
    console.error("Specify --slug=<slug>, --dry, or --all. See file header.");
    process.exit(1);
  }
  const slugs = await listSlugs();
  console.log(`enrich-posts  slugs=${slugs.length}  dry=${DRY}`);
  const sum = { enriched: 0, skipped: 0, failed: 0, dry: 0 };
  for (const slug of slugs) {
    try {
      const r = await enrichPost(slug, { dry: DRY });
      if (r.skip) {
        sum.skipped++;
        console.log(`  [skip]    ${slug} — ${r.skip}`);
      } else if (r.candidates) {
        sum.dry++;
        console.log(`  [dry]     ${slug} — ${r.candidates.length} candidate(s)`);
        r.candidates.forEach((c, i) => console.log(`             ${i + 1}. ${c.label}  →  ${c.img}`));
      } else {
        sum.enriched++;
        console.log(`  [enrich]  ${slug} — ${r.enriched} fig, ${(r.bytes / 1024).toFixed(0)} KB`);
      }
    } catch (e) {
      sum.failed++;
      console.error(`  [FAIL]    ${slug} — ${e.message}`);
    }
  }
  console.log(
    `\ndone. enriched=${sum.enriched} dry=${sum.dry} skipped=${sum.skipped} failed=${sum.failed}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
