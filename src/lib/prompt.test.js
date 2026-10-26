import { describe, expect, it } from 'vitest';
import { taskToPrompt } from './prompt.js';

const team = [{ id: 'm1', name: 'Sam K.', email: null, role: 'junior', createdAt: null }];
const base = {
  id: 't1',
  title: 'Fix the toast',
  description: '',
  type: 'bug',
  status: 'in-progress',
  assignee: 'm1',
  dueDate: '2026-10-27',
  createdDate: '2026-10-20',
  context: '',
  contextTool: null,
  contextUpdatedAt: null,
  contextHistory: [],
};

describe('taskToPrompt', () => {
  it('shows the project, the owner with their role, and the due label', () => {
    const text = taskToPrompt(base, { today: '2026-10-26', team, workspace: { projectName: 'Slopify' } });
    expect(text).toContain('# Task: Fix the toast');
    expect(text).toContain('- **Project:** Slopify');
    expect(text).toContain('- **Owner:** Sam K. (Junior developer)');
    expect(text).toContain('- **Due:** 2026-10-27 (Due tomorrow)');
    expect(text).toContain('No context recorded yet.');
  });

  it('never prints undefined, null or empty sections', () => {
    const text = taskToPrompt({ ...base, assignee: null, dueDate: null }, {});
    expect(text).not.toMatch(/undefined|null|## Description/);
    expect(text).toContain('- **Owner:** Unassigned');
  });

  it('nests context headings and lists links only when asked', () => {
    const anchors = [
      { id: 'demo', label: 'Demo', url: 'https://demo.example.com/' },
      { id: 'report', label: 'Report', url: null },
    ];
    const task = { ...base, context: '## Goal\nShip it\n\n' };
    expect(taskToPrompt(task, { team, anchors })).not.toContain('Deliverable links');
    const text = taskToPrompt(task, { team, anchors, includeLinks: true });
    expect(text).toContain('### Goal\nShip it\n\n## Deliverable links\n- Demo: https://demo.example.com/');
    expect(text).not.toContain('Report:');
  });
});
