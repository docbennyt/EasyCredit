import { db } from "./db";
import { supabase } from "../lib/supabaseClient";
import { generateId } from "../lib/ids";
import { getCurrentTimestamp } from "../lib/dates";
import { getCachedUserId, updateLastSuccessfulSync } from "./localSessionService";
import type {
  Business,
  Customer,
  LedgerEntry,
  SyncEntityType,
  SyncMetadataRecord,
  SyncQueueItem,
  SyncQueueOperation,
  SyncStatusSnapshot,
  UserProfile,
} from "../types";

type Listener = (status: SyncStatusSnapshot) => void;

const LAST_SYNC_KEY = "last_sync_at";

function emptyStatus(): SyncStatusSnapshot {
  return {
    isOnline: typeof navigator === "undefined" ? true : navigator.onLine,
    isSyncing: false,
    unsyncedCount: 0,
    lastSyncAt: null,
    lastError: null,
  };
}

function hasPendingStatus(status: string) {
  return ["pending_create", "pending_update", "pending_delete", "sync_failed", "conflict"].includes(status);
}

function mapProfileFromRemote(raw: {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
  onboarding_completed: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}): UserProfile {
  const now = getCurrentTimestamp();
  return {
    id: raw.id,
    email: raw.email ?? "",
    fullName: raw.full_name ?? undefined,
    role: raw.role === "superadmin" ? "superadmin" : "user",
    onboardingCompleted: Boolean(raw.onboarding_completed),
    createdAt: raw.created_at ?? now,
    updatedAt: raw.updated_at ?? now,
    deletedAt: null,
    localUpdatedAt: raw.updated_at ?? now,
    remoteUpdatedAt: raw.updated_at ?? null,
    syncStatus: "synced",
    version: 1,
  };
}

function mapVentureFromRemote(raw: {
  id: string;
  owner_id: string;
  name: string;
  currency: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}): Business {
  return {
    id: raw.id,
    ownerId: raw.owner_id,
    name: raw.name,
    currency: raw.currency,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    deletedAt: raw.deleted_at ?? null,
    localUpdatedAt: raw.updated_at,
    remoteUpdatedAt: raw.updated_at,
    syncStatus: "synced",
    version: 1,
  };
}

function mapCustomerFromRemote(raw: {
  id: string;
  venture_id: string;
  owner_id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}): Customer {
  return {
    id: raw.id,
    businessId: raw.venture_id,
    ownerId: raw.owner_id,
    name: raw.name,
    phone: raw.phone ?? undefined,
    notes: raw.notes ?? undefined,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    deletedAt: raw.deleted_at ?? null,
    localUpdatedAt: raw.updated_at,
    remoteUpdatedAt: raw.updated_at,
    syncStatus: "synced",
    version: 1,
  };
}

function mapLedgerFromRemote(raw: {
  id: string;
  venture_id: string;
  customer_id: string;
  owner_id: string;
  type: LedgerEntry["type"];
  amount: number | string;
  note: string | null;
  due_date: string | null;
  status: LedgerEntry["status"];
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}): LedgerEntry {
  return {
    id: raw.id,
    businessId: raw.venture_id,
    customerId: raw.customer_id,
    ownerId: raw.owner_id,
    type: raw.type,
    amount: typeof raw.amount === "number" ? raw.amount : Number(raw.amount),
    note: raw.note ?? undefined,
    dueDate: raw.due_date ?? undefined,
    status: raw.status,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    deletedAt: raw.deleted_at ?? null,
    localUpdatedAt: raw.updated_at,
    remoteUpdatedAt: raw.updated_at,
    syncStatus: "synced",
    version: 1,
  };
}

