import { EventWithDetails } from "@/lib/types";
import { Navigation } from "@/components/layout/Navigation";
import { createClient } from "@/lib/supabase";
import { EventRegistrationClient } from "@/app/events/[id]/register/EventRegistrationClient";
import { calculateEventStatus } from "@/lib/utils";
import Link from "next/link";

interface EventRegistrationPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventRegistrationPage({ params }: EventRegistrationPageProps) {
  const { id } = await params;
  const supabase = createClient();

  try {
    // Fetch event details
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (eventError) {
      throw eventError;
    }

    // Transform event to match EventWithDetails type
    const event: EventWithDetails = {
      ...eventData,
      current_participants: 0,
      max_teams: 50,
      max_team_size: 3,
      theme: "General",
      status: calculateEventStatus(eventData.start_date, eventData.end_date),
      location: "Virtual (Online)",
      rules_list: eventData.rules ? eventData.rules.split('\n') : []
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation showAuthButtons={false} />
        <EventRegistrationClient event={event} eventId={id} />
      </div>
    );

  } catch (error) {
    console.error('Error fetching event data:', error);
    
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation showAuthButtons={false} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
            <p className="text-gray-600 mb-4">The event you&apos;re trying to register for doesn&apos;t exist.</p>
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }
} 