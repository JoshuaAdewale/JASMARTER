# JASMARTA Backend

Node.js + Express + MongoDB REST API. Powers the JASMARTA web and mobile apps.

## Quick Start

```bash
cp .env.example .env        # fill in MONGODB_URI + JWT_SECRET (+ Stripe + Firebase if used)
npm install
npm run dev                 # http://localhost:5000
npm run seed                # optional: populate with demo data
```

## API Map

| Method | Path                              | Auth | Description                          |
| ------ | --------------------------------- | ---- | ------------------------------------ |
| GET    | `/api/health`                     | —    | Health check                         |
| POST   | `/api/auth/register`              | —    | Sign up (owner/tenant)               |
| POST   | `/api/auth/login`                 | —    | Sign in → JWT                        |
| POST   | `/api/auth/firebase-login`        | —    | Exchange Firebase idToken for JWT    |
| GET    | `/api/auth/me`                    | JWT  | Current user                         |
| GET    | `/api/users`                      | admin| List users                           |
| GET    | `/api/properties`                 | —    | Browse properties (filter, search)   |
| POST   | `/api/properties`                 | owner| Create listing                       |
| GET    | `/api/properties/mine/list`       | owner| My listings                          |
| PUT    | `/api/properties/:id`             | own  | Update listing                       |
| DELETE | `/api/properties/:id`             | own  | Remove listing                       |
| POST   | `/api/leases/apply/:propertyId`   | tenant| Apply for a lease                   |
| GET    | `/api/leases/mine`                | JWT  | My leases                            |
| POST   | `/api/leases/:id/decision`        | owner| approve / reject                     |
| POST   | `/api/leases/:id/terminate`       | own  | End lease                            |
| POST   | `/api/maintenance/:propertyId`    | JWT  | Report issue                         |
| GET    | `/api/maintenance`                | JWT  | List (scoped by role)                |
| PUT    | `/api/maintenance/:id`            | owner| Update status                        |
| POST   | `/api/payments/create-intent`     | tenant| Stripe PaymentIntent                |
| POST   | `/api/payments/confirm`           | tenant| Mark lease paid                     |
| GET    | `/api/admin/dashboard`            | admin| Counts + aggregates                 |
| GET    | `/api/admin/transactions`         | admin| Recent payments                     |

## Folder Structure

```
src/
├── config/db.js
├── controllers/      # business logic per resource
├── middleware/       # auth, role guards, error handler
├── models/           # Mongoose schemas
├── routes/           # Express routers
├── services/         # auth strategy + notifications
├── utils/seed.js
└── server.js
```

## Production Notes

- Set `NODE_ENV=production`, real `MONGODB_URI`, and a 32+ char `JWT_SECRET`.
- Mount the Stripe webhook on a raw-body route (`express.raw({ type: 'application/json' })`) *before* `express.json()`.
- Add Sentry / Pino for observability.
- Add `cors({ origin: process.env.CLIENT_ORIGIN.split(',') })` for multi-domain deploys.
