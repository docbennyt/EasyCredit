import { formatCurrency } from '../lib/currency';
import { formatDate } from '../lib/dates';
import { StatusBadge } from './StatusBadge';
import type { CustomerWithBalance } from '../types';
import { User, Phone } from 'lucide-react';

interface CustomerCardProps {
  customer: CustomerWithBalance;
  currency: string;
  onClick: () => void;
}

export function CustomerCard({ customer, currency, onClick }: CustomerCardProps) {
  return (
    <div
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <User size={20} className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{customer.name}</h3>
            {customer.phone && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Phone size={12} />
                <span>{customer.phone}</span>
              </div>
            )}
          </div>
        </div>
        <StatusBadge status={customer.status} size="sm" />
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600">Balance</div>
          <div className={`text-lg font-bold ${
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
    </div>
  );
}
