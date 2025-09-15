/**
 * @fileoverview HT-021.3.4: Analytics Integration and Event Tracking
 * @module lib/analytics/analytics-tracker
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-021.3.4 - Performance Monitoring & Analytics Setup
 * Focus: Comprehensive analytics tracking and user behavior monitoring
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: LOW (data collection)
 */

import React from 'react';
import { useAppStore } from '../state/zustand-store';

// ============================================================================
// ANALYTICS TYPES AND INTERFACES
// ============================================================================

export interface AnalyticsEvent {
  name: string;
  properties: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId: string;
  context: AnalyticsContext;
}

export interface AnalyticsContext {
  page: {
    path: string;
    title: string;
    referrer: string;
    url: string;
  };
  user: {
    id?: string;
    isAuthenticated: boolean;
    role?: string;
  };
  session: {
    id: string;
    startTime: number;
    duration: number;
    pageViews: number;
  };
  device: {
    userAgent: string;
    platform: string;
    screenResolution: string;
    viewportSize: string;
    timezone: string;
    language: string;
  };
  performance: {
    connectionType?: string;
    memoryUsage?: number;
    loadTime?: number;
  };
}

export interface UserBehaviorMetric {
  type: 'scroll' | 'click' | 'focus' | 'blur' | 'resize' | 'navigation' | 'form_interaction';
  element?: string;
  value?: number;
  timestamp: number;
  context?: Record<string, any>;
}

export interface ConversionGoal {
  id: string;
  name: string;
  event: string;
  conditions?: Record<string, any>;
  value?: number;
}

export interface AnalyticsConfig {
  providers: AnalyticsProvider[];
  sampling?: number; // 0-1, percentage of sessions to track
  enableUserBehavior?: boolean;
  enablePerformanceTracking?: boolean;
  enableErrorTracking?: boolean;
  enableHeatmap?: boolean;
  privacyMode?: boolean;
  debug?: boolean;
}

export interface AnalyticsProvider {
  name: string;
  enabled: boolean;
  config: Record<string, any>;
  initialize?: () => Promise<void> | void;
  track?: (event: AnalyticsEvent) => Promise<void> | void;
  identify?: (userId: string, traits: Record<string, any>) => Promise<void> | void;
  page?: (path: string, properties?: Record<string, any>) => Promise<void> | void;
  group?: (groupId: string, traits: Record<string, any>) => Promise<void> | void;
}

// ============================================================================
// ANALYTICS PROVIDERS
// ============================================================================

class GoogleAnalyticsProvider implements AnalyticsProvider {
  name = 'google-analytics';
  enabled = true;
  config: { measurementId?: string; debug?: boolean };

  constructor(config: { measurementId?: string; debug?: boolean }) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (!this.config.measurementId) {
      console.warn('Google Analytics measurement ID not provided');
      return;
    }

