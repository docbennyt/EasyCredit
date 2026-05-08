# EasyCredit

EasyCredit is a mobile-first React + Vite PWA for tracking customer credit, customer change, follow-ups, and cashflow across multiple ventures.

Developer and copyright holder: Dr BennyT (Benedictus T Makuyana)  
Email: `dr.bennyt.09@gmail.com`  
WhatsApp: `+263780481182`

## Launch routing

`/` loads the public landing page.

`/login`, `/auth`, and `/signup` open Supabase Auth entry.

Authenticated users are routed like this:

- onboarding incomplete: `/onboarding`
- onboarding complete: `/dashboard`
- `/admin`: superadmin only

## Local setup

1. Install dependencies with `npm install`
2. Copy `.env.example` into a local `.env`
3. Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
4. Run `npm run build`
5. Run `npm run preview`

## Netlify

- Build command: `npm run build`
- Publish directory: `dist`
- SPA redirects and security headers are in `netlify.toml`

## Supabase

Apply `supabase/migrations/20260508_init_easycredit.sql` before production auth testing.

Important:

- never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code
- only use `VITE_SUPABASE_ANON_KEY` in the client
- keep RLS enabled on all user-data tables
- add Auth redirect URLs for local and Netlify environments

## PWA

The app now uses `vite-plugin-pwa` with:

- installable manifest
- generated production service worker
- landing-page start URL
- install prompt banner with dismissal memory
- iOS add-to-home-screen guidance

## Docs

- [Netlify deployment](docs/deployment/netlify.md)
- [Supabase deployment](docs/deployment/supabase.md)
- [Environment variables](docs/deployment/environment-variables.md)
- [Routing](docs/routing.md)
- [PWA](docs/pwa.md)
- [Security](docs/security.md)
- [Admin](docs/admin.md)
- [Copyright](docs/copyright.md)
