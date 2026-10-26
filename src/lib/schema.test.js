import { describe, expect, it } from 'vitest';
import { migrateData, runMigrations, SCHEMA_VERSION } from './schema.js';
import { STORAGE_KEYS } from './constants.js';

/** Minimal in-memory stand-in for window.localStorage. */
function memoryStorage(entries = {}) {
  const map = new Map(Object.entries(entries));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    dump: () => Object.fromEntries(map),
  };
}

const v2Tasks = [
  { id: 'a', title: 'One', assignee: 'Sam K.', status: 'todo', type: 'bug' },
  { id: 'b', title: 'Two', assignee: 'Robin Q.', status: 'done', type: 'feature' },
  { id: 'c', title: 'Three', assignee: '', status: 'review', type: 'feature' },
];

describe('migrateData v2 → v3', () => {
  it('builds the team from the old names plus every assignee, and maps names to ids', () => {
    const { tasks, team } = migrateData({ tasks: v2Tasks, team: undefined }, 2);
    expect(team.map((m) => m.name)).toEqual(['Alex B.', 'Sam K.', 'Jo M.', 'Robin Q.']);
    const idOf = (name) => team.find((m) => m.name === name).id;
    expect(tasks[0].assignee).toBe(idOf('Sam K.'));
    expect(tasks[1].assignee).toBe(idOf('Robin Q.'));
    expect(tasks[2].assignee).toBeNull();
  });

  it('is idempotent', () => {
    const once = migrateData({ tasks: v2Tasks, team: undefined }, 2);
    const twice = migrateData(once, 2);
    expect(twice).toEqual(once);
  });

  it('adds the older fields for v0 data', () => {
    const { tasks } = migrateData({ tasks: [{ id: 'x', title: 'Old', assignee: 'Jo M.' }], team: undefined }, 0);
    expect(tasks[0]).toMatchObject({ context: '', contextTool: null, contextUpdatedAt: null, contextHistory: [] });
  });

  it('leaves v3 data alone', () => {
    const data = { tasks: [{ id: 'x', title: 'T', assignee: 'member-1' }], team: [{ id: 'member-1', name: 'A' }] };
    expect(migrateData(data, 3)).toEqual(data);
  });
});

describe('runMigrations', () => {
  it('upgrades stored v2 data in place and records the version', () => {
    const storage = memoryStorage({
      [STORAGE_KEYS.tasks]: JSON.stringify(v2Tasks),
      [STORAGE_KEYS.meta]: JSON.stringify({ schemaVersion: 2 }),
    });
    expect(runMigrations(storage)).toEqual({ newer: false });
    const team = JSON.parse(storage.getItem(STORAGE_KEYS.team));
    const tasks = JSON.parse(storage.getItem(STORAGE_KEYS.tasks));
    expect(team).toHaveLength(4);
    expect(tasks.every((t) => t.assignee === null || team.some((m) => m.id === t.assignee))).toBe(true);
    expect(JSON.parse(storage.getItem(STORAGE_KEYS.meta)).schemaVersion).toBe(SCHEMA_VERSION);
  });

  it('writes only the version on a fresh browser', () => {
    const storage = memoryStorage();
    runMigrations(storage);
    expect(Object.keys(storage.dump())).toEqual([STORAGE_KEYS.meta]);
  });

  it('does not touch data from a newer version', () => {
    const before = { [STORAGE_KEYS.meta]: JSON.stringify({ schemaVersion: 99 }), [STORAGE_KEYS.tasks]: '[]' };
    const storage = memoryStorage(before);
    expect(runMigrations(storage)).toEqual({ newer: true });
    expect(storage.dump()).toEqual(before);
  });
});
