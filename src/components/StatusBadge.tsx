import { cn } from '../utils/cn';
import type { CustomerStatus, DueStatus } from '../types';

interface StatusBadgeProps {
  status: CustomerStatus | DueStatus | 'online' | 'offline';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
  };

  const statusConfig = {
    owes_you: { label: 'Owes you', color: 'bg-green-100 text-green-800' },
    you_owe: { label: 'You owe', color: 'bg-red-100 text-red-800' },
    settled: { label: 'Settled', color: 'bg-gray-100 text-gray-800' },
    overdue: { label: 'Overdue', color: 'bg-red-100 text-red-800' },
    due_today: { label: 'Due today', color: 'bg-amber-100 text-amber-800' },
    upcoming: { label: 'Upcoming', color: 'bg-blue-100 text-blue-800' },
    no_due_date: { label: 'No due date', color: 'bg-gray-100 text-gray-600' },
    online: { label: 'Online', color: 'bg-green-100 text-green-800' },
    offline: { label: 'Offline', color: 'bg-gray-100 text-gray-800' },
  };

  const config = statusConfig[status];

  return (
    <span className={cn('inline-flex items-center rounded-full font-medium', sizeStyles[size], config.color)}>
      {config.label}
    </span>
  );
}
