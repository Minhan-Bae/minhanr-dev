"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { EditorView } from "@codemirror/view";
import type { Extension } from "@codemirror/state";
import {
  autocompletion,
  type CompletionContext,
  type CompletionResult,
} from "@codemirror/autocomplete";
import Fuse from "fuse.js";
import { saveNoteContentAction, listNotePathsAction } from "@/lib/actions/notes";
import type { EditorView as EV } from "@codemirror/view";

/**
 * NoteEditor — CodeMirror 6 기반 studio 편집기 (Sprint 2).
 *
 * 기존 MVP textarea를 대체. 구조:
 *   • CodeMirror 6 + markdown + 편집자-지향 확장(history, close brackets…)
 *     — @uiw/react-codemirror 기본 확장에 포함.
 *   • 위키링크 자동완성: `[[` 뒤에 커서가 있으면 Fuse.js로 vault 노트
 *     리스트를 fuzzy 매칭해 드롭다운. Enter/Tab으로 삽입.
 *   • Auto-save: 1초 debounce — 이전 처음 저장 이후 dirty면 자동 커밋.
 *     타이핑 중에는 UI를 블록하지 않는 startTransition 사용.
 *   • ⌘/Ctrl-S 즉시 저장, Esc는 dirty 가드 후 viewer 복귀.
 *
 * Phase A 쓰기 경로: saveNoteContentAction → GitHub vault 커밋 + Supabase
 * write-through. 자동 저장은 동일 action 사용.
 *
 * 노트 리스트(위키링크 대상)는 마운트 시 한 번 fetch — 1700 노트 기준
 * payload ≈ 150KB. 편집 세션 중 vault에 신규 노트가 추가돼도 refetch
 * 없음 (세션 재시작으로 해결). 미래 개선: Supabase realtime 구독.
 */

interface NoteEditorProps {
  path: string;
  initialContent: string;
}

interface NotePathItem {
  path: string;
  title: string;
}

type SaveState =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "ok"; at: number }
  | { kind: "error"; message: string };

const AUTO_SAVE_DELAY_MS = 1000;

/**
 * 위키링크 자동완성 소스.
 * `[[` 바로 뒤에 입력 중일 때만 작동. Fuse.js로 path·title fuzzy 매칭.
 */
