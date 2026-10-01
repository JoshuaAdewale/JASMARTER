# JASMARTA Mobile (React Native + Expo)

iOS + Android app. Built with **Expo 50**, **React Native 0.73**, **NativeWind**, **React Navigation**, and **Redux Toolkit**.

## Quick Start

```bash
cp .env.example .env        # set EXPO_PUBLIC_API_URL
npm install
npx expo start              # opens Expo Dev Tools
```

Scan the QR code with the **Expo Go** app on iOS/Android, or press `i` / `a` for the simulator.

## Tech Notes

- **NativeWind** — Tailwind-style classes (`className="bg-brand-600 ..."`) for React Native. Configured via `tailwind.config.js` + `babel.config.js` plugin.
- **React Navigation** — Stack inside, Tabs at root. Auth-aware root navigator (Login/Register vs Main tabs).
- **Redux Toolkit** — single `auth` slice persists JWT in `AsyncStorage` and re-hydrates on launch via `restoreSession()`.
- **Push notifications** — wire up `expo-notifications` + a server endpoint when ready. The backend already has a `Notification` model and email helper.

## Folder Structure

```
src/
├── navigation/AppNavigator.js
├── screens/        # Login, Register, Home, Browse, PropertyDetail,
│                   # MyLeases, Maintenance, Profile
├── services/api.js # axios + JWT injection
├── store/          # Redux slices
└── App.js          # root with Provider
```

## Building for Stores

```bash
npx expo prebuild --clean            # generate native projects
npx expo run:ios   /   npx expo run:android
# Then in EAS:
npm i -g eas-cli
eas build --platform ios
eas build --platform android
```

For Apple/Google store metadata (icon, splash, descriptions) see `app.json`.
