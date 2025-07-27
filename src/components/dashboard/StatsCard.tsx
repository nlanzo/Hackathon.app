import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon, 
  iconBgColor = 'bg-blue-100', 
  iconColor = 'text-blue-600',
  className = '' 
}: StatsCardProps) {
  return (
    <div className={cn('bg-white rounded-lg shadow p-6', className)}>
      <div className="flex items-center">
        <div className={cn('w-16 h-16 rounded-full flex items-center justify-center', iconBgColor)}>
          <div className={cn('w-8 h-8', iconColor)}>
            {icon}
          </div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
} 