class SyncService {
  private status = emptyStatus();
  private listeners = new Set<Listener>();
  private ownerId: string | null = null;
  private processing = false;
  private started = false;

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener(this.status);
    void this.refreshUnsyncedCount();
    return () => this.listeners.delete(listener);
  }

  getSyncStatus() {
    return this.status;
  }

  async init(ownerId?: string | null) {
    this.ownerId = ownerId ?? getCachedUserId();
    this.status.isOnline = typeof navigator === "undefined" ? true : navigator.onLine;
    this.status.lastSyncAt = await this.getLastSyncTime();
    await this.refreshUnsyncedCount();
    this.emit();

    if (!this.started && typeof window !== "undefined") {
      this.started = true;
      window.addEventListener("online", () => {
        this.status.isOnline = true;
        this.emit();
        void this.syncAll();
      });
      window.addEventListener("offline", () => {
        this.status.isOnline = false;
        this.emit();
      });
      window.setInterval(() => {
        void this.syncAll();
      }, 3 * 60 * 1000);
    }

    if (this.status.isOnline) {
      void this.syncAll();
    }
  }

  async enqueueChange(
    entityType: SyncEntityType,
    entityId: string,
    operation: SyncQueueOperation,
    payload: unknown
  ) {
    const ownerId = this.ownerId ?? getCachedUserId();
    if (!ownerId) {
      return;
    }

    const now = getCurrentTimestamp();
    const existing = await db.syncQueue
      .where("[entityType+entityId]")
      .equals([entityType, entityId] as never)
      .first();

    const queueItem: SyncQueueItem = {
      id: existing?.id ?? generateId(),
      ownerId,
      entityType,
      entityId,
      operation,
      payload,
      status: "pending",
      errorMessage: null,
      retryCount: existing?.retryCount ?? 0,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      lastAttemptAt: existing?.lastAttemptAt ?? null,
    };

    await db.syncQueue.put(queueItem);
    await this.refreshUnsyncedCount();
    this.emit();
  }

  async getUnsyncedCount() {
    await this.refreshUnsyncedCount();
    return this.status.unsyncedCount;
  }

  async getLastSyncTime() {
    return (await db.syncMetadata.get(LAST_SYNC_KEY))?.value ?? null;
  }

  async triggerSyncIfOnline() {
    if (this.status.isOnline) {
      await this.syncAll();
    } else {
      await this.refreshUnsyncedCount();
      this.emit();
    }
  }

  async syncAll() {
    if (!this.status.isOnline || this.processing || !this.ownerId || !supabase) {
      return;
    }

    this.processing = true;
    this.status.isSyncing = true;
    this.status.lastError = null;
    this.emit();

    try {
      await this.pushPendingChanges();
      await this.pullRemoteChanges();
      const now = getCurrentTimestamp();
      await this.setMetadata({ key: LAST_SYNC_KEY, value: now, updatedAt: now });
      updateLastSuccessfulSync(now);
      this.status.lastSyncAt = now;
    } catch (error) {
      this.status.lastError = error instanceof Error ? error.message : "Sync failed";
    } finally {
      this.processing = false;
      this.status.isSyncing = false;
      await this.refreshUnsyncedCount();
      this.emit();
    }
  }

  private async pushPendingChanges() {
    if (!this.ownerId) {
      return;
    }

    const queue = await db.syncQueue
      .where("ownerId")
      .equals(this.ownerId)
      .filter((item) => item.status === "pending" || item.status === "failed")
      .sortBy("createdAt");

    for (const item of queue) {
      await db.syncQueue.update(item.id, {
        status: "processing",
        updatedAt: getCurrentTimestamp(),
        lastAttemptAt: getCurrentTimestamp(),
      });

      try {
        await this.syncEntity(item);
        await db.syncQueue.update(item.id, {
          status: "completed",
          updatedAt: getCurrentTimestamp(),
          errorMessage: null,
        });
      } catch (error) {
        await db.syncQueue.update(item.id, {
          status: "failed",
          updatedAt: getCurrentTimestamp(),
          errorMessage: error instanceof Error ? error.message : "Unknown sync error",
          retryCount: item.retryCount + 1,
        });
        throw error;
      }
    }
  }

  private async syncEntity(item: SyncQueueItem) {
    switch (item.entityType) {
      case "profile":
        await this.syncProfile(item);
        break;
      case "venture":
        await this.syncVenture(item);
        break;
      case "customer":
        await this.syncCustomer(item);
        break;
      case "ledger_entry":
        await this.syncLedger(item);
        break;
    }
  }

  private async syncProfile(item: SyncQueueItem) {
    if (!supabase || !this.ownerId) {
      return;
    }

    const localProfile = await db.profiles.get(this.ownerId);
    const payload = (item.payload ?? {}) as Record<string, unknown>;
    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        id: this.ownerId,
        email: localProfile?.email ?? "",
        full_name: localProfile?.fullName ?? null,
        role: localProfile?.role ?? "user",
        onboarding_completed: Boolean(payload.onboardingCompleted ?? localProfile?.onboardingCompleted),
      })
      .select("id, email, full_name, role, onboarding_completed, created_at, updated_at")
      .single();

    if (error) {
      throw error;
    }

    await db.profiles.put(mapProfileFromRemote(data));
  }

  private async syncVenture(item: SyncQueueItem) {
    if (!supabase || !this.ownerId) {
      return;
    }

    const local = await db.businesses.get(item.entityId);
    if (!local) {
      return;
    }

    if (item.operation === "delete") {
      const { error } = await supabase
        .from("ventures")
        .update({ deleted_at: local.deletedAt ?? getCurrentTimestamp() })
        .eq("id", local.id)
        .eq("owner_id", this.ownerId);

      if (error) {
        throw error;
      }

      await db.businesses.put({
        ...local,
        syncStatus: "synced",
        remoteUpdatedAt: local.updatedAt,
      });
      return;
    }

    const { data, error } = await supabase
      .from("ventures")
      .upsert({
        id: local.id,
        owner_id: this.ownerId,
        name: local.name,
        currency: local.currency,
        deleted_at: local.deletedAt ?? null,
      })
      .select("id, owner_id, name, currency, created_at, updated_at, deleted_at")
      .single();

    if (error) {
      throw error;
    }

    await db.businesses.put(mapVentureFromRemote(data));
  }

  private async syncCustomer(item: SyncQueueItem) {
    if (!supabase || !this.ownerId) {
      return;
    }

    const local = await db.customers.get(item.entityId);
    if (!local) {
      return;
    }

    if (item.operation === "delete") {
      const { error } = await supabase
        .from("customers")
        .update({ deleted_at: local.deletedAt ?? getCurrentTimestamp() })
        .eq("id", local.id)
        .eq("owner_id", this.ownerId);

      if (error) {
        throw error;
      }

      await db.customers.put({
        ...local,
        syncStatus: "synced",
        remoteUpdatedAt: local.updatedAt,
      });
      return;
    }

    const { data, error } = await supabase
      .from("customers")
      .upsert({
        id: local.id,
        venture_id: local.businessId,
        owner_id: this.ownerId,
        name: local.name,
        phone: local.phone ?? null,
        notes: local.notes ?? null,
        deleted_at: local.deletedAt ?? null,
      })
      .select("id, venture_id, owner_id, name, phone, notes, created_at, updated_at, deleted_at")
      .single();

    if (error) {
      throw error;
    }

    await db.customers.put(mapCustomerFromRemote(data));
  }

  private async syncLedger(item: SyncQueueItem) {
    if (!supabase || !this.ownerId) {
      return;
    }

    const local = await db.ledgerEntries.get(item.entityId);
    if (!local) {
      return;
    }

    if (item.operation === "delete") {
      const { error } = await supabase
        .from("ledger_entries")
        .update({ deleted_at: local.deletedAt ?? getCurrentTimestamp() })
        .eq("id", local.id)
        .eq("owner_id", this.ownerId);

      if (error) {
        throw error;
      }

      await db.ledgerEntries.put({
        ...local,
        syncStatus: "synced",
        remoteUpdatedAt: local.updatedAt,
      });
      return;
    }

    const { data, error } = await supabase
      .from("ledger_entries")
      .upsert({
        id: local.id,
        venture_id: local.businessId,
        customer_id: local.customerId,
        owner_id: this.ownerId,
        type: local.type,
        amount: local.amount,
        note: local.note ?? null,
        due_date: local.dueDate ?? null,
        status: local.status,
        sync_status: "synced",
        deleted_at: local.deletedAt ?? null,
      })
      .select(
        "id, venture_id, customer_id, owner_id, type, amount, note, due_date, status, created_at, updated_at, deleted_at"
      )
      .single();

    if (error) {
      throw error;
    }

    await db.ledgerEntries.put(mapLedgerFromRemote(data));
  }

  private async pullRemoteChanges() {
    if (!supabase || !this.ownerId) {
      return;
    }

    const lastSyncAt = await this.getLastSyncTime();

    const profileResult = await supabase
      .from("profiles")
      .select("id, email, full_name, role, onboarding_completed, created_at, updated_at")
      .eq("id", this.ownerId)
      .maybeSingle();

    if (!profileResult.error && profileResult.data) {
      await db.profiles.put(mapProfileFromRemote(profileResult.data));
    }

    let venturesQuery = supabase
      .from("ventures")
      .select("id, owner_id, name, currency, created_at, updated_at, deleted_at")
      .eq("owner_id", this.ownerId)
      .order("updated_at", { ascending: false });
    if (lastSyncAt) {
      venturesQuery = venturesQuery.gt("updated_at", lastSyncAt);
    }
    const venturesResult = await venturesQuery;
    if (venturesResult.error) {
      throw venturesResult.error;
    }

    for (const row of venturesResult.data ?? []) {
      await this.mergeRemoteBusiness(mapVentureFromRemote(row));
    }

    let customersQuery = supabase
      .from("customers")
      .select("id, venture_id, owner_id, name, phone, notes, created_at, updated_at, deleted_at")
      .eq("owner_id", this.ownerId)
      .order("updated_at", { ascending: false });
    if (lastSyncAt) {
      customersQuery = customersQuery.gt("updated_at", lastSyncAt);
    }
    const customersResult = await customersQuery;
    if (customersResult.error) {
      throw customersResult.error;
    }

    for (const row of customersResult.data ?? []) {
      await this.mergeRemoteCustomer(mapCustomerFromRemote(row));
    }

    let ledgerQuery = supabase
      .from("ledger_entries")
      .select(
        "id, venture_id, customer_id, owner_id, type, amount, note, due_date, status, created_at, updated_at, deleted_at"
      )
      .eq("owner_id", this.ownerId)
      .order("updated_at", { ascending: false });
    if (lastSyncAt) {
      ledgerQuery = ledgerQuery.gt("updated_at", lastSyncAt);
    }
    const ledgerResult = await ledgerQuery;
    if (ledgerResult.error) {
      throw ledgerResult.error;
    }

    for (const row of ledgerResult.data ?? []) {
      await this.mergeRemoteLedger(mapLedgerFromRemote(row));
    }
  }

  private async mergeRemoteBusiness(remote: Business) {
    const local = await db.businesses.get(remote.id);
    if (local && hasPendingStatus(local.syncStatus) && new Date(local.updatedAt) > new Date(remote.updatedAt)) {
      return;
    }

    await db.businesses.put(remote);
  }

  private async mergeRemoteCustomer(remote: Customer) {
    const local = await db.customers.get(remote.id);
    if (local && hasPendingStatus(local.syncStatus) && new Date(local.updatedAt) > new Date(remote.updatedAt)) {
      return;
    }

    await db.customers.put(remote);
  }

  private async mergeRemoteLedger(remote: LedgerEntry) {
    const local = await db.ledgerEntries.get(remote.id);
    if (local && hasPendingStatus(local.syncStatus) && new Date(local.updatedAt) > new Date(remote.updatedAt)) {
      return;
    }

    await db.ledgerEntries.put(remote);
  }

  private async setMetadata(record: SyncMetadataRecord) {
    await db.syncMetadata.put(record);
  }

  private async refreshUnsyncedCount() {
    const ownerId = this.ownerId ?? getCachedUserId();
    if (!ownerId) {
      this.status.unsyncedCount = 0;
      return;
    }

    this.status.unsyncedCount = await db.syncQueue
      .where("ownerId")
      .equals(ownerId)
      .filter((item) => item.status !== "completed")
      .count();
  }

  private emit() {
    for (const listener of this.listeners) {
      listener({ ...this.status });
    }
  }
}

export const syncService = new SyncService();

export async function enqueueChange(
  entityType: SyncEntityType,
  entityId: string,
  operation: SyncQueueOperation,
  payload: unknown
) {
  await syncService.enqueueChange(entityType, entityId, operation, payload);
}

export async function getUnsyncedCount() {
  return syncService.getUnsyncedCount();
}

export async function syncPendingChanges() {
  await syncService.syncAll();
}

export async function triggerSyncIfOnline() {
  await syncService.triggerSyncIfOnline();
}
