import { listNotesFromSupabase } from "./notes-supabase";

/**
 * Minimal note shape the NotesGraph needs, whether the source is a
 * public blog post or a private vault entry. The graph classifies into
 * AREAs with a keyword heuristic (see `notes-graph.tsx`) and builds
 * edges from tag overlap, so title + tags + optional summary is all
 * we pass over the client boundary.
 */
export interface GraphNoteStub {
  /** Unique id — `vault:<path>` for private, or the post slug for public. */
  id: string;
  /** Label for the tooltip (private notes don't render a tooltip in the
   *  final component but we keep the title for physics + debugging). */
  title: string;
  tags: string[];
  /** Optional — helps the area classifier pick the right bucket. */
  summary?: string;
  /** Top-level vault folder (e.g. "050_Research"). Reserved for future
   *  folder-based tinting; unused at the moment. */
  folder?: string;
}

/** Safety cap — the SVG graph runs a full O(n²) physics pass each
 *  frame, so we sample down the vault to this many stubs at most. */
const MAX_PRIVATE = 280;
const FETCH_CAP = 2500;

/**
 * Supabase `vault_notes` + `vault_tags`에서 private 노트 stub 생성.
 * Sprint 3.4 — 이전엔 GitHub raw vault_index.json 의존, 지금은 DB 단일 소스.
 *
 * 600개 이상 노트가 있으므로 deterministic 샘플링으로 MAX_PRIVATE 이하로
 * 유지 (frame budget 보호). hash-based — 같은 입력이면 같은 샘플.
 */
export async function getPrivateNoteStubs(): Promise<GraphNoteStub[]> {
  try {
    const { notes } = await listNotesFromSupabase({
      lifecycleState: "active",
      excludePublish: ["published"],
      sort: "updated_desc",
      limit: FETCH_CAP,
    });

    const stubs: GraphNoteStub[] = notes.map((n) => {
      const title =
        n.title ?? n.path.split("/").pop()?.replace(/\.md$/, "") ?? n.path;
      const summary = n.summary ?? n.excerpt ?? undefined;
      const folder = n.path.split("/")[0] ?? "Other";
      return {
        id: `vault:${n.path}`,
        title,
        tags: n.tags ?? [],
        summary,
        folder,
      };
    });

    if (stubs.length <= MAX_PRIVATE) return stubs;

    const ratio = MAX_PRIVATE / stubs.length;
    return stubs.filter((s) => hashString(s.id) < ratio);
  } catch {
    return [];
  }
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 0xffffffff;
}
