import { STORAGE_KEYS } from './constants.js';
import { DEFAULT_ACCENT, ACCENT_PRESETS, isHexColor, resolveAccent, toTriplet } from './color.js';

/**
 * Per-browser preferences (`vibetracker.prefs`, DR-STO table). They are never
 * exported: each person picks their own theme and text size. There is no
 * sign-in — Slopify always acts as the team lead (see src/lib/team.js).
 */

export const THEMES = [
  { id: 'system', label: 'Match system' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

export const TEXT_SIZES = [
  { id: 'default', label: 'Default', scale: '100 %' },
  { id: 'large', label: 'Large', scale: '115 %' },
  { id: 'larger', label: 'Larger', scale: '130 %' },
];

// 'system' follows the OS setting; 'reduce' turns the effect off in Slopify.
export const REDUCE_OPTIONS = ['system', 'reduce'];

export const DEFAULT_PREFS = {
  theme: 'system',
  accent: DEFAULT_ACCENT,
  textSize: 'default',
  motion: 'system',
  transparency: 'system',
  promptIncludesLinks: false,
  welcomeDismissed: false,
};

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const pick = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback);

/** Stored prefs → `{ ok, value, dropped }` for useLocalStorage. Unknown keys are kept. */
export function normalisePrefs(raw) {
  if (!isObject(raw)) return { ok: false, value: { ...DEFAULT_PREFS }, dropped: 0 };
  const accentOk = isHexColor(raw.accent) || ACCENT_PRESETS.some((p) => p.id === raw.accent);
  return {
    ok: true,
    value: {
      ...raw,
      theme: pick(raw.theme, THEMES.map((t) => t.id), DEFAULT_PREFS.theme),
      accent: accentOk ? raw.accent : DEFAULT_PREFS.accent,
      textSize: pick(raw.textSize, TEXT_SIZES.map((t) => t.id), DEFAULT_PREFS.textSize),
      motion: pick(raw.motion, REDUCE_OPTIONS, DEFAULT_PREFS.motion),
      transparency: pick(raw.transparency, REDUCE_OPTIONS, DEFAULT_PREFS.transparency),
      promptIncludesLinks: raw.promptIncludesLinks === true,
      welcomeDismissed: raw.welcomeDismissed === true,
    },
    dropped: 0,
  };
}

export function readStoredPrefs(storage = window.localStorage) {
  try {
    return normalisePrefs(JSON.parse(storage.getItem(STORAGE_KEYS.prefs))).value;
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

const darkQuery = () => window.matchMedia?.('(prefers-color-scheme: dark)');

/** 'system' → the OS theme now. */
export function resolveTheme(theme) {
  if (theme === 'light' || theme === 'dark') return theme;
  return darkQuery()?.matches ? 'dark' : 'light';
}

/** Call `fn` when the OS switches between light and dark. Returns an unsubscribe function. */
export function onSystemThemeChange(fn) {
  const query = darkQuery();
  if (!query) return () => {};
  query.addEventListener('change', fn);
  return () => query.removeEventListener('change', fn);
}

/**
 * Put the appearance prefs on <html>: data attributes for CSS (src/index.css,
 * the `reduce-transparency:` variant) and the accent as CSS variables.
 */
export function applyPrefsToDocument(prefs, root = document.documentElement) {
  const theme = resolveTheme(prefs.theme);
  root.dataset.theme = theme;
  root.dataset.textSize = prefs.textSize;
  if (prefs.motion === 'reduce') root.dataset.motion = 'reduce';
  else delete root.dataset.motion;
  if (prefs.transparency === 'reduce') root.dataset.transparency = 'reduce';
  else delete root.dataset.transparency;

  const accent = resolveAccent(prefs.accent, theme);
  root.style.setProperty('--c-brand-primary', toTriplet(accent.primary));
  root.style.setProperty('--c-brand-primary-hover', toTriplet(accent.hover));
  root.style.setProperty('--c-brand-accent', toTriplet(accent.accent));
}
