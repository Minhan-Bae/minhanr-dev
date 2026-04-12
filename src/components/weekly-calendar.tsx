"use client";

import { useState, useEffect, useCallback, Fragment, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { nowInKST, todayKstDate, nowKstMinutes } from "@/lib/time";
import { apiFetch } from "@/lib/api-fetch";

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
  title: string;
  blocks: TimeBlock[];
}

interface CalendarData {
  week: string[];
  days: DayData[];
}

// ── Category system ──
interface CatConfig { bg: string; border: string; text: string; dot: string; barBg: string }
const DEFAULT_CATEGORIES: Record<string, CatConfig> = {
  "업무":   { bg: "bg-blue-500/20",    border: "border-blue-500/40",    text: "text-blue-300",    dot: "bg-blue-400",    barBg: "bg-blue-500/30" },
  "개발":   { bg: "bg-emerald-500/20", border: "border-emerald-500/40", text: "text-emerald-300", dot: "bg-emerald-400", barBg: "bg-emerald-500/30" },
  "R&D":    { bg: "bg-violet-500/20",  border: "border-violet-500/40",  text: "text-violet-300",  dot: "bg-violet-400",  barBg: "bg-violet-500/30" },
  "회의":   { bg: "bg-orange-500/20",  border: "border-orange-500/40",  text: "text-orange-300",  dot: "bg-orange-400",  barBg: "bg-orange-500/30" },
  "학습":   { bg: "bg-cyan-500/20",    border: "border-cyan-500/40",    text: "text-cyan-300",    dot: "bg-cyan-400",    barBg: "bg-cyan-500/30" },
  "운동":   { bg: "bg-green-500/20",   border: "border-green-500/40",   text: "text-green-300",   dot: "bg-green-400",   barBg: "bg-green-500/30" },
  "식사":   { bg: "bg-amber-500/20",   border: "border-amber-500/40",   text: "text-amber-300",   dot: "bg-amber-400",   barBg: "bg-amber-500/30" },
  "휴식":   { bg: "bg-muted/50",       border: "border-border",          text: "text-muted-foreground", dot: "bg-muted-foreground", barBg: "bg-muted/60" },
  "수면":   { bg: "bg-indigo-900/30",  border: "border-indigo-800/40",  text: "text-indigo-400",  dot: "bg-indigo-500",  barBg: "bg-indigo-900/40" },
  "사이드": { bg: "bg-pink-500/20",    border: "border-pink-500/40",    text: "text-pink-300",    dot: "bg-pink-400",    barBg: "bg-pink-500/30" },
};

function catStyle(cat: string, cats: Record<string, CatConfig>) {
  return cats[cat] || { bg: "bg-primary/15", border: "border-primary/30", text: "text-primary", dot: "bg-primary", barBg: "bg-primary/20" };
}

const HOURS = Array.from({ length: 17 }, (_, i) => i + 7);
const CELL_H = 48;

// KST helpers moved to src/lib/time.ts (single source for +9 shift).

