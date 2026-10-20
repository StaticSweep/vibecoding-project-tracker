/**
 * Context field helpers (M9 context).
 */

// "Insert template" headings (FR-M9-09, DESIGN.md §5).
export const CONTEXT_TEMPLATE = [
  '## Goal',
  '',
  '## Done so far',
  '',
  '## Limits',
  '',
  '## Files',
  '',
  '## Last prompt',
  '',
  '## Next step',
  '',
].join('\n');

// Soft warning above this length (FR-M9-11); localStorage holds ~5 MB.
export const CONTEXT_WARN_LENGTH = 20_000;

// A context older than this is "stale" on a task that is not done (FR-M9-12).
export const STALE_CONTEXT_DAYS = 3;

export function hasContext(task) {
  return typeof task.context === 'string' && task.context.trim() !== '';
}

/** True when the task is open and its context is older than STALE_CONTEXT_DAYS. */
export function isContextStale(task, now = Date.now()) {
  if (task.status === 'done' || !hasContext(task) || !task.contextUpdatedAt) return false;
  return now - Date.parse(task.contextUpdatedAt) > STALE_CONTEXT_DAYS * 86_400_000;
}

/**
 * contextUpdatedAt after a save (FR-M9-04, DR-LIFE): set to "now" only when
 * the context or the tool changed; otherwise keep the old value.
 */
export function nextContextUpdatedAt(before, after, nowIso = new Date().toISOString()) {
  const changed =
    (before?.context ?? '') !== after.context || (before?.contextTool ?? null) !== after.contextTool;
  if (!changed) return before?.contextUpdatedAt ?? null;
  return after.context.trim() === '' && after.contextTool === null ? null : nowIso;
}
