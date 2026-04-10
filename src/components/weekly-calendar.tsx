"use client";

import { useState, useEffect, useCallback, Fragment, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TimeBlock {
  date: string;
  startHour: number;
  endHour: number;
  category: string;
  memo: string;
}

interface DayData {
  date: string;
  day: string;
  focus: string;
  blocks: TimeBlock[];
}

interface CalendarData {
  week: string[];
  days: DayData[];
}

const CATEGORIES: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  "업무":   { bg: "bg-blue-500/20",    border: "border-blue-500/40",    text: "text-blue-300",    dot: "bg-blue-400" },
  "개발":   { bg: "bg-emerald-500/20", border: "border-emerald-500/40", text: "text-emerald-300", dot: "bg-emerald-400" },
  "R&D":    { bg: "bg-violet-500/20",  border: "border-violet-500/40",  text: "text-violet-300",  dot: "bg-violet-400" },
  "회의":   { bg: "bg-orange-500/20",  border: "border-orange-500/40",  text: "text-orange-300",  dot: "bg-orange-400" },
  "학습":   { bg: "bg-cyan-500/20",    border: "border-cyan-500/40",    text: "text-cyan-300",    dot: "bg-cyan-400" },
  "운동":   { bg: "bg-green-500/20",   border: "border-green-500/40",   text: "text-green-300",   dot: "bg-green-400" },
  "식사":   { bg: "bg-amber-500/20",   border: "border-amber-500/40",   text: "text-amber-300",   dot: "bg-amber-400" },
  "휴식":   { bg: "bg-neutral-500/20", border: "border-neutral-500/40", text: "text-neutral-400", dot: "bg-neutral-400" },
  "사이드": { bg: "bg-pink-500/20",    border: "border-pink-500/40",    text: "text-pink-300",    dot: "bg-pink-400" },
};

function catStyle(cat: string) {
  return CATEGORIES[cat] || { bg: "bg-primary/15", border: "border-primary/30", text: "text-primary", dot: "bg-primary" };
}

const HOURS = Array.from({ length: 17 }, (_, i) => i + 7);
const CELL_H = 48; // px per hour row

function getNowKST() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000);
}

