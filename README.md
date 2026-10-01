# JASMARTA 🏠

> *"Your Property, Managed Smartly While You Travel."*

JASMARTA is a cross-platform property management application built for individuals who migrate, travel, or relocate and need to lease and maintain their properties remotely. It serves three roles: **Property Owners**, **Tenants**, and **Administrators**.

---

## 👀 See it first

- **🖱️ Interactive demo — click the real app:** open **[`../JASMARTA-demo.html`](../JASMARTA-demo.html)** (workspace root). The entire React UI compiled into one offline file with a simulated API — sign in as `owner@jasmarta.app` / `tenant@jasmarta.app` / `admin@jasmarta.app` (password `password`), browse, apply for a lease, approve it, add listings. Details in [`demo/README.md`](demo/README.md).

- **Live screenshots (real app, real API, real database):** **[`live/screens/`](live/screens)** — 14 captures taken while the stack was actually running. Health report in [`live/console.log`](live/console.log); notes in [`live/README.md`](live/README.md).
- **Design walkthrough:** open **[`preview/JASMARTA-ui-preview.html`](preview/JASMARTA-ui-preview.html)** — one self-contained file with every web screen, every mobile screen, and the API surface. Captures in [`preview/screens/`](preview/screens) (21 images).

- **End-to-end API tests:** `python3 live/api-e2e.py` — 40 checks across auth, properties, leases, maintenance, payments, admin, roles and validation (stdlib only; needs the API running).

Boot + capture the live stack with `./live/run-live.sh` (`./live/run-live.sh boot` to leave it running).

---

## ✨ Features

- **Property Management** – Add, update, and remove properties with photos, address, and price.
- **Leasing System** – Tenants browse, apply, and pay rent. Owners approve/reject lease requests.
- **Maintenance Tracking** – Schedule tasks, assign staff, let tenants report issues.
- **Notifications** – Push (mobile) + email (web) for lease updates, payment reminders, and maintenance alerts.
- **Payments** – Stripe integration for secure rent collection.
- **Admin Panel** – Manage users, properties, and transactions.

---

## 🧱 Tech Stack

| Layer        | Technology                                            |
| ------------ | ----------------------------------------------------- |
| Mobile       | React Native (Expo) + NativeWind                      |
| Web          | React.js (Vite) + Tailwind CSS                        |
| State (FE)   | Redux Toolkit                                         |
| Backend      | Node.js + Express.js                                  |
| Database     | MongoDB (Mongoose ODM)                                |
| Auth         | **JWT** (default) · Firebase Auth (swappable adapter) |
| Payments     | Stripe                                                |
| Hosting      | Vercel (web) · Render/Heroku (API) · App Stores (app) |

---

## 📁 Repository Structure

This is a **monorepo** using npm workspaces.

```
JASMARTA/
├── backend/   # Node.js + Express + MongoDB API
├── web/       # React.js (Vite) admin / owner / tenant UI
├── mobile/    # React Native (Expo) iOS + Android app
└── package.json   # Root workspaces config
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v16 or higher
- **MongoDB** (local or Atlas cloud URI)
- **Expo CLI** (`npm i -g expo-cli`) for mobile development
- **Stripe account** (test keys) for payments
- **Firebase project** *(optional)* if you swap JWT for Firebase Auth

### 1. Install all workspaces

From the repo root:

```bash
npm install
```

This installs backend, web, and mobile dependencies in one shot.

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
cp web/.env.example web/.env
cp mobile/.env.example mobile/.env
```

Fill in the secrets (MongoDB URI, JWT secret, Stripe key, etc.).

### 3. Run the backend

```bash
npm run dev:backend
# API on http://localhost:5000
```

### 4. Run the web app

```bash
npm run dev:web
# Web on http://localhost:5173
```

### 5. Run the mobile app

```bash
npm run dev:mobile
# Expo Dev Tools open in browser; scan QR with Expo Go
```

---

## 🔐 Authentication

The default authentication strategy is **JWT** with email/password (stored as a hash with bcrypt). The codebase also ships with a **Firebase Auth adapter** (`backend/src/services/firebaseAuth.js`) so you can swap authentication providers by changing a single line in the config.

```js
// backend/.env
AUTH_PROVIDER=jwt          // or "firebase"
```

See `backend/src/services/README-auth.md` for the swap procedure.

---

## 💳 Payments

Stripe is wired in for **rent collection**. The backend exposes `/api/payments/create-intent` and `/api/payments/webhook`. The web app uses `@stripe/stripe-js` for the Payment Element.

---

## 🚀 Deployment

Full walkthrough: **[DEPLOYMENT.md](DEPLOYMENT.md)** — GitHub → MongoDB Atlas → Render (API) → Netlify (web).

```bash
# 1 · push to GitHub
git init && git add . && git commit -m "Initial commit: JASMARTA MVP"
git branch -M main && git remote add origin https://github.com/YOU/jasmarta.git && git push -u origin main

# 2 · API + database  → Render + MongoDB Atlas   (see DEPLOYMENT.md §2–3)
# 3 · web app        → Netlify                  (see DEPLOYMENT.md §4)
```

| Piece | Host | Notes |
| --- | --- | --- |
| `web/` | **Netlify** | `netlify.toml` + `_redirects` are already committed — build command `npm run build:web`, publish `web/dist` |
| `backend/` | **Render** | Build `npm install`, start `npm run start:backend` |
| database | **MongoDB Atlas** | Free M0 cluster |
| `mobile/` | Expo EAS | App Store / Play Store |

Netlify serves the static React build only — the Express API must live on Render. Set
`VITE_API_URL` on Netlify (build-time) and `CLIENT_ORIGIN` on Render (CORS) to the same site URL.

> ⚠️ See the pre-launch checklist in DEPLOYMENT.md before taking real payments — the current
> `/api/payments/confirm` route trusts client input.

---

## 🗺️ Roadmap

- [ ] AI-powered property recommendations
- [ ] Smart-contract / blockchain lease agreements
- [ ] Multi-language support (i18n)
- [ ] IoT integration (smart locks, sensors)

---

## 📄 License

MIT © JASMARTA contributors
