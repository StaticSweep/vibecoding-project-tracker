import { useId, useRef, useState } from 'react';
import { X } from 'lucide-react';
import Modal from './Modal.jsx';
import DataSettings from './settings/DataSettings.jsx';
import { focusRing, iconButton } from '../lib/ui.js';

// Order = tab order. Each panel is a component with no props.
const TABS = [{ id: 'data', label: 'Data', Panel: DataSettings }];

/**
 * Settings (DESIGN.md §4.18): one dialog, one tab per topic.
 * WAI-ARIA tabs: ←/→ (and Home/End) move between tabs; Tab moves into the panel.
 */
export default function SettingsDialog({ initialTab = TABS[0].id, onClose, returnFocus }) {
  const headingId = useId();
  const baseId = useId();
  const [active, setActive] = useState(TABS.some((t) => t.id === initialTab) ? initialTab : TABS[0].id);
  const tabRefs = useRef({});

  function onTabKeyDown(e) {
    const index = TABS.findIndex((t) => t.id === active);
    const target = {
      ArrowRight: TABS[(index + 1) % TABS.length],
      ArrowLeft: TABS[(index - 1 + TABS.length) % TABS.length],
      Home: TABS[0],
      End: TABS[TABS.length - 1],
    }[e.key];
    if (!target) return;
    e.preventDefault();
    setActive(target.id);
    tabRefs.current[target.id]?.focus();
  }

  const { Panel } = TABS.find((t) => t.id === active);

  return (
    <Modal labelledBy={headingId} onRequestClose={onClose} returnFocus={returnFocus} className="max-w-[48rem]">
      <div className="flex items-center justify-between gap-4 border-b border-line-subtle px-6 py-4">
        <h2 id={headingId} className="font-heading text-xl font-semibold leading-7">
          Settings
        </h2>
        <button type="button" onClick={onClose} aria-label="Close settings" className={iconButton}>
          <X aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>

      <div role="tablist" aria-label="Settings topics" className="flex flex-wrap gap-1 border-b border-line-subtle px-4 py-2">
        {TABS.map((tab) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab.id)}
              onKeyDown={onTabKeyDown}
              className={`h-9 rounded-full px-4 text-sm font-semibold transition-colors duration-150 ${
                selected ? 'bg-brand-primary text-on-brand' : 'text-ink hover:bg-brand-accent'
              } ${focusRing}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-tab-${active}`}
        tabIndex={0}
        className={`min-h-0 flex-1 overflow-y-auto px-6 py-5 ${focusRing} focus-visible:ring-inset focus-visible:ring-offset-0`}
      >
        <Panel />
      </div>
    </Modal>
  );
}
