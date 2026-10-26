import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { runMigrations } from './lib/schema.js';
import { applyPrefsToDocument, readStoredPrefs } from './lib/prefs.js';
import './index.css';

// Before the first render: bring stored data up to the current schema
// (DR-MIG-02), and put the theme / text size on <html> so the page does not
// flash in the wrong theme.
const { newer } = runMigrations();
applyPrefsToDocument(readStoredPrefs());

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App readOnly={newer} />
  </React.StrictMode>
);
