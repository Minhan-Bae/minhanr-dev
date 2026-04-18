"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { formatWeekLabel } from "@/lib/time/week";

interface WeekNavProps {
  weekStartIso: string;
  prevIso: string;
  nextIso: string;
  thisWeekIso: string;
}

/**
 * Week navigator pill — prev · label · next, plus a "Today" jump back
 * to the current week. Uses anchor links with ?week= so the server
 * component re-fetches cleanly without client state.
 */
export function WeekNav({ weekStartIso, prevIso, nextIso, thisWeekIso }: WeekNavProps) {
  const label = formatWeekLabel(new Date(weekStartIso));
  const isThisWeek = weekStartIso === thisWeekIso;

  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-card/60 px-1 py-1 backdrop-blur-sm">
      <Link
        href={`/calendar?week=${encodeURIComponent(prevIso)}`}
        aria-label="Previous week"
        className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
      </Link>
      <div className="font-technical min-w-[180px] px-3 text-center text-[12px] tabular-nums text-foreground">
        {label}
      </div>
      <Link
        href={`/calendar?week=${encodeURIComponent(nextIso)}`}
        aria-label="Next week"
        className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ChevronRight className="h-4 w-4" aria-hidden />
      </Link>
      {!isThisWeek && (
        <Link
          href="/calendar"
          aria-label="Jump to this week"
          className="ml-1 flex h-8 items-center gap-1 rounded-full bg-primary/15 px-2.5 text-[11px] uppercase tracking-[0.12em] text-primary hover:bg-primary/25"
        >
          <CalendarIcon className="h-3 w-3" aria-hidden />
          Today
        </Link>
      )}
    </div>
  );
}
