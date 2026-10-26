/**
 * Accent colour (Q&A: "sensible default, user definable"). DESIGN.md §2.8.
 *
 * The accent changes the three `brand-*` tokens only. Type and due colours
 * never change, so each hue keeps one meaning (DESIGN.md §1).
 *
 * Every accent must pass WCAG AA in both themes:
 *   light — white button text on it, and it as link text on white glass
 *   dark  — dark button text on it, and it as link text on dark glass
 * A custom colour that fails is darkened (light) or lightened (dark) until
 * it passes, and the UI says "Adjusted for readability".
 */

const WHITE = '#FFFFFF';
const BLACK = '#000000';
const LIGHT_CARD = '#FFFFFF';
const DARK_CARD = '#19202A'; // --c-surface-card in the dark theme
const DARK_ON_BRAND = '#0B1718'; // --c-on-brand in the dark theme

// Link text sits on 60 % glass over the colour fields, which costs some
// contrast. 5.5:1 on the solid card keeps it above 4.5:1 on the glass.
const TEXT_ON_CARD_MIN = 5.5;
const BUTTON_TEXT_MIN = 4.5;

export const DEFAULT_ACCENT = 'teal';

// Presets avoid the type hues (indigo, magenta) and due hues (green, amber,
// red). Contrast for each is listed in DESIGN.md §2.8.
export const ACCENT_PRESETS = [
  {
    id: 'teal',
    label: 'Teal',
    light: { primary: '#155E63', hover: '#0E4A4E', accent: '#E3F1F1' },
    dark: { primary: '#5BC2BA', hover: '#86D6CF', accent: '#173A3D' },
  },
  {
    id: 'ocean',
    label: 'Ocean',
    light: { primary: '#1F5C99', hover: '#17497A', accent: '#E4EDF6' },
    dark: { primary: '#6FAEE8', hover: '#97C6F0', accent: '#1A2F45' },
  },
  {
    id: 'graphite',
    label: 'Graphite',
    light: { primary: '#3F4856', hover: '#2C333D', accent: '#E9EBEE' },
    dark: { primary: '#AAB4C3', hover: '#C7CED9', accent: '#2A323E' },
  },
  {
    id: 'cocoa',
    label: 'Cocoa',
    light: { primary: '#7A4A2A', hover: '#5F3920', accent: '#F3ECE7' },
    dark: { primary: '#D7A27C', hover: '#E4BD9F', accent: '#3A2C24' },
  },
];

const HEX = /^#[0-9a-f]{6}$/i;

export function isHexColor(value) {
  return typeof value === 'string' && HEX.test(value);
}

export function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex([r, g, b]) {
  return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

/** `t` of `a` mixed into `b` (t = 1 → a). */
export function mix(a, b, t) {
  const [x, y] = [hexToRgb(a), hexToRgb(b)];
  return rgbToHex(x.map((c, i) => c * t + y[i] * (1 - t)));
}

function luminance(hex) {
  const lin = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = hexToRgb(hex).map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio, 1–21. */
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (hi + 0.05) / (lo + 0.05);
}

function passes(primary, theme) {
  return theme === 'dark'
    ? contrast(DARK_ON_BRAND, primary) >= BUTTON_TEXT_MIN && contrast(primary, DARK_CARD) >= TEXT_ON_CARD_MIN
    : contrast(WHITE, primary) >= BUTTON_TEXT_MIN && contrast(primary, LIGHT_CARD) >= TEXT_ON_CARD_MIN;
}

/**
 * Brand shades for a custom colour in one theme.
 * @returns {{ primary, hover, accent, adjusted: boolean }}
 */
export function deriveAccent(hex, theme) {
  const toward = theme === 'dark' ? WHITE : BLACK;
  let primary = hex.toUpperCase();
  let step = 0;
  // Move toward white (dark theme) or black (light theme) in 4 % steps.
  while (!passes(primary, theme) && step < 25) {
    step += 1;
    primary = mix(toward, hex, step * 0.04);
  }
  const hover = mix(toward, primary, 0.2);
  // The tint (hover and selected backgrounds) carries brand text, so it
  // stays faint enough for 4.5:1.
  const base = theme === 'dark' ? DARK_CARD : WHITE;
  let strength = theme === 'dark' ? 0.18 : 0.1;
  let accent = mix(primary, base, strength);
  while (contrast(primary, accent) < BUTTON_TEXT_MIN && strength > 0.02) {
    strength -= 0.02;
    accent = mix(primary, base, strength);
  }
  return { primary, hover, accent, adjusted: step > 0 };
}

/** Brand shades for a stored accent preference (`'teal'` or `'#rrggbb'`). */
export function resolveAccent(pref, theme) {
  if (isHexColor(pref)) return deriveAccent(pref, theme);
  const preset = ACCENT_PRESETS.find((p) => p.id === pref) ?? ACCENT_PRESETS[0];
  return { ...preset[theme], adjusted: false };
}

/** '#155E63' → '21 94 99' (the CSS variable format, see src/index.css). */
export function toTriplet(hex) {
  return hexToRgb(hex).join(' ');
}
