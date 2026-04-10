"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const CATEGORY_COLORS: Record<string, string> = {
  "업무": "bg-blue-500/30 border-blue-500/50 text-blue-200",
  "개발": "bg-emerald-500/30 border-emerald-500/50 text-emerald-200",
  "R&D": "bg-purple-500/30 border-purple-500/50 text-purple-200",
  "회의": "bg-orange-500/30 border-orange-500/50 text-orange-200",
  "학습": "bg-cyan-500/30 border-cyan-500/50 text-cyan-200",
  "운동": "bg-green-500/30 border-green-500/50 text-green-200",
  "식사": "bg-yellow-500/30 border-yellow-500/50 text-yellow-200",
  "휴식": "bg-neutral-500/30 border-neutral-500/50 text-neutral-300",
  "사이드": "bg-pink-500/30 border-pink-500/50 text-pink-200",
};

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6am - 11pm

function getColor(category: string) {
  return CATEGORY_COLORS[category] || "bg-primary/20 border-primary/40 text-primary";
}

export function WeeklyCalendar() {
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [baseDate, setBaseDate] = useState(() => {
    const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
    return now.toISOString().split("T")[0];
  });

  // Add block modal state
  const [adding, setAdding] = useState<{ date: string; hour: number } | null>(null);
  const [form, setForm] = useState({ endHour: "", category: "업무", memo: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/calendar?date=${baseDate}&_t=${Date.now()}`, { cache: "no-store" });
      const json = await res.json();
      setData(json);
    } catch {
      setData(null);
    }
    setLoading(false);
  }, [baseDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function shiftWeek(dir: number) {
    const d = new Date(baseDate + "T00:00:00");
    d.setDate(d.getDate() + dir * 7);
    setBaseDate(d.toISOString().split("T")[0]);
  }

  async function handleAddBlock() {
    if (!adding) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: adding.date,
          startHour: adding.hour,
          endHour: parseInt(form.endHour) || adding.hour + 1,
          category: form.category,
          memo: form.memo,
        }),
      });
      const result = await res.json();
      if (result.ok) {
        setAdding(null);
        setForm({ endHour: "", category: "업무", memo: "" });
        fetchData(); // refresh
      }
    } catch { /* ignore */ }
    setSubmitting(false);
  }

  const todayStr = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split("T")[0];

  if (loading) {
    return <div className="h-96 bg-muted/30 rounded-lg animate-pulse" />;
  }

  if (!data) {
    return <div className="text-muted-foreground text-sm">캘린더 로드 실패</div>;
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => shiftWeek(-1)}>← 이전</Button>
        <span className="text-sm font-medium">
          {data.week[0]} ~ {data.week[6]}
        </span>
        <Button variant="ghost" size="sm" onClick={() => shiftWeek(1)}>다음 →</Button>
      </div>

      {/* Add block modal */}
      {adding && (
        <Card className="border-primary/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{adding.date} {adding.hour}:00 ~ 타임블록 추가</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 items-end">
              <div>
                <label className="text-xs text-muted-foreground">종료</label>
                <Input
                  className="h-8 w-16 text-sm"
                  placeholder={String(adding.hour + 1)}
                  value={form.endHour}
                  onChange={(e) => setForm({ ...form, endHour: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">카테고리</label>
                <select
                  className="h-8 rounded-md border border-border bg-background px-2 text-sm"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {Object.keys(CATEGORY_COLORS).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">메모</label>
                <Input
                  className="h-8 text-sm"
                  placeholder="내용"
                  value={form.memo}
                  onChange={(e) => setForm({ ...form, memo: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleAddBlock()}
                />
              </div>
              <Button size="sm" className="h-8" disabled={submitting} onClick={handleAddBlock}>
                {submitting ? "..." : "추가"}
              </Button>
              <Button size="sm" variant="ghost" className="h-8" onClick={() => setAdding(null)}>취소</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar grid */}
      <div className="grid grid-cols-[48px_repeat(7,1fr)] gap-0 border border-neutral-800 rounded-lg overflow-hidden">
        {/* Header row */}
        <div className="bg-muted/30 p-1" />
        {data.days.map((day) => (
          <div
            key={day.date}
            className={`p-2 text-center border-l border-neutral-800 ${
              day.date === todayStr ? "bg-primary/10" : "bg-muted/30"
            }`}
          >
            <div className="text-xs font-medium">{day.day}</div>
            <div className={`text-lg tabular-nums ${day.date === todayStr ? "text-primary font-bold" : ""}`}>
              {parseInt(day.date.split("-")[2])}
            </div>
            {day.focus && (
              <div className="text-[10px] text-muted-foreground truncate mt-0.5" title={day.focus}>
                🎯 {day.focus}
              </div>
            )}
          </div>
        ))}

        {/* Hour rows */}
        {HOURS.map((hour) => (
          <>
            <div key={`h-${hour}`} className="text-[10px] text-muted-foreground text-right pr-1 py-2 border-t border-neutral-800/50">
              {hour}:00
            </div>
            {data.days.map((day) => {
              const block = day.blocks.find(
                (b) => b.startHour <= hour && b.endHour > hour
              );
              const isBlockStart = block && block.startHour === hour;
              const blockHeight = block ? block.endHour - block.startHour : 1;

              return (
                <div
                  key={`${day.date}-${hour}`}
                  className={`relative border-l border-t border-neutral-800/50 min-h-[32px] cursor-pointer hover:bg-muted/20 transition-colors ${
                    day.date === todayStr ? "bg-primary/5" : ""
                  }`}
                  onClick={() => {
                    if (!block) {
                      setAdding({ date: day.date, hour });
                      setForm({ endHour: String(hour + 1), category: "업무", memo: "" });
                    }
                  }}
                >
                  {isBlockStart && (
                    <div
                      className={`absolute inset-x-0.5 top-0 rounded border text-[10px] px-1 py-0.5 overflow-hidden ${getColor(block.category)}`}
                      style={{ height: `${blockHeight * 32}px`, zIndex: 10 }}
                    >
                      <div className="font-medium">{block.category}</div>
                      {block.memo && <div className="opacity-70 truncate">{block.memo}</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        ))}
      </div>

      {/* Category legend */}
      <div className="flex flex-wrap gap-2 text-xs">
        {Object.entries(CATEGORY_COLORS).map(([cat, cls]) => (
          <span key={cat} className={`px-2 py-0.5 rounded border ${cls}`}>{cat}</span>
        ))}
      </div>
    </div>
  );
}
