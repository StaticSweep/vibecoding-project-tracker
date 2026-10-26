import { describe, expect, it } from 'vitest';
import {
  buildDefaultTeam,
  createMember,
  memberName,
  memberWithRole,
  normaliseTeam,
  normaliseWorkspace,
  teamLead,
  updateMember,
  validateMember,
} from './team.js';

const team = [
  { id: 'm1', name: 'Alex B.', email: null, role: 'architect', createdAt: null },
  { id: 'm2', name: 'Sam K.', email: 'sam@example.com', role: 'ux', createdAt: null },
];

describe('validateMember', () => {
  it('needs a unique name', () => {
    expect(validateMember({ name: '  ' }, team).name).toBe('Type a name.');
    expect(validateMember({ name: 'sam k.' }, team).name).toMatch(/has this name/);
    expect(validateMember({ name: 'Sam K.' }, team, 'm2')).toEqual({});
  });

  it('checks the email only when given', () => {
    expect(validateMember({ name: 'New', email: '' }, team)).toEqual({});
    expect(validateMember({ name: 'New', email: 'nope' }, team).email).toBeTruthy();
  });
});

describe('team helpers', () => {
  it('names the lead from the workspace, else the first member', () => {
    expect(teamLead(team, { leadId: 'm2' }).name).toBe('Sam K.');
    expect(teamLead(team, { leadId: 'gone' }).name).toBe('Alex B.');
    expect(teamLead(team, null).name).toBe('Alex B.');
  });

  it('shows unknown ids as Unassigned', () => {
    expect(memberName(team, 'gone')).toBe('Unassigned');
    expect(memberName(team, null)).toBe('Unassigned');
    expect(memberWithRole(team[1])).toBe('Sam K. (UX designer)');
  });

  it('creates and updates members without touching id or createdAt', () => {
    const m = createMember({ name: '  Robin   Q. ', email: ' r@example.com ', role: 'junior' }, 'T');
    expect(m).toMatchObject({ name: 'Robin Q.', email: 'r@example.com', role: 'junior', createdAt: 'T' });
    const next = updateMember([m], m.id, { name: 'Robin', email: '', role: 'bogus' });
    expect(next[0]).toMatchObject({ id: m.id, name: 'Robin', email: null, role: null, createdAt: 'T' });
  });

  it('starts a new board with three placeholder members', () => {
    expect(buildDefaultTeam().map((m) => m.name)).toEqual(['Alex B.', 'Sam K.', 'Jo M.']);
  });
});

describe('normaliseTeam / normaliseWorkspace', () => {
  it('drops unusable and duplicate members, and rejects an empty team', () => {
    const result = normaliseTeam([...team, { id: 'm1', name: 'Dupe' }, { name: '' }, 'x', { name: 'No id', email: 'bad' }]);
    expect(result.ok).toBe(true);
    expect(result.value.map((m) => m.name)).toEqual(['Alex B.', 'Sam K.', 'No id']);
    expect(result.value[2].email).toBeNull();
    expect(result.dropped).toBe(3);
    expect(normaliseTeam([]).ok).toBe(false);
  });

  it('fills workspace defaults', () => {
    expect(normaliseWorkspace({ projectName: '  ', teamName: 'Slop' }).value).toMatchObject({
      projectName: 'Vibecoding project',
      teamName: 'Slop',
      leadId: null,
    });
    expect(normaliseWorkspace(null).ok).toBe(false);
  });
});
