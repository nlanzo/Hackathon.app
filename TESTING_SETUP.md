# Testing Setup for Hackathon.app

## 🎯 Overview

This document describes the comprehensive testing infrastructure that has been set up for your hackathon application. The testing setup includes unit tests, integration tests, and comprehensive mocking for all backend operations.

## 🏗️ What's Been Set Up

### 1. Testing Framework
- **Vitest**: Fast, modern testing framework with TypeScript support
- **Test Environment**: Node.js environment for backend testing
- **Coverage Reporting**: Built-in coverage with multiple output formats

### 2. Test Structure
```
src/test/
├── README.md                 # Comprehensive testing guide
├── setup.ts                 # Global test setup and mocks
├── mocks/                   # Mock implementations
│   └── supabase.ts         # Supabase client mocks
├── utils/                   # Test utilities
│   └── test-helpers.ts     # Mock data creators and helpers
├── integration/             # Integration tests
│   ├── teams.test.ts       # Team management operations
│   └── events.test.ts      # Event management operations
└── config/                  # Test configuration
    └── test-env.ts         # Environment settings
```

### 3. Test Files Created
- ✅ `src/lib/utils.test.ts` - Utility function tests
- ✅ `src/lib/supabase.test.ts` - Supabase client tests
- ✅ `src/app/api/users/profiles/route.test.ts` - API route tests
- ✅ `src/test/integration/teams.test.ts` - Team integration tests
- ✅ `src/test/integration/events.test.ts` - Event integration tests
- ✅ `src/types.test.ts` - Type definition validation tests

### 4. Mock Infrastructure
- **Supabase Client Mocks**: Complete mocking of database operations
- **HTTP Request/Response Mocks**: Mock Next.js request/response objects
- **Test Data Creators**: Helper functions to create realistic test data
- **Console Mocking**: Reduced noise in test output

## 🚀 Quick Start

### Prerequisites
```bash
# Install dependencies
npm install

# Verify installation
npm run test -- --version
```

### Basic Test Commands
```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## ⚠️ Current Issue: PostCSS Configuration

**Problem**: The PostCSS configuration is causing Vitest to fail when trying to load CSS-related configurations.

**Symptoms**: 
```
Failed to load PostCSS config: Failed to load PostCSS config (searchPath: /path/to/project): [TypeError] Invalid PostCSS Plugin found at: plugins[0]
```

**Workaround**: Temporarily rename the PostCSS config file before running tests:
```bash
# Before running tests
mv postcss.config.mjs postcss.config.mjs.bak

# Run tests
npm run test

# Restore config after testing
mv postcss.config.mjs.bak postcss.config.mjs
```

## 🔧 Test Configuration

### Vitest Configuration (`vitest.config.ts`)
```typescript
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.next/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**'
      ]
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  }
});
```

### Test Setup (`src/test/setup.ts`)
- Environment variable mocking
- Next.js server mocking
- Console method mocking
- Global test cleanup

## 🧪 Test Types and Examples

### 1. Unit Tests
Test individual functions and API endpoints in isolation.

**Example - Utility Functions:**
```typescript
import { describe, it, expect } from 'vitest';
import { calculateEventStatus } from '@/lib/utils';

describe('calculateEventStatus', () => {
  it('should return "upcoming" for future events', () => {
    const startDate = '2024-03-01T00:00:00Z';
    const endDate = '2024-03-03T00:00:00Z';
    
    expect(calculateEventStatus(startDate, endDate)).toBe('upcoming');
  });
});
```

### 2. API Route Tests
Test HTTP endpoints and request/response handling.

**Example - User Profiles API:**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

describe('User Profiles API', () => {
  it('should return 400 when userIds is missing', async () => {
    const mockRequest = createMockRequest({});
    const response = await POST(mockRequest as any);
    
    expect(response.data.error).toBe('User IDs array is required');
    expect(response.status).toBe(400);
  });
});
```

### 3. Integration Tests
Test database operations and complex workflows.

