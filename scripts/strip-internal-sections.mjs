#!/usr/bin/env node
/**
 * Strip author-internal sections from published blog posts.
 *
 * Several posts carried sections that are useful as notes to the
 * author but shouldn't be public — references to the author's vault
 * paths, TrinityX orchestration internals, or next-step TODO items
 * that read like private planning:
 *
 *   ## 후속 액션          — personal follow-up TODO list
 *   ## 액션 아이템        — same
 *   ## TrinityX 아키텍처 매핑 — internal architecture mapping
 *   **Trinity 적용 포인트**: … — inline "apply to my TrinityX"
 *   **TrinityX 적용**: …        — same
 *
 * This script rewrites every `src/content/posts/*.md` that contains
 * one of those, removing the section from the matching h2 up to the
 * next h2 (or the frontmatter's closing `---`), and stripping inline
 * `**Trinity.* 적용…**: …` paragraphs. Frontmatter byte-for-byte
 * preserved.
 *
 * Usage:
 *   node scripts/strip-internal-sections.mjs --dry   # preview
 *   node scripts/strip-internal-sections.mjs         # apply
 */

import fs from "node:fs/promises";
import path from "node:path";

const POSTS_DIR = path.resolve("src/content/posts");

/** Headings (h2 level) that gate whole-section strip. */
const SECTION_HEADERS = [
  /^## 후속 액션\s*$/m,
  /^## 액션 아이템\s*$/m,
  /^## TrinityX 아키텍처 매핑\s*$/m,
  /^## Trinity[-X]? 적용\s*$/m,
];

/** Inline bold-label paragraph patterns (whole line). */
const INLINE_LINES = [
  /^\*\*Trinity[-X]?\s*적용[^*]*\*\*[^\n]*\n?/gm,
  /^\*\*TrinityX?\s*\w*\s*적용[^*]*\*\*[^\n]*\n?/gm,
];

const args = process.argv.slice(2);
const DRY = args.includes("--dry");

function splitFrontmatter(raw) {
  if (!raw.startsWith("---")) return { fm: "", body: raw };
  const end = raw.indexOf("\n---", 3);
  if (end < 0) return { fm: "", body: raw };
  const fmEnd = end + 4;
  return { fm: raw.slice(0, fmEnd), body: raw.slice(fmEnd) };
}

function stripSection(body, headerRe) {
  const m = body.match(headerRe);
  if (!m) return { body, stripped: false };
  const start = body.indexOf(m[0]);
  if (start < 0) return { body, stripped: false };
  const after = body.slice(start + m[0].length);
  // Next h2 or end-of-body
  const next = after.search(/\n## [^\n]/);
  const end = next >= 0 ? start + m[0].length + next : body.length;
  const newBody = (body.slice(0, start).replace(/\n+$/, "") + "\n" + body.slice(end)).replace(/\n{3,}/g, "\n\n");
  return { body: newBody, stripped: true };
}

async function cleanPost(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  const { fm, body } = splitFrontmatter(raw);
  let working = body;
  const stripped = [];

  for (const re of SECTION_HEADERS) {
    const { body: next, stripped: did } = stripSection(working, re);
    if (did) {
      stripped.push(re.source);
      working = next;
    }
  }

  let inlineCount = 0;
  for (const re of INLINE_LINES) {
    working = working.replace(re, () => {
      inlineCount += 1;
      return "";
    });
  }

  if (stripped.length === 0 && inlineCount === 0) {
    return { file: filePath, changed: false };
  }

  if (!DRY) {
    await fs.writeFile(filePath, fm + "\n" + working.replace(/\n+$/, "\n"));
  }
  return {
    file: filePath,
    changed: true,
    stripped,
    inlineCount,
  };
}

async function main() {
  const files = (await fs.readdir(POSTS_DIR))
    .filter((f) => f.endsWith(".md"))
    .map((f) => path.join(POSTS_DIR, f));

  console.log(`Scanning ${files.length} posts (dry=${DRY})…`);
  let touched = 0;
  let sections = 0;
  let inlines = 0;
  for (const f of files) {
    const r = await cleanPost(f);
    if (r.changed) {
      touched += 1;
      sections += r.stripped?.length ?? 0;
      inlines += r.inlineCount ?? 0;
      const name = path.basename(f);
      const parts = [];
      if (r.stripped?.length) parts.push(`${r.stripped.length} section(s)`);
      if (r.inlineCount) parts.push(`${r.inlineCount} inline`);
      console.log(`  ${DRY ? "[dry]" : "[apply]"} ${name}  —  ${parts.join(" + ")}`);
    }
  }
  console.log(
    `\ndone. touched=${touched} sections=${sections} inlines=${inlines}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
