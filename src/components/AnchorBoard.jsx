import { useEffect, useId, useRef, useState } from 'react';
import { Check, Copy, ExternalLink, Pencil, Plus, Trash2, X } from 'lucide-react';
import { hostOf, normaliseUrl } from '../lib/anchors.js';
import { copyText } from '../lib/clipboard.js';
import { focusRing, glassCard, glassPanel, iconButton, inputBase } from '../lib/ui.js';
import { useToast } from './Toast.jsx';

/**
 * Deliverable Anchor Board (M11, DESIGN.md §4.13). Four fixed slots above
 * the Kanban: Presentation, Demo, Report, Documentation. Compact (≤ 120 px)
 * so the board stays above the fold (FR-M11-08).
 */
export default function AnchorBoard({ anchors, onChange }) {
  const linked = anchors.filter((a) => a.url).length;
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className={`mx-4 mb-3 rounded-3xl px-4 pb-3 pt-2.5 ${glassPanel}`}>
      <div className="mb-2 flex items-baseline gap-2">
        <h2
          id={headingId}
          className="font-heading text-sm font-semibold uppercase leading-5 tracking-[0.05em] text-ink"
        >
          Deliverables
        </h2>
        {/* FR-M11-07 */}
        <p className="text-caption text-ink-muted">
          {linked} of {anchors.length} links added
        </p>
      </div>
      <ul className="grid min-w-[1088px] grid-cols-4 gap-4">
        {anchors.map((anchor) => (
          <AnchorSlot key={anchor.id} anchor={anchor} onChange={onChange} />
        ))}
      </ul>
    </section>
  );
}

function AnchorSlot({ anchor, onChange }) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const inputId = useId();
  const errorId = useId();
  const inputRef = useRef(null);
  const slotRef = useRef(null);
  const wasEditing = useRef(false);

  // Focus: into the field when editing starts; back to the slot's main
  // control when it ends (FR-M11-04, NFR-A11Y-03).
  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    } else if (wasEditing.current) {
      slotRef.current?.querySelector('[data-slot-focus]')?.focus();
    }
    wasEditing.current = editing;
  }, [editing]);

  function startEdit() {
    setDraft(anchor.url ?? '');
    setError('');
    setEditing(true);
  }

  function save() {
    const result = normaliseUrl(draft);
    if (!result.ok) {
      setError(result.error);
      inputRef.current?.focus();
      return;
    }
    onChange(anchor.id, result.url);
    setEditing(false);
  }

  function remove() {
    onChange(anchor.id, null);
    setEditing(false);
  }

  async function copyLink() {
    const ok = await copyText(anchor.url);
    toast(ok ? { message: 'Link copied.' } : { tone: 'error', message: 'Slopify cannot copy the link.' });
  }

  const box = 'flex h-14 items-center gap-2 rounded-2xl px-3';

  return (
    <li ref={slotRef}>
      {editing ? (
        <div>
          <div className={`${box} border border-brand-primary bg-glass/90 shadow-glass-sm`}>
            <label htmlFor={inputId} className="sr-only">
              {anchor.label} link
            </label>
            <input
              ref={inputRef}
              id={inputId}
              type="text"
              inputMode="url"
              autoComplete="url"
              spellCheck={false}
              value={draft}
              placeholder={`${anchor.label} link`}
              onChange={(e) => {
                setDraft(e.target.value);
                if (error) setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  save();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  e.stopPropagation();
                  setEditing(false);
                }
              }}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? errorId : undefined}
              className={`${inputBase} h-8 min-w-0 flex-1 text-sm`}
            />
            <button type="button" onClick={save} aria-label={`Save ${anchor.label} link`} title="Save (Enter)" className={iconButton}>
              <Check aria-hidden="true" className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setEditing(false)} aria-label="Cancel" title="Cancel (Esc)" className={iconButton}>
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
            {anchor.url && (
              <button type="button" onClick={remove} aria-label={`Remove ${anchor.label} link`} title="Remove link" className={iconButton}>
                <Trash2 aria-hidden="true" className="h-4 w-4" />
              </button>
            )}
          </div>
          {error && (
            <p id={errorId} className="mt-1 text-caption font-semibold text-due-overdue-fg">
              {error}
            </p>
          )}
        </div>
      ) : anchor.url ? (
        // Filled slot: the link opens; a separate pencil edits (FR-M11-06).
        <div className={`${box} ${glassCard}`}>
          <a
            href={anchor.url}
            target="_blank"
            rel="noopener noreferrer"
            title={anchor.url}
            className={`group min-w-0 flex-1 rounded ${focusRing}`}
          >
            <span className="block font-mono text-xs font-semibold uppercase leading-4 tracking-[0.04em] text-ink-muted">
              {anchor.label}
            </span>
            <span className="flex items-center gap-1 text-sm font-semibold leading-5 text-brand-primary group-hover:underline">
              <span className="truncate">{hostOf(anchor.url)}</span>
              <ExternalLink aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              <span className="sr-only">(opens in a new tab)</span>
            </span>
          </a>
          <button type="button" onClick={copyLink} aria-label={`Copy ${anchor.label} link`} title="Copy link" className={iconButton}>
            <Copy aria-hidden="true" className="h-4 w-4" />
          </button>
          <button type="button" data-slot-focus onClick={startEdit} aria-label={`Edit ${anchor.label} link`} title="Edit link" className={iconButton}>
            <Pencil aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      ) : (
        // Empty slot (DESIGN.md §4.11 empty-state style).
        <button
          type="button"
          data-slot-focus
          onClick={startEdit}
          aria-label={`Add link for ${anchor.label}`}
          className={`${box} w-full border border-dashed border-line-strong bg-glass/50 text-left text-ink-muted transition-colors duration-150 hover:bg-glass/90 hover:text-brand-primary motion-reduce:transition-none reduce-transparency:bg-surface-card ${focusRing}`}
        >
          <Plus aria-hidden="true" className="h-4 w-4 shrink-0" />
          <span className="min-w-0">
            <span className="block font-mono text-xs font-semibold uppercase leading-4 tracking-[0.04em]">
              {anchor.label}
            </span>
            <span className="block text-sm leading-5">Add link</span>
          </span>
        </button>
      )}
    </li>
  );
}
