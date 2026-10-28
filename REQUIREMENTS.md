# Slopify — Requirements

**What this file is.** The functional and non-functional requirements of every Slopify feature. For each one it gives the reason it exists, where it is implemented and how it was checked. [PRD.md](PRD.md) explains the product and its decisions, and [DESIGN.md](DESIGN.md) gives the visual rules. If this file and DESIGN.md disagree, this file wins; then update DESIGN.md.

**Status:** current for schema v4, commit `4c5aabe` and later · last verified 2026-10-28.

---

## 0. How to read this file

### 0.1 Columns

| Column | Meaning |
|---|---|
| **ID** | Stable identifier. IDs from the hackathon PRD (`FR-M4-…`, `DR-INT-…`, `NFR-A11Y-…`) are kept because the source code cites them in comments. New features have new prefixes (`FR-AUTH`, `FR-TEAM`, `FR-ACT`, …). |
| **Pri** | MoSCoW priority: **M** Must · **S** Should · **C** Could. |
| **Requirement** | What the software does, stated so it can be tested. |
| **Why** | The justification: one or more codes from §0.2. |
| **Check** | How it was verified (§0.3). |
| **Status** | ✅ met and verified · ◐ partly met (the gap is stated) · ○ open · ⤳ replaced by the ID shown. |

### 0.2 Justification codes

Every requirement traces to at least one of these sources.

| Code | Source |
|---|---|
| **P1** | PRD §1, pain 1: teams lose track of tasks. Nothing shows what state each task is in. |
| **P2** | PRD §1, pain 2: teams lose track of the prompts that produced working code. |
| **HB** | Hackathon brief: the milestone definitions M1–M13 in the README. |
| **Q1** | Client Q&A: extra features are "secret sauce" and wait until the core milestones are finished. |
| **Q2** | Client Q&A: one project for one team first. |
| **Q3** | Client Q&A: adding members to the team is needed. |
| **Q4** | Client Q&A: any fonts, themes or design reference are acceptable. |
| **Q5** | Client Q&A: accessibility is important, in design (font size etc.) and in code (ARIA etc.). |
| **Q6** | Client Q&A: store a name and an email for contact; teams are small. |
| **Q7** | Client Q&A: target audience is any SWE, architect, senior / junior developer, UX member, database creator. |
| **Q8** | Client Q&A: a sensible default accent, user-definable as a bonus. |
| **Q9** | Client Q&A: any popular web framework. |
| **Q10** | Client Q&A: security is not important at this stage, but login is needed (with no backend). |
| **R2** | Client round 2: one click logs into any listed profile, no passwords; add the features the app needs to function. |
| **PR1–PR7** | PRD §14.1 principles: 1 board is home · 2 recognition over recall · 3 never lose work · 4 keyboard = mouse · 5 colour never alone · 6 feedback ≤ 100 ms · 7 speak like the team. |
| **NH1–NH10** | Nielsen's 10 usability heuristics (1 visibility of status … 10 help and documentation). |
| **WCAG x.y.z** | A WCAG 2.2 success criterion (level AA is the target). |
| **D1–D10** | A decision in PRD §14.6. |
| **DS** | Data safety: localStorage is the only store (PRD §6). It is per browser, about 5 MB, and unencrypted. |
| **ENG** | Engineering quality: testability, maintainability, no regressions. |

### 0.3 Verification methods

| Code | Method |
|---|---|
| **U** `file` | Automated Vitest unit test in `src/**/*.test.js` (67 tests, all pass). |
| **B** | Manual or scripted check in a real browser (Chromium) on the dev or production build. |
| **A** | axe-core 4.10 scan: zero violations (§20.2). |
| **M** | Measurement with numbers (§20.1). |
| **R** | Code review: the behaviour is visible in the named source file. |

### 0.4 Features

| § | Feature | Main source files |
|---|---|---|
| 1 | App shell, feedback and errors | `App.jsx`, `Toast.jsx`, `ConfirmDialog.jsx`, `Modal.jsx`, `ErrorBoundary.jsx` |
| 2 | Log-in and profiles | `LoginScreen.jsx`, `ProfileMenu.jsx`, `context/AppData.jsx`, `lib/prefs.js` |
| 3 | Team, roles and workspace | `settings/TeamSettings.jsx`, `settings/MemberForm.jsx`, `lib/team.js` |
| 4 | Board and stages | `Board.jsx`, `lib/tasks.js`, `lib/constants.js` |
| 5 | Create, edit and delete tasks | `TaskModal.jsx`, `App.jsx` |
| 6 | Task types | `TypeBadge.jsx`, `lib/types.js` |
| 7 | Owners and hand-off | `TaskCard.jsx`, `Avatar.jsx`, `App.jsx` |
| 8 | Due dates | `lib/dates.js`, `lib/due.js` |
| 9 | Context field | `TaskModal.jsx`, `lib/context.js` |
| 10 | Copy as Prompt Context | `CopyPromptButton.jsx`, `lib/prompt.js`, `lib/clipboard.js` |
| 11 | Prompt history (secret sauce) | `PromptHistory.jsx`, `lib/history.js` |
| 12 | Deliverable Anchor Board | `AnchorBoard.jsx`, `lib/anchors.js` |
| 13 | Attribution and activity | `ActivityLog.jsx`, `lib/activity.js`, `App.jsx` |
| 14 | Search and filters | `Header.jsx`, `Board.jsx`, `lib/tasks.js` |
| 15 | Settings and appearance | `SettingsDialog.jsx`, `settings/*`, `lib/prefs.js`, `lib/color.js`, `index.css` |
| 16 | Keyboard, help and onboarding | `App.jsx`, `TaskCard.jsx`, `HelpDialog.jsx`, `WelcomeCard.jsx` |
| 17 | Demo data, export, import, reset | `DataTools.jsx`, `settings/DataSettings.jsx`, `lib/transfer.js`, `data/demo.js` |
| 18 | Storage, integrity and migration | `hooks/useLocalStorage.js`, `lib/schema.js`, `lib/tasks.js`, `main.jsx` |
| 19 | Cross-cutting non-functional requirements | all |
| 20 | Evidence | measurements and scans |
| 21 | Data dictionaries | — |

---

## 1. App shell, feedback and errors

**Purpose.** A stable frame (header, board and footer), and one consistent way to show results, confirm risky actions and survive errors. **Why it exists:** NH1 (visibility of status), NH3 (user control), NH9 (recover from errors), PR3 (never lose work).

### 1.1 Functional

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| FR-APP-01 | M | The header shows the product name "Slopify" and the project and team name from the workspace. | HB, Q2 | B | ✅ |
| FR-APP-02 | M | ~~A `TEAM` constant is the single source of assignees.~~ | HB | — | ⤳ FR-TEAM-01 (the team is now stored data, Q3) |
| FR-APP-03 | M | `<title>` is "Slopify"; `<html lang="en">` is set; there is a meta description. | WCAG 2.4.2, 3.1.1 | R `index.html` | ✅ |
| FR-APP-04 | M | "Add task" is visible in the header at all times, without scrolling, at every width. | PR1, NH7 | B | ✅ |
| FR-APP-05 | M | One shared toast component shows every notification: bottom right, 200 ms fade, closes after 4 s (or a set duration), close button, at most 3 at a time, announced through `aria-live="polite"`. | NH1, WCAG 4.1.3 | R `Toast.jsx`, B | ✅ |
| FR-APP-06 | S | One shared confirm dialog is used for every destructive action (delete, reset, load demo, import, delete all, remove member). Focus starts on **Cancel**. | NH3, NH5, PR3 | B | ✅ |
| FR-APP-07 | C | An SVG favicon matches the wordmark. | HB | R `public/favicon.svg` | ✅ |
| FR-APP-08 | S | The confirm dialog can offer a secondary action on the left, used for "Export first" before data is replaced. | PR3, DS | B | ✅ |
| FR-APP-09 | M | A top-level error boundary replaces a blank screen with "Slopify has a problem", a **Reload** button and an **Export my data** button. The export reads storage directly. | NH9, PR3 | R `ErrorBoundary.jsx` | ✅ |

### 1.2 Non-functional

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| NFR-APP-01 | M | Toasts and confirm dialogs use the DESIGN.md §5 wording: what happened, then what to do next. | PR7, NH9 | R | ✅ |
| NFR-APP-02 | M | Every dialog has `role="dialog"` or `"alertdialog"`, `aria-modal`, a labelled heading, a focus trap, Esc to close and focus return. | WCAG 2.1.2, 2.4.3, 4.1.2 | A, B | ✅ |
| NFR-APP-03 | S | Toast timers can be extended: an Undo toast lasts 5 s, the log-in notice 8 s. | WCAG 2.2.1 | R | ✅ |

