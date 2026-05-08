# Environment Variables

Use the following values in local `.env` files and in Netlify Site Configuration.

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_or_publishable_key
```

## Rules

- Never place `SUPABASE_SERVICE_ROLE_KEY` in frontend code
- Keep secrets out of committed files
- In Netlify, only add the two `VITE_SUPABASE_*` frontend variables above
- Configure Supabase Auth redirect URLs directly in Supabase for both local and production origins
