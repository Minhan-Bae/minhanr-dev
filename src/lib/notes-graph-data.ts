import { getCachedVaultIndex } from "./vault-index";

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
 *  frame, so we sample down the vault to this many stubs at most.
 *  A 120 public + 280 private = 400-node pair-loop (~160K pairs) runs
 *  comfortably at 60 fps on a laptop. */
const MAX_PRIVATE = 280;

/**
 * Pull private-note stubs from the vault index. Degrades gracefully:
 * if the index fetch fails (offline build, worker outage, anything),
 * returns an empty array — the graph still works with just the public
 * posts.
 *
 * Hash-based sampling: when there are more than `MAX_PRIVATE` private
 * notes, we keep the ones whose hashed path falls below a deterministic
 * threshold. Same input → same sample across renders, no "which notes
 * are included" flicker.
 */
export async function getPrivateNoteStubs(): Promise<GraphNoteStub[]> {
  try {
    const index = await getCachedVaultIndex();
    const rawNotes = index.notes ?? {};
    const stubs: GraphNoteStub[] = [];

    for (const [path, note] of Object.entries(rawNotes)) {
      const title =
        note.title ??
        path.split("/").pop()?.replace(/\.md$/, "") ??
        path;
      const tags = Array.isArray(note.tags)
        ? note.tags.filter((t): t is string => typeof t === "string")
        : [];
      const summary =
        typeof note.summary === "string" && note.summary.length > 0
          ? note.summary
          : typeof note.excerpt === "string"
          ? note.excerpt
          : undefined;
      const folder = path.split("/")[0] ?? "Other";
      stubs.push({
        id: `vault:${path}`,
        title,
        tags,
        summary,
        folder,
      });
    }

    if (stubs.length <= MAX_PRIVATE) return stubs;

    // Deterministic sampling — keep stubs whose hash is below the
    // fraction threshold. Two runs on the same vault keep the same
    // marker field; one new note gets added without reshuffling the
    // whole constellation.
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
