# Security

## Auth

- Supabase Auth manages passwords and sessions
- no plaintext admin password is stored in the app
- `/admin` requires login plus a `superadmin` profile role

## Row Level Security

RLS is enabled in the Supabase migration for:

- `profiles`
- `ventures`
- `customers`
- `ledger_entries`
- `admin_audit_logs`
- `app_error_logs`

## Frontend hardening

- Netlify security headers in `netlify.toml`
- React error boundary
- offline state indicator
- auth loading states and route gates
- no service-role key in client code

## Operational reminder

Frontend route guards are helpful, but data isolation must still be enforced by Supabase RLS.
