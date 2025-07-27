'use client';

import { TeamWithMembers } from '@/lib/types';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { TeamCard } from '@/components/teams/TeamCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Users } from 'lucide-react';

interface TeamsSectionProps {
  teams: TeamWithMembers[];
}

export function TeamsSection({ teams }: TeamsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900">My Teams</h2>
      </CardHeader>
      <CardContent>
        {teams.length > 0 ? (
          <div className="space-y-4">
            {teams.map((team) => (
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
              href: "/team/create"
            }}
          />
        )}
      </CardContent>
    </Card>
  );
} 