import Link from 'next/link';
import { TeamWithMembers } from '@/lib/types';

interface TeamCardProps {
  team: TeamWithMembers;
  className?: string;
}

export function TeamCard({ team, className = '' }: TeamCardProps) {
  return (
    <div className={`border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900">{team.name}</h3>
        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {team.status}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-2">{team.event?.name}</p>
      
      <div className="text-sm text-gray-600">
        <span className="font-medium">Members:</span> {team.members.map(m => m.user?.username).join(", ")}
      </div>
      
      <div className="text-sm text-gray-600">
        <span className="font-medium">Role:</span> {team.role}
      </div>
      
      <Link 
        href={`/team/${team.id}`}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 inline-block"
      >
        Manage Team →
      </Link>
    </div>
  );
} 