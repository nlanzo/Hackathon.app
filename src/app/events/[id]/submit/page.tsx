import { createClient } from '@/lib/supabase';
import { EventWithDetails } from '@/lib/types';
import { ProjectSubmissionClient } from './ProjectSubmissionClient';
import { notFound } from 'next/navigation';

interface SubmitPageProps {
  params: Promise<{ id: string }>;
}

export default async function SubmitPage({ params }: SubmitPageProps) {
  const { id: eventId } = await params;
  const supabase = createClient();

  // Fetch event data
  const { data: eventData, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (error || !eventData) {
    notFound();
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

  return <ProjectSubmissionClient event={event} eventId={eventId} />;
} 