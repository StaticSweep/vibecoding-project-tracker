import { useId } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import SegmentedControl from '../SegmentedControl.jsx';
import { useAppData } from '../../context/AppData.jsx';
import { TEXT_SIZES, THEMES } from '../../lib/prefs.js';
import { focusRing, helperText, labelBase } from '../../lib/ui.js';
import { sectionHeading } from './shared.js';

const THEME_ICONS = { system: Monitor, light: Sun, dark: Moon };
const selected = 'bg-brand-primary text-on-brand';

/**
 * Settings → Accessibility & appearance (Q&A: accessibility in design and
 * code). Saved per browser; applied at once on <html> (src/lib/prefs.js).
 */
export default function AppearanceSettings() {
  const { prefs, setPrefs } = useAppData();
  const set = (key) => (value) => setPrefs((p) => ({ ...p, [key]: value }));

  return (
    <div className="space-y-8">
      <section aria-labelledby="settings-reading">
        <h3 id="settings-reading" className={sectionHeading}>
          Reading
        </h3>
        <div className="mt-3 space-y-5">
          <div>
            <SegmentedControl
              legend="Text size"
              value={prefs.textSize}
              onChange={set('textSize')}
              options={TEXT_SIZES.map((s) => ({ value: s.id, label: `${s.label} (${s.scale})`, selectedClass: selected }))}
            />
            <p className={`mt-1 ${helperText}`}>All text and controls get bigger. Browser zoom also works.</p>
          </div>
          <SegmentedControl
            legend="Theme"
            value={prefs.theme}
            onChange={set('theme')}
            options={THEMES.map((t) => ({ value: t.id, label: t.label, icon: THEME_ICONS[t.id], selectedClass: selected }))}
          />
        </div>
      </section>

      <section aria-labelledby="settings-comfort">
        <h3 id="settings-comfort" className={sectionHeading}>
          Motion and transparency
        </h3>
        <p className={`mt-1 ${helperText}`}>Slopify also follows these settings in your operating system.</p>
        <div className="mt-3 space-y-3">
          <Toggle
            label="Reduce motion"
            help="Stop fades and other animation."
            checked={prefs.motion === 'reduce'}
            onChange={(on) => set('motion')(on ? 'reduce' : 'system')}
          />
          <Toggle
            label="Reduce transparency"
            help="Use solid surfaces instead of frosted glass. Text gets more contrast."
            checked={prefs.transparency === 'reduce'}
            onChange={(on) => set('transparency')(on ? 'reduce' : 'system')}
          />
        </div>
      </section>
    </div>
  );
}

/** A labelled checkbox with helper text. */
function Toggle({ label, help, checked, onChange }) {
  const id = useId();
  const helpId = useId();
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-describedby={helpId}
        className={`mt-0.5 h-5 w-5 shrink-0 rounded border-line-strong accent-brand-primary ${focusRing}`}
      />
      <div>
        <label htmlFor={id} className={labelBase}>
          {label}
        </label>
        <p id={helpId} className={helperText}>
          {help}
        </p>
      </div>
    </div>
  );
}
