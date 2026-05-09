import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { updateLastAppRoute } from "../../services/localSessionService";

const TRACKED_PREFIXES = [
  "/dashboard",
  "/customers",
  "/customer",
  "/add-record",
  "/collections",
  "/change",
  "/settings",
  "/business-switcher",
  "/onboarding",
];

export function RouteTracker() {
  const location = useLocation();
  const { canAccessApp } = useAuth();

  useEffect(() => {
    if (!canAccessApp) {
      return;
    }

    if (TRACKED_PREFIXES.some((prefix) => location.pathname.startsWith(prefix))) {
      updateLastAppRoute(`${location.pathname}${location.search}`);
    }
  }, [canAccessApp, location.pathname, location.search]);

  return null;
}
