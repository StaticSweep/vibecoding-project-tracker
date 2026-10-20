/**
 * Shared constants. Import these everywhere — never repeat the ids or
 * labels as string literals (NFR-MAINT-01, DR-TASK-05).
 */

// The four columns of the board, in render order (PRD §7).
export const STAGES = [
  { id: 'todo',        label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review',      label: 'Review' },
  { id: 'done',        label: 'Done' },
];

export const STAGE_IDS = STAGES.map((s) => s.id);

// Placeholder team. Replace with the real team before the pitch (PRD §8).
// These are the only valid values for `Task.assignee`.
export const TEAM = ['Alex B.', 'Sam K.', 'Jo M.'];

export const TYPES = [
  { id: 'feature', label: 'Feature' },
  { id: 'bug',     label: 'Bug' },
];

export const TYPE_IDS = TYPES.map((t) => t.id);

// M9 context
export const CONTEXT_TOOLS = ['Claude', 'ChatGPT', 'Cursor', 'Lovable', 'Replit', 'Other'];

// DR-STO-01: every key uses the `vibetracker.` prefix.
export const STORAGE_KEYS = {
  tasks: 'vibetracker.tasks',
  anchors: 'vibetracker.anchors',
  meta: 'vibetracker.meta',
  prefs: 'vibetracker.prefs',
};

export const TITLE_MAX = 120;
export const DESCRIPTION_MAX = 2000;
