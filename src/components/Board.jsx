import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { STAGES } from '../lib/constants.js';
import { compareTasks } from '../lib/tasks.js';
import { iconButton } from '../lib/ui.js';
import TaskCard from './TaskCard.jsx';

/**
 * The four-column Kanban board (M4 data-model, DESIGN.md §4.1).
 */
/**
 * `typeFilter` is 'all' or a type id (FR-M6-05). Hidden tasks still count
 * toward the column total, so the count reads "1 of 3" while a filter is on.
 */
export default function Board({ tasks, today, onMove, onOpen, onAdd, typeFilter = 'all' }) {
  // After a move, put the focus back on the same control of the moved card.
  const [focusRequest, setFocusRequest] = useState(null);
  const [announcement, setAnnouncement] = useState('');

  const columns = useMemo(
    () =>
      STAGES.map((stage) => {
        const all = tasks.filter((t) => t.status === stage.id);
        return {
          ...stage,
          total: all.length,
          tasks: all.filter((t) => typeFilter === 'all' || t.type === typeFilter).sort(compareTasks),
        };
      }),
    [tasks, typeFilter],
  );

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
    setFocusRequest({ id, control });
    const label = STAGES.find((s) => s.id === status)?.label;
    setAnnouncement(`Moved "${task.title}" to ${label}.`);
  }

  return (
    <>
      <div className="grid h-full min-w-[1088px] grid-cols-4 gap-4">
        {columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            today={today}
            onMove={handleMove}
            onOpen={onOpen}
            onAdd={onAdd}
          />
        ))}
      </div>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </>
  );
}

function Column({ column, today, onMove, onOpen, onAdd }) {
  const headingId = `column-${column.id}`;
  const count = column.tasks.length;
  const filtered = count < column.total;

  return (
    <section
      aria-labelledby={headingId}
      className="flex min-h-0 flex-col rounded-lg border border-line-subtle bg-surface-page"
    >
      <header className="flex items-center justify-between px-3 pb-2 pt-2">
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
          aria-label={`Add task to ${column.label}`}
          title={`Add task to ${column.label}`}
          className={iconButton}
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
        </button>
      </header>

      {count === 0 ? (
        <div className="mx-3 mb-3 rounded-lg border border-dashed border-line-strong p-4 text-center text-[13px] leading-[18px] text-ink-muted">
          {filtered
            ? 'No tasks agree with this filter. Clear the filter to see all tasks.'
            : 'No tasks here. Add a task or move a task to this stage.'}
        </div>
      ) : (
        <ul className="flex-1 space-y-2 overflow-y-auto px-3 pb-3">
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} today={today} onMove={onMove} onOpen={onOpen} />
          ))}
        </ul>
      )}
    </section>
  );
}
