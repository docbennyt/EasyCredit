# PWA

EasyCredit now uses `vite-plugin-pwa` for the production service worker and manifest generation.

## Installability

- `start_url`: `/`
- `scope`: `/`
- `display`: `standalone`
- `orientation`: `portrait`
- install banner shown only when `beforeinstallprompt` is available
- dismissal is stored locally
- iOS Safari add-to-home-screen instructions are included

## Icons

Required icons:

- `public/icon-192.png`
- `public/icon-512.png`
- `public/icon-maskable-512.png`

## Offline behavior

- app shell assets are cached
- navigation requests fall back to `index.html`
- sensitive API responses are not aggressively cached

## Test checklist

- Chrome Android install prompt
- Desktop Chrome install
- iOS Safari Add to Home Screen flow
- offline reload after the first production load
- installed app opens `/`
