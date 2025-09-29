/**
 * AI-Powered User Behavior Analysis System
 * HT-032.2.4: AI-Powered User Experience & Personalized Admin Interface
 * 
 * Analyzes user behavior patterns, preferences, and interactions to provide
 * intelligent insights for personalized admin interface optimization.
 */

import { createClient } from '@/lib/supabase/client'
import { ai } from '@/lib/ai'

export interface UserBehaviorData {
  userId: string
  sessionId: string
  timestamp: Date
  action: string
  page: string
  duration: number
  clicks: number
  scrollDepth: number
  featuresUsed: string[]
  preferences: Record<string, any>
  deviceType: 'desktop' | 'mobile' | 'tablet'
  browserInfo: string
}

export interface BehaviorPattern {
  userId: string
  commonActions: string[]
  preferredPages: string[]
  averageSessionDuration: number
  mostUsedFeatures: string[]
  navigationPatterns: string[]
  optimalInterfaceLayout: 'compact' | 'spacious' | 'balanced'
  preferredTheme: 'light' | 'dark' | 'auto'
  accessibilityPreferences: {
    fontSize: 'small' | 'medium' | 'large'
    highContrast: boolean
    reducedMotion: boolean
  }
  productivityMetrics: {
    tasksCompletedPerHour: number
    averageTimePerTask: number
    errorRate: number
    featureDiscoveryRate: number
  }
  lastUpdated: Date
}

export interface BehaviorInsight {
  type: 'efficiency' | 'usability' | 'preference' | 'optimization'
  title: string
  description: string
  recommendation: string
  confidence: number
  impact: 'low' | 'medium' | 'high'
  category: string
}

export class UserBehaviorAnalyzer {
  private supabase = createClient()
  private ai = new ai()

  /**
   * Track user behavior data
   */
  async trackBehavior(data: Partial<UserBehaviorData>): Promise<void> {
    try {
      const behaviorData: UserBehaviorData = {
        userId: data.userId || 'anonymous',
        sessionId: data.sessionId || this.generateSessionId(),
        timestamp: new Date(),
        action: data.action || 'page_view',
        page: data.page || '/',
        duration: data.duration || 0,
        clicks: data.clicks || 0,
        scrollDepth: data.scrollDepth || 0,
        featuresUsed: data.featuresUsed || [],
        preferences: data.preferences || {},
        deviceType: data.deviceType || 'desktop',
        browserInfo: data.browserInfo || 'unknown',
      }

      const { error } = await this.supabase
        .from('user_behavior_tracking')
        .insert([behaviorData])

      if (error) {
        console.error('Error tracking user behavior:', error)
      }
    } catch (error) {
      console.error('Error in trackBehavior:', error)
    }
  }

  /**
   * Analyze user behavior patterns
   */
  async analyzeBehaviorPatterns(userId: string): Promise<BehaviorPattern | null> {
    try {
      const { data: behaviorData, error } = await this.supabase
        .from('user_behavior_tracking')
        .select('*')
        .eq('userId', userId)
        .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // Last 30 days

      if (error || !behaviorData) {
        console.error('Error fetching behavior data:', error)
        return null
      }

      return this.processBehaviorData(behaviorData, userId)
    } catch (error) {
      console.error('Error analyzing behavior patterns:', error)
      return null
    }
  }

