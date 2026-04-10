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

export function WeeklyCalendar() {
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [baseDate, setBaseDate] = useState(() => {
    const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
    return now.toISOString().split("T")[0];
  });
  const [view, setView] = useState<"week" | "3day">("week");

  // Drag selection state
  const [dragStart, setDragStart] = useState<{ date: string; hour: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ date: string; hour: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Add block form state
  const [adding, setAdding] = useState<{ date: string; startHour: number; endHour: number } | null>(null);
  const [form, setForm] = useState({ category: "업무", memo: "" });
  const [submitting, setSubmitting] = useState(false);

  const gridRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/calendar?date=${baseDate}&_t=${Date.now()}`, { cache: "no-store" });
      setData(await res.json());
    } catch { setData(null); }
    setLoading(false);
  }, [baseDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const todayStr = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split("T")[0];

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

  // Global mouseup to handle drag ending outside grid
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
        body: JSON.stringify({
          date: adding.date,
          startHour: adding.startHour,
          endHour: adding.endHour,
          category: form.category,
          memo: form.memo,
        }),
      });
      if ((await res.json()).ok) {
        setAdding(null);
        setForm({ category: "업무", memo: "" });
        fetchData();
      }
    } catch { /* */ }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-10 bg-muted/20 rounded-lg animate-pulse" />
        <div className="h-[600px] bg-muted/10 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!data) return <div className="text-muted-foreground text-sm">캘린더 로드 실패</div>;

  const visibleDays = view === "3day"
    ? data.days.filter((_, idx) => {
        const todayIdx = data.days.findIndex((dd) => dd.date === todayStr);
        const start = todayIdx >= 0 ? todayIdx : 0;
        return idx >= start && idx < start + 3;
      }).slice(0, 3)
    : data.days;

  const days = visibleDays.length > 0 ? visibleDays : data.days.slice(0, view === "3day" ? 3 : 7);
  const totalBlocks = data.days.reduce((s, d) => s + d.blocks.length, 0);
  const totalHours = data.days.reduce((s, d) => s + d.blocks.reduce((h, b) => h + (b.endHour - b.startHour), 0), 0);
  const colCount = days.length;

  return (
    <div className="space-y-3 select-none">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => shiftWeek(-1)}>←</Button>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={goToday}>오늘</Button>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => shiftWeek(1)}>→</Button>
        </div>
        <span className="text-sm font-semibold tracking-tight">
          {data.week[0]?.slice(5)} — {data.week[6]?.slice(5)}
        </span>
        <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-0.5">
          <button className={`px-3 py-1 rounded-md text-xs transition-colors ${view === "3day" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`} onClick={() => setView("3day")}>3일</button>
          <button className={`px-3 py-1 rounded-md text-xs transition-colors ${view === "week" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`} onClick={() => setView("week")}>주간</button>
        </div>
      </div>

      {/* Mini stats + legend */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span>{totalBlocks}개 블록</span>
        <span>{totalHours}시간</span>
        <span className="ml-auto flex gap-1.5 flex-wrap">
          {Object.entries(CATEGORIES).map(([cat, s]) => (
            <span key={cat} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${s.dot}`} />
              <span>{cat}</span>
            </span>
          ))}
        </span>
      </div>

      {/* Inline add form (appears after drag) */}
      {adding && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 space-y-2 animate-in fade-in duration-200">
          <div className="text-xs font-medium text-primary">
            {adding.date} · {adding.startHour}:00 — {adding.endHour}:00 ({adding.endHour - adding.startHour}h)
          </div>
          <div className="flex gap-2 items-end flex-wrap">
            <div className="space-y-0.5">
              <label className="text-[10px] text-muted-foreground uppercase">카테고리</label>
              <div className="flex gap-1 flex-wrap">
                {Object.entries(CATEGORIES).map(([cat, s]) => (
                  <button
                    key={cat}
                    className={`px-2 py-1 rounded-md text-[11px] border transition-all ${
                      form.category === cat
                        ? `${s.bg} ${s.border} ${s.text} font-medium`
                        : "border-border/50 text-muted-foreground hover:border-border"
                    }`}
                    onClick={() => setForm({ ...form, category: cat })}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-0.5 flex-1 min-w-[140px]">
              <label className="text-[10px] text-muted-foreground uppercase">메모</label>
              <Input className="h-8 text-sm" placeholder="내용" value={form.memo}
                onChange={(e) => setForm({ ...form, memo: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleAddBlock()} autoFocus />
            </div>
            <Button size="sm" className="h-8" disabled={submitting} onClick={handleAddBlock}>
              {submitting ? "저장 중..." : "추가"}
            </Button>
            <Button size="sm" variant="ghost" className="h-8" onClick={() => setAdding(null)}>취소</Button>
          </div>
        </div>
      )}

      {/* Calendar grid */}
      <div ref={gridRef} className="rounded-xl border border-border overflow-hidden bg-background">
        {/* Day headers */}
        <div className="grid gap-0" style={{ gridTemplateColumns: `40px repeat(${colCount}, 1fr)` }}>
          <div className="bg-muted/20 border-b border-border" />
          {days.map((day) => {
            const isToday = day.date === todayStr;
            return (
              <div key={day.date} className={`border-l border-b border-border px-2 py-2.5 ${isToday ? "bg-primary/8" : "bg-muted/20"}`}>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>{day.day}</span>
                  <span className={`text-lg font-bold tabular-nums leading-none ${isToday ? "bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm" : ""}`}>
                    {parseInt(day.date.split("-")[2])}
                  </span>
                </div>
                {day.focus && day.focus !== "---" && (
                  <div className="text-[10px] text-muted-foreground/70 truncate mt-1 leading-tight" title={day.focus}>{day.focus}</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="max-h-[600px] overflow-y-auto">
          <div className="grid gap-0" style={{ gridTemplateColumns: `40px repeat(${colCount}, 1fr)` }}>
            {HOURS.map((hour) => (
              <Fragment key={`row-${hour}`}>
                <div className={`text-[10px] text-muted-foreground/50 text-right pr-1.5 pt-1 border-t border-border/30 h-10 ${hour === 12 ? "border-t-border" : ""}`}>
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
                      className={`relative border-l border-t border-border/30 h-10 transition-colors ${
                        isToday ? "bg-primary/[0.03]" : ""
                      } ${selected ? "bg-primary/15" : ""} ${
                        !block ? "cursor-crosshair hover:bg-muted/15" : ""
                      } ${hour === 12 ? "border-t-border" : ""}`}
                      onMouseDown={(e) => { if (!block) { e.preventDefault(); handleMouseDown(day.date, hour); }}}
                      onMouseEnter={() => { if (!block) handleMouseEnter(day.date, hour); }}
                    >
                      {isStart && s && (
                        <div className={`absolute inset-x-0.5 top-0.5 rounded-md border ${s.bg} ${s.border} ${s.text} px-1.5 py-0.5 overflow-hidden z-10 shadow-sm`}
                          style={{ height: `${span * 40 - 4}px` }}>
                          <div className="flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
                            <span className="text-[11px] font-semibold truncate">{block.category}</span>
                            <span className="text-[10px] opacity-50 ml-auto shrink-0">{block.startHour}–{block.endHour}</span>
                          </div>
                          {block.memo && span > 1 && (
                            <div className="text-[10px] opacity-60 truncate mt-0.5 leading-tight">{block.memo}</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
