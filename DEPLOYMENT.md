# Deploying JASMARTA

## What goes where

| Piece | Host | Why |
| --- | --- | --- |
| `web/` — React + Vite site | **Netlify** | Pure static files after `npm run build:web` |
| `backend/` — Express API | **Render** (or Railway / Fly.io) | Needs a long-running Node process |
| Database | **MongoDB Atlas** | Free M0 cluster; nothing to host yourself |
| `mobile/` — React Native | **Expo EAS** → App Store / Play Store | Not part of Netlify |

> **Netlify can't run your Express API.** It's static hosting only. Deploy the API to Render and point
> Netlify at it with `VITE_API_URL`. (Rewriting the API as Netlify Functions is possible but is a
> different architecture — not included here.)

The repo already contains `netlify.toml` (build settings + SPA fallback + cache headers) and
`web/public/_redirects`, so Netlify needs almost no manual configuration.

---

## 0 · Get the code running locally first

```bash
unzip JASMARTA-v1.0.zip
cd JASMARTA
npm install                                   # installs all three workspaces
cp backend/.env.example backend/.env          # then edit: MONGODB_URI + JWT_SECRET
cp web/.env.example web/.env                  # VITE_API_URL=http://localhost:5000/api
npm run seed                                  # demo users + 2 properties
npm run dev:backend                           # http://localhost:5000/api
npm run dev:web                               # http://localhost:5173
```

Demo logins after seeding: `owner@jasmarta.app`, `tenant@jasmarta.app`, `admin@jasmarta.app` — password `password`.

---

## 1 · Push to GitHub

```bash
cd JASMARTA
git init
git add .
git commit -m "Initial commit: JASMARTA — property management MVP"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/jasmarta.git
git push -u origin main
```

**Before you push, confirm secrets aren't staged:**

```bash
git status --short | grep -E "\.env$" && echo "STOP — .env is staged" || echo "clean: no .env files staged"
```

`.gitignore` already excludes `node_modules/`, `.env`, `dist/`, `.expo/`, `*.log`. If you ever commit a
real `.env`, treat the secrets as burned — rotate `JWT_SECRET` and any Stripe keys.

**If you created the repo with a README on github.com**, pull first to avoid a rejected push:

```bash
git pull --rebase origin main
git push -u origin main
```

<details>
<summary>Using SSH instead of HTTPS</summary>

```bash
ssh-keygen -t ed25519 -C "you@example.com"     # then add ~/.ssh/id_ed25519.pub to GitHub → Settings → SSH keys
git remote set-url origin git@github.com:YOUR-USERNAME/jasmarta.git
```
</details>

---

## 2 · Create the database (MongoDB Atlas, free)

1. Sign up at **cloud.mongodb.com** → create a **Free M0** cluster.
2. **Database Access** → *Add New Database User* → username + password (save them).
3. **Network Access** → *Add IP Address* → `0.0.0.0/0` (allow from anywhere). Render's outbound IPs are
   dynamic, so a fixed allowlist will break deploys.
4. **Connect → Drivers** → copy the connection string and swap in your password and DB name:

```
mongodb+srv://jasmarta_user:PASSWORD@cluster0.xxxxx.mongodb.net/jasmarta?retryWrites=true&w=majority
```

---

## 3 · Deploy the API (Render)

**New → Web Service → connect your GitHub repo.** Settings:

| Field | Value |
| --- | --- |
| Root Directory | *(leave empty — repo root, so npm workspaces resolve)* |
| Build Command | `npm install` |
| Start Command | `npm run start:backend` |
| Instance type | Free |

**Environment variables** (Advanced → Add Environment Variable):

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://jasmarta_user:PASSWORD@cluster0.xxxxx.mongodb.net/jasmarta?retryWrites=true&w=majority
AUTH_PROVIDER=jwt
JWT_SECRET=<generate a long random string>
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=https://YOUR-SITE.netlify.app
STRIPE_SECRET_KEY=sk_live_or_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
MAIL_FROM="JASMARTA <no-reply@jasmarta.app>"
```

Generate a strong secret locally:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> Don't set `PORT` — Render injects it and `backend/src/server.js` already reads `process.env.PORT`.

**Seed the production database once**, from your machine (⚠️ the seed script wipes those collections first):

```bash
cd backend
MONGODB_URI="mongodb+srv://jasmarta_user:PASSWORD@cluster0.xxxxx.mongodb.net/jasmarta?retryWrites=true&w=majority" \
  node src/utils/seed.js
```

**Verify:** `https://YOUR-API.onrender.com/api/health` → `{"status":"ok","service":"jasmarta-api",...}`

> Free tier spins down after ~15 minutes idle; the next request takes ~30–50 s to wake. Normal.

---

## 4 · Deploy the web app (Netlify)

### Option A — Netlify UI (recommended)

1. **Add new site → Import an existing project → GitHub** → pick `jasmarta`.
2. Netlify reads `netlify.toml` automatically. Confirm the fields show:

