import type { 
  LedgerEntry, 
  Customer, 
  CustomerStatus, 
  DueStatus,
  BusinessTotals,
  CustomerWithBalance
} from '../types';
import { isDateToday, isDatePast } from './dates';

/**
 * Calculate the impact of a ledger entry on customer balance
 * Positive = customer owes business
 * Negative = business owes customer
 */
export function calculateEntryImpact(entry: LedgerEntry): number {
  switch (entry.type) {
    case 'credit_given':
      return entry.amount; // Customer owes more
    case 'payment_received':
      return -entry.amount; // Customer owes less
    case 'change_owed':
      return -entry.amount; // Business owes customer
    case 'change_returned':
      return entry.amount; // Business owes less
    case 'adjustment':
      return entry.amount; // Can be positive or negative
    default:
      return 0;
  }
}

/**
 * Calculate customer's current balance from their ledger entries
 * Only includes active entries
 */
export function calculateCustomerBalance(entries: LedgerEntry[]): number {
  return entries
    .filter(entry => entry.status === 'active')
    .reduce((total, entry) => total + calculateEntryImpact(entry), 0);
}

/**
 * Get customer status based on balance
 */
export function getCustomerStatus(balance: number): CustomerStatus {
  if (balance > 0) return 'owes_you';
  if (balance < 0) return 'you_owe';
  return 'settled';
}

/**
 * Get due status for a ledger entry
 */
export function getDueStatus(entry: LedgerEntry): DueStatus {
  if (!entry.dueDate) return 'no_due_date';
  
  if (isDatePast(entry.dueDate)) return 'overdue';
  if (isDateToday(entry.dueDate)) return 'due_today';
  return 'upcoming';
}

/**
 * Calculate business totals for dashboard
 */
export function calculateBusinessTotals(
  customers: Customer[],
  entries: LedgerEntry[]
): BusinessTotals {
  // Group entries by customer
  const entriesByCustomer = entries.reduce((acc, entry) => {
    if (!acc[entry.customerId]) {
      acc[entry.customerId] = [];
    }
    acc[entry.customerId].push(entry);
    return acc;
  }, {} as Record<string, LedgerEntry[]>);

  // Calculate balances
  let totalOwedToBusiness = 0;
  let totalChangeOwedToCustomers = 0;
  let activeCustomersCount = 0;
  let settledCustomersCount = 0;

  customers.forEach(customer => {
    const customerEntries = entriesByCustomer[customer.id] || [];
    const balance = calculateCustomerBalance(customerEntries);
    
    if (balance > 0) {
      totalOwedToBusiness += balance;
      activeCustomersCount++;
    } else if (balance < 0) {
      totalChangeOwedToCustomers += Math.abs(balance);
      activeCustomersCount++;
    } else {
      settledCustomersCount++;
    }
  });

  // Count overdue and due today
  const activeEntries = entries.filter(e => e.status === 'active');
  const overdueCount = activeEntries.filter(e => getDueStatus(e) === 'overdue').length;
  const dueTodayCount = activeEntries.filter(e => getDueStatus(e) === 'due_today').length;
  
  // Count unsynced
  const unsyncedCount = entries.filter(e => 
    e.syncStatus !== 'synced'
  ).length;

  return {
    totalOwedToBusiness,
    totalChangeOwedToCustomers,
    netPosition: totalOwedToBusiness - totalChangeOwedToCustomers,
    activeCustomersCount,
    settledCustomersCount,
    overdueCount,
    dueTodayCount,
    unsyncedCount,
  };
}

/**
 * Add balance to customers
 */
export function addBalanceToCustomers(
  customers: Customer[],
  entries: LedgerEntry[]
): CustomerWithBalance[] {
  return customers.map(customer => {
    const customerEntries = entries.filter(e => e.customerId === customer.id);
    const balance = calculateCustomerBalance(customerEntries);
    const status = getCustomerStatus(balance);
    
    // Find last activity date
    const sortedEntries = [...customerEntries].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const lastActivityDate = sortedEntries[0]?.createdAt;

    return {
      ...customer,
      balance,
      status,
      lastActivityDate,
    };
  });
}

/**
 * Sort customers: non-zero balances first, highest absolute balance first
 */
export function sortCustomersByBalance(customers: CustomerWithBalance[]): CustomerWithBalance[] {
  return [...customers].sort((a, b) => {
    // Settled customers go last
    if (a.balance === 0 && b.balance !== 0) return 1;
    if (a.balance !== 0 && b.balance === 0) return -1;
    
    // Sort by absolute balance descending
    return Math.abs(b.balance) - Math.abs(a.balance);
  });
}
