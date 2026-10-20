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

// "Delete task" in the modal: outlined and neutral, never red (PRD §14.6 #2).
export const buttonDestructive = `${buttonBase} border border-line-strong bg-surface-card text-ink hover:bg-due-neutral-bg ${focusRing}`;

// Confirm button in the delete dialog only.
export const buttonDanger = `${buttonBase} bg-danger text-white hover:bg-due-overdue-fg ${focusRing}`;

// DESIGN.md §4.7 form fields.
export const inputBase = `w-full rounded-md border border-line-strong bg-surface-card px-3 text-base text-ink placeholder:text-ink-muted aria-[invalid=true]:border-2 aria-[invalid=true]:border-due-overdue ${focusRing}`;

export const labelBase = 'block text-sm font-semibold leading-5 text-ink';

export const helperText = 'text-[13px] leading-[18px] text-ink-muted';

export const iconButton = `inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition-colors duration-150 hover:bg-brand-accent hover:text-brand-primary motion-reduce:transition-none ${focusRing}`;

// Visually hidden but read by screen readers.
export const srOnly = 'sr-only';
