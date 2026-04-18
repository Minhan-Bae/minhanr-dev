import { Suspense } from "react";
import Link from "next/link";
import { Palette } from "lucide-react";
import { listCategories, listEntriesInRange } from "@/lib/actions/time";
import { startOfWeekSundayKST, shiftWeek, DAY_COUNT, DAY_MS } from "@/lib/time/week";
import { BlockGrid } from "@/components/time/block-grid";
import { WeekNav } from "@/components/time/week-nav";
import { SeedCategoriesButton } from "@/components/time/seed-categories-button";

export const metadata = {
  title: "Calendar | minhanr.dev",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ week?: string }>;
}

/**
 * /calendar — weekly 7 × 48 half-hour timebox planner.
 *
 * Consolidated surface: the older Daily-Note-readonly WeeklyCalendar
 * and the separate /calendar/blocks timebox grid were two pages doing
 * overlapping things. They merged here — this is now THE calendar for
 * the private workspace.
 *
 * Sunday-first week, Asia/Seoul wall-clock. `?week=<iso>` selects a
 * specific week (iso = Sunday 00:00 UTC timestamp); absent = current.
 * Category management lives at /calendar/categories.
 */
export default async function CalendarPage({ searchParams }: PageProps) {
  const { week } = await searchParams;
  const now = new Date();
  const requestedWeek = week ? new Date(week) : startOfWeekSundayKST(now);
  const safeWeekStart = Number.isFinite(requestedWeek.getTime())
    ? requestedWeek
    : startOfWeekSundayKST(now);

  const weekEndExclusive = new Date(safeWeekStart.getTime() + DAY_COUNT * DAY_MS);

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
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Calendar</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            30분 단위 타임블록 · 일요일 시작 · 카테고리 색상으로 구분 · 클릭 · 드래그로 생성
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <WeekNav
            weekStartIso={safeWeekStart.toISOString()}
            prevIso={prevWeek}
            nextIso={nextWeek}
            thisWeekIso={thisWeek}
          />
          <Link
            href="/calendar/categories"
            aria-label="Manage categories"
            className="font-technical inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <Palette className="h-3.5 w-3.5" aria-hidden />
            Categories
          </Link>
        </div>
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
            <Link
              href="/calendar/categories"
              className="font-technical inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-[12.5px] text-foreground transition-colors hover:bg-muted"
            >
              직접 만들기 →
            </Link>
          </div>
        </div>
      ) : (
        <Suspense
          fallback={<div className="p-8 text-sm text-muted-foreground">Loading…</div>}
        >
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
