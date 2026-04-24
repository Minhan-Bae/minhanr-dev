/**
 * notes-supabase.ts — `vault_notes` 테이블 read 헬퍼.
 *
 * 기존 `vault-supabase.ts`는 vault_index.json 전체 shape 재구성 용도라
 * 메모리에 전 노트를 로드한다. 이 파일은 CRUD 뷰 전용 — 노트 1개, 필터링된 N개,
 * FTS 검색, 백링크 조회 등 pinpoint 쿼리에 최적화.
 *
 * 20260419 이후 신규 `/notes` · `/search` · `/graph` 뷰는 이 파일을 통해서만
 * Supabase에 접근한다. vault-supabase.ts(구 mirror)는 점진적으로 deprecate.
 */

import { createSupabaseAdmin } from "./supabase-admin";

export interface SupabaseVaultNote {
  id: number;
  path: string;
  slug: string | null;
  title: string | null;
  summary: string | null;
  excerpt: string | null;
  created: string | null;
  deadline: string | null;
  body_md: string;
  // vault_schema v2.0 (2026-04-24) — 신 4축
  lifecycle: string | null;     // seed|growing|mature|published|evergreen|archived
  status: string | null;        // 020_Projects: planning|active|paused|completed|archived
  doc_state: string | null;     // Template: deployed|draft|retired
  publish: string | null;
  type: string | null;
  // legacy (백업 보존)
  maturity: string | null;
  workflow: string | null;
  lifecycle_state: string;
  category: string | null;
  priority: string | null;
  source_type: string | null;
  confidence: string | null;
  frontmatter_raw: Record<string, unknown> | null;
  vault_commit: string | null;
  edit_source: "vault" | "studio";
  last_edited_at: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
}

/**
 * 기본 select 컬럼 — body_md 제외 (list 뷰에선 불필요, toast pull로 느려짐).
 * vault_schema v2.0: lifecycle/status/doc_state 추가.
 */
const LIST_COLUMNS =
  "id,path,slug,title,summary,excerpt,created,deadline,lifecycle,status,doc_state,maturity,workflow,publish,lifecycle_state,type,category,priority,source_type,confidence,frontmatter_raw,vault_commit,edit_source,last_edited_at,created_at,updated_at";

const FULL_COLUMNS = LIST_COLUMNS + ",body_md";

export interface ListNotesSupabaseOptions {
  folder?: string;              // '020_Projects/' 접두어
  folders?: readonly string[];  // OR 합집합
  tag?: string;
  // vault_schema v2.0 — 신 4축 필터 (우선)
  lifecycle?: string;           // seed|growing|mature|published|evergreen|archived
  status?: string;              // planning|active|paused|completed|archived
  type?: string;                // Project|Daily|Research|Trend|Synthesis|...
  excludeLifecycle?: readonly string[];
  // legacy (백업 호환)
  lifecycleState?: string;      // 'active' | 'archived'
  maturity?: string;
  workflow?: string;
  publish?: string;
  excludeMaturity?: readonly string[];
  excludePublish?: readonly string[];
  q?: string;                   // substring (FTS는 searchNotes 별도)
  sort?: "created_desc" | "created_asc" | "title_asc" | "updated_desc";
  limit?: number;
  offset?: number;
}

export interface ListNotesSupabaseResult {
  notes: SupabaseVaultNote[];
  total: number;
}

/**
 * 필터링된 노트 리스트. body_md 제외 — 빠른 목록 렌더용.
 */
