#!/usr/bin/env node
/**
 * Backfill missing frontmatter fields on blog posts.
 *
 * For each post in src/content/posts/*.md:
 *   • If `summary` is missing or empty, derive it from the first
 *     prose paragraph of the body (first ~160 chars, stripped of
 *     markdown syntax, trimmed to a sentence boundary when possible).
 *   • If `categories` is missing or empty, infer a single category
 *     from filename/title/tags using the same heuristic as the home
 *     notes-graph AREA classifier (keyword-priority match).
 *
 *   node scripts/backfill-post-frontmatter.mjs           # report-only
 *   node scripts/backfill-post-frontmatter.mjs --write   # actually edit
 *
 * The original body content is untouched — we only rewrite the YAML
 * block at the top.
 */

import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const POSTS_DIR = path.resolve(ROOT, "src/content/posts");

// ── Category inference ─────────────────────────────────────────────
// Ordered from most-specific to least. First match wins.
const CATEGORY_RULES = [
  { category: "Research", patterns: [/research|paper|arxiv|학술|논문|연구/i] },
  { category: "VFX", patterns: [/vfx|houdini|nuke|render|shader|컴포지팅|파이프라인/i] },
  { category: "Systems", patterns: [/agent|pipeline|infra|workflow|mcp|system|자동화|시스템/i] },
  { category: "Visual", patterns: [/video|image|diffusion|generative|visual|비주얼|영상|생성/i] },
  { category: "Industry", patterns: [/openai|anthropic|google|meta|nvidia|apple|출시|발표/i] },
  { category: "Creative Technology", patterns: [/creative|editorial|design|크리에이티브/i] },
];

function inferCategory({ title, tags, filename }) {
  const haystack = [title, ...(tags ?? []), filename].filter(Boolean).join(" ");
  for (const rule of CATEGORY_RULES) {
    for (const p of rule.patterns) {
      if (p.test(haystack)) return rule.category;
    }
  }
  return "Writing";
}

// ── Summary derivation ─────────────────────────────────────────────

