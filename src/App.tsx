import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppStatusChrome } from "./components/AppStatusChrome";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AdminRoute } from "./components/routing/AdminRoute";
import { HomeRoute } from "./components/routing/HomeRoute";
import { OnboardingGuard } from "./components/routing/OnboardingGuard";
import { OpenAppRedirect } from "./components/routing/OpenAppRedirect";
import { ProtectedRoute } from "./components/routing/ProtectedRoute";
import { RouteTracker } from "./components/routing/RouteTracker";
import { AuthProvider } from "./context/AuthProvider";
import { PwaInstallProvider } from "./context/PwaInstallProvider";
import { AddRecordPage } from "./pages/AddRecordPage";
import { AdminPage } from "./pages/AdminPage";
import { AuthPage } from "./pages/AuthPage";
import { BusinessSwitcherPage } from "./pages/BusinessSwitcherPage";
import { ChangePage } from "./pages/ChangePage";
import { CollectionsPage } from "./pages/CollectionsPage";
import { CustomerDetailPage } from "./pages/CustomerDetailPage";
import { CustomersPage } from "./pages/CustomersPage";
import { DashboardPage } from "./pages/DashboardPage";
import { HealthPage } from "./pages/HealthPage";
import { NewOnboardingPage } from "./pages/NewOnboardingPage";
import { SettingsPage } from "./pages/SettingsPage";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PwaInstallProvider>
          <BrowserRouter>
            <AppStatusChrome />
            <RouteTracker />
            <Routes>
              <Route path="/" element={<HomeRoute />} />
              <Route path="/open" element={<OpenAppRedirect />} />
              <Route path="/health" element={<HealthPage />} />
              <Route path="/login" element={<AuthPage initialMode="login" />} />
              <Route path="/auth" element={<AuthPage initialMode="login" />} />
              <Route path="/signup" element={<AuthPage initialMode="signup" />} />

              <Route element={<OnboardingGuard />}>
                <Route path="/onboarding" element={<NewOnboardingPage />} />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/customer/:customerId" element={<CustomerDetailPage />} />
                <Route path="/add-record" element={<AddRecordPage />} />
                <Route path="/collections" element={<CollectionsPage />} />
                <Route path="/change" element={<ChangePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/business-switcher" element={<BusinessSwitcherPage />} />
              </Route>

              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </PwaInstallProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
