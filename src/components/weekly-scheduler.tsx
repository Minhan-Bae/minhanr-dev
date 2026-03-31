"use client";

import { useEffect, useState, useCallback } from "react";
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

/* ── Constants ── */

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const CELL_H = 24; // px per hour

const ROUTINE_BG: Record<number, string> = {};
// Sleep 0-6, Work 9-18, Rest 18-23, Sleep 23-24
for (let h = 0; h < 6; h++) ROUTINE_BG[h] = "bg-indigo-950/50";
for (let h = 23; h < 24; h++) ROUTINE_BG[h] = "bg-indigo-950/50";
for (let h = 9; h < 18; h++) ROUTINE_BG[h] = "bg-emerald-950/30";
for (let h = 18; h < 23; h++) ROUTINE_BG[h] = "bg-purple-950/30";

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
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Schedule | null>(null);
  const [form, setForm] = useState({
    title: "",
    day_of_week: 0,
    start_hour: 9,
    end_hour: 10,
    category: "event",
    is_routine: false,
  });

  // Drag state
  const [dragStart, setDragStart] = useState<{ day: number; hour: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ day: number; hour: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/schedules");
    const d = await res.json();
    if (d.schedules) setSchedules(d.schedules);
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleMouseDown(day: number, hour: number) {
    setDragStart({ day, hour });
    setDragEnd({ day, hour });
    setIsDragging(true);
  }

  function handleMouseEnter(day: number, hour: number) {
    if (isDragging && dragStart && day === dragStart.day) {
      setDragEnd({ day, hour });
    }
  }

  function handleMouseUp() {
    if (isDragging && dragStart && dragEnd && dragStart.day === dragEnd.day) {
      const startH = Math.min(dragStart.hour, dragEnd.hour);
      const endH = Math.max(dragStart.hour, dragEnd.hour) + 1;
      openCreate(dragStart.day, startH, endH);
    }
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  }

  useEffect(() => {
    function up() { handleMouseUp(); }
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  });

  function isDragSelected(day: number, hour: number) {
    if (!isDragging || !dragStart || !dragEnd || day !== dragStart.day) return false;
    const minH = Math.min(dragStart.hour, dragEnd.hour);
    const maxH = Math.max(dragStart.hour, dragEnd.hour);
    return hour >= minH && hour <= maxH;
  }

  function openCreate(day: number, hour: number, endHour?: number) {
    setEditTarget(null);
    setForm({ title: "", day_of_week: day, start_hour: hour, end_hour: Math.min(endHour ?? hour + 1, 24), category: "event", is_routine: false });
    setShowForm(true);
  }

  function openEdit(s: Schedule) {
    setEditTarget(s);
    setForm({ title: s.title, day_of_week: s.day_of_week, start_hour: s.start_hour, end_hour: s.end_hour, category: s.category, is_routine: s.is_routine });
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
    load();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/schedules?id=${id}`, { method: "DELETE" });
    setShowForm(false);
    setEditTarget(null);
    load();
  }

  // Group schedules by day
  const byDay: Record<number, Schedule[]> = {};
  for (const s of schedules) {
    if (!byDay[s.day_of_week]) byDay[s.day_of_week] = [];
    byDay[s.day_of_week].push(s);
  }

  return (
    <Card className="border-neutral-800">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Weekly Schedule</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-neutral-500">{schedules.length} events</span>
            <Button
              variant="outline"
              size="xs"
              className="text-[9px] h-5 border-neutral-700"
              onClick={() => openCreate(0, 9)}
            >
              + Add
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-3">
        {/* Inline Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="rounded border border-neutral-700 bg-neutral-900 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-neutral-400">{editTarget ? "Edit" : "New"} Schedule</span>
              <button type="button" onClick={() => { setShowForm(false); setEditTarget(null); }} className="text-neutral-600 hover:text-neutral-400 text-xs">&times;</button>
            </div>
            <input
              type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Title..." required
              className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:border-blue-500 focus:outline-none"
            />
            <div className="grid grid-cols-4 gap-2">
              <select value={form.day_of_week} onChange={(e) => setForm({ ...form, day_of_week: Number(e.target.value) })} className="rounded border border-neutral-700 bg-neutral-950 px-1 py-1 text-[10px] text-neutral-300">
                {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
              </select>
              <select value={form.start_hour} onChange={(e) => setForm({ ...form, start_hour: Number(e.target.value) })} className="rounded border border-neutral-700 bg-neutral-950 px-1 py-1 text-[10px] text-neutral-300">
                {HOURS.map((h) => <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>)}
              </select>
              <select value={form.end_hour} onChange={(e) => setForm({ ...form, end_hour: Number(e.target.value) })} className="rounded border border-neutral-700 bg-neutral-950 px-1 py-1 text-[10px] text-neutral-300">
                {HOURS.filter((h) => h > form.start_hour).concat([24]).map((h) => (
                  <option key={h} value={h}>{h === 24 ? "24:00" : `${String(h).padStart(2, "0")}:00`}</option>
                ))}
              </select>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded border border-neutral-700 bg-neutral-950 px-1 py-1 text-[10px] text-neutral-300">
                <option value="event">Event</option>
                <option value="meeting">Meeting</option>
                <option value="workout">Workout</option>
                <option value="study">Study</option>
                <option value="routine">Routine</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5">
                <input type="checkbox" checked={form.is_routine} onChange={(e) => setForm({ ...form, is_routine: e.target.checked })} className="rounded" />
                <span className="text-[10px] text-neutral-400">Weekly repeat</span>
              </label>
              <div className="flex gap-2">
                {editTarget && (
                  <Button type="button" variant="destructive" size="xs" className="text-[9px] h-5" onClick={() => handleDelete(editTarget.id)}>Delete</Button>
                )}
                <Button type="submit" size="xs" className="text-[9px] h-5">{editTarget ? "Save" : "Add"}</Button>
              </div>
            </div>
          </form>
        )}

        {/* Grid */}
        <div className="overflow-x-auto rounded border border-neutral-800">
          <div className="grid min-w-[640px]" style={{ gridTemplateColumns: "36px repeat(7, 1fr)" }}>
            {/* Header */}
            <div className="sticky top-0 bg-neutral-950 border-b border-neutral-800 h-5" />
            {DAYS.map((day) => (
              <div key={day} className="sticky top-0 bg-neutral-950 border-b border-neutral-800 h-5 flex items-center justify-center text-[9px] font-medium text-neutral-400">
                {day}
              </div>
            ))}

            {/* Hour rows */}
            {HOURS.map((hour) => (
              <div key={hour} className="contents">
                <div
                  className="flex items-start justify-end pr-1 text-[8px] text-neutral-600 border-r border-neutral-800/60"
                  style={{ height: CELL_H }}
                >
                  {String(hour).padStart(2, "0")}
                </div>
                {DAYS.map((_, dayIdx) => {
                  const bgClass = ROUTINE_BG[hour] || "";
                  const cellSchedules = (byDay[dayIdx] || []).filter(
                    (s) => s.start_hour <= hour && s.end_hour > hour
                  );
                  const startsHere = (byDay[dayIdx] || []).filter(
                    (s) => Math.floor(s.start_hour) === hour
                  );
                  return (
                    <div
                      key={dayIdx}
                      className={`relative border-b border-r border-neutral-800/30 cursor-crosshair select-none transition-colors ${bgClass} ${
                        isDragSelected(dayIdx, hour) ? "!bg-blue-500/30" : "hover:brightness-125"
                      }`}
                      style={{ height: CELL_H }}
                      onMouseDown={(e) => { e.preventDefault(); if (cellSchedules.length === 0) handleMouseDown(dayIdx, hour); }}
                      onMouseEnter={() => handleMouseEnter(dayIdx, hour)}
                    >
                      {startsHere.map((s) => {
                        const spanHours = s.end_hour - s.start_hour;
                        const topOffset = (s.start_hour - Math.floor(s.start_hour)) * CELL_H;
                        const barHeight = spanHours * CELL_H - 1;
                        const cat = CAT_COLORS[s.category] || CAT_COLORS.event;
                        return (
                          <div
                            key={s.id}
                            className={`absolute left-0.5 right-0.5 z-10 rounded-sm border-l-2 px-0.5 overflow-hidden cursor-pointer hover:brightness-125 ${cat}`}
                            style={{ top: topOffset, height: barHeight, minHeight: 10 }}
                            onClick={(e) => { e.stopPropagation(); openEdit(s); }}
                            title={`${s.title}\n${String(Math.floor(s.start_hour)).padStart(2, "0")}:${s.start_hour % 1 ? "30" : "00"} - ${String(Math.floor(s.end_hour)).padStart(2, "0")}:${s.end_hour % 1 ? "30" : "00"}`}
                          >
                            <span className="text-[7px] text-white font-medium leading-none block truncate mt-px">
                              {s.title}
                            </span>
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
          <div className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-sm bg-indigo-900" /><span className="text-[8px] text-neutral-600">Sleep</span></div>
          <div className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-sm bg-emerald-900" /><span className="text-[8px] text-neutral-600">Work</span></div>
          <div className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-sm bg-purple-900" /><span className="text-[8px] text-neutral-600">Rest</span></div>
          <span className="text-neutral-800">|</span>
          {Object.entries(CAT_COLORS).map(([cat, c]) => (
            <div key={cat} className="flex items-center gap-1"><span className={`h-1.5 w-1.5 rounded-sm ${c.split(" ")[0]}`} /><span className="text-[8px] text-neutral-600">{cat}</span></div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
