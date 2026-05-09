import { db } from "./db";
import { generateId } from "../lib/ids";
import { getCurrentTimestamp } from "../lib/dates";
import { enqueueChange, triggerSyncIfOnline } from "./syncService";
import { getCachedUserId } from "./localSessionService";
import type { Business } from "../types";

function requireOwnerId() {
  const ownerId = getCachedUserId();
  if (!ownerId) {
    throw new Error("No local session available. Sign in online once before using offline storage.");
  }

  return ownerId;
}

export async function getAllBusinesses(): Promise<Business[]> {
  const ownerId = getCachedUserId();
  const rows = ownerId
    ? await db.businesses.where("ownerId").equals(ownerId).toArray()
    : await db.businesses.toArray();

  return rows.filter((business) => !business.deletedAt).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getBusinessById(id: string): Promise<Business | undefined> {
  const business = await db.businesses.get(id);
  return business && !business.deletedAt ? business : undefined;
}

export async function createBusiness(name: string, currency = "USD"): Promise<Business> {
  const ownerId = requireOwnerId();
  const now = getCurrentTimestamp();
  const business: Business = {
    id: generateId(),
    ownerId,
    name,
    currency,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    localUpdatedAt: now,
    remoteUpdatedAt: null,
    syncStatus: "pending_create",
    version: 1,
  };

  await db.businesses.put(business);
  await enqueueChange("venture", business.id, "create", business);
  void triggerSyncIfOnline();
  return business;
}

export async function updateBusiness(id: string, updates: Partial<Business>): Promise<void> {
  const existing = await db.businesses.get(id);
  if (!existing || existing.deletedAt) {
    return;
  }

  const now = getCurrentTimestamp();
  const next: Business = {
    ...existing,
    ...updates,
    updatedAt: now,
    localUpdatedAt: now,
    syncStatus: existing.syncStatus === "pending_create" ? "pending_create" : "pending_update",
    version: (existing.version ?? 1) + 1,
  };

  await db.businesses.put(next);
  await enqueueChange("venture", id, existing.syncStatus === "pending_create" ? "create" : "update", next);
  void triggerSyncIfOnline();
}

export async function deleteBusiness(id: string): Promise<void> {
  const existing = await db.businesses.get(id);
  if (!existing || existing.deletedAt) {
    return;
  }

  const now = getCurrentTimestamp();
  await db.transaction("rw", db.businesses, db.customers, db.ledgerEntries, async () => {
    const customers = await db.customers.where("businessId").equals(id).toArray();
    const entries = await db.ledgerEntries.where("businessId").equals(id).toArray();

    for (const customer of customers.filter((item) => !item.deletedAt)) {
      const nextCustomer = {
        ...customer,
        deletedAt: now,
        updatedAt: now,
        localUpdatedAt: now,
        syncStatus: "pending_delete" as const,
      };
      await db.customers.put(nextCustomer);
      await enqueueChange("customer", customer.id, "delete", nextCustomer);
    }

    for (const entry of entries.filter((item) => !item.deletedAt)) {
      const nextEntry = {
        ...entry,
        deletedAt: now,
        updatedAt: now,
        localUpdatedAt: now,
        syncStatus: "pending_delete" as const,
      };
      await db.ledgerEntries.put(nextEntry);
      await enqueueChange("ledger_entry", entry.id, "delete", nextEntry);
    }

    const nextBusiness: Business = {
      ...existing,
      deletedAt: now,
      updatedAt: now,
      localUpdatedAt: now,
      syncStatus: "pending_delete",
      version: (existing.version ?? 1) + 1,
    };
    await db.businesses.put(nextBusiness);
    await enqueueChange("venture", id, "delete", nextBusiness);
  });

  void triggerSyncIfOnline();
}
