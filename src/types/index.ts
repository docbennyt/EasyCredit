export type SyncStatus =
  | "synced"
  | "pending_create"
  | "pending_update"
  | "pending_delete"
  | "sync_failed"
  | "conflict";

export type SyncQueueOperation = "create" | "update" | "delete";
export type SyncQueueStatus = "pending" | "processing" | "failed" | "completed";
export type SyncEntityType = "profile" | "venture" | "customer" | "ledger_entry";

export interface SyncMetadataFields {
  syncStatus: SyncStatus;
  localUpdatedAt: string;
  remoteUpdatedAt?: string | null;
  deletedAt?: string | null;
  version?: number;
}

export interface Business extends SyncMetadataFields {
  id: string;
  ownerId: string;
  name: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer extends SyncMetadataFields {
  id: string;
  businessId: string;
  ownerId: string;
  name: string;
  phone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type LedgerEntryType =
  | "credit_given"
  | "payment_received"
  | "change_owed"
  | "change_returned"
  | "adjustment";

export type LedgerEntryStatus = "active" | "settled" | "cancelled";

export interface LedgerEntry extends SyncMetadataFields {
  id: string;
  businessId: string;
  customerId: string;
  ownerId: string;
  type: LedgerEntryType;
  amount: number;
  note?: string;
  dueDate?: string;
  status: LedgerEntryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  selectedBusinessId?: string;
  hasCompletedOnboarding: boolean;
  theme: "light" | "dark" | "system";
}

export interface AppSettingsRecord extends AppSettings {
  key: string;
  updatedAt: string;
}

export interface UserProfile extends SyncMetadataFields {
  id: string;
  email: string;
  fullName?: string;
  role: "user" | "superadmin";
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SyncQueueItem {
  id: string;
  ownerId: string;
  entityType: SyncEntityType;
  entityId: string;
  operation: SyncQueueOperation;
  payload: unknown;
  status: SyncQueueStatus;
  errorMessage?: string | null;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
  lastAttemptAt?: string | null;
}

export interface SyncMetadataRecord {
  key: string;
  value: string;
  updatedAt: string;
}

export interface LocalSessionSnapshot {
  userId: string;
  email: string;
  role: "user" | "superadmin";
  onboardingCompleted: boolean;
  lastActiveVentureId?: string;
  lastAppRoute?: string;
  lastSuccessfulSyncAt?: string | null;
}

export interface SyncStatusSnapshot {
  isOnline: boolean;
  isSyncing: boolean;
  unsyncedCount: number;
  lastSyncAt?: string | null;
  lastError?: string | null;
}

export interface AdminAuditLog {
  id: string;
  adminUserId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AppErrorLog {
  id: string;
  userId?: string;
  severity: "info" | "warning" | "error";
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export type CustomerStatus = "owes_you" | "you_owe" | "settled";
export type DueStatus = "overdue" | "due_today" | "upcoming" | "no_due_date";

export interface BusinessTotals {
  totalOwedToBusiness: number;
  totalChangeOwedToCustomers: number;
  netPosition: number;
  activeCustomersCount: number;
  settledCustomersCount: number;
  overdueCount: number;
  dueTodayCount: number;
  unsyncedCount: number;
}

export interface CustomerWithBalance extends Customer {
  balance: number;
  status: CustomerStatus;
  lastActivityDate?: string;
}

export type CustomerRiskLevel = "reliable" | "good" | "watch" | "high_risk";

export interface CustomerWithRisk extends CustomerWithBalance {
  riskLevel: CustomerRiskLevel;
  riskScore: number;
  riskReason: string;
  daysOverdue?: number;
  overdueAmount?: number;
}

export interface CashflowInsights {
  creditGivenTotal: number;
  paymentsReceivedTotal: number;
  changeOwedTotal: number;
  changeReturnedTotal: number;
  collectionRate: number;
  netCashflow: number;
}

export interface CashflowDataPoint {
  date: string;
  creditGiven: number;
  paymentsReceived: number;
  changeOwed: number;
  changeReturned: number;
}

export interface ActionItem {
  id: string;
  type: "follow_up" | "return_change" | "collect_payment";
  customerId: string;
  customerName: string;
  amount: number;
  daysOverdue?: number;
  priority: "high" | "medium" | "low";
  message: string;
}
