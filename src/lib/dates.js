/**
 * Date helpers. All date-only values are local calendar dates as
 * 'YYYY-MM-DD' (DR-TASK-03). Never compare `new Date('YYYY-MM-DD')` with the
 * local time — that string parses as UTC midnight (FR-M8-03).
 */

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

const pad = (n) => String(n).padStart(2, '0');

/** Local Date → 'YYYY-MM-DD'. */
export function toISODate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Today's local date as 'YYYY-MM-DD'. */
export function todayISO() {
  return toISODate(new Date());
}

/** True when `value` is a real calendar date in 'YYYY-MM-DD' form. */
export function isISODate(value) {
  if (typeof value !== 'string') return false;
  const m = ISO_DATE.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(y, mo - 1, d);
  return date.getFullYear() === y && date.getMonth() === mo - 1 && date.getDate() === d;
}

/** 'YYYY-MM-DD' → local Date at midnight. */
export function parseISODate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Add whole days to a 'YYYY-MM-DD' date. */
export function addDays(iso, days) {
  const date = parseISODate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

/** Whole calendar days from `fromIso` to `toIso` (DST-safe). */
export function daysBetween(fromIso, toIso) {
  const [y1, m1, d1] = fromIso.split('-').map(Number);
  const [y2, m2, d2] = toIso.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000);
}

/**
 * Due state of a task (DESIGN.md §2.3, PRD §14.2 M8 table).
 * @returns {'done'|'overdue'|'warning'|'safe'|'none'}
 */
export function getDueState(task, today) {
  if (task.status === 'done') return 'done';
  if (!task.dueDate) return 'none';
  const days = daysBetween(today, task.dueDate);
  if (days < 0) return 'overdue';
  if (days <= 1) return 'warning';
  return 'safe';
}

/** Human-readable due label (FR-M8-02, DESIGN.md §5). Empty when there is no date. */
export function formatDueLabel(task, today) {
  const state = getDueState(task, today);
  if (state === 'done') return 'Done';
  if (state === 'none') return '';
  const days = daysBetween(today, task.dueDate);
  if (days < 0) {
    const n = -days;
    return `Overdue · ${n} ${n === 1 ? 'day' : 'days'}`;
  }
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `Due in ${days} days`;
}

/** Long, absolute date for tooltips, e.g. "Tuesday, 21 October 2026". */
export function formatLongDate(iso) {
  return parseISODate(iso).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
