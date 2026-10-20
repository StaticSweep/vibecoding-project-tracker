import { useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import { STORAGE_KEYS } from './lib/constants.js';
import { todayISO } from './lib/dates.js';
import { buildSeedTasks, normaliseTasks } from './lib/tasks.js';
import { buttonPrimary } from './lib/ui.js';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { ToastProvider, useToast } from './components/Toast.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Board from './components/Board.jsx';

/**
 * Slopify — Vibecoding Project Tracker.
 *
 * Code map:
 *   src/lib/constants.js      STAGES, TEAM, TYPES, CONTEXT_TOOLS, storage keys
 *   src/lib/dates.js          local-date helpers, due state + labels
 *   src/lib/tasks.js          ids, normalisation, sort order, seed data
 *   src/lib/ui.js             shared Tailwind class strings (DESIGN.md §4)
 *   src/hooks/useLocalStorage.js
 *   src/components/           Board, TaskCard, Toast, ErrorBoundary
 *
 * Milestones still to build — search for `TODO M<n>`:
 *   M5 crud-modal · M6 tag-style · M7 task-owner · M8 due-tint · M9 context
 *   M10 copy-prompt · M11 anchors · M12 secret-sauce · M13 pitch-ready
 */

// The starter exported these from App.jsx; keep the exports for compatibility.
export { STAGES, TEAM } from './lib/constants.js';
export { useLocalStorage } from './hooks/useLocalStorage.js';

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Tracker />
      </ToastProvider>
    </ErrorBoundary>
  );
}

function Tracker() {
  const toast = useToast();
  const today = todayISO();

  const writeErrorShown = useRef(false);
  const [tasks, setTasks, tasksNotice] = useLocalStorage(
    STORAGE_KEYS.tasks,
    () => buildSeedTasks(todayISO()),
    {
      normalise: (raw) => {
        const result = normaliseTasks(raw, todayISO());
        return { ok: result.ok, value: result.tasks, dropped: result.dropped };
      },
      fallback: [],
      onWriteError: () => {
        if (writeErrorShown.current) return;
        writeErrorShown.current = true;
        toast({
          tone: 'error',
          message:
            'Slopify cannot save your changes. The browser storage is full. Export your board now.',
        });
      },
    },
  );

  // DR-INT-01: tell the user once if saved data had to be repaired.
  const noticeShown = useRef(false);
  useEffect(() => {
    if (!tasksNotice || noticeShown.current) return;
    noticeShown.current = true;
    toast({
      tone: 'error',
      message: 'Slopify cannot read some saved data. A backup copy is in the browser.',
    });
  }, [tasksNotice, toast]);

  function moveTask(id, status) {
    setTasks((list) => list.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  // TODO M11 anchors:
  //   const [anchors, setAnchors] = useLocalStorage(STORAGE_KEYS.anchors, DEFAULT_ANCHORS, …);

  return (
    <div className="flex h-screen flex-col bg-surface-page font-sans text-ink">
      <header className="flex items-end justify-between gap-4 px-6 pb-4 pt-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold leading-8 text-brand-primary">
            Slopify
          </h1>
          <p className="text-sm leading-5 text-ink-muted">Track the task. Keep the context.</p>
        </div>

        {/* TODO M5 crud-modal: open the create modal. */}
        <button
          type="button"
          aria-disabled="true"
          aria-describedby="add-task-hint"
          title="The task editor comes in the next version."
          onClick={(e) => e.preventDefault()}
          className={buttonPrimary}
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          Add task
        </button>
        <span id="add-task-hint" className="sr-only">
          The task editor comes in the next version.
        </span>
      </header>

      {/* TODO M11 anchors: render the Anchor Board (Presentation / Demo / Report / Documentation) here. */}

      <main className="min-h-0 flex-1 overflow-x-auto px-6">
        <Board tasks={tasks} today={today} onMove={moveTask} />
      </main>

      <footer className="px-6 py-3 text-[13px] leading-[18px] text-ink-muted">
        Slopify keeps your data in this browser only. Export the board to share it or to keep a copy.
      </footer>
    </div>
  );
}
