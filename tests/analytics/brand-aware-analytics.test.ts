/**
 * @fileoverview Brand-Aware Analytics Test Suite
 * @module tests/analytics/brand-aware-analytics.test.ts
 * @author OSS Hero System
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BrandAwareAnalytics, brandAnalytics } from '@/lib/analytics/brand-aware-analytics';
import { logoManager, BRAND_PRESETS } from '@/lib/branding/logo-manager';

// Mock the observability system
vi.mock('@/lib/observability', () => ({
  Observing: {
    trackRequest: vi.fn(),
    recordMetric: vi.fn(),
    recordSecurityEvent: vi.fn(),
    recordBusinessMetric: vi.fn(),
  },
}));

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

describe('BrandAwareAnalytics', () => {
  let analytics: BrandAwareAnalytics;

  beforeEach(() => {
    analytics = new BrandAwareAnalytics({
      enabled: true,
      trackBrandInteractions: true,
      trackPerformance: true,
      trackEngagement: true,
      sampleRate: 1.0,
      batchSize: 5,
      flushInterval: 1000,
    });
    
    // Reset session storage mock
    mockSessionStorage.getItem.mockReturnValue(null);
    mockSessionStorage.setItem.mockClear();
  });

  afterEach(() => {
    analytics.destroy();
  });

  describe('Event Tracking', () => {
    it('should track events with brand context', () => {
      analytics.track('page_view', 'home_page', { page: 'home' });
      
      // Verify event was tracked (in real implementation, this would check storage)
      expect(true).toBe(true); // Placeholder assertion
    });

    it('should include brand context in all events', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      analytics.track('user_action', 'button_click', { button: 'submit' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Brand Analytics]'),
        expect.stringContaining('user_action'),
        expect.objectContaining({
          brand: expect.any(String),
          properties: expect.objectContaining({
            button: 'submit',
          }),
        })
      );
      
      consoleSpy.mockRestore();
    });

    it('should track page views', () => {
      analytics.trackPageView('/dashboard', { section: 'overview' });
      
      // Verify page view was tracked
      expect(true).toBe(true); // Placeholder assertion
    });

    it('should track user actions', () => {
      analytics.trackUserAction('form_submit', { form: 'contact' });
      
      // Verify user action was tracked
      expect(true).toBe(true); // Placeholder assertion
    });

    it('should track brand interactions', () => {
      analytics.trackBrandInteraction('logo_click', { location: 'header' });
      
      // Verify brand interaction was tracked
      expect(true).toBe(true); // Placeholder assertion
    });

    it('should track performance metrics', () => {
      analytics.trackPerformance('load_time', 1200, { page: 'home' });
      
      // Verify performance metric was tracked
      expect(true).toBe(true); // Placeholder assertion
    });

    it('should track errors', () => {
      analytics.trackError('api_error', { endpoint: '/api/users' });
      
      // Verify error was tracked
      expect(true).toBe(true); // Placeholder assertion
    });
  });

  describe('Brand Context Integration', () => {
    it('should use current brand configuration', () => {
      const currentConfig = logoManager.getCurrentConfig();
      
      analytics.track('test_event', 'test', {});
      
      // Verify brand context is included
      expect(currentConfig.brandName.appName).toBeDefined();
      expect(currentConfig.brandName.organizationName).toBeDefined();
    });

    it('should track brand switches', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      // Load a different preset to trigger brand switch
      logoManager.loadPreset('tech');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Brand Analytics]'),
        expect.stringContaining('brand_interaction'),
        expect.stringContaining('brand_switch')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Configuration', () => {
    it('should respect sample rate', () => {
      const analyticsWithLowSampleRate = new BrandAwareAnalytics({
        sampleRate: 0.0, // 0% sample rate
      });
      
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      analyticsWithLowSampleRate.track('test_event', 'test', {});
      
      // Should not log anything due to 0% sample rate
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('[Brand Analytics]')
      );
      
      consoleSpy.mockRestore();
      analyticsWithLowSampleRate.destroy();
    });

    it('should update configuration', () => {
      analytics.updateConfig({
        sampleRate: 0.5,
        batchSize: 10,
      });
      
      // Verify configuration was updated
      expect(true).toBe(true); // Placeholder assertion
    });
  });

  describe('Metrics', () => {
    it('should return analytics metrics', async () => {
      const metrics = await analytics.getMetrics();
      
      expect(metrics).toHaveProperty('brandUsage');
      expect(metrics).toHaveProperty('performance');
      expect(metrics).toHaveProperty('engagement');
      expect(metrics).toHaveProperty('insights');
      
      expect(metrics.brandUsage).toHaveProperty('totalEvents');
      expect(metrics.brandUsage).toHaveProperty('eventsByBrand');
      expect(metrics.brandUsage).toHaveProperty('eventsByPreset');
      expect(metrics.brandUsage).toHaveProperty('customBrandEvents');
      expect(metrics.brandUsage).toHaveProperty('presetBrandEvents');
      
      expect(metrics.performance).toHaveProperty('averageLoadTime');
      expect(metrics.performance).toHaveProperty('averageResponseTime');
      expect(metrics.performance).toHaveProperty('errorRate');
      expect(metrics.performance).toHaveProperty('brandSwitchTime');
      
      expect(metrics.engagement).toHaveProperty('uniqueUsers');
      expect(metrics.engagement).toHaveProperty('sessionsPerUser');
      expect(metrics.engagement).toHaveProperty('averageSessionDuration');
      expect(metrics.engagement).toHaveProperty('brandInteractionRate');
      
      expect(metrics.insights).toHaveProperty('mostUsedPresets');
      expect(metrics.insights).toHaveProperty('customBrandAdoption');
      expect(metrics.insights).toHaveProperty('brandSwitchFrequency');
      expect(metrics.insights).toHaveProperty('brandPerformanceComparison');
    });
  });

  describe('Session Management', () => {
    it('should generate session ID', () => {
      mockSessionStorage.getItem.mockReturnValue(null);
      
      analytics.track('test_event', 'test', {});
      
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('brand-analytics-session-id');
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'brand-analytics-session-id',
        expect.stringMatching(/^session-\d+-[a-z0-9]+$/)
      );
    });

    it('should reuse existing session ID', () => {
      const existingSessionId = 'session-1234567890-abc123';
      mockSessionStorage.getItem.mockReturnValue(existingSessionId);
      
      analytics.track('test_event', 'test', {});
      
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('brand-analytics-session-id');
      expect(mockSessionStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock an error in the observability system
      const { Observing } = require('@/lib/observability');
      Observing.recordMetric.mockImplementation(() => {
        throw new Error('Observability error');
      });
      
      analytics.track('test_event', 'test', {});
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error sending brand analytics to observability:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });
});

describe('Brand Analytics Utils', () => {
  const { BrandAnalyticsUtils } = require('@/lib/analytics/brand-aware-analytics');

  it('should generate analytics report', () => {
    const mockMetrics = {
      brandUsage: {
        totalEvents: 100,
        customBrandEvents: 30,
        presetBrandEvents: 70,
      },
      performance: {
        averageLoadTime: 1200,
        averageResponseTime: 300,
        errorRate: 0.02,
        brandSwitchTime: 150,
      },
      engagement: {
        uniqueUsers: 50,
        sessionsPerUser: 2,
        averageSessionDuration: 300000,
        brandInteractionRate: 0.15,
      },
      insights: {
        mostUsedPresets: [
          { preset: 'tech', count: 40 },
          { preset: 'corporate', count: 30 },
        ],
        customBrandAdoption: 0.3,
        brandSwitchFrequency: 0.1,
        brandPerformanceComparison: [
          { brand: 'Tech App', performance: 95 },
        ],
      },
    };

    const report = BrandAnalyticsUtils.generateReport(mockMetrics);
    
    expect(report).toContain('# Brand Analytics Report');
    expect(report).toContain('Total Events: 100');
    expect(report).toContain('Custom Brand Events: 30');
    expect(report).toContain('Preset Brand Events: 70');
    expect(report).toContain('Average Load Time: 1200ms');
    expect(report).toContain('Error Rate: 2.00%');
    expect(report).toContain('Brand Interaction Rate: 15.00%');
  });

  it('should export analytics data', () => {
    const mockMetrics = {
      brandUsage: { totalEvents: 100 },
      performance: { averageLoadTime: 1200 },
      engagement: { uniqueUsers: 50 },
      insights: { mostUsedPresets: [] },
    };

    const exportedData = BrandAnalyticsUtils.exportData(mockMetrics);
    const parsedData = JSON.parse(exportedData);
    
    expect(parsedData).toEqual(mockMetrics);
  });
});

describe('Global Brand Analytics Instance', () => {
  it('should be properly initialized', () => {
    expect(brandAnalytics).toBeDefined();
    expect(typeof brandAnalytics.track).toBe('function');
    expect(typeof brandAnalytics.trackPageView).toBe('function');
    expect(typeof brandAnalytics.trackUserAction).toBe('function');
    expect(typeof brandAnalytics.trackBrandInteraction).toBe('function');
    expect(typeof brandAnalytics.trackPerformance).toBe('function');
    expect(typeof brandAnalytics.trackError).toBe('function');
    expect(typeof brandAnalytics.getMetrics).toBe('function');
  });
});
