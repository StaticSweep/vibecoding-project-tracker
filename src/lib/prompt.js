import { STAGES, TYPES } from './constants.js';
import { formatDueLabel } from './dates.js';
import { hasContext } from './context.js';
import { findMember, memberWithRole } from './team.js';

/**
 * "Copy as Prompt Context" serialisation (M10 copy-prompt, FR-M10-02/07/08).
 *
 * A pure function: the same task and dates always give the same text.
 * Empty fields are left out cleanly — the output never contains
 * "undefined", "null" or empty headings. The context is copied verbatim.
 *
 * Options:
 *   today      'YYYY-MM-DD', for the relative due label
 *   team       Member[], so the owner shows with their role — the AI can
 *              pitch its answer at a junior developer or an architect
 *   workspace  { projectName }
 *   anchors    Anchor[], listed when `includeLinks` is true (FR-M10-10)
 */
export function taskToPrompt(task, { today, team = [], workspace, anchors = [], includeLinks = false } = {}) {
  const typeLabel = TYPES.find((t) => t.id === task.type)?.label ?? 'Feature';
  const stageLabel = STAGES.find((s) => s.id === task.status)?.label ?? 'To Do';
  const owner = memberWithRole(findMember(team, task.assignee));

  const facts = [];
  if (workspace?.projectName?.trim()) facts.push(`- **Project:** ${workspace.projectName.trim()}`);
  facts.push(
    `- **Type:** ${typeLabel}`,
    `- **Status:** ${stageLabel}`,
    `- **Owner:** ${owner}`,
  );

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

  const links = includeLinks ? anchors.filter((a) => a.url) : [];
  if (links.length > 0) {
    sections.push(`## Deliverable links\n${links.map((a) => `- ${a.label}: ${a.url}`).join('\n')}`);
  }

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
