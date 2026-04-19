import Link from "next/link";
import { listCategories, listEntriesInRange } from "@/lib/actions/time";

/**
 * Compact "Today at a glance" strip — one row above the KPI bento.
 * Shows block count, total tracked hours, the block "now" (if any),
 * and the next upcoming block. Clicking jumps into /calendar.
 *
 * All times are KST; the wall-clock day anchor is computed by
 * shifting UTC midnight into Asia/Seoul and deriving that day's
 * start/end in UTC for the Supabase range query.
 */

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function kstDayBounds(d = new Date()): { startUtc: Date; endUtc: Date } {
  const kst = new Date(d.getTime() + KST_OFFSET_MS);
  const midnightKstUtc = Date.UTC(
    kst.getUTCFullYear(),
    kst.getUTCMonth(),
    kst.getUTCDate(),
    0,
    0,
    0,
    0
  );
  const startUtc = new Date(midnightKstUtc - KST_OFFSET_MS);
  const endUtc = new Date(startUtc.getTime() + 24 * 60 * 60 * 1000);
  return { startUtc, endUtc };
}

function minutesToHuman(m: number): string {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h === 0) return `${mm}분`;
  if (mm === 0) return `${h}시간`;
  return `${h}시간 ${mm}분`;
}

function formatHM(d: Date): string {
  const kst = new Date(d.getTime() + KST_OFFSET_MS);
  const h = kst.getUTCHours().toString().padStart(2, "0");
  const m = kst.getUTCMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

export async function TodayStrip() {
  const now = new Date();
  const { startUtc, endUtc } = kstDayBounds(now);

  let cats: Awaited<ReturnType<typeof listCategories>> = [];
  let entries: Awaited<ReturnType<typeof listEntriesInRange>> = [];
  try {
    [cats, entries] = await Promise.all([
      listCategories(),
      listEntriesInRange(startUtc.toISOString(), endUtc.toISOString()),
    ]);
  } catch {
    return null;
  }

  if (entries.length === 0) {
    return (
      <Link
        href="/calendar"
        className="font-technical flex items-center gap-2 rounded-md border border-dashed border-border bg-card/40 px-3 py-2 text-[12px] text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
      >
        <span>오늘 기록된 블록이 없습니다</span>
        <span aria-hidden className="ml-auto opacity-60">Calendar →</span>
      </Link>
    );
  }

  const catById = new Map(cats.map((c) => [c.id, c] as const));
  const sorted = [...entries].sort((a, b) =>
    a.slot_start.localeCompare(b.slot_start)
  );
  const totalMinutes = entries.reduce((s, e) => s + e.duration_minutes, 0);

  // Locate current (now inside block) + next.
  const nowMs = now.getTime();
  const current = sorted.find((e) => {
    const s = new Date(e.slot_start).getTime();
    return nowMs >= s && nowMs < s + e.duration_minutes * 60 * 1000;
  });
  const next = !current
    ? sorted.find((e) => new Date(e.slot_start).getTime() > nowMs)
    : sorted.find(
        (e) =>
          new Date(e.slot_start).getTime() >=
          new Date(current.slot_start).getTime() +
            current.duration_minutes * 60 * 1000
      );

  const cell = (entry: (typeof sorted)[number] | undefined, prefix: string) => {
    if (!entry) return null;
    const cat = entry.category_id ? catById.get(entry.category_id) : null;
    const start = new Date(entry.slot_start);
    const end = new Date(start.getTime() + entry.duration_minutes * 60 * 1000);
    return (
      <span className="flex min-w-0 items-center gap-1.5">
        <span
          className="inline-block h-2 w-2 shrink-0 rounded-[2px]"
          style={{ background: cat?.color_hex ?? "#6b7280" }}
          aria-hidden
        />
        <span className="font-technical text-muted-foreground">{prefix}</span>
        <span className="truncate text-foreground">
          {cat?.label ?? "—"}
          {entry.note ? ` · ${entry.note}` : ""}
        </span>
        <span className="font-technical shrink-0 tabular-nums text-muted-foreground">
          {formatHM(start)}–{formatHM(end)}
        </span>
      </span>
    );
  };

  return (
    <Link
      href="/calendar"
      className="flex flex-wrap items-center gap-x-5 gap-y-1.5 rounded-md border border-border bg-card/50 px-3.5 py-2.5 text-[13px] transition-colors hover:border-primary/40 hover:bg-card/70"
    >
      <span className="font-technical text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        Today
      </span>
      <span className="font-technical tabular-nums text-foreground">
        {entries.length} blocks · {minutesToHuman(totalMinutes)}
      </span>
      {current && <>{cell(current, "Now")}</>}
      {next && <>{cell(next, "Next")}</>}
      <span aria-hidden className="ml-auto text-[11px] text-muted-foreground">
        Calendar →
      </span>
    </Link>
  );
}
