/**
 * Shared Tailwind class strings, so every component follows DESIGN.md §4
 * the same way.
 */

// DESIGN.md §4.12: 2 px brand-primary ring, 2 px offset, keyboard focus only.
export const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page';

// DESIGN.md §4.6 button types.
export const buttonBase =
  'inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-semibold transition-colors duration-150 motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50';

export const buttonPrimary = `${buttonBase} bg-brand-primary text-white hover:bg-brand-primary-hover ${focusRing}`;

export const buttonSecondary = `${buttonBase} border border-line-strong bg-surface-card text-ink hover:bg-brand-accent ${focusRing}`;

export const iconButton = `inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition-colors duration-150 hover:bg-brand-accent hover:text-brand-primary motion-reduce:transition-none ${focusRing}`;

// Visually hidden but read by screen readers.
export const srOnly = 'sr-only';
