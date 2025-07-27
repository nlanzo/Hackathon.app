'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({ 
  icon, 
  title, 
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