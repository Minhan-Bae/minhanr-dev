"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
}

interface RoutineBlock {
  label: string;
  start: number;
  end: number;
  color: string;
}

/* ── Constants ── */

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const CELL_H = 24;

const DEFAULT_ROUTINES: RoutineBlock[] = [
  { label: "수면", start: 0, end: 6, color: "bg-indigo-950/50" },
  { label: "출근", start: 6, end: 9, color: "bg-neutral-900/40" },
  { label: "업무", start: 9, end: 18, color: "bg-emerald-950/30" },
  { label: "휴식", start: 18, end: 23, color: "bg-purple-950/30" },
  { label: "수면", start: 23, end: 24, color: "bg-indigo-950/50" },
];

const ROUTINE_COLORS = [
  { label: "남색 (수면)", value: "bg-indigo-950/50" },
  { label: "초록 (업무)", value: "bg-emerald-950/30" },
  { label: "보라 (휴식)", value: "bg-purple-950/30" },
  { label: "회색", value: "bg-neutral-900/40" },
  { label: "주황", value: "bg-orange-950/30" },
  { label: "빨강", value: "bg-red-950/30" },
  { label: "없음", value: "" },
];

const CAT_COLORS: Record<string, string> = {
  event: "bg-blue-500 border-blue-400",
  meeting: "bg-orange-500 border-orange-400",
  workout: "bg-green-500 border-green-400",
  study: "bg-cyan-500 border-cyan-400",
  routine: "bg-neutral-600 border-neutral-400",
};

/* ── Component ── */