  /**
   * Process raw behavior data into patterns
   */
  private processBehaviorData(data: UserBehaviorData[], userId: string): BehaviorPattern {
    const actions = data.map(d => d.action)
    const pages = data.map(d => d.page)
    const features = data.flatMap(d => d.featuresUsed)
    
    // Calculate metrics
    const totalDuration = data.reduce((sum, d) => sum + d.duration, 0)
    const averageSessionDuration = totalDuration / data.length
    
    const actionCounts = this.countOccurrences(actions)
    const pageCounts = this.countOccurrences(pages)
    const featureCounts = this.countOccurrences(features)
    
    // Determine preferences
    const optimalLayout = this.determineOptimalLayout(data)
    const preferredTheme = this.determinePreferredTheme(data)
    const accessibilityPrefs = this.analyzeAccessibilityPreferences(data)
    
    // Calculate productivity metrics
    const productivityMetrics = this.calculateProductivityMetrics(data)
    
    return {
      userId,
      commonActions: Object.keys(actionCounts).slice(0, 10),
      preferredPages: Object.keys(pageCounts).slice(0, 10),
      averageSessionDuration,
      mostUsedFeatures: Object.keys(featureCounts).slice(0, 10),
      navigationPatterns: this.analyzeNavigationPatterns(data),
      optimalInterfaceLayout: optimalLayout,
      preferredTheme,
      accessibilityPreferences: accessibilityPrefs,
      productivityMetrics,
      lastUpdated: new Date()
    }
  }

  /**
   * Generate AI-powered behavior insights
   */
  async generateBehaviorInsights(userId: string): Promise<BehaviorInsight[]> {
    try {
      const pattern = await this.analyzeBehaviorPatterns(userId)
      if (!pattern) return []

      const insights: BehaviorInsight[] = []

      // Efficiency insights
      if (pattern.productivityMetrics.tasksCompletedPerHour < 2) {
        insights.push({
          type: 'efficiency',
          title: 'Low Task Completion Rate',
          description: 'Your task completion rate is below average. Consider optimizing your workflow.',
          recommendation: 'Enable quick actions and keyboard shortcuts to improve efficiency.',
          confidence: 0.85,
          impact: 'high',
          category: 'productivity'
        })
      }

      // Usability insights
      if (pattern.productivityMetrics.errorRate > 0.1) {
        insights.push({
          type: 'usability',
          title: 'High Error Rate Detected',
          description: 'You\'re encountering more errors than usual. The interface might need simplification.',
          recommendation: 'Enable guided tours and contextual help for complex features.',
          confidence: 0.90,
          impact: 'medium',
          category: 'usability'
        })
      }

      // Preference insights
      if (pattern.optimalInterfaceLayout === 'compact') {
        insights.push({
          type: 'preference',
          title: 'Compact Interface Preference',
          description: 'Your behavior suggests you prefer compact, information-dense interfaces.',
          recommendation: 'Switch to compact view mode for better information density.',
          confidence: 0.75,
          impact: 'medium',
          category: 'layout'
        })
      }

      // Optimization insights
      const unusedFeatures = this.identifyUnusedFeatures(pattern)
      if (unusedFeatures.length > 0) {
        insights.push({
          type: 'optimization',
          title: 'Unused Features Detected',
          description: `You have ${unusedFeatures.length} features that could improve your workflow.`,
          recommendation: 'Consider enabling advanced features based on your usage patterns.',
          confidence: 0.70,
          impact: 'low',
          category: 'features'
        })
      }

      return insights
    } catch (error) {
      console.error('Error generating behavior insights:', error)
      return []
    }
  }

  /**
   * Get personalized recommendations
   */
  async getPersonalizedRecommendations(userId: string): Promise<string[]> {
    try {
      const pattern = await this.analyzeBehaviorPatterns(userId)
      if (!pattern) return []

      const recommendations: string[] = []

      // Based on usage patterns
      if (pattern.mostUsedFeatures.includes('templates')) {
        recommendations.push('Enable template shortcuts for faster access')
      }

      if (pattern.optimalInterfaceLayout === 'spacious') {
        recommendations.push('Switch to spacious layout for better readability')
      }

      if (pattern.accessibilityPreferences.highContrast) {
        recommendations.push('Enable high contrast mode for better visibility')
      }

      if (pattern.averageSessionDuration > 3600000) { // 1 hour
        recommendations.push('Take regular breaks to maintain productivity')
      }

      return recommendations
    } catch (error) {
      console.error('Error getting personalized recommendations:', error)
      return []
    }
  }

