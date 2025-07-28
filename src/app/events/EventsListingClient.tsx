'use client';

import { useState } from "react";
import Link from "next/link";
import { Search, Calendar, Users, Trophy, Plus } from "lucide-react";
import { EventWithDetails } from "@/lib/types";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchBar } from "@/components/ui/SearchBar";

interface EventsListingClientProps {
  events: EventWithDetails[];
}

export function EventsListingClient({ events }: EventsListingClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const filteredEvents = events.filter(event => 
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.theme.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hackathon Events</h1>
          <p className="text-gray-600 mt-2">
            Discover and join exciting hackathon events
          </p>
        </div>
        <Button
          href="/events/create"
          variant="primary"
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Event</span>
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="mb-8">
        <SearchBar
          placeholder="Search events..."
          value={searchTerm}
          onChange={setSearchTerm}
          onFilterClick={() => setShowFilter(!showFilter)}
        />
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <Card className="hover:shadow-lg transition-shadow hover:border-gray-300 cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {event.name}
                    </h3>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                      event.status === 'active' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {event.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Event Details */}
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatDate(event.start_date)} - {formatDate(event.end_date)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span>Max {event.max_team_size} per team</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Trophy className="w-4 h-4 mr-2" />
                        <span>{event.prize || 'Learning Experience & Recognition'}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md font-medium">
                      View Details
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search terms' : 'No events are currently available'}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{events.length}</p>
            <p className="text-sm text-gray-600">Total Events</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {events.filter(e => e.status === 'upcoming').length}
            </p>
            <p className="text-sm text-gray-600">Upcoming Events</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {events.filter(e => e.status === 'active').length}
            </p>
            <p className="text-sm text-gray-600">Active Events</p>
          </div>
        </div>
      </div>
    </div>
  );
} 