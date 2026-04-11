import { Suspense } from "react";
import { NoteBrowserControls } from "@/components/note-browser-controls";
import { NoteList } from "@/components/note-list";
import { aggregate, getCachedVaultIndex, kbHubExcludeStatus, listNotes, type ListNotesOptions } from "@/lib/vault-index";
import { PROJECTS_FOLDERS } from "@/lib/vault-tiers";

export const metadata = {
  title: "Projects | OIKBAS",
  robots: { index: false, follow: false },
};
export const revalidate = 300;

const PAGE_SIZE = 24;

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

async function ProjectsContent({ sp }: { sp: Record<string, string | undefined> }) {
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const opts: ListNotesOptions = {
    // Tier 2 화이트리스트: 021_R&D + 023_Trinity_x만 공개
    // (022_지원사업, 024_AIX챌린지는 Tier 3 — auth 필수)
    folders: PROJECTS_FOLDERS,
    q: sp.q || undefined,
    status: sp.status || undefined,
    // Knowledge Hub: published(/blog 전용)와 archived(050_Archive 이동) 자동 제외.
    excludeStatus: kbHubExcludeStatus(sp.status),
    tag: sp.tag || undefined,
    sort: (sp.sort as ListNotesOptions["sort"]) || "created_desc",
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  };

  // Phase G-defense: vault index 미접근 시 graceful degrade.
  // 홈 (page.tsx loadHomeData) 와 동일한 패턴 — 일시적 GitHub outage,
  // rate limit, 또는 로컬 dev 의 PAT 권한 부재 (§6 vault 404 함정) 시
  // 500 대신 placeholder 노출.
  let index, agg, listed;
  try {
    index = await getCachedVaultIndex();
    agg = aggregate(index);
    listed = listNotes(index, opts);
  } catch {
    return (
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Projects</h1>
        <p className="text-sm text-muted-foreground">
          vault index unreachable — placeholder until token / data flow restored.
        </p>
      </div>
    );
  }

  const { notes, total } = listed;
  const statusOptions = Object.keys(agg.by_status).sort();
  const tagOptions = agg.by_tag_top.map((t) => t.tag);

  return (
    <>
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Projects</h1>
        <p className="text-sm text-muted-foreground">
          021_R&D · 023_Trinity_x ({total}건) — 지원사업·AIX는 인증 필요
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
      <Suspense fallback={<div className="h-40 skeleton-shimmer rounded-lg bg-muted" />}>
        <ProjectsContent sp={sp} />
      </Suspense>
    </div>
  );
}
