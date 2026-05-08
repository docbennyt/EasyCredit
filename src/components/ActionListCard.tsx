import { InsightCard } from './InsightCard';
import { formatCurrency } from '../lib/currency';
import type { ActionItem } from '../types';
import { AlertCircle, Phone, Banknote, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ActionListCardProps {
  actions: ActionItem[];
  currency: string;
}

export function ActionListCard({ actions, currency }: ActionListCardProps) {
  const navigate = useNavigate();

  if (actions.length === 0) {
    return (
      <InsightCard title="Today's Actions" icon={<AlertCircle size={20} />}>
        <p className="text-gray-600 text-sm">
          All clear! No urgent actions for today.
        </p>
      </InsightCard>
    );
  }

  const getActionIcon = (type: ActionItem['type']) => {
    switch (type) {
      case 'follow_up':
      case 'collect_payment':
        return <TrendingUp size={16} className="text-red-600" />;
      case 'return_change':
        return <Banknote size={16} className="text-blue-600" />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const getPriorityColor = (priority: ActionItem['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-amber-200 bg-amber-50';
      case 'low':
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <InsightCard
      title="Today's Actions"
      icon={<AlertCircle size={20} />}
      action={{
        label: 'View All',
        onClick: () => navigate('/collections'),
      }}
    >
      <div className="space-y-2">
        {actions.slice(0, 5).map((action) => (
          <div
            key={action.id}
            className={`p-3 rounded-lg border ${getPriorityColor(action.priority)} cursor-pointer hover:shadow-sm transition-shadow`}
            onClick={() => navigate(`/customer/${action.customerId}`)}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getActionIcon(action.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{action.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(action.amount, currency)}
                  </span>
                  {action.daysOverdue && (
                    <span className="text-xs text-red-600 font-medium">
                      {action.daysOverdue} days
                    </span>
                  )}
                </div>
              </div>
              <Phone size={16} className="text-purple-600 mt-1 flex-shrink-0" />
            </div>
          </div>
        ))}
        {actions.length > 5 && (
          <p className="text-xs text-gray-500 text-center pt-2">
            +{actions.length - 5} more actions
          </p>
        )}
      </div>
    </InsightCard>
  );
}
