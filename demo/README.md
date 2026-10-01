# JASMARTA — interactive offline demo

**`JASMARTA-demo.html`** (workspace root) is the **real JASMARTA React app** — every page, form,
Redux slice and component from `web/src` — compiled into a single file with a simulated API instead
of the Express one. Double-click it, or open it in the workspace preview, and the whole product is
clickable: no server, no database, no install.

## What works

| Flow | Result |
| --- | --- |
| Landing → Browse | Seeded listings, live filters (city, country, rent range, keyword) |
| Tenant sign-in | **tenant@jasmarta.app** / `password` |
| Apply for a lease | Real form → application appears in “My Leases” as `pending` |
| Owner sign-in | **owner@jasmarta.app** / `password` |
| Approve / reject | Real decision → status flips to `active`, property becomes `leased`, toast confirms |
| Property CRUD | Create, edit, delete listings |
| Maintenance | Report an issue; it appears in the owner’s list |
| Admin panel | **admin@jasmarta.app** / `password` — counts, transactions, lease-by-status |
| Roles | A tenant trying `/admin` is bounced; a tenant can’t list properties |

State persists in `localStorage` (or in memory where storage is blocked), so your clicks stick
across reloads. **Reset demo data** in the bottom banner restores the seed.

## How it differs from the real app

| | Real app (`web/`) | Demo |
| --- | --- | --- |
| API | Express + MongoDB | `src/services/api.demo.js` — same endpoints, same response shapes |
| Router | `BrowserRouter` | `MemoryRouter` (works from `file://`, `srcdoc`, anywhere) |
| Auth | JWT signed by the server | `demo.<userId>` token, same request/response contract |
| Photos | Unsplash URLs | Inlined data URIs |
| Netlify / Stripe | Real | Simulated |

Because it swaps only the API layer, **passing here means the UI layer genuinely works** — that’s
what `verify-demo.py` checks. It is not a substitute for the API tests (`live/api-e2e.py`), which
prove the real backend.

## Rebuild

```bash
python3 demo/build-demo.py     # vite build (vite.config.demo.js) → single HTML at the repo root
python3 demo/verify-demo.py    # 22 checks: 10 standalone + 12 inside a sandboxed iframe
```

`verify-demo.py` runs the file **offline**, and again inside `sandbox="allow-scripts"` served as
`about:srcdoc` — the exact conditions of the workspace preview — driving the UI by clicking:
sign-in, apply, approve, CRUD and the admin panel.

### Two shims the preview environment requires

Both live in `web/index.demo.html` and are **demo-only** (the shipped app is unaffected):

1. **Memory-storage fallback** — a sandboxed iframe has an opaque origin, so touching
   `localStorage` throws `SecurityError`. The app reads it during module init (auth token restore),
   which would crash the page on load.
2. **Form-bridge** — a sandbox without `allow-forms` blocks native form submission and **never
   fires the `submit` event**, so every `onSubmit` handler (login, register, apply, create listing)
   would silently do nothing. The shim dispatches `submit` explicitly on button click / Enter.

## Screenshots

`demo/screens/` — `demo-solo-*` (standalone) and `demo-iframe-*` (inside the sandbox), one per step
of the journey.
