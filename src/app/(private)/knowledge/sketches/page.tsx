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
 * /sketches — 아이디어 스케치 (043_Ideas + Inbox + Auto_Sketch).
 *
 * vault_schema v2.0:
 * - type:Idea + lifecycle:seed/growing → 미발전 아이디어
 * - type:Inbox → 빠른 캡처
 * - 040_Resources/043_Ideas → Auto_Sketch (RT-2 Phase 6.5-F 자동 생성)
 *
 * 검수해서 promote (seed → growing → mature)하거나 archive.
 */

export const metadata = {
  title: "Sketches | minhanr.dev",
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
    status: n.lifecycle ?? n.maturity ?? undefined,
    lifecycle: n.lifecycle ?? undefined,
    type: n.type ?? undefined,
    category: n.category ?? undefined,
  };
}

async function SketchesContent({ sp }: { sp: Record<string, string | undefined> }) {
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const sourceFilter = sp.source ?? "all";  // all | inbox | ideas

  const folders =
    sourceFilter === "inbox"
      ? ["000_Inbox/"]
      : sourceFilter === "ideas"
        ? ["040_Resources/043_Ideas/"]
        : ["000_Inbox/", "040_Resources/043_Ideas/"];

  const opts: ListNotesSupabaseOptions = {
    folders,
    excludeLifecycle: ["archived", "published"],
    sort: "created_desc",
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  };

  // 카운트
  const [inboxCount, ideasCount, seedCount, growingCount] = await Promise.all([
    listNotesFromSupabase({ folder: "000_Inbox/", excludeLifecycle: ["archived"], limit: 1 }).then((r) => r.total),
    listNotesFromSupabase({ folder: "040_Resources/043_Ideas/", excludeLifecycle: ["archived"], limit: 1 }).then((r) => r.total),
    listNotesFromSupabase({
      folders: ["000_Inbox/", "040_Resources/043_Ideas/"],
      lifecycle: "seed",
      limit: 1,
    }).then((r) => r.total),
    listNotesFromSupabase({
      folders: ["000_Inbox/", "040_Resources/043_Ideas/"],
      lifecycle: "growing",
      limit: 1,
    }).then((r) => r.total),
  ]);

  const { notes: rows, total } = await listNotesFromSupabase(opts);
  const notes = rows.map(toVaultNote);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-l-4 border-l-amber-400">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Inbox</CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums">{inboxCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-l-4 border-l-blue-400">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Ideas</CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums">{ideasCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-l-4 border-l-amber-300">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Seed</CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums">{seedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Growing</CardDescription>
            <CardTitle className="text-2xl font-bold tabular-nums">{growingCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground mr-1">Source:</span>
        {(["all", "inbox", "ideas"] as const).map((s) => (
          <Link key={s} href={`/knowledge/sketches?source=${s}`}>
            <Badge variant={sourceFilter === s ? "default" : "outline"}>{s}</Badge>
          </Link>
        ))}
      </div>

      <NoteList
        notes={notes}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        baseHref="/knowledge/sketches"
        searchParams={sp}
      />
    </>
  );
}

export default async function SketchesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Sketches</h1>
        <p className="text-sm text-muted-foreground">
          빠른 캡처 + 아이디어 (Inbox + 043_Ideas + Auto_Sketch). seed → growing → mature/archive.
        </p>
      </div>
      <Suspense fallback={<div className="h-40 skeleton-shimmer rounded-lg bg-muted" />}>
        <SketchesContent sp={sp} />
      </Suspense>
    </div>
  );
}
