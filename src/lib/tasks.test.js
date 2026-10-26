import { describe, expect, it } from 'vitest';
import { buildSeedTasks, compareTasks, matchesFilters, normaliseTasks } from './tasks.js';

const today = '2026-10-26';

describe('normaliseTasks', () => {
  it('fills defaults, keeps unknown fields and drops unusable entries', () => {
    const result = normaliseTasks(
      [
        { id: 'a', title: '  Multi\nline  ', status: 'nope', type: 'nope', assignee: '', extra: 1 },
        { title: '' },
        'x',
        { id: 'a', title: 'Duplicate id' },
      ],
      today,
    );
    expect(result.dropped).toBe(2);
    expect(result.tasks[0]).toMatchObject({
      title: 'Multi line',
      status: 'todo',
      type: 'feature',
      assignee: null,
      dueDate: null,
      createdDate: today,
      context: '',
      contextHistory: [],
      extra: 1,
    });
    expect(result.tasks[1].id).not.toBe('a');
  });

  it('is idempotent', () => {
    const once = normaliseTasks(buildSeedTasks(today, ['m1']), today).tasks;
    expect(normaliseTasks(once, today).tasks).toEqual(once);
  });

  it('rejects a value that is not a list', () => {
    expect(normaliseTasks({}, today).ok).toBe(false);
  });
});

describe('compareTasks', () => {
  it('sorts by due date, no date last, then oldest first', () => {
    const list = [
      { id: 'none', dueDate: null, createdDate: '2026-10-01' },
      { id: 'late', dueDate: '2026-11-01', createdDate: '2026-10-01' },
      { id: 'soon-new', dueDate: '2026-10-27', createdDate: '2026-10-20' },
      { id: 'soon-old', dueDate: '2026-10-27', createdDate: '2026-10-10' },
    ];
    expect([...list].sort(compareTasks).map((t) => t.id)).toEqual(['soon-old', 'soon-new', 'late', 'none']);
  });
});

describe('matchesFilters', () => {
  const team = [{ id: 'm1' }];
  const task = { type: 'bug', assignee: 'm1', title: 'Fix the toast', description: '', context: 'aria-live region' };

  it('filters by owner, Unassigned and type', () => {
    expect(matchesFilters(task, { owner: 'm1' }, team)).toBe(true);
    expect(matchesFilters(task, { owner: 'm2' }, team)).toBe(false);
    expect(matchesFilters(task, { owner: 'unassigned' }, team)).toBe(false);
    expect(matchesFilters({ ...task, assignee: 'gone' }, { owner: 'unassigned' }, team)).toBe(true);
    expect(matchesFilters(task, { type: 'feature' }, team)).toBe(false);
  });

  it('searches title, description and context; every word must match', () => {
    expect(matchesFilters(task, { query: 'TOAST' }, team)).toBe(true);
    expect(matchesFilters(task, { query: 'toast live' }, team)).toBe(true);
    expect(matchesFilters(task, { query: 'toast modal' }, team)).toBe(false);
    expect(matchesFilters(task, { query: '   ' }, team)).toBe(true);
  });
});
