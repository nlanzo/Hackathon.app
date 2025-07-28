'use client';

import Link from "next/link";
import { ArrowLeft, Github, ExternalLink, Users, Trophy, Calendar, Heart } from "lucide-react";
import { EventWithDetails } from "@/lib/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase";
import { useState, useEffect } from "react";

interface Submission {
  id: string;
  team_id: string;
  event_id: string;
  repo_url?: string;
  demo_url?: string;
  description?: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
  votes: number;
  team: {
    id: string;
    name: string;
    description?: string;
    owner_id: string;
  };
}

interface TeamMember {
  user_id: string;
  user: {
    id: string;
    full_name?: string;
    discord_username?: string;
    avatar_url?: string;
  };
}

interface SubmissionsClientProps {
  event: EventWithDetails;
  eventId: string;
  submissions: Submission[];
}

export function SubmissionsClient({ event, eventId, submissions }: SubmissionsClientProps) {
  const { user } = useAuth();
  const [votedSubmissions, setVotedSubmissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [teamMembers, setTeamMembers] = useState<Record<string, TeamMember[]>>({});

  async function fetchTeamMembers() {
    const supabase = createClient();
    try {
      const teamIds = submissions.map(s => s.team_id);
      if (teamIds.length === 0) return;

      // First, get team members
      const { data: membersData, error: membersError } = await supabase
        .from('team_members')
        .select('team_id, user_id')
        .in('team_id', teamIds);

      if (membersError) throw membersError;

      if (!membersData || membersData.length === 0) return;

      // Then, get user profiles for those user IDs
      const userIds = [...new Set(membersData.map(m => m.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, discord_username, avatar_url')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Create a map of user profiles
      const profileMap = new Map();
      profilesData?.forEach(profile => {
        profileMap.set(profile.id, profile);
      });

      // Group members by team_id with profile data
      const membersByTeam: Record<string, TeamMember[]> = {};
      membersData.forEach(member => {
        if (!membersByTeam[member.team_id]) {
          membersByTeam[member.team_id] = [];
        }
        const profile = profileMap.get(member.user_id);
        membersByTeam[member.team_id].push({
          user_id: member.user_id,
          user: profile || {
            id: member.user_id,
            full_name: undefined,
            discord_username: undefined,
            avatar_url: undefined
          }
        });
      });

      setTeamMembers(membersByTeam);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  }

  async function checkUserVotes() {
    const supabase = createClient();
    try {
      // Get user's teams
      const { data: teamMemberships } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user?.id);

      const userTeamIds = teamMemberships?.map(tm => tm.team_id) || [];

      // Check which submissions the user has voted for
      const votedIds = new Set<string>();
      for (const submission of submissions) {
        if (userTeamIds.includes(submission.team_id)) {
          // User can't vote for their own team's submission
          votedIds.add(submission.id);
        }
      }
      setVotedSubmissions(votedIds);
    } catch (error) {
      console.error('Error checking user votes:', error);
    }
  }

  useEffect(() => {
    if (user?.id) {
      checkUserVotes();
    }
    fetchTeamMembers();
  }, [user?.id, eventId, submissions, checkUserVotes, fetchTeamMembers]);

  const handleVote = async (submissionId: string) => {
    if (!user) return;

    setLoading(prev => ({ ...prev, [submissionId]: true }));

    try {
      const supabase = createClient();
      
      // Increment votes for the submission
      const currentSubmission = submissions.find(s => s.id === submissionId);
      if (!currentSubmission) return;
      
      const { error } = await supabase
        .from('submissions')
        .update({ votes: currentSubmission.votes + 1 })
        .eq('id', submissionId);

      if (error) throw error;

      // Mark as voted
      setVotedSubmissions(prev => new Set([...prev, submissionId]));

      // TODO: use proper state management here
      window.location.reload();

    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setLoading(prev => ({ ...prev, [submissionId]: false }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTeamMemberNames = (teamId: string) => {
    const members = teamMembers[teamId] || [];
    return members
      .map(member => member.user.full_name || member.user.discord_username || 'Unknown User')
      .join(', ');
  };

  const canVote = (submission: Submission) => {
    if (!user) return false;
    // User can't vote for their own team's submission
    return !votedSubmissions.has(submission.id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title={`Submissions - ${event.name}`}
        action={{
          label: "Back to Event",
          href: `/events/${eventId}`,
          variant: "outline"
        }}
      >
        <Link 
          href={`/events/${eventId}`} 
          className="text-gray-600 hover:text-gray-900 ml-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </PageHeader>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Info */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Event Submissions</h2>
            <p className="text-gray-600">
              {submissions.length} project{submissions.length !== 1 ? 's' : ''} submitted
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Event</p>
                  <p className="text-sm text-gray-600">{event.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Submissions</p>
                  <p className="text-sm text-gray-600">{submissions.length} projects</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Teams</p>
                  <p className="text-sm text-gray-600">
                    {new Set(submissions.map(s => s.team_id)).size} participating
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submissions List */}
        {submissions.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Submissions Yet</h3>
                <p className="text-gray-600 mb-6">
                  Be the first to submit a project for this event!
                </p>
                <Button href={`/events/${eventId}/submit`} variant="primary">
                  Submit Your Project
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {submissions.map((submission, index) => (
              <Card key={submission.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {submission.team.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {getTeamMemberNames(submission.team_id)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm font-medium">{submission.votes}</span>
                      </div>
                      <Button
                        onClick={() => handleVote(submission.id)}
                        disabled={!canVote(submission) || loading[submission.id]}
                        variant={votedSubmissions.has(submission.id) ? "outline" : "primary"}
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        {loading[submission.id] ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        ) : (
                          <Heart className="w-3 h-3" />
                        )}
                        <span>
                          {votedSubmissions.has(submission.id) ? 'Voted' : 'Vote'}
                        </span>
                      </Button>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {submission.description}
                  </p>

                  <div className="flex items-center space-x-4 mb-4">
                    {submission.repo_url && (
                      <a
                        href={submission.repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                      >
                        <Github className="w-4 h-4" />
                        <span className="text-sm">Repository</span>
                      </a>
                    )}
                    {submission.demo_url && (
                      <a
                        href={submission.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-green-600 hover:text-green-800"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span className="text-sm">Live Demo</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Submitted {formatDate(submission.submitted_at)}</span>
                    {submission.team.description && (
                      <span className="text-gray-600">{submission.team.description}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 