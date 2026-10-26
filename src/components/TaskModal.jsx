import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Clock, FilePlus2, Mail, Trash2, TriangleAlert, X } from 'lucide-react';
import Modal from './Modal.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import SegmentedControl from './SegmentedControl.jsx';
import CopyPromptButton from './CopyPromptButton.jsx';
import PromptHistory from './PromptHistory.jsx';
import { taskToPrompt } from '../lib/prompt.js';
import { TYPE_STYLES } from '../lib/types.js';
import { CONTEXT_TOOLS, DESCRIPTION_MAX, STAGES, TITLE_MAX, TYPES } from '../lib/constants.js';
import { CONTEXT_TEMPLATE, CONTEXT_WARN_LENGTH } from '../lib/context.js';
import { formatLongDateTime, formatTimeAgo } from '../lib/dates.js';
import { findMember, firstName, roleLabel } from '../lib/team.js';
import { useAppData, usePromptOptions } from '../context/AppData.jsx';
import {
  buttonDestructive,
  buttonPrimary,
  buttonSecondary,
  focusRing,
  helperText,
  iconButton,
  inputBase,
  labelBase,
} from '../lib/ui.js';

// Show a character counter once the user is this close to the limit (FR-M5-05).
const COUNTER_FROM = 0.8;

/**
 * Add / edit task modal (M5 crud-modal, M9 context).
 *
 * Props:
 *   mode       'create' | 'edit'
 *   task       the task to edit (edit mode)
 *   defaults   { status, assignee } for create mode
 *   today      'YYYY-MM-DD'
 *   onSave     (fields) => void   — user-editable fields only (DR-LIFE-01)
 *   onDelete   (id) => void
 *   onClose    () => void
 *   returnFocus (previousElement) => void
 */
