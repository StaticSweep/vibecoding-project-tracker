import { addDays } from '../lib/dates.js';
import { DEFAULT_ANCHORS } from '../lib/anchors.js';
import { createId } from '../lib/ids.js';

/**
 * Demo board for the pitch (FR-M13-01/02, DR-SEED-03…05).
 *
 * - 12 tasks: three per stage, both types, every due state, all six members.
 * - Six members, one per role from the Q&A target audience. Dana is the
 *   team lead, so Slopify acts as Dana after the demo loads.
 * - Five tasks carry curated context; two have earlier prompt versions.
 * - Every task has a creator and an activity history; Dana handed four
 *   tasks to the team, so logging in as Jo or Priya shows the notice.
 * - Dates are relative to `today`, so the due tints are right on pitch day.
 * - Anchor links are clearly marked placeholders (example.com). Replace
 *   them with the real deliverables before the pitch (DR-SEED-05).
 *
 * Edit the names here to show your own team.
 */
export function buildDemoBoard(today, now = Date.now()) {
  const hoursAgo = (h) => new Date(now - h * 3_600_000).toISOString();

  const member = (name, role, email = null) => ({ id: createId(), name, email, role, createdAt: hoursAgo(240) });
  const dana = member('Dana R.', 'architect', 'dana@example.com');
  const sam = member('Sam K.', 'senior', 'sam@example.com');
  const jo = member('Jo M.', 'junior');
  const priya = member('Priya N.', 'ux', 'priya@example.com');
  const luis = member('Luis F.', 'database');
  const mia = member('Mia T.', 'swe');

  // `by` created the task (default: its owner). When the creator is not the
  // owner, the history also shows the handoff, an hour later (schema v4).
  const task = ({ by, ...fields }) => {
    const creator = by ?? fields.assignee;
    const createdAt = new Date(`${fields.createdDate}T09:00:00`).toISOString();
    const activity = [{ at: createdAt, by: creator, type: 'created' }];
    if (creator !== fields.assignee) {
      const at = new Date(Date.parse(createdAt) + 3_600_000).toISOString();
      activity.unshift({ at, by: creator, type: 'handoff', from: creator, to: fields.assignee });
    }
    return {
      id: createId(),
      description: '',
      dueDate: null,
      context: '',
      contextTool: null,
      contextUpdatedAt: null,
      contextHistory: [],
      ...fields,
      createdBy: creator,
      updatedBy: activity[0].by,
      updatedAt: activity[0].at,
      activity,
    };
  };

  const tasks = [
    // To Do
    task({
      title: 'Dark theme for the board and the task modal',
      by: dana.id,
      description: 'Light, dark and "match system". Keep every text pair at 4.5:1 or more.',
      type: 'feature',
      status: 'todo',
      assignee: priya.id,
      dueDate: addDays(today, 5),
      createdDate: addDays(today, -1),
      context: [
        '## Goal',
        'A dark theme that keeps the glass look and passes WCAG AA.',
        '',
        '## Limits',
        '- Colours only from tokens (CSS variables), no hex in JSX.',
        '- Type and due colours keep their meaning in both themes.',
        '',
        '## Next step',
        'Make a token table for dark mode and check each pair with a contrast checker.',
      ].join('\n'),
      contextTool: 'ChatGPT',
      contextUpdatedAt: hoursAgo(20),
    }),
    task({
      title: 'Hand-off select cuts off long names on the card',
      by: dana.id,
      type: 'bug',
      status: 'todo',
      assignee: jo.id,
      dueDate: today,
      createdDate: addDays(today, -2),
      context: [
        '## Goal',
        'Show the full owner name, or truncate it with an ellipsis and a tooltip.',
        '',
        '## Files',
        '- src/components/TaskCard.jsx',
        '',
        '## Last prompt',
        '"The owner <select> on the card cuts names after 9rem. Keep the avatar, keep the card height."',
      ].join('\n'),
      contextTool: 'Cursor',
      contextUpdatedAt: hoursAgo(5),
    }),
    task({
      title: 'Export the board as a JSON file',
      by: dana.id,
      description: 'The only way to move a board between our laptops.',
      type: 'feature',
      status: 'todo',
      assignee: luis.id,
      createdDate: addDays(today, -1),
    }),

    // In Progress
    task({
      title: 'Prompt history timeline in the edit modal',
      description: 'Our secret sauce: every saved version of a task’s context, with Show, Copy and Restore.',
      type: 'feature',
      status: 'in-progress',
      assignee: dana.id,
      dueDate: addDays(today, 1),
      createdDate: addDays(today, -4),
      context: [
        '## Goal',
        'Keep every earlier version of a task’s context, so the team can go back to a prompt that worked.',
        '',
        '## Done so far',
        '- `contextHistory` field (newest first, max 20), schema v2 migration.',
        '- Timeline UI with Show / Copy / Restore.',
        '',
        '## Limits',
        '- Additive data change only (NFR-REL-05).',
        '- Restore puts the text in the form; the user still saves.',
        '',
        '## Files',
        '- src/lib/history.js',
        '- src/components/PromptHistory.jsx',
        '',
        '## Next step',
        'Show "Claude · v4" on the card so the team sees which tasks needed the most iteration.',
      ].join('\n'),
      contextTool: 'Claude',
      contextUpdatedAt: hoursAgo(2),
      contextHistory: [
        {
          context: '## Goal\nKeep earlier versions of the context.\n\n## Next step\nAdd the timeline UI below the Context field.',
          contextTool: 'Claude',
          savedAt: hoursAgo(26),
        },
        {
          context: 'Store old contexts somewhere when the user saves. Not sure where yet.',
          contextTool: 'ChatGPT',
          savedAt: hoursAgo(70),
        },
      ],
    }),
    task({
      title: 'Due dates show one day early east of UTC',
      type: 'bug',
      status: 'in-progress',
      assignee: sam.id,
      dueDate: addDays(today, -2),
      createdDate: addDays(today, -5),
      context: [
        '## Goal',
        'Due labels must use the local calendar date everywhere.',
        '',
        '## Done so far',
        'Found it: `new Date("2026-10-27")` parses as UTC midnight, which is the day before in UTC−5.',
        '',
        '## Limits',
        'Do not add a date library.',
        '',
        '## Last prompt',
        '"Rewrite getDueState so it compares YYYY-MM-DD strings and never builds a UTC date. Add unit tests for the day boundary."',
        '',
        '## Next step',
        'Run the tests in a UTC+10 and a UTC−8 time zone.',
      ].join('\n'),
      contextTool: 'Claude',
      contextUpdatedAt: hoursAgo(30),
      contextHistory: [
        {
          context: 'Due labels look wrong for some people. Maybe time zones?',
          contextTool: 'Claude',
          savedAt: hoursAgo(80),
        },
      ],
    }),
    task({
      title: 'Keyboard shortcuts to move a focused card',
      type: 'feature',
      status: 'in-progress',
      assignee: mia.id,
      dueDate: addDays(today, 3),
      createdDate: addDays(today, -2),
      context: '## Goal\n[ and ] move the focused card one stage. Focus stays on the card.\n\n## Next step\nList the shortcuts in the Help dialog.',
      contextTool: 'Cursor',
      contextUpdatedAt: hoursAgo(8),
    }),

    // Review
    task({
      title: 'Accent colour picker with a contrast guard',
      type: 'feature',
      status: 'review',
      assignee: priya.id,
      dueDate: addDays(today, 2),
      createdDate: addDays(today, -3),
    }),
    task({
      title: 'Long card titles push the stage controls off the card',
      by: dana.id,
      type: 'bug',
      status: 'review',
      assignee: jo.id,
      dueDate: addDays(today, -1),
      createdDate: addDays(today, -3),
    }),
    task({
      title: 'Repair data from older versions on load',
      description: 'Missing fields get defaults; nothing is ever deleted.',
      type: 'feature',
      status: 'review',
      assignee: luis.id,
      createdDate: addDays(today, -4),
      context: [
        '## Goal',
        'Old boards load without errors and keep every owner.',
        '',
        '## Done so far',
        '- `migrateData` (v0 → v3) is pure and idempotent, with unit tests.',
        '- A damaged value is copied to `<key>.backup` before the safe fallback.',
        '',
        '## Next step',
        'Review: try a v2 export from Sam’s laptop.',
      ].join('\n'),
      contextTool: 'ChatGPT',
      contextUpdatedAt: hoursAgo(50),
    }),

    // Done
    task({
      title: 'Four-column Kanban board',
      type: 'feature',
      status: 'done',
      assignee: sam.id,
      dueDate: addDays(today, -4),
      createdDate: addDays(today, -6),
    }),
    task({
      title: '"Copy as Prompt Context" button',
      type: 'feature',
      status: 'done',
      assignee: dana.id,
      dueDate: addDays(today, -3),
      createdDate: addDays(today, -6),
      context: '## Goal\nOne click copies the task as Markdown for an AI tool.\n\n## Done so far\nPure `taskToPrompt` helper with tests; clipboard fallback dialog.',
      contextTool: 'Replit',
      contextUpdatedAt: hoursAgo(90),
    }),
    task({
      title: 'Focus escapes from the modal to the page behind',
      type: 'bug',
      status: 'done',
      assignee: mia.id,
      dueDate: addDays(today, -2),
      createdDate: addDays(today, -5),
    }),
  ];

  const anchors = DEFAULT_ANCHORS.map((slot) => {
    if (slot.id === 'presentation') return { ...slot, url: 'https://example.com/slopify-pitch-deck' };
    if (slot.id === 'demo') return { ...slot, url: 'https://example.com/slopify-demo' };
    return { ...slot };
  });

  return {
    workspace: { projectName: 'Slopify', teamName: 'Demo team', leadId: dana.id },
    team: [dana, sam, jo, priya, luis, mia],
    tasks,
    anchors,
  };
}
