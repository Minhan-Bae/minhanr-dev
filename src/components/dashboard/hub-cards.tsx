import { Calendar, Clock, FileText, Wallet, FolderOpen, CalendarCheck, BookOpen, Activity, Target, Users, Lightbulb } from "lucide-react";
import { ToolCard } from "@/components/dashboard/tool-card";
import { QuickBlockButton } from "@/components/dashboard/quick-block-button";
import { listCategories, listEntriesInRange } from "@/lib/actions/time";
import {
  DAY_COUNT,
  DAY_MS,
  startOfWeekSundayKST,
} from "@/lib/time/week";
import { getCachedVaultIndex, listNotes, aggregate, KB_HUB_HIDDEN_STATUSES } from "@/lib/vault-index";
import { getVaultStats, listNotesFromSupabase } from "@/lib/notes-supabase";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
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
      >
        {cats.length > 0 && (
          <div className="-mt-1 flex justify-end" onClick={(e) => e.preventDefault()}>
            <QuickBlockButton categories={cats} />
          </div>
        )}
      </ToolCard>
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
    const now = new Date();
    const todayIso = kstYmd(now);
    const in7 = kstYmd(new Date(now.getTime() + 7 * 86400000));

    const sb = createSupabaseAdmin();
    const { data } = await sb
      .from("vault_notes")
      .select("deadline,workflow,publish,lifecycle_state")
      .not("deadline", "is", null)
      .neq("lifecycle_state", "archived");

    let overdue = 0;
    let today = 0;
    let thisWeek = 0;
    for (const r of data ?? []) {
      const dl = typeof r.deadline === "string" ? r.deadline : "";
      if (!/^\d{4}-\d{2}-\d{2}/.test(dl)) continue;
      if (r.publish === "published") continue;
      if (r.workflow === "completed" || r.workflow === "paused") continue;
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
    const stats = await getVaultStats();
    return (
      <ToolCard
        kicker="Knowledge · 03"
        title="Vault"
        description="Supabase FTS · 3-tier knowledge base"
        href="/notes"
        icon={FileText}
        primary={{ value: String(stats.total), label: "Notes" }}
        secondary={[
          { label: "Growing", value: String(stats.growing), tint: "primary" as const },
          { label: "Mature", value: String(stats.mature) },
          { label: "Published", value: String(stats.published) },
        ]}
      />
    );
  } catch {
    return (
      <ToolCard
        kicker="Knowledge · 03"
        title="Vault"
        description="Supabase 연결 안 됨"
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
    const { notes: active, total } = await listNotesFromSupabase({
      folder: "020_Projects/",
      lifecycleState: "active",
      excludePublish: ["published"],
      sort: "updated_desc",
      limit: 100,
    });
    const masters = active.filter((p) => /_Master\.md$/.test(p.path)).length;

    return (
      <ToolCard
        kicker="Projects · 05"
        title="Active projects"
        description="020_Projects · lifecycle active"
        href="/notes?folder=020_Projects"
        icon={FolderOpen}
        primary={{ value: String(total), label: "Active" }}
        secondary={[{ label: "Masters", value: String(masters) }]}
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
    const now = new Date();
    const thisIso = isoWeek(kstYmd(now));
    const lastIso = isoWeek(kstYmd(new Date(now.getTime() - 7 * 86400000)));
    const thisPath = `010_Daily/Weekly/${thisIso}.md`;
    const lastPath = `010_Daily/Weekly/${lastIso}.md`;
    const sb = createSupabaseAdmin();
    const { data } = await sb
      .from("vault_notes")
      .select("path")
      .in("path", [thisPath, lastPath]);
    const found = new Set((data ?? []).map((r) => r.path));
    const hasThis = found.has(thisPath);
    const hasLast = found.has(lastPath);

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

// ─── Tier 3 (monthly / long) ──────────────────────────────────────

export function GoalsHubCard() {
  return (
    <ToolCard
      kicker="Goals · 10"
      title="Goals & OKRs"
      description="월 · 분기 목표 · OKR 추적 (구현 예정)"
      icon={Target}
      disabled
    />
  );
}

export function CRMHubCard() {
  return (
    <ToolCard
      kicker="CRM · 11"
      title="Connections"
      description="인맥 · 미팅 · 팔로우업 (구현 예정)"
      icon={Users}
      disabled
    />
  );
}

export function IdeasHubCard() {
  return (
    <ToolCard
      kicker="Ideas · 12"
      title="Ideas backlog"
      description="잠재 프로젝트 · 실험 아이디어 (구현 예정)"
      icon={Lightbulb}
      disabled
    />
  );
}
