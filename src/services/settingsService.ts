import { db } from "./db";
import { getCurrentTimestamp } from "../lib/dates";
import { enqueueChange } from "./syncService";
import { getCachedUserId, updateLastActiveVenture } from "./localSessionService";
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
  }
}

export async function resetSettings(): Promise<void> {
  await db.settings.put({
    key: SETTINGS_KEY,
    ...DEFAULT_SETTINGS,
    updatedAt: getCurrentTimestamp(),
  });
}
