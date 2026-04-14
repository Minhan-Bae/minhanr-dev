"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/api-fetch";

interface WeeklyReviewResponse {
  exists: boolean;
  week: string;
  path: string;
  alive?: string;
  waning?: string;
  next_focus?: string;
}

interface TimeBlock {
  date: string;
  startHour: number;
  endHour: number;
  category: string;
  memo: string;
}

interface DayData {
  date: string;
  blocks: TimeBlock[];
}

interface CalendarData {
  week: string[];
  days: DayData[];
}

interface WeeklyReviewFormProps {
  week: string;
  monday: string;
}

export function WeeklyReviewForm({ week, monday }: WeeklyReviewFormProps) {
  const [loading, setLoading] = useState(true);
  const [alive, setAlive] = useState("");
  const [waning, setWaning] = useState("");
  const [nextFocus, setNextFocus] = useState("");
  const [exists, setExists] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [blocks, setBlocks] = useState<{ total: number; byCat: Record<string, number> }>({ total: 0, byCat: {} });

  useEffect(() => {
    (async () => {
      try {
        const [review, cal] = await Promise.all([
          apiFetch<WeeklyReviewResponse>(`/api/review/weekly?week=${week}`, { cache: "no-store" }),
          apiFetch<CalendarData>(`/api/calendar?date=${monday}&range=week&_t=${Date.now()}`, { cache: "no-store" }),
        ]);
        if (review.exists) {
          setAlive(review.alive || "");
          setWaning(review.waning || "");
          setNextFocus(review.next_focus || "");
          setExists(true);
        }
        let total = 0;
        const byCat: Record<string, number> = {};
        for (const day of cal.days || []) {
          for (const b of day.blocks || []) {
            const hours = Math.max(0, b.endHour - b.startHour);
            total += hours;
            byCat[b.category] = (byCat[b.category] || 0) + hours;
          }
        }
        setBlocks({ total, byCat });
      } catch {
        // ignore — form still usable
      } finally {
        setLoading(false);
      }
    })();
  }, [week, monday]);

  async function onSave() {
    setSaving(true);
    setSaved(false);
    try {
      await apiFetch(`/api/review/weekly`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week, alive, waning, next_focus: nextFocus }),
      });
      setExists(true);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2400);
    } catch (e) {
      alert(e instanceof Error ? e.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  }

  const topCats = Object.entries(blocks.byCat)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">이번주 타임블록</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-xs text-muted-foreground">집계 중…</p>
          ) : blocks.total === 0 ? (
            <p className="text-xs text-muted-foreground">기록된 타임블록 없음</p>
          ) : (
            <div className="space-y-2">
              <div className="text-2xl font-bold tabular-nums">{blocks.total}h</div>
              <div className="flex flex-wrap gap-2 text-xs">
                {topCats.map(([cat, hrs]) => (
                  <span
                    key={cat}
                    className="rounded-md border border-border bg-card px-2 py-1 tabular-nums"
                  >
                    {cat} · {hrs}h
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            회고 질문 {exists && <span className="text-xs text-muted-foreground font-normal">(이번 주 작성됨 — 수정 저장 가능)</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">1. 무엇이 살아있었나</label>
            <textarea
              value={alive}
              onChange={(e) => setAlive(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="이번 주 에너지가 집중된 것"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">2. 무엇이 시들었나</label>
            <textarea
              value={waning}
              onChange={(e) => setWaning(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="의도했지만 진전 없었던 것 — 판단 없이"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">3. 다음 주 한 가지만 고른다면</label>
            <textarea
              value={nextFocus}
              onChange={(e) => setNextFocus(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="단 하나의 anchor"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={onSave} disabled={saving || loading}>
              {saving ? "저장 중…" : exists ? "수정 저장" : "저장"}
            </Button>
            {saved && <span className="text-xs text-primary">✓ 저장됨</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
