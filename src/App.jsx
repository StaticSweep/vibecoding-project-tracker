import { useEffect, useRef, useState } from 'react';
import { getDueState, todayISO } from './lib/dates.js';
import { createId, matchesFilters } from './lib/tasks.js';
import { endSentence, findMember } from './lib/team.js';
import { activity, editActivities, handedToSince, withActivity } from './lib/activity.js';
import { nextContextUpdatedAt } from './lib/context.js';
import { nextHistory } from './lib/history.js';
import { focusRing, glassPanel } from './lib/ui.js';
import { ToastProvider, useToast } from './components/Toast.jsx';
import { AppDataProvider, useAppData } from './context/AppData.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import GlassBackdrop from './components/GlassBackdrop.jsx';
import LoginScreen from './components/LoginScreen.jsx';
import Board from './components/Board.jsx';
import AnchorBoard from './components/AnchorBoard.jsx';
import TaskModal from './components/TaskModal.jsx';
import Header, { NO_FILTERS } from './components/Header.jsx';
import WelcomeCard from './components/WelcomeCard.jsx';
import SettingsDialog from './components/SettingsDialog.jsx';
import HelpDialog from './components/HelpDialog.jsx';
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
 * Log-in has no password: one click on a profile (LoginScreen). Every change
 * is recorded as that profile's activity (src/lib/activity.js).
 */

// The starter exported these from App.jsx; keep the exports for compatibility.
export { STAGES, TEAM } from './lib/constants.js';
export { useLocalStorage } from './hooks/useLocalStorage.js';

export default function App({ readOnly = false }) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppDataProvider readOnly={readOnly}>
          <Gate />
        </AppDataProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

/** The log-in screen until a profile is chosen, then the board. */
function Gate() {
  const { currentUser } = useAppData();
  return currentUser ? <Tracker key={currentUser.id} /> : <LoginScreen />;
}

