import type { CustomerRiskLevel } from '../types';
import { Shield, AlertTriangle, Eye, CheckCircle } from 'lucide-react';

interface RiskBadgeProps {
  level: CustomerRiskLevel;
  score?: number;
  showScore?: boolean;
  size?: 'sm' | 'md';
}

export function RiskBadge({ level, score, showScore = false, size = 'sm' }: RiskBadgeProps) {
  const config = {
    reliable: {
      label: 'Reliable',
      icon: CheckCircle,
      color: 'bg-green-100 text-green-800 border-green-200',
    },
    good: {
      label: 'Good',
      icon: Shield,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    watch: {
      label: 'Watch',
      icon: Eye,
      color: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    high_risk: {
      label: 'High Risk',
      icon: AlertTriangle,
      color: 'bg-red-100 text-red-800 border-red-200',
    },
  };

  const { label, icon: Icon, color } = config[level];
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <div className={`inline-flex items-center gap-1 rounded-full border font-medium ${color} ${sizeClass}`}>
      <Icon size={size === 'sm' ? 12 : 14} />
      <span>{label}</span>
      {showScore && score !== undefined && (
        <span className="ml-1 opacity-75">({score})</span>
      )}
    </div>
  );
}
