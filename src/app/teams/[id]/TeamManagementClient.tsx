'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Plus, X, Crown, Mail } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase";
import { Event } from '@/lib/types';

interface TeamManagementClientProps {
  team: { id: string; name: string; description?: string; owner_id: string; created_at: string; updated_at: string };
  teamId: string;
  memberCount: number;
  event: Event;
}

interface TeamMember {
  id: string;
  name: string;
  discord_username?: string;
  avatar?: string;
  is_owner: boolean;
}

export function TeamManagementClient({ team, teamId, memberCount, event }: TeamManagementClientProps) {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [newMemberDiscordUsername, setNewMemberDiscordUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchTeamMembers();
    }
  }, [user?.id, teamId]);

  const fetchTeamMembers = async () => {
    const supabase = createClient();
    
    try {
      // Check if user is a member of this team
      const { data: userMembership, error: membershipError } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId)
        .eq('user_id', user?.id)
        .single();

      if (membershipError || !userMembership) {
        setError('Access denied: You are not a member of this team');
        setLoading(false);
        return;
      }

      // Get team members
      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId);

      if (memberError) throw memberError;

      if (memberData && memberData.length > 0) {
        const userIds = memberData.map(m => m.user_id);
        
        // Fetch user profiles
        const profilesResponse = await fetch('/api/users/profiles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userIds }),
        });
        
        const profilesData = await profilesResponse.json();
        const userProfiles = profilesData.profiles || [];

        // Transform member data with real user information
        const transformedMembers: TeamMember[] = memberData.map(member => {
          const userProfile = userProfiles.find((u: { id: string; full_name?: string; discord_username?: string; email?: string; avatar_url?: string }) => u.id === member.user_id);
          return {
            id: member.user_id,
            name: userProfile?.full_name || userProfile?.discord_username || 'Unknown User',
            discord_username: userProfile?.discord_username,
            avatar: userProfile?.avatar_url,
            is_owner: team.owner_id === member.user_id
          };
        });

        setMembers(transformedMembers);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      setError('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const addMember = () => {
    if (!newMemberDiscordUsername.trim()) return;
    
    // Check if member already exists (using Discord username)
    if (members.some(m => m.discord_username === newMemberDiscordUsername.trim())) {
      setError('This member is already in the team');
      return;
    }

    // Check team size limit
    const maxTeamSize = event.max_team_size || 3;
    if (members.length >= maxTeamSize) {
      setError(`Team size cannot exceed ${maxTeamSize} members`);
      return;
    }

    setError('');
    setSuccess('Member invitation will be sent via Discord (feature coming soon)');
    setNewMemberDiscordUsername('');
  };

  const removeMember = (memberId: string) => {
    // Don't allow removing the team owner
    if (members.find(m => m.id === memberId)?.is_owner) return;
    
    setMembers(members.filter(m => m.id !== memberId));
    setSuccess('Member removed from team');
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

  if (error && error.includes('Access denied')) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You are not a member of this team.</p>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
            ← Back to Dashboard
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
          href="/dashboard"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
        <p className="text-gray-600 mt-2">
          Manage your team: {team.name}
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
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Team Details</h3>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>• Team Size: {members.length}/{event.max_team_size || 3} members</p>
                    <p>• Created: {new Date(team.created_at).toLocaleDateString()}</p>
                    <p>• Status: Active</p>
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
                {members.length}/{event.max_team_size || 3} members
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {member.avatar ? (
                        <img 
                          src={member.avatar} 
                          alt={member.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">
                            {member.name}
                          </p>
                          {member.is_owner && (
                            <Crown className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
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
              {members.length < (event.max_team_size || 3) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Invite New Member</h4>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMemberDiscordUsername}
                      onChange={(e) => setNewMemberDiscordUsername(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addMember()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Enter Discord username"
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
                    Member will receive a Discord invitation
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
                  href="/dashboard"
                  variant="primary"
                  className="w-full justify-start"
                >
                  Back to Dashboard
                </Button>
                <Button
                  href="/events"
                  variant="outline"
                  className="w-full justify-start"
                >
                  Browse Events
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 