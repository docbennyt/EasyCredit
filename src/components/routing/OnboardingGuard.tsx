import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { RouteGate } from "./RouteGate";

export function OnboardingGuard() {
  const location = useLocation();
  const { loading, canAccessApp, profile, isConfigured, needsOnlineLogin } = useAuth();

  if (!isConfigured) {
    return (
      <RouteGate
        title="Supabase setup needed"
        message="Configure Supabase environment variables before onboarding can run."
      />
    );
  }

  if (loading) {
    return (
      <RouteGate
        title="Loading onboarding"
        message="EasyCredit is checking whether your account still needs setup."
      />
    );
  }

  if (!canAccessApp) {
    if (needsOnlineLogin) {
      return (
        <RouteGate
          title="Offline sign-in unavailable"
          message="You need to sign in once while online before offline access can work."
        />
      );
    }

    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!profile) {
    return (
      <RouteGate
        title="Profile setup incomplete"
        message="EasyCredit could not load the profile for this account. Apply the Supabase migration and sign in again."
      />
    );
  }

  if (profile?.onboardingCompleted) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
