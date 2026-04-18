"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-fetch";

/* ── Types ── */

interface Schedule {
  id: string;
  title: string;
  day_of_week: number;
  start_hour: number;
  end_hour: number;
  category: string;
  color: string | null;
  is_routine: boolean;
  specific_date: string | null;
}

interface RoutineBlock {
  label: string;
  start: number;
  end: number;
  color: string;
}

/* ── Constants ── */

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const CELL_H = 24;

const DEFAULT_ROUTINES: RoutineBlock[] = [
  { label: "수면", start: 0, end: 6, color: "bg-indigo-950/50" },
  { label: "출근", start: 6, end: 9, color: "bg-muted/40" },
  { label: "업무", start: 9, end: 18, color: "bg-emerald-950/30" },
  { label: "휴식", start: 18, end: 23, color: "bg-purple-950/30" },
  { label: "수면", start: 23, end: 24, color: "bg-indigo-950/50" },
];

const ROUTINE_COLORS = [
  { label: "남색 (수면)", value: "bg-indigo-950/50" },
  { label: "초록 (업무)", value: "bg-emerald-950/30" },
  { label: "보라 (휴식)", value: "bg-purple-950/30" },
  { label: "회색", value: "bg-muted/40" },
  { label: "주황", value: "bg-orange-950/30" },
  { label: "없음", value: "" },
];

const CAT_COLORS: Record<string, string> = {
  event: "bg-primary border-primary",
  meeting: "bg-orange-500 border-orange-400",
  workout: "bg-green-500 border-green-400",
  study: "bg-cyan-500 border-cyan-400",
  routine: "bg-muted-foreground/50 border-muted-foreground",
};

