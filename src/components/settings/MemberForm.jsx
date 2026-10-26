import { useEffect, useId, useRef, useState } from 'react';
import { ROLES, MEMBER_NAME_MAX } from '../../lib/constants.js';
import { validateMember } from '../../lib/team.js';
import { buttonPrimary, buttonSecondary, helperText, inputBase, labelBase } from '../../lib/ui.js';
import { fieldError } from './shared.js';

/**
 * Add or edit one team member: name (required), email and role (optional).
 * Esc cancels the form only, not the whole Settings dialog.
 *
 *   member  the member to edit, or null to add a new one
 *   team    the current team (for the unique-name check)
 *   onSave  ({ name, email, role }) => void
 */
export default function MemberForm({ member, team, onSave, onCancel }) {
  const ids = { name: useId(), nameError: useId(), email: useId(), emailError: useId(), emailHelp: useId(), role: useId() };
  const [draft, setDraft] = useState({ name: member?.name ?? '', email: member?.email ?? '', role: member?.role ?? '' });
  const [errors, setErrors] = useState({});
  const nameRef = useRef(null);
  const emailRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const set = (field) => (e) => {
    setDraft((d) => ({ ...d, [field]: e.target.value }));
    if (errors[field]) setErrors((x) => ({ ...x, [field]: undefined }));
  };

  function submit(e) {
    e.preventDefault();
    const found = validateMember(draft, team, member?.id ?? null);
    if (found.name || found.email) {
      setErrors(found);
      (found.name ? nameRef : emailRef).current?.focus();
      return;
    }
    onSave({ name: draft.name, email: draft.email, role: draft.role || null });
  }

  return (
    <form
      noValidate
      onSubmit={submit}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          onCancel();
        }
      }}
      aria-label={member ? `Edit ${member.name}` : 'Add a team member'}
      className="space-y-3 rounded-2xl border border-line-strong bg-glass/90 p-4 reduce-transparency:bg-surface-card"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={ids.name} className={labelBase}>
            Name <span className="font-normal text-ink-muted">(required)</span>
          </label>
          <input
            ref={nameRef}
            id={ids.name}
            type="text"
            value={draft.name}
            onChange={set('name')}
            maxLength={MEMBER_NAME_MAX}
            autoComplete="off"
            aria-required="true"
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? ids.nameError : undefined}
            className={`${inputBase} mt-1 h-10`}
          />
          {errors.name && (
            <p id={ids.nameError} className={fieldError}>
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <label htmlFor={ids.role} className={labelBase}>
            Role
          </label>
          <select id={ids.role} value={draft.role} onChange={set('role')} className={`${inputBase} mt-1 h-10`}>
            <option value="">No role</option>
            {ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor={ids.email} className={labelBase}>
          Email <span className="font-normal text-ink-muted">(optional)</span>
        </label>
        <input
          ref={emailRef}
          id={ids.email}
          type="email"
          value={draft.email}
          onChange={set('email')}
          autoComplete="off"
          spellCheck={false}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={[ids.emailHelp, errors.email && ids.emailError].filter(Boolean).join(' ')}
          className={`${inputBase} mt-1 h-10`}
        />
        <p id={ids.emailHelp} className={`mt-1 ${helperText}`}>
          For contact only. Slopify never sends email.
        </p>
        {errors.email && (
          <p id={ids.emailError} className={fieldError}>
            {errors.email}
          </p>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className={buttonSecondary}>
          Cancel
        </button>
        <button type="submit" className={buttonPrimary}>
          {member ? 'Save member' : 'Add member'}
        </button>
      </div>
    </form>
  );
}
