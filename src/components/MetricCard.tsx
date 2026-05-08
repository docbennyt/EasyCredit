import { cn } from '../utils/cn';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'positive' | 'negative' | 'neutral';
  onClick?: () => void;
}

export function MetricCard({ label, value, icon, trend, onClick }: MetricCardProps) {
  const trendColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-900',
  };

  const colorClass = trend ? trendColors[trend] : 'text-gray-900';

  return (
    <div
      className={cn(
        'bg-white rounded-xl p-5 shadow-sm border border-gray-200',
        onClick && 'cursor-pointer hover:shadow-md transition-shadow'
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className={cn('text-2xl font-bold', colorClass)}>
        {value}
      </div>
    </div>
  );
}
