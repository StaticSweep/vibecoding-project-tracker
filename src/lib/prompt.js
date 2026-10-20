import { STAGES, TYPES } from './constants.js';
import { formatDueLabel } from './dates.js';
import { hasContext } from './context.js';
import { isKnownAssignee } from './tasks.js';

/**
 * "Copy as Prompt Context" serialisation (M10 copy-prompt, FR-M10-02/07/08).
 *
 * A pure function: the same task and dates always give the same text.
 * Empty fields are left out cleanly — the output never contains
 * "undefined", "null" or empty headings. The context is copied verbatim.
 */
export function taskToPrompt(task, { today } = {}) {
  const typeLabel = TYPES.find((t) => t.id === task.type)?.label ?? 'Feature';
  const stageLabel = STAGES.find((s) => s.id === task.status)?.label ?? 'To Do';
  const owner = isKnownAssignee(task.assignee) ? task.assignee : 'Unassigned';

  const facts = [
    `- **Type:** ${typeLabel}`,
    `- **Status:** ${stageLabel}`,
    `- **Owner:** ${owner}`,
  ];

  if (task.dueDate) {
    const label = today ? formatDueLabel(task, today) : '';
    facts.push(`- **Due:** ${task.dueDate}${label ? ` (${label})` : ''}`);
  }

  if (task.contextUpdatedAt) {
    const when = formatTimestamp(task.contextUpdatedAt);
    facts.push(`- **Context last updated:** ${when}${task.contextTool ? ` via ${task.contextTool}` : ''}`);
  } else if (task.contextTool) {
    facts.push(`- **Tool:** ${task.contextTool}`);
  }

  const sections = [`# Task: ${task.title.trim() || 'Untitled task'}`, facts.join('\n')];

  if (task.description?.trim()) {
    sections.push(`## Description\n${task.description.trim()}`);
  }

  // Headings inside the context go one level down, so they nest under
  // "## Context" (the stored context itself stays verbatim).
  const context = hasContext(task)
    ? task.context.replace(/\s+$/, '').replace(/^(#{1,5}) /gm, '#$1 ')
    : 'No context recorded yet.';
  sections.push(`## Context\n${context}`);

  sections.push(
    '## What I need from you\n' +
      'Continue this task from where the context leaves off. Ask before changing anything outside its scope.',
  );

  return `${sections.join('\n\n')}\n`;
}

/** ISO timestamp → local "YYYY-MM-DD HH:mm". */
function formatTimestamp(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
