"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import type { TimeCategory, TimeEntry } from "@/lib/database.types";
import {
  DAY_COUNT,
  DAY_LABELS_KO,
  SLOT_COUNT,
  dateToSlot,
  formatDayDate,
  formatSlotTime,
  hexWithAlpha,
  slotToDate,
} from "@/lib/time/week";
import {
  createEntry,
  deleteEntry,
  updateEntry,
} from "@/lib/actions/time";
import { Button } from "@/components/ui/button";

/**
 * BlockGrid — 7×48 half-hour timebox grid.
 *
 * MVP behaviour:
 *   • Empty cell click  → popover: pick category + intensity + note → createEntry
 *   • Existing block click → popover: edit intensity/note/category, or delete
 *   • Today's column gets a subtle background tint
 *   • `main` entries render at full opacity; `buffer` entries at 0.45
 *   • Time labels every hour in the left gutter (00, 01, 02, ... 23)
 *
 * Out of scope (Phase 2): drag-to-span, multi-select, keyboard nav,
 * sleep-range collapse.
 */

const CELL_H = 18; // px per half-hour row
const HEADER_H = 44;
const TIME_COL = 64;

interface BlockGridProps {
  weekStartIso: string;
  categories: TimeCategory[];
  entries: TimeEntry[];
}

type Selection =
  | { kind: "empty"; dayIdx: number; slotIdx: number }
  | { kind: "entry"; entry: TimeEntry }
  | null;

