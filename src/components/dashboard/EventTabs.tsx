'use client';

import { useState } from 'react';
import { UserEvent } from '@/lib/types';
import { DashboardEventCard } from './EventCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Calendar, CheckCircle } from 'lucide-react';
import { shouldShowOnDashboard } from '@/lib/utils';

interface EventTabsProps {
  events: UserEvent[];
  variant: 'registered' | 'hosted';
  title: string;
  description: string;
  emptyStateAction: {
    label: string;
    href: string;
  };
  className?: string;
}

export function EventTabs({ 
  events, 
  variant, 
  title, 
  description, 
  emptyStateAction, 
  className = '' 
}: EventTabsProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  
  // Filter events based on status
  const activeEvents = events.filter(event => 
    shouldShowOnDashboard(event.start_date, event.end_date)
  );
  const completedEvents = events.filter(event => event.status === 'completed');
  
  const tabs = [
    {
      id: 'active' as const,
      label: 'In Progress / Future Events',
      count: activeEvents.length,
      icon: <Calendar className="w-4 h-4" />
    },
    {
      id: 'completed' as const,
      label: 'Completed Events',
      count: completedEvents.length,
      icon: <CheckCircle className="w-4 h-4" />
    }
  ];

  const currentEvents = activeTab === 'active' ? activeEvents : completedEvents;
  const showEmptyState = currentEvents.length === 0;

  return (
    <Card className={className}>
      <CardHeader>
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </CardHeader>
      <CardContent>
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[200px]">
          {showEmptyState ? (
            <EmptyState
              icon={activeTab === 'active' ? <Calendar className="w-16 h-16" /> : <CheckCircle className="w-16 h-16" />}
              description={
                activeTab === 'active' 
                  ? `You haven't ${variant === 'registered' ? 'registered for any' : 'created any'} events yet.`
                  : `You haven't ${variant === 'registered' ? 'participated in any' : 'hosted any'} completed events yet.`
              }
              action={activeTab === 'active' ? emptyStateAction : undefined}
            />
          ) : (
            <div className="space-y-6">
              {currentEvents.map((event) => (
                <DashboardEventCard
                  key={event.id}
                  event={event}
                  variant={variant}
                  className={activeTab === 'completed' ? 'opacity-75 hover:opacity-100 transition-opacity' : ''}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
