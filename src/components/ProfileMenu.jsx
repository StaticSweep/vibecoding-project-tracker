import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, Crown, LogOut, UserCog } from 'lucide-react';
import Avatar from './Avatar.jsx';
import { useAppData } from '../context/AppData.jsx';
import { roleLabel } from '../lib/team.js';
import { focusRing, glassSheet, helperText } from '../lib/ui.js';

/**
 * The logged-in profile in the header (DESIGN.md §4.24): a disclosure with
 * "Edit my profile" and "Log out". Log out returns to the log-in screen,
 * where one click logs in as any profile.
 *
 * Esc or a click outside closes it; focus goes back to the button.
 */
export default function ProfileMenu({ onEditProfile }) {
  const { currentUser, lead, logout } = useAppData();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const isLead = currentUser.id === lead?.id;
  const subtitle = isLead ? 'Team lead' : roleLabel(currentUser.role) || 'Team member';

  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(e) {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  function close({ refocus = true } = {}) {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  }

  return (
    <div
      ref={rootRef}
      className="relative"
      onKeyDown={(e) => {
        if (e.key === 'Escape' && open) {
          e.stopPropagation();
          close();
        }
      }}
      onBlur={(e) => {
        // Close when focus leaves the menu (Tab past the last item).
        if (open && !rootRef.current?.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Logged in as ${currentUser.name}, ${subtitle}. Profile menu.`}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-9 items-center gap-2 rounded-full border border-line-strong bg-glass/80 pl-1 pr-2 text-left hover:bg-brand-accent ${focusRing}`}
      >
        <Avatar member={currentUser} />
        <span className="leading-4">
          <span className="block max-w-[10rem] truncate text-sm font-semibold text-ink">{currentUser.name}</span>
          <span className="block text-xs text-ink-muted">{subtitle}</span>
        </span>
        <ChevronDown aria-hidden="true" className={`h-4 w-4 text-ink-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          id={panelId}
          className={`absolute right-0 z-30 mt-2 w-64 rounded-2xl p-2 text-ink ${glassSheet}`}
        >
          <div className="flex items-center gap-2 px-2 py-2">
            <Avatar member={currentUser} size="md" />
            <div className="min-w-0">
              <p className="flex items-center gap-1 truncate text-sm font-semibold">
                {currentUser.name}
                {isLead && <Crown aria-label="Team lead" className="h-3.5 w-3.5 shrink-0 text-brand-primary" />}
              </p>
              <p className={`truncate ${helperText}`}>{currentUser.email ?? (roleLabel(currentUser.role) || 'No role')}</p>
            </div>
          </div>
          <ul className="border-t border-line-subtle pt-1">
            <li>
              <button
                type="button"
                onClick={() => {
                  close({ refocus: false });
                  onEditProfile();
                }}
                className={`flex h-10 w-full items-center gap-2 rounded-xl px-3 text-left text-sm font-semibold hover:bg-brand-accent ${focusRing}`}
              >
                <UserCog aria-hidden="true" className="h-4 w-4" />
                Edit my profile
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={logout}
                className={`flex h-10 w-full items-center gap-2 rounded-xl px-3 text-left text-sm font-semibold hover:bg-brand-accent ${focusRing}`}
              >
                <LogOut aria-hidden="true" className="h-4 w-4" />
                Log out or switch profile
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