export function WeeklyCalendar() {
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [baseDate, setBaseDate] = useState(() => getNowKST().toISOString().split("T")[0]);
  const [view, setView] = useState<"week" | "3day">("3day"); // 3일 기본

  // Drag
  const [dragStart, setDragStart] = useState<{ date: string; hour: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ date: string; hour: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Add form
  const [adding, setAdding] = useState<{ date: string; startHour: number; endHour: number } | null>(null);
  const [form, setForm] = useState({ category: "업무", memo: "" });
  const [submitting, setSubmitting] = useState(false);

  // Now line
  const [nowMinute, setNowMinute] = useState(() => {
    const n = getNowKST();
    return n.getUTCHours() * 60 + n.getUTCMinutes();
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/calendar?date=${baseDate}&_t=${Date.now()}`, { cache: "no-store" });
      setData(await res.json());
    } catch { setData(null); }
    setLoading(false);
  }, [baseDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Update now line every minute
  useEffect(() => {
    const id = setInterval(() => {
      const n = getNowKST();
      setNowMinute(n.getUTCHours() * 60 + n.getUTCMinutes());
    }, 60000);
    return () => clearInterval(id);
  }, []);

  // Auto-scroll to current hour on load
  useEffect(() => {
    if (!loading && scrollRef.current) {
      const currentHour = Math.floor(nowMinute / 60);
      const scrollTo = Math.max(0, (currentHour - 8) * CELL_H); // show 1h before current
      scrollRef.current.scrollTop = scrollTo;
    }
  }, [loading, nowMinute]);

  const todayStr = getNowKST().toISOString().split("T")[0];

  function shiftWeek(dir: number) {
    const d = new Date(baseDate + "T00:00:00");
    d.setDate(d.getDate() + dir * (view === "3day" ? 3 : 7));
    setBaseDate(d.toISOString().split("T")[0]);
  }

  function goToday() { setBaseDate(todayStr); }

  // Drag handlers
  function handleMouseDown(date: string, hour: number) {
    setDragStart({ date, hour });
    setDragEnd({ date, hour });
    setIsDragging(true);
    setAdding(null);
  }

  function handleMouseEnter(date: string, hour: number) {
    if (isDragging && dragStart && date === dragStart.date) {
      setDragEnd({ date, hour });
    }
  }

  function handleMouseUp() {
    if (isDragging && dragStart && dragEnd && dragStart.date === dragEnd.date) {
      const startH = Math.min(dragStart.hour, dragEnd.hour);
      const endH = Math.max(dragStart.hour, dragEnd.hour) + 1;
      setAdding({ date: dragStart.date, startHour: startH, endHour: endH });
      setForm({ category: "업무", memo: "" });
    }
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  }

  function isDragSelected(date: string, hour: number): boolean {
    if (!isDragging || !dragStart || !dragEnd || date !== dragStart.date) return false;
    const minH = Math.min(dragStart.hour, dragEnd.hour);
    const maxH = Math.max(dragStart.hour, dragEnd.hour);
    return hour >= minH && hour <= maxH;
  }

  useEffect(() => {
    function onUp() { if (isDragging) handleMouseUp(); }
    window.addEventListener("mouseup", onUp);
    return () => window.removeEventListener("mouseup", onUp);
  });

  async function handleAddBlock() {
    if (!adding) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: adding.date, startHour: adding.startHour, endHour: adding.endHour, category: form.category, memo: form.memo }),
      });
      if ((await res.json()).ok) { setAdding(null); fetchData(); }
    } catch { /* */ }
    setSubmitting(false);
  }

  if (loading) return <div className="h-[600px] bg-muted/10 rounded-xl animate-pulse" />;
  if (!data) return <div className="text-muted-foreground text-sm">캘린더 로드 실패</div>;

  // View days — 3day centers on today
  let days: DayData[];
  if (view === "3day") {
    const todayIdx = data.days.findIndex((d) => d.date === todayStr);
    const start = todayIdx >= 0 ? Math.max(0, todayIdx - 1) : 0; // yesterday, today, tomorrow
    days = data.days.slice(start, start + 3);
    if (days.length < 3) days = data.days.slice(0, 3);
  } else {
    days = data.days;
  }

  const colCount = days.length;
  const totalBlocks = data.days.reduce((s, d) => s + d.blocks.length, 0);
  const totalHours = data.days.reduce((s, d) => s + d.blocks.reduce((h, b) => h + (b.endHour - b.startHour), 0), 0);

  // Now line position
  const nowHour = Math.floor(nowMinute / 60);
  const nowFrac = (nowMinute % 60) / 60;
  const nowTop = (nowHour - 7) * CELL_H + nowFrac * CELL_H;

  return (
    <div className="space-y-3 select-none">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => shiftWeek(-1)}>←</Button>
          <Button variant="outline" size="sm" className="h-8 text-xs font-medium" onClick={goToday}>오늘</Button>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => shiftWeek(1)}>→</Button>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold tracking-tight">{data.week[0]?.slice(5)} — {data.week[6]?.slice(5)}</div>
          <div className="text-[10px] text-muted-foreground">{totalBlocks}개 블록 · {totalHours}시간</div>
        </div>
        <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-0.5">
          <button className={`px-3 py-1 rounded-md text-xs transition-all ${view === "3day" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`} onClick={() => setView("3day")}>3일</button>
          <button className={`px-3 py-1 rounded-md text-xs transition-all ${view === "week" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`} onClick={() => setView("week")}>주간</button>
        </div>
      </div>

      {/* Add form */}
      {adding && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-primary">
              {adding.date.slice(5)} · {adding.startHour}:00 — {adding.endHour}:00 ({adding.endHour - adding.startHour}h)
            </span>
            <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setAdding(null)}>✕</button>
          </div>
          <div className="flex gap-1 flex-wrap">
            {Object.entries(CATEGORIES).map(([cat, s]) => (
              <button key={cat}
                className={`px-2.5 py-1 rounded-lg text-[11px] border transition-all ${
                  form.category === cat
                    ? `${s.bg} ${s.border} ${s.text} font-semibold shadow-sm`
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20"
                }`}
                onClick={() => setForm({ ...form, category: cat })}>
                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${s.dot}`} />{cat}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input className="h-8 text-sm flex-1" placeholder="메모 (선택)" value={form.memo}
              onChange={(e) => setForm({ ...form, memo: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleAddBlock()} autoFocus />
            <Button size="sm" className="h-8 px-4" disabled={submitting} onClick={handleAddBlock}>
              {submitting ? "..." : "추가"}
            </Button>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="rounded-xl border border-border overflow-hidden bg-background">
        {/* Day headers */}
        <div className="grid gap-0" style={{ gridTemplateColumns: `44px repeat(${colCount}, 1fr)` }}>
          <div className="border-b border-border bg-muted/10" />
          {days.map((day) => {
            const isToday = day.date === todayStr;
            const dateNum = parseInt(day.date.split("-")[2]);
            return (
              <div key={day.date} className={`border-l border-b border-border px-3 py-3 transition-colors ${isToday ? "bg-primary/10" : "bg-muted/10"}`}>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${isToday ? "text-primary font-semibold" : "text-muted-foreground"}`}>{day.day}</span>
                  {isToday ? (
                    <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">{dateNum}</span>
                  ) : (
                    <span className="text-xl font-bold tabular-nums">{dateNum}</span>
                  )}
                </div>
                {day.focus && day.focus !== "---" && (
                  <div className="text-[11px] text-muted-foreground/80 mt-1.5 line-clamp-2 leading-snug" title={day.focus}>{day.focus}</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div ref={scrollRef} className="max-h-[calc(100vh-320px)] overflow-y-auto relative">
          <div className="grid gap-0 relative" style={{ gridTemplateColumns: `44px repeat(${colCount}, 1fr)` }}>
            {HOURS.map((hour) => (
              <Fragment key={`row-${hour}`}>
                <div className={`text-[11px] text-muted-foreground/40 text-right pr-2 pt-1 border-t border-border/20 ${hour === 12 ? "border-t-border/60 text-muted-foreground/60 font-medium" : ""}`}
                  style={{ height: `${CELL_H}px` }}>
                  {hour}
                </div>
                {days.map((day) => {
                  const isToday = day.date === todayStr;
                  const block = day.blocks.find((b) => b.startHour <= hour && b.endHour > hour);
                  const isStart = block?.startHour === hour;
                  const span = block ? block.endHour - block.startHour : 1;
                  const s = block ? catStyle(block.category) : null;
                  const selected = isDragSelected(day.date, hour);

                  return (
                    <div key={`${day.date}-${hour}`}
                      className={`relative border-l border-t border-border/20 transition-colors ${
                        isToday ? "bg-primary/[0.04]" : ""
                      } ${selected ? "bg-primary/20 border-primary/30" : ""} ${
                        !block ? "cursor-crosshair hover:bg-muted/10" : ""
                      } ${hour === 12 ? "border-t-border/60" : ""}`}
                      style={{ height: `${CELL_H}px` }}
                      onMouseDown={(e) => { if (!block) { e.preventDefault(); handleMouseDown(day.date, hour); }}}
                      onMouseEnter={() => { if (!block) handleMouseEnter(day.date, hour); }}>

                      {isStart && s && (
                        <div className={`absolute inset-x-1 top-1 rounded-lg border ${s.bg} ${s.border} ${s.text} px-2 py-1 overflow-hidden z-10 shadow-sm hover:shadow-md transition-shadow`}
                          style={{ height: `${span * CELL_H - 6}px` }}>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
                            <span className="text-xs font-semibold truncate">{block.category}</span>
                            <span className="text-[10px] opacity-40 ml-auto shrink-0">{block.startHour}–{block.endHour}</span>
                          </div>
                          {block.memo && span > 1 && (
                            <div className="text-[11px] opacity-60 mt-0.5 line-clamp-2 leading-snug">{block.memo}</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </Fragment>
            ))}

            {/* Now line */}
            {nowHour >= 7 && nowHour <= 23 && (
              <div className="absolute left-0 right-0 z-20 pointer-events-none flex items-center" style={{ top: `${nowTop}px` }}>
                <div className="w-[44px] flex justify-end pr-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
                </div>
                <div className="flex-1 h-[2px] bg-red-500/70 shadow-sm shadow-red-500/30" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-2 flex-wrap text-[11px] text-muted-foreground/60">
        {Object.entries(CATEGORIES).map(([cat, s]) => (
          <span key={cat} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${s.dot}`} />{cat}
          </span>
        ))}
        <span className="ml-auto flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500" />now
        </span>
      </div>
    </div>
  );
}
