/**
 * @fileoverview Brand-Aware Analytics System
 * @module lib/analytics/brand-aware-analytics
 * @author OSS Hero System
 * @version 1.0.0
 */

import { logoManager, DynamicBrandConfig } from '@/lib/branding/logo-manager';
import { Observing } from '@/lib/observability';

export interface BrandAnalyticsEvent {
  /** Event type */
  type: 'page_view' | 'user_action' | 'brand_interaction' | 'performance' | 'error';
  /** Event name */
  name: string;
  /** Event properties */
  properties: Record<string, any>;
  /** Brand context */
  brandContext: {
    brandName: string;
    organizationName: string;
    presetName?: string;
    isCustom: boolean;
    timestamp: string;
  };
  /** User context */
  userContext?: {
    userId?: string;
    sessionId?: string;
    userAgent?: string;
    ip?: string;
  };
}

export interface BrandAnalyticsMetrics {
  /** Brand usage metrics */
  brandUsage: {
    totalEvents: number;
    eventsByBrand: Record<string, number>;
    eventsByPreset: Record<string, number>;
    customBrandEvents: number;
    presetBrandEvents: number;
  };
  /** Performance metrics */
  performance: {
    averageLoadTime: number;
    averageResponseTime: number;
    errorRate: number;
    brandSwitchTime: number;
  };
  /** User engagement metrics */
  engagement: {
    uniqueUsers: number;
    sessionsPerUser: number;
    averageSessionDuration: number;
    brandInteractionRate: number;
  };
  /** Brand-specific insights */
  insights: {
    mostUsedPresets: Array<{ preset: string; count: number }>;
    customBrandAdoption: number;
    brandSwitchFrequency: number;
    brandPerformanceComparison: Array<{ brand: string; performance: number }>;
  };
}

export interface BrandAnalyticsConfig {
  /** Enable brand-aware tracking */
  enabled: boolean;
  /** Track brand interactions */
  trackBrandInteractions: boolean;
  /** Track performance metrics */
  trackPerformance: boolean;
  /** Track user engagement */
  trackEngagement: boolean;
  /** Sample rate for events (0-1) */
  sampleRate: number;
  /** Batch size for sending events */
  batchSize: number;
  /** Flush interval in milliseconds */
  flushInterval: number;
}

/**
 * Brand-Aware Analytics Manager
 */
export class BrandAwareAnalytics {
  private config: BrandAnalyticsConfig;
  private events: BrandAnalyticsEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private brandConfig: DynamicBrandConfig;

  constructor(config: Partial<BrandAnalyticsConfig> = {}) {
    this.config = {
      enabled: true,
      trackBrandInteractions: true,
      trackPerformance: true,
      trackEngagement: true,
      sampleRate: 1.0,
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      ...config,
    };

    this.brandConfig = logoManager.getCurrentConfig();
    
    // Subscribe to brand configuration changes
    logoManager.subscribe((newConfig) => {
      this.brandConfig = newConfig;
      this.trackBrandSwitch(newConfig);
    });

    // Start flush timer
    this.startFlushTimer();
  }

