'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

interface PageHeaderProps {
  title: string;
  children?: ReactNode;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    icon?: ReactNode;
  };
}

export function PageHeader({ title, children, action }: PageHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {children}
          </div>
          {action && (
            <div className="flex items-center space-x-4">
              {action.href ? (
                <Button
                  href={action.href}
                  variant={action.variant}
                  className="flex items-center gap-2"
                >
                  {action.icon}
                  {action.label}
                </Button>
              ) : (
                <Button
                  onClick={action.onClick}
                  variant={action.variant}
                  className="flex items-center gap-2"
                >
                  {action.icon}
                  {action.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 