import { LEGACY_TEAM, STORAGE_KEYS } from './constants.js';
import { createMember } from './team.js';

/**
 * Data schema versioning (PRD §14.4.7, DR-MIG-01…04).
 *   v0 — tasks without the M9 context fields
 *   v1 — the full PRD §5 model
 *   v2 — adds the optional M12 `contextHistory` list
 *   v3 — the team lives in `vibetracker.team`; `Task.assignee` is a member id
 *   v4 — tasks record `createdBy`, `updatedBy`, `updatedAt` and `activity`
 */
export const SCHEMA_VERSION = 4;

const isTask = (t) => t && typeof t === 'object' && !Array.isArray(t);

/**
 * Upgrade stored tasks to v2. Additive and idempotent: it only adds missing
 * fields with defaults and never removes user content. Non-array input is
 * returned unchanged for the normaliser to reject.
 */
export function migrateTasks(raw, fromVersion) {
  if (!Array.isArray(raw) || fromVersion >= 2) return raw;
  let tasks = raw;

  // v0 → v1: add the M9 context fields.
  if (fromVersion < 1) {
    tasks = tasks.map((t) => (isTask(t) ? { context: '', contextTool: null, contextUpdatedAt: null, ...t } : t));
  }
  // v1 → v2: add the M12 prompt history.
  tasks = tasks.map((t) => (isTask(t) ? { contextHistory: [], ...t } : t));
  return tasks;
}

/**
 * Upgrade a whole data set `{ tasks, team }` to the current version. Used on
 * load (`runMigrations`) and on import. Pure and idempotent.
 *
 * v2 → v3: when there is no team yet, it is built from the old placeholder
 * names plus every other assignee name in the tasks, and each assignee name
 * becomes that member's id. No task loses its owner.
 */
export function migrateData({ tasks, team }, fromVersion, nowIso = new Date().toISOString()) {
  let nextTasks = migrateTasks(tasks, fromVersion);
  let nextTeam = team;

  if (fromVersion < 3 && Array.isArray(nextTasks)) {
    if (!Array.isArray(nextTeam) || nextTeam.length === 0) {
      const names = [...LEGACY_TEAM];
      for (const t of nextTasks) {
        const name = isTask(t) && typeof t.assignee === 'string' ? t.assignee.trim() : '';
        if (name && !names.some((n) => n.toLowerCase() === name.toLowerCase())) names.push(name);
      }
      nextTeam = names.map((name) => createMember({ name }, nowIso));
    }
    const byName = new Map(nextTeam.map((m) => [m.name.toLowerCase(), m.id]));
    const ids = new Set(nextTeam.map((m) => m.id));
    nextTasks = nextTasks.map((t) => {
      if (!isTask(t) || typeof t.assignee !== 'string' || ids.has(t.assignee)) return t;
      return { ...t, assignee: byName.get(t.assignee.trim().toLowerCase()) ?? null };
    });
  }

  // v3 → v4: attribution fields, empty for older tasks (nobody knows who).
  if (fromVersion < 4 && Array.isArray(nextTasks)) {
    nextTasks = nextTasks.map((t) =>
      isTask(t) ? { createdBy: null, updatedBy: null, updatedAt: null, activity: [], ...t } : t,
    );
  }

  return { tasks: nextTasks, team: nextTeam };
}

/** Stored schema version. A missing or unreadable `meta` key counts as v0. */
export function readSchemaVersion(storage = window.localStorage) {
  try {
    const meta = JSON.parse(storage.getItem(STORAGE_KEYS.meta));
    return Number.isInteger(meta?.schemaVersion) ? meta.schemaVersion : 0;
  } catch {
    return 0;
  }
}

function readJson(storage, key) {
  const raw = storage.getItem(key);
  if (raw == null) return { present: false, value: undefined };
  try {
    return { present: true, value: JSON.parse(raw) };
  } catch {
    return { present: true, value: undefined }; // left for useLocalStorage to back up
  }
}

/**
 * Bring stored data up to SCHEMA_VERSION before React reads it. It spans
 * several keys (tasks + team), so it runs once, synchronously, in main.jsx.
 *
 * @returns {{ newer: boolean }} `newer` is true when the data was saved by a
 *   newer Slopify. Nothing is written then, and the app runs read-only
 *   (DR-MIG-04).
 */
export function runMigrations(storage = window.localStorage) {
  try {
    const version = readSchemaVersion(storage);
    if (version > SCHEMA_VERSION) return { newer: true };

    if (version < SCHEMA_VERSION) {
      const tasks = readJson(storage, STORAGE_KEYS.tasks);
      const team = readJson(storage, STORAGE_KEYS.team);
      if (tasks.present && Array.isArray(tasks.value)) {
        const next = migrateData({ tasks: tasks.value, team: team.value }, version);
        storage.setItem(STORAGE_KEYS.tasks, JSON.stringify(next.tasks));
        if (Array.isArray(next.team)) storage.setItem(STORAGE_KEYS.team, JSON.stringify(next.team));
      }
    }
    storage.setItem(STORAGE_KEYS.meta, JSON.stringify({ schemaVersion: SCHEMA_VERSION }));
  } catch {
    /* storage blocked or full — the app still runs from memory */
  }
  return { newer: false };
}