**Example - Team Management:**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Team Management Integration Tests', () => {
  it('should create a new team successfully', async () => {
    const mockTeam = createMockTeam();
    const mockUser = createMockUser();
    
    // Mock Supabase operations
    const { data: team, error } = await mockSupabase
      .from('teams')
      .insert({...})
      .select()
      .single();
    
    expect(error).toBeNull();
    expect(team).toEqual(mockTeam);
  });
});
```

## 🛠️ Test Utilities

### Mock Data Creators
```typescript
import { 
  createMockUser, 
  createMockTeam, 
  createMockEvent,
  createMockSubmission 
} from '@/test/utils/test-helpers';

const user = createMockUser({ email: 'custom@example.com' });
const team = createMockTeam({ name: 'Custom Team' });
const event = createMockEvent({ start_date: '2024-03-01T00:00:00Z' });
```

### Supabase Mocks
```typescript
import { 
  createMockSupabaseClient, 
  mockSupabaseResponse, 
  mockSupabaseError 
} from '@/test/mocks/supabase';

const mockClient = createMockSupabaseClient();
const mockData = mockSupabaseResponse({ id: 'test-id', name: 'Test' });
const mockError = mockSupabaseError('Database connection failed');
```

## 📊 Test Coverage

### Current Coverage Areas
- ✅ **API Routes**: User profiles endpoint
- ✅ **Utility Functions**: Date calculations, class names, filtering
- ✅ **Database Operations**: Teams, events, registrations, submissions
- ✅ **Error Handling**: Input validation, database errors, edge cases
- ✅ **Type Safety**: Interface validation and compatibility

### Coverage Goals
- **API Routes**: 100%
- **Utility Functions**: 100%
- **Database Operations**: 95%+
- **Error Handling**: 100%
- **Edge Cases**: 90%+

## 🚨 Troubleshooting

### Common Issues

#### 1. PostCSS Configuration Error
**Problem**: Tests fail with PostCSS plugin errors
**Solution**: Temporarily rename `postcss.config.mjs` before running tests

#### 2. Mock Not Working
**Problem**: Mocks don't behave as expected
**Solution**: 
- Ensure `vi.mock()` is called before importing the module
- Check mock setup in `beforeEach`
- Verify import paths are correct

#### 3. Test Environment Issues
**Problem**: Environment variables or setup not working
**Solution**:
- Check `src/test/setup.ts` configuration
- Verify environment variables are set
- Ensure Vitest configuration is correct

### Debugging Tests
```bash
# Verbose output
npm run test -- --reporter=verbose

# Watch mode with UI
npm run test:ui

# Debug specific test
# Add debugger; statement in test code
node --inspect-brk node_modules/.bin/vitest
```

## 📝 Writing New Tests

### Test File Structure
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Feature Name', () => {
  beforeEach(() => {
    // Setup for each test
  });

  describe('Specific Functionality', () => {
    it('should do something specific', async () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = await functionToTest(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### Best Practices
1. **Descriptive test names**: Use clear, descriptive test names
2. **Arrange-Act-Assert**: Structure tests with clear sections
3. **Mock external dependencies**: Use mocks for Supabase, HTTP requests, etc.
4. **Test edge cases**: Include tests for error conditions and boundary cases
5. **Isolation**: Each test should be independent and not affect others

## 🔄 Continuous Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run lint
```

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles)
- [Jest/Vitest Matchers](https://vitest.dev/api/expect.html)
- [Mocking Best Practices](https://vitest.dev/guide/mocking.html)

## 🤝 Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Maintain good test coverage
4. Update this documentation if adding new test types or utilities

## 🎉 Summary

Your hackathon app now has a comprehensive testing infrastructure that covers:
- **Unit testing** of utility functions and API routes
- **Integration testing** of database operations
- **Comprehensive mocking** of external dependencies
- **Type safety validation** through tests
- **Error handling and edge case coverage**

The testing setup follows modern best practices and provides a solid foundation for maintaining code quality as your application grows. While there's a current PostCSS configuration issue, the workaround is simple and the testing infrastructure is fully functional.
