import { Suspense } from "react";
import { NoteBrowserControls } from "@/components/note-browser-controls";
import { NoteList } from "@/components/note-list";
import type { VaultNote } from "@/lib/vault-index";
import { KB_HUB_HIDDEN_STATUSES } from "@/lib/vault-index";
import {
  listNotesFromSupabase,
  getFilterOptions,
  type SupabaseVaultNote,
  type ListNotesSupabaseOptions,
} from "@/lib/notes-supabase";

/**
 * /notes — Sprint 3. Supabase `vault_notes` 테이블을 단일 read 소스로.
 *
 * 이전에는 GitHub raw vault_index.json을 가져와 in-memory listNotes()로
 * 필터링했다. 변환:
 *   • Supabase listNotesFromSupabase() — 서버 측 필터·정렬·페이지네이션.
 *   • SupabaseVaultNote → VaultNote 어댑터 — 기존 NoteList 컴포넌트 shape
 *     그대로 재사용.
 *   • "hidden status" 정책은 publish=published + lifecycle_state=archived
 *     두 축으로 재해석 (v3 lifecycle).
 */

export const metadata = {
  title: "Notes | minhanr.dev",
  robots: { index: false, follow: false },
};
export const revalidate = 60;

const PAGE_SIZE = 24;

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

function toVaultNote(n: SupabaseVaultNote): VaultNote {
  const title = n.title ?? n.path.split("/").pop()?.replace(/\.md$/, "") ?? n.path;
  return {
    path: n.path,
    title,
    created: n.created ?? undefined,
    summary: n.summary ?? undefined,
    excerpt: n.excerpt ?? undefined,
    tags: n.tags ?? [],
    // NoteList의 STATUS_COLORS는 seed/growing/mature/active 기반이므로
    // maturity를 우선 매핑. fallback으로 workflow·publish.
    status:
      (n.maturity ?? n.workflow ?? n.publish ?? n.type) || undefined,
    deadline: n.deadline ?? undefined,
    priority: n.priority ?? undefined,
    source_type: n.source_type ?? undefined,
    type: n.type ?? undefined,
    category: n.category ?? undefined,
  };
}

async function NotesContent({
  folder,
  title,
  subtitle,
  sp,
}: {
  folder?: string;
  title: string;
  subtitle: string;
  sp: Record<string, string | undefined>;
}) {
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const explicitStatus = sp.status;
  const explicitFolder = sp.folder ?? folder;

  const opts: ListNotesSupabaseOptions = {
    folder: explicitFolder ? `${explicitFolder.replace(/\/$/, "")}/` : undefined,
    tag: sp.tag || undefined,
    q: sp.q || undefined,
    sort:
      (sp.sort as ListNotesSupabaseOptions["sort"]) || "created_desc",
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  };

  // v3 status 매핑: maturity/workflow/publish 중 명시된 값 찾기
  if (explicitStatus) {
    if (["seed", "growing", "mature", "evergreen"].includes(explicitStatus)) {
      opts.maturity = explicitStatus;
    } else if (["planning", "active", "paused", "completed"].includes(explicitStatus)) {
      opts.workflow = explicitStatus;
    } else if (["draft", "ready", "published"].includes(explicitStatus)) {
      opts.publish = explicitStatus;
    }
  }
  // Knowledge Hub: published(블로그 전용) + archived(050) 자동 제외
  if (!explicitStatus || !KB_HUB_HIDDEN_STATUSES.includes(explicitStatus as never)) {
    opts.excludePublish = ["published"];
    opts.lifecycleState = "active";
  }

  const [{ notes: rows, total }, options] = await Promise.all([
    listNotesFromSupabase(opts),
    getFilterOptions(),
  ]);

  const notes = rows.map(toVaultNote);
  const statusOptions = [
    ...options.maturities,
    ...options.workflows,
    ...options.publishes,
  ];
  const tagOptions = options.topTags.map((t) => t.tag);

  return (
    <>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <NoteBrowserControls statusOptions={statusOptions} tagOptions={tagOptions} />
      <NoteList
        notes={notes}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        baseHref="/notes"
        searchParams={sp}
      />
    </>
  );
}

export default async function NotesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 space-y-6">
      <Suspense fallback={<div className="h-40 skeleton-shimmer rounded-lg bg-muted" />}>
        <NotesContent
          title="Notes"
          subtitle="vault 전체 노트 — Supabase vault_notes"
          sp={sp}
        />
      </Suspense>
    </div>
  );
}
