import { CONTEXT_TOOLS } from './constants.js';

/**
 * Prompt history timeline (M12 secret-sauce).
 *
 * Each time a task's context or tool changes, the previous version is kept in
 * `task.contextHistory` (newest first). This is an additive, optional field
 * with a default of [] (NFR-REL-05, DR-LIFE-03), so older data still loads.
 *
 *   ContextVersion = { context: string, contextTool: string|null, savedAt: ISO string }
 */

// Keep storage small (DR-CAP): the newest 20 earlier versions per task.
export const HISTORY_MAX = 20;

/** Clean a stored history list; drop unusable entries. Idempotent. */
export function normaliseHistory(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((v) => v && typeof v === 'object' && typeof v.context === 'string' && v.context.trim() !== '')
    .map((v) => ({
      context: v.context,
      contextTool: CONTEXT_TOOLS.includes(v.contextTool) ? v.contextTool : null,
      savedAt: typeof v.savedAt === 'string' && !Number.isNaN(Date.parse(v.savedAt)) ? v.savedAt : null,
    }))
    .slice(0, HISTORY_MAX);
}

/**
 * History after a save. When the context or tool changed and the old version
 * had text, the old version goes to the front of the list.
 */
export function nextHistory(before, after, nowIso = new Date().toISOString()) {
  const history = normaliseHistory(before?.contextHistory);
  const changed =
    (before?.context ?? '') !== after.context || (before?.contextTool ?? null) !== after.contextTool;
  if (!before || !changed || (before.context ?? '').trim() === '') return history;

  const previous = {
    context: before.context,
    contextTool: before.contextTool ?? null,
    savedAt: before.contextUpdatedAt ?? nowIso,
  };
  return [previous, ...history].slice(0, HISTORY_MAX);
}

/** Total number of versions, counting the current one. */
export function versionCount(task) {
  const current = (task.context ?? '').trim() !== '' ? 1 : 0;
  return current + normaliseHistory(task.contextHistory).length;
}
