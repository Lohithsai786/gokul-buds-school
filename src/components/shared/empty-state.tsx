import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4',
        className
      )}
    >
      {/* Icon */}
      <div className="mb-6 p-4 rounded-full bg-gradient-to-br from-amber-100 to-orange-100">
        <div className="text-4xl text-amber-600">{icon}</div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 text-center mb-6 max-w-md">
        {description}
      </p>

      {/* Action Button */}
      {action && (
        <Button
          onClick={action.onClick}
          className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
