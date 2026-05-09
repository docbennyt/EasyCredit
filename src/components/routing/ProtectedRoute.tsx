import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { RouteGate } from "./RouteGate";

export function ProtectedRoute() {
  const location = useLocation();
  const { loading, canAccessApp, profile, isConfigured, needsOnlineLogin } = useAuth();

  if (!isConfigured) {
    return (
      <RouteGate
        title="Supabase setup needed"
        message="Add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before protected app routes can be used."
      />
    );
  }

  if (loading) {
    return (
      <RouteGate
        title="Checking your session"
        message="EasyCredit is confirming your account and onboarding status."
      />
    );
  }

  if (!canAccessApp) {
    if (needsOnlineLogin) {
      return (
        <RouteGate
          title="Offline access not ready"
          message="Sign in once while online so EasyCredit can prepare this device for offline use."
        />
      );
    }

    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!profile) {
    if (!window.navigator.onLine) {
      return (
        <RouteGate
          title="Opening EasyCredit offline"
          message="Your cloud profile is unavailable right now, so EasyCredit is using the records saved on this device."
        />
      );
    }

    return (
      <RouteGate
        title="Profile setup incomplete"
        message="The authenticated account could not load its EasyCredit profile yet. Confirm that the Supabase tables and RLS policies are in place."
      />
    );
  }

  if (!profile?.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
