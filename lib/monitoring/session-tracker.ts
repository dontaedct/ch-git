/**
 * @fileoverview HT-008.8.4: User Session Tracking and Analytics System
 * @module lib/monitoring/session-tracker
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Error Handling & Monitoring Phase
 * Task: HT-008.8.4 - Add user session tracking and analytics
 * Focus: Production-grade user session tracking with privacy compliance
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (user privacy, data protection, analytics)
 */

import { Logger } from '@/lib/logger';
import { Observing } from '@/lib/observability';

// Session tracking configuration
interface SessionConfig {
  enableSessionTracking: boolean;
  enableUserAnalytics: boolean;
  enableBehaviorTracking: boolean;
  enablePerformanceTracking: boolean;
  enableErrorTracking: boolean;
  enablePrivacyCompliance: boolean;
  sessionTimeout: number; // minutes
  maxSessionsPerUser: number;
  dataRetentionDays: number;
  enableAnonymization: boolean;
  enableConsentManagement: boolean;
  samplingRate: number;
  enableRealTimeAnalytics: boolean;
  enableWebhookNotifications: boolean;
  webhookUrls: string[];
  enableSlackNotifications: boolean;
  slackWebhookUrl?: string;
}

const defaultConfig: SessionConfig = {
  enableSessionTracking: true,
  enableUserAnalytics: true,
  enableBehaviorTracking: true,
  enablePerformanceTracking: true,
  enableErrorTracking: true,
  enablePrivacyCompliance: true,
  sessionTimeout: 30, // 30 minutes
  maxSessionsPerUser: 10,
  dataRetentionDays: 90,
  enableAnonymization: true,
  enableConsentManagement: true,
  samplingRate: 1.0,
  enableRealTimeAnalytics: true,
  enableWebhookNotifications: false,
  webhookUrls: [],
  enableSlackNotifications: false,
  slackWebhookUrl: process.env.SLACK_SESSION_WEBHOOK_URL,
};

// User session data
export interface UserSession {
  id: string;
  userId?: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // seconds
  pageViews: number;
  events: SessionEvent[];
  userAgent: string;
  ipAddress?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  device: {
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
    screenResolution: string;
  };
  location?: {
    country: string;
    region: string;
    city: string;
    timezone: string;
  };
  performance: {
    averageLoadTime: number;
    averageRenderTime: number;
    memoryUsage: number;
    errors: number;
  };
  behavior: {
    scrollDepth: number;
    timeOnPage: number;
    clicks: number;
    formInteractions: number;
    downloads: number;
  };
  privacy: {
    consentGiven: boolean;
    anonymized: boolean;
    dataRetention: Date;
  };
}

// Session event
export interface SessionEvent {
  id: string;
  type: 'page_view' | 'click' | 'scroll' | 'form_submit' | 'download' | 'error' | 'performance' | 'custom';
  timestamp: Date;
  data: Record<string, any>;
  page: string;
  element?: string;
  value?: any;
}

// User analytics
export interface UserAnalytics {
  totalSessions: number;
  averageSessionDuration: number;
  totalPageViews: number;
  averagePageViewsPerSession: number;
  bounceRate: number;
  returnVisitorRate: number;
  topPages: Array<{ page: string; views: number }>;
  topReferrers: Array<{ referrer: string; count: number }>;
  deviceBreakdown: Record<string, number>;
  locationBreakdown: Record<string, number>;
  behaviorMetrics: {
    averageScrollDepth: number;
    averageTimeOnPage: number;
    averageClicksPerSession: number;
    formCompletionRate: number;
  };
  performanceMetrics: {
    averageLoadTime: number;
    averageRenderTime: number;
    errorRate: number;
    memoryUsage: number;
  };
  conversionFunnel: Array<{
    step: string;
    users: number;
    conversionRate: number;
  }>;
}

// Session insights
interface SessionInsights {
  userJourney: Array<{
    step: number;
    page: string;
    timestamp: Date;
    duration: number;
  }>;
  dropoffPoints: Array<{
    page: string;
    dropoffRate: number;
  }>;
  engagementScore: number;
  conversionProbability: number;
  recommendations: string[];
}

