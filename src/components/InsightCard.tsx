import { ReactNode } from 'react';

interface InsightCardProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function InsightCard({ title, children, icon, action }: InsightCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon && <div className="text-purple-600">{icon}</div>}
          <h3 className="font-bold text-gray-900">{title}</h3>
        </div>
        {action && (
          <button
            onClick={action.onClick}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            {action.label}
          </button>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

interface InterpretationTextProps {
  children: ReactNode;
  type?: 'neutral' | 'positive' | 'negative' | 'warning';
}

export function InterpretationText({ children, type = 'neutral' }: InterpretationTextProps) {
  const colorClasses = {
    neutral: 'text-gray-600',
    positive: 'text-green-700 bg-green-50 border-green-200',
    negative: 'text-red-700 bg-red-50 border-red-200',
    warning: 'text-amber-700 bg-amber-50 border-amber-200',
  };

  const className = type === 'neutral'
    ? 'text-sm text-gray-600 italic'
    : `text-sm px-3 py-2 rounded-lg border ${colorClasses[type]}`;

  return <p className={className}>{children}</p>;
}
