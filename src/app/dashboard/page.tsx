'use client';

import Link from "next/link";
import { Calendar, Users, Trophy, Clock, Plus } from "lucide-react";
import { EventWithDetails, TeamWithMembers, UserEvent, UserStats } from "@/lib/types";
import { Navigation } from "@/components/layout/Navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatsCard } from "@/components/dashboard/StatsCard";

import { TeamsSection } from "@/components/dashboard/TeamsSection";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase";
import { useEffect, useState, useRef } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const [myTeams, setMyTeams] = useState<TeamWithMembers[]>([]);
  const [myEvents, setMyEvents] = useState<UserEvent[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    active_events: 0,
    my_teams: 0,
    submissions: 0,
    upcoming_events: 0
  });
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (user?.id && !hasFetched.current) {
      hasFetched.current = true;
      fetchDashboardData();
    } else if (!user && !loading) {
      setLoading(false);
    }
  }, [user?.id]); // Only depend on user.id, not the entire user object

  const fetchDashboardData = async () => {
    const supabase = createClient();
    
    try {

      // Fetch user's teams (simplified query)
      const { data: teamMemberships, error: teamMembershipsError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user?.id);

      if (teamMembershipsError) throw teamMembershipsError;

      const teamIds = teamMemberships?.map(tm => tm.team_id) || [];
      
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .in('id', teamIds);

      if (teamsError) throw teamsError;

      // Fetch team members for each team
      const { data: teamMembers, error: teamMembersError } = await supabase
        .from('team_members')
        .select('team_id, user_id')
        .in('team_id', teamIds);

      if (teamMembersError) throw teamMembersError;

      // Group members by team
      const membersByTeam = teamMembers?.reduce((acc, member) => {
        if (!acc[member.team_id]) {
          acc[member.team_id] = [];
        }
        acc[member.team_id].push(member.user_id);
        return acc;
      }, {} as Record<string, string[]>) || {};

      // Transform teams to match TeamWithMembers type
      const transformedTeams: TeamWithMembers[] = teams?.map(team => ({
        ...team,
        members: membersByTeam[team.id]?.map(userId => ({
          team_id: team.id,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user: { username: 'Loading...' } // Will be populated by client-side fetch
        })) || [],
        event: null,
        role: "Member",
        status: "active"
      })) || [];

      setMyTeams(transformedTeams);

      // Fetch user's events (simplified)
      const { data: userEvents, error: userEventsError } = await supabase
        .from('registrations')
        .select('event_id')
        .in('team_id', teams?.map(t => t.id) || []);

      if (userEventsError) throw userEventsError;

      // Fetch event details for user's events
      const eventIds = userEvents?.map(reg => reg.event_id) || [];
      const { data: eventDetails } = await supabase
        .from('events')
        .select('*')
        .in('id', eventIds);

      const transformedUserEvents: UserEvent[] = eventDetails?.map(event => ({
        ...event,
        role: "participant",
        user_status: "registered",
        progress: 0
      })) || [];

      setMyEvents(transformedUserEvents);

      // Calculate stats
      setUserStats({
        active_events: transformedUserEvents.length,
        my_teams: transformedTeams.length,
        submissions: 0, // Will be calculated separately
        upcoming_events: transformedUserEvents.length
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation showAuthButtons={false} />
      <PageHeader 
        title="Dashboard"
        action={{
          label: "Create Event",
          href: "/events/create",
          variant: "primary",
          icon: <Plus className="w-4 h-4" />
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="My Events"
            value={userStats.active_events}
            icon={<Calendar className="w-6 h-6" />}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          
          <StatsCard
            title="My Teams"
            value={userStats.my_teams}
            icon={<Users className="w-6 h-6" />}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
          />
          
          <StatsCard
            title="Submissions"
            value={userStats.submissions}
            icon={<Trophy className="w-6 h-6" />}
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
          />
          
          <StatsCard
            title="Active"
            value={userStats.upcoming_events}
            icon={<Clock className="w-6 h-6" />}
            iconBgColor="bg-orange-100"
            iconColor="text-orange-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Events - Now the main section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">My Events</h2>
                <p className="text-gray-600">Events you're registered for</p>
              </CardHeader>
              <CardContent>
                {myEvents.length > 0 ? (
                  <div className="space-y-6">
                    {myEvents.map((event) => (
                      <Link 
                        key={event.id} 
                        href={`/events/${event.id}`}
                        className="block border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow hover:border-gray-300"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">Role: {event.role}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                            {event.user_status}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                          <div 
                            className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                            style={{ width: `${event.progress}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-500">Progress: {event.progress}%</p>
                          <span className="text-blue-600 text-sm font-medium">
                            View Event →
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Calendar className="w-16 h-16" />}
                    title="No Events Yet"
                    description="You haven't registered for any events yet. Browse available events to get started!"
                    action={{
                      label: "Browse Events",
                      href: "/events"
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* My Teams */}
            <TeamsSection teams={myTeams} />
          </div>
        </div>
      </div>
    </div>
  );
} 