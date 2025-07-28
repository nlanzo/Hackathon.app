'use client';

import { useState, useEffect } from 'react';
import { TeamWithMembers } from '@/lib/types';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { TeamCard } from '@/components/teams/TeamCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Users } from 'lucide-react';

interface TeamsSectionProps {
  teams: TeamWithMembers[];
}

export function TeamsSection({ teams }: TeamsSectionProps) {
  const [teamsWithProfiles, setTeamsWithProfiles] = useState<TeamWithMembers[]>(teams);

  useEffect(() => {
    const fetchUserProfiles = async () => {
      // Collect all user IDs from all teams
      const allUserIds = teams.flatMap(team => 
        team.members.map(member => member.user_id)
      ).filter((id, index, arr) => arr.indexOf(id) === index) // Remove duplicates
        .filter(id => id && id !== 'null' && id !== 'undefined'); // Filter out null/invalid IDs

      if (allUserIds.length === 0) return;

      console.log('Fetching profiles for user IDs:', allUserIds);

      try {
        // Fetch user profiles
        const profilesResponse = await fetch('/api/users/profiles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userIds: allUserIds }),
        });
        
        const profilesData = await profilesResponse.json();
        
        if (!profilesResponse.ok) {
          console.error('Failed to fetch profiles:', profilesData.error);
          return; // Keep existing teams data if API fails
        }
        
        const userProfiles = profilesData.profiles || [];

        // Update teams with real user information
        const updatedTeams = teams.map(team => ({
          ...team,
          members: team.members.map(member => {
            const userProfile = userProfiles.find((u: any) => u.id === member.user_id);
            return {
              ...member,
              user: {
                id: member.user_id,
                username: userProfile?.full_name || userProfile?.discord_username || userProfile?.email || 'Unknown User',
                avatar: userProfile?.avatar_url,
                email: userProfile?.email,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            };
          })
        }));

        setTeamsWithProfiles(updatedTeams);
      } catch (error) {
        console.error('Error fetching user profiles:', error);
      }
    };

    fetchUserProfiles();
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