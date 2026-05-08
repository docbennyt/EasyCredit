export const LOCAL_DEV_URL = "http://localhost:5173";
export const SUPERADMIN_EMAIL = "dr.bennyt.09@gmail.com";

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim() || "";
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || "";

export const isSupabaseConfigured =
  SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;

export function getAppOrigin() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return LOCAL_DEV_URL;
}
