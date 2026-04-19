"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase-server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { commitToGitHub, getFileContent } from "@/lib/github";
import {
  parseNote,
  buildVaultNoteRow,
  extractTags,
} from "@/lib/notes-frontmatter";

/**
 * Note authoring server actions — write path for the studio editor.
 *
 * 2단계 쓰기 모델 (Phase A, 2026-04-19):
 *   1. GitHub Contents API로 vault에 커밋 (source of truth 유지).
 *   2. 성공 시 Supabase `vault_notes` 테이블에 write-through.
 *      GHA publish-to-blog.yml의 mirror 동기화를 기다리지 않고 즉시
 *      반영해서 `/notes` · `/search` · `/graph` 화면이 편집 직후부터
 *      일관성을 갖도록 한다.
 *
 * 실패 모드:
 *   • vault 커밋 실패 → Supabase 쓰지 않음 (원자성 우선).
 *   • vault 커밋 성공 + Supabase 실패 → 로그만 남기고 성공 반환.
 *     GHA가 5-10분 내 백필하므로 최종 일관성은 보장됨.
 *     사용자 피드백 루프를 끊지 않기 위해 studio는 정상 응답.
 *
 * Phase B/C 이행 시:
 *   - upsertNoteToSupabaseOnly() 추가 예정 (vault skip).
 *   - 본 파일의 두 액션은 SoT가 Supabase로 이동한 뒤 deprecate.
 */

// Next.js 16 "use server" 파일은 async function 만 export 가능.
// Non-function export 가 있으면 "A 'use server' file can only export
// async functions" 런타임 에러가 발생하므로 interface 는 file-scope
// 내부 선언으로만 둔다 (외부 import 없음).
interface NoteEditResult {
  ok: boolean;
  error?: string;
  path?: string;
  supabaseSynced?: boolean;
}

/**
 * Whitelist of vault paths the editor may touch.
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
 * Supabase write-through — vault 커밋 성공 후 즉시 호출.
 * 실패는 console.error만 하고 throw하지 않음 (vault가 SoT이므로 최종 일관성 OK).
 */
async function writeThroughToSupabase(
  path: string,
  content: string,
  editSource: "studio" | "vault" = "studio"
): Promise<boolean> {
  try {
    const parsed = parseNote(path, content);
    const row = buildVaultNoteRow(parsed, { editSource });
    const tags = extractTags(parsed.frontmatter);

    const sb = createSupabaseAdmin();

    // Upsert by path — path는 unique.
    const { data: upserted, error: upsertErr } = await sb
      .from("vault_notes")
      .upsert(row, { onConflict: "path" })
      .select("id")
      .single();

    if (upsertErr) {
      console.error("[notes.writeThrough] upsert failed", upsertErr);
      return false;
    }

    // Tags 재동기화: 기존 삭제 → 신규 insert (소규모, 원자성 불필요)
    const noteId = upserted.id;
    const { error: delErr } = await sb.from("vault_tags").delete().eq("note_id", noteId);
    if (delErr) {
      console.error("[notes.writeThrough] tag delete failed", delErr);
      return false;
    }
    if (tags.length > 0) {
      const { error: insErr } = await sb
        .from("vault_tags")
        .insert(tags.map((t) => ({ note_id: noteId, tag: t })));
      if (insErr) {
        console.error("[notes.writeThrough] tag insert failed", insErr);
        return false;
      }
    }
    return true;
  } catch (e) {
    console.error("[notes.writeThrough] unexpected", e);
    return false;
  }
}

/**
 * Commit a full-file update. vault 커밋 + Supabase 동기화.
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

    const supabaseSynced = await writeThroughToSupabase(path, content, "studio");

    // Revalidate every route that might render this note.
    revalidatePath(`/notes/${path}`);
    revalidatePath("/notes");
    revalidatePath("/dashboard");
    revalidatePath("/graph");
    revalidatePath("/search");
    revalidatePath("/");
    return { ok: true, path, supabaseSynced };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}

/**
 * Create a new note file. vault 커밋 + Supabase 동기화.
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

    const supabaseSynced = await writeThroughToSupabase(path, content, "studio");

    revalidatePath("/notes");
    revalidatePath("/dashboard");
    revalidatePath("/graph");
    revalidatePath("/search");
    return { ok: true, path, supabaseSynced };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}

/**
 * Supabase-only upsert — Phase B 이후 primary write path.
 * vault에 커밋하지 않고 DB만 업데이트. export cron이 vault로 왕복.
 *
 * 현재는 내부 테스트용 — UI는 saveNoteContentAction 사용 유지.
 */
export async function upsertNoteSupabaseOnlyAction(
  path: string,
  content: string
): Promise<NoteEditResult> {
  try {
    const auth = await ensureAuthed();
    if (!auth.ok) return { ok: false, error: auth.error };
    if (!SAFE_VAULT_PATH.test(path)) {
      return { ok: false, error: "허용되지 않는 경로입니다." };
    }
    const supabaseSynced = await writeThroughToSupabase(path, content, "studio");
    if (!supabaseSynced) {
      return { ok: false, error: "Supabase 동기화 실패" };
    }
    revalidatePath(`/notes/${path}`);
    revalidatePath("/notes");
    revalidatePath("/search");
    revalidatePath("/graph");
    return { ok: true, path, supabaseSynced: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}

/**
 * Delete note — Supabase row + tags + backlinks 삭제 (cascade).
 * vault 파일 삭제는 GitHub Contents API DELETE는 별도 함수 필요해
 * 현재는 Supabase만. Phase C에서 vault export cron이 Supabase 삭제를
 * 감지해 vault 파일 제거.
 */
/**
 * listNotePathsAction — wikilink autocomplete용 경량 경로 리스트.
 * path + title만 반환 (body 제외). 한 번에 전량 fetch 후 클라이언트에서
 * Fuse.js로 fuzzy 매칭. 1700 노트 기준 payload ≈ 150KB — 허용 범위.
 */
export async function listNotePathsAction(): Promise<
  Array<{ path: string; title: string }>
> {
  const auth = await ensureAuthed();
  if (!auth.ok) return [];
  const sb = createSupabaseAdmin();
  const { data, error } = await sb
    .from("vault_notes")
    .select("path,title")
    .order("last_edited_at", { ascending: false })
    .limit(2500);
  if (error || !data) return [];
  return data.map((r) => ({ path: r.path, title: r.title ?? r.path }));
}

export async function deleteNoteSupabaseAction(
  path: string
): Promise<NoteEditResult> {
  try {
    const auth = await ensureAuthed();
    if (!auth.ok) return { ok: false, error: auth.error };
    const sb = createSupabaseAdmin();
    const { error } = await sb.from("vault_notes").delete().eq("path", path);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/notes");
    revalidatePath("/search");
    revalidatePath("/graph");
    return { ok: true, path, supabaseSynced: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}
