import { useId, useMemo, useRef, useState } from 'react';
import { Clock, Trash2, X } from 'lucide-react';
import Modal from './Modal.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import SegmentedControl from './SegmentedControl.jsx';
import { TYPE_STYLES } from '../lib/types.js';
import { DESCRIPTION_MAX, STAGES, TEAM, TITLE_MAX, TYPES } from '../lib/constants.js';
import { isKnownAssignee } from '../lib/tasks.js';
import {
  buttonDestructive,
  buttonPrimary,
  buttonSecondary,
  helperText,
  iconButton,
  inputBase,
  labelBase,
} from '../lib/ui.js';

// Show a character counter once the user is this close to the limit (FR-M5-05).
const COUNTER_FROM = 0.8;

/**
 * Add / edit task modal (M5 crud-modal).
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
  const ids = {
    heading: useId(),
    title: useId(),
    titleError: useId(),
    titleCount: useId(),
    description: useId(),
    descriptionCount: useId(),
    status: useId(),
    assignee: useId(),
    due: useId(),
    dueHint: useId(),
  };

  const initial = useMemo(
    () =>
      isEdit
        ? {
            title: task.title,
            description: task.description,
            type: task.type,
            status: task.status,
            assignee: task.assignee,
            dueDate: task.dueDate ?? '',
          }
        : {
            title: '',
            description: '',
            type: 'feature',
            status: defaults.status,
            assignee: defaults.assignee,
            dueDate: '',
          },
    // The snapshot is taken once, when the modal opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [form, setForm] = useState(initial);
  const [titleError, setTitleError] = useState('');
  const [confirm, setConfirm] = useState(null); // null | 'discard' | 'delete'
  const titleRef = useRef(null);

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
      assignee: form.assignee,
      dueDate: form.dueDate || null, // DR: empty input → null, never ''
    });
  }

  // Ctrl/Cmd + Enter submits from anywhere in the form, including textareas (FR-M5-16).
  function handleFormKeyDown(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      e.currentTarget.requestSubmit();
    }
  }

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
        className="max-w-[640px]"
      >
        <form noValidate onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="flex min-h-0 flex-1 flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line-subtle px-6 py-4">
            <h2 id={ids.heading} className="font-heading text-xl font-semibold leading-7">
              {isEdit ? 'Edit task' : 'New task'}
            </h2>
            <button type="button" onClick={requestClose} aria-label="Close" className={iconButton}>
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
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
                <p id={ids.titleError} className="mt-1 text-[13px] font-semibold leading-[18px] text-due-overdue-fg">
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
                <select id={ids.assignee} value={form.assignee} onChange={set('assignee')} className={`${inputBase} mt-1 h-10`}>
                  {!isKnownAssignee(form.assignee) && (
                    <option value={form.assignee}>
                      Unassigned
                    </option>
                  )}
                  {TEAM.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
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
                  className={`${inputBase} h-10 max-w-[220px]`}
                />
                {form.dueDate && (
                  <button type="button" onClick={() => setForm((f) => ({ ...f, dueDate: '' }))} className={buttonSecondary}>
                    Clear date
                  </button>
                )}
              </div>
              {dueInPast && (
                <p id={ids.dueHint} className="mt-1 flex items-center gap-1 text-[13px] leading-[18px] text-due-warning-fg">
                  <Clock aria-hidden="true" className="h-3.5 w-3.5" />
                  This date is in the past. You can save it.
                </p>
              )}
            </div>

            {/* TODO M9 context: Context textarea + Tool select. */}
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
          body="You cannot undo this."
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
