import { unstable_cache } from "next/cache";
import { CACHE_TTL_VAULT, VAULT_INDEX_URL } from "./constants";

export interface VaultNoteRecord {
  title?: string;        // Layer 1: 인덱스 사전 추출
  status?: string;
  created?: string;
  tags?: string[];
  summary?: string;      // Layer 1: 인덱스 사전 추출
  excerpt?: string;      // Layer 1: 본문 첫 240자 (룰 기반 추출)
  domain?: string | string[];
  priority?: string;
  deadline?: string;
  next_action?: string;
  related?: string | string[];
  relevance?: string | number;
  source_type?: string;
  source_url?: string;
  agent?: string;
  dispatch?: string;
  type?: string;
  // catch-all
  [k: string]: unknown;
}

/**
 * Layer 1 (oikbas update_vault_index.py) schema 2부터 _meta.stats에 사전 집계
 * 모든 Knowledge Hub 라우트의 by_* 집계를 인덱스 생성 시점에 미리 계산해 둔다.
 */
export interface VaultIndexStats {
  by_status?: Record<string, number>;
  by_folder?: Record<string, number>;
  by_research_category?: Record<string, number>;
  by_tag_top?: Array<{ tag: string; count: number }>;
  by_month_created?: Array<{ month: string; count: number }>;
  links_count?: number;
}

export interface VaultIndexFile {
  schema_version?: number;  // Layer 1: 2 = 사전 집계 + excerpt 도입
  _meta: {
    version?: string;
    last_full_scan?: string;
    last_delta_update?: string;
    last_commit_hash?: string;
    total_notes?: number;
    stats?: VaultIndexStats;
  };
  notes: Record<string, VaultNoteRecord>;
}

export interface VaultNote extends VaultNoteRecord {
  path: string;
  title: string;
}

export interface VaultAggregates {
  total_notes: number;
  last_full_scan: string | null;
  last_commit_hash: string | null;
  by_status: Record<string, number>;
  by_folder: Record<string, number>;
  by_research_category: Record<string, number>;
  by_tag_top: Array<{ tag: string; count: number }>;
  by_month_created: Array<{ month: string; count: number }>;
  by_month_by_folder: Array<{
    month: string;
    Daily: number;
    Projects: number;
    Resources: number;
    Areas: number;
    Other: number;
  }>;
  deadlines_summary: {
    overdue: number;
    today: number;
    this_week: number;
    later: number;
  };
  links_count: number;
  recent_growing: VaultNote[];
}

const RESEARCH_PREFIX = "040_Resources/041_Tech/Research/";

export async function fetchVaultIndex(): Promise<VaultIndexFile> {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3.raw",
    "User-Agent": "minhanr-dev",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(VAULT_INDEX_URL, {
    headers,
    next: { revalidate: CACHE_TTL_VAULT },
  });
  if (!res.ok) {
    throw new Error(`vault_index fetch failed: ${res.status}`);
  }
  return (await res.json()) as VaultIndexFile;
}

/**
 * 30초 메모리 캐시 레이어 (Layer 3-2).
 * Next.js ISR(라우트 레벨 5분)과 별개로, 같은 vault_index를 짧은 간격으로
 * 여러 페이지가 동시 요청할 때 GitHub raw fetch를 한 번으로 줄인다.
 *
 * Knowledge Hub 라우트는 모두 이 함수를 통해 fetch한다.
 */
export const getCachedVaultIndex = unstable_cache(
  fetchVaultIndex,
  ["vault-index"],
  { revalidate: 30, tags: ["vault-index"] }
);

function topFolderOf(path: string): string {
  const seg = path.split("/")[0];
  if (!seg) return "Other";
  if (!seg.includes("_") || !/^\d/.test(seg)) return "Root";
  return seg;
}

function bucketOf(path: string): "Daily" | "Projects" | "Resources" | "Areas" | "Other" {
  if (path.startsWith("010_Daily/")) return "Daily";
  if (path.startsWith("020_Projects/")) return "Projects";
  if (path.startsWith("040_Resources/")) return "Resources";
  if (path.startsWith("030_Areas/")) return "Areas";
  return "Other";
}

function monthOf(dateStr?: string): string | null {
  if (!dateStr) return null;
  const m = /^(\d{4})-(\d{2})/.exec(dateStr);
  if (!m) return null;
  return `${m[1]}-${m[2]}`;
}

function isValidDeadline(s?: string): s is string {
  return !!s && s !== "null" && /^\d{4}-\d{2}-\d{2}/.test(s);
}

function classifyDeadline(deadline: string, now: Date): "overdue" | "today" | "this_week" | "later" {
  const d = new Date(deadline);
  if (Number.isNaN(d.getTime())) return "later";
  const day = 24 * 60 * 60 * 1000;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  if (target < startOfToday) return "overdue";
  if (target === startOfToday) return "today";
  if (target - startOfToday <= 7 * day) return "this_week";
  return "later";
}

