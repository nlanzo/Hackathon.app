import { describe, it, expect, beforeEach } from 'vitest';
import { 
  cn, 
  calculateEventStatus, 
  shouldShowOnDashboard, 
  isEventActive 
} from './utils';

describe('Utility Functions', () => {
  let mockNow: Date;

  beforeEach(() => {
    // Mock the current date to ensure consistent test results
    mockNow = new Date('2024-02-02T12:00:00Z');
    vi.useFakeTimers();
    vi.setSystemTime(mockNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('cn (class names utility)', () => {
    it('should combine valid class names', () => {
      expect(cn('class1', 'class2', 'class3')).toBe('class1 class2 class3');
    });

    it('should filter out falsy values', () => {
      expect(cn('class1', null, undefined, false, 'class2', '')).toBe('class1 class2');
    });

    it('should handle empty input', () => {
      expect(cn()).toBe('');
    });

    it('should handle single class', () => {
      expect(cn('single-class')).toBe('single-class');
    });

    it('should handle mixed valid and invalid inputs', () => {
      expect(cn('valid1', null, 'valid2', undefined, 'valid3', false)).toBe('valid1 valid2 valid3');
    });
  });

  describe('calculateEventStatus', () => {
    it('should return "upcoming" for future events', () => {
      const startDate = '2024-03-01T00:00:00Z';
      const endDate = '2024-03-03T00:00:00Z';
      
      expect(calculateEventStatus(startDate, endDate)).toBe('upcoming');
    });

    it('should return "active" for ongoing events', () => {
      const startDate = '2024-02-01T00:00:00Z';
      const endDate = '2024-02-03T00:00:00Z';
      
      expect(calculateEventStatus(startDate, endDate)).toBe('active');
    });

    it('should return "active" when current time equals start time', () => {
      const startDate = '2024-02-02T12:00:00Z';
      const endDate = '2024-02-03T00:00:00Z';
      
      expect(calculateEventStatus(startDate, endDate)).toBe('active');
    });

    it('should return "active" when current time equals end time', () => {
      const startDate = '2024-02-01T00:00:00Z';
      const endDate = '2024-02-02T12:00:00Z';
      
      expect(calculateEventStatus(startDate, endDate)).toBe('active');
    });

    it('should return "completed" for past events', () => {
      const startDate = '2024-01-01T00:00:00Z';
      const endDate = '2024-01-03T00:00:00Z';
      
      expect(calculateEventStatus(startDate, endDate)).toBe('completed');
    });

    it('should handle same start and end date', () => {
      const startDate = '2024-02-02T12:00:00Z';
      const endDate = '2024-02-02T12:00:00Z';
      
      expect(calculateEventStatus(startDate, endDate)).toBe('active');
    });
  });

  describe('shouldShowOnDashboard', () => {
    it('should return true for upcoming events', () => {
      const startDate = '2024-03-01T00:00:00Z';
      const endDate = '2024-03-03T00:00:00Z';
      
      expect(shouldShowOnDashboard(startDate, endDate)).toBe(true);
    });

    it('should return true for ongoing events', () => {
      const startDate = '2024-02-01T00:00:00Z';
      const endDate = '2024-02-03T00:00:00Z';
      
      expect(shouldShowOnDashboard(startDate, endDate)).toBe(true);
    });

    it('should return true for recently completed events (within 1 week)', () => {
      const startDate = '2024-01-25T00:00:00Z';
      const endDate = '2024-01-27T00:00:00Z';
      
      expect(shouldShowOnDashboard(startDate, endDate)).toBe(true);
    });

    it('should return false for old completed events (more than 1 week ago)', () => {
      const startDate = '2024-01-20T00:00:00Z';
      const endDate = '2024-01-22T00:00:00Z';
      
      expect(shouldShowOnDashboard(startDate, endDate)).toBe(false);
    });

    it('should handle edge case of exactly 1 week ago', () => {
      const startDate = '2024-01-26T00:00:00Z';
      const endDate = '2024-01-26T12:00:00Z';
      
      expect(shouldShowOnDashboard(startDate, endDate)).toBe(true);
    });
  });

  describe('isEventActive', () => {
    it('should return true for upcoming events', () => {
      const startDate = '2024-03-01T00:00:00Z';
      const endDate = '2024-03-03T00:00:00Z';
      
      expect(isEventActive(startDate, endDate)).toBe(true);
    });

    it('should return true for ongoing events', () => {
      const startDate = '2024-02-01T00:00:00Z';
      const endDate = '2024-02-03T00:00:00Z';
      
      expect(isEventActive(startDate, endDate)).toBe(true);
    });

    it('should return false for completed events', () => {
      const startDate = '2024-01-01T00:00:00Z';
      const endDate = '2024-01-03T00:00:00Z';
      
      expect(isEventActive(startDate, endDate)).toBe(false);
    });

    it('should return true when current time equals start time', () => {
      const startDate = '2024-02-02T12:00:00Z';
      const endDate = '2024-02-03T00:00:00Z';
      
      expect(isEventActive(startDate, endDate)).toBe(true);
    });

    it('should return true when current time equals end time', () => {
      const startDate = '2024-02-01T00:00:00Z';
      const endDate = '2024-02-02T12:00:00Z';
      
      expect(isEventActive(startDate, endDate)).toBe(true);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle invalid date strings gracefully', () => {
      // These should not throw errors, but may return unexpected results
      expect(() => calculateEventStatus('invalid-date', '2024-02-03T00:00:00Z')).not.toThrow();
      expect(() => shouldShowOnDashboard('invalid-date', '2024-02-03T00:00:00Z')).not.toThrow();
      expect(() => isEventActive('invalid-date', '2024-02-03T00:00:00Z')).not.toThrow();
    });

    it('should handle empty date strings', () => {
      expect(() => calculateEventStatus('', '2024-02-03T00:00:00Z')).not.toThrow();
      expect(() => shouldShowOnDashboard('', '2024-02-03T00:00:00Z')).not.toThrow();
      expect(() => isEventActive('', '2024-02-03T00:00:00Z')).not.toThrow();
    });

    it('should handle null/undefined dates', () => {
      expect(() => calculateEventStatus(null as any, '2024-02-03T00:00:00Z')).not.toThrow();
      expect(() => shouldShowOnDashboard(undefined as any, '2024-02-03T00:00:00Z')).not.toThrow();
      expect(() => isEventActive(null as any, '2024-02-03T00:00:00Z')).not.toThrow();
    });
  });
});
