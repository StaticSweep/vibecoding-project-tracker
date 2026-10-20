/**
 * Deliverable Anchor Board data (M11, PRD §5 Anchor, §14.4.3).
 */

// DR-ANC-01: exactly four slots, in this order.
export const DEFAULT_ANCHORS = [
  { id: 'presentation',  label: 'Presentation',  url: null },
  { id: 'demo',          label: 'Demo',          url: null },
  { id: 'report',        label: 'Report',        url: null },
  { id: 'documentation', label: 'Documentation', url: null },
];

const URL_MAX = 2048;

export const URL_ERROR = 'Use a web address that starts with http:// or https://.';

/**
 * Check and normalise a link the user typed (FR-M11-05, DR-ANC-02).
 *   ''                  → { ok: true, url: null }   (clears the slot)
 *   'example.com/deck'  → { ok: true, url: 'https://example.com/deck' }
 *   'javascript:…'      → { ok: false, error }
 */
export function normaliseUrl(input) {
  const text = (input ?? '').trim();
  if (text === '') return { ok: true, url: null };

  // A scheme is "letters:" not followed by a digit (so "localhost:3000" has none).
  const hasScheme = /^[a-z][a-z0-9+.-]*:(?!\d)/i.test(text);
  const candidate = hasScheme ? text : `https://${text}`;

  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    return { ok: false, error: URL_ERROR };
  }

  const validHost = parsed.hostname === 'localhost' || parsed.hostname.includes('.');
  if (!['http:', 'https:'].includes(parsed.protocol) || !validHost || candidate.length > URL_MAX) {
    return { ok: false, error: URL_ERROR };
  }
  return { ok: true, url: parsed.href };
}

/** Host name for display, e.g. "docs.google.com". */
export function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * Rebuild stored anchors into the four fixed slots (DR-INT-06): missing slots
 * come back empty, unknown ids and extra entries are dropped, invalid URLs
 * become null. Ids and labels always come from DEFAULT_ANCHORS.
 */
export function normaliseAnchors(raw) {
  if (!Array.isArray(raw)) return { ok: false, value: DEFAULT_ANCHORS, dropped: 0 };

  let dropped = 0;
  const value = DEFAULT_ANCHORS.map((slot) => {
    const stored = raw.find((a) => a && typeof a === 'object' && a.id === slot.id);
    if (!stored || stored.url == null) return { ...slot };
    const check = typeof stored.url === 'string' ? normaliseUrl(stored.url) : { ok: false };
    if (!check.ok) dropped += 1;
    return { ...slot, url: check.ok ? check.url : null };
  });

  dropped += raw.filter((a) => !DEFAULT_ANCHORS.some((s) => s.id === a?.id)).length;
  return { ok: true, value, dropped };
}
