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

export const metadata = {
  title: "Statistics | OIKBAS",
  robots: { index: false, follow: false },
};
export const revalidate = 300;

async function StatisticsContent() {
  let agg;
  try {
    agg = aggregate(await getCachedVaultIndex());
  } catch (e) {
    return (
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Vault index 로드 실패</CardTitle>
          <CardDescription>{e instanceof Error ? e.message : String(e)}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const matureCount = agg.by_status.mature || 0;
  const activeProjects =
    (agg.by_status.active || 0) +
    (agg.by_status.growing || 0);
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

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatKpiCard label="Total Notes" value={agg.total_notes} />
        <StatKpiCard label="Active Projects" value={activeProjects} />
        <StatKpiCard label="Mature %" value={`${maturePct}%`} hint={`${matureCount} mature`} />
        <StatKpiCard label="Deadlines" value={deadlinesTotal} hint={`${agg.deadlines_summary.overdue} overdue`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">카테고리별 노트 수</CardTitle>
            <CardDescription className="text-[11px]">PARA top-level</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryBarChart data={categoryData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">태그 TOP 10</CardTitle>
            <CardDescription className="text-[11px]">전체 노트 빈도 기준</CardDescription>
          </CardHeader>
          <CardContent>
            <TagTopBarChart data={tagTop10} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">월별 활동 추이</CardTitle>
            <CardDescription className="text-[11px]">created 기준, 최근 12개월</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityLineChart data={agg.by_month_by_folder} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">상태 분포</CardTitle>
            <CardDescription className="text-[11px]">상위 5개 status</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusDonutChart data={statusEntries} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">마감일 현황</CardTitle>
            <CardDescription className="text-[11px]">deadline 필드 기반</CardDescription>
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
          <CardTitle className="text-sm">최근 추천 (status = growing)</CardTitle>
        </CardHeader>
        <CardContent>
          {agg.recent_growing.length === 0 ? (
            <p className="text-xs text-muted-foreground">growing 노트가 없다</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {agg.recent_growing.map((n) => (
                <li key={n.path} className="flex items-center justify-between gap-2">
                  <span className="truncate">{n.title}</span>
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {n.created || ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {agg.last_full_scan && (
        <p className="text-[10px] text-muted-foreground text-right">
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
          <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-72 rounded-lg bg-muted animate-pulse" />
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
          OIKBAS 볼트 통계 — 카테고리 · 태그 · 활동 추이 · 상태 분포
        </p>
      </div>
      <Suspense fallback={<StatisticsSkeleton />}>
        <StatisticsContent />
      </Suspense>
    </div>
  );
}
