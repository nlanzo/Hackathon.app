'use client';

import { useState } from "react";
import Link from "next/link";
import { Calendar, Users, Trophy, Search, Filter, Plus } from "lucide-react";
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

  const getTimeUntil = (dateString: string) => {
    const now = new Date();
    const target = new Date(dateString);
    const diff = target.getTime() - now.getTime();
    
    if (diff <= 0) return "Started";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return "Less than 1h";
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
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
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
                      <span>{event.prize_pool} prize pool</span>
                    </div>
                  </div>

                  {/* Registration Deadline */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs font-medium text-blue-900">Registration Deadline</p>
                        <p className="text-sm text-blue-700">{formatDate(event.registration_deadline)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-blue-900">Time Left</p>
                        <p className="text-sm text-blue-700">{getTimeUntil(event.registration_deadline)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    href={`/events/${event.id}`}
                    variant="primary"
                    className="w-full"
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
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