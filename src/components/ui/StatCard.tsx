import React from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBgColor = 'bg-brand-50 text-brand-600',
  trend,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slateNavy-100 p-5 shadow-soft transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-card hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slateNavy-500">{title}</p>
          <div className="text-2xl sm:text-3xl font-extrabold text-slateNavy-900 tracking-tight">{value}</div>
          {subtitle && <p className="text-xs text-slateNavy-500 font-medium">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-2xl shrink-0 ${iconBgColor}`}>{icon}</div>
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-slateNavy-50 flex items-center text-xs">
          <span
            className={`font-semibold mr-1.5 ${
              trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {trend.value}
          </span>
          <span className="text-slateNavy-400">dibanding bulan lalu</span>
        </div>
      )}
    </div>
  );
};
