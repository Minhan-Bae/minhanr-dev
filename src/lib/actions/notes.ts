"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase-server";
import { commitToGitHub, getFileContent } from "@/lib/github";

/**
 * Note authoring server actions — write path for the studio editor.
 *
 * The studio writes full-file content straight into the companion
 * vault repo via GitHub's Contents API, preserving frontmatter and body
 * in a single commit. No client-side parsing — the editor hands us the
 * entire markdown blob and we treat it as opaque bytes.
 *
 * Authorisation: a Supabase session is required for every call. The
 * `/dashboard` middleware already enforces this at the request level,
 * but we re-check here so a server action fired from a stale client
 * still can't sneak past.
 */

export interface NoteEditResult {
  ok: boolean;
  error?: string;
  path?: string;
}

/**
 * Whitelist of vault paths the editor may touch. Matches folders
 * `000_*`, `010_*`, … followed by at least one more segment and a
 * `.md` file. Keeps us out of `.github/`, `docs/`, etc. by construction.
 */
const SAFE_VAULT_PATH = /^\d{3}_[^/]+\/[^\s][^/]*(\/[^\s][^/]*)*\.md$/;

async function ensureAuthed(): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Unauthorized" };
  return { ok: true };
}

/**
 * Commit a full-file update. `content` is the new raw markdown (frontmatter
 * + body). The caller is trusted to have produced well-formed YAML — we
 * don't re-parse it here.
 */
export async function saveNoteContentAction(
  path: string,
  content: string
): Promise<NoteEditResult> {
  try {
    const auth = await ensureAuthed();
    if (!auth.ok) return { ok: false, error: auth.error };

    if (!SAFE_VAULT_PATH.test(path)) {
      return { ok: false, error: "허용되지 않는 경로입니다." };
    }

    // GitHub requires the current blob SHA for an update (to detect
    // concurrent writes); null means "create".
    const existing = await getFileContent(path);
    const sha = existing?.sha;

    const basename =
      (path.split("/").pop() || path).replace(/\.md$/, "") || path;
    const commit = await commitToGitHub(
      path,
      content,
      `edit(studio): ${basename}`,
      sha
    );
    if (!commit.ok) return { ok: false, error: commit.error };

    // Revalidate every route that might render this note.
    revalidatePath(`/notes/${path}`);
    revalidatePath("/notes");
    revalidatePath("/dashboard");
    revalidatePath("/graph");
    revalidatePath("/"); // home graph pulls from posts, not vault, but
                        // cheap enough to nuke
    return { ok: true, path };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}

/**
 * Create a new note file. `folder` must be a top-level digit-prefixed
 * vault folder (e.g. `000_Inbox`); `slug` is sanitised into a filename.
 */
export async function createNoteAction(
  folder: string,
  slug: string,
  content: string
): Promise<NoteEditResult> {
  try {
    const auth = await ensureAuthed();
    if (!auth.ok) return { ok: false, error: auth.error };

    if (!/^\d{3}_[^/]+$/.test(folder)) {
      return { ok: false, error: "유효하지 않은 폴더입니다." };
    }
    // Strict-but-Korean-friendly filename sanitiser: keep alphanumerics,
    // hangul, hyphens, and underscores; everything else becomes an underscore.
    const cleaned = slug.replace(/[^0-9a-zA-Z가-힣_\-]/g, "_").replace(/_+/g, "_");
    if (!cleaned || cleaned === "_") {
      return { ok: false, error: "유효하지 않은 파일 이름입니다." };
    }
    const filename = cleaned.endsWith(".md") ? cleaned : `${cleaned}.md`;
    const path = `${folder}/${filename}`;
    if (!SAFE_VAULT_PATH.test(path)) {
      return { ok: false, error: "허용되지 않는 경로입니다." };
    }

    const existing = await getFileContent(path);
    if (existing) {
      return { ok: false, error: "이미 존재하는 파일입니다." };
    }

    const commit = await commitToGitHub(
      path,
      content,
      `new(studio): ${filename.replace(/\.md$/, "")}`
    );
    if (!commit.ok) return { ok: false, error: commit.error };

    revalidatePath("/notes");
    revalidatePath("/dashboard");
    return { ok: true, path };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}
