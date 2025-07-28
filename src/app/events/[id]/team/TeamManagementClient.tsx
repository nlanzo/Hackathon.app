'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Plus, X, Crown, Mail } from "lucide-react";
import { EventWithDetails } from "@/lib/types";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase";

interface TeamManagementClientProps {
  event: EventWithDetails;
  eventId: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  is_owner: boolean;
}

interface Team {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
}

export function TeamManagementClient({ event, eventId }: TeamManagementClientProps) {
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchTeamData();
    }
  }, [user?.id, eventId]);

  const fetchTeamData = async () => {
    const supabase = createClient();
    
    try {
      // Get user's team for this event
      const { data: teamMemberships } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user?.id);

      const teamIds = teamMemberships?.map(tm => tm.team_id) || [];

      if (teamIds.length > 0) {
        // Check if any of user's teams are registered for this event
        const { data: registrations } = await supabase
          .from('registrations')
          .select('team_id')
          .eq('event_id', eventId)
          .in('team_id', teamIds);

        if (registrations && registrations.length > 0) {
          // Get the team details
          const { data: teamData } = await supabase
            .from('teams')
            .select('*')
            .eq('id', registrations[0].team_id)
            .single();

          setTeam(teamData);

          // Get team members
          const { data: memberData } = await supabase
            .from('team_members')
            .select(`
              user_id,
              teams!inner(name, owner_id)
            `)
            .eq('team_id', teamData.id);

          // Transform member data
          const transformedMembers: TeamMember[] = memberData?.map(member => ({
            id: member.user_id,
            name: 'Team Member', // We'll need to fetch user details separately
            email: 'member@example.com', // We'll need to fetch user details separately
            is_owner: (member.teams as any).owner_id === member.user_id
          })) || [];

          setMembers(transformedMembers);
        }
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
      setError('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const addMember = () => {
    if (!newMemberEmail.trim()) return;
    
    // Check if member already exists
    if (members.some(m => m.email === newMemberEmail.trim())) {
      setError('This member is already in the team');
      return;
    }

    // Check team size limit
    if (members.length >= event.max_team_size) {
      setError(`Team size cannot exceed ${event.max_team_size} members`);
      return;
    }

    setError('');
    setSuccess('Member invitation will be sent via email (feature coming soon)');
    setNewMemberEmail('');
  };

  const removeMember = (memberId: string) => {
    // Don't allow removing the team owner
    if (members.find(m => m.id === memberId)?.is_owner) return;
    
    setMembers(members.filter(m => m.id !== memberId));
    setSuccess('Member removed from team');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading team data...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Team Found</h2>
          <p className="text-gray-600 mb-4">You're not registered for this event with a team.</p>
          <Link 
            href={`/events/${eventId}/register`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            Register for this event
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href={`/events/${eventId}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Event
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
        <p className="text-gray-600 mt-2">
          Manage your team for {event.name}
        </p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <X className="w-5 h-5 text-red-600 mr-3" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <Mail className="w-5 h-5 text-green-600 mr-3" />
          <span className="text-green-800">{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Team Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Team Information</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Name
                  </label>
                  <p className="text-lg font-medium text-gray-900">{team.name}</p>
                </div>
                
                {team.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <p className="text-gray-700">{team.description}</p>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Event Details</h3>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>• Event: {event.name}</p>
                    <p>• Start Date: {formatDate(event.start_date)}</p>
                    <p>• Team Size: {members.length}/{event.max_team_size} members</p>
                    <p>• Registration Deadline: {formatDate(event.registration_deadline)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Members */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
              <p className="text-sm text-gray-600">
                {members.length}/{event.max_team_size} members
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">{member.name}</p>
                          {member.is_owner && (
                            <Crown className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </div>
                    {!member.is_owner && (
                      <button
                        onClick={() => removeMember(member.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add New Member */}
              {members.length < event.max_team_size && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Invite New Member</h4>
                  <div className="flex space-x-2">
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addMember()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Enter email address"
                    />
                    <Button
                      onClick={addMember}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Invite</span>
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Member will receive an email invitation
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  href={`/events/${eventId}/submit`}
                  variant="primary"
                  className="w-full justify-start"
                >
                  Submit Project
                </Button>
                <Button
                  href={`/events/${eventId}`}
                  variant="outline"
                  className="w-full justify-start"
                >
                  View Event Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 