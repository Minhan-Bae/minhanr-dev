import { Suspense } from "react";
import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NoteList } from "@/components/note-list";
import type { VaultNote } from "@/lib/vault-index";
import {
  listNotesFromSupabase,
  type SupabaseVaultNote,
  type ListNotesSupabaseOptions,
} from "@/lib/notes-supabase";

/**
 * /projects — 020_Projects status 기반 워크플로 뷰.
 *
 * vault_schema v2.0:
 * - status: planning|active|paused|completed|archived (Project 노트 전용)
 * - 050_Archive로 이동된 Project는 lifecycle=archived (자동 제외)
 *
 * 기본: active만 표시. status 필터로 다른 상태 조회.
 * Master 노트만 표시 (path에 _Master.md 또는 _작업가이드.md 포함).
 */

export const metadata = {
  title: "Projects | minhanr.dev",
  robots: { index: false, follow: false },
};
export const revalidate = 60;

const PAGE_SIZE = 30;

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
    status: n.status ?? n.workflow ?? undefined,
    deadline: n.deadline ?? undefined,
    priority: n.priority ?? undefined,
    type: n.type ?? undefined,
    category: n.category ?? undefined,
  };
}

const STATUSES = ["active", "planning", "paused", "completed"] as const;

async function ProjectsContent({ sp }: { sp: Record<string, string | undefined> }) {
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const statusFilter = sp.status ?? "active";
  const categoryFilter = sp.category;  // work | personal

  const opts: ListNotesSupabaseOptions = {
    folder: "020_Projects/",
    type: "Project",
    excludeLifecycle: ["archived"],
    sort: "created_desc",
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  };
  if (statusFilter !== "all") opts.status = statusFilter;

  // 상태별 카운트 (KPI 카드)
  const counts = await Promise.all(
    STATUSES.map((s) =>
      listNotesFromSupabase({
        folder: "020_Projects/",
        type: "Project",
        status: s,
        excludeLifecycle: ["archived"],
        limit: 1,
      }).then((r) => ({ status: s, total: r.total }))
    )
  );

  const { notes: rows, total } = await listNotesFromSupabase(opts);
  let notes = rows.map(toVaultNote);

  // category 클라이언트 필터 (Supabase 쿼리에 추가하려면 별도 컬럼 필터 필요)
  if (categoryFilter) {
    notes = notes.filter((n) => n.category === categoryFilter);
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {counts.map(({ status, total }) => {
          const accent =
            status === "active" ? "border-l-emerald-500"
            : status === "planning" ? "border-l-amber-500"
            : status === "paused" ? "border-l-muted-foreground"
            : "border-l-purple-500";
          return (
            <Card key={status} className={`border-l-4 ${accent}`}>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs capitalize">{status}</CardDescription>
                <CardTitle className="text-2xl font-bold tabular-nums">{total}</CardTitle>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground mr-1">Status:</span>
        <Link href="/knowledge/projects?status=all">
          <Badge variant={statusFilter === "all" ? "default" : "outline"}>전체</Badge>
        </Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`/projects?status=${s}`}>
            <Badge variant={statusFilter === s ? "default" : "outline"}>{s}</Badge>
          </Link>
        ))}
        <span className="text-xs text-muted-foreground ml-3 mr-1">Category:</span>
        <Link href={`/projects?status=${statusFilter}`}>
          <Badge variant={!categoryFilter ? "default" : "outline"}>전체</Badge>
        </Link>
        {(["work", "personal"] as const).map((c) => (
          <Link key={c} href={`/projects?status=${statusFilter}&category=${c}`}>
            <Badge variant={categoryFilter === c ? "default" : "outline"}>{c}</Badge>
          </Link>
        ))}
      </div>

      <NoteList
        notes={notes}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        baseHref="/knowledge/projects"
        searchParams={sp}
      />
    </>
  );
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        <p className="text-sm text-muted-foreground">
          020_Projects 워크플로 — status 기반 (planning → active ⇄ paused → completed).
        </p>
      </div>
      <Suspense fallback={<div className="h-40 skeleton-shimmer rounded-lg bg-muted" />}>
        <ProjectsContent sp={sp} />
      </Suspense>
    </div>
  );
}
