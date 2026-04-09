import { Suspense } from "react";
import { NoteBrowserControls } from "@/components/note-browser-controls";
import { NoteList } from "@/components/note-list";
import { aggregate, fetchVaultIndex, listNotes, type ListNotesOptions } from "@/lib/vault-index";

export const metadata = {
  title: "Notes | OIKBAS",
  robots: { index: false, follow: false },
};
export const revalidate = 300;

const PAGE_SIZE = 24;

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

async function NotesContent({ folder, title, subtitle, sp }: {
  folder?: string;
  title: string;
  subtitle: string;
  sp: Record<string, string | undefined>;
}) {
  const index = await fetchVaultIndex();
  const agg = aggregate(index);
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const opts: ListNotesOptions = {
    folder,
    q: sp.q || undefined,
    status: sp.status || undefined,
    // Knowledge Hub: published 노트는 /blog 전용이므로 자동 제외 (사용자가 명시적으로 status=published 필터를 걸면 보여줌)
    excludeStatus: sp.status === "published" ? undefined : "published",
    tag: sp.tag || undefined,
    sort: (sp.sort as ListNotesOptions["sort"]) || "created_desc",
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  };
  const { notes, total } = listNotes(index, opts);
  const statusOptions = Object.keys(agg.by_status).sort();
  const tagOptions = agg.by_tag_top.map((t) => t.tag);

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
      <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-muted" />}>
        <NotesContent
          title="Notes"
          subtitle="OIKBAS 볼트 전체 노트 — vault_index 기반"
          sp={sp}
        />
      </Suspense>
    </div>
  );
}
