import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { TriangleAlert, X } from 'lucide-react';
import { focusRing } from '../lib/ui.js';

/**
 * Shared toast system (FR-APP-05, DESIGN.md §4.10).
 *
 *   const toast = useToast();
 *   toast({ message: 'Copied. Paste it into your AI tool.' });
 *   toast({ message: '…', tone: 'error' });
 *   toast({ message: '…', action: { label: 'Undo', onClick }, duration: 5000 });
 *
 * - Bottom right, max 3 at once (the oldest leaves first).
 * - 200 ms fade, closes after 4 s (or `duration`), close button on each toast.
 * - Announced through an aria-live="polite" region.
 */

const MAX_TOASTS = 3;
const DURATION_MS = 4000;
const FADE_MS = 200;

const ToastContext = createContext(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    window.setTimeout(() => {
      setToasts((list) => list.filter((t) => t.id !== id));
    }, FADE_MS);
  }, []);

  const show = useCallback(({ message, tone = 'info', action = null, duration = DURATION_MS }) => {
    const id = nextId.current++;
    setToasts((list) => [...list, { id, message, tone, action, duration, leaving: false }].slice(-MAX_TOASTS));
    return id;
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-6 right-6 z-50 flex w-96 max-w-[calc(100vw-3rem)] flex-col gap-2"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }) {
  const [visible, setVisible] = useState(false);

  // Fade in on the next frame.
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setVisible(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  // Auto-close.
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => window.clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  const shown = visible && !toast.leaving;

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 rounded-2xl bg-inverse/85 px-4 py-3 text-sm text-on-inverse shadow-glass-lg backdrop-blur-xl reduce-transparency:bg-inverse transition-opacity duration-200 motion-reduce:transition-none ${
        shown ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {toast.tone === 'error' && (
        // On the dark toast, the light overdue tint keeps the icon above 3:1.
        <TriangleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-due-overdue-bg" />
      )}
      <p className="flex-1 leading-5">{toast.message}</p>
      {toast.action && (
        <button
          type="button"
          onClick={() => {
            toast.action.onClick();
            onDismiss(toast.id);
          }}
          className={`rounded font-semibold text-brand-accent underline underline-offset-2 hover:text-on-inverse ${focusRing}`}
        >
          {toast.action.label}
        </button>
      )}
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Close notification"
        className={`-m-1 rounded p-1 text-on-inverse/80 hover:text-on-inverse ${focusRing}`}
      >
        <X aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
}