/**
 * User Session Tracking and Analytics System
 * 
 * Provides comprehensive user session tracking with privacy compliance,
 * behavior analytics, and real-time insights.
 */
export class SessionTracker {
  private static instance: SessionTracker | null = null;
  private config: SessionConfig;
  private logger = Logger.create({ component: 'session-tracker' });
  private sessions: Map<string, UserSession> = new Map();
  private activeSessions: Map<string, UserSession> = new Map();
  private userSessions: Map<string, UserSession[]> = new Map();
  private events: SessionEvent[] = [];

  private constructor(config: Partial<SessionConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.initializeTracking();
    this.startPeriodicTasks();
  }

  static getInstance(config?: Partial<SessionConfig>): SessionTracker {
    if (!SessionTracker.instance) {
      SessionTracker.instance = new SessionTracker(config);
    }
    return SessionTracker.instance;
  }

  /**
   * Initialize session tracking
   */
  private initializeTracking(): void {
    if (typeof window === 'undefined') return;

    try {
      // Check for existing session
      const existingSessionId = this.getStoredSessionId();
      if (existingSessionId) {
        this.resumeSession(existingSessionId);
      } else {
        this.startNewSession();
      }

      // Set up event listeners
      this.setupEventListeners();

      // Set up page visibility tracking
      this.setupPageVisibilityTracking();

      // Set up session timeout
      this.setupSessionTimeout();

      this.logger.info('Session tracking initialized', {
        sessionId: this.getCurrentSessionId(),
        config: {
          enableSessionTracking: this.config.enableSessionTracking,
          enableUserAnalytics: this.config.enableUserAnalytics,
          enableBehaviorTracking: this.config.enableBehaviorTracking,
          privacyCompliance: this.config.enablePrivacyCompliance,
        },
      });

    } catch (error) {
      this.logger.error('Failed to initialize session tracking', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Start a new session
   */
  private startNewSession(): void {
    const sessionId = this.generateSessionId();
    const userId = this.getUserId();
    
    const session: UserSession = {
      id: this.generateId(),
      userId,
      sessionId,
      startTime: new Date(),
      pageViews: 0,
      events: [],
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      device: this.getDeviceInfo(),
      performance: {
        averageLoadTime: 0,
        averageRenderTime: 0,
        memoryUsage: 0,
        errors: 0,
      },
      behavior: {
        scrollDepth: 0,
        timeOnPage: 0,
        clicks: 0,
        formInteractions: 0,
        downloads: 0,
      },
      privacy: {
        consentGiven: this.hasConsent(),
        anonymized: this.config.enableAnonymization,
        dataRetention: new Date(Date.now() + this.config.dataRetentionDays * 24 * 60 * 60 * 1000),
      },
    };

    this.activeSessions.set(sessionId, session);
    this.storeSessionId(sessionId);

    // Track initial page view
    this.trackEvent('page_view', {
      page: window.location.pathname,
      title: document.title,
      referrer: document.referrer,
    });

    // Record session start
    (Observing as any).recordBusinessMetric('session_started', 1, {
      sessionId,
      userId: userId || 'anonymous',
      device: session.device.type,
    });

    this.logger.info('New session started', {
      sessionId,
      userId: userId || 'anonymous',
      device: session.device.type,
    });
  }

  /**
   * Resume an existing session
   */
  private resumeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session && !session.endTime) {
      this.activeSessions.set(sessionId, session);
      
      // Track session resume
      this.trackEvent('session_resume' as any, {
        sessionId,
        resumedAt: new Date().toISOString(),
      });

      this.logger.info('Session resumed', { sessionId });
    } else {
      this.startNewSession();
    }
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    if (!this.config.enableBehaviorTracking) return;

    // Page view tracking
    window.addEventListener('popstate', () => {
      this.trackEvent('page_view', {
        page: window.location.pathname,
        title: document.title,
        referrer: document.referrer,
      });
    });

    // Click tracking
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      this.trackEvent('click', {
        element: target.tagName,
        id: target.id,
        className: target.className,
        text: target.textContent?.substring(0, 100),
        page: window.location.pathname,
      });
    });

