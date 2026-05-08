import { getUnsyncedEntries } from './ledgerService';

/**
 * Placeholder sync service for future Supabase integration
 * 
 * Future implementation will:
 * - Push pending records to Supabase
 * - Pull changes from cloud
 * - Handle conflict resolution (latest updatedAt wins)
 * - Map businessId to cloud business
 * - Require user authentication
 */

export async function syncPendingChanges(): Promise<void> {
  // Placeholder: In production, this will sync with Supabase
  const unsynced = await getUnsyncedEntries();
  console.log(`[Sync Placeholder] ${unsynced.length} records pending sync`);
  
  // TODO: Implement Supabase sync
  // - Authenticate user
  // - Push local changes to cloud
  // - Pull remote changes
  // - Resolve conflicts
  // - Update syncStatus to 'synced'
}

export async function getUnsyncedCount(): Promise<number> {
  const unsynced = await getUnsyncedEntries();
  return unsynced.length;
}
