# Slopify — Product Requirements Document

**Status:** current product, schema v4 · last updated 2026-10-28 · all 13 hackathon milestone tags pushed, plus the client Q&A refinement (§15).

| Document | What it holds |
|---|---|
| **PRD.md** (this file) | Why Slopify exists, who it is for, what it does, the data model, decisions, scope and known issues. |
| [REQUIREMENTS.md](REQUIREMENTS.md) | Every functional and non-functional requirement, feature by feature, with justification, implementation, verification and status. |
| [DESIGN.md](DESIGN.md) | Visual rules: tokens, typography, components, microcopy. |
| [README.md](README.md) | The hackathon brief, milestone workflow and quick start. |

---

## 1. Problem

Vibecoding teams have two recurring pains with large projects:

1. **They lose track of tasks.** Three teammates, a hundred small things, no shared view. Nothing tells them what state each task is actually in.
2. **They lose track of prompts.** The AI gave them working code two days ago, but no one remembers the prompt that produced it. When they need to iterate, they start from scratch.

A spreadsheet doesn't solve this. A real project tool (Linear, Jira, Notion) is overkill, doesn't know about prompts, and takes hours to set up.

## 2. Target users

- **Primary:** small vibecoding teams (about 1–15 people, client Q&A) working on one project. Our own team uses it for the rest of the semester.
- **Roles we design for** (client Q&A): software engineers, architects, senior developers, junior developers, UX designers and database engineers. Each member can carry a role. The role appears in the copied prompt, so an AI tool can pitch its answer at the right level.
- **Secondary:** future cohorts of vibecoders taking the same class.
- **Accessibility** is a first-class requirement, not an extra (client Q&A). Users may rely on keyboard only, screen readers, larger text, reduced motion, high contrast, or small screens and high zoom.

We are designing the tool we ourselves use. The pitch demo is also our first real user test.

## 3. Product overview

Slopify is a single-page web app with no backend. Everything lives in the browser (§6).

| Surface | What it does | Requirements |
|---|---|---|
| **Log-in screen** | Lists every team profile; one click logs in, no password. "Add a new profile" creates a member. | REQUIREMENTS §2 |
| **Header** | Wordmark, project and team, search, Add task, profile menu, Settings, Help; the filter row (My tasks, owner, type, overdue count). | §1, §14 |
| **Anchor Board** | Four pinned deliverable links: Presentation, Demo, Report, Documentation. | §12 |
| **Kanban board** | Four stages. Cards show type, due state, owner, context and prompt versions, and can be moved, handed off and copied in place. | §4–§8 |
| **Task modal** | Create and edit; context field with template; prompt history; prompt preview; attribution and activity log. | §5, §9–§11, §13 |
| **Settings** | Project & team · Accessibility & appearance · Data (export, import, demo, reset, storage). | §3, §15, §17 |
| **Help** | How to read a card, every shortcut, how profiles and data work. | §16 |

Each task carries the prompt context that produced it, so any teammate can click one button and copy the task and its context into an AI chat to continue.

## 4. Primary user flows

1. **Log in.** Open Slopify and click your profile. A toast says how many tasks were handed to you since your last visit.
2. **Add a task.** Click "Add task" (or press `N`). Fill in the title (required), then optionally type, stage, owner (you by default), due date, context and tool. Press Enter.
3. **Work the board.** Move the card with its stage list, the ← / → buttons, or `[` / `]`. The due tint warns before the deadline.
4. **Continue with AI.** Click the copy icon on the card (or press `C`) and paste the prompt into Claude, ChatGPT or Cursor. Update the Context afterwards; Slopify keeps every earlier version.
5. **Hand off.** Choose a teammate in "Hand off to…" on the card. Undo is in the toast, and the hand-off is recorded in the activity log.
6. **Pin deliverables.** Paste links into the Anchor Board as they are produced.
7. **Share the board.** Data lives in one browser, so export the board (footer → Export) and send the file; a teammate imports it.
8. **Switch person.** Profile menu → "Log out or switch profile" → click another profile.

## 5. Data model

Schema **v4**. Field rules are in REQUIREMENTS §21; migrations in REQUIREMENTS §18.

> **History of changes.** v1 = hackathon model · v2 adds `contextHistory` (M12) · v3 moves the team into storage, so `assignee` holds a member id (client Q&A, D8) · v4 adds attribution and activity (client round 2). Each upgrade runs automatically and loses no data.

