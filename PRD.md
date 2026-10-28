# Vibecoding Project Tracker — PRD

**Status:** Hackathon starter PRD · review and fill in the **`<TODO>`** sections before you tag `prd-done`.

---

## 1. Problem

Vibecoding teams have two recurring pains with large projects:

1. **They lose track of tasks.** Three teammates, a hundred small things, no shared view. Nothing tells them what state each task is actually in.
2. **They lose track of prompts.** The AI gave them working code two days ago but no one remembers the prompt that produced it. When they need to iterate, they start from scratch.

A spreadsheet doesn't solve this. A real project tool (Linear, Jira, Notion) is overkill, doesn't know about prompts, and takes hours to set up.

## 2. Target users

- **Primary:** the team members, for the remaining weeks of the summer semester.
- **Secondary:** future cohorts of vibecoders taking the same class.

We are designing the tool we ourselves will use. The pitch demo is also our first real user test.

## 3. Product overview

A single-page web app with two persistent surfaces:

- A **Kanban board** where vibecoding tasks move through four states.
- An **Anchor Board** above it that pins the four final-project deliverables (Presentation, Demo, Report, Documentation).

Each task carries the prompt context that produced it, so any teammate can click a button and copy the task + prompt history back into an AI chat to continue work.

## 4. Primary user flow

1. Open the Webapp. The board loads from local storage.
2. Click "+" to add a task. Fill in title, type, assignee, due date, prompt context.
3. Move the task across columns as you work.
4. When stuck, click "Copy as Prompt Context" on a task and paste it into Claude/ChatGPT/Cursor to continue.
5. Hand off a task to a teammate with one dropdown.
6. Drop final deliverable links into the Anchor Board as you produce them.

## 5. Data model

Locked. Do not change without team agreement.

> **Changed in schema v3 (client Q&A, §15).** The team is stored data, not three fixed names. `Task.assignee` holds a `Member` id, and `null` means Unassigned. A migration converts older boards and keeps every owner.

```js
// A single vibecoding task.
Task = {
  id: string,                    // uuid or timestamp string
  title: string,
  description: string,
  type: 'feature' | 'bug',       // visual color coding
  status: 'todo' | 'in-progress' | 'review' | 'done',
  assignee: string | null,       // v3: a Member id (§8); null = Unassigned
  dueDate: string | null,        // ISO date 'YYYY-MM-DD'
  createdDate: string,           // ISO date 'YYYY-MM-DD'

  // Added in later milestones:
  context: string,               // M9 context — curated briefing for the next AI / teammate
  contextTool: string | null,    // M9 context — 'Claude' | 'ChatGPT' | 'Cursor' | 'Lovable' | 'Replit' | 'Other'
  contextUpdatedAt: string|null, // M9 context — ISO timestamp set automatically on save

  // Optional, added in M12 (additive per NFR-REL-05; default []):
  contextHistory: Array<{        // earlier context versions, newest first, max 20
    context: string,
    contextTool: string | null,
    savedAt: string | null,      // ISO timestamp of that version
  }>,

  // Optional, added in schema v4 (log-in, §15; default null / []):
  createdBy: string | null,      // Member id of the creator
  updatedBy: string | null,      // Member id of the last change
  updatedAt: string | null,      // ISO timestamp of the last change
  activity: Array<{              // who did what, newest first, max 50
    at: string,                  // ISO timestamp
    by: string | null,           // Member id
    type: 'created' | 'moved' | 'handoff' | 'edited' | 'context' | 'restored',
    from?: string | null,        // stage id (moved) or Member id (handoff)
    to?: string | null,
  }>,
}

// One of four pinned deliverable slots.
Anchor = {
  id: 'presentation' | 'demo' | 'report' | 'documentation',
  label: string,                 // human-readable
  url: string | null,            // the link the team pastes in
}

// v3: one team member (§8). Managed in Settings → Project & team.
Member = {
  id: string,
  name: string,                  // 1–40 characters, unique (case-insensitive)
  email: string | null,          // for contact only; Slopify never sends email
  role: 'swe' | 'architect' | 'senior' | 'junior' | 'ux' | 'database' | 'other' | null,
  createdAt: string | null,      // ISO timestamp
}

// v3: the one project and its one team.
Workspace = {
  projectName: string,
  teamName: string,
  leadId: string | null,         // the team lead (a badge; log-in is separate, §15.1)
}
```

## 6. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React (via Vite) | What the scaffold ships with. Don't migrate. |
| Styling | Tailwind | Already configured. Use utility classes; no separate CSS files. |
| State | React `useState` + a `useLocalStorage` hook | Simple, no library needed. |
| Persistence | **localStorage** | Zero infra. Pick this. Do not switch to a backend mid-hackathon. |
| Deploy | Vercel | One-click deploy from GitHub. |

> **Decision:** localStorage, not a shared backend. If you want a shared backend later, that's M14 — out of scope for the hackathon.

## 7. Stage names

Four columns, in this order, with these exact labels in the UI:

1. **To Do**
2. **In Progress**
3. **Review**
4. **Done**

## 8. Team

Fill these in before tagging `prd-done`:

| Slot | Name | GitHub handle |
|---|---|---|
| Teammate A | `<TODO>` | `<TODO>` |
| Teammate B | `<TODO>` | `<TODO>` |
| Teammate C | `<TODO>` | `<TODO>` |

**Changed after the client Q&A (§15).** The team is no longer fixed in code. Add, edit and remove members (name, email, role) in **Settings → Project & team**. One member is the **team lead** (a badge). **Log-in:** the log-in screen lists every profile; one click logs in, with no password. "You" in the app is the logged-in profile: "My tasks", the default owner of new tasks, and the activity log. A new board starts with three placeholder members; rename them.

## 9. Milestone ownership

Fill in the owner column. Recommended default in **bold**; change if your team has different strengths.

| # | Tag | Title | Suggested owner | Final owner |
|---|---|---|---|---|
| 3 | `design-done` | Design system + voice (DESIGN.md) | **B** | `<TODO>` |
| 4 | `data-model` | Task model + board view | **A** | `<TODO>` |
| 5 | `crud-modal` | Add / edit / delete modal | **A** | `<TODO>` |
| 6 | `tag-style` | Feature / bug colors | **B** | `<TODO>` |
| 7 | `task-owner` | Owner indicator + handoff | **A** | `<TODO>` |
| 8 | `due-tint` | Due-date color tinting | **B** | `<TODO>` |
| 9 | `context` | Context field on the task modal | **C** | `<TODO>` |
| 10 | `copy-prompt` | "Copy as Prompt Context" button | **C** | `<TODO>` |
| 11 | `anchors` | Deliverable Anchor Board | **B** | `<TODO>` |
| 12 | `secret-sauce` | The one thing that makes it yours | **C / All** | `<TODO>` |
| 13 | `pitch-ready` | Demo + pitch rehearsal | **All** | `<TODO>` |


Track A owns the state model and task ownership. Track B owns the visuals (and design — M3 runs parallel to M2 so the team starts Phase 3 with the palette already chosen). Track C owns the differentiator features (M9 + M10 — the context field and the Copy-as-Prompt button) and usually leads on M12 secret-sauce. Put your strongest prompter on Track C.

**Dependency note.** M3 (`design-done`) runs **in parallel with M2** — Person B drafts DESIGN.md and pastes the colors into `tailwind.config.js` while the rest of the team reviews the PRD. M6 / M7 / M8 / M11 all depend on M4 + M5 being done first. While Person A builds M4+M5 (first ~60 min of Phase 3), Person C should draft the Markdown template for the "Copy as Prompt Context" output (M10). M12 `secret-sauce` is open-ended — pick whatever makes the tracker uniquely yours; constraint is "must be visible in the demo and must not break anything else."

