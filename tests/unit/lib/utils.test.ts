/**
 * @fileoverview Unit Tests for Core Utilities
 * @description Unit tests for lib/utils.ts functions
 * @version 1.0.0
 * @author SOS Operation Phase 3 Task 15
 */

import { cn, debounce, applyPagination, getWeekStartDate, getWeekStartDateForDate } from '@lib/utils';

describe('Core Utilities', () => {
  describe('cn function', () => {
    it('should combine class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
      expect(cn('class1', null, 'class2')).toBe('class1 class2');
      expect(cn('class1', undefined, 'class2')).toBe('class1 class2');
      expect(cn('class1', false && 'class2', 'class3')).toBe('class1 class3');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const isDisabled = false;
      
      const result = cn(
        'base-class',
        isActive && 'active',
        isDisabled && 'disabled'
      );
      
      expect(result).toBe('base-class active');
    });

    it('should handle arrays and objects', () => {
      const classes = ['class1', 'class2'];
      const conditionalClasses = { 'conditional': true, 'not-conditional': false };
      
      const result = cn('base', classes, conditionalClasses);
      expect(result).toBe('base class1 class2 conditional');
    });

    it('should merge Tailwind classes correctly', () => {
      const result = cn('px-2 py-1', 'px-4');
      expect(result).toBe('py-1 px-4'); // px-2 should be overridden by px-4
    });
  });

  describe('debounce function', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should debounce function calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      // Call multiple times quickly
      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(mockFn).not.toHaveBeenCalled();

      // Fast forward time
      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments to debounced function', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('arg1', 'arg2');
      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should reset timer on new calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      jest.advanceTimersByTime(50); // Half way through
      debouncedFn(); // Reset timer
      jest.advanceTimersByTime(50); // Still shouldn't call

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(50); // Now it should call

      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('applyPagination function', () => {
    it('should apply pagination correctly', async () => {
      const mockQuery = {
        count: jest.fn().mockResolvedValue({ count: 100, error: null }),
        range: jest.fn().mockResolvedValue({ 
          data: [{ id: 1 }, { id: 2 }], 
          error: null 
        }),
      };

      const result = await applyPagination(mockQuery, 1, 10);

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(100);
      expect(mockQuery.count).toHaveBeenCalled();
      expect(mockQuery.range).toHaveBeenCalledWith(0, 9);
    });

    it('should handle count errors', async () => {
      const mockQuery = {
        count: jest.fn().mockResolvedValue({ count: null, error: 'Count error' }),
        range: jest.fn(),
      };

      const result = await applyPagination(mockQuery, 1, 10);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(mockQuery.range).not.toHaveBeenCalled();
    });

    it('should handle data errors', async () => {
      const mockQuery = {
        count: jest.fn().mockResolvedValue({ count: 100, error: null }),
        range: jest.fn().mockResolvedValue({ data: null, error: 'Data error' }),
      };

      const result = await applyPagination(mockQuery, 1, 10);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(100);
    });

    it('should calculate correct offset for different pages', async () => {
      const mockQuery = {
        count: jest.fn().mockResolvedValue({ count: 100, error: null }),
        range: jest.fn().mockResolvedValue({ data: [], error: null }),
      };

      await applyPagination(mockQuery, 2, 10);
      expect(mockQuery.range).toHaveBeenCalledWith(10, 19);

      await applyPagination(mockQuery, 3, 10);
      expect(mockQuery.range).toHaveBeenCalledWith(20, 29);
    });

    it('should handle exceptions gracefully', async () => {
      const mockQuery = {
        count: jest.fn().mockRejectedValue(new Error('Unexpected error')),
        range: jest.fn(),
      };

      const result = await applyPagination(mockQuery, 1, 10);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('getWeekStartDate function', () => {
    it('should return Monday of current week', () => {
      // Mock current date to a known day of the week
      const mockDate = new Date('2023-01-15T00:00:00.000Z'); // Sunday UTC
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);

      const result = getWeekStartDate();
      const expectedDate = new Date('2023-01-09T05:00:00.000Z'); // Monday with timezone offset

      expect(result).toBe(expectedDate.toISOString());

      jest.useRealTimers();
    });

    it('should handle different days of the week', () => {
      // Test with Wednesday
      const mockDate = new Date('2023-01-18T00:00:00.000Z'); // Wednesday UTC
      jest.useFakeTimers();
      jest.setSystemTime(mockDate);

      const result = getWeekStartDate();
      const expectedDate = new Date('2023-01-16T05:00:00.000Z'); // Monday with timezone offset

      expect(result).toBe(expectedDate.toISOString());

      jest.useRealTimers();
    });
  });

  describe('getWeekStartDateForDate function', () => {
    it('should return Monday of the week containing the given date', () => {
      const testDate = new Date('2023-01-15T00:00:00.000Z'); // Sunday UTC
      const result = getWeekStartDateForDate(testDate);
      const expectedDate = new Date('2023-01-09T05:00:00.000Z'); // Monday with timezone offset

      expect(result).toBe(expectedDate.toISOString());
    });

    it('should handle dates in the middle of the week', () => {
      const testDate = new Date('2023-01-18T00:00:00.000Z'); // Wednesday UTC
      const result = getWeekStartDateForDate(testDate);
      const expectedDate = new Date('2023-01-16T05:00:00.000Z'); // Monday with timezone offset

      expect(result).toBe(expectedDate.toISOString());
    });

    it('should handle dates at the end of the week', () => {
      const testDate = new Date('2023-01-21T00:00:00.000Z'); // Saturday UTC
      const result = getWeekStartDateForDate(testDate);
      const expectedDate = new Date('2023-01-16T05:00:00.000Z'); // Monday with timezone offset

      expect(result).toBe(expectedDate.toISOString());
    });

    it('should handle dates at the beginning of the week', () => {
      const testDate = new Date('2023-01-16T00:00:00.000Z'); // Monday UTC
      const result = getWeekStartDateForDate(testDate);
      const expectedDate = new Date('2023-01-09T05:00:00.000Z'); // Previous Monday with timezone offset

      expect(result).toBe(expectedDate.toISOString());
    });
  });
});
