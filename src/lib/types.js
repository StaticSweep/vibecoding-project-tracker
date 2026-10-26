import { Bug, Sparkles } from 'lucide-react';

/**
 * Visual treatment of each task type (M6 tag-style, DESIGN.md §2.2).
 * Full class names are written out so Tailwind can find them.
 */
export const TYPE_STYLES = {
  feature: {
    icon: Sparkles,
    stripe: 'bg-type-feature',
    badge: 'bg-type-feature-bg text-type-feature-fg',
    iconClass: 'text-type-feature',
    selected: 'bg-type-feature text-on-strong',
  },
  bug: {
    icon: Bug,
    stripe: 'bg-type-bug',
    badge: 'bg-type-bug-bg text-type-bug-fg',
    iconClass: 'text-type-bug',
    selected: 'bg-type-bug text-on-strong',
  },
};