function Tracker() {
  const toast = useToast();
  const today = useToday();

  const { tasks, setTasks, anchors, setAnchors, team, currentUser, loginNotice, clearLoginNotice, readOnly } = useAppData();
  const me = currentUser.id;
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
  const [helpOpen, setHelpOpen] = useState(false);
  const searchRef = useRef(null);

  const openCreate = (status = 'todo') => setEditor({ mode: 'create', status });
  const openEdit = (id) => setEditor({ mode: 'edit', id });
  const closeEditor = () => setEditor(null);

  // Global shortcuts (NFR-USE-07): N new task, / search, ? help. Not while
  // the user types, and not while a dialog is open.
  useEffect(() => {
    function onKeyDown(e) {
      if (e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
      if (document.querySelector('[aria-modal="true"]')) return;
      const el = e.target;
      if (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) return;
      if (e.key.toLowerCase() === 'n' && !readOnly) openCreate();
      else if (e.key === '/') searchRef.current?.focus();
      else if (e.key === '?') setHelpOpen(true);
      else return;
      e.preventDefault();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [readOnly]);

  // "Handed to you since your last visit" — once, right after log-in. The
  // ref stops a second toast when React runs the effect twice (StrictMode).
  const shownNotice = useRef(null);
  useEffect(() => {
    if (!loginNotice || loginNotice.id !== me || shownNotice.current === loginNotice) return;
    shownNotice.current = loginNotice;
    clearLoginNotice();
    const handed = handedToSince(tasks, me, loginNotice.since);
    const name = currentUser.name;
    const welcome = endSentence(`Welcome, ${name}`);
    if (handed.length > 0) {
      const count = `${handed.length} ${handed.length === 1 ? 'task was' : 'tasks were'} handed to you`;
      toast({
        message: loginNotice.since ? `${count} since your last visit.` : `${welcome} ${count}.`,
        duration: 8000,
        action: { label: 'Show my tasks', onClick: () => setFilters({ ...NO_FILTERS, owner: me }) },
      });
    } else {
      toast({ message: welcome });
    }
    // Run once per log-in.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginNotice]);

  // Every change below writes the changed fields only (DR-LIFE-01) plus an
  // activity entry by the logged-in profile.
  function moveTask(id, status) {
    setTasks((list) =>
      list.map((t) => (t.id === id ? withActivity({ ...t, status }, activity('moved', me, { from: t.status, to: status })) : t)),
    );
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
            list.map((t) =>
              t.id === id && t.assignee === to
                ? withActivity({ ...t, assignee: from }, activity('handoff', me, { from: to, to: from }))
                : t,
            ),
          ),
      },
    });
  }

  // "Hand off to…" on the card: writes `assignee` only (DR-LIFE-01).
  function handOff(id, assignee) {
    const task = tasks.find((t) => t.id === id);
    if (!task || task.assignee === assignee || !findMember(team, assignee)) return;
    setTasks((list) =>
      list.map((t) =>
        t.id === id ? withActivity({ ...t, assignee }, activity('handoff', me, { from: t.assignee, to: assignee })) : t,
      ),
    );
    announceHandOff(id, task.assignee, assignee);
  }

  // DR-LIFE-01: create sets every field; edit writes user-editable fields only.
  function saveTask(fields) {
    if (editor.mode === 'create') {
      setTasks((list) => [
        ...list,
        withActivity(
          {
            id: createId(),
            ...fields,
            createdDate: todayISO(),
            contextUpdatedAt: nextContextUpdatedAt(null, fields),
            contextHistory: [],
            createdBy: me,
            activity: [],
          },
          activity('created', me),
        ),
      ]);
      // Do not hide the new task behind an active filter or search.
      if (!matchesFilters(fields, filters, team)) setFilters(NO_FILTERS);
    } else {
      setTasks((list) =>
        list.map((t) =>
          t.id === editor.id
            ? withActivity(
                {
                  ...t,
                  ...fields,
                  contextUpdatedAt: nextContextUpdatedAt(t, fields),
                  contextHistory: nextHistory(t, fields), // M12: keep the old version
                },
                editActivities(t, fields, me),
              )
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
            list.some((t) => t.id === removed.id)
              ? list
              : [...list.slice(0, index), withActivity(removed, activity('restored', me)), ...list.slice(index)],
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
    // Small screens and high zoom: the page scrolls. From 768 px: an app
    // shell where only the columns scroll (FR-M4-12).
    <div className="relative isolate flex min-h-screen flex-col bg-surface-page font-sans text-ink md:h-screen md:overflow-hidden">
      <GlassBackdrop />

      {/* Skip link: the first Tab stop (WCAG 2.4.1). */}
      <a
        href="#board"
        className={`sr-only z-50 rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-on-brand focus:not-sr-only focus:fixed focus:left-4 focus:top-4 ${focusRing}`}
      >
        Skip to the board
      </a>

      <Header
        filters={filters}
        onFiltersChange={setFilters}
        overdueCount={overdueCount}
        onAdd={openCreate}
        onOpenSettings={(tab = 'team') => setSettingsTab(tab)}
        onOpenHelp={() => setHelpOpen(true)}
        addButtonRef={addButtonRef}
        searchRef={searchRef}
      />

      {/* DR-MIG-04: data from a newer Slopify is shown but never overwritten. */}
      {readOnly && (
        <p role="status" className="mx-4 mb-3 rounded-2xl bg-due-warning-bg px-4 py-2 text-sm font-semibold text-due-warning-fg">
          A newer version of Slopify saved this board. You can read it, but you cannot change it.
        </p>
      )}

      <WelcomeCard onSetUpTeam={() => setSettingsTab('team')} />

      <div className="shrink-0">
        <AnchorBoard anchors={anchors} onChange={setAnchorUrl} />
      </div>

      <main
        id="board"
        tabIndex={-1}
        aria-label="Board"
        className="min-h-0 flex-1 rounded-3xl px-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary"
      >
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

      <footer aria-label="Data" className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
        <p className={`inline-block rounded-full px-4 py-1.5 text-caption text-ink-muted ${glassPanel}`}>
          Slopify keeps your data in this browser only. Export the board to share it or to keep a copy.
        </p>
        <DataTools variant="footer" />
      </footer>

      {settingsTab && <SettingsDialog initialTab={settingsTab} onClose={() => setSettingsTab(null)} />}
      {helpOpen && <HelpDialog onClose={() => setHelpOpen(false)} />}

      {editor && (editor.mode === 'create' || editingTask) && (
        <TaskModal
          key={editor.mode === 'edit' ? editor.id : `new-${editor.status}`}
          mode={editor.mode}
          task={editingTask}
          defaults={{ status: editor.status, assignee: me }}
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