export function BlockGrid({ weekStartIso, categories, entries }: BlockGridProps) {
  const router = useRouter();
  const weekStart = useMemo(() => new Date(weekStartIso), [weekStartIso]);
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Selection>(null);
  const [error, setError] = useState<string | null>(null);

  const catById = useMemo(
    () => new Map(categories.map((c) => [c.id, c] as const)),
    [categories]
  );

  /** grid[day][slot] → entry or null */
  const grid = useMemo(() => {
    const g: (TimeEntry | null)[][] = Array.from({ length: DAY_COUNT }, () =>
      Array<TimeEntry | null>(SLOT_COUNT).fill(null)
    );
    for (const e of entries) {
      const pos = dateToSlot(weekStart, new Date(e.slot_start));
      if (!pos) continue;
      const span = Math.max(1, Math.floor(e.duration_minutes / 30));
      for (let k = 0; k < span && pos.slotIndex + k < SLOT_COUNT; k++) {
        // Mark entry in its first cell; later cells share the ref so
        // we can render merged blocks but skip duplicated popover click.
        g[pos.dayIndex][pos.slotIndex + k] = e;
      }
    }
    return g;
  }, [entries, weekStart]);

  /** Today column index (0..6) or -1 if not in this week. */
  const todayDayIdx = useMemo(() => {
    const now = new Date();
    const pos = dateToSlot(weekStart, now);
    return pos ? pos.dayIndex : -1;
  }, [weekStart]);

  function run<T>(task: () => Promise<T>, onDone?: (r: T) => void) {
    setError(null);
    startTransition(async () => {
      try {
        const r = await task();
        onDone?.(r);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      }
    });
  }

  function handleEmptyCreate(dayIdx: number, slotIdx: number, catId: string) {
    const iso = slotToDate(weekStart, dayIdx, slotIdx).toISOString();
    run(
      () =>
        createEntry({
          slot_start: iso,
          category_id: catId,
          intensity: "main",
        }),
      () => setSelected(null)
    );
  }

  function handleEntryUpdate(
    id: string,
    patch: { category_id?: string; intensity?: "main" | "buffer"; note?: string | null }
  ) {
    run(() => updateEntry(id, patch), () => setSelected(null));
  }

  function handleDelete(id: string) {
    run(() => deleteEntry(id), () => setSelected(null));
  }

  return (
    <div className="relative">
      {error && (
        <div className="mb-3 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-md border border-border bg-background">
        <div
          className="grid min-w-[760px]"
          style={{
            gridTemplateColumns: `${TIME_COL}px repeat(${DAY_COUNT}, 1fr)`,
            gridTemplateRows: `${HEADER_H}px repeat(${SLOT_COUNT}, ${CELL_H}px)`,
          }}
        >
          {/* Header: empty corner + 7 day labels */}
          <div
            className="font-technical border-b border-r border-border bg-muted/30 text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
            style={{ gridColumn: "1 / span 1", gridRow: "1 / span 1" }}
          />
          {Array.from({ length: DAY_COUNT }).map((_, dayIdx) => {
            const isToday = dayIdx === todayDayIdx;
            return (
              <div
                key={`hdr-${dayIdx}`}
                className={`flex flex-col items-center justify-center border-b border-r border-border text-[11px] ${
                  isToday ? "bg-primary/10 text-foreground" : "bg-muted/30 text-muted-foreground"
                }`}
                style={{ gridColumn: `${dayIdx + 2} / span 1`, gridRow: "1 / span 1" }}
              >
                <span className="font-semibold">{DAY_LABELS_KO[dayIdx]}</span>
                <span className="font-technical tabular-nums text-[10px] opacity-70">
                  {formatDayDate(weekStart, dayIdx)}
                </span>
              </div>
            );
          })}

          {/* Time gutter + cells */}
          {Array.from({ length: SLOT_COUNT }).map((_, slotIdx) => {
            const rowNum = slotIdx + 2; // +2 because header is row 1
            const onHour = slotIdx % 2 === 0;
            return (
              <div
                key={`time-${slotIdx}`}
                className={`font-technical border-r border-border bg-muted/20 pr-2 pt-0 text-right text-[10px] tabular-nums text-muted-foreground ${
                  onHour ? "border-t" : ""
                }`}
                style={{ gridColumn: "1 / span 1", gridRow: `${rowNum} / span 1` }}
              >
                {onHour ? formatSlotTime(slotIdx) : ""}
              </div>
            );
          })}

          {Array.from({ length: DAY_COUNT }).flatMap((_, dayIdx) =>
            Array.from({ length: SLOT_COUNT }).map((_, slotIdx) => {
              const rowNum = slotIdx + 2;
              const colNum = dayIdx + 2;
              const entry = grid[dayIdx][slotIdx];
              const onHour = slotIdx % 2 === 0;
              const isTodayCol = dayIdx === todayDayIdx;

              // If this cell is a continuation of a multi-slot entry,
              // render nothing (first cell draws the whole block via
              // grid-row span).
              if (entry) {
                const pos = dateToSlot(weekStart, new Date(entry.slot_start));
                const isFirstCell =
                  pos && pos.dayIndex === dayIdx && pos.slotIndex === slotIdx;
                if (!isFirstCell) {
                  return null;
                }
                const span = Math.max(1, Math.floor(entry.duration_minutes / 30));
                const cat = entry.category_id ? catById.get(entry.category_id) : null;
                const color = cat?.color_hex ?? "#6b7280";
                const bg =
                  entry.intensity === "buffer"
                    ? hexWithAlpha(color, 0.35)
                    : hexWithAlpha(color, 0.85);
                return (
                  <button
                    key={`cell-${dayIdx}-${slotIdx}`}
                    type="button"
                    onClick={() => setSelected({ kind: "entry", entry })}
                    className="group relative overflow-hidden border-r border-border text-left"
                    style={{
                      gridColumn: `${colNum} / span 1`,
                      gridRow: `${rowNum} / span ${span}`,
                      background: bg,
                      borderTop: onHour
                        ? "1px solid var(--border)"
                        : "1px solid transparent",
                    }}
                  >
                    <span
                      className="font-technical block truncate px-1.5 pt-1 text-[10px] font-medium leading-tight"
                      style={{
                        color:
                          entry.intensity === "buffer"
                            ? "var(--muted-foreground)"
                            : "var(--foreground)",
                      }}
                      title={`${cat?.label ?? "(uncategorized)"}${entry.note ? ` — ${entry.note}` : ""}`}
                    >
                      {cat?.label ?? "—"}
                    </span>
                    {entry.note && span >= 2 && (
                      <span className="font-technical block truncate px-1.5 text-[9.5px] opacity-80">
                        {entry.note}
                      </span>
                    )}
                  </button>
                );
              }

              return (
                <button
                  key={`cell-${dayIdx}-${slotIdx}`}
                  type="button"
                  onClick={() => setSelected({ kind: "empty", dayIdx, slotIdx })}
                  className={`border-r border-border transition-colors hover:bg-primary/8 ${
                    isTodayCol ? "bg-primary/5" : ""
                  }`}
                  style={{
                    gridColumn: `${colNum} / span 1`,
                    gridRow: `${rowNum} / span 1`,
                    borderTop: onHour
                      ? "1px solid var(--border)"
                      : "1px solid transparent",
                  }}
                  aria-label={`${DAY_LABELS_KO[dayIdx]} ${formatSlotTime(slotIdx)} 슬롯 추가`}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Modal editor */}
      {selected && (
        <CellModal
          selection={selected}
          categories={categories}
          weekStart={weekStart}
          pending={pending}
          onClose={() => setSelected(null)}
          onCreate={handleEmptyCreate}
          onUpdate={handleEntryUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────

interface CellModalProps {
  selection: NonNullable<Selection>;
  categories: TimeCategory[];
  weekStart: Date;
  pending: boolean;
  onClose: () => void;
  onCreate: (dayIdx: number, slotIdx: number, catId: string) => void;
  onUpdate: (
    id: string,
    patch: { category_id?: string; intensity?: "main" | "buffer"; note?: string | null }
  ) => void;
  onDelete: (id: string) => void;
}

function CellModal({
  selection,
  categories,
  weekStart,
  pending,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: CellModalProps) {
  const isEntry = selection.kind === "entry";
  const entry = isEntry ? selection.entry : null;
  const currentCat =
    isEntry && entry?.category_id
      ? categories.find((c) => c.id === entry.category_id)
      : null;

  const dayIdx = isEntry
    ? dateToSlot(weekStart, new Date(entry!.slot_start))?.dayIndex ?? 0
    : (selection as { kind: "empty"; dayIdx: number; slotIdx: number }).dayIdx;
  const slotIdx = isEntry
    ? dateToSlot(weekStart, new Date(entry!.slot_start))?.slotIndex ?? 0
    : (selection as { kind: "empty"; dayIdx: number; slotIdx: number }).slotIdx;

  const slotLabel = `${DAY_LABELS_KO[dayIdx]} · ${formatDayDate(weekStart, dayIdx)} · ${formatSlotTime(
    slotIdx
  )}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm space-y-4 rounded-md border border-border bg-card p-5 shadow-xl"
      >
        <header className="flex items-start justify-between gap-3">
          <div>
            <p className="font-technical text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
              {isEntry ? "블록 편집" : "새 블록"}
            </p>
            <p className="mt-0.5 text-sm text-foreground">{slotLabel}</p>
          </div>
          {isEntry && entry && (
            <button
              type="button"
              onClick={() => onDelete(entry.id)}
              disabled={pending}
              aria-label="Delete"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          )}
        </header>

        {/* Category picker */}
        <div className="space-y-1.5">
          <p className="font-technical text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
            카테고리
          </p>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((c) => {
              const active = currentCat?.id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    if (isEntry && entry) {
                      onUpdate(entry.id, { category_id: c.id });
                    } else {
                      onCreate(dayIdx, slotIdx, c.id);
                    }
                  }}
                  className={`flex items-center gap-2 rounded-md border px-2.5 py-2 text-left text-[12.5px] transition-colors ${
                    active
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border hover:border-primary/50 hover:bg-muted"
                  }`}
                >
                  <span
                    className="inline-block h-3 w-3 rounded-[3px] border border-black/10"
                    style={{ background: c.color_hex }}
                  />
                  <span className="truncate">{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {isEntry && entry && (
          <>
            {/* Intensity toggle */}
            <div className="space-y-1.5">
              <p className="font-technical text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                강도
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => onUpdate(entry.id, { intensity: "main" })}
                  className={`flex-1 rounded-md border px-2.5 py-1.5 text-[12.5px] ${
                    entry.intensity === "main"
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Main (진한)
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => onUpdate(entry.id, { intensity: "buffer" })}
                  className={`flex-1 rounded-md border px-2.5 py-1.5 text-[12.5px] ${
                    entry.intensity === "buffer"
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Buffer (연한)
                </button>
              </div>
            </div>

            {/* Note */}
            <div className="space-y-1.5">
              <label
                htmlFor="entry-note"
                className="font-technical block text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground"
              >
                핵심 한 줄
              </label>
              <input
                id="entry-note"
                type="text"
                defaultValue={entry.note ?? ""}
                disabled={pending}
                placeholder="예: 디자인 리뷰, 러닝, …"
                onBlur={(e) => {
                  const v = e.target.value.trim() || null;
                  if (v !== (entry.note ?? null)) {
                    onUpdate(entry.id, { note: v });
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                }}
                className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
          </>
        )}

        <footer className="flex justify-end">
          <Button variant="secondary" size="default" onClick={onClose} disabled={pending}>
            닫기
          </Button>
        </footer>
      </div>
    </div>
  );
}
