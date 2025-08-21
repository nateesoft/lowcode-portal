import React from 'react';
import { LucideIcon, TrendingUp } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  description?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBgColor,
  trend,
  description
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${iconBgColor}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        {trend && (
          <span className={`text-sm flex items-center ${
            trend.isPositive 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            <TrendingUp className="h-4 w-4 mr-1" />
            {trend.value}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
      <div className="text-sm text-slate-600 dark:text-slate-400">
        {description || title}
      </div>
    </div>
  );
};

export default StatsCard;