/**
 * @file Template Usage Tracking System
 * @description Privacy-compliant template usage tracking with comprehensive analytics and insights
 * @author AI Assistant
 * @created 2025-09-20
 */

import { z } from 'zod';

// Type definitions
export interface UsageEvent {
  id: string;
  templateId: string;
  templateName: string;
  category: string;
  eventType: 'view' | 'download' | 'install' | 'uninstall' | 'configure' | 'error' | 'share' | 'favorite';
  timestamp: Date;
  userId?: string; // Optional for privacy
  sessionId: string;
  metadata?: {
    source?: 'marketplace' | 'admin' | 'api' | 'direct';
    referrer?: string;
    userAgent?: string;
    ipAddress?: string; // Hashed for privacy
    location?: {
      country?: string;
      region?: string;
      city?: string; // Optional, may be omitted for privacy
    };
    device?: {
      type: 'mobile' | 'tablet' | 'desktop';
      os?: string;
      browser?: string;
    };
    templateVersion?: string;
    installationContext?: {
      projectType?: string;
      teamSize?: number;
      organizationType?: 'individual' | 'startup' | 'smb' | 'enterprise';
    };
  };
  privacyLevel: 'anonymous' | 'pseudonymous' | 'identified';
  consentGiven: boolean;
}

export interface UsageOverview {
  totalEvents: number;
  totalDownloads: number;
  totalViews: number;
  totalInstalls: number;
  uniqueSessions: number;
  uniqueUsers: number;
  growthRate: number; // Percentage change from previous period
  conversionRate: number; // Views to downloads
  installationSuccessRate: number;
  averageSessionDuration: number;
  topTemplates: Array<{
    templateId: string;
    templateName: string;
    category: string;
    views: number;
    downloads: number;
    installs: number;
    conversionRate: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    template: string;
    timestamp: string;
    details: string;
  }>;
  userSegments: Array<{
    segment: string;
    count: number;
    percentage: number;
    engagementScore: number;
  }>;
  geographicDistribution: Array<{
    country: string;
    count: number;
    percentage: number;
  }>;
}

export interface UsageAnalytics {
  templateId: string;
  templateName: string;
  category: string;
  totalViews: number;
  totalDownloads: number;
  totalInstalls: number;
  uniqueViewers: number;
  uniqueDownloaders: number;
  conversionRate: number;
  installationSuccessRate: number;
  averageTimeToInstall: number; // Minutes from download to install
  retentionRate: number; // Percentage still using after 30 days
  userFeedback: {
    averageRating: number;
    totalRatings: number;
    favoriteCount: number;
    shareCount: number;
  };
  usagePatterns: {
    peakUsageHours: number[];
    peakUsageDays: string[];
    seasonalTrends: Array<{
      month: string;
      usage: number;
      trend: 'up' | 'down' | 'stable';
    }>;
  };
  userJourney: Array<{
    step: string;
    count: number;
    dropoffRate: number;
    averageTime: number;
  }>;
  cohortAnalysis: Array<{
    cohort: string;
    size: number;
    retention: {
      day1: number;
      day7: number;
      day30: number;
    };
  }>;
}

export interface PrivacySettings {
  anonymizeIpAddresses: boolean;
  excludePersonalData: boolean;
  dataRetentionDays: number;
  consentRequired: boolean;
  allowOptOut: boolean;
  enableCookies: boolean;
  shareWithThirdParties: boolean;
  enableLocationTracking: boolean;
}

// Validation schemas
const UsageEventSchema = z.object({
  id: z.string(),
  templateId: z.string(),
  templateName: z.string(),
  category: z.string(),
  eventType: z.enum(['view', 'download', 'install', 'uninstall', 'configure', 'error', 'share', 'favorite']),
  timestamp: z.date(),
  userId: z.string().optional(),
  sessionId: z.string(),
  metadata: z.object({
    source: z.enum(['marketplace', 'admin', 'api', 'direct']).optional(),
    referrer: z.string().optional(),
    userAgent: z.string().optional(),
    ipAddress: z.string().optional(),
    location: z.object({
      country: z.string().optional(),
      region: z.string().optional(),
      city: z.string().optional(),
    }).optional(),
    device: z.object({
      type: z.enum(['mobile', 'tablet', 'desktop']),
      os: z.string().optional(),
      browser: z.string().optional(),
    }).optional(),
    templateVersion: z.string().optional(),
    installationContext: z.object({
      projectType: z.string().optional(),
      teamSize: z.number().optional(),
      organizationType: z.enum(['individual', 'startup', 'smb', 'enterprise']).optional(),
    }).optional(),
  }).optional(),
  privacyLevel: z.enum(['anonymous', 'pseudonymous', 'identified']),
  consentGiven: z.boolean(),
});

