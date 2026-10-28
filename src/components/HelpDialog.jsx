import { useId } from 'react';
import { CalendarClock, ClipboardCopy, Crown, ScrollText, Sparkles, UserRound, X } from 'lucide-react';
import Modal from './Modal.jsx';
import { CARD_SHORTCUTS } from './TaskCard.jsx';
import { focusRing, iconButton } from '../lib/ui.js';

// Global shortcuts (NFR-USE-07). Ctrl is Cmd on a Mac (NFR-COMP-03).
export const GLOBAL_SHORTCUTS = [
  { keys: 'N', label: 'New task' },
  { keys: '/', label: 'Search the tasks' },
  { keys: '?', label: 'Open this help' },
  { keys: 'Esc', label: 'Close a dialog, or clear the search' },
  { keys: 'Ctrl + Enter', label: 'Save the task (Cmd + Enter on a Mac)' },
];

const CARD_PARTS = [
  { icon: Sparkles, title: 'Type', text: 'Feature or Bug: the coloured stripe, the icon and the word.' },
  { icon: CalendarClock, title: 'Due date', text: 'The card colour and the label: overdue, due today or tomorrow, later, or done.' },
  { icon: UserRound, title: 'Owner', text: 'Choose a name in the owner list to hand off the task. Undo is in the message.' },
  { icon: ScrollText, title: 'Context', text: 'The AI tool and the number of prompt versions, e.g. “Claude · v3”.' },
  { icon: ClipboardCopy, title: 'Copy as Prompt Context', text: 'Copies the task, the owner’s role and the context, ready to paste into an AI tool.' },
];

/**
 * Help (DESIGN.md §4.20): how to read a card, every shortcut, and where the
 * data lives. For new and junior team members (Q&A: target audience).
 */
export default function HelpDialog({ onClose }) {
  const headingId = useId();
  return (
    <Modal labelledBy={headingId} onRequestClose={onClose} className="max-w-[44rem]">
      <div className="flex items-center justify-between gap-4 border-b border-line-subtle px-4 py-4 sm:px-6">
        <h2 id={headingId} className="font-heading text-xl font-semibold leading-7">
          Help and shortcuts
        </h2>
        <button type="button" onClick={onClose} aria-label="Close help" className={iconButton}>
          <X aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>

      {/* Focusable, so keyboard users can scroll it (WCAG 2.1.1). */}
      <div
        tabIndex={0}
        role="region"
        aria-labelledby={headingId}
        className={`min-h-0 flex-1 space-y-7 overflow-y-auto px-4 py-5 sm:px-6 ${focusRing} focus-visible:ring-inset focus-visible:ring-offset-0`}
      >
        <section aria-labelledby="help-card">
          <h3 id="help-card" className="font-heading text-base font-semibold">
            How to read a card
          </h3>
          <ul className="mt-2 space-y-2">
            {CARD_PARTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3">
                <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" />
                <p className="text-sm leading-6">
                  <span className="font-semibold">{title}.</span> <span className="text-ink-muted">{text}</span>
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="help-keys">
          <h3 id="help-keys" className="font-heading text-base font-semibold">
            Keyboard shortcuts
          </h3>
          <div className="mt-2 grid gap-6 sm:grid-cols-2">
            <ShortcutTable caption="Anywhere on the board" rows={GLOBAL_SHORTCUTS} />
            <ShortcutTable caption="On a card (Tab to its title first)" rows={CARD_SHORTCUTS} />
          </div>
        </section>

        <section aria-labelledby="help-team">
          <h3 id="help-team" className="font-heading text-base font-semibold">
            Profiles and data
          </h3>
          <p className="mt-2 flex gap-3 text-sm leading-6 text-ink-muted">
            <Crown aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" />
            <span>
              Log in with one click on your profile. There is no password, so anyone who uses this browser can choose
              any profile. Your changes show your name in each task’s Activity. Change the team, the roles and the team
              lead in Settings → Project &amp; team.
            </span>
          </p>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            Slopify keeps your data in this browser only. To share the board, export it in the footer and send the file.
            A teammate imports it on their computer.
          </p>
        </section>
      </div>
    </Modal>
  );
}

function ShortcutTable({ caption, rows }) {
  return (
    <table className="w-full text-left text-sm">
      <caption className="mb-1 text-left text-caption font-semibold text-ink-muted">{caption}</caption>
      <thead className="sr-only">
        <tr>
          <th scope="col">Key</th>
          <th scope="col">Action</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.keys} className="border-t border-line-subtle">
            <th scope="row" className="w-28 py-1.5 pr-3 font-normal">
              <kbd className="rounded-md border border-line-strong bg-field px-1.5 py-0.5 font-mono text-xs font-semibold text-ink">
                {row.keys}
              </kbd>
            </th>
            <td className="py-1.5 text-ink">{row.label}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
