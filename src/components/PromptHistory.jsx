import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import CopyPromptButton from './CopyPromptButton.jsx';
import { formatLongDateTime, formatTimeAgo } from '../lib/dates.js';
import { normaliseHistory } from '../lib/history.js';
import { taskToPrompt } from '../lib/prompt.js';
import { buttonSecondary, focusRing, helperText } from '../lib/ui.js';

/**
 * Prompt history timeline (M12 secret-sauce).
 *
 * Shows every saved version of a task's context, newest first. Each version
 * can be read, copied as a full prompt, or restored into the Context field
 * (the restore is a normal form change — the user still saves it).
 *
 *   task       the saved task (current version + contextHistory)
 *   draft      () => the task as it is in the form now (for copy)
 *   today      'YYYY-MM-DD'
 *   onRestore  (version) => void
 */
export default function PromptHistory({ task, draft, today, onRestore }) {
  const current = (task.context ?? '').trim()
    ? [{ context: task.context, contextTool: task.contextTool, savedAt: task.contextUpdatedAt, current: true }]
    : [];
  const versions = [...current, ...normaliseHistory(task.contextHistory)];
  const [open, setOpen] = useState(null); // index of the expanded version

  if (versions.length === 0) return null;

  return (
    <details className="group overflow-hidden rounded-2xl border border-line-subtle bg-white/60" open={versions.length > 1}>
      <summary className="flex h-9 cursor-pointer items-center gap-2 px-3 text-sm font-semibold text-ink hover:bg-brand-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary">
        Prompt history
        <span className="font-normal text-ink-muted">
          · {versions.length} {versions.length === 1 ? 'version' : 'versions'}
        </span>
      </summary>

      <ol className="relative mx-3 mb-3 mt-1 border-l-2 border-line-subtle pl-4">
        {versions.map((v, i) => {
          const number = versions.length - i;
          const expanded = open === i;
          const panelId = `history-${task.id}-${i}`;
          return (
            <li key={`${v.savedAt}-${i}`} className="relative py-2">
              {/* Timeline dot: filled for the current version */}
              <span
                aria-hidden="true"
                className={`absolute -left-[23px] top-3.5 h-3 w-3 rounded-full border-2 ${
                  v.current ? 'border-brand-primary bg-brand-primary' : 'border-line-strong bg-surface-card'
                }`}
              />
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-sm font-semibold text-ink">
                  Version {number}
                  {v.current && <span className="font-normal text-ink-muted"> (current)</span>}
                </span>
                <span className={helperText} title={v.savedAt ? formatLongDateTime(v.savedAt) : undefined}>
                  {v.savedAt ? formatTimeAgo(v.savedAt) : 'Date not known'}
                  {v.contextTool ? ` · ${v.contextTool}` : ''}
                </span>
                <span className="ml-auto flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setOpen(expanded ? null : i)}
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    className={`h-7 rounded-full px-3 text-sm font-semibold text-brand-primary hover:bg-brand-accent ${focusRing}`}
                  >
                    {expanded ? 'Hide' : 'Show'}
                  </button>
                  <CopyPromptButton
                    variant="icon"
                    getText={() =>
                      taskToPrompt(
                        { ...draft(), context: v.context, contextTool: v.contextTool, contextUpdatedAt: v.savedAt },
                        { today },
                      )
                    }
                  />
                  {!v.current && (
                    <button
                      type="button"
                      onClick={() => onRestore(v)}
                      className={`${buttonSecondary} h-7 px-2`}
                      title="Put this version in the Context field. Save to keep it."
                    >
                      <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
                      Restore
                    </button>
                  )}
                </span>
              </div>
              {expanded && (
                <pre
                  id={panelId}
                  className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-surface-page px-3 py-2 font-mono text-[13px] leading-5 text-ink"
                >
                  {v.context}
                </pre>
              )}
            </li>
          );
        })}
      </ol>
    </details>
  );
}
