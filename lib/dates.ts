export const WINDOW_WEEKS = 4;
export const WINDOW_DAYS = WINDOW_WEEKS * 7;

/** Local-time "YYYY-MM-DD" for a Date. */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parse "YYYY-MM-DD" as a local date (no UTC shift). */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + days);
  return next;
}

/** Monday of the week containing `date`. */
export function startOfWeekMonday(date: Date): Date {
  const day = date.getDay(); // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(date, diff);
}

export type DateWindow = {
  from: string;
  to: string;
  /** Every date in the window, in order. */
  dates: string[];
};

/** Four weeks starting the Monday of the current week. */
export function getWindow(today: Date = new Date()): DateWindow {
  const monday = startOfWeekMonday(today);
  const dates = Array.from({ length: WINDOW_DAYS }, (_, i) => toISODate(addDays(monday, i)));
  return { from: dates[0], to: dates[dates.length - 1], dates };
}

export function isWeekend(iso: string): boolean {
  const day = parseISODate(iso).getDay();
  return day === 0 || day === 6;
}

const shortDay = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" });
const monthDay = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const monthDayYear = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const stamp = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

/** "Mon, Oct 26" */
export function formatDayLabel(iso: string): string {
  return shortDay.format(parseISODate(iso));
}

/** "Oct 26" */
export function formatMonthDay(iso: string): string {
  return monthDay.format(parseISODate(iso));
}

/** "Oct 26, 2026" */
export function formatMonthDayYear(iso: string): string {
  return monthDayYear.format(parseISODate(iso));
}

/** "Oct 31–Nov 1" or "Oct 24–25" */
export function formatDateSpan(fromIso: string, toIso: string): string {
  const a = parseISODate(fromIso);
  const b = parseISODate(toIso);
  if (a.getMonth() === b.getMonth()) return `${monthDay.format(a)}\u2013${b.getDate()}`;
  return `${monthDay.format(a)}\u2013${monthDay.format(b)}`;
}

/** "Oct 23, 2:14 PM" */
export function formatTimestamp(isoTimestamp: string): string {
  return stamp.format(new Date(isoTimestamp));
}

const rtf = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });

export function formatRelative(isoTimestamp: string, now: Date = new Date()): string {
  const diffMs = new Date(isoTimestamp).getTime() - now.getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  return rtf.format(Math.round(hours / 24), "day");
}

/** Whole days since the timestamp. */
export function ageInDays(isoTimestamp: string, now: Date = new Date()): number {
  return Math.floor((now.getTime() - new Date(isoTimestamp).getTime()) / 86_400_000);
}

export function ageInHours(isoTimestamp: string, now: Date = new Date()): number {
  return (now.getTime() - new Date(isoTimestamp).getTime()) / 3_600_000;
}
