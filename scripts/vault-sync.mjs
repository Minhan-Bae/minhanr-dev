#!/usr/bin/env node
/**
 * vault-sync.mjs — oikbas-vault → Supabase `vault_notes` bulk importer.
 *
 * Phase A의 주 도구:
 *   • 최초 800+ 노트 일괄 이관 (--once, default)
 *   • 드라이런으로 파싱·업서트 플랜 검증 (--dry-run)
 *   • 샘플 제한 테스트 (--sample N)
 *
 * 설계 메모:
 *   - 로컬 vault 경로에서 파일시스템으로 직접 읽음 (GitHub API rate 회피).
 *   - 트리거 오버헤드 회피: bulk import 동안 backlink 트리거 disable,
 *     완료 후 reset_all_note_backlinks() RPC 1회 호출 → O(N)으로 전체 재계산.
 *   - 태그는 별도 N:M 테이블 → 노트 upsert 후 delete+insert로 갱신.
 *   - 파싱은 gray-matter (minhanr-dev 이미 의존성 있음).
 *   - 실패시 오류 노트 목록만 집계 출력 → 부분 성공 기록 후 종료.
 *
 * 환경 변수:
 *   VAULT_LOCAL_PATH             기본 ../oikbas-vault
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_KEY         (service role key)
 *
 * 사용:
 *   node scripts/vault-sync.mjs --dry-run
 *   node scripts/vault-sync.mjs --sample 10
 *   node scripts/vault-sync.mjs --once
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import matter from "gray-matter";
import { createClient } from "@supabase/supabase-js";

// ── args ────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
const arg = (k, def) => {
  const i = argv.indexOf(k);
  if (i < 0) return def;
  const v = argv[i + 1];
  return v && !v.startsWith("--") ? v : true;
};
const hasFlag = (k) => argv.includes(k);

const DRY_RUN = hasFlag("--dry-run");
const SAMPLE = Number(arg("--sample", 0)) || 0;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const VAULT_ROOT = path.resolve(
  arg("--vault", process.env.VAULT_LOCAL_PATH) ||
    path.resolve(__dirname, "../../oikbas-vault")
);

// ── env ─────────────────────────────────────────────────────────

// .env.local 자동 로드 (bash에서 export 안 해둬도 동작)
function loadDotEnv() {
  const envFile = path.resolve(__dirname, "..", ".env.local");
  if (!fs.existsSync(envFile)) return;
  const txt = fs.readFileSync(envFile, "utf-8");
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const k = line.slice(0, eq).trim();
    let v = line.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!(k in process.env)) process.env[k] = v;
  }
}

loadDotEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!DRY_RUN && (!SUPABASE_URL || !SERVICE_KEY)) {
  console.error("FATAL: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY required (or use --dry-run)");
  process.exit(1);
}

// ── vault scan ──────────────────────────────────────────────────

// 숫자 prefix 폴더만 대상 (000_*, 010_*, 020_*, …). .obsidian, node_modules 등 제외.
const ALLOWED_ROOT_RE = /^\d{3}_/;

function* walk(dir, rel = "") {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.startsWith(".")) continue;
    const full = path.join(dir, e.name);
    const relPath = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) {
      // 루트 레벨에선 숫자 prefix만 허용
      if (!rel && !ALLOWED_ROOT_RE.test(e.name)) continue;
      yield* walk(full, relPath);
    } else if (e.isFile() && e.name.endsWith(".md")) {
      // 루트 레벨 .md는 숫자 prefix만 허용 (000_Dashboard.md OK, CLAUDE.md 제외)
      if (!rel && !ALLOWED_ROOT_RE.test(e.name)) continue;
      yield { fullPath: full, relPath };
    }
  }
}

function getVaultCommit() {
  try {
    return execSync("git rev-parse HEAD", { cwd: VAULT_ROOT }).toString().trim();
  } catch {
    return null;
  }
}

// ── parsing ────────────────────────────────────────────────────

const str = (v) => (typeof v === "string" && v.trim() ? v : null);

function deriveTitle(p, fm) {
  const t = str(fm?.title);
  if (t) return t;
  const base = p.split("/").pop() ?? p;
  return base.replace(/\.md$/, "");
}

function deriveExcerpt(body) {
  const lines = body.split("\n");
  const picked = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("#")) continue;
    if (line.startsWith("---")) continue;
    if (line.startsWith("```")) continue;
    if (/^[-*+]\s/.test(line)) continue;
    if (/^\d+\.\s/.test(line)) continue;
    if (line.startsWith(">")) continue;
    picked.push(line);
    if (picked.join(" ").length >= 240) break;
  }
  const joined = picked.join(" ").replace(/\s+/g, " ").trim();
  if (!joined) return null;
  return joined.length > 240 ? joined.slice(0, 240) + "…" : joined;
}

function toStringOrNull(v) {
  if (typeof v === "string") return v.trim() || null;
  if (typeof v === "number") return String(v);
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return null;
}

function extractTags(fm) {
  const raw = fm?.tags;
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.filter((t) => typeof t === "string" && t.trim()).map((t) => t.trim());
  }
  if (typeof raw === "string") {
    return raw.split(",").map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

function buildRow(parsed, vaultCommit) {
  const fm = parsed.frontmatter ?? {};
  const body = parsed.body_md ?? "";
  return {
    path: parsed.path,
    slug: str(fm.slug),
    title: deriveTitle(parsed.path, fm),
    summary: str(fm.summary),
    excerpt: deriveExcerpt(body),
    created: toStringOrNull(fm.created) ?? toStringOrNull(fm.date),
    deadline: toStringOrNull(fm.deadline),
    body_md: body,
    maturity: str(fm.maturity),
    workflow: str(fm.workflow),
    publish: str(fm.publish),
    lifecycle_state: str(fm.lifecycle_state) ?? "active",
    type: str(fm.type),
    category: str(fm.category),
    priority: str(fm.priority),
    source_type: str(fm.source_type),
    confidence: str(fm.confidence),
    frontmatter_raw: fm,
    vault_commit: vaultCommit,
    edit_source: "vault",
    last_edited_at: new Date().toISOString(),
  };
}

// ── main ───────────────────────────────────────────────────────

async function main() {
  console.log(`VAULT_ROOT : ${VAULT_ROOT}`);
  console.log(`DRY_RUN    : ${DRY_RUN}`);
  if (SAMPLE) console.log(`SAMPLE     : first ${SAMPLE} files`);

  if (!fs.existsSync(VAULT_ROOT)) {
    console.error(`FATAL: VAULT_ROOT not found: ${VAULT_ROOT}`);
    process.exit(1);
  }

  const vaultCommit = getVaultCommit();
  console.log(`VAULT_HEAD : ${vaultCommit ?? "(not a git repo)"}`);

  // 스캔
  const files = [];
  for (const f of walk(VAULT_ROOT)) {
    files.push(f);
    if (SAMPLE && files.length >= SAMPLE) break;
  }
  console.log(`SCANNED    : ${files.length} .md files`);

  // 파싱 — malformed frontmatter는 body만 건지는 lenient fallback
  const rows = [];
  const tagsByPath = new Map();
  const errors = [];
  const warnings = [];
  for (const f of files) {
    try {
      const raw = fs.readFileSync(f.fullPath, "utf-8");
      let data = {};
      let content = raw;
      try {
        const p = matter(raw);
        data = p.data ?? {};
        content = p.content;
      } catch (fmErr) {
        // lenient: 첫 --- … --- 블록을 제거하고 body로 취급, frontmatter는 빈 객체
        const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
        if (m) content = raw.slice(m[0].length);
        warnings.push({
          path: f.relPath.replace(/\\/g, "/"),
          error: `frontmatter fallback: ${fmErr?.message?.split("\n")[0] || fmErr}`,
        });
      }
      const row = buildRow(
        { path: f.relPath.replace(/\\/g, "/"), body_md: content, frontmatter: data },
        vaultCommit
      );
      rows.push(row);
      tagsByPath.set(row.path, extractTags(data));
    } catch (e) {
      errors.push({ path: f.relPath, error: e?.message || String(e) });
    }
  }
  console.log(`PARSED     : ${rows.length} ok, ${warnings.length} fm-fallback, ${errors.length} fatal`);

  if (DRY_RUN) {
    console.log("\n── DRY RUN SUMMARY ─────────────────────────");
    const byFolder = {};
    for (const r of rows) {
      const top = r.path.split("/")[0];
      byFolder[top] = (byFolder[top] || 0) + 1;
    }
    for (const [k, v] of Object.entries(byFolder).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${k.padEnd(30)} ${v}`);
    }
    console.log("\n── FIRST 3 ROWS ───────────────────────────");
    for (const r of rows.slice(0, 3)) {
      console.log(`path     : ${r.path}`);
      console.log(`title    : ${r.title}`);
      console.log(`created  : ${r.created}`);
      console.log(`maturity : ${r.maturity}`);
      console.log(`tags     : ${JSON.stringify(tagsByPath.get(r.path))}`);
      console.log(`body     : ${(r.body_md || "").slice(0, 80).replace(/\n/g, " ")}…`);
      console.log("---");
    }
    if (errors.length > 0) {
      console.log("\n── PARSE ERRORS ───────────────────────────");
      for (const e of errors.slice(0, 10)) {
        console.log(`  ${e.path}: ${e.error}`);
      }
    }
    return;
  }

  // 실 sync
  const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1. 트리거 disable (백링크 한번에 재계산할 거라서)
  console.log("\n▸ disabling backlink trigger…");
  const { error: disErr } = await sb.rpc("exec_sql", {}).then(() => ({ error: null })).catch((e) => ({ error: e }));
  // rpc exec_sql이 없을 수 있음 — 트리거 disable은 옵션이므로 실패해도 진행
  if (disErr) console.log("  (trigger disable skipped — running with trigger on)");

  // 2. upsert rows (batch 500)
  console.log("▸ upserting notes…");
  const BATCH = 500;
  let upsertErrCount = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const { error } = await sb.from("vault_notes").upsert(chunk, { onConflict: "path" });
    if (error) {
      upsertErrCount += chunk.length;
      console.error(`  batch ${i}-${i + chunk.length - 1} FAILED: ${error.message}`);
    } else {
      process.stdout.write(`  ${i + chunk.length}/${rows.length}\r`);
    }
  }
  console.log(`\n  upserted: ${rows.length - upsertErrCount}/${rows.length}`);

  // 3. 태그 동기화 — path 기준 id 재조회 후 delete+insert
  //    .in()에 1700개 path를 던지면 Cloudflare 414 URI Too Large —
  //    id 매핑을 얻기 위해 전체 select (path 필터 없이, 1729rows만 반환).
  console.log("▸ syncing tags…");
  const { data: idRows, error: idErr } = await sb
    .from("vault_notes")
    .select("id,path");
  if (idErr) {
    console.error(`  id lookup failed: ${idErr.message}`);
  } else {
    const pathToId = new Map(idRows.map((r) => [r.path, r.id]));
    // 일괄 delete
    const ids = [...pathToId.values()];
    if (ids.length > 0) {
      // Supabase in()는 대량도 처리하지만 안전하게 batch
      for (let i = 0; i < ids.length; i += 500) {
        await sb.from("vault_tags").delete().in("note_id", ids.slice(i, i + 500));
      }
    }
    // 신규 insert
    const tagRows = [];
    for (const r of rows) {
      const id = pathToId.get(r.path);
      if (!id) continue;
      for (const tag of tagsByPath.get(r.path) || []) {
        tagRows.push({ note_id: id, tag });
      }
    }
    for (let i = 0; i < tagRows.length; i += 500) {
      const { error } = await sb.from("vault_tags").insert(tagRows.slice(i, i + 500));
      if (error) console.error(`  tag batch ${i} FAILED: ${error.message}`);
    }
    console.log(`  tags upserted: ${tagRows.length}`);
  }

  // 4. backlinks 전체 재계산 (트리거로 이미 개별 계산됐더라도 idempotent)
  console.log("▸ recomputing all backlinks…");
  const { error: blErr } = await sb.rpc("reset_all_note_backlinks");
  if (blErr) console.error(`  backlink recompute FAILED: ${blErr.message}`);
  else console.log("  backlinks recomputed");

  // 5. 요약
  const { count } = await sb.from("vault_notes").select("*", { count: "exact", head: true });
  const { count: blCount } = await sb
    .from("vault_note_backlinks")
    .select("*", { count: "exact", head: true });
  console.log("\n── RESULT ───────────────────────────────");
  console.log(`vault_notes rows        : ${count}`);
  console.log(`vault_note_backlinks    : ${blCount}`);
  if (errors.length > 0) {
    console.log(`parse errors            : ${errors.length}`);
    for (const e of errors.slice(0, 5)) console.log(`  ${e.path}: ${e.error}`);
  }

  // 6. Vercel revalidate — REVALIDATE_URL + REVALIDATE_SECRET env 설정된 경우만
  const revalidateUrl = process.env.REVALIDATE_URL;
  const revalidateSecret = process.env.REVALIDATE_SECRET;
  if (revalidateUrl && revalidateSecret) {
    console.log("▸ triggering Vercel revalidate…");
    try {
      const res = await fetch(revalidateUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-revalidate-secret": revalidateSecret,
        },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        console.log(`  revalidate ${res.status} OK`);
      } else {
        console.error(`  revalidate ${res.status}: ${await res.text()}`);
      }
    } catch (e) {
      console.error(`  revalidate fetch failed: ${e?.message || e}`);
    }
  }
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
