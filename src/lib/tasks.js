import { STAGE_IDS, TYPE_IDS, CONTEXT_TOOLS } from './constants.js';
import { addDays, isISODate } from './dates.js';
import { normaliseHistory } from './history.js';
import { createId } from './ids.js';
import { normaliseActivity } from './activity.js';

export { createId };

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {'feature'|'bug'} type
 * @property {'todo'|'in-progress'|'review'|'done'} status
 * @property {string|null} assignee       team member id (schema v3); null = Unassigned
 * @property {string|null} dueDate          ISO 'YYYY-MM-DD'
 * @property {string} createdDate           ISO 'YYYY-MM-DD'
 * @property {string} context               M9
 * @property {string|null} contextTool      M9
 * @property {string|null} contextUpdatedAt M9, ISO timestamp
 * @property {Array<{context: string, contextTool: string|null, savedAt: string|null}>} contextHistory
 *           M12, earlier context versions, newest first (optional, default [])
 * @property {string|null} createdBy        v4, member id of the creator
 * @property {string|null} updatedBy        v4, member id of the last change
 * @property {string|null} updatedAt        v4, ISO timestamp of the last change
 * @property {Array} activity               v4, who did what, newest first (src/lib/activity.js)
 */

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
    // DR-INT-05: keep an unknown assignee id as stored; the UI shows "Unassigned".
    assignee: typeof raw.assignee === 'string' && raw.assignee ? raw.assignee : null,
    dueDate: isISODate(raw.dueDate) ? raw.dueDate : null,
    createdDate: isISODate(raw.createdDate) ? raw.createdDate : today,
    context: typeof raw.context === 'string' ? raw.context : '',
    contextTool: CONTEXT_TOOLS.includes(raw.contextTool) ? raw.contextTool : null,
    contextUpdatedAt:
      typeof raw.contextUpdatedAt === 'string' && !Number.isNaN(Date.parse(raw.contextUpdatedAt))
        ? raw.contextUpdatedAt
        : null,
    contextHistory: normaliseHistory(raw.contextHistory), // M12
    // v4: attribution and activity
    createdBy: typeof raw.createdBy === 'string' && raw.createdBy ? raw.createdBy : null,
    updatedBy: typeof raw.updatedBy === 'string' && raw.updatedBy ? raw.updatedBy : null,
    updatedAt: typeof raw.updatedAt === 'string' && !Number.isNaN(Date.parse(raw.updatedAt)) ? raw.updatedAt : null,
    activity: normaliseActivity(raw.activity),
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

/**
 * True when a task passes the board filters.
 *   filters = { owner: 'all' | member id | 'unassigned', type: 'all' | type id, query: string }
 * The search looks in the title, description and context, ignoring case.
 */
export function matchesFilters(task, { owner = 'all', type = 'all', query = '' }, team) {
  if (type !== 'all' && task.type !== type) return false;
  if (owner === 'unassigned' && team.some((m) => m.id === task.assignee)) return false;
  if (owner !== 'all' && owner !== 'unassigned' && task.assignee !== owner) return false;
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const text = `${task.title}\n${task.description}\n${task.context}`.toLowerCase();
  return words.every((w) => text.includes(w));
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
 * Starter tasks for a new board (FR-M4-03, DR-SEED-01/02). Dates are
 * relative to `today`, so the due states stay correct. The tasks go round
 * the given member ids; with no ids they are Unassigned.
 */
export function buildSeedTasks(today, memberIds = []) {
  const owner = (i) => (memberIds.length ? memberIds[i % memberIds.length] : null);
  const base = {
    description: '',
    context: '',
    contextTool: null,
    contextUpdatedAt: null,
    contextHistory: [],
    createdBy: null,
    updatedBy: null,
    updatedAt: null,
    activity: [],
  };
  return [
    {
      ...base,
      id: createId(),
      title: 'Show the four stages as columns on the board',
      type: 'feature',
      status: 'in-progress',
      assignee: owner(0),
      dueDate: addDays(today, 1),
      createdDate: addDays(today, -2),
    },
    {
      ...base,
      id: createId(),
      title: 'Long card titles push the stage controls off the card',
      type: 'bug',
      status: 'todo',
      assignee: owner(1),
      dueDate: addDays(today, -1),
      createdDate: addDays(today, -3),
    },
    {
      ...base,
      id: createId(),
      title: 'Write the template for "Copy as Prompt Context"',
      type: 'feature',
      status: 'review',
      assignee: owner(2),
      dueDate: addDays(today, 4),
      createdDate: addDays(today, -1),
    },
    {
      ...base,
      id: createId(),
      title: 'Choose the colour tokens and fonts',
      type: 'feature',
      status: 'done',
      assignee: owner(3),
      dueDate: addDays(today, -2),
      createdDate: addDays(today, -4),
    },
  ];
}
