"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-fetch";
import { NoteQuickActions } from "@/components/note-quick-actions";

export type EventType = "daily" | "deadline" | "published" | "timeblocked";

export interface CalendarEvent {
  iso: string;
  type: EventType;
  title: string;
  href: string;
  status?: string;
}

export interface CalendarCell {
  iso: string;
  day: number;
}

export interface WeekCommitment {
  path: string;
  title: string;
  deadline: string;
  status?: string;
  priority?: string;
  bucket: "overdue" | "today" | "this_week";
}

export interface DashboardCalendarProps {
  monthLabel: string;
  grid: Array<CalendarCell | null>;
  todayIso: string;
  monthStart: string;
  events: CalendarEvent[];
  weekCommitments: WeekCommitment[];
  showWeeklyReviewBanner: boolean;
}

interface TodayCalendar {
  focus: string;
  blockCount: number;
  blockHours: number;
  timeblockedDays: string[];
}

const TYPE_STYLE: Record<EventType, { dot: string; label: string; badge: string }> = {
  daily:       { dot: "bg-primary",    label: "데일리",  badge: "bg-primary/15 text-primary" },
  deadline:    { dot: "bg-chart-3",    label: "마감",    badge: "bg-chart-3/15 text-chart-3" },
  published:   { dot: "bg-chart-2",    label: "발행",    badge: "bg-chart-2/15 text-chart-2" },
  timeblocked: { dot: "bg-chart-4",    label: "타임블록",badge: "bg-chart-4/15 text-chart-4" },
};

