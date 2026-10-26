import { useEffect, useId, useRef, useState } from 'react';
import { Crown, Mail, Pencil, Trash2, UserPlus } from 'lucide-react';
import Avatar from '../Avatar.jsx';
import Modal from '../Modal.jsx';
import MemberForm from './MemberForm.jsx';
import { useToast } from '../Toast.jsx';
import { useAppData } from '../../context/AppData.jsx';
import { PROJECT_NAME_MAX } from '../../lib/constants.js';
import { createMember, endSentence, roleLabel, updateMember } from '../../lib/team.js';
import {
  buttonDanger,
  buttonSecondary,
  focusRing,
  helperText,
  iconButton,
  inputBase,
  labelBase,
} from '../../lib/ui.js';
import { fieldError, sectionHeading } from './shared.js';

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/**
 * Settings → Project & team (Q&A: one project, one team; add members; name,
 * email, role). Slopify always acts as the team lead — there is no sign-in.
 * Every change saves at once (PRD §14.1 "Never lose work").
 */
export default function TeamSettings() {
  return (
    <div className="space-y-8">
      <ProjectSection />
      <TeamSection />
      <PromptSection />
    </div>
  );
}

function ProjectSection() {
  const { workspace, setWorkspace } = useAppData();
  const projectId = useId();
  const projectErrorId = useId();
  const teamId = useId();
  // Local draft so an empty project name can show an error without being saved.
  const [project, setProject] = useState(workspace.projectName);
  const error = project.trim() ? '' : 'Type a project name.';

  return (
    <section aria-labelledby="settings-project">
      <h3 id="settings-project" className={sectionHeading}>
        Project
      </h3>
      <p className={`mt-1 ${helperText}`}>Slopify tracks one project for one team. The names show in the header and in every copied prompt.</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={projectId} className={labelBase}>
            Project name <span className="font-normal text-ink-muted">(required)</span>
          </label>
          <input
            id={projectId}
            type="text"
            value={project}
            maxLength={PROJECT_NAME_MAX}
            onChange={(e) => {
              setProject(e.target.value);
              if (e.target.value.trim()) setWorkspace((w) => ({ ...w, projectName: e.target.value }));
            }}
            onBlur={() => setProject(workspace.projectName)}
            aria-required="true"
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? projectErrorId : undefined}
            className={`${inputBase} mt-1 h-10`}
          />
          {error && (
            <p id={projectErrorId} className={fieldError}>
              {error}
            </p>
          )}
        </div>
        <div>
          <label htmlFor={teamId} className={labelBase}>
            Team name <span className="font-normal text-ink-muted">(optional)</span>
          </label>
          <input
            id={teamId}
            type="text"
            value={workspace.teamName}
            maxLength={PROJECT_NAME_MAX}
            onChange={(e) => setWorkspace((w) => ({ ...w, teamName: e.target.value }))}
            className={`${inputBase} mt-1 h-10`}
          />
        </div>
      </div>
    </section>
  );
}

