import { useEffect, useState } from "react";
import { usePwaInstall } from "../context/PwaInstallProvider";
import { logAppError } from "../services/errorLogService";
import { useAuth } from "../context/AuthProvider";
import { useSyncStatus } from "../hooks/useSyncStatus";

export function AppStatusChrome() {
  const { canPromptInstall, dismissPrompt, isDismissed, isIos, promptInstall } = usePwaInstall();
  const { user, canAccessApp } = useAuth();
  const syncStatus = useSyncStatus();
  const [isOffline, setIsOffline] = useState(!window.navigator.onLine);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      void logAppError(
        "error",
        event.reason instanceof Error ? event.reason.message : "Unhandled promise rejection",
        {
          source: "window.unhandledrejection",
        },
        user?.id
      );
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, [user?.id]);

  const showInstallBanner = !isDismissed && (canPromptInstall || isIos);

  return (
    <>
      {isOffline ? (
        <div className="sticky top-0 z-[90] border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm font-medium text-amber-900">
          Offline mode - records are saved on this device.
        </div>
      ) : null}

      {canAccessApp ? (
        <div className="sticky top-0 z-[89] border-b border-slate-200 bg-white/95 px-4 py-2 text-center text-xs font-medium text-slate-700 backdrop-blur">
          {syncStatus.isSyncing
            ? "Back online - syncing in the background."
            : syncStatus.unsyncedCount > 0
              ? `${syncStatus.unsyncedCount} changes waiting to sync.`
              : syncStatus.lastSyncAt
                ? `Synced. Last synced: ${new Date(syncStatus.lastSyncAt).toLocaleString()}.`
                : "Local workspace ready."}
          {syncStatus.lastError ? " Sync failed. Your records are still saved locally." : ""}
        </div>
      ) : null}

      {showInstallBanner ? (
        <div className="fixed inset-x-0 bottom-4 z-[95] mx-auto w-[calc(100%-1.5rem)] max-w-xl rounded-3xl border border-purple-200 bg-white/95 p-4 shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Install EasyCredit for faster access, offline use, and a mobile-app feel.
              </p>
              <p className="mt-1 text-xs text-slate-600">
                {isIos
                  ? "On iPhone or iPad, use Safari Share then Add to Home Screen."
                  : "Installability is browser-controlled, so the prompt appears only when supported."}
              </p>
            </div>
            <div className="flex gap-2">
              {canPromptInstall ? (
                <button
                  type="button"
                  onClick={() => {
                    void promptInstall();
                  }}
                  className="rounded-2xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Install
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowIosHelp((value) => !value)}
                  className="rounded-2xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Show iOS steps
                </button>
              )}
              <button
                type="button"
                onClick={dismissPrompt}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Dismiss
              </button>
            </div>
          </div>
          {showIosHelp && isIos ? (
            <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-700">
              Open EasyCredit in Safari, tap Share, then choose Add to Home Screen. After one online
              sign-in, the installed app can reopen into the workspace from local data.
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
