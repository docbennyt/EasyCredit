import Dexie, { type Table } from 'dexie';
import type { Business, Customer, LedgerEntry, AppSettings } from '../types';

export class EasyCreditDatabase extends Dexie {
  businesses!: Table<Business>;
  customers!: Table<Customer>;
  ledgerEntries!: Table<LedgerEntry>;
  settings!: Table<AppSettings & { key: string }>;

  constructor() {
    super('easycredit_local_db');
    
    this.version(1).stores({
      businesses: 'id, updatedAt',
      customers: 'id, businessId, name, updatedAt',
      ledgerEntries: 'id, businessId, customerId, type, dueDate, status, syncStatus, updatedAt',
      settings: 'key',
    });
  }
}

export const db = new EasyCreditDatabase();
