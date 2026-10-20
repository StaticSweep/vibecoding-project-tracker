import { ChevronLeft, ChevronRight } from 'lucide-react';
import { STAGES } from '../lib/constants.js';
import { formatDueLabel, formatLongDate } from '../lib/dates.js';
import { isKnownAssignee } from '../lib/tasks.js';
import { TYPE_STYLES } from '../lib/types.js';
import { focusRing, iconButton } from '../lib/ui.js';
import TypeBadge from './TypeBadge.jsx';

/**
 * One task on the board (DESIGN.md §4.3 / §4.4).
 *
 * M4 shows the data as plain text. Later milestones add:
 *   M7 avatar + hand-off
 *   M8 due tint · M9 context indicator · M10 copy button
 */
export default function TaskCard({ task, today, onMove, onOpen }) {
  const stageIndex = STAGES.findIndex((s) => s.id === task.status);
  const prev = STAGES[stageIndex - 1];
  const next = STAGES[stageIndex + 1];

  const stripe = (TYPE_STYLES[task.type] ?? TYPE_STYLES.feature).stripe;
  const assignee = isKnownAssignee(task.assignee) ? task.assignee : 'Unassigned';
  const dueLabel = formatDueLabel(task, today);
  const titleId = `task-title-${task.id}`;
  const stageSelectId = `task-stage-${task.id}`;

  return (
    <li>
      <article
        data-task-id={task.id}
        tabIndex={-1}
        aria-labelledby={titleId}
        className={`relative rounded-lg border border-line-subtle bg-surface-card py-3 pl-4 pr-3 transition-shadow duration-150 hover:shadow-sm focus-within:shadow-sm motion-reduce:transition-none ${focusRing}`}
      >
        {/* Type stripe (FR-M6-01, DESIGN.md §2.2) — decoration; the badge carries the text. */}
        <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1 rounded-l-[7px] ${stripe}`} />
        <TypeBadge type={task.type} />

        {/*
          The title button covers the whole card (::after), so a click anywhere
          on the card opens the edit modal (FR-M5-08). Controls sit above it.
        */}
        <h3 id={titleId} className="mt-1 text-[15px] font-semibold leading-[22px] text-ink">
          <button
            type="button"
            data-control="open"
            onClick={() => onOpen(task.id)}
            title={task.title}
            className="block w-full cursor-pointer text-left after:absolute after:inset-0 after:rounded-lg after:content-[''] focus:outline-none focus-visible:after:ring-2 focus-visible:after:ring-brand-primary"
          >
            <span className="line-clamp-2 break-words">{task.title}</span>
          </button>
        </h3>

        {/* TODO M7 task-owner: avatar + "Hand off to…". TODO M8 due-tint: tint + icon. */}
        <div className="mt-2 flex items-center justify-between gap-2 text-sm text-ink-muted">
          <span className="truncate">{assignee}</span>
          {dueLabel && (
            <span
              className="shrink-0"
              title={task.dueDate ? formatLongDate(task.dueDate) : undefined}
            >
              {dueLabel}
            </span>
          )}
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
            className={`h-8 min-w-0 flex-1 rounded-md border border-line-strong bg-surface-card px-2 text-sm text-ink ${focusRing}`}
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
