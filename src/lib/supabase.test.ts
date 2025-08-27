import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createClient } from './supabase';

// Mock the environment variables
const mockEnv = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
};

describe('Supabase Client', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Set up mock environment variables
    process.env = { ...originalEnv, ...mockEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('Environment Variables', () => {
    it('should create client when environment variables are present', () => {
      expect(() => {
        const client = createClient();
        expect(client).toBeDefined();
        expect(typeof client).toBe('object');
      }).not.toThrow();
    });

    it('should have expected client properties', () => {
      const client = createClient();
      
      // Check if client has basic Supabase client properties
      expect(client).toHaveProperty('from');
      expect(client).toHaveProperty('auth');
      expect(typeof client.from).toBe('function');
      expect(typeof client.auth).toBe('object');
    });

    it('should return the same client instance on multiple calls (singleton)', () => {
      const client1 = createClient();
      const client2 = createClient();
      
      expect(client1).toBe(client2);
    });
  });

  describe('Client Functionality', () => {
    it('should be able to create a client instance', () => {
      const client = createClient();
      expect(client).toBeDefined();
      expect(typeof client).toBe('object');
    });

    it('should have working from method', () => {
      const client = createClient();
      expect(typeof client.from).toBe('function');
      
      // Test that from method can be called (even if it returns undefined in tests)
      expect(() => client.from('test_table')).not.toThrow();
    });

    it('should have working auth property', () => {
      const client = createClient();
      expect(client.auth).toBeDefined();
      expect(typeof client.auth).toBe('object');
    });
  });
});
