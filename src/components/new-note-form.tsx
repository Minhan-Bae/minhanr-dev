"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createNoteAction } from "@/lib/actions/notes";
import { nowInKST } from "@/lib/time";

/**
 * NewNoteForm — creates a new markdown note in the vault.
 *
 * The folder picker is a short whitelist of top-level vault folders.
 * Slug is sanitised server-side. An empty editor starts with a minimal
 * YAML frontmatter scaffold (title + date + status) pre-filled from
 * the form fields; the author can rewrite everything before saving.
 */

const FOLDERS = [
  { value: "000_Inbox",              label: "000_Inbox — 빠른 캡처" },
  { value: "020_Projects",           label: "020_Projects — 프로젝트" },
  { value: "030_Areas",              label: "030_Areas — 운영 영역" },
  { value: "040_Resources",          label: "040_Resources — 자료" },
  { value: "050_Archive",            label: "050_Archive — 보관" },
];

function initialContent({
  title,
  status,
}: {
  title: string;
  status: string;
}): string {
  const date = nowInKST().toISOString().slice(0, 10);
  return `---
title: ${title || "제목 없음"}
date: ${date}
status: ${status}
tags: []
---

`;
}

export function NewNoteForm() {
  const router = useRouter();
  const [folder, setFolder] = useState(FOLDERS[0].value);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState("growing");
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setErr(null);
    const effectiveSlug = (slug || title).trim();
    if (!effectiveSlug) {
      setErr("파일 이름 또는 제목이 필요합니다.");
      return;
    }
    startTransition(async () => {
      const res = await createNoteAction(
        folder,
        effectiveSlug,
        initialContent({ title, status })
      );
      if (!res.ok) {
        setErr(res.error ?? "알 수 없는 오류");
        return;
      }
      // Hand off to the editor on the newly-created note.
      const url =
        "/notes/" +
        (res.path ?? "").split("/").map(encodeURIComponent).join("/") +
        "?edit=1";
      router.push(url);
    });
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto max-w-[720px] px-4 py-10 sm:px-6 sm:py-14 font-technical"
    >
      <div className="mb-8 flex items-baseline justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            새 노트 · New note
          </p>
          <h1 className="font-display mt-2 text-2xl tracking-[-0.015em]">
            어디에 담아 둘까요?
          </h1>
        </div>
        <Link
          href="/notes"
          className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
        >
          취소
        </Link>
      </div>

      <div className="space-y-6">
        <div>
          <label
            htmlFor="new-folder"
            className="block text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
          >
            폴더 · Folder
          </label>
          <select
            id="new-folder"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            className="mt-2 w-full rounded-sm border border-[var(--hairline)] bg-[var(--surface-1)] px-3 py-2 text-sm outline-none focus:border-primary/50"
          >
            {FOLDERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="new-title"
            className="block text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
          >
            제목 · Title
          </label>
          <input
            id="new-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 나노바나나 프로 테스트 기록"
            className="mt-2 w-full rounded-sm border border-[var(--hairline)] bg-[var(--surface-1)] px-3 py-2 text-sm outline-none focus:border-primary/50"
          />
        </div>

        <div>
          <label
            htmlFor="new-slug"
            className="block text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
          >
            파일 이름 · Filename
            <span className="ml-2 normal-case tracking-normal text-muted-foreground/60">
              비워두면 제목이 사용됩니다
            </span>
          </label>
          <input
            id="new-slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="예: nanobanana-pro-test"
            className="mt-2 w-full rounded-sm border border-[var(--hairline)] bg-[var(--surface-1)] px-3 py-2 text-sm font-mono outline-none focus:border-primary/50"
          />
        </div>

        <div>
          <label
            htmlFor="new-status"
            className="block text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
          >
            초기 상태 · Initial status
          </label>
          <select
            id="new-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-2 w-full rounded-sm border border-[var(--hairline)] bg-[var(--surface-1)] px-3 py-2 text-sm outline-none focus:border-primary/50"
          >
            <option value="seed">seed — 씨앗</option>
            <option value="growing">growing — 자라는 중</option>
            <option value="mature">mature — 정리됨</option>
          </select>
        </div>
      </div>

      {err && (
        <p className="mt-6 text-[12px] text-destructive">{err}</p>
      )}

      <div className="mt-8 flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-sm bg-primary px-5 py-2 text-[12px] uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "생성 중…" : "생성하고 편집으로 이동"}
        </button>
      </div>
    </form>
  );
}
