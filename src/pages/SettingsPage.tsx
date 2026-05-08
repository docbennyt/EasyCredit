import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { TopBar } from "../components/TopBar";
import { Button } from "../components/Button";
import { getSettings, resetSettings } from "../services/settingsService";
import { getBusinessById } from "../services/businessService";
import { db } from "../services/db";
import type { Business } from "../types";
import { Building2, Download, Trash2, Cloud, DownloadCloud, Shield } from "lucide-react";
import { usePwaInstall } from "../context/PwaInstallProvider";
import { useAuth } from "../context/AuthProvider";

export function SettingsPage() {
  const navigate = useNavigate();
  const { canPromptInstall, isIos, promptInstall, resetPromptDismissal } = usePwaInstall();
  const { profile, signOut } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const settings = await getSettings();
      if (settings.selectedBusinessId) {
        const selectedBusiness = await getBusinessById(settings.selectedBusinessId);
        if (selectedBusiness) {
          setBusiness(selectedBusiness);
        }
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const businesses = await db.businesses.toArray();
      const customers = await db.customers.toArray();
      const entries = await db.ledgerEntries.toArray();
      const settings = await db.settings.toArray();

      const exportData = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        data: {
          businesses,
          customers,
          entries,
          settings,
        },
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `easycredit-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export data:", error);
      alert("Failed to export data. Please try again.");
    }
  };

  const handleClearData = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear all local data? This cannot be undone."
    );

    if (!confirmed) return;

    try {
      await db.businesses.clear();
      await db.customers.clear();
      await db.ledgerEntries.clear();
      await resetSettings();
      
      alert("All data cleared successfully.");
      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("Failed to clear data:", error);
      alert("Failed to clear data. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-600">Loading...</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <TopBar title="Settings" />

      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* Business Section */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={20} className="text-gray-600" />
            <h2 className="text-lg font-bold text-gray-900">Business</h2>
          </div>
          
          {business && (
            <div className="mb-4">
              <div className="text-sm text-gray-600">Current Business</div>
              <div className="text-lg font-semibold text-gray-900">{business.name}</div>
              <div className="text-sm text-gray-600">Currency: {business.currency}</div>
            </div>
          )}

          <Button
            variant="secondary"
            onClick={() => navigate('/business-switcher')}
            className="w-full"
          >
            Manage Businesses
          </Button>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <DownloadCloud size={20} className="text-gray-600" />
            <h2 className="text-lg font-bold text-gray-900">Install App</h2>
          </div>

          <p className="text-gray-600 mb-4">
            Install EasyCredit for faster access, offline use, and a mobile-app feel.
          </p>

          {canPromptInstall ? (
            <Button
              variant="primary"
              onClick={() => {
                void promptInstall();
              }}
              className="w-full"
            >
              Install EasyCredit
            </Button>
          ) : (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm text-purple-900">
              {isIos
                ? "On iPhone or iPad, open Safari, tap Share, then choose Add to Home Screen."
                : "The browser install prompt appears only when the app meets installability checks in production."}
            </div>
          )}

          <Button
            variant="secondary"
            onClick={resetPromptDismissal}
            className="w-full mt-3"
          >
            Re-enable install prompt
          </Button>
        </div>

        {/* Sync Section */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Cloud size={20} className="text-gray-600" />
            <h2 className="text-lg font-bold text-gray-900">Cloud Sync</h2>
          </div>
          
          <p className="text-gray-600 mb-4">
            Supabase authentication is wired in. The current data layer remains local-first while
            production Supabase tables and policies are prepared for controlled rollout.
          </p>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-900">
              <strong>Production note:</strong> Never expose the Supabase service role key in the
              frontend. Use the anon key only, with Row Level Security enabled on all user data.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={20} className="text-gray-600" />
            <h2 className="text-lg font-bold text-gray-900">Account</h2>
          </div>

          <div className="text-sm text-gray-600 mb-4">
            <p>Signed in as: {profile?.email ?? "Not signed in"}</p>
            <p className="mt-1">Role: {profile?.role ?? "guest"}</p>
          </div>

          <Button
            variant="secondary"
            onClick={() => {
              void signOut().then(() => navigate("/login"));
            }}
            className="w-full"
          >
            Sign Out
          </Button>
        </div>

        {/* Data Tools */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Download size={20} className="text-gray-600" />
            <h2 className="text-lg font-bold text-gray-900">Data Tools</h2>
          </div>
          
          <div className="space-y-3">
            <Button
              variant="secondary"
              onClick={handleExportData}
              className="w-full"
            >
              Export Data as JSON
            </Button>

            <Button
              variant="danger"
              onClick={handleClearData}
              className="w-full flex items-center justify-center gap-2"
            >
              <Trash2 size={20} />
              Clear All Data
            </Button>
          </div>
        </div>

        {/* App Info */}
        <div className="text-center text-sm text-gray-500">
          <p>EasyCredit v{__APP_VERSION__}</p>
          <p className="mt-1">
            © 2026 EasyCredit. Developed by Dr BennyT (Benedictus T Makuyana). All rights
            reserved.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
