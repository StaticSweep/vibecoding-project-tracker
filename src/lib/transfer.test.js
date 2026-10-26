import { describe, expect, it } from 'vitest';
import { buildExport, estimateStorageBytes, exportFileName, parseImport } from './transfer.js';
import { DEFAULT_ANCHORS } from './anchors.js';

const today = '2026-10-26';
const team = [{ id: 'm1', name: 'Alex B.', email: null, role: null, createdAt: null }];
const tasks = [
  {
    id: 't1', title: 'Task', description: '', type: 'bug', status: 'todo', assignee: 'm1',
    dueDate: null, createdDate: today, context: '', contextTool: null, contextUpdatedAt: null, contextHistory: [],
  },
];
const workspace = { projectName: 'Slopify', teamName: 'Slop squad', leadId: 'm1' };

describe('export → import', () => {
  it('round-trips the board unchanged', () => {
    const file = JSON.stringify(buildExport({ tasks, anchors: DEFAULT_ANCHORS, team, workspace }, 'NOW'));
    const result = parseImport(file, today);
    expect(result.ok).toBe(true);
    expect(result.data).toEqual({ tasks, anchors: DEFAULT_ANCHORS, team, workspace });
    expect(exportFileName(today)).toBe('vibetracker-2026-10-26.json');
  });

  it('upgrades an older export that stored names', () => {
    const old = { app: 'vibetracker', schemaVersion: 1, tasks: [{ id: 'x', title: 'Old', assignee: 'Robin Q.' }] };
    const result = parseImport(JSON.stringify(old), today);
    expect(result.ok).toBe(true);
    const robin = result.data.team.find((m) => m.name === 'Robin Q.');
    expect(result.data.tasks[0].assignee).toBe(robin.id);
    expect(result.data.anchors).toHaveLength(4);
  });
});

describe('parseImport rejects', () => {
  it.each([
    ['bad JSON', '{nope', /cannot read/],
    ['another app', JSON.stringify({ app: 'other', schemaVersion: 1, tasks: [] }), /cannot read/],
    ['no version', JSON.stringify({ app: 'vibetracker', tasks: [] }), /cannot read/],
    ['no task list', JSON.stringify({ app: 'vibetracker', schemaVersion: 3 }), /cannot read/],
    ['a newer version', JSON.stringify({ app: 'vibetracker', schemaVersion: 99, tasks: [] }), /newer version/],
  ])('%s', (_, text, message) => {
    const result = parseImport(text, today);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(message);
  });
});

describe('estimateStorageBytes', () => {
  it('counts only vibetracker keys, 2 bytes per character', () => {
    const entries = [['vibetracker.tasks', '[]'], ['other', 'xxxxxxxx']];
    const storage = {
      length: entries.length,
      key: (i) => entries[i][0],
      getItem: (k) => entries.find(([key]) => key === k)?.[1] ?? null,
    };
    expect(estimateStorageBytes(storage)).toBe(('vibetracker.tasks'.length + 2) * 2);
  });
});