/* ── Date Helpers ── */

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function formatDate(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function toISODate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function formatWeekRange(monday: Date): string {
  const sun = addDays(monday, 6);
  const mStr = `${monday.getFullYear()}.${String(monday.getMonth() + 1).padStart(2, "0")}.${String(monday.getDate()).padStart(2, "0")}`;
  const sStr = `${String(sun.getMonth() + 1).padStart(2, "0")}.${String(sun.getDate()).padStart(2, "0")}`;
  return `${mStr} — ${sStr}`;
}

/* ── Component ── */

export function WeeklyScheduler() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [routines, setRoutines] = useState<RoutineBlock[]>(DEFAULT_ROUTINES);
  const [showSettings, setShowSettings] = useState(false);
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Schedule | null>(null);
  const [form, setForm] = useState({
    title: "", day_of_week: 0, start_hour: 9, end_hour: 10, category: "event",
    is_routine: false, specific_date: null as string | null,
  });
  const [formPos, setFormPos] = useState<{ x: number; y: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Drag — isDragging is state (not ref) so isDragSelected can read it
  // safely during render (refs would violate react-hooks rules-of-hooks).
  const [dragStart, setDragStart] = useState<{ day: number; hour: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ day: number; hour: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Week dates
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const isThisWeek = toISODate(getMonday(new Date())) === toISODate(weekStart);

  useEffect(() => {
    // One-time hydration of client-only routines from localStorage —
    // setState here is intentional. Same precedent as
    // weekly-calendar.tsx#categories. Suppress the rule.
    const saved = localStorage.getItem("oikbas-routines");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) { try { setRoutines(JSON.parse(saved)); } catch { /* */ } }
  }, []);

  function saveRoutines(blocks: RoutineBlock[]) {
    setRoutines(blocks);
    localStorage.setItem("oikbas-routines", JSON.stringify(blocks));
  }

  const load = useCallback(async () => {
    try {
      const d = await apiFetch<{ schedules?: Schedule[] }>("/api/schedules");
      if (d?.schedules) setSchedules(d.schedules);
    } catch {
      // 401 redirects, other errors leave schedules empty
    }
  }, []);

  // setState happens asynchronously inside load (after the await), not
  // synchronously in this effect body. Same precedent as
  // weekly-calendar.tsx#fetchData. Suppress the rule.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  // Filter schedules for current week
  function getSchedulesForDay(dayIdx: number): Schedule[] {
    const dateStr = toISODate(weekDates[dayIdx]);
    return schedules.filter((s) => {
      if (s.specific_date) return s.specific_date === dateStr;
      if (s.is_routine) return s.day_of_week === dayIdx;
      return s.day_of_week === dayIdx && !s.specific_date;
    });
  }

  // Routine bg lookup
  const routineBg: Record<number, string> = {};
  for (const r of routines) { for (let h = r.start; h < r.end; h++) routineBg[h] = r.color; }

  /* ── Drag ── */

  function handleMouseDown(dayIdx: number, hour: number, e: React.MouseEvent) {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ day: dayIdx, hour });
    setDragEnd({ day: dayIdx, hour });
  }

  function handleMouseEnter(dayIdx: number, hour: number) {
    if (isDragging && dragStart && dayIdx === dragStart.day) {
      setDragEnd({ day: dayIdx, hour });
    }
  }

  function handleMouseUp(e: React.MouseEvent) {
    if (!isDragging || !dragStart || !dragEnd) return;
    setIsDragging(false);
    if (dragStart.day === dragEnd.day) {
      const startH = Math.min(dragStart.hour, dragEnd.hour);
      const endH = Math.max(dragStart.hour, dragEnd.hour) + 1;
      const rect = gridRef.current?.getBoundingClientRect();
      const x = Math.min(e.clientX - (rect?.left || 0), 380);
      const y = Math.min(e.clientY - (rect?.top || 0), 320);
      const dateStr = toISODate(weekDates[dragStart.day]);
      setEditTarget(null);
      setForm({ title: "", day_of_week: dragStart.day, start_hour: startH, end_hour: Math.min(endH, 24), category: "event", is_routine: false, specific_date: dateStr });
      setFormPos({ x, y });
      setShowForm(true);
    }
    setDragStart(null);
    setDragEnd(null);
  }

  useEffect(() => {
    function up() { setIsDragging(false); setDragStart(null); setDragEnd(null); }
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, []);

  function isDragSelected(dayIdx: number, hour: number) {
    if (!isDragging || !dragStart || !dragEnd || dayIdx !== dragStart.day) return false;
    return hour >= Math.min(dragStart.hour, dragEnd.hour) && hour <= Math.max(dragStart.hour, dragEnd.hour);
  }

  function openEdit(s: Schedule) {
    setEditTarget(s);
    setForm({ title: s.title, day_of_week: s.day_of_week, start_hour: s.start_hour, end_hour: s.end_hour, category: s.category, is_routine: s.is_routine, specific_date: s.specific_date });
    setFormPos(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const payload = { ...form, specific_date: form.is_routine ? null : form.specific_date };
    try {
      if (editTarget) {
        await apiFetch("/api/schedules", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editTarget.id, ...payload }),
        });
      } else {
        await apiFetch("/api/schedules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
    } catch {
      // 401 redirects; other failures fall through to load() refresh
    }
    closeForm();
    load();
  }

  async function handleDelete(id: string) {
    try {
      await apiFetch(`/api/schedules?id=${id}`, { method: "DELETE" });
    } catch {
      // 401 redirects; other failures fall through to load() refresh
    }
    closeForm();
    load();
  }

  function closeForm() { setShowForm(false); setEditTarget(null); setFormPos(null); }

  /* ── Form ── */
  const formEl = showForm ? (
    <div className={`rounded-lg border border-border bg-card p-3 space-y-2 shadow-xl z-30 ${formPos ? "absolute" : ""}`} style={formPos ? { left: formPos.x, top: formPos.y, width: 280 } : undefined}>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">
            {editTarget ? "Edit" : "New"} — {DAY_LABELS[form.day_of_week]} {formatDate(weekDates[form.day_of_week])} {String(form.start_hour).padStart(2, "0")}:00~{form.end_hour === 24 ? "24" : String(form.end_hour).padStart(2, "0")}:00
          </span>
          <button type="button" onClick={closeForm} className="text-muted-foreground/50 hover:text-muted-foreground text-sm leading-none">&times;</button>
        </div>
        <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="What's happening?" required autoFocus className="w-full rounded border border-border bg-background px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-ring focus:outline-none" />
        <div className="grid grid-cols-2 gap-2">
          <select value={form.start_hour} onChange={(e) => setForm({ ...form, start_hour: Number(e.target.value) })} className="rounded border border-border bg-background px-1 py-1 text-xs text-foreground/80">
            {HOURS.map((h) => <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>)}
          </select>
          <select value={form.end_hour} onChange={(e) => setForm({ ...form, end_hour: Number(e.target.value) })} className="rounded border border-border bg-background px-1 py-1 text-xs text-foreground/80">
            {HOURS.filter((h) => h > form.start_hour).concat([24]).map((h) => <option key={h} value={h}>{h === 24 ? "24:00" : `${String(h).padStart(2, "0")}:00`}</option>)}
          </select>
        </div>
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground/80">
          <option value="event">Event</option>
          <option value="meeting">Meeting</option>
          <option value="workout">Workout</option>
          <option value="study">Study</option>
          <option value="routine">Routine</option>
        </select>
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-1.5">
            <input type="checkbox" checked={form.is_routine} onChange={(e) => setForm({ ...form, is_routine: e.target.checked })} className="rounded" />
            <span className="text-xs text-muted-foreground">Every week</span>
          </label>
          <div className="flex gap-1.5">
            {editTarget && <Button type="button" variant="destructive" size="xs" className="text-xs h-5" onClick={() => handleDelete(editTarget.id)}>Delete</Button>}
            <Button type="submit" size="xs" className="text-xs h-5">{editTarget ? "Save" : "Create"}</Button>
          </div>
        </div>
      </form>
    </div>
  ) : null;

  return (
    <Card className="border-border">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Weekly Schedule</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{schedules.length} events</span>
            <Button variant="outline" size="xs" className="text-xs h-5 border-border" onClick={() => setShowSettings(!showSettings)}>
              {showSettings ? "Close" : "Settings"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-3">
        {/* Week Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="xs" className="text-xs h-6 border-border px-2" onClick={() => setWeekStart(addDays(weekStart, -7))}>
            &larr; Prev
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-foreground/80">{formatWeekRange(weekStart)}</span>
            {!isThisWeek && (
              <Button variant="outline" size="xs" className="text-xs h-5 border-border" onClick={() => setWeekStart(getMonday(new Date()))}>
                Today
              </Button>
            )}
          </div>
          <Button variant="outline" size="xs" className="text-xs h-6 border-border px-2" onClick={() => setWeekStart(addDays(weekStart, 7))}>
            Next &rarr;
          </Button>
        </div>

        {showSettings && <RoutineSettings routines={routines} onSave={saveRoutines} />}
        {showForm && !formPos && formEl}

        {/* Grid */}
        <div className="overflow-x-auto rounded border border-border relative" ref={gridRef} onMouseUp={handleMouseUp}>
          {showForm && formPos && formEl}
          <div className="grid min-w-[640px]" style={{ gridTemplateColumns: "36px repeat(7, 1fr)" }}>
            {/* Header */}
            <div className="sticky top-0 bg-background border-b border-border h-8 z-10" />
            {weekDates.map((date, i) => {
              const isToday = toISODate(date) === toISODate(new Date());
              return (
                <div key={i} className={`sticky top-0 bg-background border-b border-border h-8 flex flex-col items-center justify-center z-10 ${isToday ? "!bg-primary/10" : ""}`}>
                  <span className={`text-xs font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>{DAY_LABELS[i]}</span>
                  <span className={`text-xs ${isToday ? "text-primary font-bold" : "text-muted-foreground/50"}`}>{formatDate(date)}</span>
                </div>
              );
            })}

            {/* Rows */}
            {HOURS.map((hour) => (
              <div key={hour} className="contents">
                <div className="flex items-start justify-end pr-1 text-xs text-muted-foreground/50 border-r border-border" style={{ height: CELL_H }}>
                  {String(hour).padStart(2, "0")}
                </div>
                {weekDates.map((date, dayIdx) => {
                  const bgClass = routineBg[hour] || "";
                  const isToday = toISODate(date) === toISODate(new Date());
                  const daySchedules = getSchedulesForDay(dayIdx);
                  const startsHere = daySchedules.filter((s) => Math.floor(s.start_hour) === hour);
                  const occupied = daySchedules.some((s) => s.start_hour <= hour && s.end_hour > hour);
                  return (
                    <div
                      key={dayIdx}
                      className={`relative border-b border-r border-border/30 select-none transition-colors ${bgClass} ${
                        isDragSelected(dayIdx, hour) ? "!bg-primary/30" : "hover:brightness-125"
                      } ${isToday ? "bg-primary/5" : ""} ${occupied ? "cursor-default" : "cursor-crosshair"}`}
                      style={{ height: CELL_H }}
                      onMouseDown={(e) => { if (!occupied) handleMouseDown(dayIdx, hour, e); }}
                      onMouseEnter={() => handleMouseEnter(dayIdx, hour)}
                    >
                      {startsHere.map((s) => {
                        const barH = (s.end_hour - s.start_hour) * CELL_H - 1;
                        const cat = CAT_COLORS[s.category] || CAT_COLORS.event;
                        return (
                          <div key={s.id} className={`absolute left-0.5 right-0.5 z-10 rounded-sm border-l-2 px-0.5 overflow-hidden cursor-pointer hover:brightness-125 ${cat}`}
                            style={{ top: 0, height: barH, minHeight: 10 }}
                            onClick={(e) => { e.stopPropagation(); openEdit(s); }}
                            title={`${s.title}\n${String(Math.floor(s.start_hour)).padStart(2, "0")}:00-${s.end_hour === 24 ? "24" : String(Math.floor(s.end_hour)).padStart(2, "0")}:00${s.is_routine ? " (weekly)" : ""}`}
                          >
                            <span className="text-[7px] text-white font-medium leading-none block truncate mt-px">{s.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {routines.filter((b, i, arr) => arr.findIndex((x) => x.label === b.label) === i).map((b) => (
            <div key={b.label + b.start} className="flex items-center gap-1"><span className={`h-1.5 w-1.5 rounded-sm ${b.color.split("/")[0]}`} /><span className="text-xs text-muted-foreground/50">{b.label}</span></div>
          ))}
          <span className="text-border">|</span>
          {Object.entries(CAT_COLORS).map(([cat, c]) => (
            <div key={cat} className="flex items-center gap-1"><span className={`h-1.5 w-1.5 rounded-sm ${c.split(" ")[0]}`} /><span className="text-xs text-muted-foreground/50">{cat}</span></div>
          ))}
          <span className="text-border">|</span>
          <span className="text-xs text-muted-foreground/50">Drag to create · ← → navigate weeks</span>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Routine Settings ── */

function RoutineSettings({ routines, onSave }: { routines: RoutineBlock[]; onSave: (b: RoutineBlock[]) => void }) {
  const [blocks, setBlocks] = useState<RoutineBlock[]>(routines);
  function update(i: number, f: keyof RoutineBlock, v: string | number) { const n = [...blocks]; n[i] = { ...n[i], [f]: v }; setBlocks(n); }
  return (
    <div className="rounded border border-border bg-card/50 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-foreground/80 font-medium">Background Time Blocks</span>
        <Button variant="outline" size="xs" className="text-xs h-5 border-border" onClick={() => setBlocks([...blocks, { label: "New", start: 0, end: 1, color: "bg-muted/40" }])}>+ Block</Button>
      </div>
      <div className="space-y-1.5">
        {blocks.map((b, i) => (
          <div key={i} className="grid grid-cols-[1fr_60px_60px_1fr_24px] gap-1.5 items-center">
            <input value={b.label} onChange={(e) => update(i, "label", e.target.value)} className="rounded border border-border bg-background px-1.5 py-0.5 text-xs text-foreground/80 focus:outline-none focus:border-ring" />
            <select value={b.start} onChange={(e) => update(i, "start", Number(e.target.value))} className="rounded border border-border bg-background px-0.5 py-0.5 text-xs text-foreground/80">
              {HOURS.map((h) => <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>)}
            </select>
            <select value={b.end} onChange={(e) => update(i, "end", Number(e.target.value))} className="rounded border border-border bg-background px-0.5 py-0.5 text-xs text-foreground/80">
              {HOURS.filter((h) => h > b.start).concat([24]).map((h) => <option key={h} value={h}>{h === 24 ? "24:00" : `${String(h).padStart(2, "0")}:00`}</option>)}
            </select>
            <select value={b.color} onChange={(e) => update(i, "color", e.target.value)} className="rounded border border-border bg-background px-0.5 py-0.5 text-xs text-foreground/80">
              {ROUTINE_COLORS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <button onClick={() => setBlocks(blocks.filter((_, j) => j !== i))} className="text-muted-foreground/50 hover:text-red-400 text-xs text-center">&times;</button>
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        <Button variant="outline" size="xs" className="text-xs h-5 border-border" onClick={() => { setBlocks(DEFAULT_ROUTINES); onSave(DEFAULT_ROUTINES); }}>Reset</Button>
        <Button size="xs" className="text-xs h-5" onClick={() => onSave(blocks)}>Apply</Button>
      </div>
    </div>
  );
}