## 10. AI / vibe coding angle

Where AI will be heavily used:
- M4, M5: scaffold the board and the modal from a single prompt each.
- M9, M10: write the Markdown serialization helper for the Context field.
- M7: animation polish for the handoff toast.

Where AI will **not** save you time:
- M2 (this PRD review) — read it yourself.
- M3 (DESIGN.md) — design taste is yours, not the model's.
- M12 (secret-sauce) — the whole point is that AI can't predict it.
- M13 (pitch) — write the script in your own voice.

Keep the Context field of each real task up to date as you work. By the end of the hackathon you should have a handful of curated context blocks — those become part of your Module 5 "Vibe Coding History" deliverable.

## 11. Team identity

Fill in:

- **Team name:** `<TODO>`
- **Product name:** Slopify
- **Tagline (one sentence):** Track the task. Keep the context.
- **Tracker URL after deploy:** `<TODO>` (Vercel will give it to you)

### Secret sauce (M12): Prompt history timeline

**The problem.** A prompt is never written once. The team rewrites a task's context many times, and the version that worked on Tuesday is gone by Thursday. When a new prompt makes the AI go the wrong way, nobody can get the good one back. This is pain #2 from §1, one level deeper.

**What Slopify does.** Every time a task's context or tool changes, Slopify keeps the previous version. The edit modal shows a **Prompt history** timeline: each version with its number, its age and the AI tool it was written for. A teammate can:

- **Show** any version to read it.
- **Copy** any version as a full "Copy as Prompt Context" prompt, to go back to an approach that worked.
- **Restore** any version into the Context field. Saving keeps the current text in the history too, so nothing is ever lost.

On the board, each card shows how many versions its prompt has (for example "Claude · v4"), so the team can see which tasks needed the most iteration.

**Why it is ours.** Linear, Jira and Notion track task history. Slopify tracks *prompt* history. It turns the Context field from a note into a record of how the team and the AI found the answer, which also feeds the Module 5 "Vibe Coding History" deliverable (§10).

**Limits.** The newest 20 earlier versions per task are kept, to protect the browser storage limit (DR-CAP). The data is the optional `contextHistory` field (§5); the storage schema is now version 2 (DR-MIG).

## 12. Out of scope (do not build)

- Passwords and real authentication. Log-in is one click on a profile, with no password (client decision, §15).
- Real GitHub integration.
- A real backend / shared database.
- Multi-team support and multiple projects (client: "one project for one team first").
- Real-time collaboration.

## 13. Definition of done

The hackathon is "done" when all 13 milestone tags are pushed to your repo and visible on the dashboard. The pitch is "done" when:

- The board loads on Vercel without errors.
- The "Copy as Prompt Context" demo works on stage.
- 5 min pitch is rehearsed.

## 14. Requirements (build task list)

This section is the team's working task list for Phase 3. Every requirement has an **ID**, a **priority**, and is written to be testable in the browser. Tick the box only when the item works on a fresh reload.

**Priority key**

| Priority | Meaning |
|---|---|
| **Must** | Required before the milestone tag is pushed. |
| **Should** | Expected for a polished demo. Do it unless the clock forces a cut. |
| **Could** | Nice-to-have if you are ahead of schedule. |

**Rule of thumb:** finish every *Must* in milestone order first, then sweep the *Shoulds*. All requirements respect §6 (tech stack) and §12 (out of scope) — nothing here asks for a backend, auth, or mobile layouts.

### 14.1 User-centred guiding principles

These principles are the tie-breaker whenever a requirement below is ambiguous.

1. **The board is home.** Every action is reachable in two clicks or fewer from the board.
2. **Recognition over recall.** A card shows its type, owner, due state and whether it has context — no opening the modal just to find out.
3. **Never lose work.** Every change saves immediately; every destructive action asks first.
4. **Keyboard and mouse are equal citizens.** Anything you can click, you can do from the keyboard.
5. **Colour is never the only signal.** Every colour cue is paired with text or an icon.
6. **Instant feedback.** Every action produces a visible response within 100 ms.
7. **Speak like the team.** Microcopy comes from DESIGN.md §5, written for a tired user at 11 pm.

### 14.2 Functional requirements

#### App shell & shared components (needed from M4 onward)

- [x] **FR-APP-01** · Must — Header shows the product name (DESIGN.md §6) and the team name from §11, replacing the "Team starter" placeholder.
- [x] **FR-APP-02** · Must — `TEAM` in `src/App.jsx` contains the three names from §8; it is the single source of truth for every assignee picker.
- [x] **FR-APP-03** · Must — `<title>` in `index.html` is the product name; `<html lang="en">` is set.
- [x] **FR-APP-04** · Must — The primary "+" (add task) action is visible in the header at all times without scrolling.
- [x] **FR-APP-05** · Must — One shared toast component is used for all notifications: appears bottom-centre or bottom-right, 200 ms fade in/out, auto-dismisses after 3–4 s, can be dismissed manually, announced via an `aria-live="polite"` region. At most 3 toasts stack at once.
- [x] **FR-APP-06** · Should — One shared confirm dialog is used for every destructive action (delete, reset, load demo data), with focus defaulting to **Cancel**.
- [x] **FR-APP-07** · Could — Favicon matching the wordmark.

#### M4 `data-model` — Board view

- [x] **FR-M4-01** · Must — The board renders four columns from `STAGES`, left to right, with the exact labels from §7.
- [x] **FR-M4-02** · Must — Each task appears in exactly one column — the one whose `id` matches `task.status`.
- [x] **FR-M4-03** · Must — On first load (no `vibetracker.tasks` key in localStorage) the board is seeded with 3–4 mock tasks that together cover: both types, at least two columns, at least two assignees, and at least one task with a due date.
- [x] **FR-M4-04** · Must — Tasks persist via `useLocalStorage('vibetracker.tasks', …)`. Reloading the page shows the identical board.
- [x] **FR-M4-05** · Must — Seed data loads **only** when the key is absent. A user who deletes every task sees an empty board after reload, not the seed tasks again.
- [x] **FR-M4-06** · Must — Each card shows at minimum: title, type, assignee and due date (if set). Full visual treatment comes in M6–M9; plain text is acceptable at M4.
- [x] **FR-M4-07** · Must — A task can be moved between stages **without drag-and-drop** (status dropdown on the card, or ← / → buttons). Drag-and-drop is optional (DESIGN.md §4) but never the only way.
- [x] **FR-M4-08** · Must — Moving a task updates the board immediately and persists.
- [x] **FR-M4-09** · Should — Each column header shows a task count, e.g. "In Progress · 3".
- [x] **FR-M4-10** · Should — Empty columns show the DESIGN.md §5 empty-state copy instead of blank space.
- [x] **FR-M4-11** · Should — Card order within a column is predictable: due date ascending, tasks without a due date last, ties broken by `createdDate` (oldest first).
- [x] **FR-M4-12** · Should — At 1280×720 all four columns are visible without horizontal scrolling; a column with many cards scrolls vertically on its own while the header and Anchor Board stay put.
- [x] **FR-M4-13** · Should — Long titles are clamped to two lines on the card with an ellipsis; the full title is visible in the modal and in the card's accessible name.

#### M5 `crud-modal` — Add / edit / delete

*Create*

