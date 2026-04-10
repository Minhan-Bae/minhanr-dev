import Link from "next/link";
import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { aggregate, getCachedVaultIndex, KB_HUB_HIDDEN_STATUSES, listNotes } from "@/lib/vault-index";
import { vaultPathToHref } from "@/lib/vault-note";

export const metadata = {
  title: "Dashboard | OIKBAS",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildMonthGrid(year: number, month0: number) {
  // returns 6x7 grid of dates (or null) starting Sunday
  const first = new Date(year, month0, 1);
  const startOffset = first.getDay();
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  const cells: Array<{ date: Date; iso: string } | null> = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month0, d);
    cells.push({ date, iso: ymd(date) });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

async function DashboardContent() {
  let index;
  try {
    index = await getCachedVaultIndex();
  } catch (e) {
    return (
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive text-sm">Vault index 로드 실패</CardTitle>
          <CardDescription>{e instanceof Error ? e.message : String(e)}</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  const agg = aggregate(index);

  // Daily 노트 존재일 set
  const dailyDays = new Set<string>();
  for (const path of Object.keys(index.notes || {})) {
    if (!path.startsWith("010_Daily/")) continue;
    const m = /(\d{4}-\d{2}-\d{2})\.md$/.exec(path);
    if (m) dailyDays.add(m[1]);
  }

  const now = new Date();
  const grid = buildMonthGrid(now.getFullYear(), now.getMonth());
  const todayIso = ymd(now);

  // 주간 KPI (최근 7일)
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const weekAgoIso = ymd(weekAgo);
  let notesThisWeek = 0;
  let publishedThisWeek = 0;
  let inboxThisWeek = 0;
  for (const [path, rec] of Object.entries(index.notes || {})) {
    const created = typeof rec.created === "string" ? rec.created : "";
    if (created >= weekAgoIso) notesThisWeek += 1;
    if (rec.status === "published" && created >= weekAgoIso) publishedThisWeek += 1;
    if (path.startsWith("000_Inbox/") && created >= weekAgoIso) inboxThisWeek += 1;
  }

  // 진행 중 프로젝트 top 3 (published/archived 제외 — 작업 중인 것만)
  const { notes: activeProjects } = listNotes(index, {
    folder: "020_Projects/",
    excludeStatus: [...KB_HUB_HIDDEN_STATUSES],
    sort: "created_desc",
    limit: 3,
  });

  // 추천 (growing top 3)
  const recommended = agg.recent_growing.slice(0, 3);

  // 최근 노트 5 (published/archived 제외 — 작업 중인 것만)
  const { notes: recentNotes } = listNotes(index, {
    excludeStatus: [...KB_HUB_HIDDEN_STATUSES],
    sort: "created_desc",
    limit: 5,
  });

  // 최근 링크 5 (source_url 가진 노트)
  const linkNotes: typeof recentNotes = [];
  for (const [path, rec] of Object.entries(index.notes || {})) {
    if (typeof rec.source_url !== "string" || !rec.source_url.startsWith("http")) continue;
    linkNotes.push({
      ...rec,
      path,
      title: (path.split("/").pop() || path).replace(/\.md$/, ""),
    });
  }
  linkNotes.sort((a, b) => (b.created || "").localeCompare(a.created || ""));
  const recentLinks = linkNotes.slice(0, 5);

  // 오늘 마감
  const today = now;
  const todayDeadlines: Array<{ path: string; title: string; deadline: string; status?: string }> = [];
  for (const [path, rec] of Object.entries(index.notes || {})) {
    const dl = typeof rec.deadline === "string" ? rec.deadline : "";
    if (!/^\d{4}-\d{2}-\d{2}/.test(dl)) continue;
    const d = new Date(dl);
    if (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    ) {
      todayDeadlines.push({
        path,
        title: (path.split("/").pop() || path).replace(/\.md$/, ""),
        deadline: dl,
        status: typeof rec.status === "string" ? rec.status : undefined,
      });
    }
  }

  return (
    <div className="grid grid-cols-12 gap-4 auto-rows-min">
      {/* Calendar — wide */}
      <Card className="col-span-12 lg:col-span-7 row-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            {now.toLocaleDateString("ko-KR", { year: "numeric", month: "long" })}
          </CardTitle>
          <CardDescription className="text-[11px]">
            Daily 노트 존재일 하이라이트
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground mb-1">
            {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {grid.map((cell, i) => {
              if (!cell) return <div key={i} className="aspect-square" />;
              const has = dailyDays.has(cell.iso);
              const isToday = cell.iso === todayIso;
              return (
                <div
                  key={i}
                  className={[
                    "aspect-square rounded-md flex items-center justify-center text-xs tabular-nums transition-colors",
                    has ? "bg-primary/15 text-foreground font-medium" : "text-muted-foreground/60",
                    isToday ? "ring-1 ring-primary" : "",
                  ].join(" ")}
                  title={cell.iso}
                >
                  {cell.date.getDate()}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Weekly KPIs */}
      <Card className="col-span-6 lg:col-span-5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">주간 활동 (최근 7일)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Notes</p>
              <p className="text-2xl font-bold tabular-nums">{notesThisWeek}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Published</p>
              <p className="text-2xl font-bold tabular-nums">{publishedThisWeek}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Inbox</p>
              <p className="text-2xl font-bold tabular-nums">{inboxThisWeek}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today deadlines */}
      <Card className="col-span-6 lg:col-span-5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">오늘 마감</CardTitle>
        </CardHeader>
        <CardContent>
          {todayDeadlines.length === 0 ? (
            <p className="text-xs text-muted-foreground">오늘 마감 항목 없음</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {todayDeadlines.map((d) => (
                <li key={d.path} className="flex items-center justify-between gap-2">
                  <span className="truncate">{d.title}</span>
                  {d.status && (
                    <Badge variant="outline" className="font-normal text-[10px]">
                      {d.status}
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Active projects */}
      <Card className="col-span-12 lg:col-span-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">진행 중 프로젝트</CardTitle>
          <CardDescription className="text-[11px]">
            <Link href="/projects" className="underline">
              전체 보기 →
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeProjects.length === 0 ? (
            <p className="text-xs text-muted-foreground">없음</p>
          ) : (
            <ul className="space-y-2">
              {activeProjects.map((p) => (
                <li key={p.path} className="space-y-0.5">
                  <Link
                    href={vaultPathToHref(p.path)}
                    className="text-sm font-medium hover:underline truncate block"
                  >
                    {p.title}
                  </Link>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    {p.priority && <Badge variant="outline" className="font-normal">{p.priority}</Badge>}
                    {p.status && <span>{p.status}</span>}
                    {p.created && <span className="tabular-nums">· {p.created}</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Recommended */}
      <Card className="col-span-12 lg:col-span-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">읽을 콘텐츠 (growing)</CardTitle>
        </CardHeader>
        <CardContent>
          {recommended.length === 0 ? (
            <p className="text-xs text-muted-foreground">growing 노트 없음</p>
          ) : (
            <ul className="space-y-2">
              {recommended.map((n) => (
                <li key={n.path} className="space-y-0.5">
                  <Link
                    href={vaultPathToHref(n.path)}
                    className="text-sm font-medium hover:underline truncate block"
                  >
                    {n.title}
                  </Link>
                  <p className="text-[10px] text-muted-foreground truncate">{n.path}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Recent notes */}
      <Card className="col-span-12 lg:col-span-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">최근 노트</CardTitle>
          <CardDescription className="text-[11px]">
            <Link href="/notes" className="underline">
              전체 보기 →
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1.5 text-sm">
            {recentNotes.map((n) => (
              <li key={n.path} className="flex items-center justify-between gap-2">
                <Link
                  href={vaultPathToHref(n.path)}
                  className="truncate hover:underline"
                >
                  {n.title}
                </Link>
                <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                  {n.created || ""}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Recent links */}
      <Card className="col-span-12 lg:col-span-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">최근 링크</CardTitle>
          <CardDescription className="text-[11px]">
            <Link href="/links" className="underline">
              전체 보기 →
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentLinks.length === 0 ? (
            <p className="text-xs text-muted-foreground">source_url 노트 없음</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {recentLinks.map((n) => (
                <li key={n.path} className="flex items-center justify-between gap-2">
                  <a
                    href={typeof n.source_url === "string" ? n.source_url : "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate hover:underline"
                  >
                    {n.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <p className="col-span-12 text-[10px] text-muted-foreground text-right">
        Index: {agg.last_commit_hash} ·{" "}
        {agg.last_full_scan ? new Date(agg.last_full_scan).toLocaleString() : ""}
      </p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 lg:col-span-7 row-span-2 h-96 rounded-lg bg-muted animate-pulse" />
      <div className="col-span-6 lg:col-span-5 h-32 rounded-lg bg-muted animate-pulse" />
      <div className="col-span-6 lg:col-span-5 h-32 rounded-lg bg-muted animate-pulse" />
      <div className="col-span-12 lg:col-span-6 h-48 rounded-lg bg-muted animate-pulse" />
      <div className="col-span-12 lg:col-span-6 h-48 rounded-lg bg-muted animate-pulse" />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          OIKBAS 종합 — 캘린더 · 활동 KPI · 진행 프로젝트 · 추천 · 최근 노트/링크
        </p>
      </div>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
