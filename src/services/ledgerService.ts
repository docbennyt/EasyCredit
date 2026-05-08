import { db } from './db';
import type { LedgerEntry, LedgerEntryType } from '../types';
import { generateId } from '../lib/ids';
import { getCurrentTimestamp } from '../lib/dates';

export async function getLedgerEntriesByBusiness(businessId: string): Promise<LedgerEntry[]> {
  return await db.ledgerEntries.where('businessId').equals(businessId).toArray();
}

export async function getLedgerEntriesByCustomer(customerId: string): Promise<LedgerEntry[]> {
  return await db.ledgerEntries.where('customerId').equals(customerId).toArray();
}

export async function getLedgerEntryById(id: string): Promise<LedgerEntry | undefined> {
  return await db.ledgerEntries.get(id);
}

export async function createLedgerEntry(data: {
  businessId: string;
  customerId: string;
  type: LedgerEntryType;
  amount: number;
  note?: string;
  dueDate?: string;
}): Promise<LedgerEntry> {
  const now = getCurrentTimestamp();
  const entry: LedgerEntry = {
    id: generateId(),
    businessId: data.businessId,
    customerId: data.customerId,
    type: data.type,
    amount: data.amount,
    note: data.note,
    dueDate: data.dueDate,
    status: 'active',
    syncStatus: 'local',
    createdAt: now,
    updatedAt: now,
  };
  
  await db.ledgerEntries.add(entry);
  return entry;
}

export async function updateLedgerEntry(id: string, updates: Partial<LedgerEntry>): Promise<void> {
  await db.ledgerEntries.update(id, {
    ...updates,
    updatedAt: getCurrentTimestamp(),
  });
}

export async function deleteLedgerEntry(id: string): Promise<void> {
  await db.ledgerEntries.delete(id);
}

export async function getUnsyncedEntries(): Promise<LedgerEntry[]> {
  return await db.ledgerEntries
    .where('syncStatus')
    .anyOf(['local', 'pending_sync'])
    .toArray();
}
