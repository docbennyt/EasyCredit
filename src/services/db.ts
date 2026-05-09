import Dexie, { type Table } from "dexie";
import type {
  AdminAuditLog,
  AppErrorLog,
  AppSettingsRecord,
  Business,
  Customer,
  LedgerEntry,
  SyncMetadataRecord,
  SyncQueueItem,
  UserProfile,
} from "../types";

export class EasyCreditDatabase extends Dexie {
  profiles!: Table<UserProfile>;
  businesses!: Table<Business>;
  customers!: Table<Customer>;
  ledgerEntries!: Table<LedgerEntry>;
  syncQueue!: Table<SyncQueueItem>;
  settings!: Table<AppSettingsRecord>;
  syncMetadata!: Table<SyncMetadataRecord>;
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

    this.version(3).stores({
      profiles: "id, email, role, onboardingCompleted, updatedAt, syncStatus",
      businesses:
        "id, ownerId, name, updatedAt, deletedAt, syncStatus, localUpdatedAt, remoteUpdatedAt",
      customers:
        "id, businessId, ownerId, name, phone, updatedAt, deletedAt, syncStatus, localUpdatedAt, remoteUpdatedAt",
      ledgerEntries:
        "id, businessId, customerId, ownerId, type, dueDate, status, updatedAt, deletedAt, syncStatus, localUpdatedAt, remoteUpdatedAt",
      syncQueue: "[entityType+entityId], id, ownerId, status, updatedAt, createdAt",
      settings: "key, updatedAt",
      syncMetadata: "key, updatedAt",
      adminAuditLogs: "id, adminUserId, createdAt",
      appErrorLogs: "id, userId, severity, createdAt",
    });
  }
}

export const db = new EasyCreditDatabase();