function deriveTitle(path: string): string {
  const base = path.split("/").pop() || path;
  return base.replace(/\.md$/, "");
}

/**
 * Layer 3-1 — 사전 집계 우선 사용.
 *
 * schema_version >= 2 의 vault_index.json은 _meta.stats에 by_folder/
 * by_research_category/by_tag_top/by_month_created/links_count/by_status를
 * 미리 계산해 둔다. 그 경우 921개 노트 풀 순회 없이 stats를 직접 사용해
 * O(1)에 가깝게 응답한다.
 *
 * 풀 순회가 여전히 필요한 항목 (사전 집계 불가):
 *   - by_month_by_folder (folder × month 곱집합 — 차트 전용, 폴백 시에만 계산)
 *   - deadlines_summary (오늘 기준 분류이므로 인덱스 시점에 계산 불가)
 *   - recent_growing (5개만 픽 — 짧은 단일 순회)
 *
 * schema 2 미만 인덱스(이전 버전)는 aggregateLegacy로 폴백.
 */
export function aggregate(index: VaultIndexFile): VaultAggregates {
  const meta = index._meta || {};
  const stats = meta.stats || {};
  const schemaOk =
    (index.schema_version ?? 0) >= 2 &&
    !!stats.by_folder &&
    !!stats.by_tag_top &&
    !!stats.by_month_created;

  if (!schemaOk) {
    return aggregateLegacy(index);
  }

  return {
    total_notes: meta.total_notes ?? Object.keys(index.notes || {}).length,
    last_full_scan: meta.last_full_scan ?? null,
    last_commit_hash: meta.last_commit_hash ?? null,
    by_status: stats.by_status ?? {},
    by_folder: stats.by_folder ?? {},
    by_research_category: stats.by_research_category ?? {},
    by_tag_top: stats.by_tag_top ?? [],
    by_month_created: stats.by_month_created ?? [],
    by_month_by_folder: [],   // 사전 집계 외 — 차트 사용 시 별도 함수 필요
    deadlines_summary: computeDeadlinesSummary(index),
    links_count: stats.links_count ?? 0,
    recent_growing: pickRecentGrowing(index, 5),
  };
}

/**
 * deadlines_summary는 "오늘 기준" 분류라 인덱스 빌드 시점에 계산 불가.
 * 단일 패스 — 921개 순회는 하지만 다른 집계와 분리되어 짧음.
 */
function computeDeadlinesSummary(index: VaultIndexFile): VaultAggregates["deadlines_summary"] {
  const now = new Date();
  const summary = { overdue: 0, today: 0, this_week: 0, later: 0 };
  for (const rec of Object.values(index.notes || {})) {
    if (isValidDeadline(rec.deadline)) {
      summary[classifyDeadline(rec.deadline, now)] += 1;
    }
  }
  return summary;
}

function pickRecentGrowing(index: VaultIndexFile, n: number): VaultNote[] {
  const growing: VaultNote[] = [];
  for (const [path, rec] of Object.entries(index.notes || {})) {
    if (rec.status === "growing") {
      growing.push({ ...rec, path, title: deriveTitle(path) });
    }
  }
  growing.sort((a, b) => (b.created || "").localeCompare(a.created || ""));
  return growing.slice(0, n);
}

/**
 * 폴백 — schema 2 이전 인덱스(사전 집계 없음)용 풀 순회 로직.
 * 이전 버전과 호환성 보존. 정상 운영에선 호출되지 않는다.
 */