function makeWikilinkSource(
  fuse: Fuse<NotePathItem> | null,
  notes: NotePathItem[]
) {
  return function wikilinkSource(ctx: CompletionContext): CompletionResult | null {
    // `[[...커서` 패턴 — 닫는 `]]` 미입력 상태
    const match = ctx.matchBefore(/\[\[([^\[\]\n]*)$/);
    if (!match) return null;
    const query = match.text.slice(2).trim();
    const from = match.from + 2;
    const to = ctx.pos;

    let picks: NotePathItem[] = [];
    if (!query) {
      picks = notes.slice(0, 20);
    } else if (fuse) {
      picks = fuse.search(query, { limit: 20 }).map((r) => r.item);
    }

    return {
      from,
      to,
      options: picks.map((n) => ({
        label: n.title,
        detail: n.path,
        apply: `${n.path.replace(/\.md$/, "")}]]`,
      })),
      validFor: /^[^\[\]\n]*$/,
    };
  };
}

export function NoteEditor({ path, initialContent }: NoteEditorProps) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [savedContent, setSavedContent] = useState(initialContent);
  const [saveState, setSaveState] = useState<SaveState>({ kind: "idle" });
  const [pending, startTransition] = useTransition();
  const [notes, setNotes] = useState<NotePathItem[]>([]);

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dirty = content !== savedContent;

  // ── 노트 리스트 fetch (wikilink 대상) ──────────────────────────
  useEffect(() => {
    let cancelled = false;
    listNotePathsAction().then((rows) => {
      if (!cancelled) setNotes(rows);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const fuse = useMemo(
    () =>
      notes.length === 0
        ? null
        : new Fuse(notes, {
            keys: ["title", "path"],
            threshold: 0.4,
            ignoreLocation: true,
          }),
    [notes]
  );

  // ── R2 paste/drop upload ──────────────────────────────────
  const [uploadState, setUploadState] = useState<
    | { kind: "idle" }
    | { kind: "uploading"; name: string }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  const uploadFile = useCallback(
    async (file: File): Promise<string | null> => {
      setUploadState({ kind: "uploading", name: file.name });
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("path", path);
        const res = await fetch("/api/r2/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) {
          setUploadState({ kind: "error", message: data?.error ?? `HTTP ${res.status}` });
          return null;
        }
        setUploadState({ kind: "idle" });
        return data.url as string;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setUploadState({ kind: "error", message: msg });
        return null;
      }
    },
    [path]
  );

  /**
   * 에디터 편집 위치에 텍스트 삽입. CodeMirror EditorView의 dispatch로
   * 트랜잭션 실행 — onChange는 자동으로 content 상태 동기. View는
   * domEventHandlers 콜백이 두 번째 인자로 넘겨주므로 ref 불필요.
   */
  const insertAtCursor = useCallback((view: EV, text: string) => {
    const { from } = view.state.selection.main;
    view.dispatch({
      changes: { from, insert: text },
      selection: { anchor: from + text.length },
    });
    view.focus();
  }, []);

  const handlePasteOrDrop = useCallback(
    async (view: EV, files: FileList | File[]) => {
      const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (images.length === 0) return;
      for (const f of images) {
        const url = await uploadFile(f);
        if (url) {
          const alt = f.name.replace(/\.[^.]+$/, "");
          insertAtCursor(view, `\n![${alt}](${url})\n`);
        }
      }
    },
    [uploadFile, insertAtCursor]
  );

  // CodeMirror DOM event extensions
  const pasteDropExtension = useMemo<Extension>(() => {
    return EditorView.domEventHandlers({
      paste: (event, view) => {
        const items = event.clipboardData?.items;
        if (!items) return false;
        const files: File[] = [];
        for (const item of items) {
          if (item.kind === "file") {
            const f = item.getAsFile();
            if (f) files.push(f);
          }
        }
        if (files.length === 0) return false;
        event.preventDefault();
        handlePasteOrDrop(view, files);
        return true;
      },
      drop: (event, view) => {
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;
        event.preventDefault();
        handlePasteOrDrop(view, files);
        return true;
      },
    });
  }, [handlePasteOrDrop]);

  // ── Save ────────────────────────────────────────────────────
  const save = useCallback(
    (explicit = false) => {
      if (content === savedContent) return;
      const current = content;
      setSaveState({ kind: "saving" });
      startTransition(async () => {
        const res = await saveNoteContentAction(path, current);
        if (res.ok) {
          setSavedContent(current);
          setSaveState({ kind: "ok", at: Date.now() });
          if (explicit) {
            router.push(
              "/notes/" + path.split("/").map(encodeURIComponent).join("/")
            );
            router.refresh();
          }
        } else {
          setSaveState({ kind: "error", message: res.error ?? "알 수 없는 오류" });
        }
      });
    },
    [content, savedContent, path, router]
  );

  // ── Auto-save debounce ─────────────────────────────────────
  useEffect(() => {
    if (!dirty) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      save(false);
    }, AUTO_SAVE_DELAY_MS);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [content, dirty, save]);

  // ── Keyboard shortcuts ─────────────────────────────────────
  useEffect(() => {
    function onKey(ev: KeyboardEvent) {
      const mod = ev.metaKey || ev.ctrlKey;
      if (mod && ev.key === "s") {
        ev.preventDefault();
        save(true);
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
  }, [dirty, save, path, router]);

  // ── Unsaved guard ──────────────────────────────────────────
  useEffect(() => {
    function onBeforeUnload(ev: BeforeUnloadEvent) {
      if (!dirty) return;
      ev.preventDefault();
      ev.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  // ── CodeMirror extensions ─────────────────────────────────
  const extensions = useMemo<Extension[]>(() => {
    const ext: Extension[] = [
      markdown(),
      EditorView.lineWrapping,
      EditorView.theme({
        "&": { fontSize: "13.5px" },
        ".cm-content": { fontFamily: "var(--font-mono, ui-monospace, monospace)", padding: "16px" },
        ".cm-scroller": { lineHeight: "1.7" },
        "&.cm-focused": { outline: "none" },
      }),
    ];
    if (notes.length > 0) {
      ext.push(
        autocompletion({
          override: [makeWikilinkSource(fuse, notes)],
          activateOnTyping: true,
          maxRenderedOptions: 20,
        })
      );
    }
    ext.push(pasteDropExtension);
    return ext;
  }, [fuse, notes, pasteDropExtension]);

  const pathParts = path.split("/");
  const basename = pathParts.pop() ?? path;
  const breadcrumb = pathParts.join(" / ");
  const viewHref = "/notes/" + path.split("/").map(encodeURIComponent).join("/");

  const statusPill = (() => {
    if (saveState.kind === "saving" || pending) return { cls: "text-muted-foreground", text: "저장 중…" };
    if (saveState.kind === "error") return { cls: "text-destructive", text: `저장 실패: ${saveState.message}` };
    if (saveState.kind === "ok") return { cls: "text-primary", text: `저장됨 ${new Date(saveState.at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}` };
    if (dirty) return { cls: "text-muted-foreground", text: "● 수정됨" };
    return { cls: "text-muted-foreground/60", text: "○ 변경 없음" };
  })();

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
            <span className="truncate font-mono text-foreground">{basename}</span>
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
            type="button"
            onClick={() => save(true)}
            disabled={!dirty || pending}
            className="rounded-sm bg-primary px-4 py-1.5 text-[12px] uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending || saveState.kind === "saving" ? "저장 중…" : "저장"}
          </button>
        </div>
      </div>

      {/* Status line */}
      <div className="mb-3 flex items-center gap-4 font-technical text-[11px]">
        <span className={statusPill.cls}>{statusPill.text}</span>
        {uploadState.kind === "uploading" && (
          <span className="text-muted-foreground">업로드 중 · {uploadState.name}</span>
        )}
        {uploadState.kind === "error" && (
          <span className="text-destructive">업로드 실패: {uploadState.message}</span>
        )}
        <span className="ml-auto text-muted-foreground/70">
          ⌘S 저장 · Esc 취소 · `[[` 위키링크 · paste/drop 이미지 · 자동저장 1s
        </span>
      </div>

      {/* Editor */}
      <div className="rounded-sm border border-[var(--hairline)] bg-[var(--surface-1)] focus-within:border-primary/50">
        <CodeMirror
          value={content}
          onChange={(v) => setContent(v)}
          extensions={extensions}
          basicSetup={{
            lineNumbers: false,
            foldGutter: false,
            highlightActiveLine: false,
            highlightActiveLineGutter: false,
            dropCursor: true,
            autocompletion: true,
            closeBrackets: true,
            history: true,
          }}
          height="70vh"
          theme="dark"
        />
      </div>
    </div>
  );
}
