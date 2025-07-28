'use client';

import Link from "next/link";
import { Calendar, Users, Trophy, Clock, MapPin, DollarSign, Github, ExternalLink, ArrowLeft, AlertTriangle } from "lucide-react";
import { EventWithDetails } from "@/lib/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import { useEffect, useState } from "react";

interface EventDetailsClientProps {
  event: EventWithDetails;
  eventId: string;
}

export function EventDetailsClient({ event, eventId }: EventDetailsClientProps) {
  const { user } = useAuth();
  const [isRegistered, setIsRegistered] = useState(false);
  const [myTeam, setMyTeam] = useState<any>(null);
  const [isEventCreator, setIsEventCreator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (user?.id) {
      checkRegistrationStatus();
    } else {
      setLoading(false);
    }
  }, [user?.id, eventId]);

  const checkRegistrationStatus = async () => {
    const supabase = createClient();
    
    try {
      // Check if user is the event creator
      if (user?.id && event.owner_id) {
        setIsEventCreator(user.id === event.owner_id);
      } else {
        setIsEventCreator(false);
      }

      // Get user's teams
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

        setIsRegistered(!!(registrations && registrations.length > 0));
        
        if (registrations && registrations.length > 0) {
          // Get the team details
          const { data: teamData } = await supabase
            .from('teams')
            .select('*')
            .eq('id', registrations[0].team_id)
            .single();

          setMyTeam(teamData);
        }
      }
    } catch (error) {
      console.error('Error checking registration status:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeUntil = (dateString: string) => {
    const now = new Date();
    const target = new Date(dateString);
    const diff = target.getTime() - now.getTime();
    
    if (diff <= 0) return "Started";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleCancelEvent = async () => {
    if (!cancellationReason.trim()) {
      alert('Please provide a cancellation reason');
      return;
    }

    setCancelling(true);
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('events')
        .update({
          cancelled: true,
          cancellation_reason: cancellationReason.trim()
        })
        .eq('id', eventId);

      if (error) throw error;

      // Close modal and refresh page to show updated status
      setShowCancelModal(false);
      setCancellationReason('');
      window.location.reload();
    } catch (error) {
      console.error('Error cancelling event:', error);
      alert('Failed to cancel event. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading registration status...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader 
        title={event.name}
        action={
          isEventCreator ? {
            label: "Edit Event",
            href: `/events/${eventId}/edit`,
            variant: "primary"
          } : !isRegistered ? {
            label: "Register Now",
            href: `/events/${eventId}/register`,
            variant: "primary"
          } : {
            label: "Submit Project",
            href: `/events/${eventId}/submit`,
            variant: "secondary"
          }
        }
      >
        <Link 
          href="/dashboard" 
          className="text-gray-600 hover:text-gray-900 ml-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </PageHeader>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Overview */}
            <Card>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{event.name}</h2>
                  <p className="text-gray-600">{event.description}</p>
                </div>
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  {event.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Start Date</p>
                    <p className="text-sm text-gray-600">{formatDate(event.start_date)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">End Date</p>
                    <p className="text-sm text-gray-600">{formatDate(event.end_date)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Location</p>
                    <p className="text-sm text-gray-600">{event.location}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Participants</p>
                    <p className="text-sm text-gray-600">{event.current_participants}/{event.max_teams * event.max_team_size}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Registration Deadline</p>
                    <p className="text-sm text-blue-700">{formatDate(event.registration_deadline)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-900">Time Remaining</p>
                    <p className="text-sm text-blue-700">{getTimeUntil(event.registration_deadline)}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Cancellation Notice */}
            {event.cancelled && (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-semibold text-red-900 mb-2">Event Cancelled</h3>
                      <p className="text-red-700 mb-3">
                        This event has been cancelled by the organizer.
                      </p>
                      {event.cancellation_reason && (
                        <div className="bg-white border border-red-200 rounded-lg p-3">
                          <p className="text-sm font-medium text-red-900 mb-1">Cancellation Reason:</p>
                          <p className="text-sm text-red-800">{event.cancellation_reason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Event Details */}
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold text-gray-900">Event Details</h3>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">About This Event</h4>
                  <p className="text-gray-700 mb-4">
                    {event.description}
                  </p>
                  
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">What You'll Build</h4>
                  <p className="text-gray-700 mb-4">
                    Create innovative applications that address real-world challenges. Your project could be anything from a healthcare diagnostic tool to an educational platform, from a sustainability monitoring system to a creative content generator.
                  </p>
                  
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Technologies & APIs</h4>
                  <p className="text-gray-700">
                    We'll provide access to various APIs and tools. You'll also have access to cloud computing resources to deploy your applications.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold text-gray-900">Schedule</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {event.schedule.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-900 min-w-[120px]">
                        {item.time}
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.event}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Rules */}
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold text-gray-900">Rules & Guidelines</h3>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {event.rules_list.map((rule, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="text-blue-600 font-medium text-sm mt-0.5">•</span>
                      <span className="text-gray-700">{rule}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {!isRegistered ? (
                    <Button
                      href={`/events/${eventId}/register`}
                      variant="primary"
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Register for Event
                    </Button>
                  ) : (
                    <Button
                      href={`/teams/${myTeam?.id}`}
                      variant="secondary"
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Manage Team
                    </Button>
                  )}
                  
                  <Button
                    variant="primary"
                    className="w-full flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
                    style={{ backgroundColor: '#5865F2' }}
                    disabled
                  >
                    <ExternalLink className="w-4 h-4" />
                    Join Discord (coming soon)
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
                    disabled
                  >
                    <Github className="w-4 h-4" />
                    Resources & APIs (coming soon)
                  </Button>

                  {/* Cancel Event Button - Only show for event creators if not already cancelled */}
                  {isEventCreator && !event.cancelled && (
                    <Button
                      onClick={() => setShowCancelModal(true)}
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      Cancel Event
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Prizes */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Prizes</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {event.prizes.map((prize, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-gray-900">{prize.place}</span>
                        <span className="text-green-600 font-semibold">{prize.amount}</span>
                      </div>
                      <p className="text-sm text-gray-600">{prize.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Event Stats */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Event Stats</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Theme:</span>
                    <span className="font-medium text-gray-900">{event.theme}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Team Size:</span>
                    <span className="font-medium text-gray-900">1-{event.max_team_size} members</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Teams:</span>
                    <span className="font-medium text-gray-900">{event.max_teams}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Votes per User:</span>
                    <span className="font-medium text-gray-900">{event.votes_per_user}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Prize Pool:</span>
                    <span className="font-medium text-green-600">{event.prize_pool}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* My Status */}
            {isRegistered && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-green-900">You're Registered!</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-700 mb-4">
                    You're all set to participate in this hackathon. Don't forget to form your team and submit your project before the deadline.
                  </p>
                  {myTeam && (
                    <p className="text-sm text-green-700 mb-4">
                      Your team: <strong>{myTeam.name}</strong>
                    </p>
                  )}
                  <div className="space-y-2">
                    <Button
                      href={`/teams/${myTeam?.id}`}
                      variant="secondary"
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Manage Team
                    </Button>
                    <Button
                      href={`/events/${eventId}/submit`}
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2 border-green-600 text-green-600 hover:bg-green-50"
                    >
                      <Trophy className="w-4 h-4" />
                      Submit Project
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Event"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Are you sure you want to cancel this event?</h3>
              <p className="text-gray-600 mb-4">
                This action cannot be undone. All registered participants will be notified of the cancellation.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cancellation Reason *
            </label>
            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Please provide a reason for cancelling this event..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This reason will be displayed to all participants.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              onClick={() => setShowCancelModal(false)}
              variant="outline"
              disabled={cancelling}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCancelEvent}
              variant="primary"
              disabled={cancelling || !cancellationReason.trim()}
              className="bg-red-600 hover:bg-red-700 border-red-600"
            >
              {cancelling ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Cancelling...
                </>
              ) : (
                'Cancel Event'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
} 