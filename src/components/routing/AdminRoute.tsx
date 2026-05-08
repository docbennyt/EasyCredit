import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { RouteGate } from "./RouteGate";

export function AdminRoute() {
  const location = useLocation();
  const { loading, session, profile, isConfigured } = useAuth();

  if (!isConfigured) {
    return (
      <RouteGate
        title="Supabase setup needed"
        message="Admin tools need Supabase auth and profiles to be configured first."
      />
    );
  }

  if (loading) {
    return (
      <RouteGate
        title="Checking admin access"
        message="EasyCredit is validating the current role before opening the admin area."
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
        message="Admin access depends on the Supabase profiles table and superadmin bootstrap logic."
      />
    );
  }

  if (profile?.role !== "superadmin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
