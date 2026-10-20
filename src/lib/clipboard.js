/**
 * Copy text to the clipboard (FR-M10-03).
 *   1. The async Clipboard API (needs a secure context: https or localhost).
 *   2. Fallback: a hidden textarea + document.execCommand('copy').
 * Returns true on success. When both fail, the caller shows the text in a
 * pre-selected box so the user can copy it by hand.
 */
export async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy method */
  }
  return legacyCopy(text);
}

function legacyCopy(text) {
  const previousFocus = document.activeElement;
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.top = '-9999px';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  area.remove();
  previousFocus?.focus?.();
  return ok;
}
