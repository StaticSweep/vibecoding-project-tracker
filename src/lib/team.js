import { LEGACY_TEAM, MEMBER_NAME_MAX, PROJECT_NAME_MAX, ROLE_IDS, ROLES } from './constants.js';
import { createId } from './ids.js';

/**
 * Team members and the workspace (schema v3).
 *
 *   Member    = { id, name, email: string|null, role: RoleId|null, createdAt }
 *   Workspace = { projectName, teamName, leadId: memberId|null }
 *
 * One project, one team (Q&A). `Task.assignee` holds a member id, or null
 * for Unassigned, so a renamed member keeps their tasks.
 *
 * There is no sign-in. Slopify always acts as the team lead: "you" in the
 * UI, the default owner of new tasks and the "My tasks" filter.
 */

export const DEFAULT_WORKSPACE = { projectName: 'Vibecoding project', teamName: '', leadId: null };

/** The team for a brand-new board: the placeholder names, the first is the lead. */
export function buildDefaultTeam(nowIso = new Date().toISOString()) {
  return LEGACY_TEAM.map((name) => createMember({ name }, nowIso));
}

// Simple shape check only: something@something.tld. Nothing is ever sent.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const oneLine = (s) => s.replace(/\s+/g, ' ').trim();

export function createMember({ name, email = '', role = null }, nowIso = new Date().toISOString()) {
  return {
    id: createId(),
    name: oneLine(name).slice(0, MEMBER_NAME_MAX),
    email: email.trim() || null,
    role: ROLE_IDS.includes(role) ? role : null,
    createdAt: nowIso,
  };
}

/** One stored member → the v3 shape, or null when it has no usable name. */
export function normaliseMember(raw) {
  if (!isObject(raw) || typeof raw.name !== 'string' || !oneLine(raw.name)) return null;
  return {
    ...raw,
    id: typeof raw.id === 'string' && raw.id ? raw.id : createId(),
    name: oneLine(raw.name).slice(0, MEMBER_NAME_MAX),
    email: typeof raw.email === 'string' && EMAIL.test(raw.email.trim()) ? raw.email.trim() : null,
    role: ROLE_IDS.includes(raw.role) ? raw.role : null,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : null,
  };
}

/**
 * Stored team → `{ ok, value, dropped }` for useLocalStorage. Idempotent.
 * A team needs at least one member (the lead), so an empty list is not ok.
 */
export function normaliseTeam(raw) {
  if (!Array.isArray(raw)) return { ok: false, value: [], dropped: 0 };
  const seen = new Set();
  const value = [];
  let dropped = 0;
  for (const entry of raw) {
    const member = normaliseMember(entry);
    if (!member || seen.has(member.id)) {
      dropped += 1;
      continue;
    }
    seen.add(member.id);
    value.push(member);
  }
  return { ok: value.length > 0, value, dropped };
}

export function normaliseWorkspace(raw) {
  if (!isObject(raw)) return { ok: false, value: { ...DEFAULT_WORKSPACE }, dropped: 0 };
  const text = (v, fallback) => (typeof v === 'string' ? oneLine(v).slice(0, PROJECT_NAME_MAX) : fallback);
  return {
    ok: true,
    value: {
      ...raw,
      projectName: text(raw.projectName, '') || DEFAULT_WORKSPACE.projectName,
      teamName: text(raw.teamName, DEFAULT_WORKSPACE.teamName),
      leadId: typeof raw.leadId === 'string' && raw.leadId ? raw.leadId : null,
    },
    dropped: 0,
  };
}

/** The team lead: the member in `workspace.leadId`, else the first member. */
export function teamLead(team, workspace) {
  return findMember(team, workspace?.leadId) ?? team[0] ?? null;
}

export function findMember(team, id) {
  return id ? team.find((m) => m.id === id) ?? null : null;
}

/** Display name of an assignee id; "Unassigned" when the id is not in the team (FR-M7-05). */
export function memberName(team, id) {
  return findMember(team, id)?.name ?? 'Unassigned';
}

export function roleLabel(roleId) {
  return ROLES.find((r) => r.id === roleId)?.label ?? '';
}

/** "Sam K. (UX designer)" — used in the copied prompt and tooltips. */
export function memberWithRole(member) {
  if (!member) return 'Unassigned';
  const role = roleLabel(member.role);
  return role ? `${member.name} (${role})` : member.name;
}

/** End a sentence with a name: "Jo M." already ends with a full stop. */
export function endSentence(text) {
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

/** "Sam K." → "Sam" — for short labels such as "Contact Sam". */
export function firstName(name) {
  return name.split(/\s+/)[0] || name;
}

/** "Alex B." → "AB" */
export function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

/**
 * Check a member form (Settings → Team, setup, sign-in).
 * Returns `{}` when valid, else `{ name?, email? }` messages in DESIGN.md voice.
 */
export function validateMember({ name, email }, team, editingId = null) {
  const errors = {};
  const clean = oneLine(name ?? '');
  if (!clean) errors.name = 'Type a name.';
  else if (clean.length > MEMBER_NAME_MAX) errors.name = `Use ${MEMBER_NAME_MAX} characters or fewer.`;
  else if (team.some((m) => m.id !== editingId && m.name.toLowerCase() === clean.toLowerCase())) {
    errors.name = 'A team member has this name. Use a different name.';
  }
  const mail = (email ?? '').trim();
  if (mail && !EMAIL.test(mail)) errors.email = 'Type an email address, for example sam@example.com.';
  return errors;
}

/** Team with one member changed (name, email, role only — id and createdAt never change). */
export function updateMember(team, id, { name, email, role }) {
  return team.map((m) =>
    m.id === id
      ? {
          ...m,
          name: oneLine(name).slice(0, MEMBER_NAME_MAX),
          email: (email ?? '').trim() || null,
          role: ROLE_IDS.includes(role) ? role : null,
        }
      : m,
  );
}
