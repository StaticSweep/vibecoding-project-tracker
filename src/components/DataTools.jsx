import { useEffect, useRef, useState } from 'react';
import { Download, FlaskConical, RotateCcw, Trash2, Upload } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog.jsx';
import { useToast } from './Toast.jsx';
import { useAppData } from '../context/AppData.jsx';
import { buildDemoBoard } from '../data/demo.js';
import { DEFAULT_ANCHORS } from '../lib/anchors.js';
import { todayISO } from '../lib/dates.js';
import { buildExport, clearAllData, downloadJson, exportFileName, parseImport, removeBackups } from '../lib/transfer.js';
import { buttonDestructive, buttonSecondary } from '../lib/ui.js';

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/**
 * Board data actions (FR-M13-03/05, FR-DATA-04/05, DR-IMP-03, DR-PRIV-03).
 * Every action that replaces data asks first; focus starts on Cancel.
 *
 *   variant  'footer' — compact buttons under the board
 *            'settings' — full buttons in Settings → Data, plus "Delete all data"
 */
export default function DataTools({ variant = 'footer' }) {
  const toast = useToast();
  const { tasks, anchors, team, workspace, setTasks, setAnchors, replaceBoard, readOnly } = useAppData();
  const fileRef = useRef(null);
  const [confirm, setConfirm] = useState(null); // null | 'demo' | 'reset' | 'delete-all' | { import }

  function exportBoard() {
    downloadJson(exportFileName(todayISO()), buildExport({ tasks, anchors, team, workspace }));
    toast({ message: `Exported ${plural(tasks.length, 'task')}. The file is in your downloads.` });
  }

  async function onFileChosen(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // the same file can be chosen again
    if (!file) return;
    const result = parseImport(await file.text(), todayISO());
    if (!result.ok) {
      toast({ tone: 'error', message: result.error });
      return;
    }
    setConfirm({ import: result, fileName: file.name });
  }

  // Move focus to the board after its content was replaced. An effect runs
  // after the confirm dialog's own focus return, so the board wins. In the
  // Settings dialog, focus stays in the dialog.
  const [focusBoardRequest, setFocusBoardRequest] = useState(0);
  const focusBoard = () => setFocusBoardRequest((n) => n + 1);
  useEffect(() => {
    if (focusBoardRequest && variant === 'footer') document.getElementById('board')?.focus();
  }, [focusBoardRequest, variant]);

  function confirmImport() {
    const { import: result } = confirm;
    replaceBoard(result.data);
    setConfirm(null);
    toast({ message: `Board imported: ${plural(result.data.tasks.length, 'task')}.` });
    focusBoard();
  }

  function loadDemo() {
    replaceBoard(buildDemoBoard(todayISO()));
    setConfirm(null);
    toast({ message: 'Demo data loaded. You are Dana R., the team lead.' });
    focusBoard();
  }

  function resetBoard() {
    setTasks([]);
    setAnchors(DEFAULT_ANCHORS);
    removeBackups();
    setConfirm(null);
    toast({ message: 'The board is empty. Your team is still here.' });
    focusBoard();
  }

  function deleteAll() {
    clearAllData();
    window.location.reload();
  }

  const compact = variant === 'footer';
  const button = `${buttonSecondary}${compact ? ' h-8 px-3' : ''}`;
  const icon = 'h-4 w-4';
  const blocked = readOnly ? 'A newer version of Slopify saved this board. You cannot change it.' : undefined;

  return (
    <>
      <div className={`flex flex-wrap items-center gap-2 ${compact ? '' : 'mt-2'}`}>
        <button type="button" onClick={exportBoard} className={button}>
          <Download aria-hidden="true" className={icon} />
          Export
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={readOnly}
          title={blocked}
          className={button}
        >
          <Upload aria-hidden="true" className={icon} />
          Import
        </button>
        <button type="button" onClick={() => setConfirm('demo')} disabled={readOnly} title={blocked} className={button}>
          <FlaskConical aria-hidden="true" className={icon} />
          Load demo data
        </button>
        <button
          type="button"
          onClick={() => setConfirm('reset')}
          disabled={readOnly}
          title={blocked}
          className={`${buttonDestructive}${compact ? ' h-8 px-3' : ''}`}
        >
          <RotateCcw aria-hidden="true" className={icon} />
          Reset board
        </button>
        {!compact && (
          <button type="button" onClick={() => setConfirm('delete-all')} className={buttonDestructive}>
            <Trash2 aria-hidden="true" className={icon} />
            Delete all data
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={onFileChosen}
          tabIndex={-1}
          aria-hidden="true"
          className="hidden"
        />
      </div>

      {confirm === 'demo' && (
        <ConfirmDialog
          title="Replace your board with demo data?"
          body="The demo has its own team and 12 tasks. You cannot undo this. Export your board first to keep a copy."
          confirmLabel="Load demo data"
          extraAction={{ label: 'Export first', onClick: exportBoard }}
          onConfirm={loadDemo}
          onCancel={() => setConfirm(null)}
        />
      )}

      {confirm === 'reset' && (
        <ConfirmDialog
          title="Delete all tasks and links?"
          body="Your team and settings stay. You cannot undo this."
          confirmLabel="Reset board"
          extraAction={{ label: 'Export first', onClick: exportBoard }}
          onConfirm={resetBoard}
          onCancel={() => setConfirm(null)}
        />
      )}

      {confirm === 'delete-all' && (
        <ConfirmDialog
          title="Delete all Slopify data in this browser?"
          body="This deletes the board, the team and your settings. Slopify then starts again with example tasks. You cannot undo this."
          confirmLabel="Delete all data"
          extraAction={{ label: 'Export first', onClick: exportBoard }}
          onConfirm={deleteAll}
          onCancel={() => setConfirm(null)}
        />
      )}

      {confirm?.import && (
        <ConfirmDialog
          title="Replace your board?"
          body={`Replace ${plural(tasks.length, 'task')} with ${plural(confirm.import.data.tasks.length, 'task')} and ${plural(
            confirm.import.data.team.length,
            'team member',
          )} from “${confirm.fileName}”? You cannot undo this.${
            confirm.import.dropped
              ? ` Slopify skips ${confirm.import.dropped} damaged ${confirm.import.dropped === 1 ? 'entry' : 'entries'} in the file.`
              : ''
          }`}
          confirmLabel="Replace board"
          extraAction={{ label: 'Export first', onClick: exportBoard }}
          onConfirm={confirmImport}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
}