---

## 2. Log-in and profiles

**Purpose.** Each person works as themselves, so "My tasks", new-task ownership and the activity log mean something. **Why it exists:** Q10 (login is needed, with no backend), R2 (one click into any listed profile, no passwords). **Constraint:** there is no server, so a password would protect nothing. The data sits unencrypted in the same browser (DS). The log-in is therefore an identity choice, not a security control, and the UI says so (NFR-AUTH-02).

### 2.1 Functional

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| FR-AUTH-01 | M | When no profile is chosen in this browser, Slopify shows the log-in screen instead of the board. | Q10, R2 | B | ✅ |
| FR-AUTH-02 | M | The log-in screen lists every team member as one button. **One click logs in**, with no password and no second step. | R2 | B | ✅ |
| FR-AUTH-03 | M | Each profile button shows the avatar, the name, the "Team lead" badge (if any), the role and the number of open tasks. | PR2, Q7 | B | ✅ |
| FR-AUTH-04 | M | "Add a new profile" opens the member form (FR-TEAM-03); "Add and log in" creates the member and logs in. | Q3, R2 | B | ✅ |
| FR-AUTH-05 | M | The chosen profile is remembered in this browser (`prefs.currentMemberId`), so a reload keeps the user logged in. | NH6, PR3 | B | ✅ |
| FR-AUTH-06 | M | The header profile menu offers **Edit my profile** (opens Settings → Project & team) and **Log out or switch profile** (returns to the log-in screen). | R2, NH3 | B | ✅ |
| FR-AUTH-07 | M | If the logged-in member no longer exists (removed, or replaced by an import), the log-in screen shows. Slopify never acts as a missing person. | R2, DS | R `App.jsx` `Gate` | ✅ |
| FR-AUTH-08 | S | "Load demo data" logs in as the demo's team lead. Import keeps you logged in when the file has a member with your name (case-insensitive); otherwise the log-in screen shows. | R2, NH6 | B | ✅ |
| FR-AUTH-09 | M | "You" in the UI is the logged-in profile: the "My tasks" filter, "(you)" in the owner filter, the default owner of new tasks and the hand-off toast. | R2, PR2 | B | ✅ |
| FR-AUTH-10 | S | At log-out and log-in, the time is stored per member (`prefs.lastSeen`) for the "handed to you" notice (FR-ACT-07). | R2 | U `activity.test.js`, B | ✅ |

### 2.2 Non-functional

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| NFR-AUTH-01 | M | Logging in takes **one** pointer or keyboard action from the log-in screen. | R2, NH7 | B | ✅ |
| NFR-AUTH-02 | M | The log-in screen says that there is no password and anyone using this browser can choose any profile. Slopify does not pretend to be secure. | Q10, NH2 | B | ✅ |
| NFR-AUTH-03 | M | On load, focus goes to the heading "Who are you?". Each button's accessible name includes the name, the lead status, the role and the open task count. | WCAG 2.4.3, 4.1.2 | A, B | ✅ |
| NFR-AUTH-04 | M | The log-in screen works at 320 px wide and in both themes with no horizontal scroll. | Q5, WCAG 1.4.10 | B (375 px, dark) | ✅ |
| NFR-AUTH-05 | S | The profile menu closes with Esc (focus returns to its button), with a click outside, or when focus leaves it. It sits above all panels. | WCAG 2.1.2, NH3 | B | ✅ |

---

## 3. Team, roles and workspace

**Purpose.** Let the team manage who is on the project and what each person does. **Why it exists:** Q3 (adding members is needed), Q6 (name and email; small teams), Q7 (the audience has different roles), Q2 (one project, one team).

### 3.1 Functional

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| FR-TEAM-01 | M | The team is stored data (`vibetracker.team`), not code. Every owner picker and filter reads it. | Q3 | R `AppData.jsx` | ✅ |
| FR-TEAM-02 | M | Settings → Project & team lists every member: avatar, name, "You" and "Team lead" badges, role, task count and email. | Q3, Q6 | B | ✅ |
| FR-TEAM-03 | M | Add and edit a member with **Name** (required, 1–40 characters, unique ignoring case), **Email** (optional, checked for shape) and **Role** (optional). | Q3, Q6, NH5 | U `team.test.js`, B | ✅ |
| FR-TEAM-04 | M | Roles come from one list: Software engineer · Architect · Senior developer · Junior developer · UX designer · Database engineer · Other. | Q7 | R `constants.js` | ✅ |
| FR-TEAM-05 | M | Removing a member asks for confirmation and for who gets their tasks (default: the team lead, or Unassigned). No task is lost. | Q3, PR3 | B | ✅ |
| FR-TEAM-06 | M | You cannot remove yourself or the team lead. The disabled button's tooltip and accessible name say why. | R2, NH5 | B | ✅ |
| FR-TEAM-07 | S | "Make team lead" moves the lead badge (`workspace.leadId`) to another member. | Q2 | B | ✅ |
| FR-TEAM-08 | M | Project name (required, ≤ 60 characters) and team name (optional) are edited in the same tab, saved immediately, and shown in the header and the copied prompt. | Q2 | B | ✅ |
| FR-TEAM-09 | S | A member's email shows as an underlined `mailto:` link, and as "Contact {first name}" next to the owner in the task modal. Slopify never sends email. | Q6 | B | ✅ |
| FR-TEAM-10 | M | A new browser starts with three placeholder members (the first is the lead), so the board and the log-in screen work at once. | HB, R2 | U `team.test.js` | ✅ |

### 3.2 Non-functional

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| NFR-TEAM-01 | M | The UI is sized for 1–15 members: plain `<select>` lists and a single-column team list stay usable at that size. | Q6 | B (6-member demo) | ✅ |
| NFR-TEAM-02 | M | `Task.assignee` stores a member **id**, so renaming a member never orphans their tasks (D8). | Q3, DS | U `schema.test.js` | ✅ |
| NFR-TEAM-03 | M | Form errors are inline, use `aria-invalid` and `aria-describedby`, and focus moves to the first invalid field. | WCAG 3.3.1, 3.3.3 | A, B | ✅ |
| NFR-TEAM-04 | S | Links are underlined, not marked by colour alone. | WCAG 1.4.1 | A | ✅ |
| NFR-TEAM-05 | M | The only personal data is name, optional email and role (data minimisation). | Q6, DS | R `team.js` | ✅ |

---

## 4. Board and stages

**Purpose.** One shared view of every task and its state. **Why it exists:** P1, HB (M4).

### 4.1 Functional

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| FR-M4-01 | M | Four columns from `STAGES`, in the order and with the labels **To Do · In Progress · Review · Done**. | HB, P1 | R | ✅ |
| FR-M4-02 | M | Each task appears in exactly one column: the one that matches `task.status`. | P1 | R `Board.jsx` | ✅ |
| FR-M4-03 | M | A new browser (no `vibetracker.tasks` key) gets 4 starter tasks covering both types, several stages, several owners and a due date. | HB | U `tasks.test.js` | ✅ |
| FR-M4-04 | M | Tasks persist via `useLocalStorage('vibetracker.tasks')`; a reload shows the same board. | PR3 | B | ✅ |
| FR-M4-05 | M | Starter tasks load **only** when the key is absent; an emptied board stays empty after a reload. | PR3 | R `useLocalStorage.js` | ✅ |
| FR-M4-06 | M | A card shows the title, type, owner and due state (if any). | PR2 | B | ✅ |
| FR-M4-07 | M | A task moves without drag-and-drop: the stage `<select>` on the card, ← / → buttons, or the `[` / `]` keys (D3). | WCAG 2.5.7, PR4 | B | ✅ |
| FR-M4-08 | M | A move updates the board at once, persists, and keeps focus on the card in its new column. | PR6, WCAG 2.4.3 | B | ✅ |
| FR-M4-09 | S | Each column header shows a count ("In Progress · 3", or "1 of 3" while a filter is on). | NH1 | B | ✅ |
| FR-M4-10 | S | An empty column shows the DESIGN.md §5 empty-state text. | NH10 | B | ✅ |
| FR-M4-11 | S | Cards sort by due date ascending, undated tasks last, ties by `createdDate` (oldest first). | P1 | U `tasks.test.js` | ✅ |
| FR-M4-12 | S | From 1280 px all four columns show; each column scrolls on its own while the header and the Anchor Board stay in place. Narrower widths: §4.2. | P1 | B | ✅ |
| FR-M4-13 | S | Long titles clamp to two lines; the full title is in the tooltip, the modal and the accessible name. | NH8 | B | ✅ |
| FR-M4-14 | M | Below 768 px the board shows one stage at a time, chosen with stage buttons that show counts. After a move, the board follows the card to its new stage. | Q5, WCAG 1.4.10 | B (375 px) | ✅ |
| FR-M4-15 | M | From 768 px to 1279 px the columns sit side by side (18 rem each) and scroll sideways with snap. | Q5, WCAG 1.4.10 | B (768 px, 1024 px) | ✅ |

