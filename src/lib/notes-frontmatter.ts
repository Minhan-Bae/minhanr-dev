/**
 * notes-frontmatter.ts — vault 노트 파싱 + denormalized 필드 추출.
 *
 * Supabase `vault_notes` 테이블은 검색/리스트 성능을 위해 프론트매터의
 * 핵심 필드(title·summary·maturity·workflow·…)를 테이블 컬럼으로
 * 중복 저장한다. 이 파일은 마크다운 raw → parsed → Supabase row 변환을
 * 단일 진실의 원천으로 유지한다.
 *
 * 양쪽에서 이 모듈을 호출:
 *   • `scripts/vault-sync.mjs` (bulk import + 증분 동기화)
 *   • `src/lib/actions/notes.ts` (studio 편집 write-through)
 *
 * Phase A·B·C 전환 동안 Supabase row shape 변경이 필요하면 이 파일만
 * 수정하면 모든 호출자가 함께 업데이트된다.
 */

import matter from "gray-matter";

export interface ParsedNote {
  path: string;
  content: string;        // 원본 md (frontmatter + body)
  body_md: string;
  frontmatter: Record<string, unknown>;
}

export interface VaultNoteRow {
  path: string;
  slug: string | null;
  title: string | null;
  summary: string | null;
  excerpt: string | null;
  created: string | null;
  deadline: string | null;
  body_md: string;
  maturity: string | null;
  workflow: string | null;
  publish: string | null;
  lifecycle_state: string;
  type: string | null;
  category: string | null;
  priority: string | null;
  source_type: string | null;
  confidence: string | null;
  frontmatter_raw: Record<string, unknown>;
  vault_commit: string | null;
  edit_source: "vault" | "studio";
  last_edited_at: string;
  // search tsvector는 generated column — 직접 insert하지 않음
}

/**
 * Parse markdown with YAML frontmatter. gray-matter는 frontmatter 없으면
 * 빈 객체 반환, body는 원본. 예외적 edge case(malformed YAML)는 body만
 * 반환하고 frontmatter는 빈 객체로 폴백.
 */
export function parseNote(path: string, content: string): ParsedNote {
  try {
    const parsed = matter(content);
    return {
      path,
      content,
      body_md: parsed.content,
      frontmatter: (parsed.data ?? {}) as Record<string, unknown>,
    };
  } catch {
    // Lenient fallback — malformed YAML frontmatter는 제거만 하고 빈 객체로.
    // vault-sync.mjs와 동일 정책 (16/1729 노트에서 관찰됨).
    const fenceMatch = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(content);
    const body_md = fenceMatch ? content.slice(fenceMatch[0].length) : content;
    return {
      path,
      content,
      body_md,
      frontmatter: {},
    };
  }
}

function str(v: unknown): string | null {
  if (typeof v === "string" && v.trim()) return v;
  return null;
}

function deriveTitle(path: string, fm: Record<string, unknown>): string {
  const t = str(fm.title);
  if (t) return t;
  const base = path.split("/").pop() ?? path;
  return base.replace(/\.md$/, "");
}

/**
 * 본문 첫 240자 추출 — heading, list marker, 빈 줄 스킵한 뒤의 첫 prose 문단.
 * vault-index.ts의 legacy excerpt 로직과 호환되게 작성.
 */
function deriveExcerpt(body: string): string | null {
  const lines = body.split("\n");
  const picked: string[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("#")) continue;           // headings
    if (line.startsWith("---")) continue;         // hr
    if (line.startsWith("```")) continue;         // code fences
    if (/^[-*+]\s/.test(line)) continue;          // bullets
    if (/^\d+\.\s/.test(line)) continue;          // ordered list
    if (line.startsWith(">")) continue;           // blockquote
    picked.push(line);
    if (picked.join(" ").length >= 240) break;
  }
  const joined = picked.join(" ").replace(/\s+/g, " ").trim();
  if (!joined) return null;
  return joined.length > 240 ? joined.slice(0, 240) + "…" : joined;
}

function toStringOrNull(v: unknown): string | null {
  if (typeof v === "string") return v.trim() || null;
  if (typeof v === "number") return String(v);
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return null;
}

/**
 * md raw → Supabase row 변환.
 * editSource는 호출자가 결정 ('vault' from sync, 'studio' from editor).
 * vaultCommit은 sync가 제공, studio 편집은 null.
 */
export function buildVaultNoteRow(
  parsed: ParsedNote,
  opts: { editSource: "vault" | "studio"; vaultCommit?: string | null }
): VaultNoteRow {
  const { path, body_md, frontmatter: fm } = parsed;

  return {
    path,
    slug: str(fm.slug),
    title: deriveTitle(path, fm),
    summary: str(fm.summary),
    excerpt: deriveExcerpt(body_md),
    created: toStringOrNull(fm.created) ?? toStringOrNull(fm.date),
    deadline: toStringOrNull(fm.deadline),
    body_md,
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
    vault_commit: opts.vaultCommit ?? null,
    edit_source: opts.editSource,
    last_edited_at: new Date().toISOString(),
  };
}

/**
 * frontmatter tags를 normalize.
 *   tags: ["a", "b"]     → ["a", "b"]
 *   tags: "a, b"         → ["a", "b"]
 *   tags: "single"       → ["single"]
 *   otherwise             → []
 */
export function extractTags(fm: Record<string, unknown>): string[] {
  const raw = fm.tags;
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .filter((t): t is string => typeof t === "string" && !!t.trim())
      .map((t) => t.trim());
  }
  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}
