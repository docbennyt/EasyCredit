import type {
  LedgerEntry,
  CustomerWithBalance,
  CustomerWithRisk,
  CustomerRiskLevel,
  CashflowInsights,
  CashflowDataPoint,
  ActionItem,
} from '../types';
import {
  getDueStatus,
} from './calculations';
import { differenceInDays, subDays, startOfDay, parseISO } from 'date-fns';

/**
 * Calculate customer risk score and level
 */
export function calculateCustomerRisk(
  customer: CustomerWithBalance,
  entries: LedgerEntry[]
): CustomerWithRisk {
  const customerEntries = entries.filter(e => e.customerId === customer.id);
  const activeEntries = customerEntries.filter(e => e.status === 'active');
  
  let score = 100; // Start with perfect score
  let riskReason = 'No activity';
  let daysOverdue: number | undefined;
  let overdueAmount: number | undefined;

  if (activeEntries.length === 0) {
    return {
      ...customer,
      riskLevel: 'good',
      riskScore: 100,
      riskReason: 'No active records',
    };
  }

  // Calculate overdue information
  const overdueEntries = activeEntries.filter(e => getDueStatus(e) === 'overdue');
  if (overdueEntries.length > 0) {
    const oldestOverdue = overdueEntries.reduce((oldest, entry) => {
      if (!oldest.dueDate || !entry.dueDate) return oldest;
      return new Date(entry.dueDate) < new Date(oldest.dueDate) ? entry : oldest;
    }, overdueEntries[0]);

    if (oldestOverdue.dueDate) {
      daysOverdue = differenceInDays(new Date(), parseISO(oldestOverdue.dueDate));
    }

    overdueAmount = overdueEntries.reduce((sum, e) => sum + e.amount, 0);
  }

  // Scoring logic
  const balance = customer.balance;
  
  // Negative score for overdue
  if (daysOverdue) {
    score -= Math.min(daysOverdue * 5, 50); // Max -50 for overdue
    riskReason = `${daysOverdue} days overdue`;
  }

  // Negative score for high outstanding balance
  if (balance > 0) {
    if (balance > 100) score -= 20;
    else if (balance > 50) score -= 10;
  }

  // Negative score for no recent payment
  const paymentEntries = customerEntries
    .filter(e => e.type === 'payment_received')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  if (paymentEntries.length === 0 && balance > 0) {
    score -= 15;
    if (!daysOverdue) riskReason = 'No payment history';
  } else if (paymentEntries.length > 0) {
    const lastPayment = paymentEntries[0];
    const daysSincePayment = differenceInDays(new Date(), parseISO(lastPayment.createdAt));
    
    if (daysSincePayment > 30 && balance > 0) {
      score -= 10;
      if (!daysOverdue) riskReason = 'No recent payment (30+ days)';
    } else if (daysSincePayment <= 7 && balance === 0) {
      score += 10; // Bonus for recent settlement
      riskReason = 'Usually pays on time';
    }
  }

  // Bonus for customers who owe business change (negative balance)
  if (balance < 0) {
    score = Math.min(score + 10, 100);
    riskReason = 'You owe customer change';
  }

  // Bonus for settled customers
  if (balance === 0 && paymentEntries.length > 0) {
    score = Math.min(score + 5, 100);
    riskReason = 'Settled - good payment history';
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  // Determine risk level
  let riskLevel: CustomerRiskLevel;
  if (score >= 80) {
    riskLevel = 'reliable';
  } else if (score >= 60) {
    riskLevel = 'good';
  } else if (score >= 40) {
    riskLevel = 'watch';
  } else {
    riskLevel = 'high_risk';
  }

  // Override reason for specific cases
  if (daysOverdue && daysOverdue > 14) {
    riskReason = 'Overdue and becoming risky';
  } else if (daysOverdue && daysOverdue > 7) {
    riskReason = 'Overdue - needs follow-up';
  }

  return {
    ...customer,
    riskLevel,
    riskScore: score,
    riskReason,
    daysOverdue,
    overdueAmount,
  };
}

/**
 * Calculate cashflow insights for a time period
 */
export function calculateCashflowInsights(
  entries: LedgerEntry[],
  daysBack: number = 30
): CashflowInsights {
  const cutoffDate = subDays(new Date(), daysBack);
  const recentEntries = entries.filter(
    e => new Date(e.createdAt) >= cutoffDate && e.status === 'active'
  );

  let creditGivenTotal = 0;
  let paymentsReceivedTotal = 0;
  let changeOwedTotal = 0;
  let changeReturnedTotal = 0;

  recentEntries.forEach(entry => {
    switch (entry.type) {
      case 'credit_given':
        creditGivenTotal += entry.amount;
        break;
      case 'payment_received':
        paymentsReceivedTotal += entry.amount;
        break;
      case 'change_owed':
        changeOwedTotal += entry.amount;
        break;
      case 'change_returned':
        changeReturnedTotal += entry.amount;
        break;
    }
  });

  const collectionRate = creditGivenTotal > 0
    ? (paymentsReceivedTotal / creditGivenTotal) * 100
    : 100;

  const netCashflow = paymentsReceivedTotal - creditGivenTotal + changeReturnedTotal - changeOwedTotal;

  return {
    creditGivenTotal,
    paymentsReceivedTotal,
    changeOwedTotal,
    changeReturnedTotal,
    collectionRate,
    netCashflow,
  };
}

/**
 * Generate daily cashflow data points for charting
 */
export function generateCashflowData(
  entries: LedgerEntry[],
  daysBack: number = 30
): CashflowDataPoint[] {
  const dataPoints: CashflowDataPoint[] = [];
  const today = startOfDay(new Date());

  for (let i = daysBack - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = date.toISOString().split('T')[0];

    const dayEntries = entries.filter(e => {
      const entryDate = startOfDay(parseISO(e.createdAt));
      return entryDate.getTime() === date.getTime() && e.status === 'active';
    });

    let creditGiven = 0;
    let paymentsReceived = 0;
    let changeOwed = 0;
    let changeReturned = 0;

    dayEntries.forEach(entry => {
      switch (entry.type) {
        case 'credit_given':
          creditGiven += entry.amount;
          break;
        case 'payment_received':
          paymentsReceived += entry.amount;
          break;
        case 'change_owed':
          changeOwed += entry.amount;
          break;
        case 'change_returned':
          changeReturned += entry.amount;
          break;
      }
    });

    dataPoints.push({
      date: dateStr,
      creditGiven,
      paymentsReceived,
      changeOwed,
      changeReturned,
    });
  }

  return dataPoints;
}

/**
 * Generate action items for today
 */
export function generateActionItems(
  customers: CustomerWithRisk[],
  entries: LedgerEntry[]
): ActionItem[] {
  const actions: ActionItem[] = [];

  customers.forEach(customer => {
    const customerEntries = entries.filter(
      e => e.customerId === customer.id && e.status === 'active'
    );

    // High priority: Overdue payments
    if (customer.daysOverdue && customer.daysOverdue > 0 && customer.balance > 0) {
      actions.push({
        id: `follow-up-${customer.id}`,
        type: 'follow_up',
        customerId: customer.id,
        customerName: customer.name,
        amount: customer.balance,
        daysOverdue: customer.daysOverdue,
        priority: customer.daysOverdue > 7 ? 'high' : 'medium',
        message: `Follow up with ${customer.name} — ${customer.daysOverdue} days overdue`,
      });
    }

    // Medium priority: Due today
    const dueTodayEntries = customerEntries.filter(e => getDueStatus(e) === 'due_today');
    if (dueTodayEntries.length > 0 && customer.balance > 0) {
      const totalDue = dueTodayEntries.reduce((sum, e) => sum + e.amount, 0);
      actions.push({
        id: `due-today-${customer.id}`,
        type: 'collect_payment',
        customerId: customer.id,
        customerName: customer.name,
        amount: totalDue,
        priority: 'medium',
        message: `Collect payment from ${customer.name} — due today`,
      });
    }

    // Low priority: Return change
    if (customer.balance < 0) {
      actions.push({
        id: `return-change-${customer.id}`,
        type: 'return_change',
        customerId: customer.id,
        customerName: customer.name,
        amount: Math.abs(customer.balance),
        priority: 'low',
        message: `Return ${Math.abs(customer.balance)} change to ${customer.name}`,
      });
    }
  });

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

/**
 * Sort customers by action priority
 */
export function sortCustomersByActionPriority(
  customers: CustomerWithRisk[]
): CustomerWithRisk[] {
  return [...customers].sort((a, b) => {
    // Overdue and high risk first
    if (a.daysOverdue && !b.daysOverdue) return -1;
    if (!a.daysOverdue && b.daysOverdue) return 1;
    if (a.daysOverdue && b.daysOverdue) {
      return b.daysOverdue - a.daysOverdue;
    }

    // Then by risk level
    const riskOrder = { high_risk: 0, watch: 1, good: 2, reliable: 3 };
    const riskDiff = riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    if (riskDiff !== 0) return riskDiff;

    // Then by absolute balance
    return Math.abs(b.balance) - Math.abs(a.balance);
  });
}
