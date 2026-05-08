# Routing

## Public routes

- `/` → public landing page from `src/landing.html`
- `/login` and `/auth` → login/signup UI
- `/signup` → signup-first view
- `/health` → simple health page

## Auth-protected routes

- `/dashboard`
- `/customers`
- `/customer/:customerId`
- `/add-record`
- `/collections`
- `/change`
- `/settings`
- `/business-switcher`

Behavior:

- unauthenticated users are redirected to `/login`
- authenticated users with incomplete onboarding are redirected to `/onboarding`

## Onboarding route

- `/onboarding`

Behavior:

- unauthenticated users are redirected to `/login`
- users with completed onboarding are redirected to `/dashboard`

## Admin route

- `/admin`

Behavior:

- unauthenticated users are redirected to `/login`
- non-superadmins are redirected to `/dashboard`
- only `profile.role === "superadmin"` is allowed through
