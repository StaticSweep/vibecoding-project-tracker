# Slopify — Design

**Status:** Complete for `design-done` (M3). The tokens in §2 go into `tailwind.config.js`. The fonts in §3 go into `index.html`.

**Who owns this.** One developer builds Slopify. Slopify is a tool for **teams**. All design decisions in this document are for a team of users.

**Why this file exists.** This document gives the visual rules for Slopify. Use it for every screen, component and line of text. If a rule in this document and a rule in PRD §14 are different, the PRD is correct. Then, change this document.

---

## 0. Writing standard

This document uses **ASD-STE100 Simplified Technical English (STE)**. Use the same standard for all UI text (§5).

- Use only approved STE words. Technical names (for example *Kanban*, *token*, *localStorage*, *Tailwind*) are permitted.
- Use one word for one meaning. This document uses *card* (not *tile*), *stage* (not *lane*), *column* for the visual area of a stage, and *context* (not *prompt history*).
- Write procedures in the imperative. Each procedural sentence has a maximum of 20 words and one instruction.
- Each descriptive sentence has a maximum of 25 words. Each paragraph has a maximum of 6 sentences.
- Use the active voice. Do not use words that end in *-ing* as nouns, except technical names (for example *padding*, *heading*).

**Feature names.** Some PRD feature names are not STE words, for example *Hand off to…*. These names are technical names. Do not change them.

---

## 1. Mood / vibe

**Mood:** Slopify is calm, clear and fast. The tool stays quiet, and the work of the team stays in front.

**References:**

- **Linear** — Dense, quiet lists. Colour shows only status and priority.
- **Things 3** — Calm white space. Soft surfaces. Each screen has one clear primary action.
- **GitHub Projects** — Clear columns and small, readable badges. The team can see who owns each item.

**Anti-references (do not look like these):**

- **Jira** — Too many fields, too many colours, too many menus on one card.
- Dashboards with gradients, glow effects and default Tailwind blue.

**Design principles.** These principles come from PRD §14.1.

1. The board is the home screen. Each action is a maximum of two clicks from the board.
2. Colour is never the only signal. Each colour has a text label or an icon.
3. Each meaning has its own hue. Two different meanings never use the same hue.
4. Each view has one primary button.

---

## 2. Colour palette

**Rules for colour:**

- Use only the tokens in this section. Do not write hex values in JSX (NFR-UI-01).
- Do not use default Tailwind blue as a brand colour.
- Each hue has one meaning:

| Hue | Meaning |
|---|---|
| Teal | Brand: primary buttons, links, focus ring |
| Indigo | Task type: feature |
| Magenta | Task type: bug |
| Green | Due state: safe |
| Amber | Due state: warning |
| Red | Due state: overdue, and the confirm-delete button |
| Slate | Due state: neutral (done), avatars, borders, muted text |

**Shades.** Each semantic colour has three shades:

| Shade | Tailwind suffix | Use |
|---|---|---|
| Strong | *(none)* | Stripes, borders, icons. Contrast is a minimum of 3:1 on `surface-card`. |
| Tint | `-bg` | Backgrounds of cards and badges. |
| Text | `-fg` | Text on the tint. Contrast is a minimum of 4.5:1 on the tint. |

All contrast values in this section use the WCAG 2.2 formula.

### 2.1 Brand and surface

| Token | Tailwind class example | Hex | Where it shows | Contrast |
|---|---|---|---|---|
| `brand-primary` | `bg-brand-primary` | `#155E63` | Header wordmark, "+" button, primary buttons, links, focus ring | 7.46:1 on card · white text on it 7.46:1 · 6.96:1 on page |
| `brand-primary-hover` | `bg-brand-primary-hover` | `#0E4A4E` | Primary button on hover and press | White text on it 9.96:1 |
| `brand-accent` | `bg-brand-accent` | `#E3F1F1` | Highlights, hover background of secondary and ghost buttons, selected filter | `brand-primary` text on it 6.44:1 |
| `surface-page` | `bg-surface-page` | `#F6F7F9` | Page background, column background | — |
| `surface-card` | `bg-surface-card` | `#FFFFFF` | Cards, modal, Anchor Board slots, inputs | — |
| `text-primary` | `text-ink` | `#1E2430` | Body text, card titles | 15.55:1 on card · 14.51:1 on page |
| `text-muted` | `text-ink-muted` | `#5B6472` | Captions, dates, counts, helper text | 5.98:1 on card · min. 5.27:1 on all tints |
| `line-subtle` | `border-line-subtle` | `#D5D9E0` | Card borders, dividers (decoration only) | 1.42:1 — do not use for controls |
| `line-strong` | `border-line-strong` | `#8A93A3` | Input borders, checkbox borders, avatar ring | 3.10:1 on card |
| `danger` | `bg-danger` | `#B91C1C` | The confirm button in the delete dialog only | White text on it 6.47:1 |

