import { vi } from 'vitest';

export const createMockUser = (overrides: Partial<any> = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  full_name: 'Test User',
  avatar_url: 'https://example.com/avatar.jpg',
  discord_username: 'testuser#1234',
  ...overrides,
});

export const createMockTeam = (overrides: Partial<any> = {}) => ({
  id: 'test-team-id',
  name: 'Test Team',
  description: 'A test team for testing',
  owner_id: 'test-user-id',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockEvent = (overrides: Partial<any> = {}) => ({
  id: 'test-event-id',
  name: 'Test Hackathon',
  description: 'A test hackathon event',
  rules: 'Test rules for the event',
  votes_per_user: 3,
  start_date: '2024-02-01T00:00:00Z',
  end_date: '2024-02-03T00:00:00Z',
  cancelled: false,
  owner_id: 'test-user-id',
  prize: 'Test prize',
  discord_server_link: 'https://discord.gg/test',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockRegistration = (overrides: Partial<any> = {}) => ({
  team_id: 'test-team-id',
  event_id: 'test-event-id',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockSubmission = (overrides: Partial<any> = {}) => ({
  id: 'test-submission-id',
  team_id: 'test-team-id',
  event_id: 'test-event-id',
  repo_url: 'https://github.com/test/repo',
  demo_url: 'https://demo.example.com',
  description: 'A test project submission',
  submitted_at: '2024-02-02T00:00:00Z',
  created_at: '2024-02-02T00:00:00Z',
  updated_at: '2024-02-02T00:00:00Z',
  votes: 0,
  ...overrides,
});

export const createMockTeamMember = (overrides: Partial<any> = {}) => ({
  team_id: 'test-team-id',
  user_id: 'test-user-id',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const mockConsoleMethods = () => {
  const originalConsole = { ...console };
  
  beforeAll(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  return originalConsole;
};

export const createMockRequest = (body: any = {}) => ({
  json: vi.fn().mockResolvedValue(body),
});

export const createMockResponse = () => ({
  json: vi.fn().mockReturnThis(),
  status: vi.fn().mockReturnThis(),
});