```js
// A single vibecoding task.
Task = {
  id: string,                    // uuid
  title: string,                 // 1–120 chars
  description: string,           // ≤ 2,000 chars
  type: 'feature' | 'bug',
  status: 'todo' | 'in-progress' | 'review' | 'done',
  assignee: string | null,       // a Member id; null = Unassigned
  dueDate: string | null,        // local date 'YYYY-MM-DD'
  createdDate: string,           // local date 'YYYY-MM-DD'

  context: string,               // curated briefing for the next AI / teammate
  contextTool: 'Claude' | 'ChatGPT' | 'Cursor' | 'Lovable' | 'Replit' | 'Other' | null,
  contextUpdatedAt: string|null, // ISO timestamp, set when context or tool changes

  contextHistory: Array<{        // earlier context versions, newest first, max 20
    context: string,
    contextTool: string | null,
    savedAt: string | null,
  }>,

  createdBy: string | null,      // Member id
  updatedBy: string | null,      // Member id of the last change
  updatedAt: string | null,      // ISO timestamp of the last change
  activity: Array<{              // who did what, newest first, max 50
    at: string,
    by: string | null,
    type: 'created' | 'moved' | 'handoff' | 'edited' | 'context' | 'restored',
    from?: string | null,        // stage id (moved) or Member id (handoff)
    to?: string | null,
  }>,
}

// One of four pinned deliverable slots.
Anchor = {
  id: 'presentation' | 'demo' | 'report' | 'documentation',
  label: string,
  url: string | null,            // http(s) only
}

// One team member.
Member = {
  id: string,
  name: string,                  // 1–40 chars, unique ignoring case
  email: string | null,          // for contact only; Slopify never sends email
  role: 'swe' | 'architect' | 'senior' | 'junior' | 'ux' | 'database' | 'other' | null,
  createdAt: string | null,
}

// The one project and its one team.
Workspace = {
  projectName: string,
  teamName: string,
  leadId: string | null,         // the team lead badge (log-in is separate, §15.1)
}
```

**Storage keys:** `vibetracker.tasks`, `.anchors`, `.team`, `.workspace`, `.prefs` (per browser: logged-in profile, theme, text size, accent …), `.meta` (`{ schemaVersion: 4 }`), and `<key>.backup` for damaged values.

## 6. Tech stack and architecture

| Layer | Choice | Why |
|---|---|---|
| Framework | React 18 via Vite 5 | The scaffold's choice; the client accepts any popular framework (Q&A). |
| Styling | Tailwind 3, with colour tokens as CSS variables (`src/index.css`) | One class name works in light and dark themes and with any accent. |
| Icons | lucide-react | One consistent icon set (DESIGN.md §4.15). |
| State | React state + `useLocalStorage` hook + one context (`src/context/AppData.jsx`) | Simple; no state library needed at this size. |
| Persistence | **localStorage only** | Zero infrastructure. No backend during the hackathon (decision kept). |
| Tests | Vitest (dev only) | Tests the pure helpers in `src/lib` (11 files, 67 tests). |
| Deploy | Vercel | One-click deploy from GitHub (done by the team). |

**Code map.** `src/lib/` holds pure logic: dates, tasks, team, activity, history, prompt, anchors, schema, transfer, colour, prefs. `src/components/` holds the UI (`settings/` for the Settings tabs). `src/context/AppData.jsx` holds all stored state. `src/data/demo.js` holds the demo board. `src/main.jsx` runs migrations and applies the theme before the first render.

**Production size:** 85 KB gzipped JS and 6.7 KB CSS. Runtime dependencies: `react`, `react-dom`, `lucide-react`.

## 7. Stage names

Four columns, in this order, with these exact labels in the UI:

1. **To Do**
2. **In Progress**
3. **Review**
4. **Done**

## 8. Team

**The hackathon team** (fill in before submission):

| Slot | Name | GitHub handle |
|---|---|---|
| Teammate A | `<TODO>` | `<TODO>` |
| Teammate B | `<TODO>` | `<TODO>` |
| Teammate C | `<TODO>` | `<TODO>` |

**The team inside the app** is data, not code. Add, edit and remove members (name, optional email, optional role) in **Settings → Project & team**. One member carries the **Team lead** badge. A new browser starts with three placeholder members; rename them. Removing a member hands their tasks to someone you choose. You cannot remove yourself or the lead.

## 9. Milestones

