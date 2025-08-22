'use client';

import Link from "next/link";
import { UserEvent } from "@/lib/types";

interface DashboardEventCardProps {
  event: UserEvent;
  variant?: 'registered' | 'hosted';
  className?: string;
}

export function DashboardEventCard({ event, variant = 'registered', className = '' }: DashboardEventCardProps) {
  const isHosted = variant === 'hosted';
  
  // Styling based on variant
  const statusColors = {
    registered: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      progress: 'bg-blue-600',
      link: 'text-blue-600'
    },
    hosted: {
      bg: 'bg-indigo-100',
      text: 'text-indigo-800',
      progress: 'bg-indigo-600',
      link: 'text-indigo-600'
    }
  };

  const colors = statusColors[variant];
  const linkText = isHosted ? 'Manage Event →' : 'View Event →';

  return (
    <Link 
      href={`/events/${event.id}`}
      className={`block border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow hover:border-gray-300 ${className}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.name}</h3>
          <p className="text-sm text-gray-600 mb-2">Role: {event.role}</p>
          <p className="text-sm text-gray-600">
            {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
        <div 
          className={`${colors.progress} h-3 rounded-full transition-all duration-300`}
          style={{ width: `${event.progress}%` }}
        ></div>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">Progress: {event.progress}%</p>
        <span className={`${colors.link} text-sm font-medium`}>
          {linkText}
        </span>
      </div>
    </Link>
  );
} 