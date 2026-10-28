import { describe, expect, it } from 'vitest';
import {
  ACTIVITY_MAX,
  activity,
  describeActivity,
  editActivities,
  handedToSince,
  normaliseActivity,
  withActivity,
} from './activity.js';

const T = '2026-10-26T10:00:00.000Z';
const names = { m1: 'Sam K.', m2: 'Jo M.' };
const nameOf = (id) => names[id] ?? null;

describe('normaliseActivity', () => {
  it('keeps valid entries, drops broken ones, caps the list', () => {
    const list = normaliseActivity([
      { at: T, by: 'm1', type: 'moved', from: 'todo', to: 'review', extra: 1 },
      { at: 'nope', by: 'm1', type: 'created' },
      { at: T, type: 'unknown' },
      null,
    ]);
    expect(list).toEqual([{ at: T, by: 'm1', type: 'moved', from: 'todo', to: 'review' }]);
    const long = Array.from({ length: ACTIVITY_MAX + 5 }, () => ({ at: T, by: 'm1', type: 'edited' }));
    expect(normaliseActivity(long)).toHaveLength(ACTIVITY_MAX);
    expect(normaliseActivity('x')).toEqual([]);
  });
});

describe('withActivity', () => {
  it('puts new entries first and sets updatedBy / updatedAt', () => {
    const task = { id: 't', activity: [activity('created', 'm1', {}, T)] };
    const next = withActivity(task, activity('edited', 'm2', {}, '2026-10-27T10:00:00.000Z'));
    expect(next.activity.map((e) => e.type)).toEqual(['edited', 'created']);
    expect(next).toMatchObject({ updatedBy: 'm2', updatedAt: '2026-10-27T10:00:00.000Z' });
    expect(withActivity(task, [])).toBe(task);
  });
});

describe('editActivities', () => {
  const before = { status: 'todo', assignee: 'm1', context: '', contextTool: null, title: 'A', description: '', type: 'bug', dueDate: null };

  it('records one entry per kind of change', () => {
    const after = { ...before, status: 'review', assignee: 'm2', context: 'new', title: 'B' };
    expect(editActivities(before, after, 'm1', T).map((e) => e.type)).toEqual(['moved', 'handoff', 'context', 'edited']);
  });

  it('records nothing when nothing changed', () => {
    expect(editActivities(before, { ...before }, 'm1', T)).toEqual([]);
  });
});

describe('describeActivity', () => {
  it('writes plain sentences', () => {
    expect(describeActivity({ type: 'moved', by: 'm1', from: 'todo', to: 'review' }, nameOf)).toBe('Sam K. moved it from To Do to Review');
    expect(describeActivity({ type: 'handoff', by: 'm1', to: 'm2' }, nameOf)).toBe('Sam K. handed it to Jo M.');
    expect(describeActivity({ type: 'handoff', by: 'm1', to: null }, nameOf)).toBe('Sam K. made it Unassigned');
    expect(describeActivity({ type: 'created', by: 'gone' }, nameOf)).toBe('A former team member created the task');
  });
});

describe('handedToSince', () => {
  const handoff = (by, to, at) => ({ at, by, type: 'handoff', from: null, to });
  const tasks = [
    { id: 'a', assignee: 'm2', activity: [handoff('m1', 'm2', '2026-10-27T09:00:00.000Z')] },
    { id: 'b', assignee: 'm2', activity: [handoff('m1', 'm2', '2026-10-20T09:00:00.000Z')] },
    { id: 'c', assignee: 'm2', activity: [handoff('m2', 'm2', '2026-10-27T09:00:00.000Z')] }, // took it themself
    { id: 'd', assignee: 'm1', activity: [handoff('m1', 'm2', '2026-10-27T09:00:00.000Z')] }, // handed on again
  ];

  it('counts tasks someone else handed over after the last visit', () => {
    expect(handedToSince(tasks, 'm2', '2026-10-26T00:00:00.000Z').map((t) => t.id)).toEqual(['a']);
    expect(handedToSince(tasks, 'm2', null).map((t) => t.id)).toEqual(['a', 'b']);
  });
});
