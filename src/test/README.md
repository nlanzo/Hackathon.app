# Testing Guide for Hackathon.app

This directory contains comprehensive tests for the hackathon application backend, including API routes, utility functions, and database operations.

## Test Structure

```
src/test/
├── README.md                 # This file
├── setup.ts                 # Test environment setup and global mocks
├── mocks/                   # Mock implementations
│   └── supabase.ts         # Supabase client mocks
├── utils/                   # Test utility functions
│   └── test-helpers.ts     # Common test helpers and mock data creators
├── integration/             # Integration tests
│   ├── teams.test.ts       # Team management operations
│   └── events.test.ts      # Event management operations
└── config/                  # Test configuration
    └── test-env.ts         # Test environment settings
```

## Quick Start

### Install Dependencies

```bash
npm install
```

### Run All Tests

```bash
npm run test
```

### Run Tests with UI

```bash
npm run test:ui
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

## Test Types

### 1. Unit Tests

- **Location**: `src/lib/` and `src/app/api/`
- **Purpose**: Test individual functions and API endpoints in isolation
- **Coverage**: Utility functions, API route handlers, data validation

### 2. Integration Tests

- **Location**: `src/test/integration/`
- **Purpose**: Test database operations and complex workflows
- **Coverage**: Team management, event registration, project submissions

### 3. API Tests

- **Location**: `src/app/api/`
- **Purpose**: Test HTTP endpoints and request/response handling
- **Coverage**: Input validation, error handling, response formatting

## Test Utilities

### Mock Data Creators

```typescript
import {
  createMockUser,
  createMockTeam,
  createMockEvent,
} from "@/test/utils/test-helpers"

const user = createMockUser({ email: "custom@example.com" })
const team = createMockTeam({ name: "Custom Team" })
const event = createMockEvent({ start_date: "2024-03-01T00:00:00Z" })
```

### Supabase Mocks

```typescript
import {
  createMockSupabaseClient,
  mockSupabaseResponse,
} from "@/test/mocks/supabase"

const mockClient = createMockSupabaseClient()
const mockData = mockSupabaseResponse({ id: "test-id", name: "Test" })
```

### Test Helpers

```typescript
import {
  mockConsoleMethods,
  createMockRequest,
} from "@/test/utils/test-helpers"

// Mock console methods to reduce noise in tests
mockConsoleMethods()

// Create mock HTTP request
const request = createMockRequest({ userIds: ["user-1", "user-2"] })
```

## Test Coverage

### API Routes

- User Profiles API (`/api/users/profiles`)
  - Input validation
  - UUID format validation
  - Error handling
  - Success responses

### Utility Functions

- Class name utility (`cn`)
- Event status calculation
- Dashboard filtering logic
- Event activity checks

### Database Operations

- Team CRUD operations
- Team member management
- Event creation and management
- Event registration
- Project submissions
- Data validation and constraints

## Configuration

### Environment Variables

```bash
# Test database (optional - uses mocks by default)
TEST_SUPABASE_URL=https://test.supabase.co
TEST_SUPABASE_ANON_KEY=test-anon-key
TEST_SUPABASE_SERVICE_ROLE_KEY=test-service-role-key

# Test environment
NODE_ENV=test
VITEST=true
```

### Vitest Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
})
```

## Test Cleanup

Tests automatically clean up after themselves:

- Mock functions are reset between tests
- Console methods are mocked to reduce noise
- Test data is isolated per test

## Running Specific Tests

### Run by Type

```bash
# Unit tests only
npm run test -- --run src/lib/ src/app/api/

# Integration tests only
npm run test -- --run src/test/integration/

# API tests only
npm run test -- --run src/app/api/
```

### Run by File

```bash
# Specific test file
npm run test src/lib/utils.test.ts

# Multiple test files
npm run test src/lib/ src/app/api/
```

### Run with Filters

```bash
# Run tests matching pattern
npm run test -- --run -t "User Profiles"

# Run tests in specific directory
npm run test -- --run src/test/integration/
```

## Debugging Tests

### Verbose Output

```bash
npm run test -- --reporter=verbose
```

### Watch Mode with UI

```bash
npm run test:ui
```

### Debug Specific Test

```bash
# Add debugger statement in test
debugger;

# Run with Node.js debugger
node --inspect-brk node_modules/.bin/vitest
```

## Writing New Tests

### Test File Structure

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest"

describe("Feature Name", () => {
  beforeEach(() => {
    // Setup for each test
  })

  describe("Specific Functionality", () => {
    it("should do something specific", async () => {
      // Arrange
      const input = "test"

      // Act
      const result = await functionToTest(input)

      // Assert
      expect(result).toBe("expected")
    })
  })
})
```

### Best Practices

1. **Descriptive test names**: Use clear, descriptive test names
2. **Arrange-Act-Assert**: Structure tests with clear sections
3. **Mock external dependencies**: Use mocks for Supabase, HTTP requests, etc.
4. **Test edge cases**: Include tests for error conditions and boundary cases
5. **Isolation**: Each test should be independent and not affect others

### Example Test

```typescript
describe("Team Creation", () => {
  it("should create a new team successfully", async () => {
    // Arrange
    const mockTeam = createMockTeam()
    const mockUser = createMockUser()

    // Mock Supabase response
    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue(mockSupabaseResponse(mockTeam)),
      }),
    })

    mockSupabase.from.mockReturnValue({ insert: mockInsert })

    // Act
    const { data: team, error } = await mockSupabase
      .from("teams")
      .insert({
        name: mockTeam.name,
        description: mockTeam.description,
        owner_id: mockUser.id,
      })
      .select()
      .single()

    // Assert
    expect(error).toBeNull()
    expect(team).toEqual(mockTeam)
    expect(mockSupabase.from).toHaveBeenCalledWith("teams")
  })
})
```

## Common Issues

### Mock Not Working

- Ensure mocks are imported correctly
- Check that `vi.mock()` is called before importing the module
- Verify mock setup in `beforeEach`

### Test Environment Issues

- Check that `src/test/setup.ts` is properly configured
- Ensure environment variables are set correctly
- Verify Vitest configuration

### Database Connection Issues

- Tests use mocked Supabase client by default
- No actual database connection is required
- Check mock implementations if database operations fail

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles)
- [Jest/Vitest Matchers](https://vitest.dev/api/expect.html)
- [Mocking Best Practices](https://vitest.dev/guide/mocking.html)

## Contributing

When adding new features:

1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Maintain good test coverage
4. Update this README if adding new test types or utilities

## Coverage Goals

- **API Routes**: 100%
- **Utility Functions**: 100%
- **Database Operations**: 95%+
- **Error Handling**: 100%
- **Edge Cases**: 90%+

Run `npm run test:coverage` to check current coverage levels.
