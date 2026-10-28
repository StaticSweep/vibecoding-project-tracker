import { useEffect, useRef, useState } from 'react';
import { Crown, LogIn, UserPlus } from 'lucide-react';
import Avatar from './Avatar.jsx';
import GlassBackdrop from './GlassBackdrop.jsx';
import MemberForm from './settings/MemberForm.jsx';
import { useAppData } from '../context/AppData.jsx';
import { createMember, endSentence, roleLabel } from '../lib/team.js';
import { buttonSecondary, focusRing, glassCard, glassPanel, helperText } from '../lib/ui.js';

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/**
 * Log-in screen (PRD §15, DESIGN.md §4.23). No password: one click on a
 * profile logs in. "Add a new profile" creates a member and logs in.
 * The profile is remembered in this browser until "Log out".
 */
export default function LoginScreen() {
  const { team, tasks, lead, workspace, setTeam, login, readOnly } = useAppData();
  const [adding, setAdding] = useState(false);
  const headingRef = useRef(null);

  // Announce the screen and start keyboard users at the top.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const openTasks = (id) => tasks.filter((t) => t.assignee === id && t.status !== 'done').length;
  const subtitle = [workspace.projectName, workspace.teamName].filter((s) => s?.trim()).join(' · ');

  function addProfile(fields) {
    const member = createMember(fields);
    setTeam((list) => [...list, member]);
    login(member.id);
  }

  return (
    <div className="relative isolate flex min-h-screen items-start justify-center bg-surface-page px-4 py-10 font-sans text-ink sm:items-center">
      <GlassBackdrop />
      <main aria-labelledby="login-title" className={`w-full max-w-3xl rounded-3xl p-6 sm:p-8 ${glassPanel}`}>
        <p className="font-heading text-wordmark font-semibold tracking-tight text-brand-primary">Slopify</p>
        {subtitle && <p className="text-sm leading-5 text-ink-muted">{subtitle}</p>}

        <h1 id="login-title" ref={headingRef} tabIndex={-1} className="mt-6 font-heading text-2xl font-semibold focus:outline-none">
          Who are you?
        </h1>
        <p className={`mt-1 max-w-prose ${helperText}`}>
          Choose your profile to log in. There is no password, so anyone who uses this browser can choose any profile.
        </p>

        <ul className="mt-5 grid gap-3 sm:grid-cols-2" aria-label="Profiles">
          {team.map((member) => {
            const role = roleLabel(member.role);
            const isLead = member.id === lead?.id;
            const open = openTasks(member.id);
            return (
              <li key={member.id}>
                <button
                  type="button"
                  onClick={() => login(member.id)}
                  aria-label={`${endSentence(['Log in as ' + member.name, isLead && 'team lead', role].filter(Boolean).join(', '))} ${plural(open, 'open task')}.`}
                  className={`group flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-shadow duration-150 hover:shadow-glass ${glassCard} ${focusRing}`}
                >
                  <Avatar member={member} size="md" />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="break-words font-semibold text-ink">{member.name}</span>
                      {isLead && (
                        <span className="inline-flex h-5 items-center gap-1 rounded-full bg-brand-accent px-2 font-mono text-xs font-semibold uppercase tracking-[0.04em] text-brand-primary">
                          <Crown aria-hidden="true" className="h-3 w-3" />
                          Team lead
                        </span>
                      )}
                    </span>
                    <span className={`block ${helperText}`}>
                      {[role || 'No role', plural(open, 'open task')].join(' · ')}
                    </span>
                  </span>
                  <LogIn aria-hidden="true" className="h-5 w-5 shrink-0 text-ink-muted group-hover:text-brand-primary" />
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-5">
          {adding ? (
            <MemberForm
              member={null}
              team={team}
              onSave={addProfile}
              onCancel={() => setAdding(false)}
              submitLabel="Add and log in"
            />
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              disabled={readOnly}
              title={readOnly ? 'A newer version of Slopify saved this board. You cannot change it.' : undefined}
              className={buttonSecondary}
            >
              <UserPlus aria-hidden="true" className="h-4 w-4" />
              Add a new profile
            </button>
          )}
        </div>

        <p className={`mt-6 ${helperText}`}>Slopify keeps your data in this browser only.</p>
      </main>
    </div>
  );
}