**Token names.** In this document, the text tokens have the names `text-primary` and `text-muted`. In Tailwind, these tokens have the name `ink`, to prevent the class name `text-text-primary`.

### 2.2 Task type (M6 `tag-style`)

| Token | Strong | Tint (`-bg`) | Text (`-fg`) | Where it shows | Contrast |
|---|---|---|---|---|---|
| `type-feature` | `#4338CA` | `#EEF0FF` | `#3730A3` | Left stripe (4 px) of feature cards, feature badge, type control in the modal | Stripe 7.90:1 · badge text 8.77:1 |
| `type-bug` | `#A21CAF` | `#FBEFFC` | `#86198F` | Left stripe (4 px) of bug cards, bug badge, type control in the modal | Stripe 6.32:1 · badge text 7.40:1 |

**Rules:**

- Show the type with the stripe, an icon and a text label. Use the Lucide icon `sparkles` for a feature and `bug` for a bug.
- The type uses the **stripe and badge only**. The type never changes the card background.
- Bug magenta is not red. A bug card must not look like an error or a delete warning (PRD §14.6 #2).

### 2.3 Due-date states (M8 `due-tint`)

**Agreed rule (PRD §14.6 #1).** A due date of tomorrow is a *warning*. Calculate the state with local calendar dates.

| Token         | Strong    | Tint (`-bg`)   | Text (`-fg`) | When used                                               | Label                       | Icon (Lucide)    | Contrast                                 |
| ------------- | --------- | -------------- | ------------ | ------------------------------------------------------- | --------------------------- | ---------------- | ---------------------------------------- |
| `due-safe`    | `#15803D` | `#EDF7F0`      | `#166534`    | Due in 2 days or more                                   | "Due in 5 days"             | `calendar`       | Label 6.51:1 · body text on tint 14.19:1 |
| `due-warning` | `#B45309` | `#FFF6E5`      | `#92400E`    | Due today or tomorrow                                   | "Due today", "Due tomorrow" | `clock`          | Label 6.61:1 · 14.49:1                   |
| `due-overdue` | `#B91C1C` | `#FDEDED`      | `#991B1B`    | The due date is before today                            | "Overdue · 2 days"          | `alert-triangle` | Label 7.33:1 · 13.71:1                   |
| `due-neutral` | `#64748B` | `#F1F3F6`      | `#475569`    | The task is in the Done stage (the date does not apply) | "Done"                      | `check-circle`   | Label 6.82:1 · 13.99:1                   |
| *(none)*      | —         | `surface-card` | —            | The task has no due date                                | No label                    | —                | —                                        |

**Rules:**

- The due state changes the **card background** (tint) and the **due label** (text colour and icon). The due state does not change the type stripe.
- On a tinted card, `text-muted` and `text-primary` stay readable (min. 5.27:1).
- The Done state overrides the date. A done task never shows red.

### 2.4 Avatars (M7 `task-owner`)

Avatars do **not** use colour to identify a person. The initials and the name identify the person. This keeps the hues in §2 free for their meanings. This also works for teams of all sizes.

| Part | Token | Contrast |
|---|---|---|
| Circle background | `due-neutral-bg` (`#F1F3F6`) | — |
| Initials | `text-primary` (`#1E2430`), body font, 12 px, semibold | 13.99:1 |
| Ring | 1 px `line-strong` (`#8A93A3`) | 3.10:1 on card |
| Unknown assignee | Lucide `user` icon, no initials, label "Unassigned" | — |

- The avatar is 24 × 24 px (the minimum target size).
- The name shows next to the avatar or in the accessible name of the avatar. Do not show the name only in a tooltip.

### 2.5 Contrast pairs to check

Do this check after each change to §2. Use a WCAG contrast checker.

1. Check each text pair in the tables above. The minimum is 4.5:1.
2. Check each stripe, border and focus ring. The minimum is 3:1.
3. Check `text-muted` on each tint. The minimum is 4.5:1.
4. Look at the board in a colour-blindness simulator (Chrome DevTools → Rendering → *Emulate vision deficiencies*).
5. Make sure that each state is clear from its label and icon alone.

---

## 3. Typography

All fonts come from Google Fonts. These fonts help readers with low vision and readers with dyslexia.

| Role | Font | Fallback stack | Why |
|---|---|---|---|
| Heading | **Lexend** | `system-ui, sans-serif` | Lexend has wide letter spacing. Research shows that it can make reading faster. It is clear for short, large labels. |
| Body | **Atkinson Hyperlegible Next** | `system-ui, -apple-system, "Segoe UI", sans-serif` | The Braille Institute made this font for readers with low vision. Letters such as I, l and 1 have different shapes. |
| Monospace (context, badges, dates, code) | **Atkinson Hyperlegible Mono** | `ui-monospace, "Cascadia Mono", Consolas, monospace` | It has the same letter shapes as the body font. Characters such as 0 and O stay different in pasted prompts and code. |

**Load the fonts:**

1. Add `preconnect` links for `fonts.googleapis.com` and `fonts.gstatic.com`.
2. Load only the weights in the size scale below.
3. Use `display=swap`. The text shows immediately in the fallback font (NFR-PERF-03).

**Size scale:**

| Role | Font | Size / line height | Weight | Notes |
|---|---|---|---|---|
| Wordmark | Lexend | 24 / 32 px | 600 | `brand-primary` |
| Page subtitle (tagline) | Atkinson Hyperlegible Next | 14 / 20 px | 400 | `text-muted` |
| Modal heading | Lexend | 20 / 28 px | 600 | — |
| Column heading | Lexend | 14 / 20 px | 600 | Uppercase, letter spacing 0.05 em, with the task count |
| Card title | Atkinson Hyperlegible Next | 15 / 22 px | 600 | Maximum 2 lines, then an ellipsis (FR-M4-13) |
| Body and form text | Atkinson Hyperlegible Next | 16 / 24 px | 400 | Modal fields and dialogs |
| Card meta (assignee, due label) | Atkinson Hyperlegible Next | 14 / 20 px | 400 | — |
| Caption | Atkinson Hyperlegible Next | 13 / 18 px | 400 | `text-muted` |
| Badge | Atkinson Hyperlegible Mono | 12 / 16 px | 600 | Uppercase, letter spacing 0.04 em |
| Context field | Atkinson Hyperlegible Mono | 14 / 22 px | 400 | Keep all spaces and line breaks |

**Rules:**

- Do not use text smaller than 12 px. Use 12 px for badges and avatar initials only.
- Use uppercase only for column headings and badges.
- Body text has a line height of a minimum of 1.5.
- Lines of body text in the modal have a maximum width of approximately 70 characters.

---

## 4. Component principles

### 4.1 Layout

- The minimum viewport is 1280 × 720 px. At 1024 px, the board scrolls horizontally (NFR-UI-06). Mobile is out of scope.
- The page has 24 px of padding.
- The order from top to bottom is: header, Anchor Board, board, footer.
- The Anchor Board has a maximum height of 120 px. The board stays above the fold (FR-M11-08).
- The board has four columns of equal width, with a 16 px gap. Each column has a minimum width of 260 px.
- Each column scrolls vertically. The header and the Anchor Board do not scroll with the columns (FR-M4-12).

### 4.2 Spacing, corners, borders and shadows

| Item | Rule |
|---|---|
| Spacing | Use a 4 px scale: 4, 8, 12, 16, 24, 32 px. |
| Corner radius | Badges and avatars: full. Buttons and inputs: 6 px (`rounded-md`). Cards and anchor slots: 8 px (`rounded-lg`). Modal: 12 px (`rounded-xl`). |
| Borders | Cards: 1 px `line-subtle`. Inputs: 1 px `line-strong`. |
| Shadows | Cards have no shadow at rest. Cards get `shadow-sm` on hover and focus. The modal gets `shadow-xl`. |

### 4.3 Card anatomy

A card shows a maximum of five items (NFR-USE-08). The description does not show on the card.

```
┌─┬──────────────────────────────────────────┐
│▌│ [FEATURE]           ⏰ Due tomorrow [⧉]   │  ← type badge · due label (M6, M8) · copy (M10)
│▌│ Card title, maximum two lines, then …    │  ← card title
│▌│ (AB) Alex B. ▾           ✦ Claude · v4   │  ← avatar + Hand off to… · context + versions (M9, M12)
│▌│ [Stage ▾]                       [←] [→]  │  ← move controls
└─┴──────────────────────────────────────────┘
 ↑ 4 px type stripe (type-feature or type-bug)
   card background = due tint (§2.3)
```

### 4.4 Cards

- Cards are light. A 1 px border gives the only weight. A small shadow shows on hover.
- The full card is a button that opens the modal in edit mode (FR-M5-08).
- Controls on the card (copy, Hand off to…, stage, move buttons) do not open the modal (FR-M7-04).
- When a card is in focus, it shows the focus ring (§4.12).

### 4.5 Move controls (no drag)

**Decision (closes PRD §14.6 #3).** Slopify does not use drag-and-drop. Use the stage dropdown and the move buttons.

- Each card has a stage dropdown with the four stage labels from PRD §7.
- Each card has a ← button and a → button. The ← button is not available in To Do. The → button is not available in Done.
- Each move button has an accessible name, for example "Move to Review".
- After a move, the focus stays on the card in its new column.

### 4.6 Buttons

| Type | Look | Use |
|---|---|---|
| Primary | Solid `brand-primary`, white text; `brand-primary-hover` on hover | One per view: "Add task", "Create task", "Save changes" |
| Secondary | `surface-card`, 1 px `line-strong` border, `text-primary`; `brand-accent` on hover | "Cancel", "Export", "Insert template" |
| Ghost | No border, `text-muted`; `brand-accent` on hover | Icon buttons on cards, the close button of the modal |
| Destructive | Outline: 1 px `line-strong`, `text-primary`, Lucide `trash-2` icon | "Delete task" in the modal. It is not red (PRD §14.6 #2). |
| Danger | Solid `danger`, white text | The confirm button in the delete dialog only |

**Rules:**

- Buttons have no gradients.
- Buttons have a minimum height of 32 px. Icon buttons are a minimum of 24 × 24 px (NFR-USE-12).
- Each button has these states: default, hover, focus, active, disabled (NFR-UI-07).
- A disabled button has 50 % opacity. It has a tooltip or helper text that tells why it is disabled.
- Each icon-only button has an `aria-label` (NFR-A11Y-06).

### 4.7 Form fields

- Each field has a visible label above the field. Do not use a placeholder as the label.
- Inputs have a 1 px `line-strong` border, `surface-card` background and 16 px text.
- An invalid field gets a 2 px `due-overdue` border, an error icon and an error message below the field. The field gets `aria-invalid` and `aria-describedby` (NFR-A11Y-07).
- Helper text is `text-muted`, 13 px, below the field.
- The type control is a segmented control. Each part shows the type icon, the label and the type colour (FR-M6-03).
- The Context field uses the monospace font. It has a minimum of 6 rows, and the user can change its height (FR-M9-01).

### 4.8 Modal

- The modal is in the centre of the screen. Its maximum width is 640 px.
- The backdrop is `text-primary` at 50 % opacity.
- The modal heading is "New task" or "Edit task" (FR-M5-07).
- The action bar is at the bottom and stays visible. "Delete task" is on the left. "Cancel" and the primary button are on the right (FR-M5-12).
- If the modal is taller than the viewport, the body of the modal scrolls (FR-M5-19).

### 4.9 Confirm dialog

- The confirm dialog is a small modal with a maximum width of 400 px.
- The dialog has one question, one sentence about the result, and two buttons.
- The focus starts on "Cancel" (FR-APP-06).

### 4.10 Toasts

- Toasts show at the bottom right of the screen. A maximum of 3 toasts show at the same time.
- A toast has `text-primary` as its background and white text. A toast for an error has an alert icon in `due-overdue-bg`. The strong `due-overdue` colour has too little contrast on the dark toast.
- Toasts fade in and fade out in 200 ms. They close after 4 seconds. Each toast has a close button.
- Toasts use an `aria-live="polite"` region (FR-APP-05).

### 4.11 Empty states

- An empty state has a 1 px dashed `line-strong` border, `text-muted` text and one next action.
- Empty states are never sad. They tell the user what to do next.

### 4.12 Focus

- Each focusable item shows a 2 px `brand-primary` ring with a 2 px offset. Use `focus-visible`.
- Never remove the outline without a replacement (NFR-A11Y-04).

### 4.13 Anchor Board

- The Anchor Board has four slots in this order: Presentation, Demo, Report, Documentation.
- An empty slot has the empty-state style and the text "Add link".
- A filled slot shows the label, the host name of the link and a Lucide `external-link` icon.
- The link opens in a new tab. A separate pencil button opens the edit field (FR-M11-06).
- Above the slots, a caption shows the progress, for example "2 of 4 links added".

### 4.14 Header and footer

- The header shows the wordmark, the tagline, the filters and the "Add task" button.
- The "Add task" button is always visible (FR-APP-04).
- The footer shows the privacy note (§5) and the "Export", "Load demo data" and "Reset board" buttons.

### 4.15 Icons

- Use [Lucide icons](https://lucide.dev) only. The size is 16 px on cards and 20 px in the header.
- An icon never shows without a text label or an accessible name.

### 4.16 Prompt history timeline (M12)

- The timeline is in the edit modal, below the Context field. It is a disclosure with the title "Prompt history" and the number of versions.
- The timeline opens automatically when a task has more than one version.
- The newest version is at the top. A vertical `line-subtle` line connects the versions.
- The current version has a filled `brand-primary` dot. Earlier versions have an empty `line-strong` dot.
- Each version shows its number, its age and its tool. Each version has "Show", a copy icon and "Restore". The current version has no "Restore".
- "Restore" puts the text in the Context field and moves the focus there. The user must save to keep it.
- On the card, the context indicator shows the number of versions, for example "Claude · v4". If the space is too small, the tool name is cut, not the owner name.

### 4.17 Motion

- Toasts fade in 200 ms. Card hover shadows change in 150 ms.
- There is no other animation.
- When the user sets `prefers-reduced-motion`, remove all animation (NFR-A11Y-09).

---

## 5. Voice / microcopy

**Rules:**

- Use STE (§0). Use short, direct sentences.
- Speak to the user as "you".
- Tell the user what happened and what to do next (NFR-USE-09).
- Do not show error codes. Do not show stack traces.
- Use the stage labels from PRD §7 exactly.

**Required lines:**

| Where | Text |
|---|---|
| "+" button label | **Add task** |
| Empty column placeholder | **No tasks here. Add a task or move a task to this stage.** |
| Toast after "Copy as Prompt Context" | **Copied. Paste it into your AI tool.** |
| Confirm-delete message | **Delete this task? You cannot undo this.** |
| Handoff toast (M7 `task-owner`) | **You gave this task to {name}.** |

**Other lines:**

| Where | Text | Requirement |
|---|---|---|
| Header tagline | Track the task. Keep the context. | FR-APP-01 |
| Column "+" button (accessible name) | Add task to {stage} | FR-M5-06 |
| Modal headings | New task · Edit task | FR-M5-07 |
| Modal primary button | Create task · Save changes | FR-M5-07 |
| Delete button in modal | Delete task | FR-M5-12 |
| Title error | Type a title for the task. | FR-M5-04 |
| Title near limit | {n} of 120 characters | FR-M5-05 |
| Close with changes | Close without saving? You will lose your changes. | FR-M5-11 |
| Past due date | This date is in the past. You can save it. | FR-M8-07 |
| Due labels | Overdue · {n} days · Due today · Due tomorrow · Due in {n} days · Done | FR-M8-02 |
| Hand-off control | Hand off to… | FR-M7-02 |
| Unknown assignee | Unassigned | FR-M7-05 |
| Move buttons (accessible name) | Move to {stage} | FR-M4-07 |
| Filter with no result | No tasks agree with this filter. Clear the filter to see all tasks. | FR-M6-05, FR-M7-08 |
| Context label | Context | FR-M9-01 |
| Context helper text | Write what the next person or AI tool must know. Do not put passwords or API keys here. | FR-M9-02, FR-M9-10 |
| Insert template button | Insert template | FR-M9-09 |
| Context template headings | Goal · Done so far · Limits · Files · Last prompt · Next step | FR-M9-09 |
| Context tool label | Tool | FR-M9-03 |
| Context updated | Updated {time} ago | FR-M9-05 |
| Long context | This context is very long. The browser can keep approximately 5 MB of data. | FR-M9-11 |
| Old context | The context is more than 3 days old. | FR-M9-12 |
| Copy button | Copy as Prompt Context · Copied | FR-M10-01, FR-M10-06 |
| No context in prompt | No context recorded yet. | FR-M10-08 |
| Copy failed | Slopify cannot copy the text. Select the text and push Ctrl+C (Cmd+C on a Mac). | FR-M10-03 |
| Empty anchor slot | Add link | FR-M11-03 |
| Anchor progress | {n} of 4 links added | FR-M11-07 |
| Invalid anchor URL | Use a web address that starts with http:// or https://. | FR-M11-05 |
| Undo (in toasts) | Undo | FR-M5-14, FR-M7-07 |
| Load demo data (confirm) | Replace your board with demo data? You cannot undo this. | FR-M13-03 |
| Reset board (confirm) | Delete all tasks and links? You cannot undo this. | FR-M13-05 |
| Storage full | Slopify cannot save your changes. The browser storage is full. Export your board now. | DR-CAP-03, NFR-REL-04 |
| Damaged data | Slopify cannot read some saved data. A backup copy is in the browser. | DR-INT-01 |
| Newer data version | A newer version of Slopify saved this board. You can read it, but you cannot change it. | DR-MIG-04 |
| Error screen | Slopify has a problem. Reload the page. If the problem continues, export your data. | NFR-REL-02 |
| Footer privacy note | Slopify keeps your data in this browser only. Export the board to share it or to keep a copy. | DR-PRIV-04 |
| Timeline title | Prompt history · {n} versions | M12 |
| Version row | Version {n} (current) · {time} ago · {tool} | M12 |
| Version buttons | Show · Hide · Restore | M12 |
| Restore tooltip | Put this version in the Context field. Save to keep it. | M12 |
| Card version count | {tool} · v{n} | M12 |

---

## 6. Logo / wordmark

- **Product name:** Slopify
- **Wordmark style:** The word "Slopify" in Lexend, 24 px, weight 600, `brand-primary`. There is no icon.
- **Tagline:** "Track the task. Keep the context." Use the same tagline in PRD §11.
- **Browser tab title:** Slopify

---

## 7. Out of scope (this hackathon)

These items are not part of `design-done`:

- A dark mode toggle. Slopify has one light mode.
- Multiple themes. One brand applies to all screens.
- Animation other than the items in §4.17.
- Drag-and-drop (§4.5).
- A custom icon set. Use Lucide icons only.
- Colour as the identity of a person (§2.4).

---

## 8. Accessibility checks

Do these checks before you push each tag from M4 to M13. The target is WCAG 2.2 AA on desktop.

1. Do the contrast checks in §2.5.
2. Do not use the mouse. Do the PRD §4 user flow with the keyboard only.
3. Make sure that the focus ring shows on each item.
4. Open the modal. Make sure that the modal keeps the focus.
5. Push Esc. Make sure that the focus goes back to the item that opened the modal.
6. Set the browser zoom to 200 %. Make sure that you can use all functions.
7. Set `prefers-reduced-motion`. Make sure that no animation occurs.
8. Do a scan with Lighthouse or axe DevTools. The Lighthouse accessibility score must be a minimum of 90. There must be no critical issues.

---

## 9. Traceability

| DESIGN.md section | PRD §14 requirements |
|---|---|
| §1 Mood | §14.1 principles, NFR-UI-01 |
| §2 Colour palette | FR-M6-01…04, FR-M8-01…05, FR-M7-01/06, NFR-A11Y-01/02, NFR-UI-01/09, §14.6 #1 and #2 |
| §3 Typography | FR-M4-13, FR-M9-01, NFR-UI-02, NFR-PERF-03 |
| §4 Components | FR-APP-04…06, FR-M4-07/12/13, FR-M5-07/12/15–19, FR-M7-04, FR-M9-01, FR-M11-03/06–08, NFR-USE-08/12, NFR-A11Y-04/06/07/09, NFR-UI-05…08, §14.6 #3 |
| §5 Microcopy | NFR-USE-02/09/10, NFR-UI-04 and the FR and DR items in the table |
| §6 Wordmark | FR-APP-01, FR-APP-03 |
| §8 Accessibility checks | NFR-A11Y-01…11, §14.5 |

---

*DESIGN.md version: Slopify v1 · based on hackathon-starter v1*