| # | Tag | Title | Status |
|---|---|---|---|
| 1 | `git-linked` | Repo registered | ✅ tagged |
| 2 | `prd-done` | PRD reviewed | ✅ tagged |
| 3 | `design-done` | Design system (DESIGN.md) | ✅ tagged |
| 4 | `data-model` | Task model + board view | ✅ tagged |
| 5 | `crud-modal` | Add / edit / delete modal | ✅ tagged |
| 6 | `tag-style` | Feature / bug colours | ✅ tagged |
| 7 | `task-owner` | Owner + hand-off | ✅ tagged |
| 8 | `due-tint` | Due-date tints | ✅ tagged |
| 9 | `context` | Context field | ✅ tagged |
| 10 | `copy-prompt` | Copy as Prompt Context | ✅ tagged |
| 11 | `project-deliverables` | Deliverable Anchor Board | ✅ tagged |
| 12 | `secret-sauce` | Prompt history timeline | ✅ tagged |
| 13 | `pitch-ready` | Demo data + pitch | ✅ tagged |
| — | — | Client Q&A refinement and round 2 (§15) | ✅ on branch `refine/qa-feedback` |

## 10. AI / vibe coding angle

Where AI was used heavily:

- Scaffolding the board and the modal (M4, M5).
- The Markdown serialisation helper for the Context field (M9, M10).
- The refinement round: data migrations, the accessibility pass, tests.

Where AI does **not** save time:

- Reviewing this PRD: read it yourself.
- Design taste (DESIGN.md): yours, not the model's.
- The secret sauce: the point is that AI can't predict it.
- The pitch: write the script in your own voice.

Keep the Context field of each real task up to date as you work. Those curated context blocks, and their prompt history, become part of the Module 5 "Vibe Coding History" deliverable.

## 11. Team identity

- **Team name:** `<TODO>`
- **Product name:** Slopify
- **Tagline:** Track the task. Keep the context.
- **Tracker URL after deploy:** `<TODO>`

### Secret sauce (M12): Prompt history timeline

**The problem.** A prompt is never written once. The team rewrites a task's context many times, and the version that worked on Tuesday is gone by Thursday. When a new prompt sends the AI the wrong way, nobody can get the good one back. This is pain #2 from §1, one level deeper.

**What Slopify does.** Every time a task's context or tool changes, Slopify keeps the previous version. The edit modal shows a **Prompt history** timeline: each version with its number, its age and the AI tool it was written for. A teammate can:

- **Show** any version to read it.
- **Copy** any version as a full "Copy as Prompt Context" prompt, to go back to an approach that worked.
- **Restore** any version into the Context field. Saving keeps the current text in the history too, so nothing is ever lost.

On the board, each card shows how many versions its prompt has (for example "Claude · v4"), so the team can see which tasks needed the most iteration.

**Why it is ours.** Linear, Jira and Notion track task history. Slopify tracks *prompt* history. It turns the Context field from a note into a record of how the team and the AI found the answer, which also feeds the Module 5 deliverable (§10).

**Limits.** The newest 20 earlier versions per task are kept, to protect the browser storage limit.

### The prompt template

"Copy as Prompt Context" produces this Markdown (REQUIREMENTS FR-M10-02). Empty lines and sections are left out.

```markdown
# Task: {title}

- **Project:** {project name}
- **Type:** {Feature | Bug}
- **Status:** {To Do | In Progress | Review | Done}
- **Owner:** {name} ({role})
- **Due:** {YYYY-MM-DD} ({Due tomorrow})
- **Context last updated:** {YYYY-MM-DD HH:mm} via {tool}

## Description
{description}

## Context
{context, with its headings moved one level down — or "No context recorded yet."}

## Deliverable links          ← only when switched on in Settings
- Presentation: {url}

## What I need from you
Continue this task from where the context leaves off. Ask before changing anything outside its scope.
```

## 12. Scope

**In scope:**

- Everything in REQUIREMENTS.md.
- Layouts from 320 px wide (phone, high zoom) to large desktops.
- Light and dark themes.
- One-click profile log-in.

**Out of scope (do not build):**

- **Passwords and real authentication.** Log-in is one click on a profile, with no password (client decision). Without a server, a password would protect nothing (D11).
- **A backend, shared database or real-time collaboration.** Boards move between people as exported files.
- **Multiple projects or multiple teams** ("one project for one team first").
- **Real GitHub integration.**
- **Drag-and-drop** (D3).
- **Deployment and submission write-up:** done by the team.