export async function listNotesFromSupabase(
  opts: ListNotesSupabaseOptions = {}
): Promise<ListNotesSupabaseResult> {
  const sb = createSupabaseAdmin();
  const limit = opts.limit ?? 50;
  const offset = opts.offset ?? 0;

  let q = sb.from("vault_notes").select(LIST_COLUMNS, { count: "exact" });

  // 폴더 필터 (OR 합집합) — path LIKE prefix% 여러 개
  const prefixes: string[] = [];
  if (opts.folder) prefixes.push(opts.folder);
  if (opts.folders) prefixes.push(...opts.folders);
  if (prefixes.length === 1) {
    q = q.like("path", `${prefixes[0]}%`);
  } else if (prefixes.length > 1) {
    // Supabase or filter는 쉼표로 구분
    const clauses = prefixes.map((p) => `path.like.${p}%`).join(",");
    q = q.or(clauses);
  }

  // vault_schema v2.0 — 신 4축 필터 (우선)
  if (opts.lifecycle) q = q.eq("lifecycle", opts.lifecycle);
  if (opts.status) q = q.eq("status", opts.status);
  if (opts.type) q = q.eq("type", opts.type);
  if (opts.excludeLifecycle?.length)
    q = q.not("lifecycle", "in", `(${opts.excludeLifecycle.join(",")})`);
  // legacy 필터
  if (opts.lifecycleState) q = q.eq("lifecycle_state", opts.lifecycleState);
  if (opts.maturity) q = q.eq("maturity", opts.maturity);
  if (opts.workflow) q = q.eq("workflow", opts.workflow);
  if (opts.publish) q = q.eq("publish", opts.publish);
  if (opts.excludeMaturity?.length)
    q = q.not("maturity", "in", `(${opts.excludeMaturity.join(",")})`);
  if (opts.excludePublish?.length)
    q = q.not("publish", "in", `(${opts.excludePublish.join(",")})`);

  if (opts.q) {
    const term = opts.q.replace(/[%_]/g, "");
    q = q.or(`title.ilike.%${term}%,path.ilike.%${term}%,summary.ilike.%${term}%`);
  }

  switch (opts.sort ?? "created_desc") {
    case "created_asc":
      q = q.order("created", { ascending: true, nullsFirst: false });
      break;
    case "title_asc":
      q = q.order("title", { ascending: true, nullsFirst: false });
      break;
    case "updated_desc":
      q = q.order("last_edited_at", { ascending: false });
      break;
    default:
      q = q.order("created", { ascending: false, nullsFirst: false });
  }

  q = q.range(offset, offset + limit - 1);

  const { data, error, count } = await q;
  if (error) throw error;

  const notes = (data ?? []) as SupabaseVaultNote[];
  // 태그는 별도 조회 (N:M)
  if (notes.length > 0) {
    const ids = notes.map((n) => n.id);
    const { data: tagRows, error: tagErr } = await sb
      .from("vault_tags")
      .select("note_id,tag")
      .in("note_id", ids);
    if (tagErr) throw tagErr;
    const byId = new Map<number, string[]>();
    for (const r of tagRows ?? []) {
      const arr = byId.get(r.note_id) ?? [];
      arr.push(r.tag);
      byId.set(r.note_id, arr);
    }
    for (const n of notes) {
      n.tags = byId.get(n.id) ?? [];
    }
  }

  return { notes, total: count ?? notes.length };
}

/**
 * 단일 노트 body 포함 전체.
 */
export async function getNoteFromSupabase(
  path: string
): Promise<SupabaseVaultNote | null> {
  const sb = createSupabaseAdmin();
  const { data, error } = await sb
    .from("vault_notes")
    .select(FULL_COLUMNS)
    .eq("path", path)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const note = data as unknown as SupabaseVaultNote;
  const { data: tagRows } = await sb
    .from("vault_tags")
    .select("tag")
    .eq("note_id", note.id);
  note.tags = (tagRows ?? []).map((r) => r.tag);
  return note;
}

export interface SearchNotesOptions {
  limit?: number;
  offset?: number;
  folder?: string;
  lifecycleState?: string;
}

/**
 * FTS 검색 — tsvector `search` 컬럼 + plainto_tsquery.
 * 한국어는 to_tsvector('simple', …) 이라 형태소 분석 없음 →
 * 완전 일치 토큰 기반. 짧은 쿼리는 ilike 폴백 고려.
 */
export async function searchNotes(
  query: string,
  opts: SearchNotesOptions = {}
): Promise<ListNotesSupabaseResult> {
  const sb = createSupabaseAdmin();
  const limit = opts.limit ?? 30;
  const offset = opts.offset ?? 0;
  const term = query.trim();
  if (!term) return { notes: [], total: 0 };

  // to_tsquery 대비 plainto_tsquery는 연산자 escape 처리 자동.
  // Supabase는 `textSearch` 헬퍼 제공.
  let q = sb
    .from("vault_notes")
    .select(LIST_COLUMNS, { count: "exact" })
    .textSearch("search", term, { type: "plain", config: "simple" });

  if (opts.folder) q = q.like("path", `${opts.folder}%`);
  if (opts.lifecycleState) q = q.eq("lifecycle_state", opts.lifecycleState);

  q = q.order("last_edited_at", { ascending: false }).range(offset, offset + limit - 1);

  const { data, error, count } = await q;
  if (error) throw error;
  const notes = (data ?? []) as SupabaseVaultNote[];
  return { notes, total: count ?? notes.length };
}

