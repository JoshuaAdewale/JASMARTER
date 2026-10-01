# JASMARTA — LIVE run screenshots

Real captures of the app **actually running** — MongoDB + Express API + Vite/React — not a design mockup.

## How it was produced

```bash
npm install                       # repo root (npm workspaces)
cp backend/.env.example backend/.env   # MONGODB_URI + JWT_SECRET filled in
cp web/.env.example web/.env
./live/run-live.sh                # boots mongod + seeds + API + web, then captures
```

`run-live.sh boot` starts the stack and leaves it running (no capture).
`live/capture.py` drives a real browser through the app: public pages, then owner → admin → tenant
journeys, screenshotting each screen. Health report lands in `live/console.log`.

## Verified in this run

| Check | Result |
| --- | --- |
| `GET /api/health` | `{"status":"ok","service":"jasmarta-api"}` |
| `POST /api/auth/login` (owner) | 200, real JWT issued |
| `GET /api/auth/me` (Bearer) | user returned |
| `GET /api/properties` | 2 seeded listings served from MongoDB |
| `GET /api/admin/dashboard` (admin role) | counts returned |
| Property cards rendered on `/properties` | 2 |
| Detail route visited | `/properties/6abc3edad61c57f8b1b860ef` |
| Browser console errors | **0** |
| Failed network requests | **0** |

## Screens

| File | Screen |
| --- | --- |
| `live-01-landing.jpg` | Landing page (public) |
| `live-02-browse.jpg` | Browse properties — seeded listings from Mongo |
| `live-03-property-detail.jpg` | Property detail, reached by clicking a real card |
| `live-04-login.jpg` | Sign in |
| `live-05-register.jpg` | Register |
| `live-06-owner-dashboard.jpg` | Owner dashboard (Olivia Owner) — 2 properties, 1 lease, 1 pending |
| `live-07-owner-properties.jpg` | Owner: My Properties |
| `live-08-owner-leases.jpg` | Owner: My Leases |
| `live-09-owner-maintenance.jpg` | Owner: Maintenance |
| `live-10-admin.jpg` | Admin dashboard (Ada Admin) — 3 users, 2 properties, 1 lease |
| `live-11-mobile-dashboard.jpg` | Tenant dashboard at 414px (responsive) |
| `live-12-mobile-browse.jpg` | Browse at 414px — filters stack, cards go single-column |
| `live-14-mobile-property.jpg` | Property detail at 414px |
| `live-13-mobile-landing.jpg` | Landing at 414px |

## End-to-end API test suite

```bash
python3 live/api-e2e.py          # needs the API running on :5000, seeded
```

Stdlib-only (no pip installs). Exercises every route: auth, property CRUD, lease
apply/approve, maintenance lifecycle, payments, admin, plus role enforcement and
validation failures. Current result: **40/40 checks pass**.

| Area | Covered |
| --- | --- |
| Auth | register (201), bad payload (400), login, wrong password (401), `/me` with/without token (200/401) |
| Properties | list, `?city` / `?minRent` filters, detail, create, `mine/list`, update, delete, tenant blocked (403), anonymous blocked (401) |
| Leases | tenant applies (201), owner sees it, tenant blocked from deciding (403), invalid action (400), approve, property flips to `leased` |
| Maintenance | tenant reports (201), owner sees it, tenant blocked from updating (403), resolve stamps `resolvedAt` |
| Payments | create-intent fails gracefully without a real Stripe key, confirm, webhook route reachable |
| Admin | dashboard counts, transactions, user list; tenant blocked (403) |
| Errors | unknown route returns JSON 404 |

Database-level checks (via a Node script against Mongo): notifications are created for
lease application / approval / maintenance / payment, and passwords are stored as
bcrypt hashes (`$2a$10$…`, 60 chars) with no plaintext.

## ⚠️ Finding from the E2E run — payment trust hole

`POST /api/payments/confirm` **trusts the client**. In the test run, a request with
`paymentIntentId: "pi_fake"` and `status: "succeeded"` was accepted, which:

- pushed `{ amount: 0, stripePaymentIntentId: "pi_fake", status: "succeeded" }` into `lease.paymentHistory`
- flipped the lease `approved → active`
- emailed/notified the owner **"Rent received"**

…with no payment ever happening. Any authenticated tenant can do this. Before launch, `confirm`
must verify server-side (`stripe.paymentIntents.retrieve(id)`, check `status === 'succeeded'`,
`metadata.leaseId` matches, and take the amount from Stripe rather than `0`), and the webhook
should be the only thing that marks rent paid.


1. **Seed script must run from `backend/`** — `dotenv` resolves `.env` from the current working
   directory, so `node backend/src/utils/seed.js` from the repo root fails with
   `MONGODB_URI is not set in .env`. `run-live.sh` handles this by `cd`-ing first.
2. **No session rehydration on a hard page load.** `authSlice` initialises `user: null` and keeps the
   token in `localStorage`, but nothing calls `fetchMe()` on boot (`fetchMe` exists and is wired to
   `fetchMe.fulfilled`). So a full browser refresh on `/dashboard` drops `user` and `ProtectedRoute`
   redirects to `/login`, even though a valid token is still stored. Fix is a two-line
   `useEffect` + `fetchMe()` in `App.jsx` — worth doing before you ship.
3. Property photos are Unsplash URLs from the seed data; the app loads them fine, confirming the
   `photos: [String]` model works — uploading real files is still the open item.
4. `CLIENT_ORIGIN` must match the web origin or CORS blocks the API (it's set in `backend/.env`).
