import { describe, expect, it } from 'vitest';
import { addDays, daysBetween, formatDueLabel, formatTimeAgo, getDueState, isISODate } from './dates.js';

const today = '2026-10-26';
const task = (fields) => ({ status: 'todo', dueDate: null, ...fields });

describe('isISODate', () => {
  it('accepts real calendar dates only', () => {
    expect(isISODate('2026-02-28')).toBe(true);
    expect(isISODate('2026-02-30')).toBe(false);
    expect(isISODate('2026-2-3')).toBe(false);
    expect(isISODate('')).toBe(false);
    expect(isISODate(null)).toBe(false);
  });
});

describe('addDays / daysBetween', () => {
  it('crosses month and year ends', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(daysBetween('2026-10-26', '2026-11-02')).toBe(7);
    expect(daysBetween('2026-10-26', '2026-10-20')).toBe(-6);
  });
});

describe('getDueState', () => {
  it('follows the M8 table', () => {
    expect(getDueState(task({ dueDate: '2026-10-25' }), today)).toBe('overdue');
    expect(getDueState(task({ dueDate: today }), today)).toBe('warning');
    expect(getDueState(task({ dueDate: '2026-10-27' }), today)).toBe('warning');
    expect(getDueState(task({ dueDate: '2026-10-28' }), today)).toBe('safe');
    expect(getDueState(task({}), today)).toBe('none');
  });

  it('lets Done override any date', () => {
    expect(getDueState(task({ status: 'done', dueDate: '2026-01-01' }), today)).toBe('done');
  });
});

describe('formatDueLabel', () => {
  it('uses the DESIGN.md §5 labels', () => {
    expect(formatDueLabel(task({ dueDate: '2026-10-25' }), today)).toBe('Overdue · 1 day');
    expect(formatDueLabel(task({ dueDate: '2026-10-23' }), today)).toBe('Overdue · 3 days');
    expect(formatDueLabel(task({ dueDate: today }), today)).toBe('Due today');
    expect(formatDueLabel(task({ dueDate: '2026-10-27' }), today)).toBe('Due tomorrow');
    expect(formatDueLabel(task({ dueDate: '2026-10-31' }), today)).toBe('Due in 5 days');
    expect(formatDueLabel(task({}), today)).toBe('');
  });
});

describe('formatTimeAgo', () => {
  const now = Date.parse('2026-10-26T12:00:00Z');
  it('rounds down to the largest unit', () => {
    expect(formatTimeAgo('2026-10-26T11:59:30Z', now)).toBe('just now');
    expect(formatTimeAgo('2026-10-26T11:55:00Z', now)).toBe('5 min ago');
    expect(formatTimeAgo('2026-10-26T09:00:00Z', now)).toBe('3 h ago');
    expect(formatTimeAgo('2026-10-25T12:00:00Z', now)).toBe('1 day ago');
  });
});
