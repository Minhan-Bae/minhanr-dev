import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { DeadlinesBucket } from "@/components/dashboard/deadlines-bucket";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * /deadlines — Sprint 3.5. Supabase `vault_notes` 직조회로 전환.
 *
 * 이전엔 getCachedVaultIndex (GitHub raw vault_index.json) 를 사용했고,
 * archive/complete/pause 서버 액션은 vault 만 커밋했다. 그 결과:
 *   • vault commit → GHA sync → vault_index.json rebuild (5-10 분 지연)
 *   • /deadlines ISR revalidate (추가 지연)
 *   → 사용자 입장에서 "삭제를 눌렀는데 안 지워짐" 현상.
 *
 * 전환 후:
 *   • lifecycle_state != 'archived' + deadline IS NOT NULL 조건의
 *     vault_notes 만 불러옴 (서버측 필터).
 *   • transitionNoteAction 은 Supabase write-through 로 같은 컬럼을
 *     즉시 패치 → revalidatePath 직후 새 상태 반영.
 */

export const metadata = {
  title: "Deadlines | minhanr.dev",
  robots: { index: false, follow: false },
};
export const revalidate = 60;

interface DeadlineItem {
  path: string;
  title: string;
  deadline: string;
  status?: string;
  priority?: string;
  bucket: "overdue" | "today" | "this_week" | "later";
}

function deriveTitle(path: string): string {
  return (path.split("/").pop() || path).replace(/\.md$/, "");
}

function bucketize(deadline: string, now: Date): DeadlineItem["bucket"] {
  const d = new Date(deadline);
  if (Number.isNaN(d.getTime())) return "later";
  const day = 24 * 60 * 60 * 1000;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  if (target < startOfToday) return "overdue";
  if (target === startOfToday) return "today";
  if (target - startOfToday <= 7 * day) return "this_week";
  return "later";
}

async function DeadlinesContent() {
  const sb = createSupabaseAdmin();
  const { data, error } = await sb
    .from("vault_notes")
    .select("path,title,deadline,workflow,publish,maturity,priority,lifecycle_state")
    .not("deadline", "is", null)
    .neq("lifecycle_state", "archived")
    .neq("publish", "published")
    .order("deadline", { ascending: true });

  if (error) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center text-sm text-destructive">
          Supabase 조회 실패: {error.message}
        </CardContent>
      </Card>
    );
  }

  const now = new Date();
  const items: DeadlineItem[] = [];
  for (const row of data ?? []) {
    const dl = typeof row.deadline === "string" ? row.deadline : "";
    if (!/^\d{4}-\d{2}-\d{2}/.test(dl)) continue;
    // workflow=completed 도 제외 — 이미 완료된 작업은 deadlines 에
    // 뜰 필요 없음.
    if (row.workflow === "completed") continue;
    items.push({
      path: row.path,
      title: row.title ?? deriveTitle(row.path),
      deadline: dl,
      status: row.workflow ?? row.publish ?? row.maturity ?? undefined,
      priority: row.priority ?? undefined,
      bucket: bucketize(dl, now),
    });
  }

  const groups: Record<DeadlineItem["bucket"], DeadlineItem[]> = {
    overdue: [],
    today: [],
    this_week: [],
    later: [],
  };
  for (const it of items) groups[it.bucket].push(it);

  const groupOrder: Array<{ key: DeadlineItem["bucket"]; label: string; tone: string }> = [
    { key: "overdue", label: "Overdue", tone: "text-destructive" },
    { key: "today", label: "Today", tone: "text-foreground" },
    { key: "this_week", label: "This week", tone: "text-foreground" },
    { key: "later", label: "Later", tone: "text-muted-foreground" },
  ];

  if (items.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          deadline 필드가 있는 노트가 없다
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {groupOrder.map((g) => (
          <Card key={g.key}>
            <CardContent className="py-4">
              <CardDescription className="text-xs uppercase tracking-wider">
                {g.label}
              </CardDescription>
              <CardTitle className={`mt-1 text-3xl font-bold tabular-nums ${g.tone}`}>
                {groups[g.key].length}
              </CardTitle>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="space-y-4">
        {groupOrder.map((g) => (
          <DeadlinesBucket
            key={g.key}
            label={g.label}
            tone={g.tone}
            items={groups[g.key]}
          />
        ))}
      </div>
    </>
  );
}

export default function DeadlinesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Deadlines</h1>
        <p className="text-sm text-muted-foreground">
          프론트매터 deadline 필드 기반 마감일 트래커 · Supabase vault_notes
        </p>
      </div>
      <Suspense fallback={<div className="h-40 skeleton-shimmer rounded-lg bg-muted" />}>
        <DeadlinesContent />
      </Suspense>
    </div>
  );
}
