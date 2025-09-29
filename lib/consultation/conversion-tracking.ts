/**
 * Consultation Conversion Tracking System
 * Tracks user interactions, conversion events, and optimization metrics
 */

export interface ConversionEvent {
  eventType: 'page_view' | 'form_start' | 'form_submit' | 'form_error' | 'cta_click' | 'questionnaire_start' | 'questionnaire_complete' | 'consultation_view'
  timestamp: number
  sessionId?: string
  userId?: string
  data: Record<string, unknown>
  source: string
  page: string
}

export interface ConversionMetrics {
  totalVisitors: number
  formStarts: number
  formSubmissions: number
  formCompletions: number
  questionnaireStarts: number
  questionnaireCompletions: number
  consultationViews: number
  conversionRate: number
  dropoffRate: number
  avgTimeToSubmit: number
}

export interface UserJourney {
  sessionId: string
  events: ConversionEvent[]
  startTime: number
  endTime?: number
  totalDuration?: number
  finalAction?: string
  converted: boolean
  dropoffPoint?: string
}

class ConversionTracker {
  private events: ConversionEvent[] = []
  private sessionId: string
  private startTime: number

  constructor() {
    this.sessionId = this.generateSessionId()
    this.startTime = Date.now()
    this.initializeTracking()
  }

