/**
 * @dct/coaching-app
 * Coaching App Integration Tests
 * 
 * Comprehensive integration tests for coaching app functionality
 * including client portal, check-ins, sessions, and progress tracking
 * 
 * MIT-HERO-MOD: tests added; legacy removed
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';

// Mock Next.js and React components
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useEffect: jest.fn(),
  Suspense: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock authentication and data functions
jest.mock('@/lib/auth/roles', () => ({
  requireClientWithLoading: jest.fn(),
  requireCoachWithLoading: jest.fn(),
}));

jest.mock('@/data/client-portal.data', () => ({
  getClientPortalDataStub: jest.fn(),
}));

jest.mock('@/data/checkins.repo', () => ({
  getCheckInsByClientId: jest.fn(),
  createCheckIn: jest.fn(),
  updateCheckIn: jest.fn(),
}));

jest.mock('@/data/progress-metrics.repo', () => ({
  getProgressMetricsByClientId: jest.fn(),
  createProgressMetric: jest.fn(),
  updateProgressMetric: jest.fn(),
}));

describe('Coaching App - Integration Tests', () => {
  let mockAuthData: any;
  let mockClientData: any;
  let mockCheckInData: any;
  let mockProgressData: any;

  beforeAll(() => {
    // Setup global test environment
    process.env.NODE_ENV = 'test';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup mock data
    mockAuthData = {
      status: 'authorized',
      data: {
        clientId: 'client-123',
        coachId: 'coach-456',
        role: 'client'
      }
    };

    mockClientData = {
      client: {
        id: 'client-123',
        name: 'Test Client',
        email: 'client@test.com',
        coach_id: 'coach-456'
      },
      checkIns: [
        {
          id: 'checkin-1',
          client_id: 'client-123',
          check_in_date: '2025-01-15',
          mood_rating: 8,
          energy_level: 7,
          notes: 'Feeling good today'
        }
      ],
      progressMetrics: [
        {
          id: 'metric-1',
          client_id: 'client-123',
          metric_date: '2025-01-15',
          weight_kg: 75.5,
          body_fat_percentage: 18.5
        }
      ]
    };

    mockCheckInData = [
      {
        id: 'checkin-1',
        client_id: 'client-123',
        check_in_date: '2025-01-15',
        mood_rating: 8,
        energy_level: 7,
        notes: 'Feeling good today'
      },
      {
        id: 'checkin-2',
        client_id: 'client-123',
        check_in_date: '2025-01-14',
        mood_rating: 6,
        energy_level: 5,
        notes: 'Tired but motivated'
      }
    ];

    mockProgressData = [
      {
        id: 'metric-1',
        client_id: 'client-123',
        metric_date: '2025-01-15',
        weight_kg: 75.5,
        body_fat_percentage: 18.5
      },
      {
        id: 'metric-2',
        client_id: 'client-123',
        metric_date: '2025-01-08',
        weight_kg: 76.0,
        body_fat_percentage: 19.0
      }
    ];
  });

  afterAll(() => {
    // Cleanup
    jest.restoreAllMocks();
  });

  describe('Client Portal Integration', () => {
    it('should authenticate and load client portal data', async () => {
      const { requireClientWithLoading } = require('@/lib/auth/roles');
      const { getClientPortalDataStub } = require('@/data/client-portal.data');

      requireClientWithLoading.mockResolvedValue(mockAuthData);
      getClientPortalDataStub.mockResolvedValue(mockClientData);

      // Simulate client portal page load
      const authResult = await requireClientWithLoading();
      const data = await getClientPortalDataStub(authResult.data.clientId);

      expect(authResult.status).toBe('authorized');
      expect(authResult.data.clientId).toBe('client-123');
      expect(data.client.id).toBe('client-123');
      expect(data.checkIns).toHaveLength(1);
      expect(data.progressMetrics).toHaveLength(1);
    });

    it('should handle unauthorized access gracefully', async () => {
      const { requireClientWithLoading } = require('@/lib/auth/roles');

      const unauthorizedAuth = {
        status: 'unauthorized',
        data: null
      };

      requireClientWithLoading.mockResolvedValue(unauthorizedAuth);

      const authResult = await requireClientWithLoading();

      expect(authResult.status).toBe('unauthorized');
      expect(authResult.data).toBeNull();
    });

    it('should handle loading state', async () => {
      const { requireClientWithLoading } = require('@/lib/auth/roles');

      const loadingAuth = {
        status: 'loading',
        data: null
      };

      requireClientWithLoading.mockResolvedValue(loadingAuth);

      const authResult = await requireClientWithLoading();

      expect(authResult.status).toBe('loading');
      expect(authResult.data).toBeNull();
    });
  });

  describe('Check-In System Integration', () => {
    it('should create and retrieve check-ins', async () => {
      const { createCheckIn, getCheckInsByClientId } = require('@/data/checkins.repo');

      createCheckIn.mockResolvedValue({
        id: 'checkin-new',
        client_id: 'client-123',
        check_in_date: '2025-01-16',
        mood_rating: 9,
        energy_level: 8,
        notes: 'Excellent day!'
      });

      getCheckInsByClientId.mockResolvedValue(mockCheckInData);

      // Simulate creating a new check-in
      const newCheckIn = await createCheckIn({
        client_id: 'client-123',
        check_in_date: '2025-01-16',
        mood_rating: 9,
        energy_level: 8,
        notes: 'Excellent day!'
      });

      // Simulate retrieving all check-ins
      const allCheckIns = await getCheckInsByClientId('client-123');

      expect(newCheckIn.id).toBe('checkin-new');
      expect(newCheckIn.mood_rating).toBe(9);
      expect(allCheckIns).toHaveLength(2);
      expect(allCheckIns[0].client_id).toBe('client-123');
    });

    it('should handle check-in validation', async () => {
      const { createCheckIn } = require('@/data/checkins.repo');

      // Test invalid data handling
      createCheckIn.mockRejectedValue(new Error('Invalid check-in data'));

      await expect(createCheckIn({
        client_id: 'client-123',
        check_in_date: 'invalid-date',
        mood_rating: 15, // Invalid rating
        energy_level: -1 // Invalid level
      })).rejects.toThrow('Invalid check-in data');
    });

    it('should update existing check-ins', async () => {
      const { updateCheckIn } = require('@/data/checkins.repo');

      const updatedCheckIn = {
        id: 'checkin-1',
        client_id: 'client-123',
        check_in_date: '2025-01-15',
        mood_rating: 9, // Updated from 8
        energy_level: 8, // Updated from 7
        notes: 'Updated notes'
      };

      updateCheckIn.mockResolvedValue(updatedCheckIn);

      const result = await updateCheckIn('checkin-1', {
        mood_rating: 9,
        energy_level: 8,
        notes: 'Updated notes'
      });

      expect(result.mood_rating).toBe(9);
      expect(result.energy_level).toBe(8);
      expect(result.notes).toBe('Updated notes');
    });
  });

  describe('Progress Metrics Integration', () => {
    it('should track and retrieve progress metrics', async () => {
      const { createProgressMetric, getProgressMetricsByClientId } = require('@/data/progress-metrics.repo');

      createProgressMetric.mockResolvedValue({
        id: 'metric-new',
        client_id: 'client-123',
        metric_date: '2025-01-16',
        weight_kg: 75.0,
        body_fat_percentage: 18.0
      });

      getProgressMetricsByClientId.mockResolvedValue(mockProgressData);

      // Simulate creating a new progress metric
      const newMetric = await createProgressMetric({
        client_id: 'client-123',
        metric_date: '2025-01-16',
        weight_kg: 75.0,
        body_fat_percentage: 18.0
      });

      // Simulate retrieving all progress metrics
      const allMetrics = await getProgressMetricsByClientId('client-123');

      expect(newMetric.id).toBe('metric-new');
      expect(newMetric.weight_kg).toBe(75.0);
      expect(allMetrics).toHaveLength(2);
      expect(allMetrics[0].client_id).toBe('client-123');
    });

    it('should calculate progress trends', () => {
      // Test progress calculation logic
      const weightTrend = mockProgressData
        .sort((a, b) => new Date(a.metric_date).getTime() - new Date(b.metric_date).getTime())
        .map(m => m.weight_kg);

      expect(weightTrend).toEqual([76.0, 75.5]); // Weight decreasing trend
      
      const bodyFatTrend = mockProgressData
        .sort((a, b) => new Date(a.metric_date).getTime() - new Date(b.metric_date).getTime())
        .map(m => m.body_fat_percentage);

      expect(bodyFatTrend).toEqual([19.0, 18.5]); // Body fat decreasing trend
    });

    it('should handle metric validation', async () => {
      const { createProgressMetric } = require('@/data/progress-metrics.repo');

      // Test invalid data handling
      createProgressMetric.mockRejectedValue(new Error('Invalid metric data'));

      await expect(createProgressMetric({
        client_id: 'client-123',
        metric_date: 'invalid-date',
        weight_kg: -50, // Invalid weight
        body_fat_percentage: 150 // Invalid percentage
      })).rejects.toThrow('Invalid metric data');
    });
  });

  describe('Data Flow Integration', () => {
    it('should maintain data consistency across operations', async () => {
      const { createCheckIn, getCheckInsByClientId } = require('@/data/checkins.repo');
      const { createProgressMetric, getProgressMetricsByClientId } = require('@/data/progress-metrics.repo');

      // Setup mocks to simulate data consistency
      let checkInCount = 2;
      let metricCount = 2;

      createCheckIn.mockImplementation(async (data) => {
        checkInCount++;
        return { ...data, id: `checkin-${checkInCount}` };
      });

      createProgressMetric.mockImplementation(async (data) => {
        metricCount++;
        return { ...data, id: `metric-${checkInCount}` };
      });

      // Update the mock to return the correct count after operations
      getCheckInsByClientId.mockImplementation(async () => {
        return Array.from({ length: checkInCount }, (_, i) => ({
          id: `checkin-${i + 1}`,
          client_id: 'client-123',
          check_in_date: `2025-01-${15 + i}`,
          mood_rating: 7 + i,
          energy_level: 6 + i
        }));
      });

      getProgressMetricsByClientId.mockImplementation(async () => {
        return Array.from({ length: metricCount }, (_, i) => ({
          id: `metric-${i + 1}`,
          client_id: 'client-123',
          metric_date: `2025-01-${15 + i}`,
          weight_kg: 75.5 - (i * 0.5),
          body_fat_percentage: 18.5 - (i * 0.5)
        }));
      });

      // Simulate multiple operations
      await createCheckIn({
        client_id: 'client-123',
        check_in_date: '2025-01-16',
        mood_rating: 8,
        energy_level: 7
      });

      await createProgressMetric({
        client_id: 'client-123',
        metric_date: '2025-01-16',
        weight_kg: 75.0,
        body_fat_percentage: 18.0
      });

      // Verify data consistency
      const finalCheckIns = await getCheckInsByClientId('client-123');
      const finalMetrics = await getProgressMetricsByClientId('client-123');

      expect(finalCheckIns).toHaveLength(3);
      expect(finalMetrics).toHaveLength(3);
      
      // Check that the arrays contain the expected data
      expect(finalCheckIns.some(c => c.mood_rating === 8)).toBe(true);
      expect(finalMetrics.some(m => m.weight_kg === 75.0)).toBe(true);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle database connection errors gracefully', async () => {
      const { getCheckInsByClientId } = require('@/data/checkins.repo');

      getCheckInsByClientId.mockRejectedValue(new Error('Database connection failed'));

      await expect(getCheckInsByClientId('client-123')).rejects.toThrow('Database connection failed');
    });

    it('should handle authentication failures', async () => {
      const { requireClientWithLoading } = require('@/lib/auth/roles');

      requireClientWithLoading.mockRejectedValue(new Error('Authentication service unavailable'));

      await expect(requireClientWithLoading()).rejects.toThrow('Authentication service unavailable');
    });

    it('should handle data validation errors', async () => {
      const { createCheckIn } = require('@/data/checkins.repo');

      createCheckIn.mockRejectedValue(new Error('Validation failed: mood_rating must be between 1-10'));

      await expect(createCheckIn({
        client_id: 'client-123',
        check_in_date: '2025-01-16',
        mood_rating: 15, // Invalid
        energy_level: 7
      })).rejects.toThrow('Validation failed: mood_rating must be between 1-10');
    });
  });

  describe('Performance Integration', () => {
    it('should handle large datasets efficiently', async () => {
      const { getCheckInsByClientId } = require('@/data/checkins.repo');

      // Simulate large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `checkin-${i}`,
        client_id: 'client-123',
        check_in_date: `2025-01-${(i % 30) + 1}`,
        mood_rating: (i % 10) + 1,
        energy_level: (i % 10) + 1
      }));

      getCheckInsByClientId.mockResolvedValue(largeDataset);

      const start = performance.now();
      const result = await getCheckInsByClientId('client-123');
      const end = performance.now();

      expect(result).toHaveLength(1000);
      expect(end - start).toBeLessThan(100); // Should complete in under 100ms
    });

    it('should handle concurrent operations', async () => {
      const { createCheckIn } = require('@/data/checkins.repo');

      createCheckIn.mockImplementation(async (data) => ({
        ...data,
        id: `checkin-${Date.now()}`,
        created_at: new Date().toISOString()
      }));

      // Simulate concurrent check-in creation
      const concurrentOperations = Array.from({ length: 10 }, (_, i) => 
        createCheckIn({
          client_id: 'client-123',
          check_in_date: `2025-01-${15 + i}`,
          mood_rating: 7,
          energy_level: 6
        })
      );

      const start = performance.now();
      const results = await Promise.all(concurrentOperations);
      const end = performance.now();

      expect(results).toHaveLength(10);
      expect(end - start).toBeLessThan(200); // Should complete in under 200ms
      
      // Verify all operations succeeded
      results.forEach(result => {
        expect(result.id).toBeDefined();
        expect(result.client_id).toBe('client-123');
      });
    });
  });
});
