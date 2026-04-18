"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveNoteContentAction } from "@/lib/actions/notes";

/**
 * NoteEditor — studio-side markdown editor.
 *
 * Phase-1 MVP: a single monospaced <textarea> for the whole note
 * (frontmatter + body). Cmd/Ctrl-S saves; pressing Tab inserts two
 * spaces; Esc cancels back to the view route.
 *
 * We intentionally don't split the frontmatter form out yet — the vault
 * has many studio-only fields with free-form values, and a naïve field
 * form would fight the author more than help. Once the content-policy
 * schema is richer, a structured frontmatter panel will sit on top of
 * this textarea.
 *
 * The server action owns the write path (GitHub Contents API commit);
 * this component just holds the draft, tracks the save state, and
 * bounces the user back to the view route on success.
 */

interface NoteEditorProps {
  path: string;
  initialContent: string;
}

export function NoteEditor({ path, initialContent }: NoteEditorProps) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [saveState, setSaveState] = useState<
    | { kind: "idle" }
    | { kind: "saving" }
    | { kind: "ok" }
    | { kind: "error"; message: string }
  >({ kind: "idle" });
  const [pending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const dirty = content !== initialContent;

  function save() {
    if (!dirty) return;
    setSaveState({ kind: "saving" });
    startTransition(async () => {
      const res = await saveNoteContentAction(path, content);
      if (res.ok) {
        setSaveState({ kind: "ok" });
        // Bounce back to the viewer so the reader sees the rendered result.
        router.push(
          "/notes/" + path.split("/").map(encodeURIComponent).join("/")
        );
        router.refresh();
      } else {
        setSaveState({ kind: "error", message: res.error ?? "알 수 없는 오류" });
      }
    });
  }

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(ev: KeyboardEvent) {
      const mod = ev.metaKey || ev.ctrlKey;
      if (mod && ev.key === "s") {
        ev.preventDefault();
        save();
      } else if (ev.key === "Escape") {
        if (!dirty || confirm("저장되지 않은 변경 사항이 있습니다. 나갈까요?")) {
          router.push(
            "/notes/" + path.split("/").map(encodeURIComponent).join("/")
          );
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, dirty]);

  function onTextareaKeyDown(ev: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (ev.key === "Tab") {
      ev.preventDefault();
      const ta = ev.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = content.slice(0, start) + "  " + content.slice(end);
      setContent(next);
      // Re-place caret after React re-renders.
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  }

  // Unsaved-change guard on tab close / browser back.
  useEffect(() => {
    function onBeforeUnload(ev: BeforeUnloadEvent) {
      if (!dirty) return;
      ev.preventDefault();
      ev.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const pathParts = path.split("/");
  const basename = pathParts.pop() ?? path;
  const breadcrumb = pathParts.join(" / ");
  const viewHref =
    "/notes/" + path.split("/").map(encodeURIComponent).join("/");

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 sm:py-10">
      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 font-technical">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            편집 · Editor
          </p>
          <div className="mt-1 flex items-baseline gap-2 text-[13px] text-muted-foreground">
            {breadcrumb && (
              <span className="truncate font-mono text-muted-foreground/60">
                {breadcrumb} /
              </span>
            )}
            <span className="truncate font-mono text-foreground">
              {basename}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={viewHref}
            className="rounded-sm border border-[var(--hairline)] px-3 py-1.5 text-[12px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
          >
            취소
          </Link>
          <button
            onClick={save}
            disabled={!dirty || pending}
            className="rounded-sm bg-primary px-4 py-1.5 text-[12px] uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending || saveState.kind === "saving" ? "저장 중…" : "저장"}
          </button>
        </div>
      </div>

      {/* Status line */}
      <div className="mb-3 flex items-center gap-4 font-technical text-[11px] text-muted-foreground">
        <span>
          {dirty ? "● 수정됨" : "○ 변경 없음"}
        </span>
        {saveState.kind === "error" && (
          <span className="text-destructive">
            저장 실패: {saveState.message}
          </span>
        )}
        <span className="ml-auto">
          ⌘S 저장 · Esc 취소 · Tab 들여쓰기
        </span>
      </div>

      {/* Editor */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={onTextareaKeyDown}
        spellCheck={false}
        className="font-mono block h-[70vh] w-full resize-y rounded-sm border border-[var(--hairline)] bg-[var(--surface-1)] p-4 text-[13px] leading-[1.7] text-foreground outline-none focus:border-primary/50"
      />
    </div>
  );
}
