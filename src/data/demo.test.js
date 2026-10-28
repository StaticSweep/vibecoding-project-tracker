import { describe, expect, it } from 'vitest';
import { buildDemoBoard } from './demo.js';
import { getDueState } from '../lib/dates.js';
import { normaliseTasks } from '../lib/tasks.js';
import { normaliseTeam } from '../lib/team.js';
import { handedToSince, normaliseActivity } from '../lib/activity.js';
import { CONTEXT_TOOLS, ROLE_IDS, STAGE_IDS, TYPE_IDS } from '../lib/constants.js';

const today = '2026-10-26';
const board = buildDemoBoard(today, Date.parse('2026-10-26T12:00:00Z'));

describe('demo board (FR-M13-01, DR-SEED-03)', () => {
  it('passes every validation rule', () => {
    expect(normaliseTasks(board.tasks, today).dropped).toBe(0);
    expect(normaliseTeam(board.team).dropped).toBe(0);
    expect(board.tasks.length).toBeGreaterThanOrEqual(8);
    expect(board.tasks.length).toBeLessThanOrEqual(12);
  });

  it('covers every stage, type, due state and member', () => {
    const set = (fn) => new Set(board.tasks.map(fn));
    expect(set((t) => t.status)).toEqual(new Set(STAGE_IDS));
    expect(set((t) => t.type)).toEqual(new Set(TYPE_IDS));
    expect(set((t) => getDueState(t, today))).toEqual(new Set(['done', 'overdue', 'warning', 'safe', 'none']));
    expect(set((t) => t.assignee)).toEqual(new Set(board.team.map((m) => m.id)));
  });

  it('has curated context, history, roles and two anchors', () => {
    const withContext = board.tasks.filter((t) => t.context.trim());
    expect(withContext.length).toBeGreaterThanOrEqual(3);
    expect(new Set(withContext.map((t) => t.contextTool)).size).toBeGreaterThanOrEqual(3);
    expect(withContext.every((t) => CONTEXT_TOOLS.includes(t.contextTool))).toBe(true);
    expect(board.tasks.some((t) => t.contextHistory.length >= 2)).toBe(true);
    expect(new Set(board.team.map((m) => m.role)).size).toBe(ROLE_IDS.length - 1); // all but "Other"
    expect(board.anchors.filter((a) => a.url)).toHaveLength(2);
    expect(board.team.some((m) => m.id === board.workspace.leadId)).toBe(true);
  });

  it('has a creator and a history on every task, and handoffs to show at log-in', () => {
    const ids = new Set(board.team.map((m) => m.id));
    for (const t of board.tasks) {
      expect(ids.has(t.createdBy)).toBe(true);
      expect(normaliseActivity(t.activity)).toEqual(t.activity);
      expect(t.activity.at(-1).type).toBe('created');
    }
    const jo = board.team.find((m) => m.name === 'Jo M.');
    expect(handedToSince(board.tasks, jo.id, null).length).toBe(2);
  });
});
