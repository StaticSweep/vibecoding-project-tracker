import { useId } from 'react';
import { ListFilter, Plus, Settings, TriangleAlert, UserRound, X } from 'lucide-react';
import Avatar from './Avatar.jsx';
import SegmentedControl from './SegmentedControl.jsx';
import { useAppData } from '../context/AppData.jsx';
import { TYPES } from '../lib/constants.js';
import { TYPE_STYLES } from '../lib/types.js';
import { buttonPrimary, buttonSecondary, focusRing, glassPanel } from '../lib/ui.js';

export const NO_FILTERS = { owner: 'all', type: 'all' };

/**
 * App header (DESIGN.md §4.14): a floating glass bar with two rows.
 *   Row 1 — wordmark, project and team, Add task, the team lead, Settings.
 *   Row 2 — filters: My tasks, owner, type, overdue count, Clear filters.
 *
 * There is no sign-in. The lead's name shows as "you", and the button opens
 * the team settings.
 */
export default function Header({ filters, onFiltersChange, overdueCount, onAdd, onOpenSettings, addButtonRef }) {
  const { workspace, team, lead, readOnly } = useAppData();
  const ownerId = useId();
  const setFilter = (key, value) => onFiltersChange({ ...filters, [key]: value });
  const mine = lead && filters.owner === lead.id;
  const filtered = filters.owner !== 'all' || filters.type !== 'all';
  const subtitle = [workspace.projectName, workspace.teamName].filter((s) => s?.trim()).join(' · ');

  return (
    <header className={`mx-4 mb-3 mt-4 rounded-3xl ${glassPanel}`}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-3">
        <div className="min-w-0">
          <h1 className="font-heading text-wordmark font-semibold tracking-tight text-brand-primary">Slopify</h1>
          <p className="truncate text-sm leading-5 text-ink-muted" title={subtitle}>
            {subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            ref={addButtonRef}
            type="button"
            onClick={() => onAdd()}
            disabled={readOnly}
            aria-keyshortcuts="N"
            title="Add task (N)"
            className={buttonPrimary}
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            Add task
          </button>
          {lead && (
            <button
              type="button"
              onClick={() => onOpenSettings('team')}
              aria-haspopup="dialog"
              aria-label={`You: ${lead.name}, team lead. Open team settings.`}
              className={`flex h-9 items-center gap-2 rounded-full border border-line-strong bg-glass/80 pl-1 pr-3 text-left hover:bg-brand-accent ${focusRing}`}
            >
              <Avatar member={lead} />
              <span className="leading-4">
                <span className="block max-w-[10rem] truncate text-sm font-semibold text-ink">{lead.name}</span>
                <span className="block text-xs text-ink-muted">Team lead</span>
              </span>
            </button>
          )}
          <button type="button" onClick={() => onOpenSettings()} aria-haspopup="dialog" className={buttonSecondary}>
            <Settings aria-hidden="true" className="h-4 w-4" />
            Settings
          </button>
        </div>
      </div>

      <div
        role="group"
        aria-label="Filter the board"
        className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-glass-edge/70 px-5 py-2"
      >
        {lead && (
          <button
            type="button"
            aria-pressed={mine}
            onClick={() => setFilter('owner', mine ? 'all' : lead.id)}
            className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-sm font-semibold ${
              mine ? 'border-brand-primary bg-brand-primary text-on-brand' : 'border-line-strong bg-glass/75 text-ink hover:bg-brand-accent'
            } ${focusRing}`}
          >
            <UserRound aria-hidden="true" className="h-4 w-4" />
            My tasks
          </button>
        )}

        {/* Owner filter (FR-M7-08) */}
        <div className="flex items-center gap-2">
          <label htmlFor={ownerId} className="text-sm font-semibold text-ink">
            Owner
          </label>
          <select
            id={ownerId}
            value={filters.owner}
            onChange={(e) => setFilter('owner', e.target.value)}
            className={`h-8 max-w-[12rem] rounded-full border px-3 text-sm ${
              filters.owner === 'all'
                ? 'border-line-strong bg-glass/75 text-ink'
                : 'border-brand-primary bg-brand-accent font-semibold text-brand-primary'
            } ${focusRing}`}
          >
            <option value="all">Everyone</option>
            {team.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
                {m.id === lead?.id ? ' (you)' : ''}
              </option>
            ))}
            <option value="unassigned">Unassigned</option>
          </select>
        </div>

        {/* Type filter (FR-M6-05) */}
        <SegmentedControl
          legend="Show tasks of type"
          hideLegend
          size="sm"
          value={filters.type}
          onChange={(type) => setFilter('type', type)}
          options={[
            { value: 'all', label: 'All', icon: ListFilter, selectedClass: 'bg-brand-primary text-on-brand' },
            ...TYPES.map((t) => ({
              value: t.id,
              label: t.label,
              icon: TYPE_STYLES[t.id].icon,
              iconClass: TYPE_STYLES[t.id].iconClass,
              selectedClass: TYPE_STYLES[t.id].selected,
            })),
          ]}
        />

        {/* FR-M8-08: overdue count */}
        {overdueCount > 0 && (
          <p className="inline-flex h-8 items-center gap-1.5 rounded-full bg-due-overdue-bg px-3 text-sm font-semibold text-due-overdue-fg">
            <TriangleAlert aria-hidden="true" className="h-4 w-4" />
            {overdueCount} overdue
          </p>
        )}

        {filtered && (
          <button
            type="button"
            onClick={() => onFiltersChange(NO_FILTERS)}
            className={`inline-flex h-8 items-center gap-1 rounded-full px-3 text-sm font-semibold text-brand-primary hover:bg-brand-accent ${focusRing}`}
          >
            <X aria-hidden="true" className="h-4 w-4" />
            Clear filters
          </button>
        )}
      </div>
    </header>
  );
}