export function DashboardCalendar({
  monthLabel,
  grid,
  todayIso,
  monthStart,
  events,
  weekCommitments,
  showWeeklyReviewBanner,
}: DashboardCalendarProps) {
  const [selectedIso, setSelectedIso] = useState<string | null>(null);
  const [calendar, setCalendar] = useState<TodayCalendar | null>(null);
  const [focus, setFocus] = useState("");
  const [editingFocus, setEditingFocus] = useState(false);
  const [focusDraft, setFocusDraft] = useState("");
  const [savingFocus, setSavingFocus] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch<{
          days: Array<{
            date: string;
            focus: string;
            blocks: Array<{ startHour: number; endHour: number }>;
          }>;
        }>(`/api/calendar?date=${monthStart}&range=month&_t=${Date.now()}`, { cache: "no-store" });
        const today = data.days.find((d) => d.date === todayIso);
        const timeblockedDays = data.days.filter((d) => (d.blocks?.length ?? 0) > 0).map((d) => d.date);
        const blockCount = today?.blocks?.length ?? 0;
        const blockHours = (today?.blocks ?? []).reduce((s, b) => s + Math.max(0, b.endHour - b.startHour), 0);
        setCalendar({ focus: today?.focus ?? "", blockCount, blockHours, timeblockedDays });
        setFocus(today?.focus ?? "");
      } catch {
        setCalendar({ focus: "", blockCount: 0, blockHours: 0, timeblockedDays: [] });
      }
    })();
  }, [monthStart, todayIso]);

  const timeblockedSet = useMemo(
    () => new Set(calendar?.timeblockedDays ?? []),
    [calendar]
  );

  const eventsByDate = useMemo(() => {
    const m: Record<string, CalendarEvent[]> = {};
    for (const e of events) (m[e.iso] ||= []).push(e);
    for (const iso of timeblockedSet) {
      const dayEvents = m[iso] || (m[iso] = []);
      if (!dayEvents.some((e) => e.type === "timeblocked")) {
        dayEvents.push({
          iso,
          type: "timeblocked",
          title: iso === todayIso ? "오늘 타임블록" : "타임블록",
          href: "/calendar",
        });
      }
    }
    return m;
  }, [events, timeblockedSet, todayIso]);

  const agendaIso = selectedIso ?? todayIso;
  const agendaEvents = eventsByDate[agendaIso] ?? [];

  async function saveFocus() {
    setSavingFocus(true);
    try {
      await apiFetch(`/api/calendar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: todayIso, action: "set_focus", focus: focusDraft }),
      });
      setFocus(focusDraft);
      setEditingFocus(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "focus 저장 실패");
    } finally {
      setSavingFocus(false);
    }
  }

  return (
    <Card className="col-span-12">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1 min-w-0 flex-1">
            <CardTitle className="text-sm">오늘의 focus</CardTitle>
            {editingFocus ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={focusDraft}
                  onChange={(e) => setFocusDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveFocus();
                    if (e.key === "Escape") { setEditingFocus(false); setFocusDraft(focus); }
                  }}
                  placeholder="한 문장으로 — 오늘 무엇을 한다면"
                  className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm"
                />
                <Button size="sm" onClick={saveFocus} disabled={savingFocus}>
                  {savingFocus ? "…" : "저장"}
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => { setFocusDraft(focus); setEditingFocus(true); }}
                className="text-left text-base font-medium hover:text-primary transition-colors"
              >
                {focus || <span className="text-muted-foreground italic">focus 미설정 — 클릭해 한 문장 적기</span>}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0 text-xs">
            <Badge variant="outline" className="font-normal tabular-nums">
              오늘 {calendar?.blockCount ?? 0} 블록 · {calendar?.blockHours ?? 0}h
            </Badge>
            <Link href="/calendar" className="text-muted-foreground hover:text-primary transition-colors">
              📅 캘린더 →
            </Link>
          </div>
        </div>
        {showWeeklyReviewBanner && (
          <Link
            href="/review/weekly"
            className="mt-2 block rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-xs hover:bg-primary/10 transition-colors"
          >
            📝 지난 주 회고가 아직 없다 — 5분 회고로 다음 주 anchor 고르기 →
          </Link>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          {/* Month grid with layered dots */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{monthLabel}</span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {(["daily","deadline","published","timeblocked"] as EventType[]).map((t) => (
                  <span key={t} className="flex items-center gap-1">
                    <span className={`h-1.5 w-1.5 rounded-full ${TYPE_STYLE[t].dot}`} />
                    {TYPE_STYLE[t].label}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-1">
              {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
                <div key={d} className={i === 0 ? "text-chart-3/80" : i === 6 ? "text-chart-1/80" : ""}>
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {grid.map((cell, i) => {
                if (!cell) return <div key={i} className="aspect-square" />;
                const dayEvents = eventsByDate[cell.iso] ?? [];
                const types = Array.from(new Set(dayEvents.map((e) => e.type))) as EventType[];
                const isToday = cell.iso === todayIso;
                const isSelected = cell.iso === selectedIso;
                const baseClass = [
                  "aspect-square rounded-md flex flex-col items-center justify-between py-1 px-0.5 text-xs tabular-nums transition-all duration-200 cursor-pointer",
                  isToday ? "ring-1 ring-primary bg-primary/5" : "",
                  isSelected ? "ring-2 ring-chart-4" : "",
                  types.length > 0 ? "hover:bg-muted/40" : "text-muted-foreground/60 hover:bg-muted/20",
                ].join(" ");
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedIso(cell.iso === selectedIso ? null : cell.iso)}
                    title={`${cell.iso}${dayEvents.length ? ` — ${dayEvents.length}건` : ""}`}
                    className={baseClass}
                  >
                    <span>{cell.day}</span>
                    <span className="flex gap-0.5">
                      {types.slice(0, 4).map((t) => (
                        <span key={t} className={`h-1 w-1 rounded-full ${TYPE_STYLE[t].dot}`} />
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: commitments + agenda */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">이번 주 commitment</span>
                <Link href="/deadlines" className="text-xs text-muted-foreground hover:text-primary">
                  전체 →
                </Link>
              </div>
              {weekCommitments.length === 0 ? (
                <p className="text-xs text-muted-foreground">놓칠 것 없음</p>
              ) : (
                <ul className="space-y-1.5 text-sm">
                  {weekCommitments.slice(0, 5).map((c) => (
                    <li key={c.path} className="group flex items-center justify-between gap-2 py-1 px-2 -mx-2 rounded hover:bg-muted/50 transition-colors">
                      <span className="truncate flex-1 min-w-0">{c.title.replace(/_/g, " ")}</span>
                      <div className="flex items-center gap-1.5 shrink-0 text-xs">
                        <NoteQuickActions path={c.path} />
                        {c.bucket === "overdue" && (
                          <Badge variant="outline" className="font-normal text-destructive border-destructive/40">
                            지남
                          </Badge>
                        )}
                        {c.bucket === "today" && (
                          <Badge variant="outline" className="font-normal text-chart-3 border-chart-3/40">
                            오늘
                          </Badge>
                        )}
                        <span className="text-muted-foreground tabular-nums">{c.deadline.slice(5)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  {selectedIso ? selectedIso : "오늘"} 이벤트
                </span>
                {selectedIso && (
                  <button
                    type="button"
                    onClick={() => setSelectedIso(null)}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    오늘로 ↺
                  </button>
                )}
              </div>
              {agendaEvents.length === 0 ? (
                <p className="text-xs text-muted-foreground">이벤트 없음</p>
              ) : (
                <ul className="space-y-1.5 text-sm">
                  {agendaEvents.map((e, idx) => (
                    <li key={`${e.iso}-${idx}-${e.href}`} className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${TYPE_STYLE[e.type].dot}`} />
                      <Link
                        href={e.href}
                        className="truncate hover:text-primary transition-colors flex-1"
                      >
                        {e.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardDescription className="sr-only">Dashboard calendar hub</CardDescription>
    </Card>
  );
}
