# Authentication

JASMARTA ships with **two interchangeable auth strategies** behind a single
adapter (`src/services/authService.js`). Switch with one env var.

## Default: JWT (email + password)

- Passwords are stored as bcrypt hashes (`bcryptjs`).
- On login we issue a signed JWT (`jsonwebtoken`) containing `{ id, role, email }`.
- The client sends it as `Authorization: Bearer <token>`.
- All routes protected by `authMiddleware` will resolve `req.user` from the token.

## Optional: Firebase Auth

To use Firebase instead:

1. Create a Firebase project, enable Email/Google/Phone sign-in.
2. Generate a service account JSON and copy its three fields into `.env`:
   ```
   AUTH_PROVIDER=firebase
   FIREBASE_PROJECT_ID=...
   FIREBASE_CLIENT_EMAIL=...
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
   ```
3. In your web/mobile client, sign the user in via the Firebase client SDK, then
   POST the resulting `idToken` to `/api/auth/firebase-login`:
   ```js
   await api.post('/auth/firebase-login', { idToken });
   ```
4. The backend upserts the user into Mongo and returns a JWT that your
   protected routes will accept as usual.

## Why both?

- **JWT alone** is the simplest fully-self-hosted path — good for development,
  on-prem deployments, or regions where Firebase isn't ideal.
- **Firebase** gives you phone auth, Google sign-in, and Apple sign-in out of the
  box, plus easy push notifications (FCM) down the road.

The `getProvider()` selector keeps the rest of the codebase oblivious to the
choice — every controller just calls `auth.login()` / `auth.register()` /
`auth.verifyToken()`.
