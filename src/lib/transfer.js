import { STORAGE_KEYS, STORAGE_PREFIX } from './constants.js';
import { normaliseTasks } from './tasks.js';
import { normaliseAnchors } from './anchors.js';
import { normaliseTeam, normaliseWorkspace } from './team.js';
import { SCHEMA_VERSION, migrateData } from './schema.js';

/**
 * Export, import and storage size (PRD §14.4.9, FR-DATA-04/05, DR-EXP,
 * DR-IMP, DR-CAP-02). localStorage is per browser, so a JSON file is the
 * way to move a board between teammates.
 *
 *   { app: 'vibetracker', schemaVersion: 3, exportedAt, workspace, team, tasks, anchors }
 */

export const APP_ID = 'vibetracker';

// localStorage holds about 5 MB per site; warn well before that.
export const STORAGE_LIMIT_BYTES = 5 * 1024 * 1024;
export const STORAGE_WARN_BYTES = 4 * 1024 * 1024;

const NOT_SLOPIFY = 'Slopify cannot read this file. Choose a file that Slopify exported.';
const TOO_NEW = 'A newer version of Slopify made this file. Update Slopify, then try again.';

/** The export object (DR-EXP-01). Prefs and `.backup` keys are never included (DR-EXP-02). */
export function buildExport({ tasks, anchors, team, workspace }, nowIso = new Date().toISOString()) {
  return { app: APP_ID, schemaVersion: SCHEMA_VERSION, exportedAt: nowIso, workspace, team, tasks, anchors };
}

export function exportFileName(today) {
  return `vibetracker-${today}.json`;
}

/**
 * Read an exported file (DR-IMP-01/02): check it, migrate it to the current
 * version and normalise it exactly like data loaded from storage.
 *
 * @returns {{ ok: true, data: { tasks, anchors, team, workspace }, dropped: number }
 *          | { ok: false, error: string }}
 */
export function parseImport(text, today) {
  let file;
  try {
    file = JSON.parse(text);
  } catch {
    return { ok: false, error: NOT_SLOPIFY };
  }
  if (!file || typeof file !== 'object' || file.app !== APP_ID || !Number.isInteger(file.schemaVersion)) {
    return { ok: false, error: NOT_SLOPIFY };
  }
  if (file.schemaVersion > SCHEMA_VERSION) return { ok: false, error: TOO_NEW };
  if (!Array.isArray(file.tasks)) return { ok: false, error: NOT_SLOPIFY };

  const migrated = migrateData({ tasks: file.tasks, team: file.team }, file.schemaVersion);
  const tasks = normaliseTasks(migrated.tasks, today);
  const team = normaliseTeam(migrated.team);
  if (!team.ok) return { ok: false, error: NOT_SLOPIFY };
  const anchors = normaliseAnchors(Array.isArray(file.anchors) ? file.anchors : []);

  return {
    ok: true,
    data: {
      tasks: tasks.tasks,
      team: team.value,
      workspace: normaliseWorkspace(file.workspace ?? {}).value,
      anchors: anchors.value,
    },
    dropped: tasks.dropped + team.dropped,
  };
}

/** Rough size of Slopify's data in this browser: UTF-16, 2 bytes per character. */
export function estimateStorageBytes(storage = window.localStorage) {
  let chars = 0;
  try {
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) chars += key.length + (storage.getItem(key) ?? '').length;
    }
  } catch {
    return 0;
  }
  return chars * 2;
}

/** "0.2 MB" */
export function formatMegabytes(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(bytes < 1024 * 1024 ? 2 : 1)} MB`;
}

/** Remove the `.backup` copies (Reset board, DR-PRIV-03). */
export function removeBackups(storage = window.localStorage) {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => storage.removeItem(`${key}.backup`));
  } catch {
    /* storage blocked */
  }
}

/** Remove every `vibetracker.*` key, prefs too (Delete all data). */
export function clearAllData(storage = window.localStorage) {
  try {
    const keys = [];
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) keys.push(key);
    }
    keys.forEach((key) => storage.removeItem(key));
  } catch {
    /* storage blocked */
  }
}

/**
 * The board straight from storage, with no React state — for the error
 * screen's "Export my data" (NFR-REL-02). Unreadable keys are left out.
 */
export function readBoardFromStorage(storage = window.localStorage) {
  const read = (key) => {
    try {
      return JSON.parse(storage.getItem(key));
    } catch {
      return null;
    }
  };
  return {
    tasks: read(STORAGE_KEYS.tasks) ?? [],
    anchors: read(STORAGE_KEYS.anchors) ?? [],
    team: read(STORAGE_KEYS.team) ?? [],
    workspace: read(STORAGE_KEYS.workspace) ?? {},
  };
}

/** Save `data` as a pretty-printed UTF-8 JSON file (DR-EXP-01). */
export function downloadJson(filename, data) {
  const blob = new Blob([`${JSON.stringify(data, null, 2)}\n`], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