export default function TaskModal({ mode, task, defaults, today, onSave, onDelete, onClose, returnFocus }) {
  const isEdit = mode === 'edit';
  const { team } = useAppData();
  const promptOptions = usePromptOptions();
  const ids = {
    heading: useId(),
    title: useId(),
    titleError: useId(),
    titleCount: useId(),
    description: useId(),
    descriptionCount: useId(),
    status: useId(),
    assignee: useId(),
    assigneeInfo: useId(),
    due: useId(),
    dueHint: useId(),
    context: useId(),
    contextHelp: useId(),
    contextWarn: useId(),
    tool: useId(),
  };

  const initial = useMemo(
    () =>
      isEdit
        ? {
            title: task.title,
            description: task.description,
            type: task.type,
            status: task.status,
            assignee: task.assignee ?? '',
            dueDate: task.dueDate ?? '',
            context: task.context ?? '',
            contextTool: task.contextTool ?? '',
          }
        : {
            title: '',
            description: '',
            type: 'feature',
            status: defaults.status,
            assignee: defaults.assignee ?? '',
            dueDate: '',
            context: '',
            contextTool: '',
          },
    // The snapshot is taken once, when the modal opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [form, setForm] = useState(initial);
  const [titleError, setTitleError] = useState('');
  const [confirm, setConfirm] = useState(null); // null | 'discard' | 'delete'
  const titleRef = useRef(null);
  const contextRef = useRef(null);

  const isDirty = JSON.stringify(form) !== JSON.stringify(initial);
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  function requestClose() {
    if (isDirty) setConfirm('discard'); // FR-M5-11
    else onClose();
  }

  function handleSubmit(e) {
    e.preventDefault();
    const title = form.title.trim();
    if (!title) {
      setTitleError('Type a title for the task.'); // FR-M5-04
      titleRef.current?.focus();
      return;
    }
    onSave({
      title,
      description: form.description,
      type: form.type,
      status: form.status,
      assignee: form.assignee || null, // '' = Unassigned
      dueDate: form.dueDate || null, // DR: empty input → null, never ''
      context: form.context, // stored verbatim (FR-M9-08)
      contextTool: form.contextTool || null,
    });
  }

  // FR-M9-09: fill an empty Context field with the template headings.
  // The button disappears once the field is filled, so focus moves to the
  // textarea right after that render (not via the removed button).
  // `focusContext` holds the caret position to put in the textarea, or null.
  const [focusContext, setFocusContext] = useState(null);
  function insertTemplate() {
    setForm((f) => ({ ...f, context: CONTEXT_TEMPLATE }));
    setFocusContext(CONTEXT_TEMPLATE.indexOf('\n') + 1); // the line after "## Goal"
  }
  useEffect(() => {
    if (focusContext === null) return;
    setFocusContext(null);
    const el = contextRef.current;
    el?.focus();
    el?.setSelectionRange(focusContext, focusContext);
  }, [focusContext]);

  // M12: put an earlier version back in the form. Saving keeps it (and moves
  // the current text into the history).
  function restoreVersion(version) {
    setForm((f) => ({ ...f, context: version.context, contextTool: version.contextTool ?? '' }));
    setFocusContext(0);
  }

  // The task as it is in the form now (for the copy button and preview).
  function draftTask() {
    return {
      ...(task ?? {}),
      title: form.title,
      description: form.description,
      type: form.type,
      status: form.status,
      assignee: form.assignee || null,
      dueDate: form.dueDate || null,
      context: form.context,
      contextTool: form.contextTool || null,
      contextUpdatedAt: task?.contextUpdatedAt ?? null,
    };
  }

  // Ctrl/Cmd + Enter submits from anywhere in the form, including textareas (FR-M5-16).
  function handleFormKeyDown(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      e.currentTarget.requestSubmit();
    }
  }

  const owner = findMember(team, form.assignee);
  const ownerRole = roleLabel(owner?.role);
  const showTitleCount = form.title.length >= TITLE_MAX * COUNTER_FROM;
  const showDescriptionCount = form.description.length >= DESCRIPTION_MAX * COUNTER_FROM;
  const dueInPast = !isEdit && form.dueDate && form.dueDate < today; // FR-M8-07

  return (
    <>
      <Modal
        labelledBy={ids.heading}
        onRequestClose={requestClose}
        initialFocusRef={titleRef}
        returnFocus={returnFocus}
        className="max-w-[40rem]"
      >
        <form noValidate onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="flex min-h-0 flex-1 flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line-subtle px-6 py-4">
            <h2 id={ids.heading} className="font-heading text-xl font-semibold leading-7">
              {isEdit ? 'Edit task' : 'New task'}
            </h2>
            <div className="flex items-center gap-2">
              {/* M10: copies what is in the form now, saved or not */}
              <CopyPromptButton getText={() => taskToPrompt(draftTask(), { today, ...promptOptions })} />
              <button type="button" onClick={requestClose} aria-label="Close" className={iconButton}>
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body — scrolls when taller than the viewport (FR-M5-19) */}
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            {/* Title */}
            <div>
              <label htmlFor={ids.title} className={labelBase}>
                Title
              </label>
              <input
                ref={titleRef}
                id={ids.title}
                type="text"
                value={form.title}
                onChange={(e) => {
                  set('title')(e);
                  if (titleError) setTitleError('');
                }}
                maxLength={TITLE_MAX}
                required
                aria-required="true"
                aria-invalid={titleError ? 'true' : 'false'}
                aria-describedby={[titleError && ids.titleError, showTitleCount && ids.titleCount].filter(Boolean).join(' ') || undefined}
                autoComplete="off"
                className={`${inputBase} mt-1 h-10`}
              />
              {titleError && (
                <p id={ids.titleError} className="mt-1 text-caption font-semibold text-due-overdue-fg">
                  {titleError}
                </p>
              )}
              {showTitleCount && (
                <p id={ids.titleCount} className={`mt-1 ${helperText}`}>
                  {form.title.length} of {TITLE_MAX} characters
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor={ids.description} className={labelBase}>
                Description
              </label>
              <textarea
                id={ids.description}
                value={form.description}
                onChange={set('description')}
                maxLength={DESCRIPTION_MAX}
                rows={4}
                aria-describedby={showDescriptionCount ? ids.descriptionCount : undefined}
                className={`${inputBase} mt-1 resize-y py-2 leading-6`}
              />
              {showDescriptionCount && (
                <p id={ids.descriptionCount} className={`mt-1 ${helperText}`}>
                  {form.description.length} of {DESCRIPTION_MAX} characters
                </p>
              )}
            </div>

            {/* Type — segmented control with the type colours (FR-M6-03) */}
            <SegmentedControl
              legend="Type"
              value={form.type}
              onChange={(type) => setForm((f) => ({ ...f, type }))}
              options={TYPES.map((t) => ({
                value: t.id,
                label: t.label,
                icon: TYPE_STYLES[t.id].icon,
                iconClass: TYPE_STYLES[t.id].iconClass,
                selectedClass: TYPE_STYLES[t.id].selected,
              }))}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Stage */}
              <div>
                <label htmlFor={ids.status} className={labelBase}>
                  Stage
                </label>
                <select id={ids.status} value={form.status} onChange={set('status')} className={`${inputBase} mt-1 h-10`}>
                  {STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignee — an unknown stored value stays until reassigned (DR-INT-05) */}
              <div>
                <label htmlFor={ids.assignee} className={labelBase}>
                  Assignee
                </label>
                <select
                  id={ids.assignee}
                  value={owner ? form.assignee : ''}
                  onChange={set('assignee')}
                  aria-describedby={owner && ownerRole ? ids.assigneeInfo : undefined}
                  className={`${inputBase} mt-1 h-10`}
                >
                  <option value="">Unassigned</option>
                  {team.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                {/* The owner's role and a contact link (Q&A: name + email). */}
                {owner && (ownerRole || owner.email) && (
                  <p className={`mt-1 flex flex-wrap items-center gap-x-2 ${helperText}`}>
                    {ownerRole && <span id={ids.assigneeInfo}>{ownerRole}</span>}
                    {owner.email && (
                      <a
                        href={`mailto:${owner.email}`}
                        className={`inline-flex items-center gap-1 rounded font-semibold text-brand-primary underline-offset-2 hover:underline ${focusRing}`}
                      >
                        <Mail aria-hidden="true" className="h-3.5 w-3.5" />
                        Contact {firstName(owner.name)}
                      </a>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Due date */}
            <div>
              <label htmlFor={ids.due} className={labelBase}>
                Due date <span className="font-normal text-ink-muted">(optional)</span>
              </label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  id={ids.due}
                  type="date"
                  value={form.dueDate}
                  onChange={set('dueDate')}
                  aria-describedby={dueInPast ? ids.dueHint : undefined}
                  className={`${inputBase} h-10 max-w-[13.75rem]`}
                />
                {form.dueDate && (
                  <button type="button" onClick={() => setForm((f) => ({ ...f, dueDate: '' }))} className={buttonSecondary}>
                    Clear date
                  </button>
                )}
              </div>
              {dueInPast && (
                <p id={ids.dueHint} className="mt-1 flex items-center gap-1 text-caption text-due-warning-fg">
                  <Clock aria-hidden="true" className="h-3.5 w-3.5" />
                  This date is in the past. You can save it.
                </p>
              )}
            </div>

            {/* Context (M9) — the curated briefing for the next teammate or AI tool */}
            <div className="space-y-3 border-t border-line-subtle pt-5">
              <div>
                <div className="flex items-end justify-between gap-2">
                  <label htmlFor={ids.context} className={labelBase}>
                    Context
                  </label>
                  {form.context === '' && (
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={insertTemplate}
                      className={buttonSecondary}
                    >
                      <FilePlus2 aria-hidden="true" className="h-4 w-4" />
                      Insert template
                    </button>
                  )}
                </div>
                <p id={ids.contextHelp} className={`mt-1 ${helperText}`}>
                  Write what the next person or AI tool must know. Do not put passwords or API keys here.
                </p>
                <textarea
                  ref={contextRef}
                  id={ids.context}
                  value={form.context}
                  onChange={set('context')}
                  rows={8}
                  spellCheck={false}
                  placeholder={'Goal, what already works, limits, files, the last prompt, the next step.'}
                  aria-describedby={[ids.contextHelp, form.context.length > CONTEXT_WARN_LENGTH && ids.contextWarn].filter(Boolean).join(' ')}
                  className={`${inputBase} mt-2 min-h-[9rem] resize-y whitespace-pre-wrap py-2 font-mono text-sm leading-[1.375rem]`}
                />
                {form.context.length > CONTEXT_WARN_LENGTH && (
                  <p id={ids.contextWarn} className="mt-1 flex items-center gap-1 text-caption text-due-warning-fg">
                    <TriangleAlert aria-hidden="true" className="h-3.5 w-3.5" />
                    This context is very long. The browser can keep approximately 5 MB of data.
                  </p>
                )}
              </div>

              <div className="flex items-end justify-between gap-4">
                <div>
                  <label htmlFor={ids.tool} className={labelBase}>
                    Tool
                  </label>
                  <select
                    id={ids.tool}
                    value={form.contextTool}
                    onChange={set('contextTool')}
                    className={`${inputBase} mt-1 h-10 w-48`}
                  >
                    <option value="">No tool</option>
                    {CONTEXT_TOOLS.map((tool) => (
                      <option key={tool} value={tool}>
                        {tool}
                      </option>
                    ))}
                  </select>
                </div>
                {isEdit && task.contextUpdatedAt && (
                  <p className={helperText} title={formatLongDateTime(task.contextUpdatedAt)}>
                    Updated {formatTimeAgo(task.contextUpdatedAt)}
                  </p>
                )}
              </div>

              {/* M12 secret sauce: every saved version of this prompt */}
              {isEdit && (
                <PromptHistory task={task} draft={draftTask} today={today} onRestore={restoreVersion} />
              )}

              {/* FR-M10-09: preview of the copied text */}
              <details className="group overflow-hidden rounded-2xl border border-line-subtle bg-glass/60">
                <summary className="flex h-9 cursor-pointer items-center px-3 text-sm font-semibold text-ink hover:bg-brand-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary">
                  Preview the prompt
                </summary>
                <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words border-t border-line-subtle bg-surface-page px-3 py-2 font-mono text-caption leading-5 text-ink">
                  {taskToPrompt(draftTask(), { today, ...promptOptions })}
                </pre>
              </details>
            </div>
          </div>

          {/* Action bar — stays visible (FR-M5-12, DESIGN.md §4.8) */}
          <div className="flex items-center justify-between gap-2 border-t border-line-subtle px-6 py-4">
            <div>
              {isEdit && (
                <button type="button" onClick={() => setConfirm('delete')} className={buttonDestructive}>
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                  Delete task
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={requestClose} className={buttonSecondary}>
                Cancel
              </button>
              <button type="submit" className={buttonPrimary} title="Ctrl + Enter">
                {isEdit ? 'Save changes' : 'Create task'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {confirm === 'discard' && (
        <ConfirmDialog
          title="Close without saving?"
          body="You will lose your changes."
          confirmLabel="Discard changes"
          cancelLabel="Keep editing"
          onConfirm={() => {
            setConfirm(null);
            onClose();
          }}
          onCancel={() => setConfirm(null)}
        />
      )}

      {confirm === 'delete' && (
        <ConfirmDialog
          title="Delete this task?"
          body="You can undo this for 5 seconds."
          confirmLabel="Delete task"
          onConfirm={() => {
            setConfirm(null);
            onDelete(task.id);
          }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
}