export function WeeklyScheduler() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [routines, setRoutines] = useState<RoutineBlock[]>(DEFAULT_ROUTINES);
  const [showSettings, setShowSettings] = useState(false);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Schedule | null>(null);
  const [form, setForm] = useState({
    title: "", day_of_week: 0, start_hour: 9, end_hour: 10, category: "event", is_routine: false,
  });
  const [formPos, setFormPos] = useState<{ x: number; y: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Drag state
  const [dragStart, setDragStart] = useState<{ day: number; hour: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ day: number; hour: number } | null>(null);
  const isDragging = useRef(false);

  // Load routines from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("oikbas-routines");
    if (saved) {
      try { setRoutines(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  function saveRoutines(blocks: RoutineBlock[]) {
    setRoutines(blocks);
    localStorage.setItem("oikbas-routines", JSON.stringify(blocks));
  }

  const load = useCallback(async () => {
    const res = await fetch("/api/schedules");
    const d = await res.json();
    if (d.schedules) setSchedules(d.schedules);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Build routine bg lookup
  const routineBg: Record<number, string> = {};
  for (const r of routines) {
    for (let h = r.start; h < r.end; h++) {
      routineBg[h] = r.color;
    }
  }

  // Group schedules by day
  const byDay: Record<number, Schedule[]> = {};
  for (const s of schedules) {
    if (!byDay[s.day_of_week]) byDay[s.day_of_week] = [];
    byDay[s.day_of_week].push(s);
  }

  /* ── Drag handlers ── */

  function handleMouseDown(day: number, hour: number, e: React.MouseEvent) {
    e.preventDefault();
    isDragging.current = true;
    setDragStart({ day, hour });
    setDragEnd({ day, hour });
  }

  function handleMouseEnter(day: number, hour: number) {
    if (isDragging.current && dragStart && day === dragStart.day) {
      setDragEnd({ day, hour });
    }
  }

  function handleMouseUp(e: React.MouseEvent) {
    if (!isDragging.current || !dragStart || !dragEnd) return;
    isDragging.current = false;

    if (dragStart.day === dragEnd.day) {
      const startH = Math.min(dragStart.hour, dragEnd.hour);
      const endH = Math.max(dragStart.hour, dragEnd.hour) + 1;

      // Position form near mouse
      const rect = gridRef.current?.getBoundingClientRect();
      const x = e.clientX - (rect?.left || 0);
      const y = e.clientY - (rect?.top || 0);

      setEditTarget(null);
      setForm({
        title: "", day_of_week: dragStart.day,
        start_hour: startH, end_hour: Math.min(endH, 24),
        category: "event", is_routine: false,
      });
      setFormPos({ x: Math.min(x, 400), y: Math.min(y, 300) });
      setShowForm(true);
    }

    setDragStart(null);
    setDragEnd(null);
  }

  useEffect(() => {
    function globalUp() {
      isDragging.current = false;
      setDragStart(null);
      setDragEnd(null);
    }
    window.addEventListener("mouseup", globalUp);
    return () => window.removeEventListener("mouseup", globalUp);
  }, []);

  function isDragSelected(day: number, hour: number) {
    if (!isDragging.current || !dragStart || !dragEnd || day !== dragStart.day) return false;
    const minH = Math.min(dragStart.hour, dragEnd.hour);
    const maxH = Math.max(dragStart.hour, dragEnd.hour);
    return hour >= minH && hour <= maxH;
  }

  function openEdit(s: Schedule) {
    setEditTarget(s);
    setForm({
      title: s.title, day_of_week: s.day_of_week,
      start_hour: s.start_hour, end_hour: s.end_hour,
      category: s.category, is_routine: s.is_routine,
    });
    setFormPos(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (editTarget) {
      await fetch("/api/schedules", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editTarget.id, ...form }) });
    } else {
      await fetch("/api/schedules", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    }
    setShowForm(false);
    setEditTarget(null);
    setFormPos(null);
    load();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/schedules?id=${id}`, { method: "DELETE" });
    setShowForm(false);
    setEditTarget(null);
    setFormPos(null);
    load();
  }

  /* ── Form Component (Popover or Inline) ── */
  const formEl = showForm ? (
    <div
      className={`rounded-lg border border-neutral-700 bg-neutral-900 p-3 space-y-2 shadow-xl z-20 ${
        formPos ? "absolute" : ""
      }`}
      style={formPos ? { left: formPos.x, top: formPos.y, width: 280 } : undefined}
    >
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-neutral-400 font-medium">
            {editTarget ? "Edit" : "New"} — {DAYS[form.day_of_week]} {String(form.start_hour).padStart(2, "0")}:00 ~ {form.end_hour === 24 ? "24" : String(form.end_hour).padStart(2, "0")}:00
          </span>
          <button type="button" onClick={() => { setShowForm(false); setFormPos(null); }} className="text-neutral-600 hover:text-neutral-400 text-sm leading-none">&times;</button>
        </div>
        <input
          type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="What's happening?" required autoFocus
          className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:border-blue-500 focus:outline-none"
        />
        <div className="grid grid-cols-2 gap-2">
          <select value={form.start_hour} onChange={(e) => setForm({ ...form, start_hour: Number(e.target.value) })} className="rounded border border-neutral-700 bg-neutral-950 px-1 py-1 text-[10px] text-neutral-300">
            {HOURS.map((h) => <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>)}
          </select>
          <select value={form.end_hour} onChange={(e) => setForm({ ...form, end_hour: Number(e.target.value) })} className="rounded border border-neutral-700 bg-neutral-950 px-1 py-1 text-[10px] text-neutral-300">
            {HOURS.filter((h) => h > form.start_hour).concat([24]).map((h) => (
              <option key={h} value={h}>{h === 24 ? "24:00" : `${String(h).padStart(2, "0")}:00`}</option>
            ))}
          </select>
        </div>
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-[10px] text-neutral-300">
          <option value="event">Event</option>
          <option value="meeting">Meeting</option>
          <option value="workout">Workout</option>
          <option value="study">Study</option>
          <option value="routine">Routine</option>
        </select>
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-1.5">
            <input type="checkbox" checked={form.is_routine} onChange={(e) => setForm({ ...form, is_routine: e.target.checked })} className="rounded" />
            <span className="text-[10px] text-neutral-400">Repeat weekly</span>
          </label>
          <div className="flex gap-1.5">
            {editTarget && (
              <Button type="button" variant="destructive" size="xs" className="text-[9px] h-5" onClick={() => handleDelete(editTarget.id)}>Delete</Button>
            )}
            <Button type="submit" size="xs" className="text-[9px] h-5">{editTarget ? "Save" : "Create"}</Button>
          </div>
        </div>
      </form>
    </div>
  ) : null;

  return (
    <Card className="border-neutral-800">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Weekly Schedule</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-neutral-500">{schedules.length} events</span>
            <Button variant="outline" size="xs" className="text-[9px] h-5 border-neutral-700" onClick={() => setShowSettings(!showSettings)}>
              {showSettings ? "Close" : "Settings"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-3">
        {/* Background block settings */}
        {showSettings && (
          <RoutineSettings routines={routines} onSave={saveRoutines} />
        )}

        {/* Inline form (when editing existing or no position) */}
        {showForm && !formPos && formEl}

        {/* Grid */}
        <div className="overflow-x-auto rounded border border-neutral-800 relative" ref={gridRef} onMouseUp={handleMouseUp}>
          {/* Floating form popover */}
          {showForm && formPos && formEl}

          <div className="grid min-w-[640px]" style={{ gridTemplateColumns: "36px repeat(7, 1fr)" }}>
            {/* Header */}
            <div className="sticky top-0 bg-neutral-950 border-b border-neutral-800 h-5 z-10" />
            {DAYS.map((day) => (
              <div key={day} className="sticky top-0 bg-neutral-950 border-b border-neutral-800 h-5 flex items-center justify-center text-[9px] font-medium text-neutral-400 z-10">
                {day}
              </div>
            ))}

            {/* Rows */}
            {HOURS.map((hour) => (
              <div key={hour} className="contents">
                <div className="flex items-start justify-end pr-1 text-[8px] text-neutral-600 border-r border-neutral-800/60" style={{ height: CELL_H }}>
                  {String(hour).padStart(2, "0")}
                </div>
                {DAYS.map((_, dayIdx) => {
                  const bgClass = routineBg[hour] || "";
                  const startsHere = (byDay[dayIdx] || []).filter((s) => Math.floor(s.start_hour) === hour);
                  const occupied = (byDay[dayIdx] || []).some((s) => s.start_hour <= hour && s.end_hour > hour);
                  return (
                    <div
                      key={dayIdx}
                      className={`relative border-b border-r border-neutral-800/30 select-none transition-colors ${bgClass} ${
                        isDragSelected(dayIdx, hour) ? "!bg-blue-500/30" : "hover:brightness-125"
                      } ${occupied ? "cursor-default" : "cursor-crosshair"}`}
                      style={{ height: CELL_H }}
                      onMouseDown={(e) => { if (!occupied) handleMouseDown(dayIdx, hour, e); }}
                      onMouseEnter={() => handleMouseEnter(dayIdx, hour)}
                    >
                      {startsHere.map((s) => {
                        const barH = (s.end_hour - s.start_hour) * CELL_H - 1;
                        const cat = CAT_COLORS[s.category] || CAT_COLORS.event;
                        return (
                          <div
                            key={s.id}
                            className={`absolute left-0.5 right-0.5 z-10 rounded-sm border-l-2 px-0.5 overflow-hidden cursor-pointer hover:brightness-125 ${cat}`}
                            style={{ top: 0, height: barH, minHeight: 10 }}
                            onClick={(e) => { e.stopPropagation(); openEdit(s); }}
                            title={`${s.title}\n${String(Math.floor(s.start_hour)).padStart(2, "0")}:00 - ${s.end_hour === 24 ? "24" : String(Math.floor(s.end_hour)).padStart(2, "0")}:00`}
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
            <div key={b.label + b.start} className="flex items-center gap-1"><span className={`h-1.5 w-1.5 rounded-sm ${b.color.split("/")[0]}`} /><span className="text-[8px] text-neutral-600">{b.label}</span></div>
          ))}
          <span className="text-neutral-800">|</span>
          {Object.entries(CAT_COLORS).map(([cat, c]) => (
            <div key={cat} className="flex items-center gap-1"><span className={`h-1.5 w-1.5 rounded-sm ${c.split(" ")[0]}`} /><span className="text-[8px] text-neutral-600">{cat}</span></div>
          ))}
          <span className="text-neutral-800">|</span>
          <span className="text-[8px] text-neutral-600">Drag to create</span>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Routine Block Settings ── */

function RoutineSettings({
  routines,
  onSave,
}: {
  routines: RoutineBlock[];
  onSave: (blocks: RoutineBlock[]) => void;
}) {
  const [blocks, setBlocks] = useState<RoutineBlock[]>(routines);

  function updateBlock(idx: number, field: keyof RoutineBlock, value: string | number) {
    const next = [...blocks];
    next[idx] = { ...next[idx], [field]: value };
    setBlocks(next);
  }

  function addBlock() {
    setBlocks([...blocks, { label: "New", start: 0, end: 1, color: "bg-neutral-900/40" }]);
  }

  function removeBlock(idx: number) {
    setBlocks(blocks.filter((_, i) => i !== idx));
  }

  return (
    <div className="rounded border border-neutral-700 bg-neutral-900/50 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-neutral-300 font-medium">Background Time Blocks</span>
        <Button variant="outline" size="xs" className="text-[9px] h-5 border-neutral-700" onClick={addBlock}>+ Block</Button>
      </div>
      <div className="space-y-1.5">
        {blocks.map((b, i) => (
          <div key={i} className="grid grid-cols-[1fr_60px_60px_1fr_24px] gap-1.5 items-center">
            <input
              value={b.label} onChange={(e) => updateBlock(i, "label", e.target.value)}
              className="rounded border border-neutral-700 bg-neutral-950 px-1.5 py-0.5 text-[10px] text-neutral-300 focus:outline-none focus:border-blue-500"
            />
            <select value={b.start} onChange={(e) => updateBlock(i, "start", Number(e.target.value))} className="rounded border border-neutral-700 bg-neutral-950 px-0.5 py-0.5 text-[9px] text-neutral-300">
              {HOURS.map((h) => <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>)}
            </select>
            <select value={b.end} onChange={(e) => updateBlock(i, "end", Number(e.target.value))} className="rounded border border-neutral-700 bg-neutral-950 px-0.5 py-0.5 text-[9px] text-neutral-300">
              {HOURS.filter((h) => h > b.start).concat([24]).map((h) => <option key={h} value={h}>{h === 24 ? "24:00" : `${String(h).padStart(2, "0")}:00`}</option>)}
            </select>
            <select value={b.color} onChange={(e) => updateBlock(i, "color", e.target.value)} className="rounded border border-neutral-700 bg-neutral-950 px-0.5 py-0.5 text-[9px] text-neutral-300">
              {ROUTINE_COLORS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <button onClick={() => removeBlock(i)} className="text-neutral-600 hover:text-red-400 text-[10px] text-center">&times;</button>
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        <Button variant="outline" size="xs" className="text-[9px] h-5 border-neutral-700" onClick={() => { setBlocks(DEFAULT_ROUTINES); onSave(DEFAULT_ROUTINES); }}>Reset</Button>
        <Button size="xs" className="text-[9px] h-5" onClick={() => onSave(blocks)}>Apply</Button>
      </div>
    </div>
  );
}
