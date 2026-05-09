import { db } from "./db";
import { getCurrentTimestamp } from "../lib/dates";
import { enqueueChange } from "./syncService";
import { getCachedUserId, updateLastActiveVenture, cacheProfileSession } from "./localSessionService";
import type { AppSettings } from "../types";

const SETTINGS_KEY = "app_settings";

const DEFAULT_SETTINGS: AppSettings = {
  hasCompletedOnboarding: false,
  theme: "system",
};

export async function getSettings(): Promise<AppSettings> {
  const stored = await db.settings.get(SETTINGS_KEY);
  if (!stored) {
    return DEFAULT_SETTINGS;
  }

  const { key, updatedAt, ...settings } = stored;
  void key;
  void updatedAt;
  return settings as AppSettings;
}

export async function updateSettings(updates: Partial<AppSettings>): Promise<void> {
  const current = await getSettings();
  const updatedAt = getCurrentTimestamp();
  const updated = { ...current, ...updates };

  await db.settings.put({
    key: SETTINGS_KEY,
    ...updated,
    updatedAt,
  });

  if (updates.selectedBusinessId !== undefined) {
    updateLastActiveVenture(updates.selectedBusinessId);
  }

  const ownerId = getCachedUserId();
  if (ownerId && updates.hasCompletedOnboarding !== undefined) {
    await enqueueChange("profile", ownerId, "update", {
      id: ownerId,
      onboardingCompleted: updated.hasCompletedOnboarding,
      updatedAt,
    });

    // Update the local cached session/profile so offline boot respects
    // the new onboardingCompleted value immediately.
    try {
      const existing = await db.profiles.get(ownerId);
      const now = getCurrentTimestamp();
      const minimal = existing
        ? {
            ...existing,
            onboardingCompleted: updated.hasCompletedOnboarding,
            updatedAt: now,
            localUpdatedAt: now,
            syncStatus: existing.syncStatus ?? "pending_update",
          }
        : {
            id: ownerId,
            email: "",
            fullName: undefined,
            role: "user",
            onboardingCompleted: updated.hasCompletedOnboarding,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
            localUpdatedAt: now,
            remoteUpdatedAt: null,
            syncStatus: "pending_create",
            version: 1,
          };

      await db.profiles.put(minimal as any);
      // cacheProfileSession expects a UserProfile shape; import locally to call it
      // Avoid circular import by requiring it here.
      cacheProfileSession(minimal as any);
    } catch (err) {
      void err;
    }
  }
}

export async function resetSettings(): Promise<void> {
  await db.settings.put({
    key: SETTINGS_KEY,
    ...DEFAULT_SETTINGS,
    updatedAt: getCurrentTimestamp(),
  });
}
