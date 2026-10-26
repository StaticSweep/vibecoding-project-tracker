import { useMemo } from 'react';
import DataTools from '../DataTools.jsx';
import { useAppData } from '../../context/AppData.jsx';
import { STORAGE_LIMIT_BYTES, STORAGE_WARN_BYTES, estimateStorageBytes, formatMegabytes } from '../../lib/transfer.js';
import { helperText } from '../../lib/ui.js';
import { sectionHeading } from './shared.js';

/** Settings → Data: back up, share, demo, reset, storage use (DR-CAP-02). */
export default function DataSettings() {
  const { tasks, anchors, team, workspace } = useAppData();
  // Recount when the board changes.
  const bytes = useMemo(() => estimateStorageBytes(), [tasks, anchors, team, workspace]); // eslint-disable-line react-hooks/exhaustive-deps
  const percent = Math.min(100, Math.round((bytes / STORAGE_LIMIT_BYTES) * 100));
  const high = bytes >= STORAGE_WARN_BYTES;

  return (
    <div className="space-y-8">
      <section aria-labelledby="data-backup">
        <h3 id="data-backup" className={sectionHeading}>
          Back up and share
        </h3>
        <p className={`mt-1 max-w-prose ${helperText}`}>
          Slopify keeps your data in this browser only. Export the board to share it with your team or to keep a copy.
          Import a file from a teammate to see their board.
        </p>
        <DataTools variant="settings" />
      </section>

      <section aria-labelledby="data-storage">
        <h3 id="data-storage" className={sectionHeading}>
          Storage
        </h3>
        <p className={`mt-1 ${helperText}`}>
          Slopify uses {formatMegabytes(bytes)} of about {formatMegabytes(STORAGE_LIMIT_BYTES)} in this browser.
        </p>
        <div aria-hidden="true" className="mt-2 h-2 w-full max-w-md overflow-hidden rounded-full bg-due-neutral-bg ring-1 ring-line-strong">
          <div className={`h-full ${high ? 'bg-due-overdue' : 'bg-brand-primary'}`} style={{ width: `${Math.max(percent, 1)}%` }} />
        </div>
        {high && (
          <p className="mt-2 text-caption font-semibold text-due-overdue-fg">
            Your board is almost too big for this browser. Export it, then remove old contexts.
          </p>
        )}
      </section>
    </div>
  );
}
