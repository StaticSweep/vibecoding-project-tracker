import { Component } from 'react';
import { buildExport, downloadJson, exportFileName, readBoardFromStorage } from '../lib/transfer.js';
import { todayISO } from '../lib/dates.js';
import { buttonPrimary, buttonSecondary } from '../lib/ui.js';

/**
 * Top-level error boundary (NFR-REL-02): never show a blank white screen.
 * "Export my data" reads storage directly, so it works even when React state
 * is the thing that broke.
 */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Slopify crashed:', error, info.componentStack);
  }

  exportData = () => {
    downloadJson(exportFileName(todayISO()), buildExport(readBoardFromStorage()));
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-page p-6 font-sans text-ink">
        <div role="alert" className="max-w-md rounded-3xl border border-line-subtle bg-surface-card p-6 shadow-glass-lg">
          <h1 className="font-heading text-xl font-semibold leading-7">Slopify has a problem.</h1>
          <p className="mt-2 text-base leading-6 text-ink-muted">
            Reload the page. If the problem continues, export your data.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => window.location.reload()} className={buttonPrimary}>
              Reload the page
            </button>
            <button type="button" onClick={this.exportData} className={buttonSecondary}>
              Export my data
            </button>
          </div>
        </div>
      </div>
    );
  }
}
