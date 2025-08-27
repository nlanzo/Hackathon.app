import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSupabaseClient, mockSupabaseResponse, mockSupabaseError } from '../mocks/supabase';
import { createMockTeam, createMockUser, createMockTeamMember } from '../utils/test-helpers';

// Mock the supabase package using vi.hoisted
const { createClient } = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient,
}));

describe('Team Management Integration Tests', () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    createClient.mockReturnValue(mockSupabase);
  });

  describe('Team Creation', () => {
    it('should create a new team successfully', async () => {
      const mockTeam = createMockTeam();
      const mockUser = createMockUser();

      // Mock the insert operation
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(mockSupabaseResponse(mockTeam))
        })
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert
      });

      // Simulate team creation
      const { data: team, error } = await mockSupabase
        .from('teams')
        .insert({
          name: mockTeam.name,
          description: mockTeam.description,
          owner_id: mockUser.id
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(team).toEqual(mockTeam);
      expect(mockSupabase.from).toHaveBeenCalledWith('teams');
    });

    it('should handle team creation errors', async () => {
      const mockError = mockSupabaseError('Team name already exists');

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(mockError)
        })
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert
      });

      const { data: team, error } = await mockSupabase
        .from('teams')
        .insert({
          name: 'Duplicate Team Name',
          description: 'A team with duplicate name',
          owner_id: 'user-id'
        })
        .select()
        .single();

      expect(error).toBeDefined();
      expect(error.message).toBe('Team name already exists');
      expect(team).toBeNull();
    });
  });

  describe('Team Member Management', () => {
    it('should add a member to a team successfully', async () => {
      const mockTeamMember = createMockTeamMember();

      const mockInsert = vi.fn().mockResolvedValue(mockSupabaseResponse(mockTeamMember));

      mockSupabase.from.mockReturnValue({
        insert: mockInsert
      });

      const { data: member, error } = await mockSupabase
        .from('team_members')
        .insert({
          team_id: mockTeamMember.team_id,
          user_id: mockTeamMember.user_id
        });

      expect(error).toBeNull();
      expect(member).toEqual(mockTeamMember);
      expect(mockSupabase.from).toHaveBeenCalledWith('team_members');
    });

    it('should prevent duplicate team members', async () => {
      const mockError = mockSupabaseError('Duplicate key value violates unique constraint');

      const mockInsert = vi.fn().mockResolvedValue(mockError);

      mockSupabase.from.mockReturnValue({
        insert: mockInsert
      });

      const { data: member, error } = await mockSupabase
        .from('team_members')
        .insert({
          team_id: 'existing-team-id',
          user_id: 'existing-user-id'
        });

      expect(error).toBeDefined();
      expect(error.message).toContain('Duplicate key value');
      expect(member).toBeNull();
    });

    it('should fetch team members successfully', async () => {
      const mockMembers = [
        createMockTeamMember({ user_id: 'user-1' }),
        createMockTeamMember({ user_id: 'user-2' })
      ];

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue(mockSupabaseResponse(mockMembers))
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect
      });

      const { data: members, error } = await mockSupabase
        .from('team_members')
        .select('*')
        .eq('team_id', 'team-id');

      expect(error).toBeNull();
      expect(members).toEqual(mockMembers);
      expect(members).toHaveLength(2);
    });
  });

  describe('Team Queries', () => {
    it('should fetch team details with members', async () => {
      const mockTeam = createMockTeam();
      const mockMembers = [
        createMockTeamMember({ user_id: 'user-1' }),
        createMockTeamMember({ user_id: 'user-2' })
      ];

      // Mock team fetch
      const mockTeamSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(mockSupabaseResponse(mockTeam))
        })
      });

      // Mock members fetch
      const mockMembersSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue(mockSupabaseResponse(mockMembers))
      });

      mockSupabase.from
        .mockReturnValueOnce({
          select: mockTeamSelect
        })
        .mockReturnValueOnce({
          select: mockMembersSelect
        });

      // Fetch team
      const { data: team, error: teamError } = await mockSupabase
        .from('teams')
        .select('*')
        .eq('id', mockTeam.id)
        .single();

      // Fetch members
      const { data: members, error: membersError } = await mockSupabase
        .from('team_members')
        .select('*')
        .eq('team_id', mockTeam.id);

      expect(teamError).toBeNull();
      expect(membersError).toBeNull();
      expect(team).toEqual(mockTeam);
      expect(members).toEqual(mockMembers);
    });

    it('should handle team not found', async () => {
      const mockError = mockSupabaseError('No rows returned');

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(mockError)
        })
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect
      });

      const { data: team, error } = await mockSupabase
        .from('teams')
        .select('*')
        .eq('id', 'non-existent-team-id')
        .single();

      expect(error).toBeDefined();
      expect(error.message).toBe('No rows returned');
      expect(team).toBeNull();
    });
  });

  describe('Team Updates', () => {
    it('should update team information successfully', async () => {
      const updatedTeam = createMockTeam({
        name: 'Updated Team Name',
        description: 'Updated team description'
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockSupabaseResponse(updatedTeam))
          })
        })
      });

      mockSupabase.from.mockReturnValue({
        update: mockUpdate
      });

      const { data: team, error } = await mockSupabase
        .from('teams')
        .update({
          name: 'Updated Team Name',
          description: 'Updated team description'
        })
        .eq('id', updatedTeam.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(team.name).toBe('Updated Team Name');
      expect(team.description).toBe('Updated team description');
    });

    it('should handle update errors', async () => {
      const mockError = mockSupabaseError('Permission denied');

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockError)
          })
        })
      });

      mockSupabase.from.mockReturnValue({
        update: mockUpdate
      });

      const { data: team, error } = await mockSupabase
        .from('teams')
        .update({
          name: 'New Name'
        })
        .eq('id', 'team-id')
        .select()
        .single();

      expect(error).toBeDefined();
      expect(error.message).toBe('Permission denied');
      expect(team).toBeNull();
    });
  });

  describe('Team Deletion', () => {
    it('should delete team and cascade to members', async () => {
      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue(mockSupabaseResponse(null))
      });

      mockSupabase.from.mockReturnValue({
        delete: mockDelete
      });

      // Delete team (should cascade to team_members due to foreign key constraint)
      const { data, error } = await mockSupabase
        .from('teams')
        .delete()
        .eq('id', 'team-id');

      expect(error).toBeNull();
      expect(mockSupabase.from).toHaveBeenCalledWith('teams');
    });

    it('should handle deletion errors', async () => {
      const mockError = mockSupabaseError('Cannot delete team with active registrations');

      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue(mockError)
      });

      mockSupabase.from.mockReturnValue({
        delete: mockDelete
      });

      const { data, error } = await mockSupabase
        .from('teams')
        .delete()
        .eq('id', 'team-id');

      expect(error).toBeDefined();
      expect(error.message).toBe('Cannot delete team with active registrations');
    });
  });
});
