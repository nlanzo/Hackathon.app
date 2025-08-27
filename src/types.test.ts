import { describe, it, expect } from 'vitest';
import type { 
  Team, 
  TeamMember, 
  Event, 
  Registration, 
  Submission,
  EventWithDetails,
  TeamWithMembers,
  UserEvent
} from './types';

describe('Type Definitions', () => {
  describe('Team Interface', () => {
    it('should have required properties', () => {
      const team: Team = {
        id: 'test-id',
        name: 'Test Team',
        description: 'A test team',
        owner_id: 'owner-id',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      expect(team.id).toBe('test-id');
      expect(team.name).toBe('Test Team');
      expect(team.owner_id).toBe('owner-id');
    });

    it('should allow optional description', () => {
      const team: Team = {
        id: 'test-id',
        name: 'Test Team',
        owner_id: 'owner-id',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      expect(team.description).toBeUndefined();
    });
  });

  describe('Event Interface', () => {
    it('should have required properties', () => {
      const event: Event = {
        id: 'event-id',
        name: 'Test Event',
        description: 'A test event',
        rules: 'Test rules',
        votes_per_user: 3,
        start_date: '2024-02-01T00:00:00Z',
        end_date: '2024-02-03T00:00:00Z',
        cancelled: false,
        owner_id: 'owner-id',
        prize: 'Test prize',
        discord_server_link: 'https://discord.gg/test',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      expect(event.id).toBe('event-id');
      expect(event.name).toBe('Test Event');
      expect(event.votes_per_user).toBe(3);
      expect(event.cancelled).toBe(false);
    });

    it('should allow optional properties', () => {
      const event: Event = {
        id: 'event-id',
        name: 'Test Event',
        votes_per_user: 3,
        start_date: '2024-02-01T00:00:00Z',
        end_date: '2024-02-03T00:00:00Z',
        cancelled: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      expect(event.description).toBeUndefined();
      expect(event.rules).toBeUndefined();
      expect(event.owner_id).toBeUndefined();
      expect(event.prize).toBeUndefined();
      expect(event.discord_server_link).toBeUndefined();
    });
  });

  describe('Registration Interface', () => {
    it('should have required properties', () => {
      const registration: Registration = {
        team_id: 'team-id',
        event_id: 'event-id',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      expect(registration.team_id).toBe('team-id');
      expect(registration.event_id).toBe('event-id');
    });
  });

  describe('Submission Interface', () => {
    it('should have required properties', () => {
      const submission: Submission = {
        id: 'submission-id',
        team_id: 'team-id',
        event_id: 'event-id',
        repo_url: 'https://github.com/test/repo',
        demo_url: 'https://demo.example.com',
        description: 'Test project',
        submitted_at: '2024-02-02T00:00:00Z',
        created_at: '2024-02-02T00:00:00Z',
        updated_at: '2024-02-02T00:00:00Z',
        votes: 5
      };

      expect(submission.id).toBe('submission-id');
      expect(submission.team_id).toBe('team-id');
      expect(submission.event_id).toBe('event-id');
      expect(submission.votes).toBe(5);
    });

    it('should allow optional properties', () => {
      const submission: Submission = {
        id: 'submission-id',
        team_id: 'team-id',
        event_id: 'event-id',
        submitted_at: '2024-02-02T00:00:00Z',
        created_at: '2024-02-02T00:00:00Z',
        updated_at: '2024-02-02T00:00:00Z',
        votes: 0
      };

      expect(submission.repo_url).toBeUndefined();
      expect(submission.demo_url).toBeUndefined();
      expect(submission.description).toBeUndefined();
    });
  });

  describe('Extended Interfaces', () => {
    it('should extend base interfaces correctly', () => {
      const eventWithDetails: EventWithDetails = {
        id: 'event-id',
        name: 'Test Event',
        description: 'A test event',
        rules: 'Test rules',
        votes_per_user: 3,
        start_date: '2024-02-01T00:00:00Z',
        end_date: '2024-02-03T00:00:00Z',
        cancelled: false,
        owner_id: 'owner-id',
        prize: 'Test prize',
        discord_server_link: 'https://discord.gg/test',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        // Extended properties
        current_participants: 25,
        max_teams: 50,
        max_team_size: 3,
        theme: 'AI/ML',
        status: 'upcoming',
        location: 'Virtual',
        rules_list: ['Rule 1', 'Rule 2', 'Rule 3']
      };

      expect(eventWithDetails.current_participants).toBe(25);
      expect(eventWithDetails.max_teams).toBe(50);
      expect(eventWithDetails.theme).toBe('AI/ML');
      expect(eventWithDetails.status).toBe('upcoming');
      expect(eventWithDetails.rules_list).toEqual(['Rule 1', 'Rule 2', 'Rule 3']);
    });

    it('should handle team with members', () => {
      const teamWithMembers: TeamWithMembers = {
        id: 'team-id',
        name: 'Test Team',
        description: 'A test team',
        owner_id: 'owner-id',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        // Extended properties
        members: [
          {
            team_id: 'team-id',
            user_id: 'user-1',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            user: { username: 'user1' }
          }
        ],
        event: null,
        role: 'Owner',
        status: 'active'
      };

      expect(teamWithMembers.members).toHaveLength(1);
      expect(teamWithMembers.members[0].user.username).toBe('user1');
      expect(teamWithMembers.role).toBe('Owner');
      expect(teamWithMembers.status).toBe('active');
    });
  });

  describe('Type Compatibility', () => {
    it('should allow assignment of compatible types', () => {
      const baseEvent: Event = {
        id: 'event-id',
        name: 'Test Event',
        votes_per_user: 3,
        start_date: '2024-02-01T00:00:00Z',
        end_date: '2024-02-03T00:00:00Z',
        cancelled: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      // EventWithDetails should be assignable from Event
      const extendedEvent: EventWithDetails = {
        ...baseEvent,
        current_participants: 0,
        max_teams: 50,
        max_team_size: 3,
        theme: 'General',
        status: 'upcoming',
        location: 'Virtual',
        rules_list: []
      };

      expect(extendedEvent.id).toBe(baseEvent.id);
      expect(extendedEvent.name).toBe(baseEvent.name);
    });

    it('should maintain type safety', () => {
      // This should compile without errors
      const teamMember: TeamMember = {
        team_id: 'team-id',
        user_id: 'user-id',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      expect(teamMember.team_id).toBe('team-id');
      expect(teamMember.user_id).toBe('user-id');
    });
  });
});
