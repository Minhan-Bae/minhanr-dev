import { CACHE_TTL_VAULT, VAULT_INDEX_URL } from "./constants";

export interface VaultNoteRecord {
  status?: string;
  created?: string;
  tags?: string[];
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

export interface VaultIndexFile {
  _meta: {
    version?: string;
    last_full_scan?: string;
    last_delta_update?: string;
    last_commit_hash?: string;
    total_notes?: number;
    stats?: {
      by_status?: Record<string, number>;
    };
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

export function aggregate(index: VaultIndexFile): VaultAggregates {
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
  tag?: string;
  status?: string;
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
  const { folder, tag, status, q, sort = "created_desc", limit = 50, offset = 0 } = opts;
  const ql = q?.toLowerCase();
  const out: VaultNote[] = [];
  for (const [path, rec] of Object.entries(index.notes || {})) {
    if (folder && !path.startsWith(folder)) continue;
    if (status && (rec.status || "no_status") !== status) continue;
    if (tag && !(Array.isArray(rec.tags) && rec.tags.includes(tag))) continue;
    const title = deriveTitle(path);
    if (ql && !path.toLowerCase().includes(ql) && !title.toLowerCase().includes(ql)) continue;
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