## 13. Definition of done

The product is done for submission when:

- All 13 milestone tags are pushed and visible on the dashboard. ✅
- `npm run build` and `npm test` pass. ✅
- REQUIREMENTS.md has no open *Must* except team tasks (FR-M13-04: rehearse on the deployed build).
- The deployed board loads without console errors, and "Copy as Prompt Context" works there.
- The 5-minute pitch is rehearsed on the deployed build.

## 14. Requirements

### 14.1 User-centred guiding principles

These principles break ties whenever a requirement is ambiguous. REQUIREMENTS.md cites them as PR1–PR7.

1. **The board is home.** Every action is reachable in two clicks or fewer from the board.
2. **Recognition over recall.** A card shows its type, owner, due state and whether it has context, without opening the modal.
3. **Never lose work.** Every change saves immediately; every destructive action asks first or can be undone.
4. **Keyboard and mouse are equal citizens.** Anything you can click, you can do from the keyboard.
5. **Colour is never the only signal.** Every colour cue is paired with text or an icon.
6. **Instant feedback.** Every action produces a visible response within 100 ms.
7. **Speak like the team.** Microcopy comes from DESIGN.md §5, written for a tired user at 11 pm.

### 14.2 Where the requirements live

The full requirement list, with each requirement's justification, implementing files, verification method and status, is in **[REQUIREMENTS.md](REQUIREMENTS.md)**. It replaces the former sections 14.2 (functional), 14.3 (non-functional), 14.4 (data), 14.5 (checklist) and 14.7 (traceability). All requirement IDs were kept, because the source code cites them.

**Summary (2026-10-28):** 318 requirements.

| Status | Count | Notes |
|---|---|---|
| ✅ Met | 306 | |
| ◐ Partly met | 7 | Five need the deployed build or more browsers: FR-M10-05, NFR-COMP-01, NFR-COMP-02, NFR-A11Y-11, NFR-PERF-02. The other two: NFR-USE-11 (time-on-task needs real users) and DR-CAP-01 (200-task speed, §16). |
| ○ Open | 2 | Team tasks: FR-M13-04 (rehearse on the deployed build), NFR-USE-13 (hallway test). |
| ⤳ Replaced | 3 | |

### 14.6 Assumptions and decisions

| # | Item | Decision | Justification | Status |
|---|---|---|---|---|
| 1 | Due-state gap (24 h – 2 days) | "Tomorrow" counts as *Warning*. | `dueDate` has no time, so "less than 24 h" cannot be computed; warning one day early is the safer error. | Agreed |
| 2 | Bug colour vs. destructive red | Delete is outlined and neutral; filled red appears only on the confirm button. | A bug card must not look like an error or a delete warning (one hue = one meaning). | Agreed |
| 3 | Drag-and-drop | Not built. The stage list, ← / → buttons and `[` / `]` move cards. | WCAG 2.5.7 needs a non-drag path anyway; no extra library (NFR-PERF-04). | Decided |
| 4 | localStorage is per browser | Boards move as exported JSON files; import validates and migrates them. | No backend is allowed in scope (§12). | Agreed |
| 5 | Anchor links in the prompt? | Optional, off by default (Settings → Project & team). | Some prompts need the links, most don't; off by default keeps prompts short. | Closed (see 10) |
| 6 | Time pressure | All *Must* items first, then *Should*. | Hackathon brief. | Done |
| 7 | Log-in without a backend | One click on a profile logs in, with no password; remembered per browser until log-out. | Client: login needed, security not important, no passwords (Q&A, round 2). | Decided by client |
| 8 | Renamed team members | `assignee` stores a member id (schema v3), with a lossless migration from names. | A name change must not orphan tasks; the team is now editable (Q&A). | Decided |
| 9 | Mobile | The layout reflows to 320 px. | WCAG 1.4.10 at 200–400 % zoom; the client rated accessibility as very important. | Decided |
| 10 | Copy-as-Prompt with anchor links | Setting, off by default. | See 5. | Decided |
| 11 | Is the log-in a security feature? | No. It sets *who you are*, not *what you may do*; the log-in screen says so. | Data is unencrypted in the same browser; a password would give false security. | Decided |
| 12 | Size of the activity log | 50 entries per task, 20 prompt versions per task. | Keeps a 200-task board well under the ~5 MB limit (0.9 MB measured with 2,000-character contexts). | Decided |
| 13 | Performance at 200 tasks | Accepted as partly met (move: 88 ms median, 128 ms worst). Memoising cards is the fix if boards grow. | The 100-task target is met with room (42 ms); real boards are smaller. | Open (§16) |