  /**
   * Track a brand-aware analytics event
   */
  track(eventType: BrandAnalyticsEvent['type'], eventName: string, properties: Record<string, any> = {}): void {
    if (!this.config.enabled || Math.random() > this.config.sampleRate) {
      return;
    }

    const event: BrandAnalyticsEvent = {
      type: eventType,
      name: eventName,
      properties: {
        ...properties,
        // Add brand context to all events
        brandName: this.brandConfig.brandName.appName,
        organizationName: this.brandConfig.brandName.organizationName,
        presetName: this.brandConfig.presetName,
        isCustom: this.brandConfig.isCustom,
      },
      brandContext: {
        brandName: this.brandConfig.brandName.appName,
        organizationName: this.brandConfig.brandName.organizationName,
        presetName: this.brandConfig.presetName,
        isCustom: this.brandConfig.isCustom,
        timestamp: new Date().toISOString(),
      },
      userContext: {
        sessionId: this.getSessionId(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      },
    };

    this.events.push(event);

    // Send to observability system
    this.sendToObservability(event);

    // Flush if batch size reached
    if (this.events.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * Track page view with brand context
   */
  trackPageView(page: string, properties: Record<string, any> = {}): void {
    this.track('page_view', 'page_view', {
      page,
      ...properties,
    });
  }

  /**
   * Track user action with brand context
   */
  trackUserAction(action: string, properties: Record<string, any> = {}): void {
    this.track('user_action', 'user_action', {
      action,
      ...properties,
    });
  }

  /**
   * Track brand interaction
   */
  trackBrandInteraction(interaction: string, properties: Record<string, any> = {}): void {
    if (!this.config.trackBrandInteractions) return;

    this.track('brand_interaction', 'brand_interaction', {
      interaction,
      ...properties,
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metric: string, value: number, properties: Record<string, any> = {}): void {
    if (!this.config.trackPerformance) return;

    this.track('performance', 'performance_metric', {
      metric,
      value,
      ...properties,
    });
  }

  /**
   * Track error with brand context
   */
  trackError(error: string, properties: Record<string, any> = {}): void {
    this.track('error', 'error', {
      error,
      ...properties,
    });
  }

  /**
   * Track brand switch event
   */
  private trackBrandSwitch(newConfig: DynamicBrandConfig): void {
    this.track('brand_interaction', 'brand_switch', {
      fromBrand: this.brandConfig.brandName.appName,
      toBrand: newConfig.brandName.appName,
      fromPreset: this.brandConfig.presetName,
      toPreset: newConfig.presetName,
      switchType: newConfig.isCustom ? 'custom' : 'preset',
    });
  }

  /**
   * Send event to observability system
   */
  private sendToObservability(event: BrandAnalyticsEvent): void {
    try {
      // Send to OpenTelemetry
      Observing.recordMetric('brand_analytics_event', 1, {
        event_type: event.type,
        event_name: event.name,
        brand_name: event.brandContext.brandName,
        preset_name: event.brandContext.presetName || 'custom',
        is_custom: event.brandContext.isCustom,
      });

      // Log brand analytics event
      console.log(`[Brand Analytics] ${event.type}: ${event.name}`, {
        brand: event.brandContext.brandName,
        properties: event.properties,
      });
    } catch (error) {
      console.error('Error sending brand analytics to observability:', error);
    }
  }

  /**
   * Flush events to storage/API
   */
  private async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToFlush = [...this.events];
    this.events = [];

    try {
      // In a real implementation, this would send to an analytics service
      await this.sendEventsToAPI(eventsToFlush);
    } catch (error) {
      console.error('Error flushing brand analytics events:', error);
      // Re-add events to queue for retry
      this.events.unshift(...eventsToFlush);
    }
  }

  /**
   * Send events to API
   */
  private async sendEventsToAPI(events: BrandAnalyticsEvent[]): Promise<void> {
    // In a real implementation, this would send to an analytics API
    // For now, we'll just log the events
    console.log(`[Brand Analytics] Flushing ${events.length} events:`, events);
  }

  /**
   * Start flush timer
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * Get session ID
   */
  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server-session';
    
    let sessionId = sessionStorage.getItem('brand-analytics-session-id');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('brand-analytics-session-id', sessionId);
    }
    return sessionId;
  }

  /**
   * Get analytics metrics
   */
  async getMetrics(): Promise<BrandAnalyticsMetrics> {
    // In a real implementation, this would query a database
    // For now, we'll return mock data
    return {
      brandUsage: {
        totalEvents: this.events.length,
        eventsByBrand: {
          [this.brandConfig.brandName.appName]: this.events.length,
        },
        eventsByPreset: {
          [this.brandConfig.presetName || 'custom']: this.events.length,
        },
        customBrandEvents: this.brandConfig.isCustom ? this.events.length : 0,
        presetBrandEvents: this.brandConfig.isCustom ? 0 : this.events.length,
      },
      performance: {
        averageLoadTime: 1200,
        averageResponseTime: 300,
        errorRate: 0.02,
        brandSwitchTime: 150,
      },
      engagement: {
        uniqueUsers: 1,
        sessionsPerUser: 1,
        averageSessionDuration: 300000, // 5 minutes
        brandInteractionRate: 0.15,
      },
      insights: {
        mostUsedPresets: [
          { preset: this.brandConfig.presetName || 'custom', count: this.events.length },
        ],
        customBrandAdoption: this.brandConfig.isCustom ? 1 : 0,
        brandSwitchFrequency: 0.1,
        brandPerformanceComparison: [
          { brand: this.brandConfig.brandName.appName, performance: 95 },
        ],
      },
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<BrandAnalyticsConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.flushInterval) {
      this.startFlushTimer();
    }
  }

  /**
   * Destroy analytics instance
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush();
  }
}

/**
 * Global brand-aware analytics instance
 */
export const brandAnalytics = new BrandAwareAnalytics();

/**
 * React hook for brand-aware analytics
 */
export function useBrandAnalytics() {
  return {
    track: brandAnalytics.track.bind(brandAnalytics),
    trackPageView: brandAnalytics.trackPageView.bind(brandAnalytics),
    trackUserAction: brandAnalytics.trackUserAction.bind(brandAnalytics),
    trackBrandInteraction: brandAnalytics.trackBrandInteraction.bind(brandAnalytics),
    trackPerformance: brandAnalytics.trackPerformance.bind(brandAnalytics),
    trackError: brandAnalytics.trackError.bind(brandAnalytics),
    getMetrics: brandAnalytics.getMetrics.bind(brandAnalytics),
  };
}

/**
 * Utility functions for brand analytics
 */
export const BrandAnalyticsUtils = {
  /**
   * Generate brand analytics report
   */
  generateReport(metrics: BrandAnalyticsMetrics): string {
    return `
# Brand Analytics Report

## Brand Usage
- Total Events: ${metrics.brandUsage.totalEvents}
- Custom Brand Events: ${metrics.brandUsage.customBrandEvents}
- Preset Brand Events: ${metrics.brandUsage.presetBrandEvents}

## Performance
- Average Load Time: ${metrics.performance.averageLoadTime}ms
- Average Response Time: ${metrics.performance.averageResponseTime}ms
- Error Rate: ${(metrics.performance.errorRate * 100).toFixed(2)}%
- Brand Switch Time: ${metrics.performance.brandSwitchTime}ms

## Engagement
- Unique Users: ${metrics.engagement.uniqueUsers}
- Sessions Per User: ${metrics.engagement.sessionsPerUser}
- Average Session Duration: ${Math.round(metrics.engagement.averageSessionDuration / 1000)}s
- Brand Interaction Rate: ${(metrics.engagement.brandInteractionRate * 100).toFixed(2)}%

## Insights
- Most Used Presets: ${metrics.insights.mostUsedPresets.map(p => `${p.preset} (${p.count})`).join(', ')}
- Custom Brand Adoption: ${(metrics.insights.customBrandAdoption * 100).toFixed(2)}%
- Brand Switch Frequency: ${(metrics.insights.brandSwitchFrequency * 100).toFixed(2)}%
    `.trim();
  },

  /**
   * Export analytics data
   */
  exportData(metrics: BrandAnalyticsMetrics): string {
    return JSON.stringify(metrics, null, 2);
  },
};
