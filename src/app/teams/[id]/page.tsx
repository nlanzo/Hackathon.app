import { Navigation } from "@/components/layout/Navigation";
import { createClient } from "@/lib/supabase";
import { TeamManagementClient } from "./TeamManagementClient";
import Link from "next/link";
import { Event as EventType } from "@/lib/types";

interface TeamPageProps {
  params: Promise<{ id: string }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { id } = await params;
  const supabase = createClient();

  try {
    // Fetch team details
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single();

    if (teamError) {
      throw teamError;
    }

    // Fetch team members (for access control)
    const { error: memberError } = await supabase
      .from('team_members')
      .select('user_id')
      .eq('team_id', id);

    if (memberError) {
      throw memberError;
    }

    // Fetch all events this team is registered for
    const { data: registrations, error: registrationError } = await supabase
      .from('registrations')
      .select('event_id')
      .eq('team_id', id);

    if (registrationError) {
      console.error('Error fetching registrations:', registrationError);
    }

    // Fetch event details for registered events
    let registeredEvents: EventType[] = [];
    if (registrations && registrations.length > 0) {
      const eventIds = registrations.map(reg => reg.event_id);
      const { data: eventDetails, error: eventError } = await supabase
        .from('events')
        .select('*')
        .in('id', eventIds);

      if (!eventError && eventDetails) {
        registeredEvents = eventDetails;
      }
    }

    // Note: Access control will be handled on the client side

    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation showAuthButtons={false} />
        <TeamManagementClient 
          team={teamData} 
          teamId={id} 
          registeredEvents={registeredEvents}
        />
      </div>
    );

  } catch (error) {
    console.error('Error fetching team data:', error);
    
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation showAuthButtons={false} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Team Not Found</h2>
            <p className="text-gray-600 mb-4">The team you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }
} 