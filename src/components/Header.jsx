import { useId, useState } from 'react';
import { ChevronDown, CircleHelp, ListFilter, Plus, Search, Settings, TriangleAlert, UserRound, X } from 'lucide-react';
import ProfileMenu from './ProfileMenu.jsx';
import SegmentedControl from './SegmentedControl.jsx';
import { useAppData } from '../context/AppData.jsx';
import { TYPES } from '../lib/constants.js';
import { TYPE_STYLES } from '../lib/types.js';
import { buttonPrimary, buttonSecondary, focusRing, glassPanel, iconButton, inputBase } from '../lib/ui.js';

export const NO_FILTERS = { owner: 'all', type: 'all', query: '' };

/**
 * App header (DESIGN.md §4.14): a floating glass bar with two rows.
 *   Row 1 — wordmark, project and team, search, Add task, the logged-in
 *           profile (menu: Edit my profile, Log out), Settings, Help.
 *   Row 2 — filters: My tasks, owner, type, overdue count, Clear filters.
 *           On small screens the row folds away behind a "Filters" button.
 *
 * "My tasks" and "(you)" mean the logged-in profile.
 */
export default function Header({
  filters,
  onFiltersChange,
  overdueCount,
  onAdd,
  onOpenSettings,
  onOpenHelp,
  addButtonRef,
  searchRef,
}) {
  const { workspace, team, currentUser: me, readOnly } = useAppData();
  const ownerId = useId();
  const searchId = useId();
  const filtersId = useId();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const setFilter = (key, value) => onFiltersChange({ ...filters, [key]: value });
  const mine = filters.owner === me.id;
  const activeCount = [filters.owner !== 'all', filters.type !== 'all', filters.query.trim() !== ''].filter(Boolean).length;
  const subtitle = [workspace.projectName, workspace.teamName].filter((s) => s?.trim()).join(' · ');

  return (
    // `relative z-20`: the blurred glass panels below each start their own
    // stacking layer, so the header must sit above them or the profile menu
    // slides under the Anchor Board.
    <header className={`relative z-20 mx-4 mb-3 mt-4 rounded-3xl ${glassPanel}`}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-3">
        <div className="min-w-0">
          <h1 className="font-heading text-wordmark font-semibold tracking-tight text-brand-primary">Slopify</h1>
          <p className="truncate text-sm leading-5 text-ink-muted" title={subtitle}>
            {subtitle}
          </p>
        </div>

        {/* Search: title, description and context. "/" jumps here; Esc clears. */}
        <div role="search" className="order-last w-full lg:order-none lg:w-auto lg:max-w-sm lg:flex-1">
          <label htmlFor={searchId} className="sr-only">
            Search tasks
          </label>
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              ref={searchRef}
              id={searchId}
              type="search"
              value={filters.query}
              onChange={(e) => setFilter('query', e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== 'Escape') return;
                if (filters.query) {
                  e.preventDefault();
                  setFilter('query', '');
                } else {
                  e.currentTarget.blur();
                }
              }}
              placeholder="Search tasks"
              aria-keyshortcuts="/"
              autoComplete="off"
              className={`${inputBase} h-9 rounded-full pl-9`}
            />
          </div>
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
          <ProfileMenu onEditProfile={() => onOpenSettings('team')} />
          <button type="button" onClick={() => onOpenSettings()} aria-haspopup="dialog" className={buttonSecondary}>
            <Settings aria-hidden="true" className="h-4 w-4" />
            Settings
          </button>
          <button
            type="button"
            onClick={onOpenHelp}
            aria-haspopup="dialog"
            aria-label="Help and shortcuts"
            aria-keyshortcuts="?"
            title="Help and shortcuts (?)"
            className={`${iconButton} h-9 w-9 border border-line-strong bg-glass/80 text-ink`}
          >
            <CircleHelp aria-hidden="true" className="h-5 w-5" />
          </button>
          {/* Small screens: the filter row folds away behind this button. */}
          <button
            type="button"
            aria-expanded={filtersOpen}
            aria-controls={filtersId}
            onClick={() => setFiltersOpen((open) => !open)}
            className={`${buttonSecondary} md:hidden`}
          >
            <ListFilter aria-hidden="true" className="h-4 w-4" />
            Filters{activeCount ? ` (${activeCount})` : ''}
            <ChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      <div
        id={filtersId}
        role="group"
        aria-label="Filter the board"
        className={`${filtersOpen ? 'flex' : 'hidden'} flex-wrap items-center gap-x-3 gap-y-2 border-t border-glass-edge/70 px-5 py-2 md:flex`}
      >
        {me && (
          <button
            type="button"
            aria-pressed={mine}
            onClick={() => setFilter('owner', mine ? 'all' : me.id)}
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
                {m.id === me.id ? ' (you)' : ''}
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

        {activeCount > 0 && (
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
