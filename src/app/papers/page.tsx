import { Suspense } from "react";
import { NoteBrowserControls } from "@/components/note-browser-controls";
import { NoteList } from "@/components/note-list";
import { aggregate, getCachedVaultIndex, kbHubExcludeStatus, listNotes, type ListNotesOptions } from "@/lib/vault-index";
import { PAPERS_FOLDERS } from "@/lib/vault-tiers";

export const metadata = {
  title: "Papers | OIKBAS",
  robots: { index: false, follow: false },
};
export const revalidate = 300;

const PAGE_SIZE = 24;

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

async function PapersContent({ sp }: { sp: Record<string, string | undefined> }) {
  const index = await getCachedVaultIndex();
  const agg = aggregate(index);
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const opts: ListNotesOptions = {
    // Lab notebook: 040_Resources/041_Tech/Research + 030_Areas/031_Research 결합
    folders: PAPERS_FOLDERS,
    q: sp.q || undefined,
    status: sp.status || undefined,
    // Knowledge Hub: published(/blog 전용)와 archived(050_Archive 이동) 자동 제외.
    excludeStatus: kbHubExcludeStatus(sp.status),
    tag: sp.tag || undefined,
    sort: (sp.sort as ListNotesOptions["sort"]) || "created_desc",
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  };
  const { notes, total } = listNotes(index, opts);
  const statusOptions = Object.keys(agg.by_status).sort();
  const tagOptions = agg.by_tag_top.map((t) => t.tag);
  const categories = Object.entries(agg.by_research_category)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 13);

  return (
    <>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Papers</h1>
        <p className="text-sm text-muted-foreground">
          041_Tech/Research + 031_Research — 논문·기술·주간 리서치 ({total}건)
        </p>
      </div>
      <div className="flex flex-wrap gap-2 text-[10px]">
        {categories.map(([cat, count]) => (
          <span
            key={cat}
            className="rounded-md border border-border px-2 py-0.5 text-muted-foreground"
          >
            {cat} <span className="text-foreground tabular-nums">{count}</span>
          </span>
        ))}
      </div>
      <NoteBrowserControls statusOptions={statusOptions} tagOptions={tagOptions} />
      <NoteList
        notes={notes}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        baseHref="/papers"
        searchParams={sp}
      />
    </>
  );
}

export default async function PapersPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 space-y-6">
      <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-muted" />}>
        <PapersContent sp={sp} />
      </Suspense>
    </div>
  );
}
