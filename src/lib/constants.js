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

// The placeholder team of schema v0–v2. The team now lives in
// `vibetracker.team`; this list only seeds it when older data is migrated.
export const LEGACY_TEAM = ['Alex B.', 'Sam K.', 'Jo M.'];

// Kept for compatibility with the starter's `export { TEAM } from App.jsx`.
export const TEAM = LEGACY_TEAM;

// What each team member does (Q&A: target audience). Optional on a member.
export const ROLES = [
  { id: 'swe',       label: 'Software engineer' },
  { id: 'architect', label: 'Architect' },
  { id: 'senior',    label: 'Senior developer' },
  { id: 'junior',    label: 'Junior developer' },
  { id: 'ux',        label: 'UX designer' },
  { id: 'database',  label: 'Database engineer' },
  { id: 'other',     label: 'Other' },
];

export const ROLE_IDS = ROLES.map((r) => r.id);

export const TYPES = [
  { id: 'feature', label: 'Feature' },
  { id: 'bug',     label: 'Bug' },
];

export const TYPE_IDS = TYPES.map((t) => t.id);

// M9 context
export const CONTEXT_TOOLS = ['Claude', 'ChatGPT', 'Cursor', 'Lovable', 'Replit', 'Other'];

// DR-STO-01: every key uses the `vibetracker.` prefix.
export const STORAGE_PREFIX = 'vibetracker.';
export const STORAGE_KEYS = {
  tasks: 'vibetracker.tasks',
  anchors: 'vibetracker.anchors',
  team: 'vibetracker.team',
  workspace: 'vibetracker.workspace',
  meta: 'vibetracker.meta',
  prefs: 'vibetracker.prefs',
};

export const TITLE_MAX = 120;
export const DESCRIPTION_MAX = 2000;
export const MEMBER_NAME_MAX = 40;
export const PROJECT_NAME_MAX = 60;
