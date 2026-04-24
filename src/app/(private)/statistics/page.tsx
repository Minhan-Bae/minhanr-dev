import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatKpiCard } from "@/components/stat-kpi-card";
import { CategoryBarChart } from "@/components/charts/category-bar-chart";
import { TagTopBarChart } from "@/components/charts/tag-top-bar-chart";
import { ActivityLineChart } from "@/components/charts/activity-line-chart";
import { StatusDonutChart } from "@/components/charts/status-donut-chart";
import { aggregate, getCachedVaultIndex } from "@/lib/vault-index";
import { VaultUnreachablePrivate } from "@/components/vault-unreachable";

export const metadata = {
  title: "Statistics | minhanr.dev",
  robots: { index: false, follow: false },
};
export const revalidate = 300;

async function StatisticsContent() {
  let agg;
  try {
    agg = aggregate(await getCachedVaultIndex());
  } catch (e) {
    return <VaultUnreachablePrivate error={e} />;
  }

  // vault_schema v2.0 — lifecycle 우선, status 폴백
  const matureCount = agg.by_lifecycle.mature || agg.by_status.mature || 0;
  const growingCount = agg.by_lifecycle.growing || 0;
  const seedCount = agg.by_lifecycle.seed || 0;
  const publishedCount = agg.by_lifecycle.published || 0;
  const evergreenCount = agg.by_lifecycle.evergreen || 0;
  const activeProjects = agg.by_status.active || 0;  // Project status 전용
  const maturePct =
    agg.total_notes > 0
      ? Math.round((matureCount / agg.total_notes) * 100)
      : 0;
  const deadlinesTotal =
    agg.deadlines_summary.overdue +
    agg.deadlines_summary.today +
    agg.deadlines_summary.this_week +
    agg.deadlines_summary.later;

  // by_folder → 표시용 카테고리 배열 (PARA top-level)
  const FOLDER_ORDER = [
    "000_Inbox",
    "010_Daily",
    "020_Projects",
    "030_Areas",
    "040_Resources",
    "050_Archive",
    "090_System",
  ];
  const FOLDER_LABEL: Record<string, string> = {
    "000_Inbox": "Inbox",
    "010_Daily": "Daily",
    "020_Projects": "Projects",
    "030_Areas": "Areas",
    "040_Resources": "Resources",
    "050_Archive": "Archive",
    "090_System": "System",
  };
  const categoryData = FOLDER_ORDER.map((k) => ({
    category: FOLDER_LABEL[k] || k,
    count: agg.by_folder[k] || 0,
  }));

  const tagTop10 = agg.by_tag_top.slice(0, 10);
  const statusEntries = Object.entries(agg.by_status)
    .sort(([, a], [, b]) => b - a)
    .map(([status, count]) => ({ status, count }));

  // vault_schema v2.0 — lifecycle 도넛용 (정렬된 순서)
  const LIFECYCLE_ORDER = ["seed", "growing", "mature", "published", "evergreen", "archived"] as const;
  const lifecycleEntries = LIFECYCLE_ORDER
    .map((k) => ({ status: k, count: agg.by_lifecycle[k] || 0 }))
    .filter((e) => e.count > 0);
  const typeEntries = Object.entries(agg.by_type)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([t, c]) => ({ status: t, count: c }));

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatKpiCard label="Total Notes" value={agg.total_notes} accentColor="border-l-primary" />
        <StatKpiCard label="Active Projects" value={activeProjects} accentColor="border-l-chart-3" />
        <StatKpiCard label="Mature %" value={`${maturePct}%`} hint={`${matureCount} mature`} accentColor="border-l-chart-4" />
        <StatKpiCard label="Deadlines" value={deadlinesTotal} hint={`${agg.deadlines_summary.overdue} overdue`} accentColor="border-l-destructive" />
      </div>

      {/* vault_schema v2.0 — 콘텐츠 라이프사이클 진척도 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">콘텐츠 라이프사이클 (vault_schema v2.0)</CardTitle>
          <CardDescription className="text-xs">
            seed → growing → mature → published 흐름. 검수 대기는 mature.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <StatKpiCard label="Seed" value={seedCount} accentColor="border-l-amber-400" />
            <StatKpiCard label="Growing" value={growingCount} accentColor="border-l-blue-400" />
            <StatKpiCard label="Mature" value={matureCount} accentColor="border-l-emerald-500" />
            <StatKpiCard label="Published" value={publishedCount} accentColor="border-l-purple-500" />
            <StatKpiCard label="Evergreen" value={evergreenCount} accentColor="border-l-teal-500" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">카테고리별 노트 수</CardTitle>
            <CardDescription className="text-xs">PARA top-level</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryBarChart data={categoryData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">태그 TOP 10</CardTitle>
            <CardDescription className="text-xs">전체 노트 빈도 기준</CardDescription>
          </CardHeader>
          <CardContent>
            <TagTopBarChart data={tagTop10} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">월별 활동 추이</CardTitle>
            <CardDescription className="text-xs">created 기준, 최근 12개월</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityLineChart data={agg.by_month_by_folder} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Lifecycle 분포</CardTitle>
            <CardDescription className="text-xs">콘텐츠 라이프사이클 (vault_schema v2.0)</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusDonutChart data={lifecycleEntries.length ? lifecycleEntries : statusEntries} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Type 분포 (top 8)</CardTitle>
            <CardDescription className="text-xs">노트 종류 (Project/Daily/Research/...)</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusDonutChart data={typeEntries} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">마감일 현황</CardTitle>
            <CardDescription className="text-xs">deadline 필드 기반</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Overdue</dt>
              <dd className="text-right tabular-nums font-semibold text-destructive">
                {agg.deadlines_summary.overdue}
              </dd>
              <dt className="text-muted-foreground">Today</dt>
              <dd className="text-right tabular-nums font-semibold">
                {agg.deadlines_summary.today}
              </dd>
              <dt className="text-muted-foreground">This week</dt>
              <dd className="text-right tabular-nums font-semibold">
                {agg.deadlines_summary.this_week}
              </dd>
              <dt className="text-muted-foreground">Later</dt>
              <dd className="text-right tabular-nums font-semibold">
                {agg.deadlines_summary.later}
              </dd>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">최근 추천 (status = growing)</CardTitle>
        </CardHeader>
        <CardContent>
          {agg.recent_growing.length === 0 ? (
            <p className="text-xs text-muted-foreground">growing 노트가 없다</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {agg.recent_growing.map((n) => (
                <li key={n.path} className="flex items-center justify-between gap-2">
                  <span className="truncate">{n.title}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {n.created || ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {agg.last_full_scan && (
        <p className="text-xs text-muted-foreground text-right">
          Index: {agg.last_commit_hash} ·{" "}
          {new Date(agg.last_full_scan).toLocaleString()}
        </p>
      )}
    </>
  );
}

function StatisticsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-lg bg-muted skeleton-shimmer" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-72 rounded-lg bg-muted skeleton-shimmer" />
        ))}
      </div>
    </div>
  );
}

export default function StatisticsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Statistics</h1>
        <p className="text-sm text-muted-foreground">
          vault 통계 — 카테고리 · 태그 · 활동 추이 · 상태 분포
        </p>
      </div>
      <Suspense fallback={<StatisticsSkeleton />}>
        <StatisticsContent />
      </Suspense>
    </div>
  );
}
