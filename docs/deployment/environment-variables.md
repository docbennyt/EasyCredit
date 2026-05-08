# Environment Variables

Use the following values in local `.env` files and in Netlify Site Configuration.

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_or_publishable_key
VITE_APP_URL=http://localhost:5173
VITE_SUPERADMIN_EMAIL=dr.bennyt.09@gmail.com
```

## Rules

- Never place `SUPABASE_SERVICE_ROLE_KEY` in frontend code
- Keep secrets out of committed files
- Update `VITE_APP_URL` if your local dev port changes
- In Netlify, use the production site URL for auth redirects and confirmation links