function TeamSection() {
  const toast = useToast();
  const { team, setTeam, tasks, setTasks, setWorkspace, lead } = useAppData();
  // null | 'new' | a member id
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const listRef = useRef(null);
  const addButtonRef = useRef(null);

  const taskCount = (id) => tasks.filter((t) => t.assignee === id).length;

  // After a form or dialog closes, focus the row's Edit button (or "Add
  // member"). `{ id }` is a new object each time, so the effect always runs.
  const [focusRequest, setFocusRequest] = useState(null);
  const focusRow = (id) => setFocusRequest({ id });
  useEffect(() => {
    if (!focusRequest) return;
    const { id } = focusRequest;
    const target = id && listRef.current?.querySelector(`[data-member="${CSS.escape(id)}"] [data-edit]`);
    (target ?? addButtonRef.current)?.focus();
  }, [focusRequest]);

  function save(fields) {
    if (editing === 'new') {
      const member = createMember(fields);
      setTeam((list) => [...list, member]);
      toast({ message: `${member.name} joined the team.` });
      focusRow(member.id);
    } else {
      setTeam((list) => updateMember(list, editing, fields));
      focusRow(editing);
    }
    setEditing(null);
  }

  function makeLead(member) {
    setWorkspace((w) => ({ ...w, leadId: member.id }));
    toast({ message: `${member.name} is now the team lead. Slopify acts as the team lead.` });
  }

  function remove(member, heirId) {
    setTasks((list) => list.map((t) => (t.assignee === member.id ? { ...t, assignee: heirId } : t)));
    setTeam((list) => list.filter((m) => m.id !== member.id));
    setRemoving(null);
    toast({ message: `${member.name} left the team.` });
    focusRow(null);
  }

  return (
    <section aria-labelledby="settings-team">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="settings-team" className={sectionHeading}>
          Team · {plural(team.length, 'member')}
        </h3>
        <button
          ref={addButtonRef}
          type="button"
          onClick={() => setEditing('new')}
          disabled={editing === 'new'}
          className={buttonSecondary}
        >
          <UserPlus aria-hidden="true" className="h-4 w-4" />
          Add member
        </button>
      </div>
      <p className={`mt-1 max-w-prose ${helperText}`}>
        {endSentence(`Slopify acts as the team lead, ${lead?.name}`)} New tasks go to the lead, and “My tasks” shows the
        lead’s tasks.
      </p>

      {editing === 'new' && (
        <div className="mt-3">
          <MemberForm
            member={null}
            team={team}
            onSave={save}
            onCancel={() => {
              setEditing(null);
              focusRow(null);
            }}
          />
        </div>
      )}

      <ul ref={listRef} className="mt-3 divide-y divide-line-subtle rounded-2xl border border-line-subtle bg-glass/70 reduce-transparency:bg-surface-card">
        {team.map((member) => {
          const isLead = member.id === lead?.id;
          const count = taskCount(member.id);
          if (editing === member.id) {
            return (
              <li key={member.id} data-member={member.id} className="p-2">
                <MemberForm
                  member={member}
                  team={team}
                  onSave={save}
                  onCancel={() => {
                    setEditing(null);
                    focusRow(member.id);
                  }}
                />
              </li>
            );
          }
          return (
            <li key={member.id} data-member={member.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <Avatar member={member} size="md" />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-semibold text-ink">
                  <span className="break-words">{member.name}</span>
                  {isLead && (
                    <span className="inline-flex h-5 items-center gap-1 rounded-full bg-brand-accent px-2 font-mono text-xs font-semibold uppercase tracking-[0.04em] text-brand-primary">
                      <Crown aria-hidden="true" className="h-3 w-3" />
                      Team lead
                    </span>
                  )}
                </p>
                <p className={helperText}>
                  {[roleLabel(member.role) || 'No role', plural(count, 'task')].join(' · ')}
                  {member.email && (
                    <>
                      {' · '}
                      <a href={`mailto:${member.email}`} className={`inline-flex items-center gap-1 rounded text-brand-primary underline underline-offset-2 hover:decoration-2 ${focusRing}`}>
                        <Mail aria-hidden="true" className="h-3.5 w-3.5" />
                        {member.email}
                      </a>
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {!isLead && (
                  <button type="button" onClick={() => makeLead(member)} className={`${buttonSecondary} h-8 px-3`}>
                    <Crown aria-hidden="true" className="h-4 w-4" />
                    Make team lead
                  </button>
                )}
                <button
                  type="button"
                  data-edit
                  onClick={() => setEditing(member.id)}
                  aria-label={`Edit ${member.name}`}
                  title="Edit"
                  className={iconButton}
                >
                  <Pencil aria-hidden="true" className="h-4 w-4" />
                </button>
                {/* The lead cannot leave: Slopify always acts as the lead. */}
                <button
                  type="button"
                  onClick={() => setRemoving(member)}
                  disabled={isLead}
                  aria-label={
                    isLead ? `${endSentence(`Remove ${member.name}`)} Make another member the team lead first.` : `Remove ${member.name}`
                  }
                  title={isLead ? 'Make another member the team lead first.' : 'Remove from the team'}
                  className={`${iconButton} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {removing && (
        <RemoveMemberDialog
          member={removing}
          count={taskCount(removing.id)}
          team={team}
          lead={lead}
          onConfirm={(heirId) => remove(removing, heirId)}
          onCancel={() => {
            const id = removing.id;
            setRemoving(null);
            focusRow(id);
          }}
        />
      )}
    </section>
  );
}

/** Confirm a removal and choose who gets the member's tasks (default: the lead). */
function RemoveMemberDialog({ member, count, team, lead, onConfirm, onCancel }) {
  const titleId = useId();
  const bodyId = useId();
  const selectId = useId();
  const cancelRef = useRef(null);
  const [heir, setHeir] = useState(lead?.id ?? '');

  return (
    <Modal role="alertdialog" labelledBy={titleId} describedBy={bodyId} onRequestClose={onCancel} initialFocusRef={cancelRef} className="max-w-[25rem]">
      <div className="p-6">
        <h2 id={titleId} className="font-heading text-xl font-semibold leading-7">
          Remove {member.name} from the team?
        </h2>
        <p id={bodyId} className="mt-2 text-base leading-6 text-ink-muted">
          {count === 0
            ? `${member.name} has no tasks.`
            : `${member.name} has ${plural(count, 'task')}. Choose who gets ${count === 1 ? 'it' : 'them'}.`}
        </p>
        {count > 0 && (
          <div className="mt-4">
            <label htmlFor={selectId} className={labelBase}>
              Give {count === 1 ? 'the task' : 'the tasks'} to
            </label>
            <select id={selectId} value={heir} onChange={(e) => setHeir(e.target.value)} className={`${inputBase} mt-1 h-10`}>
              {team
                .filter((m) => m.id !== member.id)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                    {m.id === lead?.id ? ' (team lead)' : ''}
                  </option>
                ))}
              <option value="">Nobody (Unassigned)</option>
            </select>
          </div>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <button ref={cancelRef} type="button" onClick={onCancel} className={buttonSecondary}>
            Cancel
          </button>
          <button type="button" onClick={() => onConfirm(heir || null)} className={buttonDanger}>
            Remove member
          </button>
        </div>
      </div>
    </Modal>
  );
}

function PromptSection() {
  const { prefs, setPrefs } = useAppData();
  const id = useId();
  const helpId = useId();
  return (
    <section aria-labelledby="settings-prompt">
      <h3 id="settings-prompt" className={sectionHeading}>
        Copied prompts
      </h3>
      <div className="mt-2 flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          checked={prefs.promptIncludesLinks}
          onChange={(e) => setPrefs((p) => ({ ...p, promptIncludesLinks: e.target.checked }))}
          aria-describedby={helpId}
          className={`mt-0.5 h-5 w-5 shrink-0 rounded border-line-strong accent-brand-primary ${focusRing}`}
        />
        <div>
          <label htmlFor={id} className={labelBase}>
            Add the deliverable links to every copied prompt
          </label>
          <p id={helpId} className={helperText}>
            The AI tool then sees your presentation, demo, report and documentation links.
          </p>
        </div>
      </div>
    </section>
  );
}