  private generateSessionId(): string {
    return `conversion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private initializeTracking(): void {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('page_view', {
          action: 'page_hidden',
          timeOnPage: Date.now() - this.startTime
        })
      } else {
        this.trackEvent('page_view', {
          action: 'page_visible'
        })
      }
    })

    // Track scroll depth
    this.trackScrollDepth()

    // Track initial page view
    this.trackEvent('page_view', {
      action: 'initial_load',
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      referrer: document.referrer || 'direct'
    })
  }

  private trackScrollDepth(): void {
    const scrollDepths = [25, 50, 75, 100]
    const trackedDepths = new Set<number>()

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scrollPercent = Math.round((scrollTop / docHeight) * 100)

      scrollDepths.forEach(depth => {
        if (scrollPercent >= depth && !trackedDepths.has(depth)) {
          trackedDepths.add(depth)
          this.trackEvent('page_view', {
            action: 'scroll_depth',
            depth: depth,
            timeToDepth: Date.now() - this.startTime
          })
        }
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
  }

  /**
   * Track a conversion event
   */
  trackEvent(
    eventType: ConversionEvent['eventType'],
    data: Record<string, unknown>,
    source: string = 'consultation-landing'
  ): void {
    const event: ConversionEvent = {
      eventType,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      data,
      source,
      page: window.location.pathname
    }

    this.events.push(event)

    // Store in localStorage for persistence
    this.persistEvents()

    // Send to analytics (async)
    this.sendToAnalytics(event).catch(error => {
      console.warn('Failed to send analytics event:', error)
    })

    console.log('Conversion event tracked:', event)
  }

  /**
   * Track form interactions
   */
  trackFormStart(formId: string, formData?: Record<string, unknown>): void {
    this.trackEvent('form_start', {
      formId,
      formData: formData || {},
      timeToStart: Date.now() - this.startTime
    })
  }

  trackFormSubmit(formId: string, formData: Record<string, unknown>): void {
    this.trackEvent('form_submit', {
      formId,
      formData,
      timeToSubmit: Date.now() - this.startTime
    })
  }

  trackFormError(formId: string, errors: Record<string, string>): void {
    this.trackEvent('form_error', {
      formId,
      errors,
      errorCount: Object.keys(errors).length
    })
  }

  /**
   * Track CTA interactions
   */
  trackCTAClick(ctaId: string, ctaText: string, position: string): void {
    this.trackEvent('cta_click', {
      ctaId,
      ctaText,
      position,
      timeToClick: Date.now() - this.startTime
    })
  }

  /**
   * Track questionnaire flow
   */
  trackQuestionnaireStart(questionnaireId: string): void {
    this.trackEvent('questionnaire_start', {
      questionnaireId,
      timeToStart: Date.now() - this.startTime
    })
  }

  trackQuestionnaireComplete(questionnaireId: string, completionRate: number, timeSpent: number): void {
    this.trackEvent('questionnaire_complete', {
      questionnaireId,
      completionRate,
      timeSpent,
      totalTime: Date.now() - this.startTime
    })
  }

  /**
   * Track consultation generation and viewing
   */
  trackConsultationView(consultationId: string, planId: string): void {
    this.trackEvent('consultation_view', {
      consultationId,
      planId,
      timeToView: Date.now() - this.startTime
    })
  }

  /**
   * Get current user journey
   */
  getUserJourney(): UserJourney {
    const converted = this.events.some(event =>
      event.eventType === 'questionnaire_complete' ||
      event.eventType === 'consultation_view'
    )

    const lastEvent = this.events[this.events.length - 1]
    const dropoffPoint = this.identifyDropoffPoint()

    return {
      sessionId: this.sessionId,
      events: this.events,
      startTime: this.startTime,
      endTime: lastEvent?.timestamp,
      totalDuration: lastEvent ? lastEvent.timestamp - this.startTime : undefined,
      finalAction: lastEvent?.eventType,
      converted,
      dropoffPoint
    }
  }

  /**
   * Calculate conversion metrics
   */
  calculateMetrics(): ConversionMetrics {
    const pageViews = this.events.filter(e => e.eventType === 'page_view').length
    const formStarts = this.events.filter(e => e.eventType === 'form_start').length
    const formSubmissions = this.events.filter(e => e.eventType === 'form_submit').length
    const questionnaireStarts = this.events.filter(e => e.eventType === 'questionnaire_start').length
    const questionnaireCompletions = this.events.filter(e => e.eventType === 'questionnaire_complete').length
    const consultationViews = this.events.filter(e => e.eventType === 'consultation_view').length

    const conversionRate = pageViews > 0 ? (questionnaireCompletions / pageViews) * 100 : 0
    const dropoffRate = formStarts > 0 ? ((formStarts - formSubmissions) / formStarts) * 100 : 0

    const submitTimes = this.events
      .filter(e => e.eventType === 'form_submit')
      .map(e => e.data.timeToSubmit as number)
      .filter(time => typeof time === 'number')

    const avgTimeToSubmit = submitTimes.length > 0
      ? submitTimes.reduce((sum, time) => sum + time, 0) / submitTimes.length
      : 0

    return {
      totalVisitors: pageViews,
      formStarts,
      formSubmissions,
      formCompletions: formSubmissions, // Assuming submissions are completions
      questionnaireStarts,
      questionnaireCompletions,
      consultationViews,
      conversionRate,
      dropoffRate,
      avgTimeToSubmit
    }
  }

  private identifyDropoffPoint(): string | undefined {
    const eventTypes = this.events.map(e => e.eventType)

    if (!eventTypes.includes('form_start')) return 'before_form'
    if (!eventTypes.includes('form_submit')) return 'form_abandonment'
    if (!eventTypes.includes('questionnaire_start')) return 'questionnaire_entry'
    if (!eventTypes.includes('questionnaire_complete')) return 'questionnaire_abandonment'
    if (!eventTypes.includes('consultation_view')) return 'results_page'

    return undefined // No dropoff identified
  }

  private persistEvents(): void {
    try {
      localStorage.setItem(`conversion_events_${this.sessionId}`, JSON.stringify(this.events))
    } catch (error) {
      console.warn('Failed to persist conversion events:', error)
    }
  }

  private async sendToAnalytics(event: ConversionEvent): Promise<void> {
    try {
      const response = await fetch('/api/analytics/conversion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      })

      if (!response.ok) {
        throw new Error(`Analytics API error: ${response.statusText}`)
      }
    } catch (error) {
      // Fail silently for analytics
      console.debug('Analytics tracking failed:', error)
    }
  }

  /**
   * Generate A/B testing variant
   */
  generateVariant(testName: string, variants: string[]): string {
    const hash = this.hashString(`${this.sessionId}_${testName}`)
    const variantIndex = hash % variants.length
    return variants[variantIndex]
  }

  private hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }
}

// Global instance
let conversionTracker: ConversionTracker | null = null

/**
 * Get or create the global conversion tracker instance
 */
export function getConversionTracker(): ConversionTracker {
  if (!conversionTracker) {
    conversionTracker = new ConversionTracker()
  }
  return conversionTracker
}

/**
 * Utility functions for easy tracking
 */
export const trackPageView = (data?: Record<string, unknown>) => {
  getConversionTracker().trackEvent('page_view', data || {})
}

export const trackFormStart = (formId: string, formData?: Record<string, unknown>) => {
  getConversionTracker().trackFormStart(formId, formData)
}

export const trackFormSubmit = (formId: string, formData: Record<string, unknown>) => {
  getConversionTracker().trackFormSubmit(formId, formData)
}

export const trackFormError = (formId: string, errors: Record<string, string>) => {
  getConversionTracker().trackFormError(formId, errors)
}

export const trackCTAClick = (ctaId: string, ctaText: string, position: string) => {
  getConversionTracker().trackCTAClick(ctaId, ctaText, position)
}

export const trackQuestionnaireStart = (questionnaireId: string) => {
  getConversionTracker().trackQuestionnaireStart(questionnaireId)
}

export const trackQuestionnaireComplete = (questionnaireId: string, completionRate: number, timeSpent: number) => {
  getConversionTracker().trackQuestionnaireComplete(questionnaireId, completionRate, timeSpent)
}

export const trackConsultationView = (consultationId: string, planId: string) => {
  getConversionTracker().trackConsultationView(consultationId, planId)
}

/**
 * React hook for conversion tracking
 */
export function useConversionTracking() {
  const tracker = getConversionTracker()

  return {
    trackEvent: tracker.trackEvent.bind(tracker),
    trackFormStart: tracker.trackFormStart.bind(tracker),
    trackFormSubmit: tracker.trackFormSubmit.bind(tracker),
    trackFormError: tracker.trackFormError.bind(tracker),
    trackCTAClick: tracker.trackCTAClick.bind(tracker),
    trackQuestionnaireStart: tracker.trackQuestionnaireStart.bind(tracker),
    trackQuestionnaireComplete: tracker.trackQuestionnaireComplete.bind(tracker),
    trackConsultationView: tracker.trackConsultationView.bind(tracker),
    getUserJourney: tracker.getUserJourney.bind(tracker),
    calculateMetrics: tracker.calculateMetrics.bind(tracker),
    generateVariant: tracker.generateVariant.bind(tracker)
  }
}

/**
 * Performance optimization for tracking
 */
export class OptimizedTracker {
  private static readonly BATCH_SIZE = 10
  private static readonly FLUSH_INTERVAL = 5000 // 5 seconds

  private static eventQueue: ConversionEvent[] = []
  private static flushTimer: NodeJS.Timeout | null = null

  static queueEvent(event: ConversionEvent): void {
    this.eventQueue.push(event)

    if (this.eventQueue.length >= this.BATCH_SIZE) {
      this.flush()
    } else if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush(), this.FLUSH_INTERVAL)
    }
  }

  private static async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return

    const events = [...this.eventQueue]
    this.eventQueue = []

    if (this.flushTimer) {
      clearTimeout(this.flushTimer)
      this.flushTimer = null
    }

    try {
      await fetch('/api/analytics/conversion/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events })
      })
    } catch (error) {
      console.debug('Batch analytics tracking failed:', error)
      // Re-queue events for retry
      this.eventQueue.unshift(...events)
    }
  }
}

/**
 * Initialize conversion tracking for the page
 */
export function initializeConversionTracking(): void {
  if (typeof window !== 'undefined') {
    getConversionTracker()
  }
}