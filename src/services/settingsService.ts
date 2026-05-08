import { db } from './db';
import type { AppSettings } from '../types';

const SETTINGS_KEY = 'app_settings';

const DEFAULT_SETTINGS: AppSettings = {
  hasCompletedOnboarding: false,
  theme: 'system',
};

export async function getSettings(): Promise<AppSettings> {
  const stored = await db.settings.get(SETTINGS_KEY);
  if (!stored) {
    return DEFAULT_SETTINGS;
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { key, ...settings } = stored;
  return settings as AppSettings;
}

export async function updateSettings(updates: Partial<AppSettings>): Promise<void> {
  const current = await getSettings();
  const updated = { ...current, ...updates };
  
  await db.settings.put({
    key: SETTINGS_KEY,
    ...updated,
  });
}

export async function resetSettings(): Promise<void> {
  await db.settings.put({
    key: SETTINGS_KEY,
    ...DEFAULT_SETTINGS,
  });
}
