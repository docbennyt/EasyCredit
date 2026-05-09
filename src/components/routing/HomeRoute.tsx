import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { getCachedLastRoute } from "../../services/localSessionService";
import { LandingPage } from "../../pages/LandingPage";
import { RouteGate } from "./RouteGate";

export function HomeRoute() {
  const { loading, canAccessApp, profile } = useAuth();

  if (loading) {
    return (
      <RouteGate
        title="Opening EasyCredit"
        message="Restoring your local workspace and last session."
      />
    );
  }

  if (!canAccessApp) {
    return <LandingPage />;
  }

  const lastRoute = getCachedLastRoute();
  if (lastRoute && !["/", "/login", "/signup"].includes(lastRoute)) {
    return <Navigate to={lastRoute} replace />;
  }

  return <Navigate to={profile?.onboardingCompleted ? "/dashboard" : "/onboarding"} replace />;
}