| Field | Value |
| --- | --- |
| Base directory | *(empty)* |
| Build command | `npm run build:web` |
| Publish directory | `web/dist` |

3. **Site configuration → Environment variables → Add:**

```
VITE_API_URL = https://YOUR-API.onrender.com/api
```

4. **Deploy site.**

> ⚠️ Vite inlines `VITE_API_URL` **at build time**, not runtime. Changing it later requires
> **Deploys → Trigger deploy → Clear cache and deploy site**.

### Option B — Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init                                      # link/create the site
netlify env:set VITE_API_URL https://YOUR-API.onrender.com/api
netlify deploy --build --prod
```

---

## 5 · Close the CORS loop

The API only accepts browser requests from `CLIENT_ORIGIN`, so both sides must agree:

1. Copy your live site URL, e.g. `https://jasmarta.netlify.app` (exact origin, **no trailing slash**).
2. Render → your service → **Environment → `CLIENT_ORIGIN`** → paste it → **Save** (Render redeploys).
3. Reload the site — property listings should appear.

Deploy previews (`deploy-preview-3--jasmarta.netlify.app`) are *different* origins and will be blocked.
The simplest fix is to test on the production URL; supporting previews needs a code tweak in
`backend/src/server.js` (comma-separated origins) — ask and I'll add it.

---

## 6 · Smoke-test the deployment

| Check | Expected |
| --- | --- |
| `https://YOUR-API.onrender.com/api/health` | `{"status":"ok",...}` |
| Netlify homepage | Hero with *"Your Property, Managed Smartly While You Travel."* |
| `/properties` | The seeded listings, images loading |
| Paste `YOUR-SITE.netlify.app/properties` directly into a fresh tab | Loads (not 404) — proves the SPA redirect |
| Sign in `owner@jasmarta.app` / `password` | Owner dashboard with counts |
| Browser console | No CORS errors |

---

## 7 · After it's live

**Custom domain** — Netlify → *Domain management* → Add domain → point DNS; HTTPS is automatic.
Then update `CLIENT_ORIGIN` on Render to the custom domain.

**Mobile app** — the Expo project in `mobile/` ships to stores via EAS:

```bash
npm install -g eas-cli
cd mobile
eas login
eas build:configure
eas build --platform all
eas submit --platform ios        # needs an Apple Developer account
eas submit --platform android    # needs a Play Console account
```

Set `EXPO_PUBLIC_API_URL` in `mobile/.env` to your Render URL so the app talks to production.

---

## ⚠️ Pre-launch checklist

Things that are **not** production-ready in this MVP — fix before real users or real money:

1. **`POST /api/payments/confirm` trusts the client.** It accepts any `paymentIntentId` and marks rent
   paid (verified in testing — a fake ID flipped a lease to `active` and emailed the owner "Rent
   received"). Must verify server-side via `stripe.paymentIntents.retrieve()` + `metadata.leaseId`, and
   let the webhook be the only thing that marks rent paid.
2. **Stripe webhook needs a raw body.** The route reads `req.rawBody`, but `express.json()` is mounted
   globally, so signature verification fails. Mount `express.raw({type:'application/json'})` for
   `/api/payments/webhook` *before* the JSON parser.
3. **Refresh logs you out.** The token is in `localStorage` but nothing calls `fetchMe()` on boot, so a
   hard refresh on `/dashboard` redirects to `/login`. ~3-line fix in `App.jsx`.
4. **No card form.** Rent payment creates a PaymentIntent but there's no Stripe Elements UI.
5. **No image uploads** — property photos are URL strings.
6. **No rate limiting on non-auth routes**, no automated tests for the backend.
7. Rotate `JWT_SECRET` if it was ever committed; use **Stripe live keys** only after #1 and #2 are done.

---

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| Build fails: `sh: 1: vite: not found` | Build command ran inside `web/` without installing | Use `npm run build:web` from the repo root (as in `netlify.toml`) |
| `404 Not Found` on refresh of `/dashboard` | SPA redirect missing | Base directory set to `web` instead of empty; keep `netlify.toml` at repo root |
| `blocked by CORS policy` | `CLIENT_ORIGIN` ≠ live site origin | Set it exactly on Render (no trailing slash) and redeploy |
| Site loads but zero properties | `VITE_API_URL` missing/typo | Set the env var, then **Clear cache and deploy** |
| Logged out immediately after sign-in | `JWT_SECRET` changed between deploys | Any secret rotation invalidates existing tokens — sign in again |
| API feels frozen on first load | Render free tier cold start | Expected; upgrade the instance to remove it |
| `MONGODB_URI is not set in .env` when seeding | `dotenv` resolves from the cwd | `cd backend` before running `node src/utils/seed.js` |
| MongoDB connection timeout from Render | Atlas IP allowlist | Network Access → allow `0.0.0.0/0` |
