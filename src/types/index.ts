// Core business entity
export interface Business {
  id: string;
  name: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

// Customer entity
export interface Customer {
  id: string;
  businessId: string;
  name: string;
  phone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Ledger entry types
export type LedgerEntryType =
  | "credit_given"
  | "payment_received"
  | "change_owed"
  | "change_returned"
  | "adjustment";

export type LedgerEntryStatus =
  | "active"
  | "settled"
  | "cancelled";

export type SyncStatus =
  | "local"
  | "pending_sync"
  | "synced"
  | "failed";

// Ledger entry entity
export interface LedgerEntry {
  id: string;
  businessId: string;
  customerId: string;
  type: LedgerEntryType;
  amount: number;
  note?: string;
  dueDate?: string;
  status: LedgerEntryStatus;
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
}

// App settings
export interface AppSettings {
  selectedBusinessId?: string;
  hasCompletedOnboarding: boolean;
  theme: "light" | "dark" | "system";
}

// Derived types for UI
export type CustomerStatus = "owes_you" | "you_owe" | "settled";
export type DueStatus = "overdue" | "due_today" | "upcoming" | "no_due_date";

// Business totals for dashboard
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

// Customer with calculated balance
export interface CustomerWithBalance extends Customer {
  balance: number;
  status: CustomerStatus;
  lastActivityDate?: string;
}

// Customer risk levels
export type CustomerRiskLevel = "reliable" | "good" | "watch" | "high_risk";

// Customer with risk scoring
export interface CustomerWithRisk extends CustomerWithBalance {
  riskLevel: CustomerRiskLevel;
  riskScore: number; // 0-100
  riskReason: string;
  daysOverdue?: number;
  overdueAmount?: number;
}

// Cashflow insights
export interface CashflowInsights {
  creditGivenTotal: number;
  paymentsReceivedTotal: number;
  changeOwedTotal: number;
  changeReturnedTotal: number;
  collectionRate: number; // percentage
  netCashflow: number;
}

// Time-based cashflow data
export interface CashflowDataPoint {
  date: string;
  creditGiven: number;
  paymentsReceived: number;
  changeOwed: number;
  changeReturned: number;
}

// Action item for follow-ups
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