- [x] **FR-M5-01** · Must — Clicking "+" opens a modal in **create** mode containing every editable field: title, description, type, status, assignee, due date (context fields join in M9).
- [x] **FR-M5-02** · Must — Sensible defaults: type `feature`, status `todo`, assignee = the first teammate (Should: the last-used assignee), due date empty.
- [x] **FR-M5-03** · Must — `id` is generated automatically (`crypto.randomUUID()` with a `Date.now()` string fallback); `createdDate` is set to today's **local** date. Neither is user-editable.
- [x] **FR-M5-04** · Must — Title is required. Whitespace is trimmed. Attempting to save with an empty title shows an inline error next to the field, in DESIGN.md voice, and moves focus to the title.
- [x] **FR-M5-05** · Should — Title is limited to 120 characters, description to 2,000; a character counter appears near the limit.
- [x] **FR-M5-06** · Should — Each column has its own small "+" that opens the create modal with status pre-set to that column.
- [x] **FR-M5-07** · Should — The modal heading and primary button reflect the mode: "New task" / "Create task" vs. "Edit task" / "Save changes".

*Edit*

- [x] **FR-M5-08** · Must — Clicking a card — or pressing Enter / Space while it is focused — opens the same modal in **edit** mode, pre-filled.
- [x] **FR-M5-09** · Must — Saving updates the task in place and preserves `id` and `createdDate`.
- [x] **FR-M5-10** · Must — Cancel, Esc and clicking the backdrop all close the modal without saving.
- [x] **FR-M5-11** · Should — If the form has unsaved changes, closing asks "Discard changes?" first.

*Delete*

- [x] **FR-M5-12** · Must — A Delete action is available in edit mode only, visually separated from Save (e.g. bottom-left vs. bottom-right) and styled as destructive.
- [x] **FR-M5-13** · Must — Delete asks for confirmation using the DESIGN.md §5 confirm-delete copy. Confirming removes the task and persists the change.
- [x] **FR-M5-14** · Could — After deletion, a toast offers **Undo** for 5 s.

*Modal behaviour*

- [x] **FR-M5-15** · Must — On open, focus moves to the title field; Tab cycles **within** the modal; on close, focus returns to the element that opened it.
- [x] **FR-M5-16** · Must — Keyboard: Esc closes; Enter in a single-line input submits; Ctrl/Cmd + Enter submits from a textarea.
- [x] **FR-M5-17** · Must — The modal has `role="dialog"`, `aria-modal="true"` and `aria-labelledby` pointing to its heading.
- [x] **FR-M5-18** · Must — Every save writes to localStorage immediately — there is no separate "save board" step.
- [x] **FR-M5-19** · Should — Page scroll is locked while the modal is open; if the modal is taller than the viewport its body scrolls while the action buttons stay visible.

#### M6 `tag-style` — Feature vs. bug distinction

- [x] **FR-M6-01** · Must — Feature and bug cards are distinguishable at a glance using the `type-feature` / `type-bug` tokens (accent stripe per DESIGN.md §2) **and** a non-colour cue: an icon plus the text "Feature" / "Bug".
- [x] **FR-M6-02** · Must — Type colours are defined as tokens in `tailwind.config.js` matching DESIGN.md §2; no hex values are hard-coded in JSX.
- [x] **FR-M6-03** · Must — In the modal, type is chosen with a segmented control or radio group that shows the same colour + icon as the card.
- [x] **FR-M6-04** · Should — Type badge text meets 4.5:1 contrast against its background.
- [x] **FR-M6-05** · Could — A filter in the header shows only features or only bugs.

#### M7 `task-owner` — Assignee badge & handoff

