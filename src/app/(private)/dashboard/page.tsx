import Link from "next/link";
import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatKpiCard } from "@/components/stat-kpi-card";
import { DashboardCalendar, type CalendarEvent, type WeekCommitment } from "@/components/dashboard-calendar";
import { VaultUnreachablePrivate } from "@/components/vault-unreachable";
import { ActiveProjectsCard } from "@/components/dashboard/active-projects-card";
import { QuickCapture } from "@/components/dashboard/quick-capture";
import { FileText, Send, Inbox, Layers } from "lucide-react";
import { aggregate, getCachedVaultIndex, KB_HUB_HIDDEN_STATUSES, listNotes } from "@/lib/vault-index";
import { vaultPathToHref } from "@/lib/vault-note";
import { isoWeek, isoWeekMonday } from "@/lib/time";

export const metadata = {
  title: "Dashboard | minhanr.dev",
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
    return <VaultUnreachablePrivate error={e} />;
  }
  const agg = aggregate(index);

  const now = new Date();
  const grid = buildMonthGrid(now.getFullYear(), now.getMonth());
  const todayIso = ymd(now);
  const weekAgoIso = ymd(new Date(now.getTime() - 7 * 86400000));
  const monthStart = ymd(new Date(now.getFullYear(), now.getMonth(), 1));
  const monthEnd = ymd(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  const mondayIso = isoWeekMonday(todayIso);
  const sundayOfWeekMs = new Date(mondayIso + "T00:00:00+09:00").getTime() + 6 * 86400000;
  const sundayIso = ymd(new Date(sundayOfWeekMs));

  // ── Single-pass aggregation ──
  let notesThisWeek = 0;
  let publishedThisWeek = 0;
  let inboxThisWeek = 0;
  const linkNotesRaw: Array<{ path: string; created: string; source_url: string; rec: typeof index.notes[string] }> = [];
  const events: CalendarEvent[] = [];
  const weekCommitments: WeekCommitment[] = [];
  let totalNotes = 0;

  for (const [path, rec] of Object.entries(index.notes || {})) {
    totalNotes += 1;
    const created = typeof rec.created === "string" ? rec.created : "";

    // Daily note → events (current month only)
    const dailyMatch = /^010_Daily\/(\d{4}-\d{2}-\d{2})\.md$/.exec(path);
    if (dailyMatch) {
      const iso = dailyMatch[1];
      if (iso >= monthStart && iso <= monthEnd) {
        events.push({
          iso,
          type: "daily",
          title: `데일리 ${iso}`,
          href: `/notes/010_Daily/${iso}.md`,
        });
      }
    }

    // Published note in current month
    if (rec.status === "published" && created >= monthStart && created <= monthEnd) {
      events.push({
        iso: created,
        type: "published",
        title: (path.split("/").pop() || path).replace(/\.md$/, "").replace(/_/g, " "),
        href: vaultPathToHref(path),
      });
    }

    // Weekly KPIs
    if (created >= weekAgoIso) {
      notesThisWeek += 1;
      if (rec.status === "published") publishedThisWeek += 1;
      if (path.startsWith("000_Inbox/")) inboxThisWeek += 1;
    }

    // Recent links
    if (typeof rec.source_url === "string" && rec.source_url.startsWith("http")) {
      linkNotesRaw.push({ path, created, source_url: rec.source_url, rec });
    }

    // Deadlines
    const dl = typeof rec.deadline === "string" ? rec.deadline : "";
    if (/^\d{4}-\d{2}-\d{2}/.test(dl)) {
      // Event on calendar (current month)
      if (dl >= monthStart && dl <= monthEnd) {
        events.push({
          iso: dl,
          type: "deadline",
          title: (path.split("/").pop() || path).replace(/\.md$/, "").replace(/_/g, " "),
          href: vaultPathToHref(path),
          status: typeof rec.status === "string" ? rec.status : undefined,
        });
      }
      // Commitment: overdue, today, or this-week
      const st = typeof rec.status === "string" ? rec.status : "";
      const doneLike = ["published", "archived", "completed", "done"].includes(st);
      if (!doneLike) {
        const title = (path.split("/").pop() || path).replace(/\.md$/, "");
        if (dl < todayIso) {
          weekCommitments.push({ path, title, deadline: dl, status: st || undefined, priority: typeof rec.priority === "string" ? rec.priority : undefined, bucket: "overdue" });
        } else if (dl === todayIso) {
          weekCommitments.push({ path, title, deadline: dl, status: st || undefined, priority: typeof rec.priority === "string" ? rec.priority : undefined, bucket: "today" });
        } else if (dl >= mondayIso && dl <= sundayIso) {
          weekCommitments.push({ path, title, deadline: dl, status: st || undefined, priority: typeof rec.priority === "string" ? rec.priority : undefined, bucket: "this_week" });
        }
      }
    }
  }

  weekCommitments.sort((a, b) => {
    const order = { overdue: 0, today: 1, this_week: 2 } as const;
    if (order[a.bucket] !== order[b.bucket]) return order[a.bucket] - order[b.bucket];
    return a.deadline.localeCompare(b.deadline);
  });

  // Weekly review 배너: 일요일이거나 지난주 회고가 vault 에 없으면 표시
  const priorWeek = isoWeek(ymd(new Date(now.getTime() - 7 * 86400000)));
  const priorWeekPath = `010_Daily/Weekly/${priorWeek}.md`;
  const hasPriorWeekReview = Boolean(index.notes?.[priorWeekPath]);
  const isSunday = now.getDay() === 0;
  const showWeeklyReviewBanner = !hasPriorWeekReview && (isSunday || new Date(sundayIso).getTime() < now.getTime());

  // Sort + slice link notes
  linkNotesRaw.sort((a, b) => (b.created || "").localeCompare(a.created || ""));
  const recentLinks = linkNotesRaw.slice(0, 5).map((l) => ({
    ...l.rec,
    path: l.path,
    title: (l.path.split("/").pop() || l.path).replace(/\.md$/, ""),
  }));

  // 진행 중 프로젝트 top 3 (listNotes는 별도 인덱스 함수, 1패스 안에서 처리 못함)
  const { notes: activeProjects } = listNotes(index, {
    folder: "020_Projects/",
    excludeStatus: [...KB_HUB_HIDDEN_STATUSES],
    sort: "created_desc",
    limit: 3,
  });

  // 추천 (growing top 3)
  const recommended = agg.recent_growing.slice(0, 3);

  // 최근 노트 5 (published/archived 제외)
  const { notes: recentNotes } = listNotes(index, {
    excludeStatus: [...KB_HUB_HIDDEN_STATUSES],
    sort: "created_desc",
    limit: 5,
  });

  return (
    <div className="space-y-6">
      {/* KPI Bento — 4 cards with hover lift */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="hover-lift"><StatKpiCard label="Notes (7d)" value={notesThisWeek} icon={<FileText className="h-8 w-8" />} accentColor="border-l-chart-1" href="/notes" /></div>
        <div className="hover-lift"><StatKpiCard label="Published" value={publishedThisWeek} icon={<Send className="h-8 w-8" />} accentColor="border-l-chart-2" href="/blog" /></div>
        <div className="hover-lift"><StatKpiCard label="Inbox" value={inboxThisWeek} icon={<Inbox className="h-8 w-8" />} accentColor="border-l-chart-3" href="/notes" /></div>
        <div className="hover-lift"><StatKpiCard label="Total Notes" value={totalNotes} icon={<Layers className="h-8 w-8" />} accentColor="border-l-chart-4" href="/notes" /></div>
      </div>

      {/* Calendar hero — full-width, keeps internal month grid */}
      <div className="grid grid-cols-12 gap-4">
        <DashboardCalendar
          monthLabel={now.toLocaleDateString("ko-KR", { year: "numeric", month: "long" })}
          grid={grid.map((c) => (c ? { iso: c.iso, day: c.date.getDate() } : null))}
          todayIso={todayIso}
          monthStart={monthStart}
          events={events}
          weekCommitments={weekCommitments}
          showWeeklyReviewBanner={showWeeklyReviewBanner}
        />
      </div>

      {/* Quick Capture — Inbox 신규 노트 즉시 저장 (Server Action + useOptimistic) */}
      <QuickCapture />

      {/* Bento row 1 — asymmetric: featured projects (7/12) + compact recommendation (5/12) */}
      <div className="grid grid-cols-12 gap-4">
        {/* Active projects — Server Component → Client Component(useOptimistic+ServerAction) */}
        <ActiveProjectsCard
          projects={activeProjects.map((p) => ({
            path: p.path,
            title: p.title,
            status: typeof p.status === "string" ? p.status : undefined,
            priority: typeof p.priority === "string" ? p.priority : undefined,
            created: typeof p.created === "string" ? p.created : undefined,
          }))}
        />

        {/* Recommended — compact sidebar style */}
        <Card className="col-span-12 lg:col-span-5 hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <span className="inline-block size-1.5 rounded-full bg-state-growing animate-pulse" />
              읽을 콘텐츠
            </CardTitle>
            <CardDescription className="text-xs">growing 상태</CardDescription>
          </CardHeader>
          <CardContent>
            {recommended.length === 0 ? (
              <p className="text-xs text-muted-foreground">growing 노트 없음</p>
            ) : (
              <ul className="space-y-2.5">
                {recommended.map((n) => (
                  <li key={n.path} className="space-y-0.5">
                    <Link
                      href={vaultPathToHref(n.path)}
                      className="text-sm font-medium hover:text-primary truncate block transition-colors"
                    >
                      {n.title}
                    </Link>
                    <p className="text-[10px] text-muted-foreground/70 truncate font-mono">{n.path}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bento row 2 — asymmetric flipped: recent notes (5/12) + links timeline (7/12) */}
      <div className="grid grid-cols-12 gap-4">
        {/* Recent notes — compact dense list */}
        <Card className="col-span-12 lg:col-span-5 hover-lift">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">최근 노트</CardTitle>
              <Link href="/notes" className="text-xs text-muted-foreground hover:text-primary transition-colors">전체 →</Link>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5 text-sm">
              {recentNotes.map((n) => (
                <li key={n.path} className="flex items-center justify-between gap-2 py-1 px-2 -mx-2 rounded transition-colors hover:bg-muted/50">
                  <Link
                    href={vaultPathToHref(n.path)}
                    className="truncate hover:text-primary transition-colors"
                  >
                    {n.title}
                  </Link>
                  <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                    {n.created || ""}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Recent links — wider timeline with external arrow */}
        <Card className="col-span-12 lg:col-span-7 hover-lift">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">최근 링크</CardTitle>
              <Link href="/links" className="text-xs text-muted-foreground hover:text-primary transition-colors">전체 →</Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentLinks.length === 0 ? (
              <p className="text-xs text-muted-foreground">source_url 노트 없음</p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {recentLinks.map((n) => (
                  <li key={n.path} className="flex items-center justify-between gap-2 py-1 px-2 -mx-2 rounded transition-colors hover:bg-muted/50">
                    <a
                      href={typeof n.source_url === "string" ? n.source_url : "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate hover:text-primary transition-colors inline-flex items-center gap-1.5"
                    >
                      <span className="truncate">{n.title}</span>
                      <span aria-hidden className="text-muted-foreground/50 shrink-0">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground text-right font-mono">
        Index: {agg.last_commit_hash} ·{" "}
        {agg.last_full_scan ? new Date(agg.last_full_scan).toLocaleString() : ""}
      </p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0,1,2,3].map((i) => <div key={i} className="h-24 rounded-lg skeleton-shimmer" />)}
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 h-80 rounded-lg skeleton-shimmer" />
        <div className="col-span-12 lg:col-span-6 h-48 rounded-lg skeleton-shimmer" />
        <div className="col-span-12 lg:col-span-6 h-48 rounded-lg skeleton-shimmer" />
        <div className="col-span-12 lg:col-span-6 h-48 rounded-lg skeleton-shimmer" />
        <div className="col-span-12 lg:col-span-6 h-48 rounded-lg skeleton-shimmer" />
      </div>
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {getGreeting()} <span className="font-display italic text-primary">Minhan</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          {dateStr} — 종합 대시보드
        </p>
      </div>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
