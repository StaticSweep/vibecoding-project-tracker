import { describe, expect, it } from 'vitest';
import { HISTORY_MAX, nextHistory, normaliseHistory, versionCount } from './history.js';
import { nextContextUpdatedAt } from './context.js';

const NOW = '2026-10-26T12:00:00.000Z';

describe('nextHistory', () => {
  const before = { context: 'v1', contextTool: 'Claude', contextUpdatedAt: '2026-10-20T10:00:00.000Z', contextHistory: [] };

  it('keeps the previous version when the context changes', () => {
    const history = nextHistory(before, { context: 'v2', contextTool: 'Claude' }, NOW);
    expect(history).toEqual([{ context: 'v1', contextTool: 'Claude', savedAt: '2026-10-20T10:00:00.000Z' }]);
  });

  it('does nothing when nothing changed or the old context was empty', () => {
    expect(nextHistory(before, { context: 'v1', contextTool: 'Claude' }, NOW)).toEqual([]);
    expect(nextHistory({ ...before, context: '' }, { context: 'v2', contextTool: null }, NOW)).toEqual([]);
  });

  it('caps the list', () => {
    const long = Array.from({ length: HISTORY_MAX + 5 }, (_, i) => ({ context: `old ${i}`, contextTool: null, savedAt: NOW }));
    expect(nextHistory({ ...before, contextHistory: long }, { context: 'v2', contextTool: null }, NOW)).toHaveLength(HISTORY_MAX);
  });
});

describe('normaliseHistory / versionCount', () => {
  it('drops unusable entries', () => {
    expect(normaliseHistory([null, { context: '  ' }, { context: 'ok', contextTool: 'Nope' }])).toEqual([
      { context: 'ok', contextTool: null, savedAt: null },
    ]);
    expect(normaliseHistory('x')).toEqual([]);
  });

  it('counts the current version', () => {
    expect(versionCount({ context: 'now', contextHistory: [{ context: 'then' }] })).toBe(2);
    expect(versionCount({ context: '', contextHistory: [] })).toBe(0);
  });
});

describe('nextContextUpdatedAt', () => {
  it('changes only when the context or tool changed', () => {
    const before = { context: 'a', contextTool: null, contextUpdatedAt: 'old' };
    expect(nextContextUpdatedAt(before, { context: 'a', contextTool: null }, NOW)).toBe('old');
    expect(nextContextUpdatedAt(before, { context: 'b', contextTool: null }, NOW)).toBe(NOW);
    expect(nextContextUpdatedAt(before, { context: '', contextTool: null }, NOW)).toBeNull();
  });
});
