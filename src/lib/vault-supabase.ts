/**
 * vault-supabase.ts — Supabase `vault_notes` + `vault_tags` 테이블에서 볼트 인덱스를 읽는 대체 소스.
 *
 * 배경:
 * 기존 `vault-index.ts`는 GitHub raw contents API로 `vault_index.json`을 fetch한다.
 * Rate limit(익명 60/hr), 지연, 인증 만료로 `VaultUnreachable` 컴포넌트가 11개소에 배치되는 상황이 누적됐다.
 *
 * 해결 (Phase G-Supabase, 2026-04-18 스캐폴드):
 * - `oikbas-vault/090_System/093_Scripts/supabase_sync/` 패키지가 `publish-to-blog.yml`에서
 *   vault_index.json을 Supabase `vault_notes`/`vault_tags`에 업서트.
 * - 본 파일은 그 테이블을 읽어 기존 `VaultIndexFile` shape로 재구성.
 * - 기존 `aggregate()` / `listNotes()` 함수를 그대로 재사용 가능.
 *
 * 현재 상태: **병렬 배치 (활성화 X)**.
 * - Supabase 스키마 마이그레이션 `001_vault_cache.sql` 적용 후에만 작동.
 * - `vault-source.ts` 파사드가 env `VAULT_SOURCE=supabase`일 때만 본 경로 사용.
 * - 기본값 `VAULT_SOURCE=github` — 기존 동작 유지.
 *
 * 설계 전문: /supabase-vault-cache-design.md
 */

import { unstable_cache } from "next/cache";
import { createSupabaseAdmin } from "./supabase-admin";
import type {
  VaultIndexFile,
  VaultNoteRecord,
  VaultIndexStats,
} from "./vault-index";

/**
 * v3 lifecycle 축을 legacy `status`로 역매핑.
 * 기존 Knowledge Hub 컴포넌트들이 `rec.status`를 기준으로 필터링하므로,
 * Supabase 소스도 동일 필드를 노출해야 호환된다.
 *
 * 우선순위:
 *   lifecycle_state=archived → "archived"
 *   publish=published        → "published"
 *   maturity=evergreen       → "evergreen"
 *   maturity=mature          → "mature"
 *   maturity=growing         → "growing"
 *   maturity=seed            → "seed"
 *   workflow=paused          → "paused"
 *   workflow=completed       → "completed"
 *   workflow=active          → "active"
 *   workflow=planning        → "planning"
 *   type=daily               → "daily"
 *   type=template            → "template"
 *   기타                      → undefined (no_status)
 */
function deriveLegacyStatus(row: {
  lifecycle_state?: string | null;
  publish?: string | null;
  maturity?: string | null;
  workflow?: string | null;
  type?: string | null;
}): string | undefined {
  if (row.lifecycle_state === "archived") return "archived";
  if (row.publish === "published") return "published";
  if (row.maturity === "evergreen") return "evergreen";
  if (row.maturity) return row.maturity; // mature | growing | seed
  if (row.workflow) return row.workflow; // active | paused | completed | planning
  if (row.type === "daily") return "daily";
  if (row.type === "template") return "template";
  return undefined;
}

interface SupabaseVaultNoteRow {
  id: number;
  path: string;
  slug: string | null;
  title: string | null;
  summary: string | null;
  maturity: string | null;
  workflow: string | null;
  publish: string | null;
  lifecycle_state: string;
  type: string | null;
  category: string | null;
  priority: string | null;
  source_type: string | null;
  confidence: string | null;
  deadline: string | null;
  created: string | null;
  vault_commit: string | null;
  frontmatter_raw: Record<string, unknown> | null;
}

interface SupabaseVaultTagRow {
  note_id: number;
  tag: string;
}

const PAGE_SIZE = 1000; // Supabase default max