  /**
   * Helper methods
   */
  private countOccurrences(items: string[]): Record<string, number> {
    return items.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  private determineOptimalLayout(data: UserBehaviorData[]): 'compact' | 'spacious' | 'balanced' {
    const avgScrollDepth = data.reduce((sum, d) => sum + d.scrollDepth, 0) / data.length
    const avgClicks = data.reduce((sum, d) => sum + d.clicks, 0) / data.length
    
    if (avgScrollDepth > 80 && avgClicks > 10) return 'spacious'
    if (avgScrollDepth < 40 && avgClicks < 5) return 'compact'
    return 'balanced'
  }

  private determinePreferredTheme(data: UserBehaviorData[]): 'light' | 'dark' | 'auto' {
    const themePreferences = data.map(d => d.preferences.theme).filter(Boolean)
    if (themePreferences.length === 0) return 'auto'
    
    const themeCounts = this.countOccurrences(themePreferences)
    const mostCommon = Object.keys(themeCounts).reduce((a, b) => 
      themeCounts[a] > themeCounts[b] ? a : b
    )
    
    return mostCommon as 'light' | 'dark' | 'auto'
  }

  private analyzeAccessibilityPreferences(data: UserBehaviorData[]): BehaviorPattern['accessibilityPreferences'] {
    const fontSizePrefs = data.map(d => d.preferences.fontSize).filter(Boolean)
    const highContrastPrefs = data.map(d => d.preferences.highContrast).filter(Boolean)
    const reducedMotionPrefs = data.map(d => d.preferences.reducedMotion).filter(Boolean)
    
    return {
      fontSize: this.getMostCommon(fontSizePrefs, 'medium') as 'small' | 'medium' | 'large',
      highContrast: highContrastPrefs.length > 0 && highContrastPrefs.filter(Boolean).length > highContrastPrefs.length / 2,
      reducedMotion: reducedMotionPrefs.length > 0 && reducedMotionPrefs.filter(Boolean).length > reducedMotionPrefs.length / 2
    }
  }

  private calculateProductivityMetrics(data: UserBehaviorData[]): BehaviorPattern['productivityMetrics'] {
    const completedTasks = data.filter(d => d.action === 'task_completed').length
    const totalTime = data.reduce((sum, d) => sum + d.duration, 0)
    const errors = data.filter(d => d.action === 'error').length
    const newFeatures = data.filter(d => d.action === 'feature_discovered').length
    
    return {
      tasksCompletedPerHour: (completedTasks / (totalTime / 3600000)) || 0,
      averageTimePerTask: totalTime / completedTasks || 0,
      errorRate: errors / data.length || 0,
      featureDiscoveryRate: newFeatures / data.length || 0
    }
  }

  private analyzeNavigationPatterns(data: UserBehaviorData[]): string[] {
    const pages = data.map(d => d.page)
    const patterns: string[] = []
    
    for (let i = 0; i < pages.length - 1; i++) {
      const pattern = `${pages[i]} -> ${pages[i + 1]}`
      patterns.push(pattern)
    }
    
    const patternCounts = this.countOccurrences(patterns)
    return Object.keys(patternCounts).slice(0, 5)
  }

  private identifyUnusedFeatures(pattern: BehaviorPattern): string[] {
    const allFeatures = [
      'templates', 'analytics', 'settings', 'users', 'branding', 
      'modules', 'customization', 'delivery', 'ai-assistant'
    ]
    
    return allFeatures.filter(feature => 
      !pattern.mostUsedFeatures.includes(feature)
    )
  }

  private getMostCommon<T>(items: T[], defaultValue: T): T {
    if (items.length === 0) return defaultValue
    
    const counts = items.reduce((acc, item) => {
      acc[item as string] = (acc[item as string] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return Object.keys(counts).reduce((a, b) => 
      counts[a] > counts[b] ? a : b
    ) as T
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

export const userBehaviorAnalyzer = new UserBehaviorAnalyzer()
