"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface CalendarCell {
  iso: string;
  day: number;
}

export interface DashboardCalendarProps {
  monthLabel: string;
  grid: Array<CalendarCell | null>;
  dailyDays: string[];
  todayIso: string;
}

export function DashboardCalendar({
  monthLabel,
  grid,
  dailyDays,
  todayIso,
}: DashboardCalendarProps) {
  const dailyDaysSet = new Set(dailyDays);
  const [toast, setToast] = useState<string | null>(null);

  function handleEmptyClick(iso: string) {
    setToast(`${iso} — 데일리 노트 없음`);
    window.setTimeout(() => setToast(null), 2400);
  }

  return (
    <Card className="col-span-12 lg:col-span-8 row-span-2 relative">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{monthLabel}</CardTitle>
        <CardDescription className="text-xs">
          데일리 노트 존재일 하이라이트 — 클릭하여 열기
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-1">
          {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {grid.map((cell, i) => {
            if (!cell) return <div key={i} className="aspect-square" />;
            const has = dailyDaysSet.has(cell.iso);
            const isToday = cell.iso === todayIso;
            const baseClass = [
              "aspect-square rounded-md flex items-center justify-center text-xs tabular-nums transition-all duration-200",
              isToday ? "ring-1 ring-primary" : "",
            ].join(" ");

            if (has) {
              return (
                <Link
                  key={i}
                  href={`/notes/010_Daily/${cell.iso}.md`}
                  title={`${cell.iso} 노트 열기`}
                  className={`${baseClass} bg-primary/15 text-foreground font-medium hover:bg-primary/30 hover:scale-105 cursor-pointer`}
                >
                  {cell.day}
                </Link>
              );
            }

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleEmptyClick(cell.iso)}
                title={`${cell.iso} — 데일리 노트 없음`}
                className={`${baseClass} text-muted-foreground/60 hover:bg-muted/40 hover:text-foreground/80 cursor-pointer`}
              >
                {cell.day}
              </button>
            );
          })}
        </div>
      </CardContent>

      {/* Toast */}
      {toast && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-lg border border-border bg-card/95 backdrop-blur-sm px-4 py-2 text-xs text-foreground shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-none">
          {toast}
        </div>
      )}
    </Card>
  );
}
