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
      {/*
        iOS pill track. The chosen option is a solid colour pill (not iOS's
        white thumb) so the selected state keeps ≥ 3:1 contrast (NFR-A11Y-01).
      */}
      <div
        className={`${hideLegend ? '' : 'mt-1 '}inline-flex max-w-full flex-wrap gap-0.5 rounded-[1.25rem] border border-line-strong bg-glass/75 p-0.5 backdrop-blur-xl reduce-transparency:bg-surface-card`}
      >
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
                className={`inline-flex ${height} cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors duration-150 motion-reduce:transition-none peer-focus-visible:ring-2 peer-focus-visible:ring-brand-primary peer-focus-visible:ring-offset-2 ${
                  checked ? `${option.selectedClass} shadow-glass-sm` : 'text-ink hover:bg-glass'
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