export interface BacklinkRow {
  src_path: string;
  dst_path: string;
  anchor: string;
  display: string | null;
}

/**
 * 특정 노트로 들어오는 백링크(이 노트를 [[…]]로 언급한 노트들).
 */
export async function getBacklinks(path: string): Promise<BacklinkRow[]> {
  const sb = createSupabaseAdmin();
  // dst_path는 확장자 포함/미포함 둘 다 매칭 (vault wikilink 관습: 확장자 생략 多)
  const withoutExt = path.replace(/\.md$/, "");
  const basename = withoutExt.split("/").pop() ?? withoutExt;

  const { data, error } = await sb
    .from("vault_note_backlinks")
    .select("src_path,dst_path,anchor,display")
    .or(
      `dst_path.eq.${path},dst_path.eq.${withoutExt},dst_path.eq.${basename}`
    );
  if (error) throw error;
  return (data ?? []) as BacklinkRow[];
}

/**
 * 특정 노트에서 나가는 링크 (outgoing).
 */
export async function getForwardLinks(path: string): Promise<BacklinkRow[]> {
  const sb = createSupabaseAdmin();
  const { data, error } = await sb
    .from("vault_note_backlinks")
    .select("src_path,dst_path,anchor,display")
    .eq("src_path", path);
  if (error) throw error;
  return (data ?? []) as BacklinkRow[];
}

/**
 * 필터 옵션 — /notes 상단 필터 드롭다운용.
 * distinct maturity/workflow/publish 값 + top N tags.
 */
export async function getFilterOptions(limit = 30): Promise<{
  maturities: string[];
  workflows: string[];
  publishes: string[];
  folders: string[];
  topTags: Array<{ tag: string; count: number }>;
}> {
  const sb = createSupabaseAdmin();
  const [mat, wf, pb, folders, tags] = await Promise.all([
    sb.from("vault_notes").select("maturity").not("maturity", "is", null),
    sb.from("vault_notes").select("workflow").not("workflow", "is", null),
    sb.from("vault_notes").select("publish").not("publish", "is", null),
    sb.from("vault_notes").select("path"),
    sb.from("vault_tags").select("tag"),
  ]);
  const uniq = <T>(rows: { [k: string]: T }[] | null, key: string): T[] => {
    const set = new Set<T>();
    for (const r of rows ?? []) {
      const v = r[key];
      if (v !== null && v !== undefined && v !== "") set.add(v);
    }
    return [...set].sort();
  };
  const maturities = uniq<string>(mat.data as never, "maturity");
  const workflows = uniq<string>(wf.data as never, "workflow");
  const publishes = uniq<string>(pb.data as never, "publish");

  const folderSet = new Set<string>();
  for (const r of folders.data ?? []) {
    const seg = (r as { path: string }).path.split("/")[0];
    if (seg) folderSet.add(seg);
  }

  const tagCounts = new Map<string, number>();
  for (const r of tags.data ?? []) {
    const t = (r as { tag: string }).tag;
    tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
  }
  const topTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));

  return {
    maturities,
    workflows,
    publishes,
    folders: [...folderSet].sort(),
    topTags,
  };
}

/**
 * 간단 stats — 대시보드 Knowledge Hub 카드용.
 */
export async function getVaultStats(): Promise<{
  total: number;
  published: number;
  growing: number;
  mature: number;
  archived: number;
  last_edited_at: string | null;
}> {
  const sb = createSupabaseAdmin();
  const [{ count: total }, { count: published }, { count: growing }, { count: mature }, { count: archived }, { data: recent }] = await Promise.all([
    sb.from("vault_notes").select("*", { count: "exact", head: true }),
    sb.from("vault_notes").select("*", { count: "exact", head: true }).eq("publish", "published"),
    sb.from("vault_notes").select("*", { count: "exact", head: true }).eq("maturity", "growing"),
    sb.from("vault_notes").select("*", { count: "exact", head: true }).eq("maturity", "mature"),
    sb.from("vault_notes").select("*", { count: "exact", head: true }).eq("lifecycle_state", "archived"),
    sb.from("vault_notes").select("last_edited_at").order("last_edited_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  return {
    total: total ?? 0,
    published: published ?? 0,
    growing: growing ?? 0,
    mature: mature ?? 0,
    archived: archived ?? 0,
    last_edited_at: recent?.last_edited_at ?? null,
  };
}
