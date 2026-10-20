import { ChevronLeft, ChevronRight } from 'lucide-react';
import { STAGES, TEAM } from '../lib/constants.js';
import { formatDueLabel, formatLongDate, getDueState } from '../lib/dates.js';
import { DUE_STYLES } from '../lib/due.js';
import { isKnownAssignee } from '../lib/tasks.js';
import { TYPE_STYLES } from '../lib/types.js';
import { focusRing, iconButton } from '../lib/ui.js';
import TypeBadge from './TypeBadge.jsx';
import Avatar from './Avatar.jsx';

/**
 * One task on the board (DESIGN.md §4.3 / §4.4).
 *
 * M4 shows the data as plain text. Later milestones add:
 *   M9 context indicator · M10 copy button
 */
export default function TaskCard({ task, today, onMove, onOpen, onHandOff }) {
  const stageIndex = STAGES.findIndex((s) => s.id === task.status);
  const prev = STAGES[stageIndex - 1];
  const next = STAGES[stageIndex + 1];

  const stripe = (TYPE_STYLES[task.type] ?? TYPE_STYLES.feature).stripe;
  const known = isKnownAssignee(task.assignee);
  const dueLabel = formatDueLabel(task, today);
  const due = DUE_STYLES[getDueState(task, today)];
  const DueIcon = due.icon;
  const titleId = `task-title-${task.id}`;
  const stageSelectId = `task-stage-${task.id}`;
  const ownerSelectId = `task-owner-${task.id}`;

  return (
    <li>
      <article
        data-task-id={task.id}
        tabIndex={-1}
        aria-labelledby={titleId}
        className={`relative rounded-lg border border-line-subtle ${due.card} py-3 pl-4 pr-3 transition-shadow duration-150 hover:shadow-sm focus-within:shadow-sm motion-reduce:transition-none ${focusRing}`}
      >
        {/* Type stripe (FR-M6-01, DESIGN.md §2.2) — decoration; the badge carries the text. */}
        <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1 rounded-l-[7px] ${stripe}`} />
        <div className="flex items-center justify-between gap-2">
          <TypeBadge type={task.type} />
          {/* Due label: colour + icon + text, never colour alone (FR-M8-02) */}
          {dueLabel && (
            <span
              className={`flex shrink-0 items-center gap-1 text-[13px] font-semibold leading-[18px] ${due.label}`}
              title={task.dueDate ? formatLongDate(task.dueDate) : undefined}
            >
              {DueIcon && <DueIcon aria-hidden="true" className="h-3.5 w-3.5" />}
              {dueLabel}
            </span>
          )}
        </div>

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

        <div className="mt-2 flex items-center justify-between gap-2 text-sm text-ink-muted">
          {/*
            Owner + "Hand off to…" (FR-M7-01/02). The select shows the owner's
            name, so the name is always visible next to the avatar.
          */}
          <div className="relative z-10 flex min-w-0 items-center gap-1.5">
            <Avatar name={task.assignee} />
            <label htmlFor={ownerSelectId} className="sr-only">
              Hand off to…
            </label>
            <select
              id={ownerSelectId}
              data-control="owner"
              value={task.assignee}
              onChange={(e) => onHandOff(task.id, e.target.value)}
              title="Hand off to…"
              className={`h-7 min-w-0 max-w-full truncate rounded-md border border-transparent bg-transparent pl-1 pr-6 text-sm text-ink hover:border-line-strong hover:bg-surface-card ${focusRing}`}
            >
              {!known && (
                <option value={task.assignee}>
                  Unassigned
                </option>
              )}
              {TEAM.map((name) => (
                <option key={name} value={name}>
                  {name === task.assignee ? name : `Hand off to ${name}`}
                </option>
              ))}
            </select>
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
