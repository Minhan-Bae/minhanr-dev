import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listCategories, listEntriesInRange } from "@/lib/actions/time";
import {
  DAY_COUNT,
  DAY_MS,
  shiftWeek,
  startOfWeekSundayKST,
} from "@/lib/time/week";

/**
 * TimeThisWeekCard — compact roll-up of time_entries for the current
 * Sunday-to-Saturday week, grouped by category. Empty state links out
 * to /calendar so the card stays useful even on week 0.
 *
 * Renders server-side inside the private dashboard; reads share the
 * same Supabase session as the calendar grid via the time action
 * helpers (which internally call requireUser + RLS-scoped selects).
 */
export async function TimeThisWeekCard() {
  const now = new Date();
  const weekStart = startOfWeekSundayKST(now);
  const weekEnd = new Date(weekStart.getTime() + DAY_COUNT * DAY_MS);

  let cats: Awaited<ReturnType<typeof listCategories>> = [];
  let entries: Awaited<ReturnType<typeof listEntriesInRange>> = [];
  try {
    [cats, entries] = await Promise.all([
      listCategories(),
      listEntriesInRange(weekStart.toISOString(), weekEnd.toISOString()),
    ]);
  } catch {
    // Not authed / DB hiccup — render a benign empty state rather than
    // blowing up the whole dashboard.
    return null;
  }

  // Per-category minute sums.
  const sums = new Map<string, number>();
  let totalMinutes = 0;
  for (const e of entries) {
    const key = e.category_id ?? "__none";
    sums.set(key, (sums.get(key) ?? 0) + e.duration_minutes);
    totalMinutes += e.duration_minutes;
  }

  const byId = new Map(cats.map((c) => [c.id, c] as const));
  const rows = [...sums.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id, minutes]) => {
      const cat = id === "__none" ? null : byId.get(id) ?? null;
      return {
        id,
        label: cat?.label ?? "(uncategorised)",
        color: cat?.color_hex ?? "#6b7280",
        minutes,
        pct: totalMinutes > 0 ? minutes / totalMinutes : 0,
      };
    });

  const totalHoursStr = (totalMinutes / 60).toFixed(1);
  const weekLabel = (() => {
    const s = new Date(weekStart.getTime() + 9 * 60 * 60 * 1000);
    const e = new Date(
      weekStart.getTime() + 6 * DAY_MS + 9 * 60 * 60 * 1000
    );
    const fmt = (d: Date) =>
      `${(d.getUTCMonth() + 1).toString().padStart(2, "0")}.${d
        .getUTCDate()
        .toString()
        .padStart(2, "0")}`;
    return `${fmt(s)} – ${fmt(e)}`;
  })();

  const lastWeekIso = shiftWeek(weekStart, -1).toISOString();

  return (
    <Card className="hover-lift">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">이번 주 시간 배분</CardTitle>
            <CardDescription className="text-xs">
              {weekLabel} · {totalHoursStr}h 기록 ({entries.length} blocks)
            </CardDescription>
          </div>
          <div className="font-technical flex items-center gap-2 text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
            <Link
              href={`/calendar?week=${encodeURIComponent(lastWeekIso)}`}
              className="transition-colors hover:text-foreground"
            >
              ← Last
            </Link>
            <span className="opacity-40">·</span>
            <Link href="/calendar" className="transition-colors hover:text-foreground">
              View grid →
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        {rows.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            이번 주에 기록된 블록이 없습니다. <Link href="/calendar" className="text-primary hover:underline">Calendar에서 추가 →</Link>
          </p>
        ) : (
          <ul className="space-y-2.5">
            {rows.map((r) => (
              <li key={r.id}>
                <div className="flex items-center justify-between gap-2 text-[13px]">
                  <span className="flex min-w-0 items-center gap-2 truncate">
                    <span
                      className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
                      style={{ background: r.color }}
                      aria-hidden
                    />
                    <span className="truncate text-foreground">{r.label}</span>
                  </span>
                  <span className="font-technical shrink-0 tabular-nums text-muted-foreground">
                    {(r.minutes / 60).toFixed(1)}h
                    <span className="ml-2 opacity-60">
                      {(r.pct * 100).toFixed(0)}%
                    </span>
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted/50">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${r.pct * 100}%`,
                      background: r.color,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
