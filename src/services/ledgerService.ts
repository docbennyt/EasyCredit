import { db } from "./db";
import { generateId } from "../lib/ids";
import { getCurrentTimestamp } from "../lib/dates";
import { enqueueChange, triggerSyncIfOnline } from "./syncService";
import { getCachedUserId } from "./localSessionService";
import type { LedgerEntry, LedgerEntryType } from "../types";

function requireOwnerId() {
  const ownerId = getCachedUserId();
  if (!ownerId) {
    throw new Error("No local session available. Sign in online once before using offline storage.");
  }

  return ownerId;
}

export async function getLedgerEntriesByBusiness(businessId: string): Promise<LedgerEntry[]> {
  return (await db.ledgerEntries.where("businessId").equals(businessId).toArray())
    .filter((entry) => !entry.deletedAt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getLedgerEntriesByCustomer(customerId: string): Promise<LedgerEntry[]> {
  return (await db.ledgerEntries.where("customerId").equals(customerId).toArray())
    .filter((entry) => !entry.deletedAt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getLedgerEntryById(id: string): Promise<LedgerEntry | undefined> {
  const entry = await db.ledgerEntries.get(id);
  return entry && !entry.deletedAt ? entry : undefined;
}

export async function createLedgerEntry(data: {
  businessId: string;
  customerId: string;
  type: LedgerEntryType;
  amount: number;
  note?: string;
  dueDate?: string;
}): Promise<LedgerEntry> {
  const ownerId = requireOwnerId();
  const now = getCurrentTimestamp();
  const entry: LedgerEntry = {
    id: generateId(),
    businessId: data.businessId,
    customerId: data.customerId,
    ownerId,
    type: data.type,
    amount: data.amount,
    note: data.note,
    dueDate: data.dueDate,
    status: "active",
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    localUpdatedAt: now,
    remoteUpdatedAt: null,
    syncStatus: "pending_create",
    version: 1,
  };

  await db.ledgerEntries.put(entry);
  await enqueueChange("ledger_entry", entry.id, "create", entry);
  void triggerSyncIfOnline();
  return entry;
}

export async function updateLedgerEntry(id: string, updates: Partial<LedgerEntry>): Promise<void> {
  const existing = await db.ledgerEntries.get(id);
  if (!existing || existing.deletedAt) {
    return;
  }

  const now = getCurrentTimestamp();
  const next: LedgerEntry = {
    ...existing,
    ...updates,
    updatedAt: now,
    localUpdatedAt: now,
    syncStatus: existing.syncStatus === "pending_create" ? "pending_create" : "pending_update",
    version: (existing.version ?? 1) + 1,
  };

  await db.ledgerEntries.put(next);
  await enqueueChange("ledger_entry", id, existing.syncStatus === "pending_create" ? "create" : "update", next);
  void triggerSyncIfOnline();
}

export async function deleteLedgerEntry(id: string): Promise<void> {
  const existing = await db.ledgerEntries.get(id);
  if (!existing || existing.deletedAt) {
    return;
  }

  const now = getCurrentTimestamp();
  const next: LedgerEntry = {
    ...existing,
    deletedAt: now,
    updatedAt: now,
    localUpdatedAt: now,
    syncStatus: "pending_delete",
    version: (existing.version ?? 1) + 1,
  };

  await db.ledgerEntries.put(next);
  await enqueueChange("ledger_entry", id, "delete", next);
  void triggerSyncIfOnline();
}

export async function getUnsyncedEntries(): Promise<LedgerEntry[]> {
  return db.ledgerEntries
    .where("syncStatus")
    .anyOf(["pending_create", "pending_update", "pending_delete", "sync_failed", "conflict"])
    .toArray();
}
