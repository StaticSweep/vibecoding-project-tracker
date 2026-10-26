import { ChevronLeft, ChevronRight, History, ScrollText } from 'lucide-react';
import { hasContext, isContextStale } from '../lib/context.js';
import { versionCount } from '../lib/history.js';
import { STAGES } from '../lib/constants.js';
import { formatDueLabel, formatLongDate, getDueState } from '../lib/dates.js';
import { DUE_STYLES } from '../lib/due.js';
import { findMember, memberWithRole } from '../lib/team.js';
import { useAppData, usePromptOptions } from '../context/AppData.jsx';
import { TYPE_STYLES } from '../lib/types.js';
import { focusRing, iconButton } from '../lib/ui.js';
import TypeBadge from './TypeBadge.jsx';
import Avatar from './Avatar.jsx';
import CopyPromptButton from './CopyPromptButton.jsx';
import { taskToPrompt } from '../lib/prompt.js';

/**
 * One task on the board (DESIGN.md §4.3 / §4.4).
 */
export default function TaskCard({ task, today, onMove, onOpen, onHandOff }) {
  const { team } = useAppData();
  const promptOptions = usePromptOptions();
  const stageIndex = STAGES.findIndex((s) => s.id === task.status);
  const prev = STAGES[stageIndex - 1];
  const next = STAGES[stageIndex + 1];

  const stripe = (TYPE_STYLES[task.type] ?? TYPE_STYLES.feature).stripe;
  const owner = findMember(team, task.assignee);
  const dueLabel = formatDueLabel(task, today);
  const due = DUE_STYLES[getDueState(task, today)];
  const DueIcon = due.icon;
  const withContext = hasContext(task);
  const stale = isContextStale(task);
  const versions = versionCount(task);
  const titleId = `task-title-${task.id}`;
  const stageSelectId = `task-stage-${task.id}`;
  const ownerSelectId = `task-owner-${task.id}`;

  return (
    <li>
      <article
        data-task-id={task.id}
        tabIndex={-1}
        aria-labelledby={titleId}
        className={`relative rounded-2xl border border-glass-edge/80 ${due.card} py-3 pl-5 pr-3 shadow-glass-sm backdrop-blur-xl transition-shadow duration-150 hover:shadow-glass focus-within:shadow-glass motion-reduce:transition-none reduce-transparency:backdrop-blur-none ${focusRing}`}
      >
        {/* Type stripe (FR-M6-01, DESIGN.md §2.2) — decoration; the badge carries the text. */}
        <span aria-hidden="true" className={`absolute bottom-3 left-2 top-3 w-1 rounded-full ${stripe}`} />
        <div className="flex items-center justify-between gap-2">
          <TypeBadge type={task.type} />
          {/* Due label: colour + icon + text, never colour alone (FR-M8-02) */}
          <div className="flex items-center gap-1">
            {dueLabel && (
              <span
                className={`flex shrink-0 items-center gap-1 text-caption font-semibold ${due.label}`}
                title={task.dueDate ? formatLongDate(task.dueDate) : undefined}
              >
                {DueIcon && <DueIcon aria-hidden="true" className="h-3.5 w-3.5" />}
                {dueLabel}
              </span>
            )}
            {/* M10: one click copies the task as a prompt (FR-M10-01) */}
            <div className="relative z-10 -my-1.5 shrink-0">
              <CopyPromptButton variant="icon" getText={() => taskToPrompt(task, { today, ...promptOptions })} />
            </div>
          </div>
        </div>

        {/*
          The title button covers the whole card (::after), so a click anywhere
          on the card opens the edit modal (FR-M5-08). Controls sit above it.
        */}
        <h3 id={titleId} className="mt-1 text-card-title font-semibold text-ink">
          <button
            type="button"
            data-control="open"
            onClick={() => onOpen(task.id)}
            title={task.title}
            className="block w-full cursor-pointer text-left after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus:outline-none focus-visible:after:ring-2 focus-visible:after:ring-brand-primary"
          >
            <span className="line-clamp-2 break-words">{task.title}</span>
          </button>
        </h3>

        <div className="mt-2 flex items-center justify-between gap-2 text-sm text-ink-muted">
          {/*
            Owner + "Hand off to…" (FR-M7-01/02). The select shows the owner's
            name, so the name is always visible next to the avatar.
          */}
          {/* The owner keeps its full width; the context indicator shrinks first. */}
          <div className="relative z-10 flex shrink-0 items-center gap-1">
            <Avatar member={owner} />
            <label htmlFor={ownerSelectId} className="sr-only">
              Hand off to…
            </label>
            <select
              id={ownerSelectId}
              data-control="owner"
              value={owner ? owner.id : ''}
              onChange={(e) => onHandOff(task.id, e.target.value || null)}
              title={owner ? `${memberWithRole(owner)} · Hand off to…` : 'Hand off to…'}
              className={`h-7 max-w-[9rem] truncate rounded-full border border-transparent bg-transparent pl-1.5 pr-5 text-sm text-ink hover:border-line-strong hover:bg-glass/80 ${focusRing}`}
            >
              {!owner && <option value="">Unassigned</option>}
              {/* Plain names keep the select as narrow as the longest name. */}
              <optgroup label="Hand off to…">
                {team.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/*
            Context indicator (FR-M9-06): shows the task is ready to resume.
            An old context (FR-M9-12) gets a different icon, colour and text.
          */}
          <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
            {withContext && (
              <span
                className={`flex min-w-0 items-center gap-1 overflow-hidden whitespace-nowrap text-caption font-semibold ${
                  stale ? 'text-due-warning-fg' : 'text-ink-muted'
                }`}
                title={stale ? 'The context is more than 3 days old.' : 'This task has context.'}
              >
                {stale ? (
                  <History aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <ScrollText aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                )}
                <span className="sr-only">{stale ? 'Old context' : 'Context'}</span>
                {task.contextTool ? (
                  <span className="truncate">{task.contextTool}</span>
                ) : (
                  <span aria-hidden="true">Context</span>
                )}
                {/* M12: how many prompt versions this task has */}
                {versions > 1 && (
                  <span className="shrink-0 font-mono text-xs font-normal">
                    <span aria-hidden="true">· v{versions}</span>
                    <span className="sr-only">, {versions} versions</span>
                  </span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Move controls (FR-M4-07, DESIGN.md §4.5) — no drag-and-drop. */}
        <div className="relative z-10 mt-3 flex items-center gap-1">
          <label htmlFor={stageSelectId} className="sr-only">
            Stage
          </label>
          <select
            id={stageSelectId}
            data-control="stage"
            value={task.status}
            onChange={(e) => onMove(task.id, e.target.value, 'stage')}
            className={`h-8 min-w-0 flex-1 rounded-full border border-line-strong bg-glass/80 px-3 text-sm text-ink ${focusRing}`}
          >
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>

          {prev ? (
            <button
              type="button"
              data-control="prev"
              onClick={() => onMove(task.id, prev.id, 'prev')}
              aria-label={`Move to ${prev.label}`}
              title={`Move to ${prev.label}`}
              className={iconButton}
            >
              <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            </button>
          ) : (
            <span aria-hidden="true" className="h-8 w-8" />
          )}

          {next ? (
            <button
              type="button"
              data-control="next"
              onClick={() => onMove(task.id, next.id, 'next')}
              aria-label={`Move to ${next.label}`}
              title={`Move to ${next.label}`}
              className={iconButton}
            >
              <ChevronRight aria-hidden="true" className="h-4 w-4" />
            </button>
          ) : (
            <span aria-hidden="true" className="h-8 w-8" />
          )}
        </div>
      </article>
    </li>
  );
}
