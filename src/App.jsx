import { useEffect, useRef, useState } from 'react';
import { ListFilter, Plus } from 'lucide-react';
import { STORAGE_KEYS, TEAM, TYPES } from './lib/constants.js';
import { TYPE_STYLES } from './lib/types.js';
import { todayISO } from './lib/dates.js';
import { buildSeedTasks, createId, isKnownAssignee, normaliseTasks } from './lib/tasks.js';
import { buttonPrimary } from './lib/ui.js';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { ToastProvider, useToast } from './components/Toast.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Board from './components/Board.jsx';
import TaskModal from './components/TaskModal.jsx';
import SegmentedControl from './components/SegmentedControl.jsx';

/**
 * Slopify — Vibecoding Project Tracker.
 *
 * Code map:
 *   src/lib/constants.js      STAGES, TEAM, TYPES, CONTEXT_TOOLS, storage keys
 *   src/lib/dates.js          local-date helpers, due state + labels
 *   src/lib/tasks.js          ids, normalisation, sort order, seed data
 *   src/lib/ui.js             shared Tailwind class strings (DESIGN.md §4)
 *   src/hooks/useLocalStorage.js
 *   src/components/           Board, TaskCard, TaskModal, Modal, ConfirmDialog,
 *                             Toast, ErrorBoundary
 *
 * Milestones still to build — search for `TODO M<n>`:
 *   M7 task-owner · M8 due-tint · M9 context
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

  // Per-browser UI preferences (DR-STO table: `vibetracker.prefs`).
  const [prefs, setPrefs] = useLocalStorage(STORAGE_KEYS.prefs, {}, {
    normalise: (raw) => ({
      ok: raw !== null && typeof raw === 'object' && !Array.isArray(raw),
      value: raw,
      dropped: 0,
    }),
    fallback: {},
  });
  const defaultAssignee = isKnownAssignee(prefs.lastAssignee) ? prefs.lastAssignee : TEAM[0];

  // Board filter by type (FR-M6-05). UI-only state — not persisted (DR-STO-05).
  const [typeFilter, setTypeFilter] = useState('all');

  // Editor state: null | { mode: 'create', status } | { mode: 'edit', id }
  const [editor, setEditor] = useState(null);
  const addButtonRef = useRef(null);
  const editingTask = editor?.mode === 'edit' ? tasks.find((t) => t.id === editor.id) : null;

  const openCreate = (status = 'todo') => setEditor({ mode: 'create', status });
  const openEdit = (id) => setEditor({ mode: 'edit', id });
  const closeEditor = () => setEditor(null);

  // NFR-USE-07: "N" opens a new task when the user is not typing.
  useEffect(() => {
    function onKeyDown(e) {
      if (editor || e.key.toLowerCase() !== 'n' || e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target;
      if (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) return;
      e.preventDefault();
      openCreate();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [editor]);

  function moveTask(id, status) {
    setTasks((list) => list.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  // DR-LIFE-01: create sets every field; edit writes user-editable fields only.
  function saveTask(fields) {
    if (editor.mode === 'create') {
      setTasks((list) => [
        ...list,
        {
          id: createId(),
          ...fields,
          createdDate: todayISO(),
          context: '',
          contextTool: null,
          contextUpdatedAt: null,
        },
      ]);
    } else {
      setTasks((list) => list.map((t) => (t.id === editor.id ? { ...t, ...fields } : t)));
    }
    if (isKnownAssignee(fields.assignee)) {
      setPrefs((p) => ({ ...p, lastAssignee: fields.assignee }));
    }
    closeEditor();
  }

  function deleteTask(id) {
    setTasks((list) => list.filter((t) => t.id !== id));
    closeEditor();
  }

  // Focus after the modal closes (FR-M5-15): the edited card (it may have
  // moved column), else the opener, else the "Add task" button.
  function returnFocus(previous) {
    const id = editor?.mode === 'edit' ? editor.id : null;
    const card = id && document.querySelector(`[data-task-id="${CSS.escape(id)}"] [data-control="open"]`);
    if (card) card.focus();
    else if (previous?.isConnected && previous !== document.body) previous.focus();
    else addButtonRef.current?.focus();
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

        <div className="flex items-center gap-4">
          <SegmentedControl
            legend="Show tasks of type"
            hideLegend
            size="sm"
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: 'all', label: 'All', icon: ListFilter, selectedClass: 'bg-brand-primary text-white' },
              ...TYPES.map((t) => ({
                value: t.id,
                label: t.label,
                icon: TYPE_STYLES[t.id].icon,
                iconClass: TYPE_STYLES[t.id].iconClass,
                selectedClass: TYPE_STYLES[t.id].selected,
              })),
            ]}
          />
          <button
            ref={addButtonRef}
            type="button"
            onClick={() => openCreate()}
            aria-keyshortcuts="N"
            title="Add task (N)"
            className={buttonPrimary}
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            Add task
          </button>
        </div>
      </header>

      {/* TODO M11 anchors: render the Anchor Board (Presentation / Demo / Report / Documentation) here. */}

      <main className="min-h-0 flex-1 overflow-x-auto px-6">
        <Board
          tasks={tasks}
          today={today}
          typeFilter={typeFilter}
          onMove={moveTask}
          onOpen={openEdit}
          onAdd={openCreate}
        />
      </main>

      <footer className="px-6 py-3 text-[13px] leading-[18px] text-ink-muted">
        Slopify keeps your data in this browser only. Export the board to share it or to keep a copy.
      </footer>

      {editor && (editor.mode === 'create' || editingTask) && (
        <TaskModal
          key={editor.mode === 'edit' ? editor.id : `new-${editor.status}`}
          mode={editor.mode}
          task={editingTask}
          defaults={{ status: editor.status, assignee: defaultAssignee }}
          today={today}
          onSave={saveTask}
          onDelete={deleteTask}
          onClose={closeEditor}
          returnFocus={returnFocus}
        />
      )}
    </div>
  );
}