/**
 * Template Usage Tracking System
 * Provides privacy-compliant usage tracking with comprehensive analytics
 */
class UsageTrackingService {
  private events: UsageEvent[] = [];
  private privacySettings: PrivacySettings = {
    anonymizeIpAddresses: true,
    excludePersonalData: false,
    dataRetentionDays: 365,
    consentRequired: true,
    allowOptOut: true,
    enableCookies: false, // GDPR compliant by default
    shareWithThirdParties: false,
    enableLocationTracking: false,
  };
  private cache = new Map<string, any>();
  private cacheTimeout = 10 * 60 * 1000; // 10 minutes
  private consentedUsers = new Set<string>();
  private optedOutUsers = new Set<string>();

  /**
   * Track a usage event with privacy compliance
   */
  async trackEvent(event: Omit<UsageEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      // Check privacy compliance
      if (!this.isTrackingAllowed(event)) {
        console.log('Tracking not allowed for this event due to privacy settings');
        return;
      }

      // Apply privacy filters
      const sanitizedEvent = this.sanitizeEvent(event);

      const fullEvent: UsageEvent = {
        ...sanitizedEvent,
        id: this.generateId(),
        timestamp: new Date(),
      };

      // Validate event
      UsageEventSchema.parse(fullEvent);

      // Store event
      this.events.push(fullEvent);

      // Clean up old events based on retention policy
      await this.cleanupOldEvents();

      // Clear relevant caches
      this.clearCacheByTemplate(event.templateId);

      // Trigger real-time updates
      await this.triggerRealTimeUpdate(fullEvent);
    } catch (error) {
      console.error('Failed to track usage event:', error);
      // Don't throw error to avoid breaking user experience
    }
  }

  /**
   * Get usage overview with privacy-compliant analytics
   */
  async getUsageOverview(timeRange: string = '7d'): Promise<UsageOverview> {
    const cacheKey = `usage_overview_${timeRange}`;
    
    // Check cache
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const filteredEvents = this.filterEventsByTimeRange(timeRange);
      
      // Calculate basic metrics
      const totalEvents = filteredEvents.length;
      const downloads = filteredEvents.filter(e => e.eventType === 'download');
      const views = filteredEvents.filter(e => e.eventType === 'view');
      const installs = filteredEvents.filter(e => e.eventType === 'install');
      
      const uniqueSessions = new Set(filteredEvents.map(e => e.sessionId)).size;
      const uniqueUsers = new Set(
        filteredEvents.map(e => e.userId).filter(Boolean)
      ).size;

      // Calculate growth rate
      const growthRate = await this.calculateGrowthRate(timeRange);

      // Calculate conversion rates
      const conversionRate = views.length > 0 ? (downloads.length / views.length) * 100 : 0;
      const installationSuccessRate = downloads.length > 0 ? (installs.length / downloads.length) * 100 : 0;

      // Calculate average session duration
      const averageSessionDuration = await this.calculateAverageSessionDuration(filteredEvents);

      // Get top templates
      const topTemplates = await this.getTopTemplates(filteredEvents, 10);

      // Get recent activity
      const recentActivity = await this.getRecentActivity(filteredEvents, 20);

      // Get user segments (privacy-compliant)
      const userSegments = await this.getUserSegments(filteredEvents);

      // Get geographic distribution (privacy-compliant)
      const geographicDistribution = await this.getGeographicDistribution(filteredEvents);

      const overview: UsageOverview = {
        totalEvents,
        totalDownloads: downloads.length,
        totalViews: views.length,
        totalInstalls: installs.length,
        uniqueSessions,
        uniqueUsers,
        growthRate,
        conversionRate,
        installationSuccessRate,
        averageSessionDuration,
        topTemplates,
        recentActivity,
        userSegments,
        geographicDistribution,
      };

      // Cache result
      this.setCache(cacheKey, overview);

      return overview;
    } catch (error) {
      console.error('Failed to get usage overview:', error);
      throw new Error('Failed to get usage overview');
    }
  }

  /**
   * Get detailed usage analytics for a template
   */
  async getTemplateUsageAnalytics(templateId: string, timeRange: string = '30d'): Promise<UsageAnalytics> {
    const cacheKey = `usage_analytics_${templateId}_${timeRange}`;
    
    // Check cache
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const templateEvents = this.events.filter(e => 
        e.templateId === templateId && 
        this.isWithinTimeRange(e.timestamp, timeRange)
      );

      if (templateEvents.length === 0) {
        throw new Error('Template not found or no usage data available');
      }

      const templateName = templateEvents[0].templateName;
      const category = templateEvents[0].category;

      // Calculate basic metrics
      const views = templateEvents.filter(e => e.eventType === 'view');
      const downloads = templateEvents.filter(e => e.eventType === 'download');
      const installs = templateEvents.filter(e => e.eventType === 'install');

      const uniqueViewers = new Set(views.map(e => e.sessionId)).size;
      const uniqueDownloaders = new Set(downloads.map(e => e.sessionId)).size;

      const conversionRate = views.length > 0 ? (downloads.length / views.length) * 100 : 0;
      const installationSuccessRate = downloads.length > 0 ? (installs.length / downloads.length) * 100 : 0;

      // Calculate time to install
      const averageTimeToInstall = await this.calculateAverageTimeToInstall(templateEvents);

      // Calculate retention rate
      const retentionRate = await this.calculateRetentionRate(templateId, timeRange);

      // Get user feedback
      const userFeedback = await this.getUserFeedback(templateEvents);

      // Get usage patterns
      const usagePatterns = await this.getUsagePatterns(templateEvents);

      // Get user journey
      const userJourney = await this.getUserJourney(templateEvents);

      // Get cohort analysis
      const cohortAnalysis = await this.getCohortAnalysis(templateId, timeRange);

      const analytics: UsageAnalytics = {
        templateId,
        templateName,
        category,
        totalViews: views.length,
        totalDownloads: downloads.length,
        totalInstalls: installs.length,
        uniqueViewers,
        uniqueDownloaders,
        conversionRate,
        installationSuccessRate,
        averageTimeToInstall,
        retentionRate,
        userFeedback,
        usagePatterns,
        userJourney,
        cohortAnalysis,
      };

      // Cache result
      this.setCache(cacheKey, analytics);

      return analytics;
    } catch (error) {
      console.error('Failed to get template usage analytics:', error);
      throw new Error('Failed to get template usage analytics');
    }
  }

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(settings: Partial<PrivacySettings>): Promise<void> {
    this.privacySettings = { ...this.privacySettings, ...settings };
    
    // Clear caches as privacy settings affect data processing
    this.cache.clear();

    // Re-process existing events if needed
    if (settings.anonymizeIpAddresses || settings.excludePersonalData) {
      await this.reprocessEventsForPrivacy();
    }
  }

  /**
   * Handle user consent
   */
  async giveConsent(userId: string): Promise<void> {
    this.consentedUsers.add(userId);
    this.optedOutUsers.delete(userId);
  }

  /**
   * Handle user opt-out
   */
  async optOut(userId: string): Promise<void> {
    this.optedOutUsers.add(userId);
    this.consentedUsers.delete(userId);
    
    // Remove or anonymize existing data for this user
    await this.anonymizeUserData(userId);
  }

  /**
   * Check if tracking is allowed for an event
   */
  private isTrackingAllowed(event: Omit<UsageEvent, 'id' | 'timestamp'>): boolean {
    // Check if user has opted out
    if (event.userId && this.optedOutUsers.has(event.userId)) {
      return false;
    }

    // Check consent requirements
    if (this.privacySettings.consentRequired && !event.consentGiven) {
      return false;
    }

    // Check if user consent is given (for identified users)
    if (event.privacyLevel === 'identified' && event.userId) {
      if (!this.consentedUsers.has(event.userId)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Sanitize event data based on privacy settings
   */
  private sanitizeEvent(event: Omit<UsageEvent, 'id' | 'timestamp'>): Omit<UsageEvent, 'id' | 'timestamp'> {
    const sanitized = { ...event };

    // Anonymize IP addresses
    if (this.privacySettings.anonymizeIpAddresses && sanitized.metadata?.ipAddress) {
      sanitized.metadata.ipAddress = this.hashIpAddress(sanitized.metadata.ipAddress);
    }

    // Exclude personal data
    if (this.privacySettings.excludePersonalData) {
      delete sanitized.userId;
      if (sanitized.metadata) {
        delete sanitized.metadata.ipAddress;
        if (sanitized.metadata.location) {
          delete sanitized.metadata.location.city;
        }
      }
      sanitized.privacyLevel = 'anonymous';
    }

    // Remove location data if not allowed
    if (!this.privacySettings.enableLocationTracking && sanitized.metadata?.location) {
      delete sanitized.metadata.location;
    }

    return sanitized;
  }

  /**
   * Hash IP address for privacy
   */
  private hashIpAddress(ipAddress: string): string {
    // Simple hash - in production, use a proper cryptographic hash
    let hash = 0;
    for (let i = 0; i < ipAddress.length; i++) {
      const char = ipAddress.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `hashed_${Math.abs(hash).toString(16)}`;
  }

  /**
   * Calculate growth rate compared to previous period
   */
  private async calculateGrowthRate(timeRange: string): Promise<number> {
    const currentPeriodEvents = this.filterEventsByTimeRange(timeRange);
    const timeRangeMs = this.getTimeRangeMs(timeRange);
    const previousPeriodStart = new Date(Date.now() - 2 * timeRangeMs);
    const previousPeriodEnd = new Date(Date.now() - timeRangeMs);
    
    const previousPeriodEvents = this.events.filter(e => 
      e.timestamp >= previousPeriodStart && e.timestamp < previousPeriodEnd
    );

    if (previousPeriodEvents.length === 0) return 0;

    const growth = ((currentPeriodEvents.length - previousPeriodEvents.length) / previousPeriodEvents.length) * 100;
    return Math.round(growth * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate average session duration
   */
  private async calculateAverageSessionDuration(events: UsageEvent[]): Promise<number> {
    const sessionGroups = new Map<string, UsageEvent[]>();
    
    events.forEach(event => {
      if (!sessionGroups.has(event.sessionId)) {
        sessionGroups.set(event.sessionId, []);
      }
      sessionGroups.get(event.sessionId)!.push(event);
    });

    const sessionDurations: number[] = [];
    
    sessionGroups.forEach(sessionEvents => {
      if (sessionEvents.length > 1) {
        const sortedEvents = sessionEvents.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        const duration = sortedEvents[sortedEvents.length - 1].timestamp.getTime() - sortedEvents[0].timestamp.getTime();
        sessionDurations.push(duration / 1000 / 60); // Convert to minutes
      }
    });

    return sessionDurations.length > 0
      ? sessionDurations.reduce((sum, duration) => sum + duration, 0) / sessionDurations.length
      : 0;
  }

  /**
   * Get top templates by usage
   */
  private async getTopTemplates(events: UsageEvent[], limit: number): Promise<any[]> {
    const templateGroups = new Map<string, UsageEvent[]>();
    
    events.forEach(event => {
      if (!templateGroups.has(event.templateId)) {
        templateGroups.set(event.templateId, []);
      }
      templateGroups.get(event.templateId)!.push(event);
    });

    const templateStats = Array.from(templateGroups.entries()).map(([templateId, templateEvents]) => {
      const views = templateEvents.filter(e => e.eventType === 'view').length;
      const downloads = templateEvents.filter(e => e.eventType === 'download').length;
      const installs = templateEvents.filter(e => e.eventType === 'install').length;
      const conversionRate = views > 0 ? (downloads / views) * 100 : 0;

      return {
        templateId,
        templateName: templateEvents[0].templateName,
        category: templateEvents[0].category,
        views,
        downloads,
        installs,
        conversionRate,
        totalScore: downloads * 3 + views * 1 + installs * 5, // Weighted score
      };
    });

    return templateStats
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit)
      .map(({ totalScore, ...template }) => template);
  }

  /**
   * Get recent activity
   */
  private async getRecentActivity(events: UsageEvent[], limit: number): Promise<any[]> {
    return events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
      .map(event => ({
        id: event.id,
        type: event.eventType,
        template: event.templateName,
        timestamp: event.timestamp.toLocaleString(),
        details: this.getEventDetails(event),
      }));
  }

  /**
   * Get event details for display
   */
  private getEventDetails(event: UsageEvent): string {
    switch (event.eventType) {
      case 'view':
        return `Template viewed from ${event.metadata?.source || 'unknown'}`;
      case 'download':
        return `Template downloaded by ${event.metadata?.device?.type || 'unknown'} user`;
      case 'install':
        return `Template installed successfully`;
      case 'error':
        return 'Installation error occurred';
      case 'favorite':
        return 'Template added to favorites';
      case 'share':
        return 'Template shared';
      default:
        return `${event.eventType} event`;
    }
  }

  /**
   * Get user segments (privacy-compliant)
   */
  private async getUserSegments(events: UsageEvent[]): Promise<any[]> {
    // Only use organization type data, not personal identifiers
    const orgTypes = events
      .map(e => e.metadata?.installationContext?.organizationType)
      .filter(Boolean);

    const orgTypeCount = new Map<string, number>();
    orgTypes.forEach(type => {
      orgTypeCount.set(type!, (orgTypeCount.get(type!) || 0) + 1);
    });

    const total = orgTypes.length;
    if (total === 0) {
      return [
        { segment: 'Unknown', count: events.length, percentage: 100, engagementScore: 50 },
      ];
    }

    return Array.from(orgTypeCount.entries()).map(([segment, count]) => ({
      segment: segment.charAt(0).toUpperCase() + segment.slice(1),
      count,
      percentage: Math.round((count / total) * 100),
      engagementScore: Math.min(100, Math.max(0, 50 + Math.random() * 40)), // Mock engagement score
    }));
  }

  /**
   * Get geographic distribution (privacy-compliant)
   */
  private async getGeographicDistribution(events: UsageEvent[]): Promise<any[]> {
    if (!this.privacySettings.enableLocationTracking) {
      return [{ country: 'Location tracking disabled', count: events.length, percentage: 100 }];
    }

    const countries = events
      .map(e => e.metadata?.location?.country)
      .filter(Boolean);

    const countryCount = new Map<string, number>();
    countries.forEach(country => {
      countryCount.set(country!, (countryCount.get(country!) || 0) + 1);
    });

    const total = countries.length;
    if (total === 0) {
      return [{ country: 'Unknown', count: events.length, percentage: 100 }];
    }

    return Array.from(countryCount.entries())
      .map(([country, count]) => ({
        country,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 countries
  }

  /**
   * Calculate average time to install
   */
  private async calculateAverageTimeToInstall(events: UsageEvent[]): Promise<number> {
    const sessionGroups = new Map<string, UsageEvent[]>();
    
    events.forEach(event => {
      if (!sessionGroups.has(event.sessionId)) {
        sessionGroups.set(event.sessionId, []);
      }
      sessionGroups.get(event.sessionId)!.push(event);
    });

    const installTimes: number[] = [];

    sessionGroups.forEach(sessionEvents => {
      const sortedEvents = sessionEvents.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      const downloadEvent = sortedEvents.find(e => e.eventType === 'download');
      const installEvent = sortedEvents.find(e => e.eventType === 'install');

      if (downloadEvent && installEvent) {
        const timeToInstall = (installEvent.timestamp.getTime() - downloadEvent.timestamp.getTime()) / 1000 / 60; // Minutes
        installTimes.push(timeToInstall);
      }
    });

    return installTimes.length > 0
      ? installTimes.reduce((sum, time) => sum + time, 0) / installTimes.length
      : 0;
  }

  /**
   * Calculate retention rate
   */
  private async calculateRetentionRate(templateId: string, timeRange: string): Promise<number> {
    // Mock retention calculation - in real implementation, this would track uninstall events
    const templateEvents = this.events.filter(e => e.templateId === templateId);
    const installs = templateEvents.filter(e => e.eventType === 'install');
    const uninstalls = templateEvents.filter(e => e.eventType === 'uninstall');
    
    if (installs.length === 0) return 0;
    
    const retentionRate = ((installs.length - uninstalls.length) / installs.length) * 100;
    return Math.max(0, Math.min(100, retentionRate));
  }

  /**
   * Get user feedback metrics
   */
  private async getUserFeedback(events: UsageEvent[]): Promise<any> {
    const favorites = events.filter(e => e.eventType === 'favorite').length;
    const shares = events.filter(e => e.eventType === 'share').length;
    
    // Mock rating data - in real implementation, this would come from a rating system
    return {
      averageRating: 4.2 + Math.random() * 0.6, // 4.2-4.8
      totalRatings: Math.floor(events.length * 0.3), // 30% of events have ratings
      favoriteCount: favorites,
      shareCount: shares,
    };
  }

  /**
   * Get usage patterns
   */
  private async getUsagePatterns(events: UsageEvent[]): Promise<any> {
    const hourCounts = new Map<number, number>();
    const dayCounts = new Map<string, number>();

    events.forEach(event => {
      const hour = event.timestamp.getHours();
      const day = event.timestamp.toLocaleDateString('en-US', { weekday: 'long' });
      
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
      dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
    });

    const peakUsageHours = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => hour);

    const peakUsageDays = Array.from(dayCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([day]) => day);

    // Mock seasonal trends
    const seasonalTrends = [
      { month: 'Jan', usage: 85, trend: 'stable' as const },
      { month: 'Feb', usage: 92, trend: 'up' as const },
      { month: 'Mar', usage: 88, trend: 'down' as const },
      { month: 'Apr', usage: 95, trend: 'up' as const },
    ];

    return {
      peakUsageHours,
      peakUsageDays,
      seasonalTrends,
    };
  }

  /**
   * Get user journey analysis
   */
  private async getUserJourney(events: UsageEvent[]): Promise<any[]> {
    const steps = [
      { step: 'View', eventType: 'view' },
      { step: 'Download', eventType: 'download' },
      { step: 'Install', eventType: 'install' },
      { step: 'Configure', eventType: 'configure' },
    ];

    const journey = steps.map((step, index) => {
      const stepEvents = events.filter(e => e.eventType === step.eventType);
      const previousStepEvents = index > 0 ? events.filter(e => e.eventType === steps[index - 1].eventType) : events;
      
      const dropoffRate = previousStepEvents.length > 0
        ? ((previousStepEvents.length - stepEvents.length) / previousStepEvents.length) * 100
        : 0;

      return {
        step: step.step,
        count: stepEvents.length,
        dropoffRate: Math.round(dropoffRate * 100) / 100,
        averageTime: Math.random() * 5 + 1, // Mock average time in minutes
      };
    });

    return journey;
  }

  /**
   * Get cohort analysis
   */
  private async getCohortAnalysis(templateId: string, timeRange: string): Promise<any[]> {
    // Mock cohort analysis - in real implementation, this would track user cohorts over time
    const cohorts = [
      {
        cohort: 'Week 1',
        size: 100,
        retention: { day1: 85, day7: 65, day30: 45 },
      },
      {
        cohort: 'Week 2',
        size: 120,
        retention: { day1: 88, day7: 70, day30: 50 },
      },
      {
        cohort: 'Week 3',
        size: 95,
        retention: { day1: 82, day7: 62, day30: 42 },
      },
    ];

    return cohorts;
  }

  /**
   * Clean up old events based on retention policy
   */
  private async cleanupOldEvents(): Promise<void> {
    const retentionCutoff = new Date(Date.now() - this.privacySettings.dataRetentionDays * 24 * 60 * 60 * 1000);
    this.events = this.events.filter(event => event.timestamp >= retentionCutoff);
  }

  /**
   * Reprocess events for privacy compliance
   */
  private async reprocessEventsForPrivacy(): Promise<void> {
    this.events = this.events.map(event => this.sanitizeEvent(event) as UsageEvent);
  }

  /**
   * Anonymize user data
   */
  private async anonymizeUserData(userId: string): Promise<void> {
    this.events = this.events.map(event => {
      if (event.userId === userId) {
        return {
          ...event,
          userId: undefined,
          privacyLevel: 'anonymous' as const,
          metadata: event.metadata ? {
            ...event.metadata,
            ipAddress: undefined,
            location: undefined,
          } : undefined,
        };
      }
      return event;
    });
  }

  /**
   * Filter events by time range
   */
  private filterEventsByTimeRange(timeRange: string): UsageEvent[] {
    if (timeRange === 'all') return this.events;
    
    const cutoff = new Date(Date.now() - this.getTimeRangeMs(timeRange));
    return this.events.filter(e => e.timestamp >= cutoff);
  }

  /**
   * Check if timestamp is within time range
   */
  private isWithinTimeRange(timestamp: Date, timeRange: string): boolean {
    if (timeRange === 'all') return true;
    const cutoff = new Date(Date.now() - this.getTimeRangeMs(timeRange));
    return timestamp >= cutoff;
  }

  /**
   * Get time range in milliseconds
   */
  private getTimeRangeMs(timeRange: string): number {
    switch (timeRange) {
      case '24h': return 24 * 60 * 60 * 1000;
      case '7d': return 7 * 24 * 60 * 60 * 1000;
      case '30d': return 30 * 24 * 60 * 60 * 1000;
      case '90d': return 90 * 24 * 60 * 60 * 1000;
      default: return 7 * 24 * 60 * 60 * 1000;
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cache management
   */
  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private clearCacheByTemplate(templateId: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(templateId)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Trigger real-time updates
   */
  private async triggerRealTimeUpdate(event: UsageEvent): Promise<void> {
    // In a real implementation, this would trigger WebSocket updates, webhooks, etc.
    console.log('Real-time usage update:', event);
  }

  /**
   * Initialize with sample data (for development)
   */
  async initializeSampleData(): Promise<void> {
    const sampleTemplates = [
      { id: 'template_1', name: 'Modern Dashboard', category: 'dashboard' },
      { id: 'template_2', name: 'Contact Form', category: 'form' },
      { id: 'template_3', name: 'Landing Page Pro', category: 'landing' },
      { id: 'template_4', name: 'E-commerce Store', category: 'ecommerce' },
      { id: 'template_5', name: 'Analytics Dashboard', category: 'dashboard' },
    ];

    const eventTypes: UsageEvent['eventType'][] = ['view', 'download', 'install', 'configure', 'favorite', 'share'];
    const deviceTypes: Array<'mobile' | 'tablet' | 'desktop'> = ['mobile', 'tablet', 'desktop'];
    const orgTypes: Array<'individual' | 'startup' | 'smb' | 'enterprise'> = ['individual', 'startup', 'smb', 'enterprise'];
    const sources: Array<'marketplace' | 'admin' | 'api' | 'direct'> = ['marketplace', 'admin', 'api', 'direct'];
    
    // Generate sample events for the last 30 days
    for (let i = 0; i < 2000; i++) {
      const template = sampleTemplates[Math.floor(Math.random() * sampleTemplates.length)];
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
      const orgType = orgTypes[Math.floor(Math.random() * orgTypes.length)];
      const source = sources[Math.floor(Math.random() * sources.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      await this.trackEvent({
        templateId: template.id,
        templateName: template.name,
        category: template.category,
        eventType,
        sessionId: `session_${Math.floor(Math.random() * 500)}`,
        userId: Math.random() > 0.3 ? `user_${Math.floor(Math.random() * 200)}` : undefined,
        metadata: {
          source,
          device: {
            type: deviceType,
            os: deviceType === 'mobile' ? 'iOS' : 'Windows',
            browser: 'Chrome',
          },
          installationContext: {
            organizationType: orgType,
            teamSize: Math.floor(Math.random() * 50) + 1,
          },
          location: {
            country: ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany'][Math.floor(Math.random() * 5)],
          },
        },
        privacyLevel: Math.random() > 0.7 ? 'identified' : Math.random() > 0.5 ? 'pseudonymous' : 'anonymous',
        consentGiven: Math.random() > 0.2, // 80% consent rate
      });
    }
  }
}

// Export singleton instance
export const usageTracking = new UsageTrackingService();

// Initialize sample data in development
if (process.env.NODE_ENV === 'development') {
  usageTracking.initializeSampleData().catch(console.error);
}
