# Supabase Setup

## Environment variables

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Auth redirect URLs

Set these in Supabase Auth URL configuration:

- Site URL: your Netlify production URL
- Redirect URL for local development: `http://localhost:5173/**`
- Redirect URL for Netlify production: `https://YOUR-NETLIFY-SITE.netlify.app/**`
- Add the custom domain redirect URL later if you use one

## Database bootstrap

Apply:

- `supabase/migrations/20260508_init_easycredit.sql`

This migration creates:

- `profiles`
- `ventures`
- `customers`
- `ledger_entries`
- `admin_audit_logs`
- `app_error_logs`

It also enables RLS and adds baseline policies.

## Superadmin bootstrap

1. Sign up or log in with `dr.bennyt.09@gmail.com`
2. The app compares against the built-in allowlisted superadmin email constant
3. The app upserts the profile and promotes that email to `superadmin`
4. `/admin` is accessible only after the role is present in `profiles`

## Current architecture note

Supabase Auth is wired into the frontend now, but the active business/customer/ledger UI remains local-first with Dexie while the Supabase data rollout is completed carefully.
