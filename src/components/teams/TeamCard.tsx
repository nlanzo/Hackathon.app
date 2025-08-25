import Link from 'next/link';
import Image from 'next/image';
import { TeamWithMembers } from '@/lib/types';

interface TeamCardProps {
  team: TeamWithMembers;
  className?: string;
}

export function TeamCard({ team, className = '' }: TeamCardProps) {
  return (
    <Link 
      href={`/teams/${team.id}`}
      className={`block border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow hover:border-gray-300 ${className}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900">{team.name}</h3>
        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {team.status}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-2">{team.event?.name}</p>
      
      <div className="text-sm text-gray-600">
        <span className="font-medium">Members:</span> 
        <div className="flex items-center space-x-1 mt-1">
          {team.members.map((m, index) => (
            <div key={`${m.user_id}-${index}`} className="flex items-center">
              {m.user?.avatar ? (
                <Image 
                  src={m.user.avatar} 
                  alt={m.user.username || 'Member'}
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full object-cover border border-gray-200"
                  title={m.user.username || 'Team Member'}
                />
              ) : (
                <div 
                  className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs border border-gray-200"
                  title={m.user?.username || 'Team Member'}
                >
                  {(m.user?.username || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-sm text-gray-600">
        <span className="font-medium">Role:</span> {team.role}
      </div>
      
      <span className="text-blue-600 text-sm font-medium mt-2 inline-block">
        Manage Team →
      </span>
    </Link>
  );
} 