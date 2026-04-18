import { Suspense } from "react";
import { listCategories, listEntriesInRange } from "@/lib/actions/time";
import { startOfWeekSundayKST, shiftWeek, DAY_COUNT, DAY_MS } from "@/lib/time/week";
import { BlockGrid } from "@/components/time/block-grid";
import { WeekNav } from "@/components/time/week-nav";
import { SeedCategoriesButton } from "@/components/time/seed-categories-button";

export const metadata = {
  title: "Time Blocks | minhanr.dev",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ week?: string }>;
}

/**
 * /calendar/blocks — Excel-style timebox planner.
 *
 * 7 days × 48 half-hour slots. Sunday-first week layout matching the
 * author's Excel convention, Asia/Seoul wall-clock. The ?week=ISO
 * query param selects a specific week (value is the Sunday 00:00 UTC
 * timestamp); absent = current week.
 */
export default async function BlocksPage({ searchParams }: PageProps) {
  const { week } = await searchParams;
  const now = new Date();
  const weekStart = week
    ? new Date(week)
    : startOfWeekSundayKST(now);

  // Guard invalid ?week= values by falling back to the current week.
  const safeWeekStart = Number.isFinite(weekStart.getTime())
    ? weekStart
    : startOfWeekSundayKST(now);

  const weekEndExclusive = new Date(safeWeekStart.getTime() + DAY_COUNT * DAY_MS);

  // Parallel fetch — categories + this week's entries.
  const [categories, entries] = await Promise.all([
    listCategories(),
    listEntriesInRange(safeWeekStart.toISOString(), weekEndExclusive.toISOString()),
  ]);

  const needsSeed = categories.length === 0;
  const prevWeek = shiftWeek(safeWeekStart, -1).toISOString();
  const nextWeek = shiftWeek(safeWeekStart, +1).toISOString();
  const thisWeek = startOfWeekSundayKST(now).toISOString();

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Time Blocks</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            30분 단위 타임블록 플래너 · 일요일 시작 · 카테고리 색으로 구분
          </p>
        </div>
        <WeekNav
          weekStartIso={safeWeekStart.toISOString()}
          prevIso={prevWeek}
          nextIso={nextWeek}
          thisWeekIso={thisWeek}
        />
      </header>

      {needsSeed ? (
        <div className="rounded-md border border-dashed border-border bg-card/50 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            아직 카테고리가 없습니다. 기본 6개 (업무 · 수면 · 취미 · 주말/공휴일 · 부업/자기계발 · 가족/불가피)를 불러와 시작하거나,
            <br className="hidden sm:block" />
            원하시는 이름·색상으로 직접 만드실 수도 있습니다.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <SeedCategoriesButton />
            {/* TODO Phase 2: inline "Create category" form */}
          </div>
        </div>
      ) : (
        <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading…</div>}>
          <BlockGrid
            weekStartIso={safeWeekStart.toISOString()}
            categories={categories}
            entries={entries}
          />
        </Suspense>
      )}
    </div>
  );
}
