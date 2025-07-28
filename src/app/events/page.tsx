import { EventWithDetails } from "@/lib/types";
import { Navigation } from "@/components/layout/Navigation";
import { createClient } from "@/lib/supabase";
import { EventsListingClient } from "./EventsListingClient";

export default async function EventsPage() {
  const supabase = createClient();

  try {
    // Fetch all events
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: true });

    if (eventsError) {
      throw eventsError;
    }

    // Transform events to match EventWithDetails type
    const events: EventWithDetails[] = eventsData?.map(event => ({
      ...event,
      current_participants: 0,
      max_teams: 50,
      max_team_size: 3,
      theme: "General",
      status: "upcoming",
      location: "Virtual (Online)",
      rules_list: event.rules ? event.rules.split('\n') : []
    })) || [];

    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation showAuthButtons={false} />
        <EventsListingClient events={events} />
      </div>
    );

  } catch (error) {
    console.error('Error fetching events:', error);
    
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation showAuthButtons={false} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Events</h2>
            <p className="text-gray-600 mb-4">Failed to load events. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }
} 