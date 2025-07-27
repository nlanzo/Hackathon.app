import Link from 'next/link';
import { EventWithDetails } from '@/lib/types';
import { Button } from '@/components/ui/Button';

interface EventCardProps {
  event: EventWithDetails;
  showRegisterButton?: boolean;
  className?: string;
}

export function EventCard({ event, showRegisterButton = true, className = '' }: EventCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
          <p className="text-sm text-gray-600">{event.description}</p>
        </div>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {event.status}
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
        <div>
          <span className="font-medium">Theme:</span> {event.theme}
        </div>
        <div>
          <span className="font-medium">Prize:</span> {event.prize_pool}
        </div>
        <div>
          <span className="font-medium">Teams:</span> {event.current_participants}/{event.max_teams * event.max_team_size}
        </div>
        <div>
          <span className="font-medium">Date:</span> {formatDate(event.start_date)}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <Link 
          href={`/events/${event.id}`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View Details →
        </Link>
        {showRegisterButton && (
          <Link href={`/events/${event.id}/register`}>
            <Button size="sm">
              Register
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
} 