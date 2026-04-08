import { Suspense } from "react";
import { NoteBrowserControls } from "@/components/note-browser-controls";
import { NoteList } from "@/components/note-list";
import { aggregate, fetchVaultIndex, listNotes, type ListNotesOptions } from "@/lib/vault-index";

export const metadata = { title: "Projects | OIKBAS" };
export const revalidate = 300;

const PAGE_SIZE = 24;
const FOLDER = "020_Projects/";

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

async function ProjectsContent({ sp }: { sp: Record<string, string | undefined> }) {
  const index = await fetchVaultIndex();
  const agg = aggregate(index);
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const opts: ListNotesOptions = {
    folder: FOLDER,
    q: sp.q || undefined,
    status: sp.status || undefined,
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
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        <p className="text-sm text-muted-foreground">
          020_Projects — R&D · 지원사업 · TrinityX · AIX · 기타 ({total}건)
        </p>
      </div>
      <NoteBrowserControls statusOptions={statusOptions} tagOptions={tagOptions} />
      <NoteList
        notes={notes}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        baseHref="/projects"
        searchParams={sp}
      />
    </>
  );
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 space-y-6">
      <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-muted" />}>
        <ProjectsContent sp={sp} />
      </Suspense>
    </div>
  );
}
