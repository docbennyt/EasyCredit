import { formatCurrency } from '../lib/currency';
import { formatDate } from '../lib/dates';
import { StatusBadge } from './StatusBadge';
import { RiskBadge } from './RiskBadge';
import { PhoneAction, NoPhone } from './PhoneAction';
import type { CustomerWithRisk } from '../types';
import { User, AlertCircle } from 'lucide-react';

interface EnhancedCustomerCardProps {
  customer: CustomerWithRisk;
  currency: string;
  onClick: () => void;
}

export function EnhancedCustomerCard({ customer, currency, onClick }: EnhancedCustomerCardProps) {
  const needsFollowUp = customer.daysOverdue && customer.daysOverdue > 0;
  
  return (
    <div
      className={`bg-white rounded-xl p-4 shadow-sm border-2 transition-all cursor-pointer ${
        needsFollowUp
          ? 'border-red-200 hover:border-red-300 hover:shadow-lg'
          : 'border-gray-200 hover:border-purple-200 hover:shadow-md'
      }`}
      onClick={onClick}
    >
      {/* Header with name and status */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            needsFollowUp ? 'bg-red-100' : 'bg-purple-100'
          }`}>
            <User size={24} className={needsFollowUp ? 'text-red-600' : 'text-purple-600'} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{customer.name}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <StatusBadge status={customer.status} size="sm" />
              <RiskBadge level={customer.riskLevel} size="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Overdue alert if applicable */}
      {needsFollowUp && (
        <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
          <span className="text-sm text-red-800 font-medium">
            {customer.daysOverdue} days overdue
          </span>
        </div>
      )}

      {/* Phone action */}
      {customer.phone ? (
        <div className="mb-3" onClick={(e) => e.stopPropagation()}>
          <PhoneAction phone={customer.phone} customerName={customer.name} compact />
        </div>
      ) : (
        <div className="mb-3">
          <NoPhone compact />
        </div>
      )}

      {/* Balance and activity */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div>
          <div className="text-xs text-gray-600 mb-0.5">Balance</div>
          <div className={`text-xl font-bold ${
            customer.balance > 0 ? 'text-green-600' : 
            customer.balance < 0 ? 'text-red-600' : 
            'text-gray-600'
          }`}>
            {formatCurrency(customer.balance, currency)}
          </div>
        </div>
        {customer.lastActivityDate && (
          <div className="text-right">
            <div className="text-xs text-gray-500">Last activity</div>
            <div className="text-xs text-gray-600">{formatDate(customer.lastActivityDate)}</div>
          </div>
        )}
      </div>

      {/* Risk reason */}
      <div className="mt-2 text-xs text-gray-600 italic">
        {customer.riskReason}
      </div>
    </div>
  );
}
