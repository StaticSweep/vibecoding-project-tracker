import { STAGE_IDS, TEAM, TYPE_IDS, CONTEXT_TOOLS } from './constants.js';
import { addDays, isISODate } from './dates.js';
import { normaliseHistory } from './history.js';

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {'feature'|'bug'} type
 * @property {'todo'|'in-progress'|'review'|'done'} status
 * @property {string} assignee
 * @property {string|null} dueDate          ISO 'YYYY-MM-DD'
 * @property {string} createdDate           ISO 'YYYY-MM-DD'
 * @property {string} context               M9
 * @property {string|null} contextTool      M9
 * @property {string|null} contextUpdatedAt M9, ISO timestamp
 * @property {Array<{context: string, contextTool: string|null, savedAt: string|null}>} contextHistory
 *           M12, earlier context versions, newest first (optional, default [])
 */

/** New unique task id (FR-M5-03). */
export function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/**
 * Bring one stored task into the §5 shape (DR-INT-02/03/05/07).
 * Returns `null` when the entry cannot be used (not an object, or no title).
 * Unknown extra fields are kept. The function is idempotent (DR-INT-08).
 */
export function normaliseTask(raw, today) {
  if (!isObject(raw)) return null;

  const title = typeof raw.title === 'string' ? raw.title.replace(/\s*\n\s*/g, ' ').trim() : '';
  if (!title) return null;

  return {
    ...raw, // DR-INT-07: keep unknown fields
    id: typeof raw.id === 'string' && raw.id ? raw.id : createId(),
    title,
    description: typeof raw.description === 'string' ? raw.description : '',
    type: TYPE_IDS.includes(raw.type) ? raw.type : 'feature',
    status: STAGE_IDS.includes(raw.status) ? raw.status : 'todo',
    // DR-INT-05: keep an unknown assignee as stored; the UI shows "Unassigned".
    assignee: typeof raw.assignee === 'string' ? raw.assignee : '',
    dueDate: isISODate(raw.dueDate) ? raw.dueDate : null,
    createdDate: isISODate(raw.createdDate) ? raw.createdDate : today,
    context: typeof raw.context === 'string' ? raw.context : '',
    contextTool: CONTEXT_TOOLS.includes(raw.contextTool) ? raw.contextTool : null,
    contextUpdatedAt:
      typeof raw.contextUpdatedAt === 'string' && !Number.isNaN(Date.parse(raw.contextUpdatedAt))
        ? raw.contextUpdatedAt
        : null,
    contextHistory: normaliseHistory(raw.contextHistory), // M12
  };
}

/**
 * Normalise a stored task list (FR-DATA-01, DR-INT-01…08).
 * @returns {{ ok: boolean, tasks: Task[], dropped: number }}
 *   `ok` is false when the value is not an array at all.
 */
export function normaliseTasks(raw, today) {
  if (!Array.isArray(raw)) return { ok: false, tasks: [], dropped: 0 };

  const seen = new Set();
  const tasks = [];
  let dropped = 0;

  for (const entry of raw) {
    const task = normaliseTask(entry, today);
    if (!task) {
      dropped += 1;
      continue;
    }
    // DR-INT-04: keep the first task with an id; give later duplicates a new id.
    if (seen.has(task.id)) task.id = createId();
    seen.add(task.id);
    tasks.push(task);
  }

  return { ok: true, tasks, dropped };
}

/** True when `assignee` is a current team member (FR-M7-05). */
export function isKnownAssignee(assignee) {
  return TEAM.includes(assignee);
}

/**
 * Card order inside a column (FR-M4-11): due date ascending, tasks without a
 * due date last, ties broken by createdDate (oldest first).
 */
export function compareTasks(a, b) {
  if (a.dueDate !== b.dueDate) {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate < b.dueDate ? -1 : 1;
  }
  if (a.createdDate !== b.createdDate) return a.createdDate < b.createdDate ? -1 : 1;
  return 0;
}

/**
 * Seed tasks for the first load (FR-M4-03, DR-SEED-01/02).
 * Dates are relative to `today`, so the due states stay correct.
 */
export function buildSeedTasks(today) {
  const base = { description: '', context: '', contextTool: null, contextUpdatedAt: null, contextHistory: [] };
  return [
    {
      ...base,
      id: createId(),
      title: 'Show the four stages as columns on the board',
      type: 'feature',
      status: 'in-progress',
      assignee: TEAM[0],
      dueDate: addDays(today, 1),
      createdDate: addDays(today, -2),
    },
    {
      ...base,
      id: createId(),
      title: 'Long card titles push the stage controls off the card',
      type: 'bug',
      status: 'todo',
      assignee: TEAM[1],
      dueDate: addDays(today, -1),
      createdDate: addDays(today, -3),
    },
    {
      ...base,
      id: createId(),
      title: 'Write the template for "Copy as Prompt Context"',
      type: 'feature',
      status: 'review',
      assignee: TEAM[2],
      dueDate: addDays(today, 4),
      createdDate: addDays(today, -1),
    },
    {
      ...base,
      id: createId(),
      title: 'Choose the colour tokens and fonts',
      type: 'feature',
      status: 'done',
      assignee: TEAM[1],
      dueDate: addDays(today, -2),
      createdDate: addDays(today, -4),
    },
  ];
}
