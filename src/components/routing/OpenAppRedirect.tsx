import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { RouteGate } from "./RouteGate";

export function OpenAppRedirect() {
  const { loading, session, profile } = useAuth();

  if (loading) {
    return (
      <RouteGate
        title="Opening EasyCredit"
        message="We are choosing the right next screen for this account."
      />
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={profile?.onboardingCompleted ? "/dashboard" : "/onboarding"} replace />;
}
