/**
 * Relative time formatting utility.
 * Shared across Home, Command, and Admin pages.
 */
export function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

/**
 * KST (Asia/Seoul, UTC+9) helpers.
 *
 * The codebase uses a "fake-UTC" pattern: shift the timestamp forward
 * by 9 hours and call `.getUTCHours()` / `.getUTCDate()` to read out
 * KST values. The Date object lies about its UTC-ness — that's the
 * trick. It's fragile but consistent and dependency-free.
 *
 * Centralized here so the +9-hour magic number doesn't have to be
 * repeated in 8 places. If we ever switch to `Intl.DateTimeFormat({
 * timeZone: "Asia/Seoul" })`, only this file changes — call sites
 * already speak the helper API.
 */

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * Returns a Date whose `getUTC*()` accessors read out as KST values.
 * NOTE: this Date is NOT a valid timestamp — its `.getTime()` is shifted
 * forward by 9 hours. Use only with `getUTC*` accessors, never with
 * methods that produce a timestamp (`.toISOString()` is the one safe
 * exception because it just stringifies the UTC accessors).
 */
export function nowInKST(): Date {
  return new Date(Date.now() + KST_OFFSET_MS);
}

/**
 * Today's date in KST as `YYYY-MM-DD`. Replaces the inline pattern
 * `getNowKST().toISOString().split("T")[0]`.
 */
export function todayKstDate(): string {
  return nowInKST().toISOString().split("T")[0];
}

/**
 * Three-letter day-of-week name in KST (Sun..Sat). Replaces the inline
 * pattern `days[kst.getUTCDay()]` in github.ts.
 */
export function todayKstDayName(): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[nowInKST().getUTCDay()];
}

/**
 * Minutes-since-midnight in KST (0..1439). Replaces the inline pattern
 * `n.getUTCHours() * 60 + n.getUTCMinutes()` in weekly-calendar.
 */
export function nowKstMinutes(): number {
  const n = nowInKST();
  return n.getUTCHours() * 60 + n.getUTCMinutes();
}

/**
 * ISO 8601 week id for a KST date string (`YYYY-MM-DD` → `YYYY-Www`).
 * Week starts Monday; week 1 contains the year's first Thursday.
 * The returned year is the ISO week-year (may differ from calendar year
 * near Jan 1 / Dec 31).
 */
export function isoWeek(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00+09:00");
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNr = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const yearStartDayNr = (yearStart.getUTCDay() + 6) % 7;
  yearStart.setUTCDate(yearStart.getUTCDate() - yearStartDayNr + 3);
  const weekNumber = 1 + Math.round((firstThursday - yearStart.valueOf()) / 604800000);
  return `${target.getUTCFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

/**
 * Given a KST date string, return the Monday (`YYYY-MM-DD`) of that
 * ISO week. Used for aggregating weekly review data.
 */
export function isoWeekMonday(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00+09:00");
  const dayNr = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNr);
  return d.toISOString().split("T")[0];
}
