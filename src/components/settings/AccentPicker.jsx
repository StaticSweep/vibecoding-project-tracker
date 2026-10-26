import { useId } from 'react';
import { Check, Info } from 'lucide-react';
import { useAppData } from '../../context/AppData.jsx';
import { ACCENT_PRESETS, DEFAULT_ACCENT, deriveAccent, isHexColor } from '../../lib/color.js';
import { resolveTheme } from '../../lib/prefs.js';
import { buttonPrimary, helperText } from '../../lib/ui.js';
import { sectionHeading } from './shared.js';

/**
 * Accent colour (Q&A: "sensible default, user definable"; DESIGN.md §2.8).
 * A radio group of presets plus "Custom". A custom colour that fails WCAG AA
 * is adjusted until it passes, and the panel says so.
 */
export default function AccentPicker() {
  const { prefs, setPrefs } = useAppData();
  const name = useId();
  const customId = useId();
  const noteId = useId();
  const theme = resolveTheme(prefs.theme);
  const custom = isHexColor(prefs.accent);
  // The colour picker keeps the last custom colour, or starts from teal.
  const customHex = custom ? prefs.accent : ACCENT_PRESETS[0].light.primary;
  const adjusted = custom && (deriveAccent(customHex, 'light').adjusted || deriveAccent(customHex, 'dark').adjusted);
  const setAccent = (accent) => setPrefs((p) => ({ ...p, accent }));

  return (
    <section aria-labelledby="settings-accent">
      <h3 id="settings-accent" className={sectionHeading}>
        Accent colour
      </h3>
      <p className={`mt-1 max-w-prose ${helperText}`}>
        The accent colours buttons, links and the focus ring. Feature, bug and due colours do not change, so each colour
        keeps one meaning.
      </p>

      <fieldset className="mt-3">
        <legend className="sr-only">Accent colour</legend>
        <div className="flex flex-wrap gap-2">
          {ACCENT_PRESETS.map((preset) => (
            <Swatch
              key={preset.id}
              name={name}
              label={`${preset.label}${preset.id === DEFAULT_ACCENT ? ' (default)' : ''}`}
              color={preset[theme].primary}
              checked={prefs.accent === preset.id}
              onSelect={() => setAccent(preset.id)}
            />
          ))}
          <Swatch
            name={name}
            label="Custom"
            color={deriveAccent(customHex, theme).primary}
            checked={custom}
            onSelect={() => setAccent(customHex)}
          />
        </div>
      </fieldset>

      {custom && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label htmlFor={customId} className="text-sm font-semibold text-ink">
            Custom colour
          </label>
          <input
            id={customId}
            type="color"
            value={customHex.toLowerCase()}
            onChange={(e) => setAccent(e.target.value.toUpperCase())}
            aria-describedby={adjusted ? noteId : undefined}
            className="h-9 w-14 cursor-pointer rounded-lg border border-line-strong bg-field p-1"
          />
          <span className="font-mono text-sm text-ink-muted">{customHex}</span>
          {adjusted && (
            <p id={noteId} className={`flex items-center gap-1 ${helperText}`}>
              <Info aria-hidden="true" className="h-3.5 w-3.5" />
              Adjusted for readability. Slopify made the colour darker or lighter so text on it stays readable.
            </p>
          )}
        </div>
      )}

      {/* Preview with the live tokens */}
      <div aria-hidden="true" className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-line-subtle bg-glass/60 p-3">
        <span className={`${buttonPrimary} pointer-events-none`}>Primary button</span>
        <span className="text-sm font-semibold text-brand-primary underline underline-offset-2">A link</span>
        <span className="rounded-full bg-brand-accent px-3 py-1 text-sm font-semibold text-brand-primary">Selected filter</span>
      </div>
    </section>
  );
}

/** One radio: a colour dot and a text label. The label carries the meaning. */
function Swatch({ name, label, color, checked, onSelect }) {
  return (
    <label className="relative">
      <input type="radio" name={name} checked={checked} onChange={onSelect} className="peer sr-only" />
      <span
        className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border pl-1.5 pr-3 text-sm font-semibold text-ink peer-focus-visible:ring-2 peer-focus-visible:ring-brand-primary peer-focus-visible:ring-offset-2 ${
          checked ? 'border-ink bg-glass' : 'border-line-strong bg-glass/70 hover:bg-glass'
        }`}
      >
        {/* Data colour from src/lib/color.js, not a hard-coded token. */}
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full ring-1 ring-line-strong" style={{ backgroundColor: color }}>
          {checked && <Check aria-hidden="true" className="h-4 w-4 text-on-brand" />}
        </span>
        {label}
      </span>
    </label>
  );
}
