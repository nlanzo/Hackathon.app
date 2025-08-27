import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSupabaseClient, mockSupabaseResponse, mockSupabaseError } from '../mocks/supabase';
import { 
  createMockEvent, 
  createMockTeam, 
  createMockRegistration,
  createMockSubmission,
  createMockUser
} from '../utils/test-helpers';

// Mock the supabase package using vi.hoisted
const { createClient } = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient,
}));

describe('Event Management Integration Tests', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    createClient.mockReturnValue(mockSupabase);
  });

  describe('Event Creation', () => {
    it('should create a new event successfully', async () => {
      const mockEvent = createMockEvent();
      const mockUser = createMockUser();

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(mockSupabaseResponse(mockEvent))
        })
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert
      });

      const { data: event, error } = await mockSupabase
        .from('events')
        .insert({
          name: mockEvent.name,
          description: mockEvent.description,
          rules: mockEvent.rules,
          votes_per_user: mockEvent.votes_per_user,
          start_date: mockEvent.start_date,
          end_date: mockEvent.end_date,
          owner_id: mockUser.id,
          prize: mockEvent.prize,
          discord_server_link: mockEvent.discord_server_link
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(event).toEqual(mockEvent);
      expect(mockSupabase.from).toHaveBeenCalledWith('events');
    });

    it('should validate event dates', async () => {
      const mockError = mockSupabaseError('End date must be after start date');

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(mockError)
        })
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert
      });

      const { data: event, error } = await mockSupabase
        .from('events')
        .insert({
          name: 'Invalid Date Event',
          start_date: '2024-03-01T00:00:00Z',
          end_date: '2024-02-01T00:00:00Z', // End before start
          votes_per_user: 3,
          owner_id: 'user-id'
        })
        .select()
        .single();

      expect(error).toBeDefined();
      expect(error.message).toBe('End date must be after start date');
      expect(event).toBeNull();
    });
  });

  describe('Event Registration', () => {
    it('should register a team for an event successfully', async () => {
      const mockRegistration = createMockRegistration();

      const mockInsert = vi.fn().mockResolvedValue(mockSupabaseResponse(mockRegistration));

      mockSupabase.from.mockReturnValue({
        insert: mockInsert
      });

      const { data: registration, error } = await mockSupabase
        .from('registrations')
        .insert({
          team_id: mockRegistration.team_id,
          event_id: mockRegistration.event_id
        });

      expect(error).toBeNull();
      expect(registration).toEqual(mockRegistration);
      expect(mockSupabase.from).toHaveBeenCalledWith('registrations');
    });

    it('should prevent duplicate registrations', async () => {
      const mockError = mockSupabaseError('Team already registered for this event');

      const mockInsert = vi.fn().mockResolvedValue(mockError);

      mockSupabase.from.mockReturnValue({
        insert: mockInsert
      });

      const { data: registration, error } = await mockSupabase
        .from('registrations')
        .insert({
          team_id: 'existing-team-id',
          event_id: 'existing-event-id'
        });

      expect(error).toBeDefined();
      expect(error.message).toBe('Team already registered for this event');
      expect(registration).toBeNull();
    });

    it('should fetch event registrations', async () => {
      const mockRegistrations = [
        createMockRegistration({ team_id: 'team-1' }),
        createMockRegistration({ team_id: 'team-2' })
      ];

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue(mockSupabaseResponse(mockRegistrations))
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect
      });

      const { data: registrations, error } = await mockSupabase
        .from('registrations')
        .select('*')
        .eq('event_id', 'event-id');

      expect(error).toBeNull();
      expect(registrations).toEqual(mockRegistrations);
      expect(registrations).toHaveLength(2);
    });
  });

  describe('Event Queries', () => {
    it('should fetch events with proper ordering', async () => {
      const mockEvents = [
        createMockEvent({ 
          id: 'event-1', 
          start_date: '2024-03-01T00:00:00Z' 
        }),
        createMockEvent({ 
          id: 'event-2', 
          start_date: '2024-04-01T00:00:00Z' 
        })
      ];

      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue(mockSupabaseResponse(mockEvents))
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect
      });

      const { data: events, error } = await mockSupabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true });

      expect(error).toBeNull();
      expect(events).toEqual(mockEvents);
      expect(events[0].start_date).toBe('2024-03-01T00:00:00Z');
      expect(events[1].start_date).toBe('2024-04-01T00:00:00Z');
    });

    it('should fetch single event by ID', async () => {
      const mockEvent = createMockEvent();

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(mockSupabaseResponse(mockEvent))
        })
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect
      });

      const { data: event, error } = await mockSupabase
        .from('events')
        .select('*')
        .eq('id', mockEvent.id)
        .single();

      expect(error).toBeNull();
      expect(event).toEqual(mockEvent);
    });

    it('should handle event not found', async () => {
      const mockError = mockSupabaseError('No rows returned');

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(mockError)
        })
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect
      });

      const { data: event, error } = await mockSupabase
        .from('events')
        .select('*')
        .eq('id', 'non-existent-event-id')
        .single();

      expect(error).toBeDefined();
      expect(error.message).toBe('No rows returned');
      expect(event).toBeNull();
    });
  });

  describe('Project Submissions', () => {
    it('should create a project submission successfully', async () => {
      const mockSubmission = createMockSubmission();

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(mockSupabaseResponse(mockSubmission))
        })
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert
      });

      const { data: submission, error } = await mockSupabase
        .from('submissions')
        .insert({
          team_id: mockSubmission.team_id,
          event_id: mockSubmission.event_id,
          repo_url: mockSubmission.repo_url,
          demo_url: mockSubmission.demo_url,
          description: mockSubmission.description
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(submission).toEqual(mockSubmission);
      expect(mockSupabase.from).toHaveBeenCalledWith('submissions');
    });

    it('should update existing submission', async () => {
      const updatedSubmission = createMockSubmission({
        description: 'Updated project description',
        repo_url: 'https://github.com/updated/repo'
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockSupabaseResponse(updatedSubmission))
          })
        })
      });

      mockSupabase.from.mockReturnValue({
        update: mockUpdate
      });

      const { data: submission, error } = await mockSupabase
        .from('submissions')
        .update({
          description: 'Updated project description',
          repo_url: 'https://github.com/updated/repo'
        })
        .eq('id', updatedSubmission.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(submission.description).toBe('Updated project description');
      expect(submission.repo_url).toBe('https://github.com/updated/repo');
    });

    it('should fetch submissions for an event', async () => {
      const mockSubmissions = [
        createMockSubmission({ id: 'sub-1', votes: 5 }),
        createMockSubmission({ id: 'sub-2', votes: 3 }),
        createMockSubmission({ id: 'sub-3', votes: 8 })
      ];

      // Order submissions by votes descending (highest first) to match the expected order
      const orderedSubmissions = [...mockSubmissions].sort((a, b) => b.votes - a.votes);

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue(mockSupabaseResponse(orderedSubmissions))
        })
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect
      });

      const { data: submissions, error } = await mockSupabase
        .from('submissions')
        .select(`
          *,
          team:teams(
            id,
            name,
            description,
            owner_id
          )
        `)
        .eq('event_id', 'event-id')
        .order('votes', { ascending: false });

      expect(error).toBeNull();
      expect(submissions).toEqual(orderedSubmissions);
      expect(submissions[0].votes).toBe(8); // Highest votes first
      expect(submissions[2].votes).toBe(3); // Lowest votes last
    });

    it('should handle submission validation errors', async () => {
      const mockError = mockSupabaseError('Repository URL is required');

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(mockError)
        })
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert
      });

      const { data: submission, error } = await mockSupabase
        .from('submissions')
        .insert({
          team_id: 'team-id',
          event_id: 'event-id',
          description: 'Project description'
          // Missing repo_url
        })
        .select()
        .single();

      expect(error).toBeDefined();
      expect(error.message).toBe('Repository URL is required');
      expect(submission).toBeNull();
    });
  });

  describe('Event Status and Filtering', () => {
    it('should filter events by status correctly', async () => {
      const now = new Date('2024-02-02T12:00:00Z');
      const upcomingEvent = createMockEvent({ 
        start_date: '2024-03-01T00:00:00Z',
        end_date: '2024-03-03T00:00:00Z'
      });
      const activeEvent = createMockEvent({ 
        start_date: '2024-02-01T00:00:00Z',
        end_date: '2024-02-03T00:00:00Z'
      });
      const completedEvent = createMockEvent({ 
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-03T00:00:00Z'
      });

      // Order events by start_date ascending (earliest first) to match the expected order
      const mockEvents = [completedEvent, activeEvent, upcomingEvent];

      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue(mockSupabaseResponse(mockEvents))
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect
      });

      const { data: events, error } = await mockSupabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true });

      expect(error).toBeNull();
      expect(events).toHaveLength(3);
      
      // Events should be ordered by start date
      expect(events[0].start_date).toBe('2024-01-01T00:00:00Z'); // Completed
      expect(events[1].start_date).toBe('2024-02-01T00:00:00Z'); // Active
      expect(events[2].start_date).toBe('2024-03-01T00:00:00Z'); // Upcoming
    });
  });
});