function aggregateLegacy(index: VaultIndexFile): VaultAggregates {
  const meta = index._meta || {};
  const notes = index.notes || {};
  const now = new Date();

  const by_status: Record<string, number> = {};
  const by_folder: Record<string, number> = {};
  const by_research_category: Record<string, number> = {};
  const by_tag: Record<string, number> = {};
  const by_month: Record<string, number> = {};
  const by_month_bucket: Record<string, { Daily: number; Projects: number; Resources: number; Areas: number; Other: number }> = {};
  const deadlines_summary = { overdue: 0, today: 0, this_week: 0, later: 0 };
  let links_count = 0;
  const growing: VaultNote[] = [];

  for (const [path, rec] of Object.entries(notes)) {
    const status = rec.status || "no_status";
    by_status[status] = (by_status[status] || 0) + 1;

    const top = topFolderOf(path);
    by_folder[top] = (by_folder[top] || 0) + 1;

    if (path.startsWith(RESEARCH_PREFIX)) {
      const cat = path.slice(RESEARCH_PREFIX.length).split("/")[0];
      if (cat) by_research_category[cat] = (by_research_category[cat] || 0) + 1;
    }

    if (Array.isArray(rec.tags)) {
      for (const t of rec.tags) {
        if (typeof t === "string" && t) by_tag[t] = (by_tag[t] || 0) + 1;
      }
    }

    const month = monthOf(rec.created);
    if (month) {
      by_month[month] = (by_month[month] || 0) + 1;
      const bucket = bucketOf(path);
      if (!by_month_bucket[month]) {
        by_month_bucket[month] = { Daily: 0, Projects: 0, Resources: 0, Areas: 0, Other: 0 };
      }
      by_month_bucket[month][bucket] += 1;
    }

    if (isValidDeadline(rec.deadline)) {
      deadlines_summary[classifyDeadline(rec.deadline, now)] += 1;
    }

    if (typeof rec.source_url === "string" && rec.source_url.startsWith("http")) {
      links_count += 1;
    }

    if (status === "growing") {
      growing.push({ ...rec, path, title: deriveTitle(path) });
    }
  }

  const by_tag_top = Object.entries(by_tag)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 30)
    .map(([tag, count]) => ({ tag, count }));

  // last 12 months timeline
  const allMonths = Object.keys(by_month).sort();
  const last12 = allMonths.slice(-12);
  const by_month_created = last12.map((m) => ({ month: m, count: by_month[m] || 0 }));
  const by_month_by_folder = last12.map((m) => ({
    month: m,
    Daily: by_month_bucket[m]?.Daily ?? 0,
    Projects: by_month_bucket[m]?.Projects ?? 0,
    Resources: by_month_bucket[m]?.Resources ?? 0,
    Areas: by_month_bucket[m]?.Areas ?? 0,
    Other: by_month_bucket[m]?.Other ?? 0,
  }));

  const recent_growing = growing
    .sort((a, b) => (b.created || "").localeCompare(a.created || ""))
    .slice(0, 5);

  return {
    total_notes: meta.total_notes ?? Object.keys(notes).length,
    last_full_scan: meta.last_full_scan ?? null,
    last_commit_hash: meta.last_commit_hash ?? null,
    by_status,
    by_folder,
    by_research_category,
    by_tag_top,
    by_month_created,
    by_month_by_folder,
    deadlines_summary,
    links_count,
    recent_growing,
  };
}

export interface ListNotesOptions {
  folder?: string;       // path prefix, e.g. "020_Projects/"
  folders?: readonly string[]; // OR 매칭용 prefix 배열 (folder와 함께 쓰면 합집합)
  tag?: string;
  status?: string;
  excludeStatus?: string | string[]; // Knowledge Hub: published 자동 제외 등
  q?: string;            // case-insensitive substring on title/path
  sort?: "created_desc" | "created_asc" | "title_asc";
  limit?: number;
  offset?: number;
}

export interface ListNotesResult {
  notes: VaultNote[];
  total: number;
}

export function listNotes(index: VaultIndexFile, opts: ListNotesOptions = {}): ListNotesResult {
  const { folder, folders, tag, status, excludeStatus, q, sort = "created_desc", limit = 50, offset = 0 } = opts;
  const ql = q?.toLowerCase();
  const excludeSet = excludeStatus
    ? new Set(Array.isArray(excludeStatus) ? excludeStatus : [excludeStatus])
    : null;
  // folder와 folders는 OR 합집합. 둘 다 비어 있으면 폴더 필터 없음.
  const folderPrefixes: string[] = [];
  if (folder) folderPrefixes.push(folder);
  if (folders) folderPrefixes.push(...folders);
  const folderFilterActive = folderPrefixes.length > 0;
  const out: VaultNote[] = [];
  for (const [path, rec] of Object.entries(index.notes || {})) {
    if (folderFilterActive && !folderPrefixes.some((p) => path.startsWith(p))) continue;
    if (status && (rec.status || "no_status") !== status) continue;
    if (excludeSet && excludeSet.has(rec.status || "no_status")) continue;
    if (tag && !(Array.isArray(rec.tags) && rec.tags.includes(tag))) continue;
    // Layer 1: title은 frontmatter에서 우선, 없으면 파일명 fallback
    const title =
      typeof rec.title === "string" && rec.title ? rec.title : deriveTitle(path);
    if (ql) {
      // Layer 1: q 검색 매칭에 title + path + excerpt + summary + tags 포함
      const haystack = [
        path,
        title,
        typeof rec.excerpt === "string" ? rec.excerpt : "",
        typeof rec.summary === "string" ? rec.summary : "",
        Array.isArray(rec.tags) ? rec.tags.join(" ") : "",
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(ql)) continue;
    }
    out.push({ ...rec, path, title });
  }
  out.sort((a, b) => {
    if (sort === "title_asc") return a.title.localeCompare(b.title);
    if (sort === "created_asc") return (a.created || "").localeCompare(b.created || "");
    return (b.created || "").localeCompare(a.created || "");
  });
  const total = out.length;
  return { notes: out.slice(offset, offset + limit), total };
}
