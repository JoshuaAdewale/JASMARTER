# Mobile App Assets

This folder needs three image files before Expo can build the app:

- `icon.png`  — 1024×1024 app icon (rounded square)
- `splash.png` — 1284×2778 splash screen (centered logo on brand color)
- `adaptive-icon.png` — 1024×1024 foreground for Android adaptive icon

### Quick placeholders

For development you can drop in any 1024×1024 PNG as `icon.png` and a 1284×2778 PNG as `splash.png`. The `app.json` references these paths.

For a polished icon, generate one with a design tool (Figma, Illustrator, Midjourney, etc.) using:

- Background: `#2563eb` (brand blue)
- Foreground: a white house silhouette or the letter "J"

After adding the assets, run `npx expo start` to verify they render correctly.
