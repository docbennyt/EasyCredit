export const APP_URL =
  import.meta.env.VITE_APP_URL?.trim() || "http://localhost:5173";

export const SUPERADMIN_EMAIL =
  import.meta.env.VITE_SUPERADMIN_EMAIL?.trim().toLowerCase() ||
  "dr.bennyt.09@gmail.com";

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim() || "";
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || "";

export const isSupabaseConfigured =
  SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
