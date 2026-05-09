import type { LocalSessionSnapshot, UserProfile } from "../types";

const SESSION_KEY = "easycredit.local-session.v1";

function readSnapshot(): LocalSessionSnapshot | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as LocalSessionSnapshot;
  } catch {
    return null;
  }
}

function writeSnapshot(snapshot: LocalSessionSnapshot | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!snapshot) {
    window.localStorage.removeItem(SESSION_KEY);
    return;
  }

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(snapshot));
}

export function getLocalSessionSnapshot() {
  return readSnapshot();
}

export function clearLocalSessionSnapshot() {
  writeSnapshot(null);
}

export function cacheProfileSession(profile: UserProfile) {
  const current = readSnapshot();
  writeSnapshot({
    userId: profile.id,
    email: profile.email,
    role: profile.role,
    onboardingCompleted: profile.onboardingCompleted,
    lastActiveVentureId: current?.lastActiveVentureId,
    lastAppRoute: current?.lastAppRoute,
    lastSuccessfulSyncAt: current?.lastSuccessfulSyncAt ?? null,
  });
}

export function updateLastAppRoute(route: string) {
  const current = readSnapshot();
  if (!current) {
    return;
  }

  writeSnapshot({
    ...current,
    lastAppRoute: route,
  });
}

export function updateLastActiveVenture(ventureId?: string) {
  const current = readSnapshot();
  if (!current) {
    return;
  }

  writeSnapshot({
    ...current,
    lastActiveVentureId: ventureId,
  });
}

export function updateLastSuccessfulSync(lastSuccessfulSyncAt: string | null) {
  const current = readSnapshot();
  if (!current) {
    return;
  }

  writeSnapshot({
    ...current,
    lastSuccessfulSyncAt,
  });
}

export function getCachedUserId() {
  return readSnapshot()?.userId ?? null;
}

export function getCachedLastRoute() {
  return readSnapshot()?.lastAppRoute ?? null;
}
