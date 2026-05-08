# Admin

## Superadmin email

`dr.bennyt.09@gmail.com`

## Access model

1. Log in with Supabase Auth
2. Match the email against `VITE_SUPERADMIN_EMAIL`
3. The frontend upserts the `profiles` row with role `superadmin`
4. `/admin` allows only that role

## Admin dashboard scope

The current admin screen includes:

- local operational totals for ventures, customers, and ledger records
- recent local app errors
- local audit log entries
- build metadata
- manual guidance for Netlify and Supabase free-plan monitoring

## Important limitation

Accurate global usage metrics still need secure server-side reporting or direct review in the Supabase and Netlify dashboards. The current frontend intentionally avoids broad customer-data exposure for admin counts.
