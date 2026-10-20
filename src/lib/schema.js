import { STORAGE_KEYS } from './constants.js';

/**
 * Data schema versioning (PRD §14.4.7, DR-MIG-01…03).
 *   v0 — tasks without the M9 context fields
 *   v1 — the full PRD §5 model
 */
export const SCHEMA_VERSION = 1;

/** Stored schema version. A missing or unreadable `meta` key counts as v0. */
export function readSchemaVersion() {
  try {
    const meta = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.meta));
    return Number.isInteger(meta?.schemaVersion) ? meta.schemaVersion : 0;
  } catch {
    return 0;
  }
}

export function writeSchemaVersion() {
  try {
    window.localStorage.setItem(STORAGE_KEYS.meta, JSON.stringify({ schemaVersion: SCHEMA_VERSION }));
  } catch {
    /* the tasks write reports storage errors */
  }
}

/**
 * Upgrade stored tasks to the current version. Additive and idempotent: it
 * only adds missing fields with defaults and never removes user content.
 * Non-array input is returned unchanged for the normaliser to reject.
 */
export function migrateTasks(raw, fromVersion) {
  if (!Array.isArray(raw) || fromVersion >= SCHEMA_VERSION) return raw;

  // v0 → v1: add the M9 context fields.
  return raw.map((t) =>
    t && typeof t === 'object' && !Array.isArray(t)
      ? { context: '', contextTool: null, contextUpdatedAt: null, ...t }
      : t,
  );
}
