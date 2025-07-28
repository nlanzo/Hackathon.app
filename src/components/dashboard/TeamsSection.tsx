'use client';

import { useState, useEffect } from 'react';
import { TeamWithMembers } from '@/lib/types';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { TeamCard } from '@/components/teams/TeamCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Users } from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface TeamsSectionProps {
  teams: TeamWithMembers[];
  action?: {
    label: string;
    href: string;
  };
}

interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  discord_username?: string;
}

export function TeamsSection({ teams }: TeamsSectionProps) {
  const [teamsWithProfiles, setTeamsWithProfiles] = useState<TeamWithMembers[]>(teams);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!teams || teams.length === 0) return;

      const supabase = createClient();
      
      // Get all unique user IDs from all teams
      const allUserIds = [...new Set(teams.flatMap(team => 
        team.members?.map(member => member.user_id) || []
      ))];

      if (allUserIds.length === 0) return;

      try {
        // Fetch profiles for all users
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, email, full_name, avatar_url, discord_username')
          .in('id', allUserIds);

        if (error) throw error;

        // Create a map of user_id to profile
        const profileMap = new Map();
        profiles?.forEach((profile: Profile) => {
          profileMap.set(profile.id, profile);
        });

        // Update teams with profile data
        const updatedTeams = teams.map(team => ({
          ...team,
          members: team.members?.map(member => ({
            ...member,
            user: {
              id: member.user_id,
              email: profileMap.get(member.user_id)?.email,
              discord_id: profileMap.get(member.user_id)?.discord_username,
              username: profileMap.get(member.user_id)?.full_name || 
                       profileMap.get(member.user_id)?.discord_username || 
                       profileMap.get(member.user_id)?.email || 
                       'Unknown User',
              avatar: profileMap.get(member.user_id)?.avatar_url,
              bio: undefined,
              skills: undefined,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          })) || []
        }));

        setTeamsWithProfiles(updatedTeams);
      } catch (error) {
        console.error('Error fetching profiles:', error);
      }
    };

    fetchTeamMembers();
  }, [teams]);

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900">My Teams</h2>
      </CardHeader>
      <CardContent>
        {teamsWithProfiles.length > 0 ? (
          <div className="space-y-4">
            {teamsWithProfiles.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Users className="w-12 h-12" />}
            title="No Teams"
            description="You haven't joined any teams yet"
            action={{
              label: "Create Team",
              href: "/teams/create"
            }}
          />
        )}
      </CardContent>
    </Card>
  );
} 