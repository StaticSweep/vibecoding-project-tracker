import { useEffect, useRef, useState } from 'react';
import { getDueState, todayISO } from './lib/dates.js';
import { createId } from './lib/tasks.js';
import { endSentence, findMember } from './lib/team.js';
import { nextContextUpdatedAt } from './lib/context.js';
import { nextHistory } from './lib/history.js';
import { glassPanel } from './lib/ui.js';
import { ToastProvider, useToast } from './components/Toast.jsx';
import { AppDataProvider, useAppData } from './context/AppData.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Board from './components/Board.jsx';
import AnchorBoard from './components/AnchorBoard.jsx';
import TaskModal from './components/TaskModal.jsx';
import Header, { NO_FILTERS } from './components/Header.jsx';
import WelcomeCard from './components/WelcomeCard.jsx';
import SettingsDialog from './components/SettingsDialog.jsx';
import DataTools from './components/DataTools.jsx';

/**
 * Slopify — Vibecoding Project Tracker.
 *
 * Code map:
 *   src/lib/constants.js      STAGES, ROLES, TYPES, CONTEXT_TOOLS, storage keys
 *   src/lib/schema.js         schema versions + migrations (run in main.jsx)
 *   src/lib/team.js           team members, roles, the team lead, workspace
 *   src/lib/dates.js          local-date helpers, due state + labels
 *   src/lib/tasks.js          normalisation, sort order, starter tasks
 *   src/lib/prefs.js          per-browser settings (theme, text size, accent)
 *   src/lib/ui.js             shared Tailwind class strings (DESIGN.md §4)
 *   src/context/AppData.jsx   all stored state, shared through context
 *   src/components/           Board, TaskCard, TaskModal, Modal, ConfirmDialog,
 *                             Toast, ErrorBoundary, …
 *
 * There is no sign-in: Slopify always acts as the team lead.
 */

// The starter exported these from App.jsx; keep the exports for compatibility.
export { STAGES, TEAM } from './lib/constants.js';
export { useLocalStorage } from './hooks/useLocalStorage.js';

export default function App({ readOnly = false }) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppDataProvider readOnly={readOnly}>
          <Tracker />
        </AppDataProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

