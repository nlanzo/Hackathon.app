import { createClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userIds } = await request.json();
    
    if (!userIds || !Array.isArray(userIds)) {
      return NextResponse.json({ error: 'User IDs array is required' }, { status: 400 });
    }

    // Filter out null, undefined, or invalid UUIDs
    const validUserIds = userIds.filter(id => 
      id && 
      typeof id === 'string' && 
      id !== 'null' && 
      id !== 'undefined' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    );

    if (validUserIds.length === 0) {
      return NextResponse.json({ profiles: [] });
    }

    console.log('API: Fetching profiles for valid user IDs:', validUserIds);

    const supabase = createClient();
    
    // Fetch user profiles from the profiles table
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url, discord_username')
      .in('id', validUserIds);
    
    if (error) {
      console.error('Error fetching profiles:', error);
      return NextResponse.json({ error: 'Failed to fetch user profiles' }, { status: 500 });
    }

    return NextResponse.json({ profiles });
    
  } catch (error) {
    console.error('Error in user profiles API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 