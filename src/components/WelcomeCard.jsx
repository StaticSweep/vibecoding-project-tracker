import { Sparkles, X } from 'lucide-react';
import { useAppData } from '../context/AppData.jsx';
import { endSentence } from '../lib/team.js';
import { buttonSecondary, glassPanel, iconButton } from '../lib/ui.js';

/**
 * First-run hint after the first log-in. It never blocks the board.
 * Dismissed per browser.
 */
export default function WelcomeCard({ onSetUpTeam }) {
  const { currentUser, prefs, setPrefs } = useAppData();
  if (prefs.welcomeDismissed) return null;

  const dismiss = () => setPrefs((p) => ({ ...p, welcomeDismissed: true }));

  return (
    <section
      aria-labelledby="welcome-title"
      className={`mx-4 mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-3xl px-5 py-3 ${glassPanel}`}
    >
      <Sparkles aria-hidden="true" className="h-5 w-5 shrink-0 text-brand-primary" />
      <div className="min-w-0 flex-1 basis-60">
        <h2 id="welcome-title" className="font-heading text-sm font-semibold leading-5 text-ink">
          Welcome to Slopify. Track the task. Keep the context.
        </h2>
        <p className="text-sm leading-5 text-ink-muted">
          {endSentence(`You are logged in as ${currentUser.name}`)} Add your team, their roles and their email
          addresses.
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          dismiss();
          onSetUpTeam();
        }}
        className={buttonSecondary}
      >
        Set up the team
      </button>
      <button type="button" onClick={dismiss} aria-label="Close the welcome message" title="Close" className={iconButton}>
        <X aria-hidden="true" className="h-4 w-4" />
      </button>
    </section>
  );
}
