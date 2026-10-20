import { Calendar, CircleCheck, Clock, TriangleAlert } from 'lucide-react';

/**
 * Visual treatment of each due state (M8 due-tint, DESIGN.md §2.3).
 * The state changes the card background (tint) and the due label (text
 * colour + icon). It never changes the type stripe (FR-M8-05).
 * Full class names are written out so Tailwind can find them.
 */
export const DUE_STYLES = {
  done:    { card: 'bg-due-neutral-bg', label: 'text-due-neutral-fg', icon: CircleCheck },
  overdue: { card: 'bg-due-overdue-bg', label: 'text-due-overdue-fg', icon: TriangleAlert },
  warning: { card: 'bg-due-warning-bg', label: 'text-due-warning-fg', icon: Clock },
  safe:    { card: 'bg-due-safe-bg',    label: 'text-due-safe-fg',    icon: Calendar },
  none:    { card: 'bg-surface-card',   label: 'text-ink-muted',      icon: null },
};