function stripMarkdown(md) {
  return md
    // strip fenced code blocks entirely
    .replace(/```[\s\S]*?```/g, "")
    // strip inline code
    .replace(/`[^`]*`/g, "")
    // strip links/images but keep label text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    // strip headings / emphasis markers
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1")
    // strip block quotes + list markers
    .replace(/^>\s*/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    // collapse whitespace
    .replace(/\s+/g, " ")
    .trim();
}

function deriveSummary(body, maxLen = 160) {
  const text = stripMarkdown(body);
  if (!text) return "";
  if (text.length <= maxLen) return text;
  // Prefer cutting at a sentence end before maxLen.
  const sentence = text.slice(0, maxLen).match(/^.*?[.?!。]\s/);
  if (sentence && sentence[0].length > maxLen * 0.5) {
    return sentence[0].trim();
  }
  // Otherwise cut at last whitespace before maxLen.
  const lastSpace = text.lastIndexOf(" ", maxLen);
  return (lastSpace > 0 ? text.slice(0, lastSpace) : text.slice(0, maxLen)).trim() + "…";
}

// ── Minimal YAML frontmatter I/O ───────────────────────────────────
// We can't pull a dependency here (scripts have no package of their
// own and adding gray-matter to the root would be overkill for a one-
// off tool). The posts use a predictable `---\n...\n---` opener with
// simple key: value pairs (+ arrays as `- value` lists). That's a
// narrow enough subset to parse by hand.

function splitFrontmatter(raw) {
  if (!raw.startsWith("---")) return { front: "", body: raw, hadFront: false };
  const end = raw.indexOf("\n---", 4);
  if (end < 0) return { front: "", body: raw, hadFront: false };
  const front = raw.slice(4, end).trimEnd();
  // Body starts after the closing `---\n`.
  const bodyStart = raw.indexOf("\n", end + 4) + 1;
  return { front, body: raw.slice(bodyStart), hadFront: true };
}

function parseFrontKeys(front) {
  // Returns Map of top-level keys (lowercase) → raw string value OR
  // "[array]" sentinel for multi-line arrays.
  const keys = new Map();
  const lines = front.split(/\r?\n/);
  let currentArrayKey = null;
  for (const line of lines) {
    if (/^[a-zA-Z_][\w-]*\s*:/.test(line)) {
      const m = line.match(/^([a-zA-Z_][\w-]*)\s*:\s*(.*)$/);
      if (!m) continue;
      const key = m[1].toLowerCase();
      const val = m[2];
      if (val === "") {
        // Likely a block key (array or nested). Mark for follow-up.
        currentArrayKey = key;
        if (!keys.has(key)) keys.set(key, "");
      } else {
        currentArrayKey = null;
        keys.set(key, val);
      }
    } else if (/^\s+-/.test(line) && currentArrayKey) {
      // Array item line — we only care that the key has at least one.
      const existing = keys.get(currentArrayKey);
      keys.set(currentArrayKey, (existing ? existing + "\n" : "") + line);
    }
  }
  return keys;
}

function isBlank(val) {
  if (val == null) return true;
  const s = String(val).trim();
  if (s === "" || s === "[]" || s === "''" || s === '""') return true;
  return false;
}

function yamlString(v) {
  if (/[:#\n"']/.test(v)) return JSON.stringify(v);
  return v;
}

function injectFrontmatterFields(front, patches) {
  // patches = { summary?: string, categories?: string[] }
  let out = front;
  if (patches.summary != null) {
    // Replace existing line or append.
    if (/^summary\s*:/m.test(out)) {
      out = out.replace(/^summary\s*:.*$/m, `summary: ${yamlString(patches.summary)}`);
    } else {
      out += `\nsummary: ${yamlString(patches.summary)}`;
    }
  }
  if (patches.categories != null) {
    if (/^categories\s*:/m.test(out)) {
      // Replace the categories block (single-line or multi-line).
      out = out.replace(
        /^categories\s*:[\s\S]*?(?=^[a-zA-Z_][\w-]*\s*:|^$|\z)/m,
        `categories:\n${patches.categories.map((c) => `  - ${yamlString(c)}`).join("\n")}\n`
      );
    } else {
      out += `\ncategories:\n${patches.categories.map((c) => `  - ${yamlString(c)}`).join("\n")}`;
    }
  }
  return out.trim();
}

// ── Main ───────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const write = args.includes("--write");

  if (!existsSync(POSTS_DIR)) {
    console.error("Posts directory not found:", POSTS_DIR);
    process.exit(1);
  }

  const files = (await fs.readdir(POSTS_DIR)).filter((f) => f.endsWith(".md"));
  let fixedSummary = 0;
  let fixedCategory = 0;
  let skipped = 0;

  for (const f of files) {
    const full = path.resolve(POSTS_DIR, f);
    const raw = await fs.readFile(full, "utf8");
    const { front, body, hadFront } = splitFrontmatter(raw);
    if (!hadFront) {
      skipped++;
      continue;
    }

    const keys = parseFrontKeys(front);

    const titleRaw = keys.get("title") ?? "";
    const title = titleRaw.replace(/^["']|["']$/g, "");
    const summaryBlank = isBlank(keys.get("summary"));
    const categoriesBlank = isBlank(keys.get("categories"));

    if (!summaryBlank && !categoriesBlank) continue;

    // Parse tags for category inference.
    const tagsRaw = keys.get("tags") ?? "";
    const tags = [];
    if (tagsRaw.startsWith("[")) {
      // inline form: tags: [a, b, c]
      tags.push(
        ...tagsRaw
          .replace(/^\[|\]$/g, "")
          .split(",")
          .map((t) => t.trim().replace(/^["']|["']$/g, ""))
          .filter(Boolean)
      );
    } else {
      const lines = tagsRaw.split("\n");
      for (const l of lines) {
        const m = l.match(/^\s+-\s+(.+)$/);
        if (m) tags.push(m[1].trim().replace(/^["']|["']$/g, ""));
      }
    }

    const patches = {};
    if (summaryBlank) {
      const derived = deriveSummary(body);
      if (derived) {
        patches.summary = derived;
        fixedSummary++;
      }
    }
    if (categoriesBlank) {
      patches.categories = [inferCategory({ title, tags, filename: f })];
      fixedCategory++;
    }

    if (write && (patches.summary != null || patches.categories != null)) {
      const newFront = injectFrontmatterFields(front, patches);
      const nextRaw = `---\n${newFront}\n---\n${body}`;
      await fs.writeFile(full, nextRaw, "utf8");
    }

    const marks = [
      patches.summary != null ? `summary(+${patches.summary.length}ch)` : "",
      patches.categories != null ? `cat(${patches.categories[0]})` : "",
    ]
      .filter(Boolean)
      .join(" ");
    console.log(`${write ? "[fix ]" : "[dry ]"} ${f}  ${marks}`);
  }

  console.log(
    `\n${write ? "Fixed" : "Would fix"}: summary=${fixedSummary}, categories=${fixedCategory}. Skipped (no frontmatter): ${skipped}.`
  );
  if (!write) console.log(`Re-run with --write to apply.`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
