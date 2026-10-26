import { describe, expect, it } from 'vitest';
import { DEFAULT_ANCHORS, hostOf, normaliseAnchors, normaliseUrl } from './anchors.js';

describe('normaliseUrl', () => {
  it('clears the slot on empty input', () => {
    expect(normaliseUrl('  ')).toEqual({ ok: true, url: null });
  });

  it('adds https:// when the scheme is missing', () => {
    expect(normaliseUrl('example.com/deck')).toEqual({ ok: true, url: 'https://example.com/deck' });
    expect(normaliseUrl('localhost:3000').url).toBe('https://localhost:3000/');
  });

  it('rejects other schemes and hosts without a dot', () => {
    expect(normaliseUrl('javascript:alert(1)').ok).toBe(false);
    expect(normaliseUrl('ftp://example.com').ok).toBe(false);
    expect(normaliseUrl('notaurl').ok).toBe(false);
  });
});

describe('normaliseAnchors', () => {
  it('rebuilds the four fixed slots', () => {
    const result = normaliseAnchors([
      { id: 'demo', url: 'https://demo.example.com' },
      { id: 'report', url: 'javascript:alert(1)' },
      { id: 'extra', url: 'https://x.example.com' },
    ]);
    expect(result.ok).toBe(true);
    expect(result.value.map((a) => a.id)).toEqual(DEFAULT_ANCHORS.map((a) => a.id));
    expect(result.value[1].url).toBe('https://demo.example.com/');
    expect(result.value[2].url).toBeNull();
    expect(result.dropped).toBe(2);
  });

  it('rejects a value that is not an array', () => {
    expect(normaliseAnchors({}).ok).toBe(false);
  });
});

describe('hostOf', () => {
  it('drops www.', () => {
    expect(hostOf('https://www.example.com/a')).toBe('example.com');
  });
});
