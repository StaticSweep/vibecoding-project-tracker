import { ChevronLeft, ChevronRight } from 'lucide-react';
import { STAGES, TYPES } from '../lib/constants.js';
import { formatDueLabel, formatLongDate } from '../lib/dates.js';
import { isKnownAssignee } from '../lib/tasks.js';
import { focusRing, iconButton } from '../lib/ui.js';

/**
 * One task on the board (DESIGN.md §4.3 / §4.4).
 *
 * M4 shows the data as plain text. Later milestones add:
 *   M5 click to edit · M6 type stripe + badge · M7 avatar + hand-off
 *   M8 due tint · M9 context indicator · M10 copy button
 */
export default function TaskCard({ task, today, onMove }) {
  const stageIndex = STAGES.findIndex((s) => s.id === task.status);
  const prev = STAGES[stageIndex - 1];
  const next = STAGES[stageIndex + 1];

  const typeLabel = TYPES.find((t) => t.id === task.type)?.label ?? 'Feature';
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
        className={`rounded-lg border border-line-subtle bg-surface-card p-3 transition-shadow duration-150 hover:shadow-sm motion-reduce:transition-none ${focusRing}`}
      >
        {/* TODO M6 tag-style: type stripe + coloured badge with icon. */}
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.04em] text-ink-muted">
          {typeLabel}
        </p>

        {/* TODO M5 crud-modal: make the card open the edit modal. */}
        <h3
          id={titleId}
          title={task.title}
          className="mt-1 line-clamp-2 break-words text-[15px] font-semibold leading-[22px] text-ink"
        >
          {task.title}
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
        <div className="mt-3 flex items-center gap-1">
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