    // Load gtag if not already loaded
    if (typeof window !== 'undefined' && !window.gtag) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.measurementId}`;
      document.head.appendChild(script);

      await new Promise<void>((resolve) => {
        script.onload = () => {
          window.dataLayer = window.dataLayer || [];
          window.gtag = function gtag() {
            window.dataLayer?.push(arguments);
          };
          
          window.gtag('js', new Date());
          window.gtag('config', this.config.measurementId, {
            debug_mode: this.config.debug,
            send_page_view: false, // We'll handle page views manually
          });
          
          resolve();
        };
      });
    }
  }

  track(event: AnalyticsEvent): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.name, {
        ...event.properties,
        user_id: event.userId,
        session_id: event.sessionId,
        timestamp: event.timestamp,
      });
    }
  }

  identify(userId: string, traits: Record<string, any>): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', this.config.measurementId, {
        user_id: userId,
        custom_map: traits,
      });
    }
  }

  page(path: string, properties?: Record<string, any>): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: path,
        page_title: document.title,
        ...properties,
      });
    }
  }
}

class CustomAnalyticsProvider implements AnalyticsProvider {
  name = 'custom';
  enabled = true;
  config: { endpoint?: string; batchSize?: number; flushInterval?: number };
  private eventQueue: AnalyticsEvent[] = [];
  private flushTimer?: NodeJS.Timeout;

  constructor(config: { endpoint?: string; batchSize?: number; flushInterval?: number }) {
    this.config = {
      endpoint: '/api/analytics',
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      ...config,
    };
  }

  async initialize(): Promise<void> {
    this.startPeriodicFlush();
  }

  track(event: AnalyticsEvent): void {
    this.eventQueue.push(event);
    
    if (this.eventQueue.length >= this.config.batchSize!) {
      this.flush();
    }
  }

  identify(userId: string, traits: Record<string, any>): void {
    this.track({
      name: 'user_identified',
      properties: { userId, ...traits },
      timestamp: Date.now(),
      userId,
      sessionId: this.getSessionId(),
      context: this.getAnalyticsContext(),
    });
  }

  page(path: string, properties?: Record<string, any>): void {
    this.track({
      name: 'page_view',
      properties: { path, ...properties },
      timestamp: Date.now(),
      sessionId: this.getSessionId(),
      context: this.getAnalyticsContext(),
    });
  }

  private async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await fetch(this.config.endpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
      });
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-queue events on failure
      this.eventQueue.unshift(...events);
    }
  }

  private startPeriodicFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  private getSessionId(): string {
    // Implementation would get session ID from storage or generate one
    return sessionStorage.getItem('analytics_session_id') || 'session_' + Date.now();
  }

  private getAnalyticsContext(): AnalyticsContext {
    // Implementation would construct context from current state
    return {} as AnalyticsContext; // Simplified for brevity
  }
}

// ============================================================================
// CORE ANALYTICS TRACKER
// ============================================================================

export class AnalyticsTracker {
  private static instance: AnalyticsTracker;
  private config: AnalyticsConfig;
  private providers: AnalyticsProvider[] = [];
  private sessionId: string;
  private sessionStartTime: number;
  private pageViews: number = 0;
  private userBehaviorMetrics: UserBehaviorMetric[] = [];
  private conversionGoals: ConversionGoal[] = [];
  private isInitialized = false;

  constructor(config: AnalyticsConfig) {
    this.config = {
      sampling: 1.0,
      enableUserBehavior: true,
      enablePerformanceTracking: true,
      enableErrorTracking: true,
      enableHeatmap: false,
      privacyMode: false,
      debug: false,
      ...config,
    };
    
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.setupProviders();
  }

  static getInstance(config?: AnalyticsConfig): AnalyticsTracker {
    if (!AnalyticsTracker.instance) {
      if (!config) {
        throw new Error('AnalyticsTracker requires config on first initialization');
      }
      AnalyticsTracker.instance = new AnalyticsTracker(config);
    }
    return AnalyticsTracker.instance;
  }

  private setupProviders(): void {
    this.providers = this.config.providers.filter(p => p.enabled);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    // Check sampling rate
    if (Math.random() > this.config.sampling!) {
      console.log('Session excluded from analytics due to sampling');
      return;
    }

    // Initialize all providers
    await Promise.all(
      this.providers.map(async (provider) => {
        try {
          if (provider.initialize) {
            await provider.initialize();
          }
          if (this.config.debug) {
            console.log(`Analytics provider ${provider.name} initialized`);
          }
        } catch (error) {
          console.error(`Failed to initialize provider ${provider.name}:`, error);
        }
      })
    );

    // Setup event listeners
    if (this.config.enableUserBehavior) {
      this.setupUserBehaviorTracking();
    }

    // Track initial page view
    this.trackPageView();

    this.isInitialized = true;
  }

  // ============================================================================
  // EVENT TRACKING
  // ============================================================================

  track(eventName: string, properties: Record<string, any> = {}): void {
    if (!this.isInitialized) return;

    const event: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: Date.now(),
      userId: this.getCurrentUserId(),
      sessionId: this.sessionId,
      context: this.getAnalyticsContext(),
    };

    // Send to all providers
    this.providers.forEach(provider => {
      try {
        if (provider.track) {
          provider.track(event);
        }
      } catch (error) {
        console.error(`Provider ${provider.name} track error:`, error);
      }
    });

    // Check conversion goals
    this.checkConversionGoals(event);

    if (this.config.debug) {
      console.log('Analytics event tracked:', event);
    }
  }

  identify(userId: string, traits: Record<string, any> = {}): void {
    if (!this.isInitialized) return;

    this.providers.forEach(provider => {
      try {
        if (provider.identify) {
          provider.identify(userId, traits);
        }
      } catch (error) {
        console.error(`Provider ${provider.name} identify error:`, error);
      }
    });

    // Update user in app store
    const setProfile = useAppStore.getState().setProfile;
    setProfile({ id: userId, ...traits } as any);
  }

  trackPageView(path?: string, properties?: Record<string, any>): void {
    if (!this.isInitialized) return;

    const currentPath = path || window.location.pathname;
    this.pageViews++;

    this.providers.forEach(provider => {
      try {
        if (provider.page) {
          provider.page(currentPath, {
            title: document.title,
            referrer: document.referrer,
            ...properties,
          });
        }
      } catch (error) {
        console.error(`Provider ${provider.name} page error:`, error);
      }
    });

    // Track as regular event too
    this.track('page_view', {
      path: currentPath,
      title: document.title,
      referrer: document.referrer,
      session_page_views: this.pageViews,
      ...properties,
    });
  }

  // ============================================================================
  // USER BEHAVIOR TRACKING
  // ============================================================================

  private setupUserBehaviorTracking(): void {
    if (typeof window === 'undefined') return;

    // Scroll tracking
    let scrollDepth = 0;
    const handleScroll = this.throttle(() => {
      const currentDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (currentDepth > scrollDepth && currentDepth % 25 === 0) {
        scrollDepth = currentDepth;
        this.trackUserBehavior('scroll', undefined, scrollDepth);
      }
    }, 1000);

    window.addEventListener('scroll', handleScroll);

    // Click tracking
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const element = `${tagName}${target.id ? `#${target.id}` : ''}${target.className ? `.${target.className.split(' ')[0]}` : ''}`;
      
      this.trackUserBehavior('click', element, undefined, {
        x: event.clientX,
        y: event.clientY,
        timestamp: Date.now(),
      });
    });

    // Form interaction tracking
    document.addEventListener('focus', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        this.trackUserBehavior('focus', (target as HTMLInputElement).name || target.id || target.tagName);
      }
    }, true);

    // Navigation tracking
    let startTime = Date.now();
    const handleBeforeUnload = () => {
      const timeOnPage = Date.now() - startTime;
      this.track('page_exit', {
        time_on_page: timeOnPage,
        scroll_depth: scrollDepth,
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Visibility change tracking
    document.addEventListener('visibilitychange', () => {
      this.track(document.hidden ? 'page_hidden' : 'page_visible', {
        timestamp: Date.now(),
      });
    });
  }

  private trackUserBehavior(
    type: UserBehaviorMetric['type'],
    element?: string,
    value?: number,
    context?: Record<string, any>
  ): void {
    const metric: UserBehaviorMetric = {
      type,
      element,
      value,
      timestamp: Date.now(),
      context,
    };

    this.userBehaviorMetrics.push(metric);

    // Keep only last 100 metrics
    if (this.userBehaviorMetrics.length > 100) {
      this.userBehaviorMetrics = this.userBehaviorMetrics.slice(-100);
    }

    // Track as analytics event
    this.track(`user_${type}`, {
      element,
      value,
      ...context,
    });
  }

  // ============================================================================
  // CONVERSION TRACKING
  // ============================================================================

  addConversionGoal(goal: ConversionGoal): void {
    this.conversionGoals.push(goal);
  }

  private checkConversionGoals(event: AnalyticsEvent): void {
    this.conversionGoals.forEach(goal => {
      if (event.name === goal.event) {
        let matches = true;
        
        if (goal.conditions) {
          for (const [key, value] of Object.entries(goal.conditions)) {
            if (event.properties[key] !== value) {
              matches = false;
              break;
            }
          }
        }

        if (matches) {
          this.track('conversion', {
            goal_id: goal.id,
            goal_name: goal.name,
            goal_value: goal.value || 1,
            original_event: event.name,
            original_properties: event.properties,
          });
        }
      }
    });
  }

  // ============================================================================
  // PERFORMANCE ANALYTICS
  // ============================================================================

  trackPerformance(metrics: Record<string, number>): void {
    this.track('performance_metrics', metrics);
  }

  trackError(error: Error, context?: Record<string, any>): void {
    if (!this.config.enableErrorTracking) return;

    this.track('error', {
      error_message: error.message,
      error_name: error.name,
      error_stack: error.stack,
      ...context,
    });
  }

  trackTiming(name: string, duration: number, category?: string): void {
    this.track('timing', {
      timing_name: name,
      timing_duration: duration,
      timing_category: category,
    });
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentUserId(): string | undefined {
    const userState = useAppStore.getState().user;
    return userState.profile?.id;
  }

  private getAnalyticsContext(): AnalyticsContext {
    const userState = useAppStore.getState().user;
    
    return {
      page: {
        path: window.location.pathname,
        title: document.title,
        referrer: document.referrer,
        url: window.location.href,
      },
      user: {
        id: userState.profile?.id,
        isAuthenticated: userState.isAuthenticated,
        role: userState.profile?.role,
      },
      session: {
        id: this.sessionId,
        startTime: this.sessionStartTime,
        duration: Date.now() - this.sessionStartTime,
        pageViews: this.pageViews,
      },
      device: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        screenResolution: `${screen.width}x${screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
      },
      performance: {
        connectionType: (navigator as any).connection?.effectiveType,
        memoryUsage: (performance as any).memory?.usedJSHeapSize,
      },
    };
  }

  private throttle<T extends (...args: any[]) => any>(func: T, delay: number): T {
    let timeoutId: NodeJS.Timeout;
    let lastExecTime = 0;
    
    return ((...args: any[]) => {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func(...args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    }) as T;
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  getSessionMetrics(): {
    sessionId: string;
    duration: number;
    pageViews: number;
    userBehaviorEvents: number;
  } {
    return {
      sessionId: this.sessionId,
      duration: Date.now() - this.sessionStartTime,
      pageViews: this.pageViews,
      userBehaviorEvents: this.userBehaviorMetrics.length,
    };
  }

  getUserBehaviorMetrics(): UserBehaviorMetric[] {
    return [...this.userBehaviorMetrics];
  }

  getConversionGoals(): ConversionGoal[] {
    return [...this.conversionGoals];
  }

  destroy(): void {
    this.isInitialized = false;
    this.userBehaviorMetrics = [];
    this.conversionGoals = [];
  }
}

// ============================================================================
// REACT HOOKS
// ============================================================================

export function useAnalytics() {
  const tracker = AnalyticsTracker.getInstance();
  
  return {
    track: tracker.track.bind(tracker),
    identify: tracker.identify.bind(tracker),
    trackPageView: tracker.trackPageView.bind(tracker),
    trackPerformance: tracker.trackPerformance.bind(tracker),
    trackError: tracker.trackError.bind(tracker),
    trackTiming: tracker.trackTiming.bind(tracker),
    addConversionGoal: tracker.addConversionGoal.bind(tracker),
    getSessionMetrics: tracker.getSessionMetrics.bind(tracker),
  };
}

export function usePageTracking() {
  const { trackPageView } = useAnalytics();
  const [currentPath, setCurrentPath] = React.useState('');

  React.useEffect(() => {
    const path = window.location.pathname;
    if (path !== currentPath) {
      setCurrentPath(path);
      trackPageView(path);
    }
  }, [currentPath, trackPageView]);

  return { currentPath };
}

// ============================================================================
// GLOBAL WINDOW TYPES
// ============================================================================

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export default AnalyticsTracker;