    // Scroll tracking
    let scrollTimeout: NodeJS.Timeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollDepth = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        this.trackEvent('scroll', {
          scrollDepth: Math.round(scrollDepth),
          page: window.location.pathname,
        });
      }, 100);
    });

    // Form interaction tracking
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.trackEvent('form_submit', {
        formId: form.id,
        formAction: form.action,
        formMethod: form.method,
        page: window.location.pathname,
      });
    });

    // Download tracking
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a');
      if (link && this.isDownloadLink(link)) {
        this.trackEvent('download', {
          url: link.href,
          filename: this.getFilenameFromUrl(link.href),
          page: window.location.pathname,
        });
      }
    });

    // Error tracking
    window.addEventListener('error', (event) => {
      this.trackEvent('error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        page: window.location.pathname,
      });
    });

    // Performance tracking
    if (this.config.enablePerformanceTracking) {
      window.addEventListener('load', () => {
        const loadTime = performance.now();
        this.trackEvent('performance', {
          loadTime,
          page: window.location.pathname,
        });
      });
    }
  }

  /**
   * Set up page visibility tracking
   */
  private setupPageVisibilityTracking(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('page_hidden' as any, {
          page: window.location.pathname,
          timestamp: new Date().toISOString(),
        });
      } else {
        this.trackEvent('page_visible' as any, {
          page: window.location.pathname,
          timestamp: new Date().toISOString(),
        });
      }
    });
  }

  /**
   * Set up session timeout
   */
  private setupSessionTimeout(): void {
    let timeoutId: NodeJS.Timeout;
    
    const resetTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        this.endSession();
      }, this.config.sessionTimeout * 60 * 1000);
    };

    // Reset timeout on user activity
    ['click', 'scroll', 'keypress', 'mousemove'].forEach(event => {
      document.addEventListener(event, resetTimeout, { passive: true });
    });

    resetTimeout();
  }

  /**
   * Track a session event
   */
  trackEvent(type: SessionEvent['type'], data: Record<string, any>): void {
    if (!this.config.enableSessionTracking) return;
    if (Math.random() > this.config.samplingRate) return;

    const sessionId = this.getCurrentSessionId();
    const session = this.activeSessions.get(sessionId);
    
    if (!session) return;

    const event: SessionEvent = {
      id: this.generateId(),
      type,
      timestamp: new Date(),
      data,
      page: window.location.pathname,
    };

    session.events.push(event);
    this.events.push(event);

    // Update session metrics based on event type
    this.updateSessionMetrics(session, event);

    // Real-time analytics
    if (this.config.enableRealTimeAnalytics) {
      this.processRealTimeEvent(event);
    }

    // Record business metric
    (Observing as any).recordBusinessMetric('session_event', 1, {
      eventType: type,
      sessionId,
      userId: session.userId || 'anonymous',
    });

    this.logger.debug('Session event tracked', {
      sessionId,
      eventType: type,
      page: event.page,
    });
  }

  /**
   * Update session metrics based on event
   */
  private updateSessionMetrics(session: UserSession, event: SessionEvent): void {
    switch (event.type) {
      case 'page_view':
        session.pageViews++;
        break;
      case 'click':
        session.behavior.clicks++;
        break;
      case 'scroll':
        session.behavior.scrollDepth = Math.max(
          session.behavior.scrollDepth,
          event.data.scrollDepth || 0
        );
        break;
      case 'form_submit':
        session.behavior.formInteractions++;
        break;
      case 'download':
        session.behavior.downloads++;
        break;
      case 'error':
        session.performance.errors++;
        break;
      case 'performance':
        if (event.data.loadTime) {
          session.performance.averageLoadTime = 
            (session.performance.averageLoadTime + event.data.loadTime) / 2;
        }
        break;
    }
  }

  /**
   * Process real-time event
   */
  private processRealTimeEvent(event: SessionEvent): void {
    // This could trigger real-time notifications or updates
    if (event.type === 'error' && this.config.enableWebhookNotifications) {
      this.sendRealTimeNotification(event);
    }
  }

  /**
   * End current session
   */
  endSession(): void {
    const sessionId = this.getCurrentSessionId();
    const session = this.activeSessions.get(sessionId);
    
    if (!session) return;

    session.endTime = new Date();
    session.duration = Math.round((session.endTime.getTime() - session.startTime.getTime()) / 1000);

    // Move to completed sessions
    this.sessions.set(sessionId, session);
    this.activeSessions.delete(sessionId);

    // Store user sessions
    if (session.userId) {
      const userSessions = this.userSessions.get(session.userId) || [];
      userSessions.push(session);
      
      // Keep only recent sessions
      if (userSessions.length > this.config.maxSessionsPerUser) {
        userSessions.splice(0, userSessions.length - this.config.maxSessionsPerUser);
      }
      
      this.userSessions.set(session.userId, userSessions);
    }

    // Record session end
    (Observing as any).recordBusinessMetric('session_ended', 1, {
      sessionId,
      userId: session.userId || 'anonymous',
      duration: session.duration,
      pageViews: session.pageViews,
    });

    this.logger.info('Session ended', {
      sessionId,
      userId: session.userId || 'anonymous',
      duration: session.duration,
      pageViews: session.pageViews,
    });

    // Clean up stored session ID
    this.removeStoredSessionId();
  }

  /**
   * Get user analytics
   */
  getUserAnalytics(userId?: string, timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): UserAnalytics {
    const now = new Date();
    const timeRangeMs = this.getTimeRangeMs(timeRange);
    const cutoffTime = new Date(now.getTime() - timeRangeMs);

    let sessions: UserSession[];
    
    if (userId) {
      sessions = (this.userSessions.get(userId) || [])
        .filter(s => s.startTime >= cutoffTime);
    } else {
      sessions = Array.from(this.sessions.values())
        .filter(s => s.startTime >= cutoffTime);
    }

    return this.calculateUserAnalytics(sessions);
  }

  /**
   * Get session insights
   */
  getSessionInsights(sessionId: string): SessionInsights | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    return this.calculateSessionInsights(session);
  }

  /**
   * Get active sessions count
   */
  getActiveSessionsCount(): number {
    return this.activeSessions.size;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): UserSession | null {
    return this.sessions.get(sessionId) || this.activeSessions.get(sessionId) || null;
  }

  /**
   * Get current session ID
   */
  private getCurrentSessionId(): string {
    return Array.from(this.activeSessions.keys())[0] || '';
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get user ID from storage or generate anonymous ID
   */
  private getUserId(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    
    let userId = localStorage.getItem('user_id');
    if (!userId) {
      userId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('user_id', userId);
    }
    return userId;
  }

  /**
   * Get device information
   */
  private getDeviceInfo(): UserSession['device'] {
    const userAgent = navigator.userAgent;
    
    return {
      type: this.getDeviceType(userAgent),
      os: this.getOperatingSystem(userAgent),
      browser: this.getBrowser(userAgent),
      screenResolution: `${screen.width}x${screen.height}`,
    };
  }

  /**
   * Get device type from user agent
   */
  private getDeviceType(userAgent: string): 'desktop' | 'mobile' | 'tablet' {
    if (/tablet|ipad/i.test(userAgent)) return 'tablet';
    if (/mobile|android|iphone/i.test(userAgent)) return 'mobile';
    return 'desktop';
  }

  /**
   * Get operating system from user agent
   */
  private getOperatingSystem(userAgent: string): string {
    if (/windows/i.test(userAgent)) return 'Windows';
    if (/macintosh|mac os x/i.test(userAgent)) return 'macOS';
    if (/linux/i.test(userAgent)) return 'Linux';
    if (/android/i.test(userAgent)) return 'Android';
    if (/iphone|ipad/i.test(userAgent)) return 'iOS';
    return 'Unknown';
  }

  /**
   * Get browser from user agent
   */
  private getBrowser(userAgent: string): string {
    if (/chrome/i.test(userAgent)) return 'Chrome';
    if (/firefox/i.test(userAgent)) return 'Firefox';
    if (/safari/i.test(userAgent)) return 'Safari';
    if (/edge/i.test(userAgent)) return 'Edge';
    if (/opera/i.test(userAgent)) return 'Opera';
    return 'Unknown';
  }

  /**
   * Check if user has given consent
   */
  private hasConsent(): boolean {
    if (!this.config.enableConsentManagement) return true;
    
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('analytics_consent') === 'true';
  }

  /**
   * Check if link is a download link
   */
  private isDownloadLink(link: HTMLAnchorElement): boolean {
    const downloadExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.zip', '.rar', '.exe', '.dmg'];
    const href = link.href.toLowerCase();
    return downloadExtensions.some(ext => href.includes(ext)) || link.hasAttribute('download');
  }

  /**
   * Get filename from URL
   */
  private getFilenameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      return pathname.split('/').pop() || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Store session ID
   */
  private storeSessionId(sessionId: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem('session_id', sessionId);
  }

  /**
   * Get stored session ID
   */
  private getStoredSessionId(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('session_id');
  }

  /**
   * Remove stored session ID
   */
  private removeStoredSessionId(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem('session_id');
  }

  /**
   * Send real-time notification
   */
  private async sendRealTimeNotification(event: SessionEvent): Promise<void> {
    if (!this.config.enableWebhookNotifications || !this.config.webhookUrls.length) return;

    try {
      const payload = {
        event: 'session_event',
        eventType: event.type,
        data: event.data,
        timestamp: event.timestamp.toISOString(),
        sessionId: this.getCurrentSessionId(),
      };

      await Promise.all(
        this.config.webhookUrls.map(url => 
          fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        )
      );
    } catch (error) {
      this.logger.error('Failed to send real-time notification', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Calculate user analytics
   */
  private calculateUserAnalytics(sessions: UserSession[]): UserAnalytics {
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        averageSessionDuration: 0,
        totalPageViews: 0,
        averagePageViewsPerSession: 0,
        bounceRate: 0,
        returnVisitorRate: 0,
        topPages: [],
        topReferrers: [],
        deviceBreakdown: {},
        locationBreakdown: {},
        behaviorMetrics: {
          averageScrollDepth: 0,
          averageTimeOnPage: 0,
          averageClicksPerSession: 0,
          formCompletionRate: 0,
        },
        performanceMetrics: {
          averageLoadTime: 0,
          averageRenderTime: 0,
          errorRate: 0,
          memoryUsage: 0,
        },
        conversionFunnel: [],
      };
    }

    const totalSessions = sessions.length;
    const totalPageViews = sessions.reduce((sum, s) => sum + s.pageViews, 0);
    const averageSessionDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / totalSessions;
    const averagePageViewsPerSession = totalPageViews / totalSessions;

    // Calculate bounce rate (sessions with only 1 page view)
    const bounceRate = sessions.filter(s => s.pageViews === 1).length / totalSessions;

    // Calculate return visitor rate
    const uniqueUsers = new Set(sessions.map(s => s.userId).filter(Boolean));
    const returnVisitorRate = uniqueUsers.size / Math.max(sessions.length, 1);

    // Top pages
    const pageViews: Record<string, number> = {};
    sessions.forEach(session => {
      session.events
        .filter(e => e.type === 'page_view')
        .forEach(e => {
          pageViews[e.page] = (pageViews[e.page] || 0) + 1;
        });
    });
    const topPages = Object.entries(pageViews)
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Device breakdown
    const deviceBreakdown: Record<string, number> = {};
    sessions.forEach(session => {
      deviceBreakdown[session.device.type] = (deviceBreakdown[session.device.type] || 0) + 1;
    });

    // Behavior metrics
    const behaviorMetrics = {
      averageScrollDepth: sessions.reduce((sum, s) => sum + s.behavior.scrollDepth, 0) / totalSessions,
      averageTimeOnPage: sessions.reduce((sum, s) => sum + s.behavior.timeOnPage, 0) / totalSessions,
      averageClicksPerSession: sessions.reduce((sum, s) => sum + s.behavior.clicks, 0) / totalSessions,
      formCompletionRate: sessions.reduce((sum, s) => sum + s.behavior.formInteractions, 0) / totalSessions,
    };

    // Performance metrics
    const performanceMetrics = {
      averageLoadTime: sessions.reduce((sum, s) => sum + s.performance.averageLoadTime, 0) / totalSessions,
      averageRenderTime: sessions.reduce((sum, s) => sum + s.performance.averageRenderTime, 0) / totalSessions,
      errorRate: sessions.reduce((sum, s) => sum + s.performance.errors, 0) / totalSessions,
      memoryUsage: sessions.reduce((sum, s) => sum + s.performance.memoryUsage, 0) / totalSessions,
    };

    return {
      totalSessions,
      averageSessionDuration,
      totalPageViews,
      averagePageViewsPerSession,
      bounceRate,
      returnVisitorRate,
      topPages,
      topReferrers: [], // Would need referrer tracking
      deviceBreakdown,
      locationBreakdown: {}, // Would need location tracking
      behaviorMetrics,
      performanceMetrics,
      conversionFunnel: [], // Would need conversion tracking
    };
  }

  /**
   * Calculate session insights
   */
  private calculateSessionInsights(session: UserSession): SessionInsights {
    // User journey
    const userJourney = session.events
      .filter(e => e.type === 'page_view')
      .map((e, index) => ({
        step: index + 1,
        page: e.page,
        timestamp: e.timestamp,
        duration: index > 0 ? 
          e.timestamp.getTime() - session.events[index - 1].timestamp.getTime() : 0,
      }));

    // Dropoff points (pages with high exit rates)
    const dropoffPoints = userJourney.map(step => ({
      page: step.page,
      dropoffRate: step.duration < 5000 ? 0.8 : 0.2, // Simplified calculation
    }));

    // Engagement score (0-100)
    const engagementScore = Math.min(100, 
      (session.behavior.scrollDepth * 0.3) +
      (Math.min(session.behavior.timeOnPage / 60, 10) * 0.3) +
      (Math.min(session.behavior.clicks, 20) * 0.2) +
      (Math.min(session.pageViews, 10) * 0.2)
    );

    // Conversion probability (simplified)
    const conversionProbability = Math.min(1, 
      (session.behavior.formInteractions * 0.3) +
      (session.behavior.downloads * 0.4) +
      (session.pageViews > 3 ? 0.3 : 0)
    );

    // Recommendations
    const recommendations: string[] = [];
    if (session.behavior.scrollDepth < 50) {
      recommendations.push('Improve content engagement to increase scroll depth');
    }
    if (session.behavior.timeOnPage < 30) {
      recommendations.push('Optimize page content to increase time on page');
    }
    if (session.performance.errors > 0) {
      recommendations.push('Fix JavaScript errors to improve user experience');
    }

    return {
      userJourney,
      dropoffPoints,
      engagementScore,
      conversionProbability,
      recommendations,
    };
  }

  /**
   * Helper methods
   */
  private getTimeRangeMs(timeRange: string): number {
    const ranges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };
    return ranges[timeRange as keyof typeof ranges] || ranges['24h'];
  }

  private startPeriodicTasks(): void {
    // Cleanup old sessions
    setInterval(() => {
      this.cleanupOldSessions();
    }, 60 * 60 * 1000); // Hourly

    // Generate periodic reports
    setInterval(() => {
      this.generatePeriodicReport();
    }, 24 * 60 * 60 * 1000); // Daily
  }

  private cleanupOldSessions(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.dataRetentionDays);
    
    // Clean up old sessions
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.startTime < cutoffDate) {
        this.sessions.delete(sessionId);
      }
    }

    // Clean up old events
    this.events = this.events.filter(e => e.timestamp >= cutoffDate);
  }

  private generatePeriodicReport(): void {
    const analytics = this.getUserAnalytics();
    
    this.logger.info('Daily session report', {
      totalSessions: analytics.totalSessions,
      averageSessionDuration: analytics.averageSessionDuration,
      bounceRate: analytics.bounceRate,
      activeSessions: this.activeSessions.size,
    });
  }
}

// Global session tracker instance
export const sessionTracker = SessionTracker.getInstance();

// Convenience functions
export function trackEvent(
  type: SessionEvent['type'],
  data: Record<string, any>
): void {
  sessionTracker.trackEvent(type, data);
}

export function getUserAnalytics(
  userId?: string,
  timeRange?: Parameters<SessionTracker['getUserAnalytics']>[1]
): UserAnalytics {
  return sessionTracker.getUserAnalytics(userId, timeRange);
}

export function getSessionInsights(sessionId: string): SessionInsights | null {
  return sessionTracker.getSessionInsights(sessionId);
}

export function getActiveSessionsCount(): number {
  return sessionTracker.getActiveSessionsCount();
}

export function getSession(sessionId: string): UserSession | null {
  return sessionTracker.getSession(sessionId);
}
