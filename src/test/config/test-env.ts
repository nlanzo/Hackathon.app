export const TEST_CONFIG = {
  // Test database configuration
  database: {
    url: process.env.TEST_SUPABASE_URL || 'https://test.supabase.co',
    anonKey: process.env.TEST_SUPABASE_ANON_KEY || 'test-anon-key',
    serviceRoleKey: process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key',
  },
  
  // Test user credentials
  users: {
    testUser: {
      email: 'test@example.com',
      password: 'testpassword123',
      discordId: '123456789',
      username: 'testuser'
    },
    adminUser: {
      email: 'admin@example.com',
      password: 'adminpassword123',
      discordId: '987654321',
      username: 'adminuser'
    }
  },
  
  // Test data limits
  limits: {
    maxTeamSize: 3,
    maxTeamsPerEvent: 50,
    maxVotesPerUser: 3,
    maxSubmissionsPerTeam: 1
  },
  
  // Test timeouts
  timeouts: {
    api: 5000,        // 5 seconds for API calls
    database: 10000,   // 10 seconds for database operations
    test: 30000        // 30 seconds for entire test
  },
  
  // Test cleanup settings
  cleanup: {
    autoCleanup: true,
    cleanupInterval: 1000, // 1 second
    maxRetries: 3
  }
};

export const TEST_TABLES = {
  profiles: 'profiles',
  teams: 'teams',
  team_members: 'team_members',
  events: 'events',
  registrations: 'registrations',
  submissions: 'submissions'
};

export const TEST_SCHEMAS = {
  public: 'public',
  auth: 'auth'
};

// Helper function to get test environment variable
export function getTestEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Required test environment variable ${key} is not set`);
  }
  return value || defaultValue!;
}

// Helper function to check if we're in test environment
export function isTestEnvironment(): boolean {
  return process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
}

// Helper function to get test database URL
export function getTestDatabaseUrl(): string {
  return getTestEnvVar('TEST_SUPABASE_URL', 'https://test.supabase.co');
}

// Helper function to get test database key
export function getTestDatabaseKey(): string {
  return getTestEnvVar('TEST_SUPABASE_ANON_KEY', 'test-anon-key');
}