### 4.2 Non-functional

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| NFR-BRD-01 | M | Each column is a `<section>` with an `<h2>`; cards are list items. | WCAG 1.3.1 | A | ✅ |
| NFR-BRD-02 | M | Moves are announced: "Moved "{title}" to {stage}." | WCAG 4.1.3 | B | ✅ |
| NFR-BRD-03 | S | A move responds in under 100 ms with 100 tasks on the board. | PR6 | M (§20.1: 42 ms median) | ✅ |
| NFR-BRD-04 | S | A column with 30+ cards stays usable: it scrolls, and the header and the "+" stay visible. | NH8 | B (50 cards per column) | ✅ |

---

## 5. Create, edit and delete tasks

**Purpose.** Capture work quickly and change it safely. **Why it exists:** P1, HB (M5), PR3.

### 5.1 Functional

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| FR-M5-01 | M | "Add task" (header) opens the modal in create mode with every editable field: title, description, type, stage, owner, due date, context, tool. | HB | B | ✅ |
| FR-M5-02 | M | Defaults: type Feature, stage To Do (or the column's stage), owner = **the logged-in profile**, no due date. | NH7, R2 | B | ✅ |
| FR-M5-03 | M | `id` (`crypto.randomUUID()`, with a fallback) and `createdDate` (today, local) are set automatically and never edited. | DS | R `ids.js` | ✅ |
| FR-M5-04 | M | Title is required and trimmed. An empty title shows "Type a title for the task." inline and focuses the field. | NH5, WCAG 3.3.1 | B | ✅ |
| FR-M5-05 | S | Title ≤ 120 characters, description ≤ 2,000. A counter shows from 80 % of the limit. | NH5, DS | B | ✅ |
| FR-M5-06 | S | Each column has a "+" that opens create mode with that column's stage. | NH7 | B | ✅ |
| FR-M5-07 | S | Heading and primary button follow the mode: "New task" / "Create task" or "Edit task" / "Save changes". | NH4 | B | ✅ |
| FR-M5-08 | M | Clicking a card, or Enter / Space / `E` on it, opens edit mode with the saved values. | PR4 | B | ✅ |
| FR-M5-09 | M | Saving updates the task in place; `id` and `createdDate` never change. | DS | R | ✅ |
| FR-M5-10 | M | Cancel, Esc and a click on the backdrop close without saving. | NH3 | B | ✅ |
| FR-M5-11 | S | Closing with unsaved changes asks "Close without saving?" first. | PR3, NH5 | B | ✅ |
| FR-M5-12 | M | "Delete task" appears in edit mode only, bottom left, away from Save, in the neutral destructive style (D2). | NH5 | B | ✅ |
| FR-M5-13 | M | Delete asks for confirmation; confirming removes the task and persists. | NH5 | B | ✅ |
| FR-M5-14 | C | After a delete, a toast offers **Undo** for 5 s. Undo puts the task back in its old position and records "restored". | NH3, PR3 | B | ✅ |
| FR-M5-15 | M | On open, focus moves to Title; Tab stays inside the modal. On close, focus returns to the edited card, a neighbour card after a delete, or the opener. | WCAG 2.4.3 | B | ✅ |
| FR-M5-16 | M | Esc closes; Enter in a one-line field submits; Ctrl / Cmd + Enter submits from anywhere. | PR4 | B | ✅ |
| FR-M5-17 | M | The modal has `role="dialog"`, `aria-modal`, `aria-labelledby` (heading) and `aria-describedby` (key help). | WCAG 4.1.2 | A | ✅ |
| FR-M5-18 | M | Every save writes to storage immediately; there is no "save board" step. | PR3 | R | ✅ |
| FR-M5-19 | S | Page scroll is locked while open; a tall modal scrolls its body while the action bar stays visible. | NH8 | B | ✅ |

### 5.2 Non-functional

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| NFR-CRUD-01 | M | Opening the modal and typing respond in under 100 ms with 100 tasks. | PR6 | M (16 ms / 5 ms) | ✅ |
| NFR-CRUD-02 | M | Creating a task with a title and an owner takes ≤ 4 interactions after the modal opens. | NH7 | B (type, Enter = 2) | ✅ |
| NFR-CRUD-03 | M | Every field has a visible `<label>`; "(required)" / "(optional)" is in the label text. | WCAG 3.3.2 | A | ✅ |
| NFR-CRUD-04 | S | At 320 px the modal fits with a 12 px margin; two-column field rows stack. | WCAG 1.4.10 | B | ✅ |

---

## 6. Task types

**Purpose.** Tell features from bugs at a glance. **Why it exists:** HB (M6), PR2, PR5.

### 6.1 Functional

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| FR-M6-01 | M | Feature and bug cards differ by a coloured stripe **and** an icon + word badge ("Feature" / "Bug"). | PR5, WCAG 1.4.1 | B | ✅ |
| FR-M6-02 | M | Type colours are tokens (CSS variables); no hex values in JSX. | ENG | R | ✅ |
| FR-M6-03 | M | The modal uses a radio-group segmented control with the same colour and icon as the card. | NH4 | B | ✅ |
| FR-M6-04 | S | Badge text has ≥ 4.5:1 contrast (light 8.77 / 7.40; dark 9.02 / 9.93). | WCAG 1.4.3 | M (DESIGN.md §2) | ✅ |
| FR-M6-05 | C | A header filter shows All / Feature / Bug (§14). | NH7 | B | ✅ |

### 6.2 Non-functional

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| NFR-UI-09 | S | The bug colour (magenta) differs from the destructive style; filled red appears only on the confirm-delete button (D2). | NH5 | R | ✅ |

---

## 7. Owners and hand-off

**Purpose.** Show who owns each task and pass work on in one step. **Why it exists:** P1, HB (M7), Q3.

### 7.1 Functional

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| FR-M7-01 | M | Every card shows an initials avatar and the owner's name (in the "Hand off to…" select). The tooltip adds the role. | PR2, Q7 | B | ✅ |
| FR-M7-02 | M | "Hand off to…" on the card lists the team; choosing a name reassigns at once without opening the modal. The modal's owner field offers the team plus "Unassigned". | NH7 | B | ✅ |
| FR-M7-03 | M | A hand-off shows "You gave this task to {name}." | NH1 | B | ✅ |
| FR-M7-04 | M | Card controls never also open the edit modal. | NH5 | B | ✅ |
| FR-M7-05 | M | A task whose owner is not in the team shows "Unassigned" and a person icon, and can be reassigned; it never crashes the board. | DS, NH9 | U `team.test.js` | ✅ |
| FR-M7-06 | S | Avatars use no person-specific colour; initials and names identify people (DESIGN.md §2.4). | PR5 | R | ✅ |
| FR-M7-07 | C | The hand-off toast offers **Undo** (only if nobody changed the owner again since). | NH3 | B | ✅ |
| FR-M7-08 | C | Owner filter and "My tasks" (§14). | NH7 | B | ✅ |

### 7.2 Non-functional

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| NFR-OWN-01 | M | A hand-off takes ≤ 2 interactions from the board. | NH7 | B (open select, choose) | ✅ |
| NFR-OWN-02 | M | Every hand-off is attributed in the activity log (FR-ACT-03). | R2 | U `activity.test.js` | ✅ |

---

## 8. Due dates

**Purpose.** Warn the team before deadlines pass. **Why it exists:** P1, HB (M8), PR5.

| State | Rule | Card label | Icon |
|---|---|---|---|
| Done | `status === 'done'` (overrides any date) | "Done" | check-circle |
| Overdue | due date before today | "Overdue · 2 days" | alert-triangle |
| Warning | today or tomorrow (D1) | "Due today" / "Due tomorrow" | clock |
| Safe | 2 or more days away | "Due in 5 days" | calendar |
| None | no due date | — | — |

### 8.1 Functional

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| FR-M8-01 | M | The card background takes the tint of its due state. | P1 | B | ✅ |
| FR-M8-02 | M | Each tinted state also shows a text label and an icon. | PR5, WCAG 1.4.1 | U `dates.test.js` | ✅ |
| FR-M8-03 | M | Due states use **local** calendar dates; `YYYY-MM-DD` values are never parsed as UTC. | DS | U `dates.test.js` | ✅ |
| FR-M8-04 | M | The native date input sets the date; "Clear date" returns it to `null`. | NH3 | B | ✅ |
| FR-M8-05 | M | The tint goes on the background; the type stays on the stripe and badge. | NH4 | B | ✅ |
| FR-M8-06 | S | "Today" is rechecked on focus, on tab visibility and every minute, so a board left open overnight updates. | P1 | R `App.jsx` `useToday` | ✅ |
| FR-M8-07 | S | A past date chosen while creating shows "This date is in the past. You can save it." and still saves. | NH5 | B | ✅ |
| FR-M8-08 | C | The header shows an overdue count ("2 overdue"). | NH1 | B | ✅ |

### 8.2 Non-functional

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| NFR-DUE-01 | M | Text on every tint keeps ≥ 4.5:1 in both themes (lowest: light 5.27:1, dark 6.64:1). | WCAG 1.4.3 | M (DESIGN.md §2.3, §2.7) | ✅ |
| NFR-USE-02 | M | Dates show as human labels ("Due tomorrow"); the long date is in a tooltip, never raw ISO. | NH2 | B | ✅ |

---

## 9. Context field

**Purpose.** Store the briefing that lets the next person or AI tool continue the task. **Why it exists:** P2, HB (M9).

### 9.1 Functional

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| FR-M9-01 | M | The modal has a **Context** textarea in the monospace font, at least 6 rows high, resizable. | P2 | B | ✅ |
| FR-M9-02 | M | Helper text and placeholder say what good context contains (goal, what works, limits, files, last prompt, next step). | NH10 | B | ✅ |
| FR-M9-03 | M | A **Tool** select offers Claude, ChatGPT, Cursor, Lovable, Replit, Other and "No tool" (`null`). | P2 | R | ✅ |
| FR-M9-04 | M | `contextUpdatedAt` updates only when the context or the tool actually changed. | DS | U `history.test.js` | ✅ |
| FR-M9-05 | M | The modal shows "Updated {time} ago", with the full date and time in a tooltip. | NH1 | B | ✅ |
| FR-M9-06 | M | Cards with context show an icon and the tool name. | PR2 | B | ✅ |
| FR-M9-07 | M | Older tasks without context fields load with `''` / `null` / `null`. | DS | U `schema.test.js` | ✅ |
| FR-M9-08 | M | Context is stored and shown exactly as typed: whitespace, line breaks and Markdown are kept. | P2 | U `prompt.test.js` | ✅ |
| FR-M9-09 | S | "Insert template" fills an empty field with the headings Goal / Done so far / Limits / Files / Last prompt / Next step. | NH10 | B | ✅ |
| FR-M9-10 | S | Helper text warns: do not put passwords or API keys here. | DS | B | ✅ |
| FR-M9-11 | S | A soft warning shows above 20,000 characters. | DS | R `context.js` | ✅ |
| FR-M9-12 | C | Cards of open tasks with context older than 3 days show a "stale context" icon and text. | P2 | R | ✅ |

### 9.2 Non-functional

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| NFR-SEC-01 | M | All user text renders through React escaping; there is no `dangerouslySetInnerHTML` or `innerHTML`. | DS | R (grep: 0 uses) | ✅ |
| NFR-CTX-01 | S | The context font keeps 0/O and l/1/I distinct (Atkinson Hyperlegible Mono). | Q5 | R `index.html` | ✅ |

---

## 10. Copy as Prompt Context

**Purpose.** Put a task and its context on the clipboard, ready for an AI tool. **Why it exists:** P2, HB (M10), Q7.

### 10.1 Functional

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| FR-M10-01 | M | "Copy as Prompt Context" is a button in the modal and an icon button on each card (plus `C` on a focused card). One action copies. | P2, NH7 | B | ✅ |
| FR-M10-02 | M | The text follows the Markdown template (PRD §11); empty fields are left out; the output never contains `undefined`, `null` or empty headings. | P2 | U `prompt.test.js` | ✅ |
| FR-M10-03 | M | Copy uses the Clipboard API, then a hidden-textarea fallback, then a pre-selected box with "Press Ctrl/Cmd + C". | NH9 | R `clipboard.js` | ✅ |
| FR-M10-04 | M | Success: "Copied. Paste it into your AI tool." Failure: an error toast in plain words. Both are announced. | NH1, WCAG 4.1.3 | B | ✅ |
| FR-M10-05 | M | Works on `localhost` and on HTTPS. | HB | B (localhost) | ◐ deployed URL not yet checked |
| FR-M10-06 | S | The button shows "Copied" with a check for 2 s. | NH1 | B | ✅ |
| FR-M10-07 | S | Serialisation is a pure function, `taskToPrompt(task, options)`. | ENG | U `prompt.test.js` | ✅ |
| FR-M10-08 | S | A task with no context adds "No context recorded yet." | NH9 | U `prompt.test.js` | ✅ |
| FR-M10-09 | C | "Preview the prompt" in the modal shows the exact text. | NH1 | B | ✅ |
| FR-M10-10 | C | A setting adds the deliverable links to every prompt (off by default, D10). | P2 | U `prompt.test.js` | ✅ |
| FR-M10-11 | S | The prompt includes the project name and the owner **with their role**, e.g. "Sam K. (Junior developer)", so the AI can adapt its answer. | Q7, Q2 | U `prompt.test.js` | ✅ |

### 10.2 Non-functional

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| NFR-CPY-01 | M | Copying takes 1 interaction from the card. | NH7 | B | ✅ |
| NFR-COMP-02 | M | Behaves the same on `localhost` and on the deployed HTTPS build. | HB | B (localhost, preview build) | ◐ deployed URL not yet checked |

---

## 11. Prompt history (secret sauce)

**Purpose.** Never lose a prompt version that worked. **Why it exists:** P2 one level deeper (PRD §11), HB (M12), Q1.

### 11.1 Functional

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| FR-M12-01 | M | The feature is described in PRD §11 (problem and why it is ours). | HB | R | ✅ |
| FR-M12-02 | M | It is visible in the first two minutes of the demo (card "Claude · v3", timeline in the modal). | HB | B (demo data) | ✅ |
| FR-M12-03 | M | It breaks no other requirement. | ENG | U (67 tests) | ✅ |
| FR-M12-04 | M | It meets the same non-functional requirements (accessibility, persistence, no console errors). | ENG | A, B | ✅ |
| FR-M12-05 | S | It is discoverable without explanation (labelled disclosure, version count on the card). | NH10 | B | ✅ |
| FR-HIST-01 | M | When the context or the tool changes and the old context was not empty, the old version is kept, newest first, with its tool and time. | P2 | U `history.test.js` | ✅ |
| FR-HIST-02 | M | The edit modal shows "Prompt history · {n} versions"; it opens by itself when there is more than one version. | P2, NH1 | B | ✅ |
| FR-HIST-03 | M | Each version can be **shown**, **copied** as a full prompt, or **restored** into the Context field. Restore never saves by itself. | P2, NH3 | B | ✅ |
| FR-HIST-04 | S | Cards show the version count, e.g. "Claude · v4". | PR2 | B | ✅ |

### 11.2 Non-functional

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| NFR-HIST-01 | M | At most 20 earlier versions per task are kept, to protect the ~5 MB limit. | DS | U `history.test.js` | ✅ |
| NFR-HIST-02 | M | Expanded version text can be scrolled with the keyboard (focusable region). | WCAG 2.1.1 | A | ✅ |

---

## 12. Deliverable Anchor Board

**Purpose.** Keep the four final deliverables one click away. **Why it exists:** HB (M11).

### 12.1 Functional

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| FR-M11-01 | M | Four fixed slots above the board, in order: Presentation, Demo, Report, Documentation. | HB | R | ✅ |
| FR-M11-02 | M | Anchors persist in `vibetracker.anchors`. | PR3 | B | ✅ |
| FR-M11-03 | M | An empty slot shows "Add link"; a filled slot shows the label and host name, and opens in a new tab with `rel="noopener noreferrer"`. | NH10 | B | ✅ |
| FR-M11-04 | M | Add, edit and clear inline; Enter saves, Esc cancels. | PR4 | B | ✅ |
| FR-M11-05 | M | Only `http` / `https`; `https://` is added if missing; other schemes (e.g. `javascript:`) are rejected with an inline error. | DS | U `anchors.test.js` | ✅ |
| FR-M11-06 | S | Opening (the link) and editing (pencil) are separate targets. | NH5 | B | ✅ |
| FR-M11-07 | S | A caption shows "{n} of 4 links added". | NH1 | B | ✅ |
| FR-M11-08 | S | The Anchor Board is about 120 px tall at ≥ 1280 px, so the board stays above the fold. | PR1 | B | ✅ |
| FR-M11-09 | C | Each filled slot has a copy-link button. | NH7 | B | ✅ |

### 12.2 Non-functional

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| NFR-SEC-02 | M | URLs are restricted to http/https; external links use `rel="noopener noreferrer"`. | DS | U `anchors.test.js` | ✅ |
| NFR-ANC-01 | M | Slots reflow to 2 per row below 1280 px and 1 per row below 640 px. | WCAG 1.4.10 | B | ✅ |

---

## 13. Attribution and activity

**Purpose.** Show who did what, so a shared board stays trustworthy. **Why it exists:** R2 (the features a shared tracker needs to function), P1, NH1.

### 13.1 Functional

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| FR-ACT-01 | M | Each task records `createdBy` (member id), `updatedBy` and `updatedAt`. | R2 | U `activity.test.js` | ✅ |
| FR-ACT-02 | M | Each change adds an activity entry `{ at, by, type, from?, to? }` by the logged-in profile. Types: created, moved, handoff, edited, context, restored. | R2 | U `activity.test.js` | ✅ |
| FR-ACT-03 | M | Entries are recorded for: create; move (card, keys or modal); hand-off (card, modal or Undo); detail edits; context or tool changes; restore after delete. One modal save adds one entry per kind of change. | R2 | U `activity.test.js`, B | ✅ |
| FR-ACT-04 | M | The edit modal shows "Created by {name} · last change by {name}, {time} ago". | R2, NH1 | B | ✅ |
| FR-ACT-05 | M | An "Activity · {n} entries" disclosure lists entries newest first: icon, sentence ("Sam K. moved it from To Do to Review") and relative time (full time in a tooltip). | R2 | U `activity.test.js`, B | ✅ |
| FR-ACT-06 | S | A removed member shows as "A former team member", so history is never lost or wrong. | DS | U `activity.test.js` | ✅ |
| FR-ACT-07 | S | At log-in, a toast says how many tasks someone else handed to you since your last visit (or in total on a first visit), with **Show my tasks**. | R2, NH1 | U `activity.test.js`, B | ✅ |
| FR-ACT-08 | S | Demo tasks carry creators and hand-offs, so the notice can be shown in the pitch. | HB | U `demo.test.js` | ✅ |

### 13.2 Non-functional

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| NFR-ACT-01 | M | At most 50 entries per task; invalid entries are dropped on load. | DS | U `activity.test.js` | ✅ |
| NFR-ACT-02 | M | The fields are additive (schema v4); older tasks load with `null` / `[]` and lose nothing. | DS, NFR-REL-05 | U `schema.test.js` | ✅ |
| NFR-ACT-03 | M | The activity list can be scrolled with the keyboard and uses `<time datetime>`. | WCAG 2.1.1, 1.3.1 | A | ✅ |
| NFR-ACT-04 | S | The log-in toast shows once per log-in, even when React runs effects twice in development. | NH1 | B | ✅ |

---

## 14. Search and filters

**Purpose.** Find the relevant tasks fast as the board grows. **Why it exists:** P1, NH7, R2 ("My tasks").

### 14.1 Functional

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| FR-FLT-01 | M | A search field matches title, description and context, ignoring case; every word must match. | P1, P2 | U `tasks.test.js` | ✅ |
| FR-FLT-02 | M | "My tasks" (`aria-pressed`) shows the logged-in profile's tasks. | R2 | B | ✅ |
| FR-FLT-03 | M | Owner filter: Everyone, each member ("(you)" marked), Unassigned. | P1 | U `tasks.test.js` | ✅ |
| FR-FLT-04 | S | Type filter (All / Feature / Bug) combines with search and owner. | NH7 | U `tasks.test.js` | ✅ |
| FR-FLT-05 | S | "Clear filters" appears while any filter or search is on. | NH3 | B | ✅ |
| FR-FLT-06 | S | A new task that would be hidden by the active filters clears them, so it is never "lost". | NH1, PR3 | R `App.jsx` | ✅ |
| FR-FLT-07 | S | Filters are UI state only and are not stored (DR-STO-05). | DS | R | ✅ |
| FR-FLT-08 | S | `/` focuses search; Esc clears it, then leaves it. | PR4 | B | ✅ |
| FR-FLT-09 | M | Below 768 px the filter row folds behind "Filters ({n})" with `aria-expanded`. | WCAG 1.4.10 | B | ✅ |

### 14.2 Non-functional

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| NFR-FLT-01 | M | A filter change announces "Showing {n} of {m} tasks." | WCAG 4.1.3 | B | ✅ |
| NFR-FLT-02 | S | A search keystroke updates the board in under 100 ms with 200 tasks. | PR6 | M (57 ms worst) | ✅ |
| NFR-FLT-03 | M | The search field has a label and sits in `role="search"`. | WCAG 1.3.1 | A | ✅ |

---

## 15. Settings and appearance

**Purpose.** Let each person adapt Slopify to how they read and work. **Why it exists:** Q5 (accessibility in design: "font size etc."), Q4 (any themes), Q8 (user-definable accent).

### 15.1 Functional

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| FR-SET-01 | M | One Settings dialog with three tabs: Project & team · Accessibility & appearance · Data. ← / → / Home / End move between tabs (WAI-ARIA tabs). | NH4, WCAG 2.1.1 | A, B | ✅ |
| FR-SET-02 | M | Every setting saves at once; there is no Save button. | PR3 | B | ✅ |
| FR-APPR-01 | M | Text size: Default 100 % · Large 115 % · Larger 130 %. All sizes are in rem, so everything scales. | Q5, WCAG 1.4.4 | B (130 %) | ✅ |
| FR-APPR-02 | M | Theme: Match system · Light · Dark. "Match system" follows OS changes live. | Q4, Q5 | B | ✅ |
| FR-APPR-03 | M | Reduce motion (System / On) removes all transitions; it also follows the OS setting. | Q5, WCAG 2.3.3 | R `index.css` | ✅ |
| FR-APPR-04 | M | Reduce transparency (System / On) makes all glass solid and stops the blur; it also follows the OS setting. | Q5 | R `tailwind.config.js` | ✅ |
| FR-APPR-05 | S | Accent: Teal (default), Ocean, Graphite, Cocoa, or Custom (colour picker), with a live preview. | Q8 | B | ✅ |
| FR-APPR-06 | S | A custom accent that fails contrast is darkened (light) or lightened (dark) until it passes; the panel says "Adjusted for readability." | Q8, WCAG 1.4.3 | U `color.test.js` | ✅ |
| FR-APPR-07 | M | Settings are per browser (`vibetracker.prefs`) and are never exported. | DS | U `transfer.test.js` | ✅ |
| FR-APPR-08 | S | Theme, text size and accent are applied before the first paint (no flash of the wrong theme). | NH8 | R `main.jsx` | ✅ |

### 15.2 Non-functional

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| NFR-APPR-01 | M | Every text pair in the dark theme has ≥ 4.5:1 contrast; UI parts and the focus ring ≥ 3:1. | WCAG 1.4.3, 1.4.11 | M (contrast script), A | ✅ |
| NFR-APPR-02 | M | The accent changes only the `brand-*` tokens; type and due colours never change (one hue = one meaning). | PR5 | R `color.js` | ✅ |
| NFR-APPR-03 | M | Every preset passes 4.5:1 for button text and as link text, in both themes. | WCAG 1.4.3 | U `color.test.js` | ✅ |

---

## 16. Keyboard, help and onboarding

**Purpose.** Make every feature reachable without a mouse, and learnable without a teacher. **Why it exists:** PR4, Q5, Q7 (junior members), NH7, NH10.

### 16.1 Functional

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| NFR-USE-07 | S | Global shortcuts: `N` new task · `/` search · `?` help · Esc close · Ctrl/Cmd + Enter save. They do nothing while typing or while a dialog is open. | PR4, NH7 | B | ✅ |
| FR-KEY-01 | S | Card shortcuts (focus on the card title): `[` / `]` move · `E` edit · `C` copy prompt · `H` hand off. | PR4 | B | ✅ |
| FR-KEY-02 | M | Each shortcut is exposed in `aria-keyshortcuts` and listed in Help; the Add task, copy, search and Help buttons also show their key in the tooltip. No shortcut uses Alt + arrows (the browser uses them for Back / Forward). | WCAG 2.1.4, NH10 | R | ✅ |
| FR-KEY-03 | M | "Skip to the board" is the first Tab stop. | WCAG 2.4.1 | B | ✅ |
| FR-HELP-01 | S | A Help dialog (`?` or the header button) explains how to read a card, lists all shortcuts, and explains profiles and data. | Q7, NH10 | A, B | ✅ |
| FR-WELC-01 | S | After the first log-in, a welcome card suggests setting up the team. It never blocks the board and can be closed (remembered per browser). | NH10 | B | ✅ |
| NFR-COMP-03 | S | Shortcuts treat Ctrl (Windows) and Cmd (macOS) the same. | PR4 | R `TaskModal.jsx` | ✅ |

### 16.2 Non-functional

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| NFR-KEY-01 | M | The whole primary flow (log in → create → move → hand off → copy → log out) works with the keyboard only. | WCAG 2.1.1, PR4 | B | ✅ |
| NFR-KEY-02 | M | Card shortcuts are ignored when a modifier is held or when the focus is in a field. | WCAG 2.1.4 | R `TaskCard.jsx` | ✅ |

---

## 17. Demo data, export, import, reset

**Purpose.** Move a board between laptops, rehearse the pitch, and start over safely. **Why it exists:** DS (localStorage is per browser, D4), HB (M13), Q1 (finish the core first), PR3.

### 17.1 Functional

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| FR-M13-01 | M | Demo data: 12 tasks across all stages, both types, all five due states, 6 members (one per role), ≥ 3 curated contexts with ≥ 3 tools, prompt history, 2 placeholder anchors, creators and hand-offs. | HB, Q7 | U `demo.test.js` | ✅ |
| FR-M13-02 | M | Demo and starter dates are relative to today. | HB | U `demo.test.js` | ✅ |
| FR-M13-03 | M | "Load demo data" replaces the board after confirmation (with "Export first"), then logs in as the demo lead. | NH5, PR3 | B | ✅ |
| FR-M13-04 | M | The pitch is rehearsed on the **deployed** build, and that build loads with zero console errors. | HB | — | ○ team task (deployment is out of scope for this work) |
| FR-M13-05 | S | "Reset board" deletes all tasks and links after confirmation; the team, workspace and settings stay; `.backup` keys are removed. | NH3, DS | B | ✅ |
| FR-DATA-04 | S | **Export** downloads `vibetracker-YYYY-MM-DD.json` (format §21.5) with tasks, anchors, team and workspace. | DS, D4 | U `transfer.test.js`, B | ✅ |
| FR-DATA-05 | C | **Import** validates the file, migrates and normalises it, then asks "Replace {n} tasks with {m} tasks and {k} team members from "{file}"?" with "Export first". | DS, NH5 | U `transfer.test.js`, B | ✅ |
| FR-DATA-07 | S | "Delete all data" (Settings → Data) removes every `vibetracker.*` key, prefs included, after confirmation, and restarts at the log-in screen. | DS | B | ✅ |
| FR-DATA-08 | S | Settings → Data shows storage use ("{x} MB of about 5 MB") with a bar. | DS, NH1 | B | ✅ |

### 17.2 Non-functional

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| DR-EXP-01 | S | Export is pretty-printed UTF-8 JSON, exactly as stored. | DS | U `transfer.test.js` | ✅ |
| DR-EXP-02 | S | Export never includes prefs or `.backup` keys. | DS | U `transfer.test.js` | ✅ |
| DR-IMP-01 | C | Import accepts only `app: "vibetracker"` with `schemaVersion` ≤ the current version. Errors: "Slopify cannot read this file. Choose a file that Slopify exported." / "A newer version of Slopify made this file. Update Slopify, then try again." | NH9 | U `transfer.test.js` | ✅ |
| DR-IMP-02 | C | Imported data goes through the same migration and normalisation as stored data. | DS | U `transfer.test.js` | ✅ |
| DR-IMP-03 | C | The confirm dialog shows the counts and offers "Export first"; it also reports skipped damaged entries. | NH5 | B | ✅ |
| DR-SEED-01 | M | Starter tasks come from one function (`buildSeedTasks`) and pass every validation rule. | ENG | U `tasks.test.js` | ✅ |
| DR-SEED-02 | M | Starter and demo dates are generated relative to today. | HB | U `demo.test.js` | ✅ |
| DR-SEED-03 | M | The demo lives in `src/data/demo.js` and covers every enum value. | HB | U `demo.test.js` | ✅ |
| DR-SEED-04 | M | Demo content has no secrets and only example emails (`@example.com`). | DS | R | ✅ |
| DR-SEED-05 | S | Demo anchor URLs are marked placeholders (`https://example.com/…`). | HB | R | ✅ |
| NFR-DATA-01 | M | After an import, demo load or reset from the footer, focus moves to the board. | WCAG 2.4.3 | B | ✅ |

---

## 18. Storage, integrity and migration

**Purpose.** Never lose or corrupt the team's data. **Why it exists:** PR3, DS. There is no server to recover from, so the browser copy is the only copy.

### 18.1 Functional

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| FR-DATA-01 | M | Loaded data is normalised: defaults for missing fields; unknown status → `todo`, unknown type → `feature`. | DS | U `tasks.test.js` | ✅ |
| FR-DATA-02 | M | Corrupt storage never gives a blank screen: a safe state loads and a notice shows. | NH9 | R `useLocalStorage.js` | ✅ |
| FR-DATA-03 | S | A corrupt raw value is copied to `<key>.backup` first. | PR3 | R | ✅ |
| FR-DATA-06 | C | Two open tabs stay in sync through the `storage` event. | DS | B (two tabs) | ✅ |
| DR-STO-01 | M | Every key starts with `vibetracker.`. | DS | R `constants.js` | ✅ |
| DR-STO-02 | M | Values are JSON in localStorage only (no cookies, IndexedDB or sessionStorage). | DS | R | ✅ |
| DR-STO-03 | M | Tasks, anchors, team, workspace, prefs and meta have separate keys. | DS | R | ✅ |
| DR-STO-04 | M | State updates are immutable. | ENG | R | ✅ |
| DR-STO-05 | S | UI-only state (open dialogs, toasts, filters) is not stored. | DS | R | ✅ |
| DR-TASK-01 | M | Invalid input is blocked in the form with an inline error, never silently fixed. | NH5 | B | ✅ |
| DR-TASK-02 | M | `id` and `createdDate` never change (edit, move, hand-off, import, migration). | DS | U `schema.test.js` | ✅ |
| DR-TASK-03 | M | Date-only fields are local `YYYY-MM-DD`; timestamps are UTC ISO 8601, shown in local time. | DS | U `dates.test.js` | ✅ |
| DR-TASK-04 | M | Text keeps the full Unicode range (emoji, umlauts, code). | DS | B | ✅ |
| DR-TASK-05 | M | `type`, `status`, `contextTool` and `role` come from shared constants. | ENG | R `constants.js` | ✅ |
| DR-ANC-01 | M | Anchors are always exactly the four fixed slots (`DEFAULT_ANCHORS`). | DS | U `anchors.test.js` | ✅ |
| DR-ANC-02 | M | Only normalised http/https URLs are stored. | DS | U `anchors.test.js` | ✅ |
| DR-INT-01 | M | Non-JSON or non-array values → backup, safe state, notice. | DS | R | ✅ |
| DR-INT-02 | M | Entries that are not objects or have no title are dropped and counted. | DS | U `tasks.test.js` | ✅ |
| DR-INT-03 | M | Invalid fields take their defaults (§21.1). | DS | U `tasks.test.js` | ✅ |
| DR-INT-04 | M | Duplicate ids: the first keeps its id, later ones get new ids; nothing is lost. | DS | U `tasks.test.js` | ✅ |
| DR-INT-05 | M | An unknown assignee id is kept as stored and shown as "Unassigned". | DS | U `team.test.js` | ✅ |
| DR-INT-06 | M | Anchors are rebuilt into the four slots; invalid URLs become `null`. | DS | U `anchors.test.js` | ✅ |
| DR-INT-07 | S | Unknown extra fields are kept, so data survives round trips between versions. | DS | U `tasks.test.js` | ✅ |
| DR-INT-08 | S | Normalisation is idempotent. | ENG | U `tasks.test.js` | ✅ |
| DR-DER-01 | M | Derived values (due state, labels, counts, stale flag, prompt text, sort order) are computed, never stored; helpers take "today" / "now" as a parameter. | ENG | U `dates.test.js` | ✅ |
| DR-LIFE-01 | M | Each operation writes only its own fields plus the activity fields (move: `status`; hand-off: `assignee`; anchor edit: `url`). | DS | R `App.jsx` | ✅ |
| DR-LIFE-02 | M | Each operation persists in the same interaction. | PR3 | R | ✅ |
| DR-LIFE-03 | S | ~~The model has no history fields.~~ | — | — | ⤳ FR-ACT-01 / DR-MIG-01 v4 (history added as optional fields, as this rule allowed) |
| DR-MIG-01 | S | `vibetracker.meta.schemaVersion` records the version: v0 no context · v1 full model · v2 `contextHistory` · v3 team in storage, assignee = member id · **v4** attribution and activity. | DS | U `schema.test.js` | ✅ |
| DR-MIG-02 | M | One migration step (`runMigrations` in `main.jsx`) upgrades stored data before React reads it; a missing meta key counts as v0. | DS | U `schema.test.js` | ✅ |
| DR-MIG-03 | M | Migrations are additive and idempotent. v2 → v3 builds the team from every assignee name, so no owner is lost. | DS | U `schema.test.js` | ✅ |
| DR-MIG-04 | S | Data from a newer version is never written: the app is read-only and says "A newer version of Slopify saved this board. You can read it, but you cannot change it." | DS | U `schema.test.js`, B | ✅ |
| DR-CAP-02 | S | Above about 4 MB, a warning suggests export and trimming old contexts. | DS | R `AppData.jsx` | ✅ |
| DR-CAP-03 | M | A failed write is reported ("Slopify cannot save your changes. The browser storage is full. Export your board now.") and in-memory state is kept. | PR3, NH9 | R | ✅ |
| DR-PRIV-01 | M | All data stays in the browser; the app makes no network calls (Google Fonts excepted). | DS | R (grep: 0 network calls) | ✅ |
| DR-PRIV-02 | M | Personal data is limited to member names, optional emails and roles; users are told not to store secrets in Context. | Q6, DS | R | ✅ |
| DR-PRIV-03 | M | Data stays until the user resets (tasks + links) or deletes all data (every key), or clears site data. | DS | B | ✅ |
| DR-PRIV-04 | S | The footer says: "Slopify keeps your data in this browser only. Export the board to share it or to keep a copy." | DS, NH10 | B | ✅ |

### 18.2 Non-functional

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| NFR-REL-01 | M | No data loss on reload, tab close or browser restart. | PR3 | B | ✅ |
| NFR-REL-04 | S | A full or blocked storage is reported; the app keeps working in memory. | NH9 | R | ✅ |
| NFR-REL-05 | M | Data-model changes are additive with defaults. The one breaking change (assignee name → id, D8) ships with a lossless migration. | DS | U `schema.test.js` | ✅ |
| DR-CAP-01 | M | The app is designed for up to 200 tasks while meeting the 100 ms target. | DS, PR6 | M (§20.1) | ◐ 200 tasks: move 88 ms median, 128 ms worst; 100 tasks: 42 / 53 ms |

---

## 19. Cross-cutting non-functional requirements

These apply to every feature.

### 19.1 Usability (Nielsen's heuristics)

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| NFR-USE-01 | M | Every state change gives visible feedback within 100 ms (card move, toast, button state). | NH1, PR6 | M (§20.1, 100 tasks) | ✅ |
| NFR-USE-03 | M | Every dialog and popover closes with a button and with Esc; destructive actions confirm first. | NH3 | B | ✅ |
| NFR-USE-04 | M | One control per action everywhere (type picker, owner picker, copy button); one primary button per view; only design tokens. | NH4 | R | ✅ |
| NFR-USE-05 | M | Inline validation before save; destructive buttons are separated from primary ones. | NH5 | B | ✅ |
| NFR-USE-06 | M | Cards show type, owner, due state and context without opening the modal. | NH6, PR2 | B | ✅ |
| NFR-USE-08 | M | A card shows at most five pieces of information (type, due, title, owner, context); the description stays in the modal. | NH8 | B | ✅ |
| NFR-USE-09 | M | Errors say what happened and what to do, in plain words; no codes or stack traces. | NH9 | R | ✅ |
| NFR-USE-10 | S | Empty states and helper text teach the next action. | NH10 | B | ✅ |
| NFR-USE-11 | M | Interaction cost from the board: create ≤ 4 · move ≤ 2 · hand off ≤ 2 · copy 1 · add anchor ≤ 3. | NH7 | B | ◐ counts met; time-on-task (≤ 15 s) not measured with users |
| NFR-USE-12 | M | Targets are at least 24 × 24 px (smallest: 28 px owner select; 20 px checkboxes get a larger clickable label); primary buttons are 36 px tall. | WCAG 2.5.8 | R, A | ✅ |
| NFR-USE-13 | S | Hallway test: someone outside the team completes the primary flow unaided; fix the top 3 issues. | NH, HB | — | ○ team task |

### 19.2 Accessibility (WCAG 2.2 AA)

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| NFR-A11Y-01 | M | Text ≥ 4.5:1, large text ≥ 3:1, UI parts and the focus ring ≥ 3:1, in both themes and on every tint and glass level. | Q5, WCAG 1.4.3, 1.4.11 | M, A | ✅ |
| NFR-A11Y-02 | M | Colour is never the only signal (type, due state, owner, links). | Q5, PR5, WCAG 1.4.1 | A, R | ✅ |
| NFR-A11Y-03 | M | Everything works by keyboard in a logical order; the only focus trap is the modal, released by Esc. | Q5, WCAG 2.1.1, 2.1.2, 2.4.3 | B | ✅ |
| NFR-A11Y-04 | M | A visible 2 px focus ring (`focus-visible`); `outline-none` only with a replacement. | Q5, WCAG 2.4.7 | R | ✅ |
| NFR-A11Y-05 | M | Semantic HTML: buttons, links, labels, `<section>` + `<h2>` columns, lists, labelled landmarks (header, main "Board", footer "Data", search). | Q5, WCAG 1.3.1 | A | ✅ |
| NFR-A11Y-06 | M | Icon-only buttons have an `aria-label`; tooltips are never the only label. | Q5, WCAG 4.1.2 | A | ✅ |
| NFR-A11Y-07 | M | Form errors use `aria-invalid` / `aria-describedby`; status messages use live regions. | Q5, WCAG 3.3.1, 4.1.3 | A | ✅ |
| NFR-A11Y-08 | S | A single-pointer alternative to dragging exists (there is no drag at all). | WCAG 2.5.7 | R | ✅ |
| NFR-A11Y-09 | S | Reduced motion (OS or Settings) removes all transitions. | Q5, WCAG 2.3.3 | R `index.css` | ✅ |
| NFR-A11Y-10 | S | At 200 % zoom everything stays usable. | Q5, WCAG 1.4.4 | B | ✅ |
| NFR-A11Y-11 | S | Lighthouse accessibility ≥ 90 and zero critical axe issues on the deployed build. | Q5 | A (dev + production preview) | ◐ axe: 0 violations; Lighthouse on the deployed URL not yet run |
| NFR-A11Y-12 | M | Content reflows down to 320 px wide with no horizontal page scroll (replaces the old "desktop only" rule). | Q5, WCAG 1.4.10 | B (375, 768, 1024, 1366 px) | ✅ |
| NFR-A11Y-13 | M | Each card's open button is named by the title and described by a sentence: type, due state, owner with role, context and versions. | Q5, WCAG 1.3.1 | B | ✅ |
| NFR-A11Y-14 | M | Every scrollable region (help, prompt preview, history text, activity) is keyboard-focusable. | Q5, WCAG 2.1.1 | A | ✅ |
| NFR-A11Y-15 | M | Text size up to 130 % (Settings) on top of browser zoom; fonts chosen for low vision and dyslexia (Atkinson Hyperlegible, Lexend). | Q5 ("font size") | B | ✅ |
| NFR-UI-06 | M | ~~Desktop only, 1280 px and up.~~ | — | — | ⤳ NFR-A11Y-12 |

### 19.3 Visual design

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| NFR-UI-01 | M | All colours come from tokens (CSS variables). The only inline colour is the data-driven accent swatch in Settings. | ENG, NH4 | R | ✅ |
| NFR-UI-02 | M | Fonts follow DESIGN.md §3 and load with `display=swap` and fallbacks. | Q5 | R `index.html` | ✅ |
| NFR-UI-03 | M | Components follow DESIGN.md §4. | NH4 | R | ✅ |
| NFR-UI-04 | M | DESIGN.md §5 wording is used as written. | PR7 | R | ✅ |
| NFR-UI-05 | M | Animation is limited to DESIGN.md §4.17 (toast fade, hover shadow, chevron turn), and all of it stops with reduced motion. | NH8, WCAG 2.3.3 | R | ✅ |
| NFR-UI-07 | S | Interactive elements have default, hover, focus, active and disabled states; a disabled control says why. | NH1 | R | ✅ |
| NFR-UI-08 | S | 4 px spacing scale; consistent radii and borders. | NH4 | R | ✅ |
| NFR-UI-10 | S | Real content is safe: titles clamp, long strings wrap, 30+ cards per column stay usable. | NH8 | B | ✅ |

### 19.4 Performance

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| NFR-PERF-01 | M | Opening the modal, moving a card and typing respond in under 100 ms with 100 tasks. | PR6 | M (16 / 42 / 5 ms median) | ✅ |
| NFR-PERF-02 | S | Production JS ≤ 250 KB gzipped; the deployed build loads in under 2 s. | HB | M (85 KB gz JS + 6.7 KB CSS) | ◐ size met; deployed load time not measured |
| NFR-PERF-03 | S | No visible layout shift on load (CLS < 0.1). | NH8 | M (CLS 0) | ✅ |
| NFR-PERF-04 | S | Dependencies only when they save real time. Runtime: React, React DOM, lucide-react. Dev: Vite, Tailwind, Vitest. | ENG | R `package.json` | ✅ |

### 19.5 Reliability

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| NFR-REL-02 | M | An error boundary with Reload and Export my data (FR-APP-09). | NH9 | R | ✅ |
| NFR-REL-03 | M | Zero console errors or warnings in development and production. | ENG | B (dev + production preview) | ✅ |

### 19.6 Security and privacy

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| NFR-SEC-03 | M | No analytics, tracking or third-party calls except Google Fonts; no secrets in the repo. | DS | R | ✅ |
| NFR-SEC-04 | S | Users are told that data is unencrypted and stays in this browser (footer, Context helper, log-in screen). | DS, Q10 | B | ✅ |
| NFR-SEC-05 | M | The log-in is identity, not access control. This is stated in the UI and in PRD §12; real authentication needs a backend and is out of scope. | Q10, R2 | R | ✅ |

### 19.7 Compatibility

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| NFR-COMP-01 | M | Works in the latest Chrome, Edge and Firefox (Should: Safari). | Q9 | B (Chromium only) | ◐ Firefox and Safari not yet checked |

### 19.8 Maintainability

| ID | Pri | Requirement | Why | Check | Status |
|---|---|---|---|---|---|
| NFR-MAINT-01 | M | Stage, type, tool and role ids and labels come from shared constants. | ENG | R | ✅ |
| NFR-MAINT-02 | M | Logic lives in pure helpers (`src/lib/*`): dates, due state, prompt, URLs, normalisation, migration, team, activity, colour, transfer. | ENG | U | ✅ |
| NFR-MAINT-03 | M | `npm run build` passes before every commit and tag. | ENG | M | ✅ |
| NFR-MAINT-04 | S | Components are split by responsibility (`src/components`, `src/components/settings`, `src/context`). | ENG | R | ✅ |
| NFR-MAINT-05 | S | PRD, DESIGN.md and this file stay current when behaviour changes. | ENG | R | ✅ |
| NFR-MAINT-06 | C | Vitest unit tests cover every pure helper (11 files, 67 tests). | ENG | U | ✅ |

---

## 20. Evidence

### 20.1 Measurements (2026-10-28)

Production build (`npm run build` + `vite preview`), Chromium, 1366 × 800. Times run from the user action until React has rendered (7 runs each).

| What | Board size | Median | Worst | Target |
|---|---|---|---|---|
| Move a card | 100 tasks | 42 ms | 53 ms | < 100 ms ✅ |
| Open the task modal | 100 tasks | 16 ms | 21 ms | < 100 ms ✅ |
| Type in the title | 100 tasks | 5 ms | 6 ms | < 100 ms ✅ |
| Move a card | 200 tasks | 88 ms | 128 ms | < 100 ms ◐ |
| Search keystroke | 200 tasks | — | 57 ms | < 100 ms ✅ |
| Layout shift on load (CLS) | 200 tasks | 0 | — | < 0.1 ✅ |
| Storage used | 200 tasks × 2,000-character context | 0.9 MB | — | < 4 MB warning ✅ |
| JS bundle (gzip) | — | 85 KB | — | ≤ 250 KB ✅ |
| Console errors (production) | — | 0 | — | 0 ✅ |

### 20.2 Accessibility scans

axe-core 4.10.2 on the **production build**, in the light and the dark theme: zero violations on the log-in screen, the board, the profile menu (open), the task modal with every disclosure open, each Settings tab (Project & team with the add-member form open), and the Help dialog. The dev build also passed at 375 px (dark) with the filter row open.

*Method note:* each theme is scanned after a reload. When the theme is switched live in a background test window, the 150 ms colour transitions do not finish, so axe reads half-changed colours. A visible window finishes them at once.

### 20.3 Unit tests

`npm test`: 11 files, 67 tests, all passing. The tests cover dates and due states, anchors and URLs, prompt history, schema migration (v0 → v4), team rules, the prompt template, colour contrast, export / import, task normalisation, search and filters, activity, and the demo data.

---

## 21. Data dictionaries

### 21.1 Task

| Field | Type | Default | Rules | Set by |
|---|---|---|---|---|
| `id` | string | `crypto.randomUUID()` | Unique, never changes | System |
| `title` | string | — | Trimmed, 1–120 chars, one line | User |
| `description` | string | `''` | ≤ 2,000 chars, line breaks kept | User |
| `type` | `'feature' \| 'bug'` | `'feature'` | From `TYPES` | User |
| `status` | `'todo' \| 'in-progress' \| 'review' \| 'done'` | `'todo'` or the column | From `STAGES` | User |
| `assignee` | member id \| `null` | the logged-in profile | Unknown ids are kept and shown as Unassigned | User |
| `dueDate` | `YYYY-MM-DD` \| `null` | `null` | Real local date; empty → `null` | User |
| `createdDate` | `YYYY-MM-DD` | today (local) | Never changes | System |
| `context` | string | `''` | Verbatim; warning above 20,000 chars | User |
| `contextTool` | tool \| `null` | `null` | From `CONTEXT_TOOLS` | User |
| `contextUpdatedAt` | ISO \| `null` | `null` | Only when context or tool changed | System |
| `contextHistory` | version[] | `[]` | Newest first, ≤ 20 | System |
| `createdBy` | member id \| `null` | the logged-in profile | `null` for tasks before v4 | System |
| `updatedBy` / `updatedAt` | member id / ISO \| `null` | from the newest activity | — | System |
| `activity` | entry[] | `[{ type: 'created' }]` | Newest first, ≤ 50 | System |

### 21.2 Member

| Field | Type | Rules |
|---|---|---|
| `id` | string | Unique, never changes |
| `name` | string | 1–40 chars, unique ignoring case |
| `email` | string \| `null` | Optional; shape-checked; contact only |
| `role` | role id \| `null` | `swe`, `architect`, `senior`, `junior`, `ux`, `database`, `other` |
| `createdAt` | ISO \| `null` | — |

### 21.3 Workspace

| Field | Type | Rules |
|---|---|---|
| `projectName` | string | Required, ≤ 60 chars |
| `teamName` | string | Optional, ≤ 60 chars |
| `leadId` | member id \| `null` | The team lead badge; falls back to the first member |

### 21.4 Anchor and prefs

- **Anchor:** `{ id: 'presentation' | 'demo' | 'report' | 'documentation', label, url: http(s) URL ≤ 2,048 chars | null }`, always four.
- **Prefs** (per browser, never exported): `currentMemberId`, `lastSeen` (member id → ISO), `theme`, `textSize`, `accent` (preset id or `#rrggbb`), `motion`, `transparency`, `promptIncludesLinks`, `welcomeDismissed`.

### 21.5 Storage keys and export format

| Key | Contents |
|---|---|
| `vibetracker.tasks` | `Task[]` |
| `vibetracker.anchors` | `Anchor[4]` |
| `vibetracker.team` | `Member[]` (≥ 1) |
| `vibetracker.workspace` | `Workspace` |
| `vibetracker.prefs` | prefs |
| `vibetracker.meta` | `{ schemaVersion: 4 }` |
| `vibetracker.<key>.backup` | the raw text of a damaged value |

```json
{
  "app": "vibetracker",
  "schemaVersion": 4,
  "exportedAt": "2026-10-28T14:32:00.000Z",
  "workspace": { "projectName": "…", "teamName": "…", "leadId": "…" },
  "team": [],
  "tasks": [],
  "anchors": []
}
```

---

*REQUIREMENTS.md · Slopify schema v4 · replaces PRD §14.2–§14.5 and §14.7.*
