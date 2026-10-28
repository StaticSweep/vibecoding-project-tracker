import { STAGES } from './constants.js';

/**
 * Who did what to a task (schema v4). Every change is attributed to the
 * logged-in profile, so the team can see the history of a task and each
 * person sees what was handed to them while they were away.
 *
 *   ActivityEntry = { at: ISO timestamp, by: memberId|null,
 *                     type: 'created'|'moved'|'handoff'|'edited'|'context'|'restored',
 *                     from?: string|null, to?: string|null }
 *
 * `from` / `to` hold stage ids for 'moved' and member ids for 'handoff'.
 */

export const ACTIVITY_TYPES = ['created', 'moved', 'handoff', 'edited', 'context', 'restored'];

// Keep storage small (DR-CAP): the newest 50 entries per task.
export const ACTIVITY_MAX = 50;

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const validTime = (v) => typeof v === 'string' && !Number.isNaN(Date.parse(v));
const idOrNull = (v) => (typeof v === 'string' && v ? v : null);

/** Clean a stored activity list; drop unusable entries. Idempotent. */
export function normaliseActivity(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((e) => isObject(e) && ACTIVITY_TYPES.includes(e.type) && validTime(e.at))
    .map((e) => {
      const entry = { at: e.at, by: idOrNull(e.by), type: e.type };
      if (e.type === 'moved' || e.type === 'handoff') {
        entry.from = idOrNull(e.from);
        entry.to = idOrNull(e.to);
      }
      return entry;
    })
    .slice(0, ACTIVITY_MAX);
}

/** One activity entry. */
export function activity(type, by, extra = {}, at = new Date().toISOString()) {
  return { at, by: by ?? null, type, ...extra };
}

/**
 * The task with new entries recorded (newest first) and `updatedBy` /
 * `updatedAt` set from the newest entry. `entries` is one entry or a list.
 */
export function withActivity(task, entries) {
  const list = (Array.isArray(entries) ? entries : [entries]).filter(Boolean);
  if (list.length === 0) return task;
  const newest = list[0];
  return {
    ...task,
    activity: [...list, ...normaliseActivity(task.activity)].slice(0, ACTIVITY_MAX),
    updatedBy: newest.by,
    updatedAt: newest.at,
  };
}

/**
 * Entries for a save from the task modal: one per kind of change, so the log
 * says "moved", "handed off", "updated the context" or "edited the details".
 */
export function editActivities(before, after, by, at = new Date().toISOString()) {
  const entries = [];
  if (before.status !== after.status) entries.push(activity('moved', by, { from: before.status, to: after.status }, at));
  if ((before.assignee ?? null) !== (after.assignee ?? null)) {
    entries.push(activity('handoff', by, { from: before.assignee ?? null, to: after.assignee ?? null }, at));
  }
  if ((before.context ?? '') !== after.context || (before.contextTool ?? null) !== after.contextTool) {
    entries.push(activity('context', by, {}, at));
  }
  const detailsChanged = ['title', 'description', 'type', 'dueDate'].some(
    (field) => (before[field] ?? null) !== (after[field] ?? null),
  );
  if (detailsChanged) entries.push(activity('edited', by, {}, at));
  return entries;
}

const stageLabel = (id) => STAGES.find((s) => s.id === id)?.label ?? 'another stage';

/**
 * One activity entry as a sentence, e.g. "Sam K. moved it to Review".
 * `nameOf(id)` returns a member's name, or null for a removed member.
 */
export function describeActivity(entry, nameOf) {
  const who = nameOf(entry.by) ?? 'A former team member';
  switch (entry.type) {
    case 'created':
      return `${who} created the task`;
    case 'moved':
      return `${who} moved it from ${stageLabel(entry.from)} to ${stageLabel(entry.to)}`;
    case 'handoff':
      return entry.to ? `${who} handed it to ${nameOf(entry.to) ?? 'a former team member'}` : `${who} made it Unassigned`;
    case 'context':
      return `${who} updated the context`;
    case 'restored':
      return `${who} restored it after a delete`;
    default:
      return `${who} edited the details`;
  }
}

/**
 * Tasks that someone else handed to `memberId` after `sinceIso` and that the
 * member still owns — for the "handed to you" notice at log-in.
 */
export function handedToSince(tasks, memberId, sinceIso) {
  const since = sinceIso ? Date.parse(sinceIso) : -Infinity;
  return tasks.filter(
    (t) =>
      t.assignee === memberId &&
      normaliseActivity(t.activity).some(
        (e) => e.type === 'handoff' && e.to === memberId && e.by !== memberId && Date.parse(e.at) > since,
      ),
  );
}
