import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getSettings } from './services/settingsService';
import { NewOnboardingPage } from './pages/NewOnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { CustomersPage } from './pages/CustomersPage';
import { CustomerDetailPage } from './pages/CustomerDetailPage';
import { AddRecordPage } from './pages/AddRecordPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { ChangePage } from './pages/ChangePage';
import { SettingsPage } from './pages/SettingsPage';
import { BusinessSwitcherPage } from './pages/BusinessSwitcherPage';

function App() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const settings = await getSettings();
      setHasCompletedOnboarding(settings.hasCompletedOnboarding);
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
      setHasCompletedOnboarding(false);
    }
  };

  // Show loading state while checking onboarding
  if (hasCompletedOnboarding === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect to appropriate page based on onboarding status */}
        <Route
          path="/"
          element={
            hasCompletedOnboarding ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/onboarding" replace />
            )
          }
        />

        {/* Onboarding */}
        <Route path="/onboarding" element={<NewOnboardingPage />} />

        {/* Main App Routes */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/customer/:customerId" element={<CustomerDetailPage />} />
        <Route path="/add-record" element={<AddRecordPage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/change" element={<ChangePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/business-switcher" element={<BusinessSwitcherPage />} />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