## 15. Client Q&A — refinement round

The client answered our open questions after the 13 milestones. This table shows each answer and what changed.

| Client answer | What Slopify does now |
|---|---|
| Extra features are "secret sauce": finish the core milestones first | Open core items done first: Export / Import, Load demo data, Reset board, Undo delete, two-tab sync, a read-only guard for newer data, a storage meter |
| One project for one team first | One workspace: project name and team name, editable in Settings |
| Adding members to the team is needed | Settings → Project & team: add, edit and remove members; removing a member hands their tasks to someone else |
| Store name and email; teams are small | `Member` = name, optional email (a "Contact" link; nothing is sent), optional role. Built for about 1–15 people |
| Target audience: SWE, architect, senior / junior developer, UX, database | A role per member; the copied prompt names the owner's role so the AI can pitch its answer; a Help dialog for new and junior members |
| Any fonts / themes | The glass style stays; a dark theme and "Match system" were added |
| Accessibility is important, in design and in code | Text size 100 / 115 / 130 %, dark theme, reduce motion, reduce transparency, reflow to 320 px, skip link, card shortcuts, screen-reader card summaries, focus management, axe-core checks in both themes |
| Accent: sensible default, user-definable as a bonus | Teal by default; Ocean, Graphite, Cocoa or a custom colour. Custom colours are adjusted until they pass WCAG AA |
| Any popular web framework | React + Vite + Tailwind stay. Vitest added for the pure helpers (`npm test`) |
| Security not important; login needed (without a backend) | **One-click log-in, no passwords** (round 2, below) |
| Deployment needed for submission | Handled by the team; `npm run build` stays green |

### 15.1 Round 2 — features the app needs to function

The client asked for a working log-in (no passwords) and the features a shared tracker needs once there are real users.

- **Log-in screen.** Every profile is one button; one click logs in. "Add a new profile" creates a member and logs in. The choice is remembered in this browser until "Log out". A removed profile, or an import without your name, returns you to the log-in screen.
- **Profile menu** in the header: Edit my profile · Log out or switch profile.
- **"You" is the logged-in profile.** "My tasks", "(you)" in the owner filter, the default owner of new tasks and the hand-off toast all follow it. You cannot remove yourself; the team lead stays a badge and cannot be removed either.
- **Attribution (schema v4).** Each task records who created it and who changed it last; the task modal shows "Created by … · last change by …, 2 h ago".
- **Activity log.** Each move, hand-off, edit, context update, creation and undo-restore is recorded with the profile and the time (max 50 per task), under "Activity" in the task modal.
- **"Handed to you" notice.** At log-in, a toast says how many tasks someone else handed to you since your last visit, with "Show my tasks".
- **Data tools respect the log-in.** Load demo data logs you in as the demo's team lead; Import keeps you logged in when the file has a profile with your name; Delete all data returns to the log-in screen.

## 16. Known issues and open items

| Item | Detail | Next step |
|---|---|---|
| Deployed-build checks | FR-M13-04, NFR-COMP-02, NFR-A11Y-11 (Lighthouse) and NFR-PERF-02 (load time) need the Vercel URL. | The team runs them after deployment. |
| Other browsers | Tested in Chromium only (NFR-COMP-01). | Smoke-test in Firefox and Safari. |
| Hallway test | Not run yet (NFR-USE-13). | One person outside the team does flows 1–5 of §4. |
| 200-task performance | Moving a card on a 200-task board: 88 ms median, 128 ms worst (target 100 ms). | Memoise `TaskCard` and stabilise its callbacks if boards grow that large (D13). |
| Report: "new tasks are set to Done" | Reported once; not reproduced via Add task, `N`, any column "+", Enter, or after moving a card (all saved in the stage shown in the form). | If it happens again: open the task, expand **Activity** and check for a "moved … to Done" entry. |
| Per-browser data | Two people only see the same board by exporting and importing a file (D4). | A backend would remove this; it is out of scope. |

---

*PRD version: Slopify v4 (client Q&A refinement, round 2) · based on the hackathon starter by Prof. Dr. Ignacio Alvarez.*