- [x] **FR-M7-01** · Must — Every card shows an assignee badge: initials avatar plus the name (or the name in the badge's accessible label and tooltip). Each teammate has a consistent, distinct badge.
- [x] **FR-M7-02** · Must — A "Hand off to…" dropdown on the card lists the other teammates; picking one reassigns the task immediately without opening the modal. The modal's assignee field offers the same choice.
- [x] **FR-M7-03** · Must — A successful handoff shows a toast with the DESIGN.md §5 handoff copy, including the new owner's name.
- [x] **FR-M7-04** · Must — Interacting with the handoff dropdown (or any other control on a card) does **not** also open the edit modal.
- [x] **FR-M7-05** · Must — A task whose assignee is not in `TEAM` (e.g. after a name change) shows as "Unassigned" and can be reassigned; it never crashes the board.
- [x] **FR-M7-06** · Should — Teammate badge colours do not collide with type or due-state colours; initials make the badge identifiable without colour.
- [x] **FR-M7-07** · Could — The handoff toast offers **Undo**.
- [x] **FR-M7-08** · Could — A header filter shows one teammate's tasks ("My tasks").

#### M8 `due-tint` — Due-date colour states

Due state is computed from date-only values in the user's **local** timezone, compared to today:

| State | Rule | Token | Card label (example) |
|---|---|---|---|
| Done | `status === 'done'` (overrides any date) | `due-neutral` | "Done" |
| Overdue | `dueDate` < today | `due-overdue` | "Overdue · 2 days" |
| Warning | `dueDate` is today or tomorrow | `due-warning` | "Due today" / "Due tomorrow" |
| Safe | `dueDate` ≥ today + 2 days | `due-safe` | "Due in 5 days" |
| No date | `dueDate === null` | no tint | — |

> **Decision (agreed):** DESIGN.md §2 leaves a gap between "less than 24 hours" and "more than 2 days". Because `dueDate` has no time component, "tomorrow" counts as *Warning*. Update DESIGN.md §2 to match.

- [x] **FR-M8-01** · Must — Card background or border is tinted according to the table above.
- [x] **FR-M8-02** · Must — Every tinted state also shows a text label and icon (e.g. clock / alert), so the state is readable without colour.
- [x] **FR-M8-03** · Must — Date comparisons use local dates. Do **not** compare `new Date('YYYY-MM-DD')` (parsed as UTC) to the local current time — compare `YYYY-MM-DD` strings or build local `Date` objects.
- [x] **FR-M8-04** · Must — The due date uses the native date input and can be cleared back to `null`.
- [x] **FR-M8-05** · Must — Due tint and type stripe coexist legibly: tint applies to background/border, type stays on the accent stripe and badge.
- [x] **FR-M8-06** · Should — Due states are recomputed on every render and on window focus, so a board left open overnight updates.
- [x] **FR-M8-07** · Should — Picking a past due date when creating a task shows a soft inline warning ("That date has already passed") but still allows saving.
- [x] **FR-M8-08** · Could — The header shows an overdue count, e.g. "2 overdue".

#### M9 `context` — Curated Context field

- [x] **FR-M9-01** · Must — The modal includes a multi-line **Context** textarea in the monospace font (DESIGN.md §3), at least 6 rows tall and vertically resizable.
- [x] **FR-M9-02** · Must — Placeholder or helper text teaches what good context looks like: goal, what already works, constraints, relevant files, last prompt used, next step.
- [x] **FR-M9-03** · Must — A **Tool** select offers `Claude`, `ChatGPT`, `Cursor`, `Lovable`, `Replit`, `Other`, plus an empty option (stored as `null`).
- [x] **FR-M9-04** · Must — `contextUpdatedAt` is set automatically to an ISO timestamp on save **only** when `context` or `contextTool` actually changed.
- [x] **FR-M9-05** · Must — The modal shows when context was last updated in relative form ("Updated 2 h ago"), with the absolute date/time in a tooltip.
- [x] **FR-M9-06** · Must — Cards with non-empty context show an indicator (icon + tool name) so teammates can spot tasks that are ready to resume.
- [x] **FR-M9-07** · Must — Tasks saved before M9 (missing `context`, `contextTool`, `contextUpdatedAt`) load with defaults `''`, `null`, `null` and no errors.
- [x] **FR-M9-08** · Must — Context is stored and displayed exactly as typed or pasted — whitespace, line breaks and Markdown are preserved; nothing is truncated.
- [x] **FR-M9-09** · Should — An "Insert template" button fills an empty Context field with headings (Goal / Done so far / Constraints / Files / Last prompt / Next step).
- [x] **FR-M9-10** · Should — Helper text reminds users not to paste API keys or passwords (data lives unencrypted in the browser).
- [x] **FR-M9-11** · Should — A soft warning appears if a single context exceeds 20,000 characters (localStorage is capped at roughly 5 MB per site).
- [x] **FR-M9-12** · Could — A "stale context" hint appears on cards that are not done and whose context is older than 3 days.

#### M10 `copy-prompt` — "Copy as Prompt Context"

- [x] **FR-M10-01** · Must — A "Copy as Prompt Context" button is available in the modal **and** as an icon button on each card (with an accessible label and tooltip). One click copies.
- [x] **FR-M10-02** · Must — The copied text follows the team's Markdown template (default below). Empty fields are omitted cleanly — the output never contains `undefined`, `null` or empty headings.
- [x] **FR-M10-03** · Must — Copy uses `navigator.clipboard.writeText`. If that fails, fall back to a hidden-textarea copy; if that also fails, show the text in a read-only, pre-selected box with "Press Ctrl/Cmd + C to copy".
- [x] **FR-M10-04** · Must — Success shows the DESIGN.md §5 copy toast; failure shows an error toast in plain language. Both are announced to screen readers.
- [x] **FR-M10-05** · Must — Works on both `localhost` and the deployed Vercel HTTPS URL.
- [x] **FR-M10-06** · Should — The button changes to "Copied ✓" for about 2 s after a successful copy.
- [x] **FR-M10-07** · Should — Serialisation lives in a pure helper, e.g. `taskToPrompt(task)`, separate from UI code so it is easy to tweak and test.
- [x] **FR-M10-08** · Should — A task with no context still copies its details plus the line "No context recorded yet."
- [x] **FR-M10-09** · Could — A preview of the output in the modal before copying.
- [x] **FR-M10-10** · Could — Option to append the Anchor Board links to the prompt.

Default template (Person C refines this while M4/M5 are built — see §9):

```markdown
# Task: {title}

- **Type:** {Feature | Bug}
- **Status:** {To Do | In Progress | Review | Done}
- **Owner:** {assignee}
- **Due:** {YYYY-MM-DD} ({Due tomorrow})
- **Context last updated:** {YYYY-MM-DD HH:mm} via {contextTool}

## Description
{description}

## Context
{context}

## What I need from you
Continue this task from where the context leaves off. Ask before changing anything outside its scope.
```

#### M11 `anchors` — Deliverable Anchor Board

- [x] **FR-M11-01** · Must — An Anchor Board sits above the Kanban with exactly four fixed slots, in order: Presentation, Demo, Report, Documentation (ids per §5).
- [x] **FR-M11-02** · Must — Anchors persist via `useLocalStorage('vibetracker.anchors', …)`.
- [x] **FR-M11-03** · Must — An empty slot shows a clear "Add link" affordance (DESIGN.md §4 empty-state style). A filled slot shows the label and the link's hostname and opens in a new tab with `rel="noopener noreferrer"`.
- [x] **FR-M11-04** · Must — Users can add, edit and clear each URL inline or in a small popover; Enter saves, Esc cancels.
- [x] **FR-M11-05** · Must — URL validation: accept `http`/`https`; prepend `https://` if the scheme is missing; reject any other scheme (e.g. `javascript:`) with an inline error.
- [x] **FR-M11-06** · Should — Opening and editing are separate targets (the link opens; a pencil icon edits) to prevent accidental navigation or accidental edits.
- [x] **FR-M11-07** · Should — A progress hint shows completion, e.g. "2 of 4 deliverables linked".
- [x] **FR-M11-08** · Should — The Anchor Board is compact (about 120 px tall or less) so the Kanban stays above the fold at 1280×720.
- [x] **FR-M11-09** · Could — A copy-link button per filled slot.

#### M12 `secret-sauce` — The team's differentiator

- [x] **FR-M12-01** · Must — The feature is described in this PRD (add a short paragraph under §11): what user problem it solves and why it is uniquely ours.
- [x] **FR-M12-02** · Must — It is visible in the demo within the first two minutes of the pitch flow.
- [x] **FR-M12-03** · Must — It does not break any M4–M11 requirement (run the §14.5 regression check).
- [x] **FR-M12-04** · Must — It meets the same non-functional requirements as everything else (accessibility, persistence, no console errors).
- [x] **FR-M12-05** · Should — It is discoverable without a verbal explanation (a label, empty state or one-line hint).

#### M13 `pitch-ready` — Demo dataset & rehearsal

- [x] **FR-M13-01** · Must — A demo dataset of 8–12 realistic tasks covers all four columns, both types, all three teammates, every due state (overdue, warning, safe, no date, done), at least 3 tasks with rich curated context from real hackathon work, and at least 2 filled anchors.
- [x] **FR-M13-02** · Must — Demo due dates are generated **relative to today** (e.g. today − 2, today + 1, today + 5) so tints are correct on pitch day.
- [x] **FR-M13-03** · Must — A "Load demo data" action (e.g. in a footer menu) replaces the current data only after confirmation.
- [ ] **FR-M13-04** · Must — The pitch is rehearsed on the **deployed** Vercel build, not localhost; the deployed build loads with zero console errors.
- [x] **FR-M13-05** · Should — A "Reset board" action clears tasks and anchors after confirmation.

#### Cross-cutting — Data safety & portability

- [x] **FR-DATA-01** · Must — Loaded data is normalised: missing fields get defaults, an unknown `status` falls back to `todo`, an unknown `type` falls back to `feature`.
- [x] **FR-DATA-02** · Must — Corrupted localStorage (invalid JSON or wrong shape) never produces a blank screen; the app starts with a safe state and shows a non-blocking notice.
- [x] **FR-DATA-03** · Should — Before falling back, the corrupted raw value is copied to a backup key (e.g. `vibetracker.tasks.backup`) so it can be recovered.
- [x] **FR-DATA-04** · Should — **Export** downloads tasks + anchors as a JSON file — the only way to move a board between teammates' machines (see §14.6; format in §14.4.9).
- [x] **FR-DATA-05** · Could — **Import** a previously exported JSON file, with validation and a confirm-before-replace dialog.
- [x] **FR-DATA-06** · Could — Two open tabs stay in sync by listening to the `storage` event.

### 14.3 Non-functional requirements

#### Usability & HCI

Mapped to Nielsen's usability heuristics so gaps are easy to spot in review.

- [ ] **NFR-USE-01** · Must · *Visibility of system status* — Every state-changing action gives visible feedback within 100 ms (card moves, toast, button state).
- [ ] **NFR-USE-02** · Must · *Match with the real world* — Cards show human-readable dates ("Due tomorrow", "Oct 24"), never raw ISO strings; stage labels match §7 exactly.
- [ ] **NFR-USE-03** · Must · *User control & freedom* — Every modal and popover can be cancelled with a button and with Esc; destructive actions (delete, reset, load demo) require confirmation.
- [ ] **NFR-USE-04** · Must · *Consistency & standards* — The same action uses the same control everywhere (type picker, assignee picker, copy button). Each view has one primary button. Only DESIGN.md tokens are used.
- [ ] **NFR-USE-05** · Must · *Error prevention* — Inputs validate inline before save; destructive buttons are visually and spatially separated from primary ones.
- [ ] **NFR-USE-06** · Must · *Recognition over recall* — Cards surface type, owner, due state and context presence (see FR-M6/M7/M8/M9).
- [x] **NFR-USE-07** · Should · *Flexibility & efficiency* — Keyboard shortcuts: `N` opens a new task (when focus is not in a text field), `Esc` closes, `Ctrl/Cmd + Enter` saves. Shortcuts are shown in button tooltips.
- [ ] **NFR-USE-08** · Must · *Aesthetic & minimalist design* — A card shows no more than five pieces of information; the full description lives in the modal (a one-line preview at most).
- [ ] **NFR-USE-09** · Must · *Help users recover from errors* — Error messages say what happened and how to fix it, in plain language and DESIGN.md voice. No stack traces or codes.
- [ ] **NFR-USE-10** · Should · *Help & documentation* — Empty states and helper text teach the next action (empty column, empty anchor slot, empty Context field).
- [ ] **NFR-USE-11** · Must — Interaction-cost targets, measured during rehearsal:

  | Task (from the board) | Target |
  |---|---|
  | Create a task with title + assignee | ≤ 15 s, ≤ 4 interactions after opening the modal |
  | Move a task one stage | ≤ 2 interactions |
  | Hand a task off | ≤ 2 interactions |
  | Copy a task as prompt context | 1 interaction from the card |
  | Add an anchor link | ≤ 3 interactions |

- [ ] **NFR-USE-12** · Must · *Fitts's law* — Interactive targets are at least 24 × 24 px; primary buttons at least 32 px tall; related controls grouped close to the content they act on.
- [ ] **NFR-USE-13** · Should — **Hallway test:** someone outside the team completes the §4 primary flow without help. Record where they hesitate and fix the top 3 issues before `pitch-ready`.

#### Accessibility (target: WCAG 2.2 AA; reflow down to 320 px since the client Q&A, §15)

- [ ] **NFR-A11Y-01** · Must — Text contrast ≥ 4.5:1 (≥ 3:1 for large text); UI component boundaries and focus indicators ≥ 3:1. Check every DESIGN.md token pairing, **including text on tinted due-state cards**.
- [ ] **NFR-A11Y-02** · Must — Colour is never the only carrier of meaning (WCAG 1.4.1): type, due state and owner all have text or icon equivalents.
- [ ] **NFR-A11Y-03** · Must — Every feature is keyboard-operable: moving tasks, handoff, copy, anchors, modal. Tab order is logical: header → Anchor Board → columns left to right → cards top to bottom. No keyboard traps other than the modal focus trap, which Esc releases.
- [ ] **NFR-A11Y-04** · Must — Focus is always visible, using a `brand-primary` ring via `focus-visible`; `outline-none` is never used without a replacement.
- [ ] **NFR-A11Y-05** · Must — Semantic HTML: actions are `<button>`, navigation is `<a>`, every input has a `<label>`, each column is a `<section>` with an `<h2>`, and cards are list items within a list.
- [ ] **NFR-A11Y-06** · Must — Icon-only buttons have an `aria-label`; tooltips are never the only source of a label.
- [ ] **NFR-A11Y-07** · Must — Form errors use `aria-invalid` and `aria-describedby`; toasts are announced through the live region (FR-APP-05).
- [ ] **NFR-A11Y-08** · Should — If drag-and-drop exists, a single-pointer, non-drag alternative exists (WCAG 2.5.7) — satisfied by FR-M4-07.
- [x] **NFR-A11Y-09** · Should — `prefers-reduced-motion` disables the toast fade and any card transitions.
- [x] **NFR-A11Y-10** · Should — At 200% browser zoom on a 1280 px wide window, all content and functions remain usable (columns may scroll horizontally). Full 320 px reflow is out of scope per §12.
- [ ] **NFR-A11Y-11** · Should — Lighthouse Accessibility score ≥ 90 and zero critical issues in axe DevTools on the deployed build.

#### UI & visual design

- [ ] **NFR-UI-01** · Must — All colours come from Tailwind tokens defined from DESIGN.md §2. No default Tailwind blue as the brand colour, no inline hex in JSX.
- [ ] **NFR-UI-02** · Must — Typography follows DESIGN.md §3 (fonts and size scale). Web fonts load with `font-display: swap` and a system fallback stack.
- [ ] **NFR-UI-03** · Must — Cards, buttons, modal and empty states follow the DESIGN.md §4 component principles consistently.
- [ ] **NFR-UI-04** · Must — DESIGN.md §5 microcopy is used verbatim wherever it applies.
- [ ] **NFR-UI-05** · Must — Animation is limited to the 200 ms toast fade (DESIGN.md §7). Could: a card-move transition of 200 ms or less.
- [ ] **NFR-UI-06** · Must — The layout targets desktop viewports of 1280×720 and up, and stays usable (with horizontal scroll) down to 1024 px. Mobile is out of scope (§12).
- [ ] **NFR-UI-07** · Should — Every interactive element has distinct default, hover, focus, active and disabled states.
- [ ] **NFR-UI-08** · Should — Spacing follows a 4/8 px scale; border radius and border weight are consistent across components.
- [x] **NFR-UI-09** · Should — The destructive (delete) style is distinguishable from the `type-bug` colour, so a bug card never looks like a delete warning. Agreed: Delete is outlined/neutral; filled red appears only on the confirm button (§14.6 #2).
- [ ] **NFR-UI-10** · Should — Robust to real content: long titles clamp, long unbroken strings and URLs wrap or truncate, and a column with 30+ cards remains usable.

#### Performance

- [ ] **NFR-PERF-01** · Must — Opening the modal, moving a card and typing in fields respond in under 100 ms with 100 tasks on the board.
- [ ] **NFR-PERF-02** · Should — The deployed build loads in under 2 s on a typical connection; production JS is under 250 KB gzipped.
- [ ] **NFR-PERF-03** · Should — No visible layout shift on load (CLS < 0.1), including when fonts swap in.
- [ ] **NFR-PERF-04** · Should — New npm dependencies are added only when they save significant time (e.g. a drag-and-drop library); check bundle size impact first.

#### Reliability & data integrity

- [ ] **NFR-REL-01** · Must — No data loss on reload, tab close or browser restart.
- [x] **NFR-REL-02** · Must — A top-level React error boundary catches render errors and shows a friendly message with a "Reload" option instead of a white screen (Should: plus "Export my data").
- [ ] **NFR-REL-03** · Must — Zero console errors or warnings (including React `key` warnings) in dev and production.
- [x] **NFR-REL-04** · Should — If localStorage is full or unavailable (quota exceeded, private mode), the user sees a notice that changes may not be saved. The current `useLocalStorage` hook ignores this silently — update it to report the failure.
- [ ] **NFR-REL-05** · Must — The §5 data model is respected: no renamed or removed fields; additions are optional with defaults (see FR-DATA-01).

#### Security & privacy

- [ ] **NFR-SEC-01** · Must — User content is rendered as text through React's default escaping; no `dangerouslySetInnerHTML`. If Markdown rendering is ever added to the Context field, its output must be sanitised.
- [x] **NFR-SEC-02** · Must — Anchor URLs are restricted to `http`/`https` (FR-M11-05); all external links use `rel="noopener noreferrer"`.
- [ ] **NFR-SEC-03** · Must — No data leaves the browser: no analytics, tracking or third-party calls (web-font CDNs excepted). No secrets committed to the repo.
- [x] **NFR-SEC-04** · Should — Users are told that data lives unencrypted in this browser only (FR-M9-10, plus a footer note).

#### Compatibility

- [ ] **NFR-COMP-01** · Must — Works in the latest Chrome, Edge and Firefox on Windows and macOS. Should: latest Safari.
- [ ] **NFR-COMP-02** · Must — Works identically on `localhost` (dev) and the Vercel HTTPS deployment.
- [ ] **NFR-COMP-03** · Should — Keyboard shortcuts map Ctrl on Windows to Cmd on macOS.

#### Maintainability & code quality

- [x] **NFR-MAINT-01** · Must — `STAGES` and `TEAM` are imported everywhere they are needed; stage ids, labels and names are never duplicated as string literals.
- [x] **NFR-MAINT-02** · Must — Logic lives in pure helper functions: due state, date formatting, prompt serialisation, URL normalisation and data normalisation.
- [ ] **NFR-MAINT-03** · Must — `npm run build` succeeds before every milestone tag is pushed.
- [x] **NFR-MAINT-04** · Should — Once `App.jsx` passes roughly 300 lines, split it into components (`Board`, `Column`, `TaskCard`, `TaskModal`, `AnchorBoard`, `Toast`, `ConfirmDialog`) and helpers (`src/lib/`).
- [ ] **NFR-MAINT-05** · Should — Commit messages and the PRD stay current when behaviour changes. The Context field of the team's real tasks is kept up to date (feeds the Module 5 "Vibe Coding History" deliverable, §10).
- [x] **NFR-MAINT-06** · Could — Unit tests (Vitest) for the pure helpers in NFR-MAINT-02.

### 14.4 Data requirements

These requirements make the §5 data model concrete: where data is stored, what each field may contain, how it is validated, migrated, seeded and exported. The §5 shapes stay **locked**; nothing below renames or removes a field. Helpers named here (`normaliseTask`, `migrate`, …) are suggestions and fulfil NFR-MAINT-02.

#### 14.4.1 Storage layout

| Key | Contents | Shape | Priority |
|---|---|---|---|
| `vibetracker.tasks` | All tasks | `Task[]` (JSON) | Must |
| `vibetracker.anchors` | The four deliverable slots | `Anchor[]`, always length 4 (JSON) | Must |
| `vibetracker.team` | Team members (v3) | `Member[]`, at least one (JSON) | Must |
| `vibetracker.workspace` | Project name, team name, team lead (v3) | `Workspace` (JSON) | Must |
| `vibetracker.meta` | Storage metadata | `{ schemaVersion: number }` (JSON) | Should |
| `vibetracker.tasks.backup` / `vibetracker.anchors.backup` | Raw string of an unreadable value, kept for recovery | string | Should |
| `vibetracker.prefs` | Per-browser settings, never exported | `{ currentMemberId, lastSeen, theme, textSize, accent, motion, transparency, promptIncludesLinks, welcomeDismissed }` (JSON) | Should |

- [x] **DR-STO-01** · Must — All keys use the `vibetracker.` prefix so the app's data is easy to find, export and reset, and never collides with other apps on the same origin.
- [x] **DR-STO-02** · Must — Values are stored as JSON (UTF-8 text) via the `useLocalStorage` hook; no other storage mechanism (cookies, IndexedDB, sessionStorage) is used for app data.
- [x] **DR-STO-03** · Must — Tasks and anchors live under separate keys, so an anchor edit can never corrupt the task list and vice versa.
- [x] **DR-STO-04** · Must — State is updated immutably (new arrays and objects via the setter); stored data is never mutated in place.
- [x] **DR-STO-05** · Should — UI-only state (open modal, toast queue, hover, filters unless saved as prefs) is **not** persisted.

#### 14.4.2 Task field dictionary

| Field | Type | Required | Default on create | Validation / constraints | Set by | Editable |
|---|---|---|---|---|---|---|
| `id` | string | Yes | `crypto.randomUUID()` (fallback `Date.now()` string) | Unique across all tasks; non-empty | System | Never |
| `title` | string | Yes | — (user must enter) | Trimmed; 1–120 chars; single line (newlines stripped) | User | Yes |
| `description` | string | Yes (may be `''`) | `''` | 0–2,000 chars; line breaks preserved | User | Yes |
| `type` | `'feature' \| 'bug'` | Yes | `'feature'` | Must be one of the two values | User | Yes |
| `status` | `'todo' \| 'in-progress' \| 'review' \| 'done'` | Yes | `'todo'`, or the column's id when created from a column "+" | Must be a `STAGES` id | User | Yes |
| `assignee` | string | Yes | Last-used assignee, else `TEAM[0]` | Should be a `TEAM` name; other values are tolerated (see DR-INT-05) | User | Yes |
| `dueDate` | string \| null | Yes (may be `null`) | `null` | `YYYY-MM-DD`, a real calendar date; an empty input is stored as `null`, never `''` | User | Yes |
| `createdDate` | string | Yes | Today, **local** date, `YYYY-MM-DD` | Valid date, not in the future | System | Never |
| `context` | string | Yes (may be `''`) | `''` | Stored verbatim (no trimming, no length cap; soft warning > 20,000 chars per FR-M9-11) | User | Yes |
| `contextTool` | `'Claude' \| 'ChatGPT' \| 'Cursor' \| 'Lovable' \| 'Replit' \| 'Other' \| null` | Yes (may be `null`) | `null` | One of the listed values or `null` | User | Yes |
| `contextUpdatedAt` | string \| null | Yes (may be `null`) | `null` | Full ISO 8601 timestamp (`new Date().toISOString()`, UTC) | System (FR-M9-04) | Never directly |

- [x] **DR-TASK-01** · Must — A task is saved only if it satisfies every *Required* and *Validation* rule in the table above; invalid input is blocked in the modal with an inline error (FR-M5-04), never silently fixed.
- [x] **DR-TASK-02** · Must — `id` and `createdDate` never change after creation — not on edit, move, handoff, import or migration.
- [x] **DR-TASK-03** · Must — Dates follow two deliberate formats: **date-only** fields (`dueDate`, `createdDate`) are local calendar dates as `YYYY-MM-DD`; the **timestamp** field (`contextUpdatedAt`) is UTC ISO 8601 and is converted to local time only for display.
- [x] **DR-TASK-04** · Must — Text fields accept the full Unicode range, including emoji, umlauts and code snippets, and round-trip through storage unchanged.
- [x] **DR-TASK-05** · Must — Values for `type`, `status` and `contextTool` come from single shared constants (`STAGES`, plus new `TYPES` / `CONTEXT_TOOLS` arrays), never from string literals scattered through the UI.

#### 14.4.3 Anchor field dictionary

| Field | Type | Required | Default | Validation / constraints | Editable |
|---|---|---|---|---|---|
| `id` | `'presentation' \| 'demo' \| 'report' \| 'documentation'` | Yes | Fixed per slot | Exactly these four, each exactly once | Never |
| `label` | string | Yes | `'Presentation'`, `'Demo'`, `'Report'`, `'Documentation'` | Fixed display text matching the id | Never (Could: editable) |
| `url` | string \| null | Yes (may be `null`) | `null` | Absolute `http`/`https` URL, ≤ 2,048 chars, normalised per FR-M11-05; empty input stored as `null` | Yes |

- [x] **DR-ANC-01** · Must — The stored anchors array always holds exactly four entries in the fixed order above; a default array is defined as a single constant (e.g. `DEFAULT_ANCHORS`).
- [x] **DR-ANC-02** · Must — Only normalised URLs are stored: whitespace trimmed, `https://` prepended if the scheme is missing, anything other than `http`/`https` rejected before save.

#### 14.4.4 Integrity & normalisation on load

Every value read from localStorage (or imported) passes through `normaliseTasks` / `normaliseAnchors` before reaching React state. The rules extend FR-DATA-01/02.

- [x] **DR-INT-01** · Must — If the stored value is not valid JSON, or is not an array, the raw string is copied to its `.backup` key (DR-STO table), the app starts from a safe state and shows a non-blocking notice.
- [x] **DR-INT-02** · Must — Array entries that are not objects, or that lack a usable `title`, are dropped (and the drop is counted in the notice).
- [x] **DR-INT-03** · Must — Missing or invalid fields are replaced with the defaults from §14.4.2: unknown `status` → `'todo'`, unknown `type` → `'feature'`, missing context fields → `''` / `null` / `null`, malformed `dueDate` → `null`, missing `createdDate` → today.
- [x] **DR-INT-04** · Must — Duplicate `id`s are resolved by keeping the first task and generating a fresh `id` for each later duplicate — no task is lost.
- [x] **DR-INT-05** · Must — An `assignee` not in `TEAM` is **kept as stored** (so no data is destroyed when a name is corrected) and shown in the UI as "Unassigned" until reassigned (FR-M7-05).
- [x] **DR-INT-06** · Must — Anchors are rebuilt into the fixed four slots: missing slots restored from `DEFAULT_ANCHORS`, unknown ids and extra entries dropped, invalid URLs set to `null`.
- [x] **DR-INT-07** · Should — Unknown extra fields on a task (e.g. added by the M12 secret sauce or a teammate's newer build) are preserved, not stripped, so data survives round-trips between versions.
- [x] **DR-INT-08** · Should — Normalisation is idempotent: running it twice gives the same result as running it once.

#### 14.4.5 Derived data (computed, never stored)

The following are calculated from stored fields on every render and must **not** be written to localStorage, so they can never go stale:

| Derived value | Computed from | Used by |
|---|---|---|
| Due state (`done` / `overdue` / `warning` / `safe` / `none`) | `status`, `dueDate`, today | FR-M8-01 |
| Relative due label ("Due tomorrow") | `dueDate`, today | FR-M8-02 |
| Column task counts | `status` | FR-M4-09 |
| Overdue count | due state | FR-M8-08 |
| "Has context" indicator | `context.trim() !== ''` | FR-M9-06 |
| Stale-context flag | `contextUpdatedAt`, `status`, now | FR-M9-12 |
| Relative "Updated 2 h ago" | `contextUpdatedAt`, now | FR-M9-05 |
| Anchor progress ("2 of 4") | `anchors[].url` | FR-M11-07 |
| Prompt text | the whole task | FR-M10-02 |
| Card sort order | `dueDate`, `createdDate` | FR-M4-11 |

- [x] **DR-DER-01** · Must — None of the values above are persisted; each is produced by a pure helper (e.g. `getDueState(task, today)`), which takes "today"/"now" as a parameter so it can be tested with fixed dates.

#### 14.4.6 Data lifecycle (CRUD rules)

| Operation | Fields written | Notes |
|---|---|---|
| Create | All fields; `id`, `createdDate` generated; context fields defaulted | Appended to the array; persisted immediately |
| Edit | User-editable fields only | `contextUpdatedAt` refreshed only if `context`/`contextTool` changed (FR-M9-04) |
| Move stage | `status` only | No other field changes |
| Hand off | `assignee` only | No other field changes |
| Delete | Removes the task from the array | Hard delete; an Undo (FR-M5-14) keeps a copy in memory only, for 5 s |
| Edit anchor | `url` only | `id` and `label` never change |
| Reset board | Restores `[]` tasks and `DEFAULT_ANCHORS`, removes `.backup` keys | Confirmation required (FR-M13-05) |
| Load demo data | Replaces tasks and anchors | Confirmation required (FR-M13-03) |

- [x] **DR-LIFE-01** · Must — Each operation writes **only** the fields listed above; e.g. a handoff can never accidentally change `status` or wipe `context`.
- [x] **DR-LIFE-02** · Must — Every operation is persisted in the same interaction that performs it (FR-M5-18); there is no "unsaved board" state.
- [x] **DR-LIFE-03** · Should — The model has no `updatedAt` or history fields (§5 is locked). If the M12 secret sauce needs history (e.g. a stage-change log), it is added as a new optional field with a default, per NFR-REL-05.

#### 14.4.7 Schema versioning & migration

- [x] **DR-MIG-01** · Should — `vibetracker.meta.schemaVersion` records the data version. **v0** = tasks without context fields (pre-M9); **v1** = full §5 model; **v2** = adds `contextHistory` (M12); **v3** = team and workspace in storage, `assignee` is a member id (§15); **v4** = `createdBy`, `updatedBy`, `updatedAt`, `activity` on tasks (§15).
- [x] **DR-MIG-02** · Must — On load, a single `migrate(data, fromVersion)` step upgrades older data before normalisation. Missing `meta` is treated as v0.
- [x] **DR-MIG-03** · Must — Migrations are additive only (new fields with defaults) and idempotent; they never delete user content.
- [x] **DR-MIG-04** · Should — Data with a `schemaVersion` **newer** than the running app is not overwritten; the app shows a read-only notice ("This board was saved by a newer version").

#### 14.4.8 Seed & demo data

- [x] **DR-SEED-01** · Must — Seed tasks (FR-M4-03) live in one constant (e.g. `SEED_TASKS`) and pass every validation rule in §14.4.2.
- [x] **DR-SEED-02** · Must — Seed and demo dates are generated **relative to today** at load time (e.g. `addDays(today, -2)`), never hard-coded calendar dates.
- [x] **DR-SEED-03** · Must — The demo dataset (FR-M13-01) lives in its own module (e.g. `src/data/demo.js`) and covers every enum value: both types, all four stages, all three teammates, all five due states, at least three `contextTool` values.
- [x] **DR-SEED-04** · Must — Demo content is realistic (real hackathon tasks and curated context) but contains no secrets, passwords or personal data beyond teammate names.
- [x] **DR-SEED-05** · Should — Placeholder anchor URLs in demo data point to real team deliverables, or are clearly marked placeholders (`https://example.com/...`) that are replaced before the pitch.

#### 14.4.9 Export & import format

Applies to FR-DATA-04 / FR-DATA-05.

```json
{
  "app": "vibetracker",
  "schemaVersion": 3,
  "exportedAt": "2026-10-20T14:32:00.000Z",
  "workspace": { /* project name, team name, team lead */ },
  "team": [ /* Member objects */ ],
  "tasks": [ /* Task objects exactly as stored */ ],
  "anchors": [ /* the four Anchor objects */ ]
}
```

- [x] **DR-EXP-01** · Should — Export downloads a pretty-printed UTF-8 JSON file named `vibetracker-YYYY-MM-DD.json` in the format above, containing tasks and anchors exactly as stored.
- [x] **DR-EXP-02** · Should — Export never includes `vibetracker.prefs` or `.backup` keys.
- [x] **DR-IMP-01** · Could — Import accepts only files whose `app` is `"vibetracker"` and whose `schemaVersion` is less than or equal to the current version; anything else is rejected with a plain-language error.
- [x] **DR-IMP-02** · Could — Imported data goes through `migrate` and the §14.4.4 normalisation before use.
- [x] **DR-IMP-03** · Could — Before replacing data, the confirm dialog shows what will change ("Replace 7 tasks with 12 tasks?"), and the current data is offered as an export first.

#### 14.4.10 Volume & capacity

- [ ] **DR-CAP-01** · Must — The app is designed for up to **200 tasks** with contexts of up to **20,000 characters** each, while meeting NFR-PERF-01.
- [x] **DR-CAP-02** · Should — The serialised size of all `vibetracker.*` keys is estimated on save (string length × 2 bytes); above roughly 4 MB of the ~5 MB browser limit, the user sees a warning suggesting export and trimming old contexts.
- [x] **DR-CAP-03** · Must — A failed write (quota exceeded) is reported to the user (NFR-REL-04) and in-memory state is kept, so nothing typed is lost before they can export.

#### 14.4.11 Privacy & retention

- [ ] **DR-PRIV-01** · Must — All data stays in the user's browser on the user's device; nothing is transmitted (NFR-SEC-03).
- [x] **DR-PRIV-02** · Must — The only personal data stored is the three teammate names. Users are reminded not to store secrets in Context (FR-M9-10).
- [ ] **DR-PRIV-03** · Must — Data is retained until the user resets the board or clears site data; Reset (FR-M13-05) removes every `vibetracker.*` key except `prefs` (Should: offer to clear `prefs` too).
- [x] **DR-PRIV-04** · Should — A short footer note explains where data lives: "Saved in this browser only. Export to share or back up."

### 14.5 Verification checklist (run before every tag from M4 onward)

- [ ] `npm run build` passes with no errors.
- [ ] Reload the page — every change from this milestone is still there.
- [ ] Walk the §4 primary flow **keyboard-only** — nothing is unreachable.
- [ ] DevTools console shows zero errors and warnings.
- [ ] DevTools → Application → Local Storage: the `vibetracker.*` values match the §14.4 field dictionaries (no `undefined`, no `''` where `null` is expected, no stored derived values).
- [ ] Every *Must* from earlier milestones still works (regression check).
- [ ] After M3: the Vercel deployment has updated and behaves the same as local.

### 14.6 Assumptions, decisions & open questions

| # | Item | Decision / default assumption | Status |
|---|---|---|---|
| 1 | Due-state gap in DESIGN.md §2 (24 h – 2 days) | "Tomorrow" counts as *Warning* (see M8 table) | **Agreed** — reflect in DESIGN.md §2 during M3 |
| 2 | `type-bug` red vs. destructive delete red | Delete uses an outlined/neutral style; filled red only on the confirm button | **Agreed** — reflect in DESIGN.md §4 during M3 |
| 3 | Drag-and-drop vs. status dropdown | No drag-and-drop. A stage dropdown and ← / → buttons move tasks | **Decided** in M3 (DESIGN.md §4.5) |
| 4 | localStorage is per-browser, per-device | A handoff is visible only on the machine where it was made; JSON export/import (FR-DATA-04/05, §14.4.9) is the workaround | **Agreed** |
| 5 | Should Copy-as-Prompt include anchor links? | No (FR-M10-10 is a *Could*) | Open — decide in M10 |
| 6 | Time pressure (≈3 h build window) | All *Must* items in milestone order, then *Should* items | Ongoing |
| 7 | Login without a backend | One click on a profile logs in; no passwords. The profile is remembered per browser until "Log out" | **Decided** by the client (§15, round 2) |
| 8 | Renamed team members | `assignee` stores a member id (schema v3), so a rename keeps every task | **Decided** (§15) |
| 9 | Mobile | Layout reflows to 320 px (WCAG 1.4.10), because accessibility is a top priority | **Decided** (§15) |
| 10 | Should Copy-as-Prompt include anchor links? | Optional, off by default (Settings → Project & team) | **Closes #5** |

### 14.7 Traceability — milestone → requirements

| Milestone | Functional | Data | Key non-functional |
|---|---|---|---|
| M4 `data-model` | FR-APP-01…05, FR-M4-01…13, FR-DATA-01…02 | DR-STO-01…05, DR-TASK-01…05, DR-INT-01…08, DR-SEED-01…02, DR-DER-01 | NFR-REL-01, NFR-A11Y-05, NFR-MAINT-01 |
| M5 `crud-modal` | FR-M5-01…19, FR-APP-06 | DR-LIFE-01…02, DR-CAP-03 | NFR-USE-03, NFR-USE-05, NFR-A11Y-03/04/07 |
| M6 `tag-style` | FR-M6-01…05 | DR-TASK-05 | NFR-A11Y-01/02, NFR-UI-01, NFR-UI-09 |
| M7 `task-owner` | FR-M7-01…08 | DR-INT-05, DR-LIFE-01 | NFR-USE-11, NFR-A11Y-02 |
| M8 `due-tint` | FR-M8-01…08 | DR-TASK-03, DR-DER-01 | NFR-A11Y-01/02, NFR-USE-02 |
| M9 `context` | FR-M9-01…12 | DR-MIG-01…04, DR-CAP-01…02, DR-PRIV-02 | NFR-SEC-01, NFR-SEC-04, NFR-REL-05 |
| M10 `copy-prompt` | FR-M10-01…10 | DR-DER-01 | NFR-COMP-02, NFR-MAINT-02 |
| M11 `anchors` | FR-M11-01…09 | DR-ANC-01…02, DR-INT-06 | NFR-SEC-02, NFR-UI-06 |
| M12 `secret-sauce` | FR-M12-01…05 | DR-INT-07, DR-LIFE-03 | All |
| M13 `pitch-ready` | FR-M13-01…05, FR-DATA-04…05 | DR-SEED-03…05, DR-EXP-01…02, DR-IMP-01…03, DR-PRIV-01…04 | NFR-REL-03, NFR-USE-13, NFR-A11Y-11 |

## 15. Client Q&A — refinement round

The client answered our open questions after the 13 milestones. This table shows each answer and what changed.

| Client answer | What Slopify does now |
|---|---|
| Extra features are "secret sauce" — finish the core milestones first | Open core items done first: Export / Import, Load demo data, Reset board, Undo delete, two-tab sync, read-only guard for newer data, storage meter |
| One project for one team first | One workspace: project name + team name, editable in Settings |
| Adding members to the team is needed | Settings → Project & team: add, edit and remove members; removing a member hands their tasks to someone else |
| Store name and email; teams are small | `Member` = name, optional email (shown as a "Contact" link; nothing is sent), optional role. Built for about 1–15 people |
| Target audience: SWE, architect, senior / junior developer, UX, database | A role per member; the copied prompt names the owner's role so the AI can pitch its answer; a Help dialog for new and junior members |
| Any fonts / themes | The glass style stays; a dark theme and "match system" were added |
| Accessibility is important — in design and in code | Text size 100 / 115 / 130 %, dark theme, reduce motion, reduce transparency, reflow to 320 px, skip link, card shortcuts, screen-reader card summaries, focus management, axe-core checks in both themes |
| Accent: sensible default, user-definable as a bonus | Teal by default; Ocean, Graphite, Cocoa or a custom colour. Custom colours are adjusted until they pass WCAG AA |
| Any popular web framework | React + Vite + Tailwind stay. Vitest added for the pure helpers (`npm test`) |
| Security not important; login needed (without a backend) | **One-click log-in, no passwords** (round 2, below) |
| Deployment needed for submission | Handled by the team; `npm run build` stays green |

### 15.1 Round 2 — features the app needs to function

The client asked for a working log-in (no passwords) and the features a shared tracker needs once there are real users.

- **Log-in screen.** Every profile is one button: one click logs in. "Add a new profile" creates a member and logs in. The choice is remembered in this browser (`prefs.currentMemberId`) until "Log out". A removed profile, or an import without your name, returns to the log-in screen.
- **Profile menu** in the header: Edit my profile · Log out or switch profile.
- **"You" is the logged-in profile.** "My tasks", "(you)" in the owner filter, the default owner of new tasks and the hand-off toast all follow it. You cannot remove yourself; the team lead stays a badge and cannot be removed either.
- **Attribution (schema v4).** Each task records who created it and who changed it last; the task modal shows "Created by … · last change by …, 2 h ago".
- **Activity log.** Each move, handoff, edit, context update, creation and undo-restore is recorded with the profile and time (max 50 per task), shown under "Activity" in the task modal.
- **"Handed to you" notice.** At log-in, a toast says how many tasks someone else handed to you since your last visit, with "Show my tasks".
- **Data tools respect log-in.** Load demo data logs you in as the demo's team lead; Import keeps you logged in when the file has a profile with your name; Delete all data returns to the log-in screen.

---

*PRD version: hackathon-starter v1 + client Q&A refinement · maintained by Prof. Dr. Ignacio Alvarez*
 