import { describe, expect, it } from 'vitest';
import { ACCENT_PRESETS, contrast, deriveAccent, resolveAccent } from './color.js';

const DARK_CARD = '#19202A';
const DARK_ON_BRAND = '#0B1718';

describe('contrast', () => {
  it('matches the WCAG formula', () => {
    expect(contrast('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
    expect(contrast('#155E63', '#FFFFFF')).toBeCloseTo(7.46, 1);
  });
});

describe('accent presets', () => {
  it('pass AA in both themes', () => {
    for (const p of ACCENT_PRESETS) {
      expect(contrast('#FFFFFF', p.light.primary)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(p.light.primary, p.light.accent)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(DARK_ON_BRAND, p.dark.primary)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(p.dark.primary, DARK_CARD)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(p.dark.primary, p.dark.accent)).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('deriveAccent (custom colour guard)', () => {
  it('keeps a colour that already passes', () => {
    expect(deriveAccent('#155E63', 'light')).toMatchObject({ primary: '#155E63', adjusted: false });
  });

  it('darkens a light colour for the light theme until it passes', () => {
    const result = deriveAccent('#FFD43B', 'light');
    expect(result.adjusted).toBe(true);
    expect(contrast('#FFFFFF', result.primary)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(result.primary, '#FFFFFF')).toBeGreaterThanOrEqual(5.5);
  });

  it('lightens a dark colour for the dark theme until it passes', () => {
    const result = deriveAccent('#1A1A40', 'dark');
    expect(result.adjusted).toBe(true);
    expect(contrast(DARK_ON_BRAND, result.primary)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(result.primary, DARK_CARD)).toBeGreaterThanOrEqual(5.5);
    expect(contrast(result.primary, result.accent)).toBeGreaterThanOrEqual(4.5);
  });

  it('falls back to teal for an unknown preset', () => {
    expect(resolveAccent('nope', 'light').primary).toBe('#155E63');
  });
});
