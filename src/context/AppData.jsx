import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { STORAGE_KEYS } from '../lib/constants.js';
import { todayISO } from '../lib/dates.js';
import { buildSeedTasks, normaliseTasks } from '../lib/tasks.js';
import { DEFAULT_ANCHORS, normaliseAnchors } from '../lib/anchors.js';
import { DEFAULT_WORKSPACE, buildDefaultTeam, findMember, normaliseTeam, normaliseWorkspace, teamLead } from '../lib/team.js';
import { DEFAULT_PREFS, applyPrefsToDocument, normalisePrefs, onSystemThemeChange } from '../lib/prefs.js';
import { STORAGE_WARN_BYTES, estimateStorageBytes } from '../lib/transfer.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { useToast } from '../components/Toast.jsx';

/**
 * Everything Slopify keeps in the browser, in one place:
 *
 *   tasks, anchors, team, workspace — the board (exported and imported together)
 *   prefs                           — this browser's own settings (never exported)
 *   currentUser                     — the logged-in profile, or null (log-in
 *                                     screen). One click, no password.
 *   login(id), logout()             — choose / leave a profile
 *   lead                            — the team lead (a badge and role)
 *   readOnly                        — data from a newer Slopify (DR-MIG-04)
 *
 *   const { tasks, setTasks, team, lead } = useAppData();
 */

const AppDataContext = createContext(null);

export function useAppData() {
  const value = useContext(AppDataContext);
  if (!value) throw new Error('useAppData must be used inside <AppDataProvider>');
  return value;
}

/** The options every "Copy as Prompt Context" call needs (FR-M10, M12). */
export function usePromptOptions() {
  const { team, workspace, anchors, prefs } = useAppData();
  return useMemo(
    () => ({ team, workspace, anchors, includeLinks: prefs.promptIncludesLinks }),
    [team, workspace, anchors, prefs.promptIncludesLinks],
  );
}

export function AppDataProvider({ readOnly = false, children }) {
  const toast = useToast();

  // NFR-REL-04 / DR-CAP-03: tell the user once if the browser refuses a write.
  const writeErrorShown = useRef(false);
  const onWriteError = useCallback(() => {
    if (writeErrorShown.current) return;
    writeErrorShown.current = true;
    toast({
      tone: 'error',
      message: 'Slopify cannot save your changes. The browser storage is full. Export your board now.',
    });
  }, [toast]);

  const shared = { onWriteError, readOnly };

  // The team first: a new board's starter tasks are given to its members.
  const [team, setTeam, teamNotice] = useLocalStorage(STORAGE_KEYS.team, buildDefaultTeam, {
    ...shared,
    normalise: normaliseTeam,
    fallback: buildDefaultTeam,
  });

  const [workspace, setWorkspace, workspaceNotice] = useLocalStorage(
    STORAGE_KEYS.workspace,
    () => ({ ...DEFAULT_WORKSPACE, leadId: team[0]?.id ?? null }),
    { ...shared, normalise: normaliseWorkspace, fallback: () => ({ ...DEFAULT_WORKSPACE }) },
  );

  const [tasks, setTasks, tasksNotice] = useLocalStorage(
    STORAGE_KEYS.tasks,
    () => buildSeedTasks(todayISO(), team.map((m) => m.id)),
    {
      ...shared,
      normalise: (raw) => {
        const result = normaliseTasks(raw, todayISO());
        return { ok: result.ok, value: result.tasks, dropped: result.dropped };
      },
      fallback: [],
    },
  );

  // M11: the four deliverable links (DR-ANC-01, DR-INT-06).
  const [anchors, setAnchors, anchorsNotice] = useLocalStorage(STORAGE_KEYS.anchors, DEFAULT_ANCHORS, {
    ...shared,
    normalise: normaliseAnchors,
    fallback: DEFAULT_ANCHORS,
  });

  // Prefs belong to this browser, not to the board, so they save even when
  // the board is read-only.
  const [prefs, setPrefs] = useLocalStorage(STORAGE_KEYS.prefs, () => ({ ...DEFAULT_PREFS }), {
    normalise: normalisePrefs,
    fallback: () => ({ ...DEFAULT_PREFS }),
  });

  // DR-INT-01: tell the user once if saved data had to be repaired.
  const noticeShown = useRef(false);
  const notice = tasksNotice || anchorsNotice || teamNotice || workspaceNotice;
  useEffect(() => {
    if (!notice || noticeShown.current) return;
    noticeShown.current = true;
    toast({ tone: 'error', message: 'Slopify cannot read some saved data. A backup copy is in the browser.' });
  }, [notice, toast]);

  // Appearance settings go on <html>; "Match system" follows OS changes live.
  useEffect(() => {
    applyPrefsToDocument(prefs);
    if (prefs.theme !== 'system') return undefined;
    return onSystemThemeChange(() => applyPrefsToDocument(prefs));
  }, [prefs]);

  // DR-CAP-02: warn once when the board gets close to the ~5 MB limit.
  const sizeWarned = useRef(false);
  useEffect(() => {
    if (sizeWarned.current || estimateStorageBytes() < STORAGE_WARN_BYTES) return;
    sizeWarned.current = true;
    toast({
      tone: 'error',
      message: 'Your board is almost too big for this browser. Export it, then remove old contexts.',
    });
  }, [tasks, toast]);

  /** Replace the whole board at once (import, demo data, reset). */
  const replaceBoard = useCallback(
    (data) => {
      if (data.team) setTeam(data.team);
      if (data.workspace) setWorkspace(data.workspace);
      if (data.tasks) setTasks(data.tasks);
      if (data.anchors) setAnchors(data.anchors);
    },
    [setTeam, setWorkspace, setTasks, setAnchors],
  );

  const lead = teamLead(team, workspace);

  // Log-in (no password). The profile is remembered in this browser, so a
  // reload keeps you logged in. A removed profile logs you out.
  const currentUser = findMember(team, prefs.currentMemberId);

  // Set at log-in, read once by the board for the "handed to you" notice.
  // `since` is the member's previous visit (null on a first visit).
  const [loginNotice, setLoginNotice] = useState(null);

  const login = useCallback(
    (id) => {
      setLoginNotice({ id, since: prefs.lastSeen?.[id] ?? null });
      const now = new Date().toISOString();
      setPrefs((p) => ({ ...p, currentMemberId: id, lastSeen: { ...p.lastSeen, [id]: now } }));
    },
    [prefs.lastSeen, setPrefs],
  );

  const logout = useCallback(() => {
    const now = new Date().toISOString();
    setLoginNotice(null);
    setPrefs((p) =>
      p.currentMemberId ? { ...p, currentMemberId: null, lastSeen: { ...p.lastSeen, [p.currentMemberId]: now } } : p,
    );
  }, [setPrefs]);

  const clearLoginNotice = useCallback(() => setLoginNotice(null), []);

  const value = useMemo(
    () => ({
      tasks,
      setTasks,
      anchors,
      setAnchors,
      team,
      setTeam,
      workspace,
      setWorkspace,
      prefs,
      setPrefs,
      lead,
      currentUser,
      login,
      logout,
      loginNotice,
      clearLoginNotice,
      readOnly,
      replaceBoard,
    }),
    [
      tasks, setTasks, anchors, setAnchors, team, setTeam, workspace, setWorkspace, prefs, setPrefs, lead,
      currentUser, login, logout, loginNotice, clearLoginNotice, readOnly, replaceBoard,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}
