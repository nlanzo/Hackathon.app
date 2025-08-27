import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { createMockSupabaseClient, mockSupabaseResponse, mockSupabaseError } from '../../../../test/mocks/supabase';
import { createMockUser, createMockRequest } from '../../../../test/utils/test-helpers';

// Mock the supabase package using vi.hoisted
const { createClient } = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient,
}));

// Mock the local supabase lib
vi.mock('@/lib/supabase', () => ({
  createClient: vi.fn(),
}));

describe('User Profiles API', () => {
  let mockSupabase: any;
  let mockRequest: any;

  beforeEach(async () => {
    mockSupabase = createMockSupabaseClient();
    
    // Mock both the external and local createClient functions
    createClient.mockReturnValue(mockSupabase);
    
    // Get the mocked local createClient function using vi.mocked
    const localCreateClient = vi.mocked(await import('@/lib/supabase')).createClient;
    localCreateClient.mockReturnValue(mockSupabase);
  });

  describe('POST /api/users/profiles', () => {
    it('should return 400 when userIds is missing', async () => {
      mockRequest = createMockRequest({});

      const response = await POST(mockRequest as any);
      const data = await response.json();
      
      expect(data.error).toBe('User IDs array is required');
      expect(response.status).toBe(400);
    });

    it('should return 400 when userIds is not an array', async () => {
      mockRequest = createMockRequest({ userIds: 'not-an-array' });

      const response = await POST(mockRequest as any);
      const data = await response.json();
      
      expect(data.error).toBe('User IDs array is required');
      expect(response.status).toBe(400);
    });

    it('should return empty profiles when no valid UUIDs provided', async () => {
      mockRequest = createMockRequest({ 
        userIds: ['invalid-uuid', 'null', 'undefined', ''] 
      });

      const response = await POST(mockRequest as any);
      const data = await response.json();
      
      expect(data.profiles).toEqual([]);
    });

    it('should filter out invalid UUIDs and fetch valid ones', async () => {
      const validUserIds = [
        '123e4567-e89b-12d3-a456-426614174000',
        '987fcdeb-51a2-43d1-9f12-345678901234'
      ];
      const invalidUserIds = ['invalid-uuid', 'null', 'undefined', ''];
      
      mockRequest = createMockRequest({ 
        userIds: [...validUserIds, ...invalidUserIds] 
      });

      const mockProfiles = [
        createMockUser({ id: validUserIds[0] }),
        createMockUser({ id: validUserIds[1] })
      ];

      // Mock the supabase query chain
      const mockSelect = vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue(mockSupabaseResponse(mockProfiles))
      });
      
      mockSupabase.from.mockReturnValue({
        select: mockSelect
      });

      const response = await POST(mockRequest as any);
      const data = await response.json();
      
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
      expect(mockSelect).toHaveBeenCalledWith('id, email, full_name, avatar_url, discord_username');
      expect(data.profiles).toEqual(mockProfiles);
    });

    it('should handle Supabase errors gracefully', async () => {
      mockRequest = createMockRequest({ 
        userIds: ['123e4567-e89b-12d3-a456-426614174000'] 
      });

      const mockError = mockSupabaseError('Database connection failed');
      
      const mockSelect = vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue(mockError)
      });
      
      mockSupabase.from.mockReturnValue({
        select: mockSelect
      });

      const response = await POST(mockRequest as any);
      const data = await response.json();
      
      expect(data.error).toBe('Failed to fetch user profiles');
      expect(response.status).toBe(500);
    });

    it('should handle unexpected errors gracefully', async () => {
      mockRequest = createMockRequest({ 
        userIds: ['123e4567-e89b-12d3-a456-426614174000'] 
      });

      // Mock an error in the request.json() call
      mockRequest.json = vi.fn().mockRejectedValue(new Error('Unexpected error'));

      const response = await POST(mockRequest as any);
      const data = await response.json();
      
      expect(data.error).toBe('Internal server error');
      expect(response.status).toBe(500);
    });

    it('should validate UUID format correctly', async () => {
      const testCases = [
        { input: '123e4567-e89b-12d3-a456-426614174000', expected: true },
        { input: '987fcdeb-51a2-43d1-9f12-345678901234', expected: true },
        { input: 'invalid-uuid', expected: false },
        { input: '123e4567-e89b-12d3-a456', expected: false },
        { input: '123e4567-e89b-12d3-a456-426614174000-extra', expected: false },
        { input: 'null', expected: false },
        { input: 'undefined', expected: false },
        { input: '', expected: false },
        { input: null, expected: false },
        { input: undefined, expected: false }
      ];

      for (const testCase of testCases) {
        mockRequest = createMockRequest({ 
          userIds: [testCase.input] 
        });

        const response = await POST(mockRequest as any);
        const data = await response.json();
        
        if (testCase.expected) {
          expect(data.profiles).toBeDefined();
        } else {
          expect(data.profiles).toEqual([]);
        }
      }
    });

    it('should return profiles for valid UUIDs', async () => {
      const validUserIds = ['123e4567-e89b-12d3-a456-426614174000'];
      mockRequest = createMockRequest({ userIds: validUserIds });

      const mockProfiles = [createMockUser({ id: validUserIds[0] })];

      const mockSelect = vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue(mockSupabaseResponse(mockProfiles))
      });
      
      mockSupabase.from.mockReturnValue({
        select: mockSelect
      });

      const response = await POST(mockRequest as any);
      const data = await response.json();
      
      expect(data.profiles).toEqual(mockProfiles);
      expect(response.status).toBe(200); // Default 200 status
    });
  });
});
