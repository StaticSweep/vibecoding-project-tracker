import { useEffect, useId, useRef, useState } from 'react';
import { Check, ClipboardCopy } from 'lucide-react';
import Modal from './Modal.jsx';
import { useToast } from './Toast.jsx';
import { copyText } from '../lib/clipboard.js';
import { buttonPrimary, buttonSecondary, helperText, iconButton } from '../lib/ui.js';

const COPIED_MS = 2000;
const COPY_FAILED =
  'Slopify cannot copy the text. Select the text and push Ctrl+C (Cmd+C on a Mac).';

/**
 * "Copy as Prompt Context" (M10 copy-prompt, FR-M10-01/03/04/06).
 *
 *   getText  () => string — builds the prompt at click time
 *   variant  'icon' (card) | 'button' (modal)
 *
 * One click copies. Success: "Copied" state for 2 s + toast. Failure: error
 * toast + a dialog with the text pre-selected for a manual copy.
 */
export default function CopyPromptButton({ getText, variant = 'button' }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const [manualText, setManualText] = useState(null);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), COPIED_MS);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function handleClick(e) {
    e.stopPropagation(); // never open the card's edit modal (FR-M7-04)
    const text = getText();
    if (await copyText(text)) {
      setCopied(true);
      toast({ message: 'Copied. Paste it into your AI tool.' });
    } else {
      toast({ tone: 'error', message: COPY_FAILED });
      setManualText(text);
    }
  }

  const Icon = copied ? Check : ClipboardCopy;
  const label = copied ? 'Copied' : 'Copy as Prompt Context';

  return (
    <>
      {variant === 'icon' ? (
        <button type="button" onClick={handleClick} aria-label={label} title={label} className={iconButton}>
          <Icon aria-hidden="true" className={`h-4 w-4 ${copied ? 'text-due-safe' : ''}`} />
        </button>
      ) : (
        <button type="button" onClick={handleClick} className={buttonSecondary}>
          <Icon aria-hidden="true" className={`h-4 w-4 ${copied ? 'text-due-safe' : ''}`} />
          {label}
        </button>
      )}

      {manualText !== null && (
        <ManualCopyDialog text={manualText} onClose={() => setManualText(null)} />
      )}
    </>
  );
}

/** Last-resort fallback: the prompt in a read-only, pre-selected box. */
function ManualCopyDialog({ text, onClose }) {
  const titleId = useId();
  const helpId = useId();
  const areaRef = useRef(null);

  useEffect(() => {
    areaRef.current?.select();
  }, []);

  return (
    <Modal labelledBy={titleId} describedBy={helpId} onRequestClose={onClose} initialFocusRef={areaRef} className="max-w-[640px]">
      <div className="space-y-3 p-6">
        <h2 id={titleId} className="font-heading text-xl font-semibold leading-7">
          Copy the prompt
        </h2>
        <p id={helpId} className={helperText}>
          {COPY_FAILED}
        </p>
        <textarea
          ref={areaRef}
          readOnly
          value={text}
          rows={12}
          onFocus={(e) => e.target.select()}
          className="w-full resize-y rounded-md border border-line-strong bg-surface-page px-3 py-2 font-mono text-sm leading-[22px] text-ink"
        />
        <div className="flex justify-end">
          <button type="button" onClick={onClose} className={buttonPrimary}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
