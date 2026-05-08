# Netlify Deployment

## Production settings

- Build command: `npm run build`
- Publish directory: `dist`

## Continuous deployment

1. Push the repository to GitHub
2. Create a Netlify site from that GitHub repository
3. Confirm the build command and publish directory above
4. Add the environment variables from [environment-variables.md](environment-variables.md)

## SPA routing

`netlify.toml` contains:

- a Vite build section
- a catch-all redirect from `/*` to `/index.html`
- baseline security headers

The redirect is required so deep links like `/login`, `/dashboard`, `/onboarding`, and `/admin` do not 404 on refresh.

## Pre-launch checks

- `npm install`
- `npm run build`
- `npm run preview`
- open `/`
- open `/login`
- refresh `/dashboard` after login
- confirm Netlify deploy log is clean
