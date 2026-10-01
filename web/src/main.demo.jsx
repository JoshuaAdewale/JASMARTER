/**
 * Demo entry point — the real JASMARTA UI in a single offline file.
 *
 * Differences from main.jsx:
 *   - MemoryRouter instead of BrowserRouter. BrowserRouter/HashRouter call
 *     `new URL(...)` against window.location, which throws "Invalid URL" inside a
 *     sandboxed iframe served via about:srcdoc (the workspace preview). MemoryRouter
 *     keeps history in memory and works in every context: srcdoc, file://, http.
 *   - a small "offline demo" banner with a reset button
 *
 * Everything else — routes, Redux store, components — is identical to the shipped app.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import App from './App.jsx';
import { resetDemo } from './services/api.demo.js';
import './index.css';

function DemoBanner() {
  const [dismissed, setDismissed] = React.useState(false);
  if (dismissed) return null;
  return (
    <div
      style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        padding: '10px 16px', background: '#0f172a', color: '#e2e8f0',
        font: '500 12.5px Inter, system-ui, sans-serif',
        boxShadow: '0 -8px 24px -12px rgba(15,23,42,.5)',
      }}
    >
      <span style={{ background: '#1d4ed8', color: '#fff', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
        OFFLINE DEMO
      </span>
      <span>
        Real JASMARTA UI, simulated API — data stays in your browser. Sign in with{' '}
        <b>owner@jasmarta.app</b>, <b>tenant@jasmarta.app</b> or <b>admin@jasmarta.app</b> (password <b>password</b>).
      </span>
      <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
        <button
          onClick={() => { resetDemo(); window.location.reload(); }}
          style={{ cursor: 'pointer', background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 7, padding: '5px 10px', font: 'inherit' }}
        >
          Reset demo data
        </button>
        <button
          onClick={() => setDismissed(true)}
          style={{ cursor: 'pointer', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: 7, padding: '5px 10px', font: 'inherit' }}
        >
          Hide
        </button>
      </span>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <MemoryRouter initialEntries={['/']}>
        <App />
        <Toaster position="top-right" />
        <DemoBanner />
      </MemoryRouter>
    </Provider>
  </React.StrictMode>
);
