import { db } from "./db";
import { generateId } from "../lib/ids";
import { getCurrentTimestamp } from "../lib/dates";
import { enqueueChange, triggerSyncIfOnline } from "./syncService";
import { getCachedUserId } from "./localSessionService";
import type { Customer } from "../types";

function requireOwnerId() {
  const ownerId = getCachedUserId();
  if (!ownerId) {
    throw new Error("No local session available. Sign in online once before using offline storage.");
  }

  return ownerId;
}

export async function getCustomersByBusiness(businessId: string): Promise<Customer[]> {
  return (await db.customers.where("businessId").equals(businessId).toArray())
    .filter((customer) => !customer.deletedAt)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getCustomerById(id: string): Promise<Customer | undefined> {
  const customer = await db.customers.get(id);
  return customer && !customer.deletedAt ? customer : undefined;
}

export async function createCustomer(
  businessId: string,
  data: { name: string; phone?: string; notes?: string }
): Promise<Customer> {
  const ownerId = requireOwnerId();
  const now = getCurrentTimestamp();
  const customer: Customer = {
    id: generateId(),
    businessId,
    ownerId,
    name: data.name,
    phone: data.phone,
    notes: data.notes,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    localUpdatedAt: now,
    remoteUpdatedAt: null,
    syncStatus: "pending_create",
    version: 1,
  };

  await db.customers.put(customer);
  await enqueueChange("customer", customer.id, "create", customer);
  void triggerSyncIfOnline();
  return customer;
}

export async function updateCustomer(id: string, updates: Partial<Customer>): Promise<void> {
  const existing = await db.customers.get(id);
  if (!existing || existing.deletedAt) {
    return;
  }

  const now = getCurrentTimestamp();
  const next: Customer = {
    ...existing,
    ...updates,
    updatedAt: now,
    localUpdatedAt: now,
    syncStatus: existing.syncStatus === "pending_create" ? "pending_create" : "pending_update",
    version: (existing.version ?? 1) + 1,
  };

  await db.customers.put(next);
  await enqueueChange("customer", id, existing.syncStatus === "pending_create" ? "create" : "update", next);
  void triggerSyncIfOnline();
}

export async function deleteCustomer(id: string): Promise<void> {
  const existing = await db.customers.get(id);
  if (!existing || existing.deletedAt) {
    return;
  }

  const now = getCurrentTimestamp();
  await db.transaction("rw", db.customers, db.ledgerEntries, async () => {
    const relatedEntries = await db.ledgerEntries.where("customerId").equals(id).toArray();

    for (const entry of relatedEntries.filter((item) => !item.deletedAt)) {
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

    const nextCustomer: Customer = {
      ...existing,
      deletedAt: now,
      updatedAt: now,
      localUpdatedAt: now,
      syncStatus: "pending_delete",
      version: (existing.version ?? 1) + 1,
    };
    await db.customers.put(nextCustomer);
    await enqueueChange("customer", id, "delete", nextCustomer);
  });

  void triggerSyncIfOnline();
}

export async function searchCustomers(businessId: string, query: string): Promise<Customer[]> {
  const allCustomers = await getCustomersByBusiness(businessId);
  const lowerQuery = query.toLowerCase();

  return allCustomers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(lowerQuery) ||
      customer.phone?.toLowerCase().includes(lowerQuery) ||
      customer.notes?.toLowerCase().includes(lowerQuery)
  );
}
