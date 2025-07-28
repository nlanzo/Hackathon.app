import { Navigation } from "@/components/layout/Navigation";
import { createClient } from "@/lib/supabase";
import { TeamManagementClient } from "./TeamManagementClient";
import Link from "next/link";

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

    // Fetch team members
    const { data: memberData, error: memberError } = await supabase
      .from('team_members')
      .select('user_id')
      .eq('team_id', id);

    if (memberError) {
      throw memberError;
    }

    // Fetch the event this team is registered for
    const { data: registrationData, error: registrationError } = await supabase
      .from('registrations')
      .select('event_id')
      .eq('team_id', id)
      .single();

    let eventData = null;
    if (registrationData?.event_id) {
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', registrationData.event_id)
        .single();
      
      if (!eventError && event) {
        eventData = event;
      }
    }

    // Fallback to default values if no event is found
    const event = eventData || {
      id: 'default-event',
      name: 'Team Management',
      max_team_size: 3,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    // Note: Access control will be handled on the client side

    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation showAuthButtons={false} />
        <TeamManagementClient 
          team={teamData} 
          teamId={id} 
          memberCount={memberData?.length || 0}
          event={event}
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
            <p className="text-gray-600 mb-4">The team you're looking for doesn't exist or you don't have access to it.</p>
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }
} 