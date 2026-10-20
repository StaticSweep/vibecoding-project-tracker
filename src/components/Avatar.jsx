import { User } from 'lucide-react';
import { isKnownAssignee } from '../lib/tasks.js';

/** "Alex B." → "AB" */
export function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

/**
 * Neutral initials avatar (M7 task-owner, DESIGN.md §2.4).
 * Colour never identifies the person — the initials and the visible name do.
 * Decorative: the name is always shown or announced next to it.
 */
export default function Avatar({ name }) {
  const known = isKnownAssignee(name);
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-due-neutral-bg text-xs font-semibold leading-none text-ink ring-1 ring-line-strong"
    >
      {known ? initials(name) : <User className="h-3.5 w-3.5" />}
    </span>
  );
}
