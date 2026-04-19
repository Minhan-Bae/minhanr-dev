import { Suspense } from "react";
import Link from "next/link";
import { TodayStrip } from "@/components/dashboard/today-strip";
import {
  TimeHubCard,
  DeadlinesHubCard,
  KnowledgeHubCard,
  FinanceHubCard,
  ProjectsHubCard,
  WeeklyHubCard,
  ReadingHubCard,
  HabitsHubCard,
  GoalsHubCard,
  CRMHubCard,
  IdeasHubCard,
} from "@/components/dashboard/hub-cards";
import { getCachedVaultIndex, aggregate } from "@/lib/vault-index";

export const metadata = {
  title: "Dashboard | minhanr.dev",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

/**
 * Dashboard — the personal management hub.
 *
 * Rebuilt from a bento-card dashboard into a morning-briefing hub.
 * The idea is that every external management tool the studio used to
 * run in spreadsheets or separate apps (time tracking, finance,
 * reading queue, habits, …) lives here as a single card. Each card is
 * a signal + click-through into the tool's dedicated page.
 *
 * Layout is editorial to match the public surface vocabulary:
 *   kicker + font-display h1 greeting
 *   hairline-t section dividers
 *   clamp padding
 *   tool cards in a 4-col / 2-col / 1-col responsive grid
 *
 * Tier structure (expert-informed):
 *   Tier 1 (daily)   Time · Deadlines · Knowledge · Finance
 *   Tier 2 (weekly)  Projects · Weekly · Reading · Habits
 *   System           RT heartbeat · vault sync · Vercel
 *
 * Empty tool cards (Finance / Reading / Habits) render as disabled
 * "soon" stubs so the grid shape stays legible and the roadmap is
 * visible at a glance — no accidental navigation into empty routes.
 */
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  let vaultStats: { totalNotes: number; lastCommit?: string; lastScan?: string } | null = null;
  try {
    const index = await getCachedVaultIndex();
    const agg = aggregate(index);
    vaultStats = {
      totalNotes: Object.keys(index.notes || {}).length,
      lastCommit: agg.last_commit_hash ?? undefined,
      lastScan: agg.last_full_scan ?? undefined,
    };
  } catch {
    vaultStats = null;
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-10 px-4 py-8 sm:space-y-14 sm:px-6 sm:py-10">
      {/* ─── Hero greeting ────────────────────────────────────────── */}
      <section className="space-y-2">
        <p className="font-technical text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground animate-fade-up">
          Hub · 00
        </p>
        <h1
          className="font-display italic leading-[1.05] tracking-[-0.025em] animate-fade-up"
          style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", animationDelay: "60ms" }}
        >
          {getGreeting()}, <span className="text-primary">Minhan</span>.
        </h1>
        <p
          className="font-technical text-[12px] uppercase tracking-[0.18em] text-muted-foreground tabular-nums animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          {dateStr}
        </p>
      </section>

      {/* ─── Now strip ────────────────────────────────────────────── */}
      <section className="hairline-t pt-6 sm:pt-8 animate-fade-up" style={{ animationDelay: "180ms" }}>
        <p className="kicker mb-3">Now · 01</p>
        <Suspense
          fallback={
            <div className="h-12 rounded-md border border-dashed border-border bg-card/30" />
          }
        >
          <TodayStrip />
        </Suspense>
      </section>

      {/* ─── Tier 1 Hub (daily) ───────────────────────────────────── */}
      <section className="hairline-t pt-6 sm:pt-8">
        <header className="mb-5 flex items-baseline justify-between">
          <p className="kicker">Tier 1 · 매일</p>
          <p className="font-technical text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
            time · deadlines · knowledge · finance
          </p>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Suspense fallback={<ToolSkeleton />}>
            <TimeHubCard />
          </Suspense>
          <Suspense fallback={<ToolSkeleton />}>
            <DeadlinesHubCard />
          </Suspense>
          <Suspense fallback={<ToolSkeleton />}>
            <KnowledgeHubCard />
          </Suspense>
          <FinanceHubCard />
        </div>
      </section>

      {/* ─── Tier 2 Hub (weekly) ─────────────────────────────────── */}
      <section className="hairline-t pt-6 sm:pt-8">
        <header className="mb-5 flex items-baseline justify-between">
          <p className="kicker">Tier 2 · 주 단위</p>
          <p className="font-technical text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
            projects · weekly · reading · habits
          </p>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Suspense fallback={<ToolSkeleton />}>
            <ProjectsHubCard />
          </Suspense>
          <Suspense fallback={<ToolSkeleton />}>
            <WeeklyHubCard />
          </Suspense>
          <ReadingHubCard />
          <HabitsHubCard />
        </div>
      </section>

      {/* ─── Tier 3 Hub (monthly) ────────────────────────────────── */}
      <section className="hairline-t pt-6 sm:pt-8">
        <header className="mb-5 flex items-baseline justify-between">
          <p className="kicker">Tier 3 · 월 단위</p>
          <p className="font-technical text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
            goals · crm · ideas
          </p>
        </header>
        <div className="grid gap-4 sm:grid-cols-3">
          <GoalsHubCard />
          <CRMHubCard />
          <IdeasHubCard />
        </div>
      </section>

      {/* ─── System row ──────────────────────────────────────────── */}
      <section className="hairline-t pt-6 sm:pt-8">
        <header className="mb-4 flex items-baseline justify-between">
          <p className="kicker">System · 09</p>
          <Link
            href="/admin"
            className="font-technical text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Full admin →
          </Link>
        </header>
        <div className="grid gap-3 rounded-md border border-[var(--hairline)] bg-card/40 p-4 font-technical text-[11.5px] uppercase tracking-[0.14em] text-muted-foreground sm:grid-cols-3 sm:gap-6">
          <span className="flex items-baseline gap-2">
            <span className="opacity-70">Vault</span>
            <span className="text-foreground tabular-nums">
              {vaultStats?.totalNotes ?? "—"} notes
            </span>
          </span>
          <span className="flex items-baseline gap-2">
            <span className="opacity-70">Last scan</span>
            <span className="text-foreground tabular-nums">
              {vaultStats?.lastScan
                ? new Date(vaultStats.lastScan).toLocaleString("ko-KR", {
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"}
            </span>
          </span>
          <span className="flex items-baseline gap-2">
            <span className="opacity-70">Index</span>
            <span className="font-mono text-foreground tabular-nums text-[10.5px]">
              {vaultStats?.lastCommit?.slice(0, 7) ?? "—"}
            </span>
          </span>
        </div>
      </section>
    </div>
  );
}

function ToolSkeleton() {
  return (
    <div className="skeleton-shimmer h-[172px] rounded-md border border-[var(--hairline)] bg-card/40" />
  );
}
