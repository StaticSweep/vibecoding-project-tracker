import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// Nested modals (e.g. a confirm dialog over the task modal) share one scroll lock.
let scrollLocks = 0;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible modal shell (FR-M5-15…19, DESIGN.md §4.8 / §4.9).
 *
 * - role="dialog" (or "alertdialog"), aria-modal, aria-labelledby.
 * - Focus moves in on open (`initialFocusRef`, else the first control),
 *   Tab cycles inside, and focus goes back on close (`returnFocus`, else the
 *   element that had focus before the modal opened).
 * - Esc and a click on the backdrop call `onRequestClose`.
 * - Page scroll is locked while open.
 */
export default function Modal({
  labelledBy,
  describedBy,
  role = 'dialog',
  onRequestClose,
  initialFocusRef,
  returnFocus,
  className = '',
  children,
}) {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onRequestClose);
  const returnFocusRef = useRef(returnFocus);
  onCloseRef.current = onRequestClose;
  returnFocusRef.current = returnFocus;

  useEffect(() => {
    const previous = document.activeElement;
    const target =
      initialFocusRef?.current ?? dialogRef.current.querySelector(FOCUSABLE) ?? dialogRef.current;
    target.focus();

    scrollLocks += 1;
    document.body.style.overflow = 'hidden';

    return () => {
      scrollLocks -= 1;
      if (scrollLocks === 0) document.body.style.overflow = '';
      if (returnFocusRef.current) returnFocusRef.current(previous);
      else if (previous?.isConnected) previous.focus();
    };
    // Run once per open; refs carry the latest callbacks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onCloseRef.current();
      return;
    }
    if (e.key !== 'Tab') return;

    e.stopPropagation();
    const items = [...dialogRef.current.querySelectorAll(FOCUSABLE)].filter(
      (el) => el.offsetParent !== null,
    );
    if (items.length === 0) {
      e.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-ink/50 p-6"
      onMouseDown={(e) => {
        if (e.target !== e.currentTarget) return;
        // Stop the browser from moving focus to <body> after we restore it.
        e.preventDefault();
        onCloseRef.current();
      }}
    >
      <div
        ref={dialogRef}
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={`flex max-h-[calc(100vh-3rem)] w-full flex-col rounded-xl bg-surface-card text-ink shadow-xl focus:outline-none ${className}`}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
