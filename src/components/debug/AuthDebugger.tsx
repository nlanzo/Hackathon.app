'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase';
import { useState, useEffect } from 'react';

export function AuthDebugger() {
  const { user, session } = useAuth();
  const [debugData, setDebugData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDebugQueries = async () => {
    if (!user?.id) {
      setDebugData({ error: 'No user ID available' });
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      // Test 1: Check if user exists in auth.users
      const { data: authUser, error: authError } = await supabase
        .from('auth.users')
        .select('id, email, created_at')
        .eq('id', user.id)
        .single();

      // Test 2: Check owned events
      const { data: ownedEvents, error: eventsError } = await supabase
        .from('events')
        .select('id, name, owner_id')
        .eq('owner_id', user.id);

      // Test 3: Check team memberships
      const { data: teamMemberships, error: membershipsError } = await supabase
        .from('team_members')
        .select('team_id, user_id')
        .eq('user_id', user.id);

      // Test 4: Check teams user belongs to
      const { data: userTeams, error: teamsError } = await supabase
        .from('teams')
        .select('id, name, owner_id')
        .or(`owner_id.eq.${user.id},id.in.(${teamMemberships?.map(tm => tm.team_id).join(',') || ''})`);

      // Test 5: Check registrations
      const { data: registrations, error: regError } = await supabase
        .from('registrations')
        .select('team_id, event_id')
        .in('team_id', teamMemberships?.map(tm => tm.team_id) || []);

      setDebugData({
        user: {
          id: user.id,
          email: user.email,
          session: !!session
        },
        queries: {
          authUser: { data: authUser, error: authError },
          ownedEvents: { data: ownedEvents, error: eventsError },
          teamMemberships: { data: teamMemberships, error: membershipsError },
          userTeams: { data: userTeams, error: teamsError },
          registrations: { data: registrations, error: regError }
        },
        summary: {
          ownedEventsCount: ownedEvents?.length || 0,
          teamMembershipsCount: teamMemberships?.length || 0,
          userTeamsCount: userTeams?.length || 0,
          registrationsCount: registrations?.length || 0
        }
      });

    } catch (error) {
        setDebugData({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      runDebugQueries();
    }
  }, [user?.id]);

  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">🔍 Auth Debugger</h3>
        <p className="text-yellow-700">No user authenticated</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold text-blue-800 mb-2">🔍 Auth Debugger</h3>
      
      <div className="space-y-3">
        <div>
          <strong>Current User ID:</strong> {user.id}
        </div>
        
        <div>
          <strong>Expected User ID:</strong> 25197b2f-54c3-4ef2-beff-910fe50598b8
        </div>
        
        <div>
          <strong>Match:</strong> 
          <span className={user.id === '25197b2f-54c3-4ef2-beff-910fe50598b8' ? 'text-green-600' : 'text-red-600'}>
            {user.id === '25197b2f-54c3-4ef2-beff-910fe50598b8' ? '✅ YES' : '❌ NO'}
          </span>
        </div>

        {loading && (
          <div className="text-blue-600">Loading debug data...</div>
        )}

        {debugData && !debugData.error && (
          <div className="mt-4">
            <h4 className="font-semibold text-blue-800 mb-2">Query Results:</h4>
            <div className="bg-white rounded p-3 text-sm">
              <div><strong>Owned Events:</strong> {debugData.summary.ownedEventsCount}</div>
              <div><strong>Team Memberships:</strong> {debugData.summary.teamMembershipsCount}</div>
              <div><strong>User Teams:</strong> {debugData.summary.userTeamsCount}</div>
              <div><strong>Registrations:</strong> {debugData.summary.registrationsCount}</div>
            </div>
            
            {debugData.queries.ownedEvents.error && (
              <div className="mt-2 text-red-600 text-sm">
                <strong>Events Query Error:</strong> {debugData.queries.ownedEvents.error.message}
              </div>
            )}
          </div>
        )}

        {debugData?.error && (
          <div className="text-red-600">
            <strong>Error:</strong> {debugData.error}
          </div>
        )}

        <button
          onClick={runDebugQueries}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
        >
          Refresh Debug Data
        </button>
      </div>
    </div>
  );
}