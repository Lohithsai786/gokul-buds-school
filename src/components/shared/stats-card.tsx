import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'amber' | 'teal' | 'coral' | 'green' | 'blue' | 'purple';
  className?: string;
}

const colorClasses = {
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'bg-amber-100 text-amber-600',
    accent: 'text-amber-600',
  },
  teal: {
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    icon: 'bg-teal-100 text-teal-600',
    accent: 'text-teal-600',
  },
  coral: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: 'bg-orange-100 text-orange-600',
    accent: 'text-orange-600',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'bg-green-100 text-green-600',
    accent: 'text-green-600',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'bg-blue-100 text-blue-600',
    accent: 'text-blue-600',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: 'bg-purple-100 text-purple-600',
    accent: 'text-purple-600',
  },
};

export function StatsCard({
  title,
  value,
  icon,
  trend,
  color = 'amber',
  className,
}: StatsCardProps) {
  const colors = colorClasses[color];

  return (
    <Card
      className={cn(
        'p-6 transition-all duration-300 hover:shadow-lg hover:scale-105',
        colors.bg,
        colors.border,
        'border',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={cn('text-3xl font-bold mt-2', colors.accent)}>
            {value}
          </p>

          {trend && (
            <div className="flex items-center gap-1 mt-4">
              <div
                className={cn(
                  'flex items-center gap-1 text-sm font-semibold',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{Math.abs(trend.value)}%</span>
              </div>
              <span className="text-xs text-gray-500">from last month</span>
            </div>
          )}
        </div>

        <div className={cn('p-3 rounded-lg', colors.icon)}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
