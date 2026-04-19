"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronsDown, ChevronsUp, Trash2 } from "lucide-react";
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
 * BlockGrid — 7×48 half-hour timebox grid (Phase B).
 *
 * Additions over Phase 1:
 *   • Drag-to-span: pointerdown on an empty cell, drag within the
 *     same day column, release to open the modal with the full span
 *     pre-computed. Cross-day drags snap to the start column.
 *   • Sleep-hour compression: slots 02–15 (01:00–07:30) fold into a
 *     single row by default; toggle to expand. Persists per-browser
 *     via localStorage.
 *   • Continuous entries (duration > 30 min) render as a single
 *     merged block spanning their grid-rows, as before.
 *
 * Out of scope (Phase C):
 *   • Mobile single-day view (currently horizontal-scroll)
 *   • Keyboard selection / multi-select
 *   • Drag the edges of existing entries to resize
 */

const CELL_H = 18; // px per half-hour row
const COMPRESSED_H = 28;
const HEADER_H = 44;
const TIME_COL = 64;

// Slots that hide under sleep-compression (01:00–07:30 inclusive).
const SLEEP_SLOT_START = 2; // 01:00
const SLEEP_SLOT_END = 15; // 07:30 (inclusive)

const STORAGE_KEY_COMPRESS = "minhanr.calendar.compressSleep";

interface BlockGridProps {
  weekStartIso: string;
  categories: TimeCategory[];
  entries: TimeEntry[];
}

type Selection =
  | { kind: "empty"; dayIdx: number; slotIdx: number; span: number }
  | { kind: "entry"; entry: TimeEntry }
  | null;

