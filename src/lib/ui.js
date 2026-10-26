/**
 * Shared Tailwind class strings, so every component follows DESIGN.md §4
 * the same way. The look is iOS-style glass (DESIGN.md §2.6): frosted
 * translucent surfaces, large radii, pill buttons, soft shadows.
 */

// DESIGN.md §4.12: 2 px brand-primary ring, 2 px offset, keyboard focus only.
export const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-card';

// --- Glass surfaces (DESIGN.md §2.6) -------------------------------------
// Opacity is high enough that text on top keeps WCAG AA contrast over the
// page background. `reduce-transparency:` makes every surface solid.
const glassBase =
  'backdrop-blur-xl backdrop-saturate-150 reduce-transparency:backdrop-blur-none';

/** Large panels: header bar, columns, Anchor Board. */
export const glassPanel = `${glassBase} border border-glass-edge/70 bg-glass/60 shadow-glass reduce-transparency:bg-surface-card`;

/** Cards and tiles that sit on a panel. */
export const glassCard = `${glassBase} border border-glass-edge/80 bg-glass/85 shadow-glass-sm reduce-transparency:bg-surface-card`;

/** Modal sheets and dialogs. */
export const glassSheet = `${glassBase} border border-glass-edge/80 bg-glass/95 shadow-glass-lg reduce-transparency:bg-surface-card`;

// --- Buttons (DESIGN.md §4.6) — iOS pills -------------------------------
export const buttonBase =
  'inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors duration-150 motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50';

export const buttonPrimary = `${buttonBase} bg-brand-primary text-on-brand shadow-glass-sm hover:bg-brand-primary-hover ${focusRing}`;

export const buttonSecondary = `${buttonBase} border border-line-strong bg-glass/80 text-ink hover:bg-brand-accent ${focusRing}`;

// "Delete task" in the modal: outlined and neutral, never red (PRD §14.6 #2).
export const buttonDestructive = `${buttonBase} border border-line-strong bg-glass/80 text-ink hover:bg-due-neutral-bg ${focusRing}`;

// Confirm button in the delete dialog only.
export const buttonDanger = `${buttonBase} bg-danger text-on-strong shadow-glass-sm hover:bg-due-overdue-fg ${focusRing}`;

// --- Form fields (DESIGN.md §4.7) ---------------------------------------
// Filled like iOS, but the 1 px line-strong border stays (3:1, NFR-A11Y-01).
export const inputBase = `w-full rounded-xl border border-line-strong bg-field px-3 text-base text-ink placeholder:text-ink-muted aria-[invalid=true]:border-2 aria-[invalid=true]:border-due-overdue ${focusRing}`;

export const labelBase = 'block text-sm font-semibold leading-5 text-ink';

export const helperText = 'text-caption text-ink-muted';

// Round icon buttons, minimum 32 × 32 px.
export const iconButton = `inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors duration-150 hover:bg-glass/80 hover:text-brand-primary motion-reduce:transition-none ${focusRing}`;

// Visually hidden but read by screen readers.
export const srOnly = 'sr-only';
