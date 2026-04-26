import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NoteList } from "@/components/note-list";
import type { VaultNote } from "@/lib/vault-index";
import {
  listNotesFromSupabase,
  type SupabaseVaultNote,
  type ListNotesSupabaseOptions,
} from "@/lib/notes-supabase";

/**
 * /papers — type:Research 노트 검수 인터페이스.
 *
 * vault_schema v2.0 기반:
 * - lifecycle:mature → 검수 큐 (블로그 변환 대기)
 * - lifecycle:growing → 수집 누적 (related 추가 대기)
 * - lifecycle:seed → 초기 캡처
 *
 * 기본 정렬: mature 먼저(검수 우선), 그 다음 growing/seed.
 * publish=published는 자동 제외 (블로그 발행 완료 → /blog 전용).
 */

export const metadata = {
  title: "Papers | minhanr.dev",
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
    status: n.lifecycle ?? n.maturity ?? undefined,
    lifecycle: n.lifecycle ?? undefined,
    deadline: n.deadline ?? undefined,
    priority: n.priority ?? undefined,
    source_type: n.source_type ?? undefined,
    type: n.type ?? undefined,
    category: n.category ?? undefined,
  };
}

async function PapersContent({ sp }: { sp: Record<string, string | undefined> }) {
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const lifecycleFilter = sp.lifecycle;  // seed | growing | mature

  const opts: ListNotesSupabaseOptions = {
    type: "Research",
    folder: "040_Resources/041_Tech/Research/",
    excludeLifecycle: ["archived", "published"],
    sort: "created_desc",
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  };
  if (lifecycleFilter) opts.lifecycle = lifecycleFilter;

  // mature 카운트 (검수 대기 강조)
  const matureOpts: ListNotesSupabaseOptions = {
    type: "Research",
    lifecycle: "mature",
    folder: "040_Resources/041_Tech/Research/",
    limit: 1,
  };

  const [{ notes: rows, total }, { total: matureTotal }] = await Promise.all([
    listNotesFromSupabase(opts),
    listNotesFromSupabase(matureOpts),
  ]);

  const notes = rows.map(toVaultNote);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Mature (검수 대기)</CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums">{matureTotal}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Link href="/knowledge/papers?lifecycle=mature" className="text-xs text-muted-foreground underline">
              검수 큐 →
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/knowledge/papers">
          <Badge variant={!lifecycleFilter ? "default" : "outline"}>전체</Badge>
        </Link>
        {(["mature", "growing", "seed"] as const).map((s) => (
          <Link key={s} href={`/papers?lifecycle=${s}`}>
            <Badge variant={lifecycleFilter === s ? "default" : "outline"}>{s}</Badge>
          </Link>
        ))}
      </div>

      <NoteList
        notes={notes}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        baseHref="/knowledge/papers"
        searchParams={sp}
      />
    </>
  );
}

export default async function PapersPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Papers</h1>
        <p className="text-sm text-muted-foreground">
          연구 노트 (type:Research) — RT-2 클러스터링 기반 mature는 블로그 발행 후보.
        </p>
      </div>
      <Suspense fallback={<div className="h-40 skeleton-shimmer rounded-lg bg-muted" />}>
        <PapersContent sp={sp} />
      </Suspense>
    </div>
  );
}
