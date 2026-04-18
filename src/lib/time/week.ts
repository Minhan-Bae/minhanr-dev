/**
 * Time-grid helpers for the /calendar timebox planner.
 *
 * All public-facing times are Asia/Seoul wall-clock (UTC+9, no DST).
 * Storage in Supabase is UTC (timestamptz); conversion happens at the
 * boundary — never inside UI code. A "week" always starts Sunday 00:00
 * KST to match the user's Excel convention.
 *
 * The grid is 7 days × 48 slots. Slot index 0 = 00:00, slot index 47
 * = 23:30. Each slot is exactly 30 minutes.
 */

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

export const SLOT_COUNT = 48;
export const SLOT_MINUTES = 30;
export const SLOT_MS = SLOT_MINUTES * 60 * 1000;
export const DAY_COUNT = 7;
export const DAY_MS = 24 * 60 * 60 * 1000;

/** Day-index names (Sunday first, matches Date.getUTCDay() semantics when shifted to KST). */
export const DAY_LABELS_KO = ["일", "월", "화", "수", "목", "금", "토"] as const;
export const DAY_LABELS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/**
 * Return a Date representing 00:00 KST on the Sunday of the week
 * containing `d`. The returned Date's `.getTime()` is the UTC instant
 * for that wall-clock moment.
 */
export function startOfWeekSundayKST(d: Date = new Date()): Date {
  // Shift by +9h so UTC methods read KST wall-clock values.
  const shifted = new Date(d.getTime() + KST_OFFSET_MS);
  const y = shifted.getUTCFullYear();
  const m = shifted.getUTCMonth();
  const dayOfMonth = shifted.getUTCDate();
  const dayOfWeek = shifted.getUTCDay(); // 0 = Sun
  // Midnight on Sunday in KST wall-clock, encoded as UTC.
  const kstMidnightUtcSeconds = Date.UTC(y, m, dayOfMonth - dayOfWeek, 0, 0, 0, 0);
  return new Date(kstMidnightUtcSeconds - KST_OFFSET_MS);
}

/** Nth previous / next week. `offset < 0` = earlier, `> 0` = later. */
export function shiftWeek(weekStart: Date, offset: number): Date {
  return new Date(weekStart.getTime() + offset * DAY_COUNT * DAY_MS);
}

/**
 * Compose a `slot_start` timestamp from (weekStart, dayIndex, slotIndex).
 * weekStart is assumed to be Sunday 00:00 KST (output of
 * startOfWeekSundayKST). dayIndex 0..6, slotIndex 0..47.
 */
export function slotToDate(weekStart: Date, dayIndex: number, slotIndex: number): Date {
  return new Date(weekStart.getTime() + dayIndex * DAY_MS + slotIndex * SLOT_MS);
}

/**
 * Inverse of slotToDate. Returns null if `t` is outside the given week.
 */
export function dateToSlot(
  weekStart: Date,
  t: Date
): { dayIndex: number; slotIndex: number } | null {
  const diff = t.getTime() - weekStart.getTime();
  if (diff < 0 || diff >= DAY_COUNT * DAY_MS) return null;
  const slots = Math.floor(diff / SLOT_MS);
  return { dayIndex: Math.floor(slots / SLOT_COUNT), slotIndex: slots % SLOT_COUNT };
}

/** Format a slot index as "HH:MM" (00:00..23:30). */
export function formatSlotTime(slotIndex: number): string {
  const h = Math.floor(slotIndex / 2);
  const m = slotIndex % 2 === 0 ? "00" : "30";
  return `${h.toString().padStart(2, "0")}:${m}`;
}

/** Format a day within the week as "MM.DD". */
export function formatDayDate(weekStart: Date, dayIndex: number): string {
  const d = new Date(weekStart.getTime() + dayIndex * DAY_MS + KST_OFFSET_MS);
  const mm = (d.getUTCMonth() + 1).toString().padStart(2, "0");
  const dd = d.getUTCDate().toString().padStart(2, "0");
  return `${mm}.${dd}`;
}

/** Week label like "2026.04.19 — 04.25". */
export function formatWeekLabel(weekStart: Date): string {
  const endStart = new Date(weekStart.getTime() + 6 * DAY_MS + KST_OFFSET_MS);
  const s = new Date(weekStart.getTime() + KST_OFFSET_MS);
  const y = s.getUTCFullYear();
  const sm = (s.getUTCMonth() + 1).toString().padStart(2, "0");
  const sd = s.getUTCDate().toString().padStart(2, "0");
  const em = (endStart.getUTCMonth() + 1).toString().padStart(2, "0");
  const ed = endStart.getUTCDate().toString().padStart(2, "0");
  return `${y}.${sm}.${sd} — ${em}.${ed}`;
}

/** Total slot count per week (336 = 7 × 48). */
export const WEEK_SLOTS = DAY_COUNT * SLOT_COUNT;

/** Hex → rgba(); preserves alpha explicitly for buffer-tone rendering. */
export function hexWithAlpha(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
