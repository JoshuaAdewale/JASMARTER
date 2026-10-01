# JASMARTA — UI Preview

`JASMARTA-ui-preview.html` is a **single, self-contained visual walkthrough** of the whole app.
Open it in the workspace viewer or any browser (offline-friendly — all images are embedded).

It shows, faithful to the source in this repo:

| Part | What's inside |
| --- | --- |
| **1 · Web app** | Landing, Browse properties, Property detail + lease application, Owner dashboard, My properties + add listing, My leases (approve/reject), Maintenance, Admin panel, Sign in |
| **2 · Mobile app** | Login, Home (5 tabs), Browse, Property detail, My leases, Maintenance, Profile |
| **3 · System** | Repo structure, full REST API surface with roles, auth provider swap, run commands, and an honest "working vs. next" status list |

## Rendered screenshots

`preview/screens/` holds 21 real Chrome renders of the preview — one per screen, plus contact sheets
and a full-page capture. See [`screens/README.md`](screens/README.md) for the index.

## Rebuild it

```bash
python3 preview/build.py     # HTML (inlines the photos)
python3 preview/screens.py   # PNG/JPG screenshots (needs: pip install playwright && playwright install chromium)
```

- `preview.template.html` — the source of the preview (edit this)
- `preview/assets/*.jpg` — demo listing photos
- `build.py` — inlines the photos as base64 data URIs and writes the final HTML

> Reminder: this is a *static* design walkthrough. To click through the real thing, run the stack —
> see the root `README.md` (`npm install` → `npm run seed` → `npm run dev:backend` / `dev:web` / `dev:mobile`).
