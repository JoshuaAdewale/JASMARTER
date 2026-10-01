# JASMARTA Web (React.js)

Admin, owner, and tenant dashboard. Built with **Vite**, **React 18**, **Tailwind CSS**, and **Redux Toolkit**.

## Quick Start

```bash
cp .env.example .env       # set VITE_API_URL
npm install
npm run dev                # http://localhost:5173
```

## Routes

| Path                     | Who can access |
| ------------------------ | -------------- |
| `/`                      | anyone (landing) |
| `/login`, `/register`    | guests |
| `/properties`            | anyone (browse) |
| `/properties/:id`        | anyone |
| `/dashboard`             | any logged-in user |
| `/dashboard/properties`  | owners & admins |
| `/dashboard/leases`      | any logged-in user |
| `/dashboard/maintenance` | any logged-in user |
| `/admin`                 | admins only |

## Folder Structure

```
src/
├── components/      # Navbar, ProtectedRoute, PropertyCard, PropertyForm
├── pages/           # Landing, Login, Register, PropertyList, PropertyDetail,
│                    # Dashboard, DashboardOverview, MyProperties, MyLeases,
│                    # Maintenance, Admin
├── services/api.js  # Axios instance w/ JWT interceptor
├── store/           # Redux Toolkit slices (auth, properties, leases)
└── App.jsx          # Routes
```

## Stripe Elements (TODO for production)

`pages/MyLeases.jsx` ships with an MVP pay-rent button that creates a PaymentIntent
and immediately marks the lease paid. To go live, mount Stripe's `<PaymentElement>`
on a dedicated `/checkout/:leaseId` route using the returned `clientSecret` —
see [Stripe's React quickstart](https://stripe.com/docs/payments/quickstart).
