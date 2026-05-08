import Dexie, { type Table } from "dexie";
import type {
  AdminAuditLog,
  AppErrorLog,
  AppSettings,
  Business,
  Customer,
  LedgerEntry,
} from "../types";

export class EasyCreditDatabase extends Dexie {
  businesses!: Table<Business>;
  customers!: Table<Customer>;
  ledgerEntries!: Table<LedgerEntry>;
  settings!: Table<AppSettings & { key: string }>;
  adminAuditLogs!: Table<AdminAuditLog>;
  appErrorLogs!: Table<AppErrorLog>;

  constructor() {
    super("easycredit_local_db");

    this.version(1).stores({
      businesses: "id, updatedAt",
      customers: "id, businessId, name, updatedAt",
      ledgerEntries: "id, businessId, customerId, type, dueDate, status, syncStatus, updatedAt",
      settings: "key",
    });

    this.version(2).stores({
      businesses: "id, ownerId, updatedAt",
      customers: "id, businessId, ownerId, name, updatedAt",
      ledgerEntries:
        "id, businessId, customerId, ownerId, type, dueDate, status, syncStatus, updatedAt",
      settings: "key",
      adminAuditLogs: "id, adminUserId, createdAt",
      appErrorLogs: "id, userId, severity, createdAt",
    });
  }
}

export const db = new EasyCreditDatabase();
