import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { SUPERADMIN_EMAIL, getAppOrigin, isSupabaseConfigured } from "../lib/env";
import { supabase } from "../lib/supabaseClient";
import { getSettings, updateSettings } from "../services/settingsService";
import { logAppError } from "../services/errorLogService";
import { logAdminAction } from "../services/adminAuditService";
import { db } from "../services/db";
import {
  cacheProfileSession,
  clearLocalSessionSnapshot,
  getLocalSessionSnapshot,
  updateLastActiveVenture,
} from "../services/localSessionService";
import { syncService } from "../services/syncService";
import type { UserProfile } from "../types";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  isConfigured: boolean;
  canAccessApp: boolean;
  isOfflineMode: boolean;
  needsOnlineLogin: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<{ error?: string; requiresEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeAuthErrorMessage(message: string, email?: string) {
  const lower = message.toLowerCase();
  const isSuperadminEmail = email?.toLowerCase() === SUPERADMIN_EMAIL;

  if (
    lower.includes("invalid login credentials") ||
    lower.includes("email not confirmed") ||
    lower.includes("invalid grant")
  ) {
    if (isSuperadminEmail) {
      return `Supabase rejected the superadmin sign-in. First create or confirm ${SUPERADMIN_EMAIL} inside Supabase Auth, then sign in here with that same password. EasyCredit will assign the superadmin role after successful authentication.`;
    }

    return "Supabase rejected the email or password. If this is a new account, use Sign Up first and confirm the email if your Supabase project requires confirmation.";
  }

  if (lower.includes("signup is disabled")) {
    return "Email/password sign-up is disabled in your Supabase project. Turn it on in Supabase Auth > Providers > Email.";
  }

  if (lower.includes("email rate limit exceeded")) {
    return "Supabase temporarily rate-limited this email action. Wait a moment and try again.";
  }

  return message;
}

function normalizeProfile(raw: {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
  onboarding_completed: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}): UserProfile {
  const now = new Date().toISOString();
  return {
    id: raw.id,
    email: raw.email ?? "",
    fullName: raw.full_name ?? undefined,
    role: raw.role === "superadmin" ? "superadmin" : "user",
    onboardingCompleted: Boolean(raw.onboarding_completed),
    createdAt: raw.created_at ?? now,
    updatedAt: raw.updated_at ?? now,
    deletedAt: null,
    localUpdatedAt: raw.updated_at ?? now,
    remoteUpdatedAt: raw.updated_at ?? null,
    syncStatus: "synced",
    version: 1,
  };
}

function isMissingProfileError(error: { code?: string; message: string } | null) {
  if (!error) {
    return false;
  }

  return error.code === "PGRST116" || error.message.toLowerCase().includes("0 rows");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const adminLoggedRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      const localSnapshot = getLocalSessionSnapshot();
      if (localSnapshot) {
        const cachedProfile = await db.profiles.get(localSnapshot.userId);
        if (cachedProfile && mounted) {
          setProfile(cachedProfile);
          setIsOfflineMode(!window.navigator.onLine);
        }
      }

      if (!supabase) {
        setLoading(false);
        return;
      }

      const {
        data: { session: currentSession },
        error,
      } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (error) {
        setAuthError(error.message);
      }

      setSession(currentSession);
      if (currentSession?.user) {
        await loadProfile(currentSession.user);
        await syncService.init(currentSession.user.id);
      } else if (localSnapshot && !window.navigator.onLine) {
        await syncService.init(localSnapshot.userId);
        setIsOfflineMode(true);
      }
      setLoading(false);
    }

    void bootstrap();

    const subscription = supabase?.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthError(null);

      if (!nextSession?.user) {
        setLoading(false);
        if (!window.navigator.onLine && getLocalSessionSnapshot()) {
          setIsOfflineMode(true);
          return;
        }

        setProfile(null);
        adminLoggedRef.current = null;
        return;
      }

      setLoading(true);
      setIsOfflineMode(false);
      void loadProfile(nextSession.user)
        .then(() => syncService.init(nextSession.user.id))
        .finally(() => setLoading(false));
    });

    return () => {
      mounted = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, []);

  async function loadProfile(user: User): Promise<void> {
    if (!supabase) {
      return;
    }

    const settings = await getSettings();
    const isSuperadmin = user.email?.toLowerCase() === SUPERADMIN_EMAIL;
    const desiredRole = isSuperadmin ? "superadmin" : "user";
    const profilePayload = {
      id: user.id,
      email: user.email ?? "",
      full_name:
        (user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.name as string | undefined) ??
        null,
      role: desiredRole,
      onboarding_completed: settings.hasCompletedOnboarding,
    };

    const { data: existingProfile, error: existingProfileError } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, onboarding_completed, created_at, updated_at")
      .eq("id", user.id)
      .maybeSingle();

    if (existingProfileError && !isMissingProfileError(existingProfileError)) {
      if (!window.navigator.onLine) {
        const cachedProfile = await db.profiles.get(user.id);
        if (cachedProfile) {
          setProfile(cachedProfile);
          cacheProfileSession(cachedProfile);
          setIsOfflineMode(true);
          return;
        }
      }

      setAuthError(existingProfileError.message);
      await logAppError(
        "error",
        "Profile prefetch failed",
        {
          source: "AuthProvider.loadProfile",
          details: existingProfileError.message,
        },
        user.id
      );
      return;
    }

    if (!existingProfile) {
      const { error: insertError } = await supabase.from("profiles").insert(profilePayload);
      if (insertError) {
        setAuthError(
          "EasyCredit could not create the profile row for this authenticated user. Run the Supabase backfill patch, then sign in again."
        );
        return;
      }
    } else {
      const updatePayload: Record<string, unknown> = {
        full_name: profilePayload.full_name,
        onboarding_completed: settings.hasCompletedOnboarding,
      };

      if (isSuperadmin && existingProfile.role !== "superadmin") {
        updatePayload.role = "superadmin";
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update(updatePayload)
        .eq("id", user.id);

      if (updateError && isSuperadmin && existingProfile.role !== "superadmin") {
        setAuthError(
          `The account ${SUPERADMIN_EMAIL} authenticated successfully, but its database role is still not superadmin. Run the backfill patch SQL and sign in again.`
        );
        return;
      }
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, onboarding_completed, created_at, updated_at")
      .eq("id", user.id)
      .single();

    if (error) {
      setAuthError(error.message);
      return;
    }

    const normalized = normalizeProfile(data);
    setProfile(normalized);
    await db.profiles.put(normalized);
    cacheProfileSession(normalized);
    updateLastActiveVenture((await getSettings()).selectedBusinessId);
    setIsOfflineMode(false);

    if (normalized.onboardingCompleted !== settings.hasCompletedOnboarding) {
      await updateSettings({
        hasCompletedOnboarding: normalized.onboardingCompleted,
      });
    }

    if (normalized.role === "superadmin" && adminLoggedRef.current !== user.id) {
      adminLoggedRef.current = user.id;
      await logAdminAction({
        adminUserId: user.id,
        action: "admin_session_detected",
        metadata: {
          email: user.email,
        },
      });
    }
  }

  async function signIn(email: string, password: string) {
    if (!supabase) {
      return { error: "Supabase environment variables are not configured yet." };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: normalizeAuthErrorMessage(error.message, email) };
    }

    return {};
  }

  async function signUp(email: string, password: string, fullName?: string) {
    if (!supabase) {
      return { error: "Supabase environment variables are not configured yet." };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${getAppOrigin()}/login`,
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      return { error: normalizeAuthErrorMessage(error.message, email) };
    }

    return {
      requiresEmailConfirmation: !data.session,
    };
  }

  async function signOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }

    const cachedUserId = profile?.id ?? getLocalSessionSnapshot()?.userId;
    if (cachedUserId) {
      await db.transaction("rw", [db.profiles, db.businesses, db.customers, db.ledgerEntries, db.syncQueue], async () => {
        await db.profiles.delete(cachedUserId);
        await db.businesses.where("ownerId").equals(cachedUserId).delete();
        await db.customers.where("ownerId").equals(cachedUserId).delete();
        await db.ledgerEntries.where("ownerId").equals(cachedUserId).delete();
        await db.syncQueue.where("ownerId").equals(cachedUserId).delete();
      });
    }

    clearLocalSessionSnapshot();
    setProfile(null);
    setSession(null);
    setIsOfflineMode(false);
  }

  async function refreshProfile() {
    if (session?.user) {
      await loadProfile(session.user);
      return;
    }

    const snapshot = getLocalSessionSnapshot();
    if (!snapshot) {
      return;
    }

    const cachedProfile = await db.profiles.get(snapshot.userId);
    if (cachedProfile) {
      setProfile(cachedProfile);
    }
  }

  const canAccessApp = Boolean(session?.user || (!window.navigator.onLine && profile));
  const needsOnlineLogin = !window.navigator.onLine && !canAccessApp;

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      authError,
      isConfigured: isSupabaseConfigured,
      canAccessApp,
      isOfflineMode,
      needsOnlineLogin,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [authError, canAccessApp, isOfflineMode, loading, needsOnlineLogin, profile, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
