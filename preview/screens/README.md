# JASMARTA — rendered screenshots

Real renders of `../JASMARTA-ui-preview.html` (Chromium, 2× DPR, Inter typeface). These are what the UI looks like today.

## Web app (React + Vite + Tailwind)

| File | Screen |
| --- | --- |
| `web-1-landing.jpg` | Landing page — hero, feature grid, footer |
| `web-2-browse.jpg` | Browse properties — filters + cards (`available` / `leased`) |
| `web-3-property-detail.jpg` | Property detail — gallery, amenities, owner card, lease application, cost breakdown |
| `web-4-dashboard.jpg` | Owner dashboard — stat tiles, recent activity, rent due |
| `web-5-my-properties.jpg` | My properties — add-listing form + CRUD table |
| `web-6-my-leases.jpg` | Leases & applications — approve / reject / terminate |
| `web-7-maintenance.jpg` | Maintenance — report issue + status tracking |
| `web-8-admin.jpg` | Admin panel — stats, transactions, disputes |
| `web-9-login.jpg` | Sign in — JWT + Firebase option, demo accounts |

## Mobile app (React Native + Expo + NativeWind)

| File | Screen |
| --- | --- |
| `mobile-1-login.jpg` | LoginScreen |
| `mobile-2-home.jpg` | HomeScreen — 4 quick tiles + tips |
| `mobile-3-browse.jpg` | BrowseScreen |
| `mobile-4-property-detail.jpg` | PropertyDetailScreen |
| `mobile-5-leases.jpg` | MyLeasesScreen — active / pending / rejected |
| `mobile-6-maintenance.jpg` | MaintenanceScreen |
| `mobile-7-profile.jpg` | ProfileScreen |

`mobile-row-a.jpg` and `mobile-row-b.jpg` are contact sheets (4-up and 3-up) for quick sharing.

## Sections

| File | Contents |
| --- | --- |
| `section-hero.jpg` | Intro banner with the tagline + stack chips |
| `section-system.jpg` | Repo structure, full API surface, run commands, honest status list |
| `full-page.jpg` | The entire walkthrough in one tall image |

## Regenerate

```bash
pip install playwright && python3 -m playwright install chromium   # one-time
python3 preview/build.py    # refresh the HTML from the template
python3 preview/screens.py  # re-render every screenshot
```

For faithful typography, install the Inter font system-wide before rendering (the app uses `font-family: Inter`); without it the renders fall back to a default sans-serif.
