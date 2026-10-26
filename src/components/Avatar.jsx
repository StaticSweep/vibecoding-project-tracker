import { User } from 'lucide-react';
import { initials } from '../lib/team.js';

// The starter imported `initials` from here.
export { initials };

/**
 * Neutral initials avatar (M7 task-owner, DESIGN.md §2.4).
 * Colour never identifies the person — the initials and the visible name do.
 * Decorative: the name is always shown or announced next to it.
 *
 *   member  a team member, or null for Unassigned
 *   size    'sm' (24 px, cards) | 'md' (32 px, header and team list)
 */
export default function Avatar({ member, size = 'sm' }) {
  const box = size === 'md' ? 'h-8 w-8 text-sm' : 'h-6 w-6 text-xs';
  return (
    <span
      aria-hidden="true"
      className={`inline-flex ${box} shrink-0 items-center justify-center rounded-full bg-due-neutral-bg font-semibold leading-none text-ink ring-1 ring-line-strong`}
    >
      {member ? initials(member.name) : <User className="h-3.5 w-3.5" />}
    </span>
  );
}
