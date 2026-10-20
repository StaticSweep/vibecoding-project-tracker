import { useId, useRef } from 'react';
import Modal from './Modal.jsx';
import { buttonDanger, buttonPrimary, buttonSecondary } from '../lib/ui.js';

/**
 * Shared confirm dialog for destructive actions (FR-APP-06, DESIGN.md §4.9).
 * One question, one sentence about the result, two buttons.
 * Focus starts on Cancel.
 */
export default function ConfirmDialog({
  title,
  body,
  confirmLabel,
  cancelLabel = 'Cancel',
  tone = 'danger',
  onConfirm,
  onCancel,
}) {
  const titleId = useId();
  const bodyId = useId();
  const cancelRef = useRef(null);

  return (
    <Modal
      role="alertdialog"
      labelledBy={titleId}
      describedBy={bodyId}
      onRequestClose={onCancel}
      initialFocusRef={cancelRef}
      className="max-w-[400px]"
    >
      <div className="p-6">
        <h2 id={titleId} className="font-heading text-xl font-semibold leading-7">
          {title}
        </h2>
        <p id={bodyId} className="mt-2 text-base leading-6 text-ink-muted">
          {body}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button ref={cancelRef} type="button" onClick={onCancel} className={buttonSecondary}>
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={tone === 'danger' ? buttonDanger : buttonPrimary}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
