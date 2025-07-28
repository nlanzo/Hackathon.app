import { createClient } from '@/lib/supabase';
import { EventWithDetails } from '@/lib/types';
import { SubmissionsClient } from '@/app/events/[id]/submissions/SubmissionsClient';
import { notFound } from 'next/navigation';

interface SubmissionsPageProps {
  params: Promise<{ id: string }>;
}

export default async function SubmissionsPage({ params }: SubmissionsPageProps) {
  const { id: eventId } = await params;
  const supabase = createClient();

  // Fetch event data
  const { data: eventData, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (eventError || !eventData) {
    notFound();
  }

  // Fetch all submissions for this event
  const { data: submissions, error: submissionsError } = await supabase
    .from('submissions')
    .select(`
      *,
      team:teams(
        id,
        name,
        description,
        owner_id
      )
    `)
    .eq('event_id', eventId)
    .order('votes', { ascending: false });

  if (submissionsError) {
    console.error('Error fetching submissions:', submissionsError);
  }

  // Transform event to match EventWithDetails type
  const event: EventWithDetails = {
    ...eventData,
    current_participants: 0,
    max_teams: 50,
    max_team_size: 3,
    theme: "General",
    status: "upcoming",
    location: "Virtual (Online)",
    rules_list: eventData.rules ? eventData.rules.split('\n') : []
  };

  return (
    <SubmissionsClient 
      event={event} 
      eventId={eventId} 
      submissions={submissions || []} 
    />
  );
} 