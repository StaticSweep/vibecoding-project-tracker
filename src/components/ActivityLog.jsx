import { ArrowRightLeft, CirclePlus, MoveRight, Pencil, RotateCcw, ScrollText } from 'lucide-react';
import { useAppData } from '../context/AppData.jsx';
import { describeActivity, normaliseActivity } from '../lib/activity.js';
import { formatLongDateTime, formatTimeAgo } from '../lib/dates.js';
import { findMember } from '../lib/team.js';
import { helperText } from '../lib/ui.js';

const ICONS = {
  created: CirclePlus,
  moved: MoveRight,
  handoff: ArrowRightLeft,
  edited: Pencil,
  context: ScrollText,
  restored: RotateCcw,
};

/** "Created by Sam K. · Last change by Jo M., 2 h ago" for the task modal. */
export function Attribution({ task }) {
  const { team } = useAppData();
  const name = (id) => findMember(team, id)?.name ?? 'a former team member';
  const parts = [];
  if (task.createdBy) parts.push(`Created by ${name(task.createdBy)}`);
  if (task.updatedBy && task.updatedAt) parts.push(`last change by ${name(task.updatedBy)}, ${formatTimeAgo(task.updatedAt)}`);
  if (parts.length === 0) return null;
  const text = parts.join(' · ');
  return (
    <p className={helperText} title={task.updatedAt ? formatLongDateTime(task.updatedAt) : undefined}>
      {text.charAt(0).toUpperCase() + text.slice(1)}
    </p>
  );
}

/**
 * Who did what to this task, newest first (DESIGN.md §4.25). A disclosure,
 * closed by default, so the form stays short.
 */
export default function ActivityLog({ task }) {
  const { team } = useAppData();
  const entries = normaliseActivity(task.activity);
  const nameOf = (id) => findMember(team, id)?.name ?? null;

  return (
    <details className="group overflow-hidden rounded-2xl border border-line-subtle bg-glass/60">
      <summary className="flex h-9 cursor-pointer items-center gap-2 px-3 text-sm font-semibold text-ink hover:bg-brand-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary">
        Activity
        <span className="font-normal text-ink-muted">
          · {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </span>
      </summary>
      {entries.length === 0 ? (
        <p className={`border-t border-line-subtle px-3 py-2 ${helperText}`}>
          No activity yet. Slopify records each change from now on.
        </p>
      ) : (
        <ol tabIndex={0} aria-label="Activity" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary max-h-64 divide-y divide-line-subtle overflow-y-auto border-t border-line-subtle">
          {entries.map((entry, i) => {
            const Icon = ICONS[entry.type] ?? Pencil;
            return (
              <li key={`${entry.at}-${i}`} className="flex items-start gap-2 px-3 py-2 text-sm">
                <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" />
                <span className="min-w-0 flex-1 text-ink">{describeActivity(entry, nameOf)}</span>
                <time dateTime={entry.at} title={formatLongDateTime(entry.at)} className={`shrink-0 ${helperText}`}>
                  {formatTimeAgo(entry.at)}
                </time>
              </li>
            );
          })}
        </ol>
      )}
    </details>
  );
}
