import { TYPES } from '../lib/constants.js';
import { TYPE_STYLES } from '../lib/types.js';

/**
 * Feature / bug badge: colour + icon + text, so the type never depends on
 * colour alone (FR-M6-01, NFR-A11Y-02). Text contrast ≥ 7.4:1 (FR-M6-04).
 */
export default function TypeBadge({ type }) {
  const style = TYPE_STYLES[type] ?? TYPE_STYLES.feature;
  const label = TYPES.find((t) => t.id === type)?.label ?? 'Feature';
  const Icon = style.icon;

  return (
    <span
      className={`inline-flex h-5 items-center gap-1 rounded-full px-2 font-mono text-xs font-semibold uppercase leading-4 tracking-[0.04em] ${style.badge}`}
    >
      <Icon aria-hidden="true" className="h-3 w-3" />
      {label}
    </span>
  );
}