async function fetchAllPages<T>(
  build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>
): Promise<T[]> {
  const out: T[] = [];
  let from = 0;
  while (true) {
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await build(from, to);
    if (error) throw error;
    const rows = data ?? [];
    out.push(...rows);
    if (rows.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return out;
}

/**
 * Supabase에서 `vault_notes` + `vault_tags` 전체를 읽어 `VaultIndexFile` shape로 재구성.
 * aggregate()·listNotes()가 그대로 사용할 수 있도록 schema_version=3 미설정
 * (schema_version>=2 요구는 사전 집계 stats 의존인데 Supabase는 원본 행만 제공).
 * → legacy 경로(aggregateLegacy)로 자동 폴백. 추후 sum_* view로 stats 최적화 가능.
 */
export async function fetchVaultIndexFromSupabase(): Promise<VaultIndexFile> {
  const sb = createSupabaseAdmin();

  const notesRowsPromise = fetchAllPages<SupabaseVaultNoteRow>((from, to) =>
    sb
      .from("vault_notes")
      .select(
        "id,path,slug,title,summary,maturity,workflow,publish,lifecycle_state,type,category,priority,source_type,confidence,deadline,created,vault_commit,frontmatter_raw"
      )
      .range(from, to)
  );

  const tagsRowsPromise = fetchAllPages<SupabaseVaultTagRow>((from, to) =>
    sb.from("vault_tags").select("note_id,tag").range(from, to)
  );

  const [notesRows, tagsRows] = await Promise.all([
    notesRowsPromise,
    tagsRowsPromise,
  ]);

  // note_id → tags[]
  const tagsByNoteId = new Map<number, string[]>();
  for (const t of tagsRows) {
    const arr = tagsByNoteId.get(t.note_id);
    if (arr) arr.push(t.tag);
    else tagsByNoteId.set(t.note_id, [t.tag]);
  }

  const notes: Record<string, VaultNoteRecord> = {};
  let latestCommit: string | null = null;

  for (const row of notesRows) {
    const rec: VaultNoteRecord = {
      title: row.title ?? undefined,
      summary: row.summary ?? undefined,
      created: row.created ?? undefined,
      tags: tagsByNoteId.get(row.id) ?? [],
      status: deriveLegacyStatus(row),
      // v3 축도 그대로 노출 — 신식 컴포넌트가 읽을 수 있도록
      maturity: row.maturity ?? undefined,
      workflow: row.workflow ?? undefined,
      publish: row.publish ?? undefined,
      lifecycle_state: row.lifecycle_state,
      type: row.type ?? undefined,
      category: row.category ?? undefined,
      priority: row.priority ?? undefined,
      source_type: row.source_type ?? undefined,
      confidence: row.confidence ?? undefined,
      deadline: row.deadline ?? undefined,
      // frontmatter_raw에 있는 나머지 필드(excerpt, related, domain 등) 주입
      ...(row.frontmatter_raw ?? {}),
    };
    notes[row.path] = rec;
    if (row.vault_commit) latestCommit = row.vault_commit;
  }

  const stats: VaultIndexStats = {
    // stats는 Supabase 원본에 없음 → aggregate()가 legacy 폴백 사용
    // 향후 SQL 뷰로 by_folder/by_status 사전 집계 도입 가능
  };

  return {
    schema_version: 1, // <2 → aggregateLegacy 사용 유도 (풀 순회, 정확도 보장)
    _meta: {
      version: "supabase",
      total_notes: notesRows.length,
      last_commit_hash: latestCommit ?? undefined,
      stats,
    },
    notes,
  };
}

/**
 * 5분 캐시 — vault-index.ts의 getCachedVaultIndex와 동일 TTL.
 * Supabase 쿼리 왕복을 줄이고, `publish-to-blog.yml` sync-to-supabase job이
 * 새 commit 단위로 데이터를 교체하므로 5분 creep 허용 가능.
 */
export const getCachedVaultIndexFromSupabase = unstable_cache(
  fetchVaultIndexFromSupabase,
  ["vault-index-supabase"],
  { revalidate: 300, tags: ["vault-index", "vault-index-supabase"] }
);
