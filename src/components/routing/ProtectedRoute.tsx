import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { RouteGate } from "./RouteGate";

export function ProtectedRoute() {
  const location = useLocation();
  const { loading, session, profile, isConfigured } = useAuth();

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

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!profile) {
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
