'use client';

import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  description: string;
  className?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
}

export function EmptyState({ 
  icon, 
  description, 
  action, 
  className = '' 
}: EmptyStateProps) {
  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="w-12 h-12 text-gray-400 mx-auto mb-4">
        {icon}
      </div>
      <p className="text-gray-600 mb-4">{description}</p>
      {action && (
        action.href ? (
          <Button href={action.href}>
            {action.label}
          </Button>
        ) : (
          <Button onClick={action.onClick}>
            {action.label}
          </Button>
        )
      )}
    </div>
  );
} 