function Tracker() {
  const toast = useToast();
  const today = useToday();

  const { tasks, setTasks, anchors, setAnchors, team, lead, readOnly } = useAppData();
  const setAnchorUrl = (id, url) =>
    setAnchors((list) => list.map((a) => (a.id === id ? { ...a, url } : a))); // writes `url` only

  // Board filters (FR-M6-05, FR-M7-08): { owner: 'all' | member id |
  // 'unassigned', type: 'all' | type id }. UI-only — not persisted (DR-STO-05).
  const [filters, setFilters] = useState(NO_FILTERS);

  // Editor state: null | { mode: 'create', status } | { mode: 'edit', id }
  const [editor, setEditor] = useState(null);
  const addButtonRef = useRef(null);
  const editingTask = editor?.mode === 'edit' ? tasks.find((t) => t.id === editor.id) : null;

  // Settings dialog: null | the tab to open on.
  const [settingsTab, setSettingsTab] = useState(null);

  const openCreate = (status = 'todo') => setEditor({ mode: 'create', status });
  const openEdit = (id) => setEditor({ mode: 'edit', id });
  const closeEditor = () => setEditor(null);

  // NFR-USE-07: "N" opens a new task when the user is not typing.
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key.toLowerCase() !== 'n' || e.ctrlKey || e.metaKey || e.altKey || readOnly) return;
      if (document.querySelector('[aria-modal="true"]')) return; // a dialog is open
      const el = e.target;
      if (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) return;
      e.preventDefault();
      openCreate();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [readOnly]);

  function moveTask(id, status) {
    setTasks((list) => list.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  // Handoff toast with Undo (FR-M7-03, FR-M7-07). Undo only restores the old
  // owner if nobody changed the owner again in the meantime.
  function announceHandOff(id, from, to) {
    const name = findMember(team, to)?.name ?? 'Unassigned';
    toast({
      message: endSentence(`You gave this task to ${name}`),
      action: {
        label: 'Undo',
        onClick: () =>
          setTasks((list) =>
            list.map((t) => (t.id === id && t.assignee === to ? { ...t, assignee: from } : t)),
          ),
      },
    });
  }

  // "Hand off to…" on the card: writes `assignee` only (DR-LIFE-01).
  function handOff(id, assignee) {
    const task = tasks.find((t) => t.id === id);
    if (!task || task.assignee === assignee || !findMember(team, assignee)) return;
    setTasks((list) => list.map((t) => (t.id === id ? { ...t, assignee } : t)));
    announceHandOff(id, task.assignee, assignee);
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
          contextUpdatedAt: nextContextUpdatedAt(null, fields),
          contextHistory: [],
        },
      ]);
      // Do not hide the new task behind an active filter.
      const hidden =
        (filters.type !== 'all' && filters.type !== fields.type) ||
        (filters.owner !== 'all' && filters.owner !== (findMember(team, fields.assignee) ? fields.assignee : 'unassigned'));
      if (hidden) setFilters(NO_FILTERS);
    } else {
      setTasks((list) =>
        list.map((t) =>
          t.id === editor.id
            ? {
                ...t,
                ...fields,
                contextUpdatedAt: nextContextUpdatedAt(t, fields),
                contextHistory: nextHistory(t, fields), // M12: keep the old version
              }
            : t,
        ),
      );
      if (editingTask && editingTask.assignee !== fields.assignee && findMember(team, fields.assignee)) {
        announceHandOff(editor.id, editingTask.assignee, fields.assignee);
      }
    }
    closeEditor();
  }

  // Delete with Undo for 5 s (FR-M5-14). Undo puts the task back in its old
  // place, unless it is already back (e.g. undone twice).
  const focusAfterDelete = useRef(null);
  function deleteTask(id) {
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return;
    const removed = tasks[index];

    // Focus goes to the next card in the column, else the previous one, else
    // the column's "+" — not back to the top of the page.
    const item = document.querySelector(`[data-task-id="${CSS.escape(id)}"]`)?.closest('li');
    const neighbour = item?.nextElementSibling ?? item?.previousElementSibling;
    focusAfterDelete.current =
      neighbour?.querySelector('[data-control="open"]') ??
      document.querySelector(`[data-add-stage="${CSS.escape(removed.status)}"]`);

    setTasks((list) => list.filter((t) => t.id !== id));
    closeEditor();
    toast({
      message: 'Task deleted.',
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: () =>
          setTasks((list) =>
            list.some((t) => t.id === removed.id) ? list : [...list.slice(0, index), removed, ...list.slice(index)],
          ),
      },
    });
  }

  // Focus after the modal closes (FR-M5-15): after a delete, a neighbour card;
  // else the edited card (it may have moved column), else the opener, else
  // the "Add task" button.
  function returnFocus(previous) {
    const afterDelete = focusAfterDelete.current;
    focusAfterDelete.current = null;
    if (afterDelete?.isConnected) {
      afterDelete.focus();
      return;
    }
    const id = editor?.mode === 'edit' ? editor.id : null;
    const card = id && document.querySelector(`[data-task-id="${CSS.escape(id)}"] [data-control="open"]`);
    if (card) card.focus();
    else if (previous?.isConnected && previous !== document.body) previous.focus();
    else addButtonRef.current?.focus();
  }

  // FR-M8-08: overdue count for the header.
  const overdueCount = tasks.filter((t) => getDueState(t, today) === 'overdue').length;

  return (
    <div className="relative isolate flex h-screen flex-col overflow-hidden bg-surface-page font-sans text-ink">
      <GlassBackdrop />

      <Header
        filters={filters}
        onFiltersChange={setFilters}
        overdueCount={overdueCount}
        onAdd={openCreate}
        onOpenSettings={(tab = 'team') => setSettingsTab(tab)}
        addButtonRef={addButtonRef}
      />

      {/* DR-MIG-04: data from a newer Slopify is shown but never overwritten. */}
      {readOnly && (
        <p role="status" className="mx-4 mb-3 rounded-2xl bg-due-warning-bg px-4 py-2 text-sm font-semibold text-due-warning-fg">
          A newer version of Slopify saved this board. You can read it, but you cannot change it.
        </p>
      )}

      <WelcomeCard onSetUpTeam={() => setSettingsTab('team')} />

      <div className="shrink-0 overflow-x-auto">
        <AnchorBoard anchors={anchors} onChange={setAnchorUrl} />
      </div>

      <main id="board" tabIndex={-1} aria-label="Board" className="min-h-0 flex-1 overflow-x-auto px-4 focus:outline-none">
        <Board
          tasks={tasks}
          today={today}
          filters={filters}
          onMove={moveTask}
          onHandOff={handOff}
          onOpen={openEdit}
          onAdd={openCreate}
        />
      </main>

      <footer className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
        <p className={`inline-block rounded-full px-4 py-1.5 text-caption text-ink-muted ${glassPanel}`}>
          Slopify keeps your data in this browser only. Export the board to share it or to keep a copy.
        </p>
        <DataTools variant="footer" />
      </footer>

      {settingsTab && <SettingsDialog initialTab={settingsTab} onClose={() => setSettingsTab(null)} />}

      {editor && (editor.mode === 'create' || editingTask) && (
        <TaskModal
          key={editor.mode === 'edit' ? editor.id : `new-${editor.status}`}
          mode={editor.mode}
          task={editingTask}
          defaults={{ status: editor.status, assignee: lead?.id ?? null }}
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

/**
 * Soft, pale colour fields behind the glass (DESIGN.md §2.6) — iOS-style
 * wallpaper. Decorative only. The colours are pale so that text on the glass
 * keeps WCAG AA contrast wherever it sits.
 */
function GlassBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Worst case on the thinnest glass (60 % white): text-muted 4.93:1. */}
      <div className="absolute -left-32 -top-40 h-[38rem] w-[38rem] rounded-full bg-blob-1 opacity-85 blur-3xl" />
      <div className="absolute -right-24 top-10 h-[34rem] w-[34rem] rounded-full bg-blob-2 opacity-85 blur-3xl" />
      <div className="absolute -bottom-56 left-[30%] h-[36rem] w-[36rem] rounded-full bg-blob-3 opacity-80 blur-3xl" />
    </div>
  );
}

/**
 * Today's local date, kept current (FR-M8-06): re-checked when the window
 * gets focus or becomes visible, and once a minute, so a board left open
 * overnight updates its due tints.
 */
function useToday() {
  const [today, setToday] = useState(todayISO);

  useEffect(() => {
    const refresh = () => setToday(todayISO()); // same string → no re-render
    const onVisible = () => document.visibilityState === 'visible' && refresh();
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', onVisible);
    const timer = window.setInterval(refresh, 60_000);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(timer);
    };
  }, []);

  return today;
}
