import { Calendar, Clock, FileText, Wallet, FolderOpen, CalendarCheck, BookOpen, Activity } from "lucide-react";
import { ToolCard } from "@/components/dashboard/tool-card";
import { listCategories, listEntriesInRange } from "@/lib/actions/time";
import {
  DAY_COUNT,
  DAY_MS,
  startOfWeekSundayKST,
} from "@/lib/time/week";
import { getCachedVaultIndex, listNotes, aggregate, KB_HUB_HIDDEN_STATUSES } from "@/lib/vault-index";
import { isoWeek } from "@/lib/time";

/**
 * Hub card set — each is a server component that fetches its own
 * data and hands it to <ToolCard>. Errors silently render a
 * "connection" placeholder rather than blowing up the whole hub so
 * one bad data source doesn't hide the rest.
 *
 * Cards:
 *   Tier 1 (daily)
 *     TimeHubCard      — /calendar
 *     DeadlinesHubCard — /deadlines
 *     KnowledgeHubCard — /notes
 *     FinanceHubCard   — stub
 *   Tier 2 (weekly)
 *     ProjectsHubCard  — /notes?folder=020_Projects
 *     WeeklyHubCard    — /review/weekly
 *     ReadingHubCard   — stub
 *     HabitsHubCard    — stub
 */

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function kstYmd(d: Date): string {
  const kst = new Date(d.getTime() + KST_OFFSET_MS);
  const y = kst.getUTCFullYear();
  const m = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const day = String(kst.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fmtHours(min: number): string {
  if (min === 0) return "0h";
  const h = min / 60;
  return h >= 10 ? `${Math.round(h)}h` : `${h.toFixed(1)}h`;
}

// ─── Tier 1 ──────────────────────────────────────────────────────

export async function TimeHubCard() {
  try {
    const now = new Date();
    const weekStart = startOfWeekSundayKST(now);
    const weekEnd = new Date(weekStart.getTime() + DAY_COUNT * DAY_MS);
    const [cats, entries] = await Promise.all([
      listCategories(),
      listEntriesInRange(weekStart.toISOString(), weekEnd.toISOString()),
    ]);

    const totalMinutes = entries.reduce((s, e) => s + e.duration_minutes, 0);
    const todayYmd = kstYmd(now);
    const todayCount = entries.filter((e) => kstYmd(new Date(e.slot_start)) === todayYmd).length;

    // Dominant category (highest minutes)
    const catSums = new Map<string, number>();
    for (const e of entries) {
      const k = e.category_id ?? "__none";
      catSums.set(k, (catSums.get(k) ?? 0) + e.duration_minutes);
    }
    let topLabel: string | null = null;
    if (catSums.size > 0) {
      const [topId] = [...catSums.entries()].sort((a, b) => b[1] - a[1])[0];
      topLabel = cats.find((c) => c.id === topId)?.label ?? null;
    }

    return (
      <ToolCard
        kicker="Time · 01"
        title="Time blocks"
        description={cats.length === 0 ? "아직 카테고리 없음" : "30분 단위 주간 타임박스 · 일요일 시작"}
        href="/calendar"
        icon={Calendar}
        primary={{ value: fmtHours(totalMinutes), label: "This week" }}
        secondary={[
          { label: "Today", value: String(todayCount) + " blocks" },
          ...(topLabel ? [{ label: "Top", value: topLabel, tint: "primary" as const }] : []),
        ]}
      />
    );
  } catch {
    return (
      <ToolCard
        kicker="Time · 01"
        title="Time blocks"
        description="connection error"
        href="/calendar"
        icon={Calendar}
        disabled
      />
    );
  }
}

export async function DeadlinesHubCard() {
  try {
    const index = await getCachedVaultIndex();
    const now = new Date();
    const todayIso = kstYmd(now);
    const in7 = kstYmd(new Date(now.getTime() + 7 * 86400000));

    let overdue = 0;
    let today = 0;
    let thisWeek = 0;
    for (const [, rec] of Object.entries(index.notes || {})) {
      const dl = typeof rec.deadline === "string" ? rec.deadline : "";
      if (!/^\d{4}-\d{2}-\d{2}/.test(dl)) continue;
      const status = typeof rec.status === "string" ? rec.status : "";
      if (["published", "archived", "completed", "done"].includes(status)) continue;
      if (dl < todayIso) overdue++;
      else if (dl === todayIso) today++;
      else if (dl <= in7) thisWeek++;
    }

    const total = overdue + today + thisWeek;

    return (
      <ToolCard
        kicker="Deadlines · 02"
        title="마감일"
        description={total === 0 ? "다가오는 마감 없음" : "7일 이내 마감 기준"}
        href="/deadlines"
        icon={Clock}
        primary={{ value: String(total), label: "Upcoming" }}
        secondary={[
          ...(overdue > 0 ? [{ label: "Overdue", value: String(overdue), tint: "danger" as const }] : []),
          { label: "Today", value: String(today), tint: today > 0 ? ("primary" as const) : undefined },
          { label: "Week", value: String(thisWeek) },
        ]}
      />
    );
  } catch {
    return (
      <ToolCard
        kicker="Deadlines · 02"
        title="마감일"
        description="vault 연결 안 됨"
        href="/deadlines"
        icon={Clock}
        disabled
      />
    );
  }
}

export async function KnowledgeHubCard() {
  try {
    const index = await getCachedVaultIndex();
    const agg = aggregate(index);
    const total = Object.keys(index.notes || {}).length;

    // 7-day new
    const sevenAgo = kstYmd(new Date(Date.now() - 7 * 86400000));
    let new7d = 0;
    let published = 0;
    for (const [, rec] of Object.entries(index.notes || {})) {
      const created = typeof rec.created === "string" ? rec.created : "";
      if (created >= sevenAgo) new7d++;
      if (rec.status === "published") published++;
    }

    return (
      <ToolCard
        kicker="Knowledge · 03"
        title="Vault"
        description="Obsidian PARA — 3-tier knowledge base"
        href="/notes"
        icon={FileText}
        primary={{ value: String(total), label: "Notes" }}
        secondary={[
          { label: "7d new", value: String(new7d) },
          { label: "Published", value: String(published) },
          { label: "Growing", value: String(agg.recent_growing.length) },
        ]}
      />
    );
  } catch {
    return (
      <ToolCard
        kicker="Knowledge · 03"
        title="Vault"
        description="vault 연결 안 됨"
        href="/notes"
        icon={FileText}
        disabled
      />
    );
  }
}

export function FinanceHubCard() {
  return (
    <ToolCard
      kicker="Finance · 04"
      title="자금관리"
      description="수입 · 지출 · 자산 · 예산 (구현 예정)"
      icon={Wallet}
      disabled
    />
  );
}

// ─── Tier 2 ──────────────────────────────────────────────────────

export async function ProjectsHubCard() {
  try {
    const index = await getCachedVaultIndex();
    const { notes: activeProjects } = listNotes(index, {
      folder: "020_Projects/",
      excludeStatus: [...KB_HUB_HIDDEN_STATUSES],
      sort: "created_desc",
      limit: 50,
    });
    const activeCount = activeProjects.length;
    const masters = activeProjects.filter((p) => /_Master\.md$/.test(p.path)).length;

    return (
      <ToolCard
        kicker="Projects · 05"
        title="Active projects"
        description="020_Projects · status ≠ archived/published"
        href="/notes?folder=020_Projects"
        icon={FolderOpen}
        primary={{ value: String(activeCount), label: "Active" }}
        secondary={[
          { label: "Masters", value: String(masters) },
        ]}
      />
    );
  } catch {
    return (
      <ToolCard
        kicker="Projects · 05"
        title="Active projects"
        href="/notes?folder=020_Projects"
        icon={FolderOpen}
        disabled
      />
    );
  }
}

export async function WeeklyHubCard() {
  try {
    const index = await getCachedVaultIndex();
    const now = new Date();
    const thisIso = isoWeek(kstYmd(now));
    const lastIso = isoWeek(kstYmd(new Date(now.getTime() - 7 * 86400000)));
    const thisPath = `010_Daily/Weekly/${thisIso}.md`;
    const lastPath = `010_Daily/Weekly/${lastIso}.md`;
    const hasThis = Boolean(index.notes?.[thisPath]);
    const hasLast = Boolean(index.notes?.[lastPath]);

    const primary = hasThis ? "✓ This week" : hasLast ? "Due now" : "Pending";

    return (
      <ToolCard
        kicker="Weekly · 06"
        title="주간 회고"
        description="이번 주 리뷰 + 지난 주 리뷰 상태"
        href="/review/weekly"
        icon={CalendarCheck}
        primary={{ value: primary, label: thisIso }}
        secondary={[
          { label: "Last week", value: hasLast ? "✓" : "—", tint: hasLast ? undefined : ("danger" as const) },
        ]}
      />
    );
  } catch {
    return (
      <ToolCard
        kicker="Weekly · 06"
        title="주간 회고"
        href="/review/weekly"
        icon={CalendarCheck}
        disabled
      />
    );
  }
}

export function ReadingHubCard() {
  return (
    <ToolCard
      kicker="Reading · 07"
      title="Reading queue"
      description="논문 · 글 · 북마크 큐 (구현 예정)"
      icon={BookOpen}
      disabled
    />
  );
}

export function HabitsHubCard() {
  return (
    <ToolCard
      kicker="Habits · 08"
      title="Habits & Health"
      description="습관 · 운동 · 수면 · 집중 (구현 예정)"
      icon={Activity}
      disabled
    />
  );
}
