import { vi } from 'vitest';

// Mock the entire @supabase/supabase-js module
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

export const createMockSupabaseClient = () => {
  const mockClient = {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: null,
          })),
          in: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
        in: vi.fn(() => ({
          data: [],
          error: null,
        })),
        order: vi.fn(() => ({
          data: [],
          error: null,
        })),
        data: [],
        error: null,
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: null,
          })),
        })),
        data: null,
        error: null,
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: null,
            })),
          })),
        })),
        data: null,
        error: null,
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: null,
        })),
      })),
    })),
    auth: {
      getUser: vi.fn(() => ({
        data: { user: null },
        error: null,
      })),
      getSession: vi.fn(() => ({
        data: { session: null },
        error: null,
      })),
    },
  };

  return mockClient;
};

export const mockSupabaseResponse = <T>(data: T, error: any = null) => ({
  data,
  error,
});

export const mockSupabaseError = (message: string, code?: string) => ({
  data: null,
  error: {
    message,
    code,
    details: message,
    hint: '',
  },
});

// Helper to get the mocked createClient function
export const getMockedCreateClient = () => {
  const { createClient } = vi.hoisted(() => ({
    createClient: vi.fn(),
  }));
  return createClient;
};
