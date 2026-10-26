import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { STAGES } from '../lib/constants.js';
import { compareTasks, matchesFilters } from '../lib/tasks.js';
import { useAppData } from '../context/AppData.jsx';
import { focusRing, glassPanel, iconButton } from '../lib/ui.js';
import TaskCard from './TaskCard.jsx';

/**
 * The four-column Kanban board (M4 data-model, DESIGN.md §4.1).
 *
 * `filters` = { owner, type, query } (FR-M6-05, FR-M7-08, search). Hidden
 * tasks still count toward the column total, so the count reads "1 of 3"
 * while a filter is on.
 *
 * Layout reflows for zoom and small screens (WCAG 1.4.10, DESIGN.md §4.1):
 *   < 768 px      one stage at a time, picked with the stage buttons
 *   768–1279 px   columns side by side, scrolled sideways with snap
 *   ≥ 1280 px     all four columns visible
 */
export default function Board({ tasks, today, onMove, onOpen, onAdd, onHandOff, filters }) {
  const { team } = useAppData();
  // After a move, put the focus back on the same control of the moved card.
  const [focusRequest, setFocusRequest] = useState(null);
  const [announcement, setAnnouncement] = useState('');
  // The one stage shown on small screens.
  const [shownStage, setShownStage] = useState(STAGES[0].id);

  const columns = useMemo(
    () =>
      STAGES.map((stage) => {
        const all = tasks.filter((t) => t.status === stage.id);
        return {
          ...stage,
          total: all.length,
          tasks: all.filter((t) => matchesFilters(t, filters, team)).sort(compareTasks),
        };
      }),
    [tasks, team, filters],
  );

  // Say how many tasks a filter leaves (not on the first render).
  const visible = columns.reduce((n, c) => n + c.tasks.length, 0);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setAnnouncement(`Showing ${visible} of ${tasks.length} tasks.`);
    // Only when the filters change, not on every task edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    if (!focusRequest) return;
    const card = document.querySelector(`[data-task-id="${CSS.escape(focusRequest.id)}"]`);
    const control = card?.querySelector(`[data-control="${focusRequest.control}"]`);
    (control ?? card)?.focus();
    setFocusRequest(null);
  }, [focusRequest]);

  function handleMove(id, status, control) {
    const task = tasks.find((t) => t.id === id);
    if (!task || task.status === status) return;
    onMove(id, status);
    setShownStage(status); // on small screens, follow the card to its new stage
    setFocusRequest({ id, control });
    const label = STAGES.find((s) => s.id === status)?.label;
    setAnnouncement(`Moved "${task.title}" to ${label}.`);
  }

  return (
    <>
      <StagePicker columns={columns} shown={shownStage} onShow={setShownStage} />
      <div className="flex gap-4 md:h-full md:snap-x md:snap-mandatory md:overflow-x-auto md:pb-2 xl:grid xl:grid-cols-4 xl:overflow-visible xl:pb-0">
        {columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            shownOnSmall={column.id === shownStage}
            today={today}
            onMove={handleMove}
            onOpen={onOpen}
            onAdd={onAdd}
            onHandOff={onHandOff}
          />
        ))}
      </div>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </>
  );
}

/** Small screens only: choose which stage to show. */
function StagePicker({ columns, shown, onShow }) {
  return (
    <div role="group" aria-label="Stage to show" className="mb-3 grid grid-cols-2 gap-1 sm:grid-cols-4 md:hidden">
      {columns.map((column) => {
        const pressed = column.id === shown;
        return (
          <button
            key={column.id}
            type="button"
            aria-pressed={pressed}
            onClick={() => onShow(column.id)}
            className={`h-10 rounded-full px-3 text-sm font-semibold ${
              pressed ? 'bg-brand-primary text-on-brand' : `text-ink hover:bg-brand-accent ${glassPanel}`
            } ${focusRing}`}
          >
            {column.label} · {column.tasks.length}
          </button>
        );
      })}
    </div>
  );
}

function Column({ column, shownOnSmall, today, onMove, onOpen, onAdd, onHandOff }) {
  const { readOnly } = useAppData();
  const headingId = `column-${column.id}`;
  const count = column.tasks.length;
  const filtered = count < column.total;

  return (
    <section
      aria-labelledby={headingId}
      className={`${shownOnSmall ? 'flex' : 'hidden'} w-full min-h-0 flex-col rounded-3xl md:flex md:w-[18rem] md:shrink-0 md:snap-start xl:w-auto ${glassPanel}`}
    >
      <header className="flex items-center justify-between px-4 pb-2 pt-3">
        <h2
          id={headingId}
          className="font-heading text-sm font-semibold uppercase leading-5 tracking-[0.05em] text-ink"
        >
          {column.label}
          <span className="font-sans font-normal normal-case tracking-normal text-ink-muted">
            {' · '}
            {filtered ? `${count} of ${column.total}` : count}
            <span className="sr-only">{column.total === 1 ? ' task' : ' tasks'}</span>
          </span>
        </h2>
        <button
          type="button"
          data-add-stage={column.id}
          onClick={() => onAdd(column.id)}
          disabled={readOnly}
          aria-label={`Add task to ${column.label}`}
          title={`Add task to ${column.label}`}
          className={`${iconButton} disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
        </button>
      </header>

      {count === 0 ? (
        <div className="mx-3 mb-3 rounded-2xl border border-dashed border-line-strong bg-glass/50 p-4 text-center text-caption text-ink-muted reduce-transparency:bg-surface-card">
          {filtered
            ? 'No tasks agree with this filter. Clear the filter to see all tasks.'
            : 'No tasks here. Add a task or move a task to this stage.'}
        </div>
      ) : (
        <ul className="flex-1 space-y-2.5 px-3 pb-3 pt-0.5 md:overflow-y-auto">
          {column.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              today={today}
              onMove={onMove}
              onOpen={onOpen}
              onHandOff={onHandOff}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
