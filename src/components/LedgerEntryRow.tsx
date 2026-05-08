import { formatCurrency } from '../lib/currency';
import { formatDate } from '../lib/dates';
import { calculateEntryImpact, getDueStatus } from '../lib/calculations';
import { StatusBadge } from './StatusBadge';
import type { LedgerEntry } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowDownLeft, 
  ArrowUpRight,
  Edit3 
} from 'lucide-react';

interface LedgerEntryRowProps {
  entry: LedgerEntry;
  currency: string;
  showCustomer?: boolean;
  customerName?: string;
}

const entryTypeConfig = {
  credit_given: {
    label: 'Credit given',
    icon: TrendingUp,
    color: 'text-green-600',
  },
  payment_received: {
    label: 'Payment received',
    icon: TrendingDown,
    color: 'text-blue-600',
  },
  change_owed: {
    label: 'Change owed',
    icon: ArrowDownLeft,
    color: 'text-red-600',
  },
  change_returned: {
    label: 'Change returned',
    icon: ArrowUpRight,
    color: 'text-blue-600',
  },
  adjustment: {
    label: 'Adjustment',
    icon: Edit3,
    color: 'text-gray-600',
  },
};

export function LedgerEntryRow({ entry, currency, showCustomer, customerName }: LedgerEntryRowProps) {
  const config = entryTypeConfig[entry.type];
  const Icon = config.icon;
  const impact = calculateEntryImpact(entry);
  const dueStatus = entry.dueDate ? getDueStatus(entry) : null;

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`${config.color}`}>
            <Icon size={20} />
          </div>
          <div>
            <div className="font-medium text-gray-900">{config.label}</div>
            {showCustomer && customerName && (
              <div className="text-sm text-gray-600">{customerName}</div>
            )}
          </div>
        </div>
        <div className={`text-lg font-bold ${
          impact > 0 ? 'text-green-600' : impact < 0 ? 'text-red-600' : 'text-gray-600'
        }`}>
          {impact > 0 ? '+' : ''}{formatCurrency(impact, currency)}
        </div>
      </div>

      {entry.note && (
        <p className="text-sm text-gray-600 mb-2">{entry.note}</p>
      )}

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>{formatDate(entry.createdAt)}</span>
        {entry.dueDate && dueStatus && (
          <>
            <span>•</span>
            <StatusBadge status={dueStatus} size="sm" />
          </>
        )}
        {entry.syncStatus !== 'synced' && (
          <>
            <span>•</span>
            <span className="text-amber-600">Local</span>
          </>
        )}
      </div>
    </div>
  );
}