// ── Main Component ──
export function WeeklyCalendar() {
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [baseDate, setBaseDate] = useState(() => todayKstDate());
  const [view, setView] = useState<"3day" | "week" | "month">("3day");
  const [categories, setCategories] = useState<Record<string, CatConfig>>(DEFAULT_CATEGORIES);

  // Drag
  const [dragStart, setDragStart] = useState<{ date: string; hour: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ date: string; hour: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Popup (floating near mouse)
  const [popup, setPopup] = useState<{ x: number; y: number; date: string; startHour: number; endHour: number } | null>(null);
  const [popupForm, setPopupForm] = useState({ category: "업무", memo: "" });

  // Block context menu (edit/delete)
  const [contextBlock, setContextBlock] = useState<{ block: TimeBlock; x: number; y: number } | null>(null);
  const [editing, setEditing] = useState<TimeBlock | null>(null);
  const [editForm, setEditForm] = useState({ startHour: "", endHour: "", category: "", memo: "" });

  // Title edit
  const [editingTitle, setEditingTitle] = useState<{ date: string; value: string } | null>(null);

  const [nowMinute, setNowMinute] = useState(() => nowKstMinutes());
  const scrollRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Load saved categories from localStorage on mount. setState here is
  // synchronous but intentional (one-time hydration of client-only state).
  useEffect(() => {
    try {
      const saved = localStorage.getItem("oikbas-cal-categories");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setCategories({ ...DEFAULT_CATEGORIES, ...JSON.parse(saved) });
    } catch { /* */ }
  }, []);

  const fetchData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const range = view === "month" ? "&range=month" : "";
      const json = await apiFetch<CalendarData>(`/api/calendar?date=${baseDate}&_t=${Date.now()}${range}`, { cache: "no-store" });
      setData(json);
    } catch { if (showLoading) setData(null); }
    if (showLoading) setLoading(false);
  }, [baseDate, view]);

  // Initial fetch on mount + on baseDate change. setState happens
  // asynchronously inside fetchData (after the await), not synchronously
  // in this effect body — suppress the rule for the intentional pattern.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(true); }, [fetchData]);
  useEffect(() => {
    const id = setInterval(() => setNowMinute(nowKstMinutes()), 60000);
    return () => clearInterval(id);
  }, []);
  const hasScrolled = useRef(false);
  useEffect(() => {
    if (!loading && scrollRef.current && !hasScrolled.current) {
      const currentHour = Math.floor(nowMinute / 60);
      scrollRef.current.scrollTop = Math.max(0, (currentHour - 8) * CELL_H);
      hasScrolled.current = true;
    }
  }, [loading, nowMinute]);

  const todayStr = todayKstDate();
  function shiftWeek(dir: number) {
    const d = new Date(baseDate + "T00:00:00");
    if (view === "month") {
      d.setMonth(d.getMonth() + dir);
    } else {
      d.setDate(d.getDate() + dir * (view === "3day" ? 3 : 7));
    }
    setBaseDate(d.toISOString().split("T")[0]);
  }
  function goToday() { setBaseDate(todayStr); }

  // ── Drag ──
  function handleMouseDown(date: string, hour: number) {
    setDragStart({ date, hour }); setDragEnd({ date, hour }); setIsDragging(true);
    setPopup(null); setContextBlock(null);
  }
  function handleMouseEnter(date: string, hour: number) {
    if (isDragging && dragStart && date === dragStart.date) setDragEnd({ date, hour });
  }
  function handleMouseUp(e: React.MouseEvent) {
    if (isDragging && dragStart && dragEnd && dragStart.date === dragEnd.date) {
      const startH = Math.min(dragStart.hour, dragEnd.hour);
      const endH = Math.max(dragStart.hour, dragEnd.hour) + 1;
      const rect = gridRef.current?.getBoundingClientRect();
      const x = e.clientX - (rect?.left || 0);
      const y = e.clientY - (rect?.top || 0);
      setPopup({ x, y: Math.min(y, 400), date: dragStart.date, startHour: startH, endHour: endH });
      setPopupForm({ category: "업무", memo: "" });
    }
    setIsDragging(false); setDragStart(null); setDragEnd(null);
  }
  function isDragSelected(date: string, hour: number): boolean {
    if (!isDragging || !dragStart || !dragEnd || date !== dragStart.date) return false;
    return hour >= Math.min(dragStart.hour, dragEnd.hour) && hour <= Math.max(dragStart.hour, dragEnd.hour);
  }
  useEffect(() => { function onUp() { if (isDragging) { setIsDragging(false); setDragStart(null); setDragEnd(null); } } window.addEventListener("mouseup", onUp); return () => window.removeEventListener("mouseup", onUp); }, [isDragging]);

  // ── Optimistic helpers ──
  function updateLocalData(mutator: (d: CalendarData) => CalendarData) {
    setData((prev) => prev ? mutator(structuredClone(prev)) : prev);
  }

  // ── API Actions (optimistic) ──
  async function addBlock() {
    if (!popup) return;
    const newBlock: TimeBlock = { date: popup.date, startHour: popup.startHour, endHour: popup.endHour, category: popupForm.category, memo: popupForm.memo };

    // Optimistic: add to local state immediately
    updateLocalData((d) => {
      const day = d.days.find((dd) => dd.date === popup.date);
      if (day) day.blocks.push(newBlock);
      return d;
    });
    setPopup(null);

    // Background API
    try {
      const result = await apiFetch<{ ok?: boolean }>("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBlock),
      });
      if (!result?.ok) fetchData(); // rollback on failure
    } catch { fetchData(); }
  }

  async function deleteBlock(block: TimeBlock) {
    // Optimistic: remove from local state immediately
    updateLocalData((d) => {
      const day = d.days.find((dd) => dd.date === block.date);
      if (day) day.blocks = day.blocks.filter((b) => !(b.startHour === block.startHour && b.endHour === block.endHour));
      return d;
    });
    setContextBlock(null);

    try {
      const result = await apiFetch<{ ok?: boolean }>("/api/calendar", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: block.date, startHour: block.startHour, endHour: block.endHour }),
      });
      if (!result?.ok) fetchData();
    } catch { fetchData(); }
  }

  async function updateBlock() {
    if (!editing) return;
    const updatedBlock: TimeBlock = { date: editing.date, startHour: parseInt(editForm.startHour), endHour: parseInt(editForm.endHour), category: editForm.category, memo: editForm.memo };

    // Optimistic: replace in local state
    updateLocalData((d) => {
      const day = d.days.find((dd) => dd.date === editing.date);
      if (day) {
        day.blocks = day.blocks.map((b) =>
          b.startHour === editing.startHour && b.endHour === editing.endHour ? updatedBlock : b
        );
      }
      return d;
    });
    setEditing(null);

    try {
      const result = await apiFetch<{ ok?: boolean }>("/api/calendar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: editing.date,
          action: "update_block",
          oldStartHour: editing.startHour,
          oldEndHour: editing.endHour,
          startHour: updatedBlock.startHour,
          endHour: updatedBlock.endHour,
          category: updatedBlock.category,
          memo: updatedBlock.memo,
        }),
      });
      if (!result?.ok) fetchData();
    } catch { fetchData(); }
  }

  async function saveTitle(date: string, title: string) {
    // Optimistic
    updateLocalData((d) => {
      const day = d.days.find((dd) => dd.date === date);
      if (day) day.title = title;
      return d;
    });
    setEditingTitle(null);

    try {
      await apiFetch("/api/calendar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, action: "set_title", title }),
      });
    } catch { fetchData(); }
  }

  // ── Close popups on outside click ──
  useEffect(() => {
    function onClick() { setContextBlock(null); }
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  if (loading) return <div className="h-[600px] bg-muted/10 rounded-xl skeleton-shimmer" />;
  if (!data) return <div className="text-muted-foreground text-sm">캘린더 로드 실패</div>;

  // View filter
  let days: DayData[];
  if (view === "month") {
    days = data.days;
  } else if (view === "3day") {
    const todayIdx = data.days.findIndex((d) => d.date === todayStr);
    const start = todayIdx >= 0 ? Math.max(0, todayIdx - 1) : 0;
    days = data.days.slice(start, start + 3);
    if (days.length < 3) days = data.days.slice(0, 3);
  } else { days = data.days; }

  const colCount = days.length;
  const totalBlocks = data.days.reduce((s, d) => s + d.blocks.length, 0);
  const totalHours = data.days.reduce((s, d) => s + d.blocks.reduce((h, b) => h + (b.endHour - b.startHour), 0), 0);
  const nowHour = Math.floor(nowMinute / 60);
  const nowFrac = (nowMinute % 60) / 60;
  const nowTop = (nowHour - 7) * CELL_H + nowFrac * CELL_H;

  // Month mini-map
  const monthDays: { date: string; hasBlocks: boolean; isToday: boolean }[] = [];
  const now = nowInKST();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(now.getFullYear(), now.getMonth(), d);
    const iso = dt.toISOString().split("T")[0];
    const dayData = data.days.find((dd) => dd.date === iso);
    monthDays.push({ date: iso, hasBlocks: (dayData?.blocks.length || 0) > 0, isToday: iso === todayStr });
  }
  const monthStartOffset = firstOfMonth.getDay();

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
          {view === "month" ? (
            <>
              <div className="text-sm font-semibold tracking-tight">{now.getFullYear()}년 {now.getMonth() + 1}월</div>
              <div className="text-xs text-muted-foreground">{totalBlocks}블록 · {totalHours}h</div>
            </>
          ) : (
            <>
              <div className="text-sm font-semibold tracking-tight">{data.week[0]?.slice(5)} — {data.week[data.week.length - 1]?.slice(5)}</div>
              <div className="text-xs text-muted-foreground">{totalBlocks}블록 · {totalHours}h</div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-0.5">
            <button className={`px-3 py-1 rounded-md text-xs transition-all ${view === "3day" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`} onClick={() => setView("3day")}>3일</button>
            <button className={`px-3 py-1 rounded-md text-xs transition-all ${view === "week" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`} onClick={() => setView("week")}>주간</button>
            <button className={`px-3 py-1 rounded-md text-xs transition-all ${view === "month" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`} onClick={() => setView("month")}>월간</button>
          </div>
        </div>
      </div>

      {/* ── Month view ── */}
      {view === "month" && (
        <div className="rounded-xl border border-border bg-background p-4">
          <div className="grid grid-cols-7 gap-0.5 text-xs text-center mb-2">
            {["일","월","화","수","목","금","토"].map((d) => (
              <div key={d} className="py-1 text-muted-foreground/50 font-medium">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for offset */}
            {(() => {
              const firstDate = data.days[0]?.date;
              if (!firstDate) return null;
              const offset = new Date(firstDate + "T00:00:00").getDay();
              return Array.from({ length: offset }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-[4/3]" />
              ));
            })()}
            {data.days.map((day) => {
              const dayNum = parseInt(day.date.split("-")[2]);
              const isToday = day.date === todayStr;
              const hours = day.blocks.reduce((h, b) => h + (b.endHour - b.startHour), 0);
              const topCats = [...new Set(day.blocks.map((b) => b.category))].slice(0, 3);
              return (
                <button
                  key={day.date}
                  onClick={() => { setView("3day"); setBaseDate(day.date); }}
                  className={`aspect-[4/3] rounded-lg border p-1.5 flex flex-col items-start justify-between text-left transition-all hover:brightness-110 ${
                    isToday
                      ? "border-primary bg-primary/10"
                      : day.blocks.length > 0
                        ? "border-border bg-card/60"
                        : "border-border/30 bg-transparent"
                  }`}
                >
                  <span className={`text-xs tabular-nums ${isToday ? "text-primary font-bold" : "text-foreground/80"}`}>
                    {dayNum}
                  </span>
                  {hours > 0 && (
                    <div className="w-full space-y-0.5">
                      <span className="text-xs text-muted-foreground tabular-nums">{hours}h</span>
                      <div className="flex gap-0.5">
                        {topCats.map((cat) => {
                          const s = categories[cat];
                          return (
                            <span
                              key={cat}
                              className={`w-1.5 h-1.5 rounded-full ${s?.dot ?? "bg-muted-foreground"}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-border/30">
            {Object.entries(categories).map(([cat, s]) => (
              <div key={cat} className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                <span className={`w-2 h-2 rounded-full ${s.dot}`} />{cat}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 3day / week view ── */}
      {view !== "month" && (
      <div className="flex gap-3">
        {/* Month mini-map */}
        <div className="hidden lg:block shrink-0 w-[180px] space-y-2">
          <div className="text-xs font-medium text-muted-foreground">{now.getFullYear()}년 {now.getMonth() + 1}월</div>
          <div className="grid grid-cols-7 gap-0.5 text-xs">
            {["일","월","화","수","목","금","토"].map((d) => <div key={d} className="text-center text-muted-foreground/40">{d}</div>)}
            {Array.from({ length: monthStartOffset }).map((_, i) => <div key={`e-${i}`} />)}
            {monthDays.map((md) => (
              <button key={md.date} onClick={() => setBaseDate(md.date)}
                className={`aspect-square rounded-sm flex items-center justify-center text-xs transition-colors ${
                  md.isToday ? "bg-primary text-primary-foreground font-bold" :
                  md.hasBlocks ? "bg-primary/15 text-foreground" :
                  "text-muted-foreground/50 hover:bg-muted/20"
                } ${data.week.includes(md.date) ? "ring-1 ring-primary/30" : ""}`}>
                {parseInt(md.date.split("-")[2])}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="space-y-0.5 pt-2 border-t border-border/30">
            {Object.entries(categories).map(([cat, s]) => (
              <div key={cat} className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                <span className={`w-2 h-2 rounded-full ${s.dot}`} />{cat}
              </div>
            ))}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
              <span className="w-2 h-2 rounded-full bg-red-500" />now
            </div>
          </div>
        </div>

        {/* Calendar grid */}
        <div ref={gridRef} className="flex-1 rounded-xl border border-border overflow-hidden bg-background relative">
          {/* Day headers */}
          <div className="grid gap-0" style={{ gridTemplateColumns: `44px repeat(${colCount}, 1fr)` }}>
            <div className="border-b border-border bg-muted/10" />
            {days.map((day) => {
              const isToday = day.date === todayStr;
              const dateNum = parseInt(day.date.split("-")[2]);
              return (
                <div key={day.date} className={`border-l border-b border-border px-3 py-2.5 ${isToday ? "bg-primary/10" : "bg-muted/10"}`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${isToday ? "text-primary font-semibold" : "text-muted-foreground"}`}>{day.day}</span>
                    {isToday ? (
                      <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">{dateNum}</span>
                    ) : (
                      <span className="text-lg font-bold tabular-nums">{dateNum}</span>
                    )}
                    <Link href={`/notes/010_Daily/${day.date}.md`} className="ml-auto text-xs text-muted-foreground/40 hover:text-primary transition-colors" title="Daily Note 열기">📎</Link>
                  </div>
                  {/* Editable title */}
                  {editingTitle?.date === day.date ? (
                    <input className="w-full mt-1 text-xs bg-transparent border-b border-primary/30 outline-none text-foreground"
                      value={editingTitle.value} autoFocus
                      onChange={(e) => setEditingTitle({ ...editingTitle, value: e.target.value })}
                      onBlur={() => saveTitle(day.date, editingTitle.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") saveTitle(day.date, editingTitle.value); if (e.key === "Escape") setEditingTitle(null); }} />
                  ) : (
                    <div className="text-xs text-muted-foreground/70 mt-1 cursor-text hover:text-muted-foreground transition-colors line-clamp-2 leading-snug min-h-[16px]"
                      onClick={() => setEditingTitle({ date: day.date, value: day.title || day.focus || "" })}
                      title="클릭하여 일자 메모 편집">
                      {day.title || day.focus || <span className="italic text-muted-foreground/30">+ 메모 추가</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Time grid */}
          <div ref={scrollRef} className="max-h-[calc(100vh-300px)] overflow-y-auto relative">
            <div className="grid gap-0 relative" style={{ gridTemplateColumns: `44px repeat(${colCount}, 1fr)` }}
              onMouseUp={handleMouseUp}>
              {HOURS.map((hour) => (
                <Fragment key={`row-${hour}`}>
                  <div className={`text-xs text-muted-foreground/40 text-right pr-2 pt-1 border-t border-border/20 ${hour === 12 ? "border-t-border/60 text-muted-foreground/60 font-medium" : ""}`}
                    style={{ height: `${CELL_H}px` }}>{hour}</div>
                  {days.map((day) => {
                    const isToday = day.date === todayStr;
                    // Find ALL blocks that start at this hour (for overlap rendering)
                    const blocksAtHour = day.blocks.filter((b) => b.startHour === hour);
                    const hasBlock = day.blocks.some((b) => b.startHour <= hour && b.endHour > hour);
                    const selected = isDragSelected(day.date, hour);

                    // Compute overlap columns for blocks starting at this hour
                    const overlapCount = blocksAtHour.length > 1 ? blocksAtHour.length : 0;

                    return (
                      <div key={`${day.date}-${hour}`}
                        className={`relative border-l border-t border-border/20 transition-colors ${isToday ? "bg-primary/[0.04]" : ""} ${selected ? "bg-primary/20 border-primary/30" : ""} ${!hasBlock ? "cursor-crosshair hover:bg-muted/10" : ""} ${hour === 12 ? "border-t-border/60" : ""}`}
                        style={{ height: `${CELL_H}px` }}
                        onMouseDown={(e) => { if (!hasBlock) { e.preventDefault(); handleMouseDown(day.date, hour); }}}
                        onMouseEnter={() => { if (!hasBlock) handleMouseEnter(day.date, hour); }}>

                        {blocksAtHour.map((block, colIdx) => {
                          const span = block.endHour - block.startHour;
                          const s = catStyle(block.category, categories);
                          // If blocks overlap, split the width evenly
                          const colTotal = overlapCount || 1;
                          const leftPct = overlapCount ? `${(colIdx / colTotal) * 100}%` : undefined;
                          const widthPct = overlapCount ? `${(1 / colTotal) * 100}%` : undefined;

                          return (
                            <div key={`${block.startHour}-${block.endHour}-${colIdx}`}
                              className={`absolute top-1 rounded-lg border ${s.bg} ${s.border} ${s.text} overflow-hidden z-10 shadow-sm hover:shadow-md transition-shadow cursor-pointer group`}
                              style={{
                                height: `${span * CELL_H - 6}px`,
                                left: leftPct ?? '4px',
                                right: overlapCount ? undefined : '4px',
                                width: widthPct ? `calc(${widthPct} - 8px)` : undefined,
                              }}
                              onClick={(e) => { e.stopPropagation(); setContextBlock({ block, x: e.clientX - (gridRef.current?.getBoundingClientRect().left || 0), y: e.clientY - (gridRef.current?.getBoundingClientRect().top || 0) }); }}>
                              {/* Candle bar style for 업무 */}
                              {(block.category === "업무" || block.category === "회의") && span >= 2 ? (
                                <div className="h-full flex flex-col">
                                  <div className={`h-1 ${s.barBg} rounded-t-lg`} />
                                  <div className={`flex-1 ${s.bg} px-2 py-1`}>
                                    <div className="flex items-center gap-1.5">
                                      <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
                                      <span className="text-xs font-semibold truncate">{block.category}</span>
                                      <span className="text-xs opacity-40 ml-auto shrink-0">{block.startHour}–{block.endHour}</span>
                                    </div>
                                    {block.memo && <div className="text-xs opacity-60 mt-0.5 line-clamp-2 leading-snug">{block.memo}</div>}
                                  </div>
                                  <div className={`h-1 ${s.barBg} rounded-b-lg`} />
                                </div>
                              ) : (
                                <div className="px-2 py-1 h-full">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
                                    <span className="text-xs font-semibold truncate">{block.category}</span>
                                    <span className="text-xs opacity-40 ml-auto shrink-0">{block.startHour}–{block.endHour}</span>
                                  </div>
                                  {block.memo && span > 1 && <div className="text-xs opacity-60 mt-0.5 line-clamp-2 leading-snug">{block.memo}</div>}
                                </div>
                              )}
                              {/* Hover action hint */}
                              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground">⋯</div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </Fragment>
              ))}

              {/* Now line */}
              {nowHour >= 7 && nowHour <= 23 && (
                <div className="absolute left-0 right-0 z-20 pointer-events-none flex items-center" style={{ top: `${nowTop}px` }}>
                  <div className="w-[44px] flex justify-end pr-1"><div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50" /></div>
                  <div className="flex-1 h-[2px] bg-red-500/70" />
                </div>
              )}
            </div>
          </div>

          {/* ── Floating popup (add block) ── */}
          {popup && (
            <div className="absolute z-30 w-64 rounded-xl border border-primary/30 bg-card shadow-xl p-3 space-y-2 animate-in fade-in zoom-in-95 duration-150"
              style={{ left: `${Math.min(popup.x, 300)}px`, top: `${popup.y + 60}px` }}
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-primary">{popup.date.slice(5)} · {popup.startHour}:00–{popup.endHour}:00</span>
                <button className="text-muted-foreground hover:text-foreground text-xs" onClick={() => setPopup(null)}>✕</button>
              </div>
              <div className="flex gap-1 flex-wrap">
                {Object.entries(categories).map(([cat, s]) => (
                  <button key={cat}
                    className={`px-2 py-0.5 rounded-md text-xs transition-all ${popupForm.category === cat ? `${s.bg} ${s.border} ${s.text} font-semibold border` : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setPopupForm({ ...popupForm, category: cat })}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-0.5 ${s.dot}`} />{cat}
                  </button>
                ))}
              </div>
              <Input className="h-7 text-xs" placeholder="메모" value={popupForm.memo}
                onChange={(e) => setPopupForm({ ...popupForm, memo: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && addBlock()} autoFocus />
              <Button size="sm" className="w-full h-7 text-xs" onClick={addBlock}>추가</Button>
            </div>
          )}

          {/* ── Context menu (edit/delete) ── */}
          {contextBlock && (
            <div className="absolute z-30 w-56 rounded-xl border border-border bg-card shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
              style={{ left: `${Math.min(contextBlock.x, 300)}px`, top: `${contextBlock.y + 60}px` }}
              onClick={(e) => e.stopPropagation()}>
              <div className="p-2 border-b border-border/50">
                <div className="text-xs font-medium">{contextBlock.block.category} · {contextBlock.block.startHour}–{contextBlock.block.endHour}</div>
                {contextBlock.block.memo && <div className="text-xs text-muted-foreground">{contextBlock.block.memo}</div>}
              </div>
              <button className="w-full px-3 py-2 text-left text-xs hover:bg-muted/20 transition-colors flex items-center gap-2"
                onClick={() => { setEditing(contextBlock.block); setEditForm({ startHour: String(contextBlock.block.startHour), endHour: String(contextBlock.block.endHour), category: contextBlock.block.category, memo: contextBlock.block.memo }); setContextBlock(null); }}>
                ✏️ 수정
              </button>
              <Link href={`/notes/010_Daily/${contextBlock.block.date}.md`}
                className="w-full px-3 py-2 text-left text-xs hover:bg-muted/20 transition-colors flex items-center gap-2 block">
                📎 Daily Note
              </Link>
              <button className="w-full px-3 py-2 text-left text-xs hover:bg-destructive/10 text-destructive transition-colors flex items-center gap-2"
                onClick={() => deleteBlock(contextBlock.block)}>
                🗑️ 삭제
              </button>
            </div>
          )}

          {/* ── Edit modal ── */}
          {editing && (
            <div className="absolute inset-0 z-40 bg-background/80 backdrop-blur-sm flex items-center justify-center" onClick={() => setEditing(null)}>
              <div className="w-80 rounded-xl border border-border bg-card shadow-2xl p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
                <div className="text-sm font-semibold">블록 수정</div>
                <div className="flex gap-2">
                  <div className="space-y-0.5 flex-1"><label className="text-xs text-muted-foreground">시작</label>
                    <Input className="h-8" value={editForm.startHour} onChange={(e) => setEditForm({ ...editForm, startHour: e.target.value })} /></div>
                  <div className="space-y-0.5 flex-1"><label className="text-xs text-muted-foreground">종료</label>
                    <Input className="h-8" value={editForm.endHour} onChange={(e) => setEditForm({ ...editForm, endHour: e.target.value })} /></div>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {Object.entries(categories).map(([cat, s]) => (
                    <button key={cat}
                      className={`px-2 py-1 rounded-md text-xs transition-all ${editForm.category === cat ? `${s.bg} ${s.border} ${s.text} font-semibold border` : "text-muted-foreground hover:text-foreground"}`}
                      onClick={() => setEditForm({ ...editForm, category: cat })}>
                      <span className={`inline-block w-1.5 h-1.5 rounded-full mr-0.5 ${s.dot}`} />{cat}
                    </button>
                  ))}
                </div>
                <Input className="h-8" placeholder="메모" value={editForm.memo} onChange={(e) => setEditForm({ ...editForm, memo: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && updateBlock()} />
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 h-8" onClick={updateBlock}>저장</Button>
                  <Button size="sm" variant="ghost" className="h-8" onClick={() => setEditing(null)}>취소</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
