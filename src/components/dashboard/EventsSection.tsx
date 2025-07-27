'use client';

import { useState } from 'react';
import { EventWithDetails } from '@/lib/types';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { EventCard } from '@/components/events/EventCard';
import { SearchBar } from '@/components/ui/SearchBar';

interface EventsSectionProps {
  events: EventWithDetails[];
}

export function EventsSection({ events }: EventsSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.theme.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
          <SearchBar 
            placeholder="Search events..."
            value={searchTerm}
            onChange={setSearchTerm}
            onFilterClick={() => setShowFilter(!showFilter)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
          {filteredEvents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No events found matching your search.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 