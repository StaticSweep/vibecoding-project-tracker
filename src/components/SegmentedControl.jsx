import { useId } from 'react';

/**
 * Radio-group segmented control (DESIGN.md §4.7). Used for the task type in
 * the modal (FR-M6-03) and for the board filter (FR-M6-05).
 *
 * options: [{ value, label, icon?: Component, iconClass?, selectedClass }]
 *   selectedClass — background + text classes when the option is chosen.
 *   iconClass     — icon colour when the option is not chosen.
 */
export default function SegmentedControl({ legend, hideLegend = false, options, value, onChange, size = 'md' }) {
  const name = useId();
  const height = size === 'sm' ? 'h-7' : 'h-8';

  return (
    <fieldset>
      <legend className={hideLegend ? 'sr-only' : 'block text-sm font-semibold leading-5 text-ink'}>
        {legend}
      </legend>
      <div className={`${hideLegend ? '' : 'mt-1 '}inline-flex rounded-md border border-line-strong bg-surface-card p-0.5`}>
        {options.map((option) => {
          const Icon = option.icon;
          const checked = option.value === value;
          return (
            <label key={option.value} className="relative">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="peer sr-only"
              />
              <span
                className={`inline-flex ${height} cursor-pointer items-center gap-1.5 rounded px-3 text-sm font-semibold transition-colors duration-150 motion-reduce:transition-none peer-focus-visible:ring-2 peer-focus-visible:ring-brand-primary peer-focus-visible:ring-offset-2 ${
                  checked ? option.selectedClass : 'text-ink hover:bg-brand-accent'
                }`}
              >
                {Icon && (
                  <Icon aria-hidden="true" className={`h-4 w-4 ${checked ? '' : option.iconClass ?? ''}`} />
                )}
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