export function BlockGrid({ weekStartIso, categories, entries }: BlockGridProps) {
  const router = useRouter();
  const weekStart = useMemo(() => new Date(weekStartIso), [weekStartIso]);
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Selection>(null);
  const [error, setError] = useState<string | null>(null);

  // Sleep compression — default collapsed, user can toggle.
  const [compressSleep, setCompressSleep] = useState(true);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_COMPRESS);
      if (stored === "0") setCompressSleep(false);
      if (stored === "1") setCompressSleep(true);
    } catch {
      /* ignore */
    }
  }, []);
  function toggleCompress() {
    setCompressSleep((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY_COMPRESS, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  // Active drag selection — { dayIdx, startSlot, endSlot }. endSlot is
  // exclusive-like (we render inclusive highlight from min..max).
  //
  // dragRef mirrors the state so pointermove→pointerup can read the
  // latest currentSlot synchronously. Without the ref, the pointerup
  // handler was closing over a stale `drag` from the render when the
  // useEffect attached its listeners — every drag committed with
  // span=1 because currentSlot was still startSlot in that closure.
  type DragState = { dayIdx: number; startSlot: number; currentSlot: number };
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);

  const catById = useMemo(
    () => new Map(categories.map((c) => [c.id, c] as const)),
    [categories]
  );

  /** grid[day][slot] — the entry occupying that cell (or null). */
  const grid = useMemo(() => {
    const g: (TimeEntry | null)[][] = Array.from({ length: DAY_COUNT }, () =>
      Array<TimeEntry | null>(SLOT_COUNT).fill(null)
    );
    for (const e of entries) {
      const pos = dateToSlot(weekStart, new Date(e.slot_start));
      if (!pos) continue;
      const span = Math.max(1, Math.floor(e.duration_minutes / 30));
      for (let k = 0; k < span && pos.slotIndex + k < SLOT_COUNT; k++) {
        g[pos.dayIndex][pos.slotIndex + k] = e;
      }
    }
    return g;
  }, [entries, weekStart]);

  /** Whether there are entries inside the compressed sleep range. */
  const sleepEntries = useMemo(() => {
    const list: TimeEntry[] = [];
    for (let d = 0; d < DAY_COUNT; d++) {
      for (let s = SLEEP_SLOT_START; s <= SLEEP_SLOT_END; s++) {
        const e = grid[d][s];
        if (e && !list.includes(e)) list.push(e);
      }
    }
    return list;
  }, [grid]);

  /** Day index for "today" (or -1). */
  const todayDayIdx = useMemo(() => {
    const pos = dateToSlot(weekStart, new Date());
    return pos ? pos.dayIndex : -1;
  }, [weekStart]);

  /**
   * Visible slot list with row heights, expanding/compressing the
   * sleep range. Each item is either a real slot or the compressed
   * sleep row marker.
   */
  type VisibleRow =
    | { kind: "slot"; slotIdx: number; h: number }
    | { kind: "sleep"; h: number };

  const rows: VisibleRow[] = useMemo(() => {
    const out: VisibleRow[] = [];
    for (let s = 0; s < SLOT_COUNT; s++) {
      if (
        compressSleep &&
        s >= SLEEP_SLOT_START &&
        s <= SLEEP_SLOT_END
      ) {
        if (s === SLEEP_SLOT_START) out.push({ kind: "sleep", h: COMPRESSED_H });
        // skip all subsequent slots in the compressed range
        continue;
      }
      out.push({ kind: "slot", slotIdx: s, h: CELL_H });
    }
    return out;
  }, [compressSleep]);

  /**
   * slotIdx → (row index in `rows`, 0-based) — used to compose
   * gridRow numbers. Returns -1 if the slot is hidden under
   * compression.
   */
  const slotToRowIdx = useMemo(() => {
    const m = new Map<number, number>();
    rows.forEach((r, i) => {
      if (r.kind === "slot") m.set(r.slotIdx, i);
    });
    return m;
  }, [rows]);

  const totalRowsInGrid = rows.length;

  // ─── Helpers ─────────────────────────────────────────────────────

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

  function handleEmptyCreate(
    dayIdx: number,
    slotIdx: number,
    span: number,
    catId: string
  ) {
    const iso = slotToDate(weekStart, dayIdx, slotIdx).toISOString();
    run(
      () =>
        createEntry({
          slot_start: iso,
          duration_minutes: span * 30,
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

  // ─── Drag handling ───────────────────────────────────────────────

  const gridRef = useRef<HTMLDivElement | null>(null);

  function cellFromEvent(
    ev: PointerEvent | React.PointerEvent
  ): { dayIdx: number; slotIdx: number } | null {
    const el = document.elementFromPoint(ev.clientX, ev.clientY);
    if (!el) return null;
    const cell = (el as HTMLElement).closest<HTMLElement>("[data-cell]");
    if (!cell) return null;
    const dayIdx = Number(cell.dataset.day);
    const slotIdx = Number(cell.dataset.slot);
    if (!Number.isFinite(dayIdx) || !Number.isFinite(slotIdx)) return null;
    return { dayIdx, slotIdx };
  }

  function onEmptyPointerDown(
    ev: React.PointerEvent,
    dayIdx: number,
    slotIdx: number
  ) {
    ev.preventDefault();
    (ev.currentTarget as Element).setPointerCapture?.(ev.pointerId);
    const initial: DragState = { dayIdx, startSlot: slotIdx, currentSlot: slotIdx };
    dragRef.current = initial;
    setDrag(initial);
  }

  useEffect(() => {
    if (!drag) return;
    function onMove(ev: PointerEvent) {
      const current = dragRef.current;
      if (!current) return;
      const c = cellFromEvent(ev);
      if (!c) return;
      if (c.dayIdx !== current.dayIdx) return; // stay in-column
      // Don't drag over already-occupied cells — clamp to the first
      // blocked row by walking out from start.
      const direction = c.slotIdx >= current.startSlot ? 1 : -1;
      let farthest = current.startSlot;
      for (
        let s = current.startSlot;
        direction > 0 ? s <= c.slotIdx : s >= c.slotIdx;
        s += direction
      ) {
        if (s !== current.startSlot && grid[current.dayIdx][s] !== null) break;
        farthest = s;
      }
      const next: DragState = { ...current, currentSlot: farthest };
      dragRef.current = next;
      setDrag(next);
    }
    function onUp() {
      const finalDrag = dragRef.current;
      if (!finalDrag) return;
      const lo = Math.min(finalDrag.startSlot, finalDrag.currentSlot);
      const hi = Math.max(finalDrag.startSlot, finalDrag.currentSlot);
      const span = hi - lo + 1;
      setSelected({
        kind: "empty",
        dayIdx: finalDrag.dayIdx,
        slotIdx: lo,
        span,
      });
      dragRef.current = null;
      setDrag(null);
    }
    function onCancel() {
      dragRef.current = null;
      setDrag(null);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag]);

  function isInDrag(dayIdx: number, slotIdx: number) {
    if (!drag || drag.dayIdx !== dayIdx) return false;
    const lo = Math.min(drag.startSlot, drag.currentSlot);
    const hi = Math.max(drag.startSlot, drag.currentSlot);
    return slotIdx >= lo && slotIdx <= hi;
  }

  // ─── Render ──────────────────────────────────────────────────────

  const gridTemplateRows = `${HEADER_H}px ${rows.map((r) => `${r.h}px`).join(" ")}`;

  return (
    <div className="relative">
      {error && (
        <div className="mb-3 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={toggleCompress}
          className="font-technical inline-flex items-center gap-1.5 rounded-md border border-border bg-card/60 px-2.5 py-1.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
        >
          {compressSleep ? (
            <>
              <ChevronsDown className="h-3.5 w-3.5" aria-hidden />
              수면 시간대 펼치기 (01:00–07:30)
            </>
          ) : (
            <>
              <ChevronsUp className="h-3.5 w-3.5" aria-hidden />
              수면 시간대 접기
            </>
          )}
        </button>
        <p className="font-technical text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
          드래그로 범위 · 클릭으로 단일 블록 · {entries.length} block{entries.length === 1 ? "" : "s"} this week
        </p>
      </div>

      <div className="overflow-x-auto rounded-md border border-border bg-background">
        <div
          ref={gridRef}
          className="grid min-w-[760px] select-none"
          style={{
            gridTemplateColumns: `${TIME_COL}px repeat(${DAY_COUNT}, 1fr)`,
            gridTemplateRows,
          }}
        >
          {/* Header corner — sticky both directions so it survives
              horizontal scroll on mobile + vertical scroll on a long
              grid */}
          <div
            className="sticky top-0 left-0 z-30 border-b border-r border-border bg-muted/80 backdrop-blur"
            style={{ gridColumn: "1 / span 1", gridRow: "1 / span 1" }}
          />
          {/* Day headers — sticky top so day labels stay visible as
              the user scrolls deep into the grid */}
          {Array.from({ length: DAY_COUNT }).map((_, dayIdx) => {
            const isToday = dayIdx === todayDayIdx;
            return (
              <div
                key={`hdr-${dayIdx}`}
                className={`sticky top-0 z-20 flex flex-col items-center justify-center border-b border-r border-border text-[11px] backdrop-blur ${
                  isToday
                    ? "bg-primary/20 text-foreground"
                    : "bg-muted/80 text-muted-foreground"
                }`}
                style={{
                  gridColumn: `${dayIdx + 2} / span 1`,
                  gridRow: "1 / span 1",
                }}
              >
                <span className="font-semibold">{DAY_LABELS_KO[dayIdx]}</span>
                <span className="font-technical tabular-nums text-[10px] opacity-70">
                  {formatDayDate(weekStart, dayIdx)}
                </span>
              </div>
            );
          })}

          {/* Time gutter + cells — iterate rows (which may include compressed sleep) */}
          {rows.map((row, rIdx) => {
            const gridRowNum = rIdx + 2; // +2: row 1 is header

            if (row.kind === "sleep") {
              // Time gutter cell for the compressed sleep row — sticky
              // left so it stays pinned while scrolling horizontally.
              const cells: React.ReactNode[] = [
                <div
                  key="gutter-sleep"
                  className="sticky left-0 z-10 flex items-center justify-end border-r border-t border-border bg-muted/80 px-2 text-right text-[10px] font-technical text-muted-foreground backdrop-blur"
                  style={{
                    gridColumn: "1 / span 1",
                    gridRow: `${gridRowNum} / span 1`,
                  }}
                >
                  01–08
                </div>,
              ];
              for (let dayIdx = 0; dayIdx < DAY_COUNT; dayIdx++) {
                const daysSleep = sleepEntries.filter((e) => {
                  const p = dateToSlot(weekStart, new Date(e.slot_start));
                  return p?.dayIndex === dayIdx;
                });
                const isTodayCol = dayIdx === todayDayIdx;
                cells.push(
                  <button
                    key={`sleep-${dayIdx}`}
                    type="button"
                    onClick={toggleCompress}
                    title="수면 시간대 펼쳐 보기"
                    className={`flex items-center justify-center gap-1 border-r border-t border-border text-[10px] transition-colors hover:bg-muted/40 ${
                      isTodayCol ? "bg-primary/5" : "bg-muted/10"
                    }`}
                    style={{
                      gridColumn: `${dayIdx + 2} / span 1`,
                      gridRow: `${gridRowNum} / span 1`,
                    }}
                  >
                    {daysSleep.length > 0 ? (
                      <>
                        {daysSleep.slice(0, 3).map((e) => {
                          const cat = e.category_id
                            ? catById.get(e.category_id)
                            : null;
                          const color = cat?.color_hex ?? "#6b7280";
                          return (
                            <span
                              key={e.id}
                              className="inline-block h-2 w-2 rounded-full"
                              style={{ background: color }}
                            />
                          );
                        })}
                        <span className="font-technical text-muted-foreground">
                          {daysSleep.length}
                        </span>
                      </>
                    ) : (
                      <span className="font-technical text-muted-foreground opacity-50">
                        —
                      </span>
                    )}
                  </button>
                );
              }
              return <div key={`row-sleep-${rIdx}`} style={{ display: "contents" }}>{cells}</div>;
            }

            // slot row
            const { slotIdx } = row;
            const onHour = slotIdx % 2 === 0;
            const cells: React.ReactNode[] = [
              <div
                key={`gutter-${slotIdx}`}
                className={`font-technical sticky left-0 z-10 border-r bg-muted/60 pr-2 pt-0 text-right text-[10px] tabular-nums text-muted-foreground backdrop-blur ${
                  onHour ? "border-t border-border" : "border-t-0 border-transparent"
                }`}
                style={{
                  gridColumn: "1 / span 1",
                  gridRow: `${gridRowNum} / span 1`,
                }}
              >
                {onHour ? formatSlotTime(slotIdx) : ""}
              </div>,
            ];

            for (let dayIdx = 0; dayIdx < DAY_COUNT; dayIdx++) {
              const gridColNum = dayIdx + 2;
              const entry = grid[dayIdx][slotIdx];
              const isTodayCol = dayIdx === todayDayIdx;

              if (entry) {
                const pos = dateToSlot(weekStart, new Date(entry.slot_start));
                const isFirstCell =
                  pos && pos.dayIndex === dayIdx && pos.slotIndex === slotIdx;
                if (!isFirstCell) {
                  continue;
                }
                const span = Math.max(1, Math.floor(entry.duration_minutes / 30));
                // If any part of the entry is hidden under compression,
                // skip rendering here — it's represented in the sleep
                // row. This avoids blocks overflowing the compressed row.
                const spannedHidden = Array.from({ length: span }).some(
                  (_, k) => {
                    const s = slotIdx + k;
                    return (
                      compressSleep &&
                      s >= SLEEP_SLOT_START &&
                      s <= SLEEP_SLOT_END
                    );
                  }
                );
                if (spannedHidden) continue;

                // Compute grid-row span in terms of visible rows. Most
                // entries don't cross the compression boundary so this
                // equals `span`.
                const firstRowIdx = slotToRowIdx.get(slotIdx) ?? -1;
                const lastSlot = slotIdx + span - 1;
                const lastRowIdx = slotToRowIdx.get(lastSlot) ?? firstRowIdx;
                const rowSpan = Math.max(1, lastRowIdx - firstRowIdx + 1);
                const rowStart = firstRowIdx + 2; // +2 header offset

                const cat = entry.category_id
                  ? catById.get(entry.category_id)
                  : null;
                const color = cat?.color_hex ?? "#6b7280";
                const bg =
                  entry.intensity === "buffer"
                    ? hexWithAlpha(color, 0.35)
                    : hexWithAlpha(color, 0.85);

                cells.push(
                  <button
                    key={`cell-${dayIdx}-${slotIdx}`}
                    type="button"
                    onClick={() => setSelected({ kind: "entry", entry })}
                    className="group relative overflow-hidden border-r border-border text-left"
                    style={{
                      gridColumn: `${gridColNum} / span 1`,
                      gridRow: `${rowStart} / span ${rowSpan}`,
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
                      title={`${cat?.label ?? "(uncategorized)"}${
                        entry.note ? ` — ${entry.note}` : ""
                      }`}
                    >
                      {cat?.label ?? "—"}
                    </span>
                    {entry.note && rowSpan >= 2 && (
                      <span className="font-technical block truncate px-1.5 text-[9.5px] opacity-80">
                        {entry.note}
                      </span>
                    )}
                  </button>
                );
                continue;
              }

              // empty cell
              const inDrag = isInDrag(dayIdx, slotIdx);
              cells.push(
                <button
                  key={`cell-${dayIdx}-${slotIdx}`}
                  type="button"
                  data-cell="1"
                  data-day={dayIdx}
                  data-slot={slotIdx}
                  onPointerDown={(e) => onEmptyPointerDown(e, dayIdx, slotIdx)}
                  onClick={() => {
                    if (drag) return; // suppressed; pointerup handler will open modal
                    setSelected({
                      kind: "empty",
                      dayIdx,
                      slotIdx,
                      span: 1,
                    });
                  }}
                  className={`border-r border-border transition-colors ${
                    inDrag
                      ? "bg-primary/25"
                      : isTodayCol
                      ? "bg-primary/5 hover:bg-primary/10"
                      : "hover:bg-primary/8"
                  }`}
                  style={{
                    gridColumn: `${gridColNum} / span 1`,
                    gridRow: `${gridRowNum} / span 1`,
                    borderTop: onHour
                      ? "1px solid var(--border)"
                      : "1px solid transparent",
                  }}
                  aria-label={`${DAY_LABELS_KO[dayIdx]} ${formatSlotTime(slotIdx)} 슬롯 추가`}
                />
              );
            }
            return <div key={`row-${slotIdx}`} style={{ display: "contents" }}>{cells}</div>;
          })}
        </div>
      </div>

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

// ─── Modal ─────────────────────────────────────────────────────────

interface CellModalProps {
  selection: NonNullable<Selection>;
  categories: TimeCategory[];
  weekStart: Date;
  pending: boolean;
  onClose: () => void;
  onCreate: (dayIdx: number, slotIdx: number, span: number, catId: string) => void;
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
    : (selection as { kind: "empty"; dayIdx: number }).dayIdx;
  const slotIdx = isEntry
    ? dateToSlot(weekStart, new Date(entry!.slot_start))?.slotIndex ?? 0
    : (selection as { kind: "empty"; slotIdx: number }).slotIdx;
  const span = isEntry
    ? Math.max(1, Math.floor((entry?.duration_minutes ?? 30) / 30))
    : (selection as { kind: "empty"; span: number }).span;

  const startLabel = formatSlotTime(slotIdx);
  const endSlot = Math.min(SLOT_COUNT, slotIdx + span);
  const endLabel =
    endSlot === SLOT_COUNT ? "24:00" : formatSlotTime(endSlot);
  const rangeLabel =
    span > 1 ? `${startLabel}–${endLabel}` : startLabel;
  const slotLabel = `${DAY_LABELS_KO[dayIdx]} · ${formatDayDate(
    weekStart,
    dayIdx
  )} · ${rangeLabel}${span > 1 ? ` (${span * 30}분)` : ""}`;

  // Keyboard: Escape closes, digit 1-9 picks the Nth category, Del/
  // Backspace deletes an existing entry. Ignore when an input is
  // focused (so typing a note doesn't also fire category shortcuts).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const inField =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (inField) return;

      if ((e.key === "Delete" || e.key === "Backspace") && isEntry && entry) {
        e.preventDefault();
        onDelete(entry.id);
        return;
      }

      if (/^[1-9]$/.test(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        const cat = categories[idx];
        if (!cat) return;
        e.preventDefault();
        if (isEntry && entry) {
          onUpdate(entry.id, { category_id: cat.id });
        } else {
          onCreate(dayIdx, slotIdx, span, cat.id);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    onClose,
    categories,
    isEntry,
    entry,
    onUpdate,
    onCreate,
    onDelete,
    dayIdx,
    slotIdx,
    span,
  ]);

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
              {isEntry ? "블록 편집" : span > 1 ? "범위 선택됨" : "새 블록"}
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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="font-technical text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
              카테고리
            </p>
            <p className="font-technical text-[9.5px] uppercase tracking-[0.12em] text-muted-foreground opacity-70">
              1-9 단축
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((c, i) => {
              const active = currentCat?.id === c.id;
              const digit = i < 9 ? i + 1 : null;
              return (
                <button
                  key={c.id}
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    if (isEntry && entry) {
                      onUpdate(entry.id, { category_id: c.id });
                    } else {
                      onCreate(dayIdx, slotIdx, span, c.id);
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
                  <span className="truncate flex-1">{c.label}</span>
                  {digit !== null && (
                    <kbd className="font-technical shrink-0 rounded-sm border border-border/80 bg-muted/60 px-1 py-0.5 text-[9.5px] text-muted-foreground">
                      {digit}
                    </kbd>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {isEntry && entry && (
          <>
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
