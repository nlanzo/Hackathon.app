import { vi } from 'vitest';

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// Mock Next.js
vi.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    constructor(public body?: any) {}
    async json() {
      return this.body || {};
    }
  },
  NextResponse: {
    json: vi.fn((data, options) => ({
      data,
      ...options,
      json: vi.fn().mockResolvedValue(data),
      status: options?.status || 200,
    })),
  },
}));

// Mock console methods in tests
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

// Mock fetch globally
global.fetch = vi.fn();

// Setup test environment
beforeEach(() => {
  vi.clearAllMocks();
});
