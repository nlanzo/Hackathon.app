// Database types based on Supabase schema

export interface User {
  id: string;
  email?: string;
  discord_id?: string;
  username?: string;
  avatar?: string;
  bio?: string;
  skills?: string[];
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  // Computed fields
  members?: TeamMember[];
  member_count?: number;
}

export interface TeamMember {
  team_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  user?: User;
  team?: Team;
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  rules?: string;
  votes_per_user: number;
  start_date: string;
  end_date: string;
  cancelled: boolean;
  cancellation_reason?: string;
  owner_id?: string;
  prize?: string;
  created_at: string;
  updated_at: string;
  // Computed fields
  registration_count?: number;
  max_teams?: number;
  max_team_size?: number;
  theme?: string;
  status?: 'upcoming' | 'active' | 'completed';
}

export interface Registration {
  team_id: string;
  event_id: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  team?: Team;
  event?: Event;
}

export interface Submission {
  id: string;
  team_id: string;
  event_id: string;
  repo_url?: string;
  demo_url?: string;
  description?: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
  votes: number;
  // Joined fields
  team?: Team;
  event?: Event;
}

// Extended types for UI
export interface EventWithDetails extends Event {
  current_participants: number;
  max_teams: number;
  max_team_size: number;
  theme: string;
  status: 'upcoming' | 'active' | 'completed';
  location: string;
  rules_list: string[];
  cancelled: boolean;
  cancellation_reason?: string;
}

export interface UserStats {
  active_events: number;
  my_teams: number;
  submissions: number;
  upcoming_events: number;
  hosted_events: number;
}

export interface TeamWithMembers extends Team {
  members: (TeamMember & { user: User })[];
  event?: Event;
  role?: string;
  status?: 'active' | 'inactive';
}

export interface UserEvent extends Event {
  role: 'participant' | 'organizer' | 'judge';
  user_status: 'registered' | 'active' | 'completed';
  progress: number;
} 