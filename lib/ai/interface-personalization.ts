/**
 * Interface Personalization Engine
 * HT-032.2.4: AI-Powered User Experience & Personalized Admin Interface
 * 
 * Intelligent interface personalization system that adapts the admin interface
 * based on user behavior patterns, preferences, and productivity metrics.
 */

import { userBehaviorAnalyzer, BehaviorPattern, BehaviorInsight } from './user-behavior-analyzer'
import { ai } from '@/lib/ai'

export interface PersonalizationSettings {
  userId: string
  layout: {
    density: 'compact' | 'balanced' | 'spacious'
    sidebar: 'collapsed' | 'expanded' | 'auto'
    theme: 'light' | 'dark' | 'auto'
    fontSize: 'small' | 'medium' | 'large'
    highContrast: boolean
    reducedMotion: boolean
  }
  navigation: {
    quickActions: string[]
    favorites: string[]
    shortcuts: Record<string, string>
    breadcrumbs: boolean
    searchEnabled: boolean
  }
  features: {
    enabled: string[]
    disabled: string[]
    pinned: string[]
    recommendations: boolean
    guidedTours: boolean
  }
  productivity: {
    autoSave: boolean
    keyboardShortcuts: boolean
    batchOperations: boolean
    smartSuggestions: boolean
    workflowOptimization: boolean
  }
  lastUpdated: Date
}

export interface PersonalizationRecommendation {
  type: 'layout' | 'navigation' | 'features' | 'productivity'
  title: string
  description: string
  currentValue: any
  recommendedValue: any
  confidence: number
  impact: 'low' | 'medium' | 'high'
  reasoning: string
}

export interface AdaptiveUIState {
  showQuickActions: boolean
  showRecommendations: boolean
  showGuidedTours: boolean
  showProgressIndicators: boolean
  showContextualHelp: boolean
  autoCollapseSidebar: boolean
  smartSearchEnabled: boolean
  predictiveNavigation: boolean
}

export class InterfacePersonalizationEngine {
  private ai = new ai()
  private personalizationCache = new Map<string, PersonalizationSettings>()

  /**
   * Get personalized settings for a user
   */
  async getPersonalizedSettings(userId: string): Promise<PersonalizationSettings> {
    try {
      // Check cache first
      if (this.personalizationCache.has(userId)) {
        const cached = this.personalizationCache.get(userId)!
        if (Date.now() - cached.lastUpdated.getTime() < 300000) { // 5 minutes
          return cached
        }
      }

      // Get behavior patterns
      const behaviorPattern = await userBehaviorAnalyzer.analyzeBehaviorPatterns(userId)
      const insights = await userBehaviorAnalyzer.generateBehaviorInsights(userId)
      const recommendations = await userBehaviorAnalyzer.getPersonalizedRecommendations(userId)

      // Generate personalized settings
      const settings = await this.generatePersonalizedSettings(userId, behaviorPattern, insights, recommendations)
      
      // Cache the settings
      this.personalizationCache.set(userId, settings)
      
      return settings
    } catch (error) {
      console.error('Error getting personalized settings:', error)
      return this.getDefaultSettings(userId)
    }
  }

  /**
   * Generate personalized settings based on behavior analysis
   */
  private async generatePersonalizedSettings(
    userId: string,
    behaviorPattern: BehaviorPattern | null,
    insights: BehaviorInsight[],
    recommendations: string[]
  ): Promise<PersonalizationSettings> {
    const defaultSettings = this.getDefaultSettings(userId)

    if (!behaviorPattern) {
      return defaultSettings
    }

    // Layout personalization
    const layout = this.personalizeLayout(behaviorPattern, insights)
    
    // Navigation personalization
    const navigation = this.personalizeNavigation(behaviorPattern, insights)
    
    // Feature personalization
    const features = this.personalizeFeatures(behaviorPattern, insights)
    
    // Productivity personalization
    const productivity = this.personalizeProductivity(behaviorPattern, insights)

    return {
      userId,
      layout,
      navigation,
      features,
      productivity,
      lastUpdated: new Date()
    }
  }

  /**
   * Personalize layout based on behavior patterns
   */
  private personalizeLayout(
    pattern: BehaviorPattern,
    insights: BehaviorInsight[]
  ): PersonalizationSettings['layout'] {
    const layoutInsight = insights.find(i => i.category === 'layout')
    
    return {
      density: pattern.optimalInterfaceLayout,
      sidebar: this.determineSidebarPreference(pattern),
      theme: pattern.preferredTheme,
      fontSize: pattern.accessibilityPreferences.fontSize,
      highContrast: pattern.accessibilityPreferences.highContrast,
      reducedMotion: pattern.accessibilityPreferences.reducedMotion
    }
  }

  /**
   * Personalize navigation based on usage patterns
   */
  private personalizeNavigation(
    pattern: BehaviorPattern,
    insights: BehaviorInsight[]
  ): PersonalizationSettings['navigation'] {
    return {
      quickActions: this.getQuickActions(pattern),
      favorites: pattern.preferredPages.slice(0, 5),
      shortcuts: this.generateKeyboardShortcuts(pattern),
      breadcrumbs: pattern.navigationPatterns.length > 3,
      searchEnabled: pattern.mostUsedFeatures.includes('search')
    }
  }

  /**
   * Personalize features based on usage and productivity
   */
  private personalizeFeatures(
    pattern: BehaviorPattern,
    insights: BehaviorInsight[]
  ): PersonalizationSettings['features'] {
    const unusedFeatures = this.identifyUnusedFeatures(pattern)
    
    return {
      enabled: pattern.mostUsedFeatures,
      disabled: unusedFeatures,
      pinned: pattern.mostUsedFeatures.slice(0, 3),
      recommendations: pattern.productivityMetrics.featureDiscoveryRate < 0.1,
      guidedTours: pattern.productivityMetrics.errorRate > 0.05
    }
  }

  /**
   * Personalize productivity settings
   */
  private personalizeProductivity(
    pattern: BehaviorPattern,
    insights: BehaviorInsight[]
  ): PersonalizationSettings['productivity'] {
    return {
      autoSave: pattern.productivityMetrics.tasksCompletedPerHour > 3,
      keyboardShortcuts: pattern.productivityMetrics.tasksCompletedPerHour > 2,
      batchOperations: pattern.productivityMetrics.tasksCompletedPerHour > 1,
      smartSuggestions: pattern.productivityMetrics.featureDiscoveryRate < 0.2,
      workflowOptimization: pattern.productivityMetrics.tasksCompletedPerHour < 2
    }
  }

  /**
   * Get personalization recommendations
   */
  async getPersonalizationRecommendations(userId: string): Promise<PersonalizationRecommendation[]> {
    try {
      const currentSettings = await this.getPersonalizedSettings(userId)
      const behaviorPattern = await userBehaviorAnalyzer.analyzeBehaviorPatterns(userId)
      const insights = await userBehaviorAnalyzer.generateBehaviorInsights(userId)

      if (!behaviorPattern) return []

      const recommendations: PersonalizationRecommendation[] = []

      // Layout recommendations
      if (currentSettings.layout.density !== behaviorPattern.optimalInterfaceLayout) {
        recommendations.push({
          type: 'layout',
          title: 'Optimize Interface Density',
          description: 'Your usage patterns suggest a different interface density would be more efficient.',
          currentValue: currentSettings.layout.density,
          recommendedValue: behaviorPattern.optimalInterfaceLayout,
          confidence: 0.85,
          impact: 'medium',
          reasoning: 'Based on your scroll depth and click patterns, this layout would improve your productivity.'
        })
      }

      // Navigation recommendations
      const suggestedQuickActions = this.getQuickActions(behaviorPattern)
      if (JSON.stringify(currentSettings.navigation.quickActions) !== JSON.stringify(suggestedQuickActions)) {
        recommendations.push({
          type: 'navigation',
          title: 'Optimize Quick Actions',
          description: 'Update your quick actions based on your most frequently used features.',
          currentValue: currentSettings.navigation.quickActions,
          recommendedValue: suggestedQuickActions,
          confidence: 0.90,
          impact: 'high',
          reasoning: 'These are your most frequently used features and would save you time.'
        })
      }

      // Feature recommendations
      if (currentSettings.features.recommendations && behaviorPattern.productivityMetrics.featureDiscoveryRate > 0.3) {
        recommendations.push({
          type: 'features',
          title: 'Disable Feature Recommendations',
          description: 'You\'re already discovering features well on your own.',
          currentValue: true,
          recommendedValue: false,
          confidence: 0.75,
          impact: 'low',
          reasoning: 'Your high feature discovery rate suggests you don\'t need additional recommendations.'
        })
      }

      // Productivity recommendations
      if (!currentSettings.productivity.keyboardShortcuts && behaviorPattern.productivityMetrics.tasksCompletedPerHour < 2) {
        recommendations.push({
          type: 'productivity',
          title: 'Enable Keyboard Shortcuts',
          description: 'Keyboard shortcuts could significantly improve your productivity.',
          currentValue: false,
          recommendedValue: true,
          confidence: 0.80,
          impact: 'high',
          reasoning: 'Your current task completion rate suggests keyboard shortcuts would help.'
        })
      }

      return recommendations
    } catch (error) {
      console.error('Error getting personalization recommendations:', error)
      return []
    }
  }

  /**
   * Get adaptive UI state based on user behavior
   */
  async getAdaptiveUIState(userId: string): Promise<AdaptiveUIState> {
    try {
      const behaviorPattern = await userBehaviorAnalyzer.analyzeBehaviorPatterns(userId)
      if (!behaviorPattern) {
        return this.getDefaultAdaptiveState()
      }

      return {
        showQuickActions: behaviorPattern.mostUsedFeatures.length > 3,
        showRecommendations: behaviorPattern.productivityMetrics.featureDiscoveryRate < 0.2,
        showGuidedTours: behaviorPattern.productivityMetrics.errorRate > 0.05,
        showProgressIndicators: behaviorPattern.productivityMetrics.tasksCompletedPerHour > 2,
        showContextualHelp: behaviorPattern.productivityMetrics.errorRate > 0.1,
        autoCollapseSidebar: behaviorPattern.optimalInterfaceLayout === 'compact',
        smartSearchEnabled: behaviorPattern.mostUsedFeatures.includes('search'),
        predictiveNavigation: behaviorPattern.navigationPatterns.length > 2
      }
    } catch (error) {
      console.error('Error getting adaptive UI state:', error)
      return this.getDefaultAdaptiveState()
    }
  }

  /**
   * Apply personalization settings
   */
  async applyPersonalization(userId: string, settings: Partial<PersonalizationSettings>): Promise<void> {
    try {
      const currentSettings = await this.getPersonalizedSettings(userId)
      const updatedSettings = { ...currentSettings, ...settings, lastUpdated: new Date() }
      
      // Update cache
      this.personalizationCache.set(userId, updatedSettings)
      
      // Track the personalization change
      await userBehaviorAnalyzer.trackBehavior({
        userId,
        action: 'personalization_applied',
        page: '/admin/personalized',
        preferences: settings
      })
    } catch (error) {
      console.error('Error applying personalization:', error)
    }
  }

  /**
   * Helper methods
   */
  private getDefaultSettings(userId: string): PersonalizationSettings {
    return {
      userId,
      layout: {
        density: 'balanced',
        sidebar: 'expanded',
        theme: 'auto',
        fontSize: 'medium',
        highContrast: false,
        reducedMotion: false
      },
      navigation: {
        quickActions: ['templates', 'settings', 'analytics'],
        favorites: [],
        shortcuts: {},
        breadcrumbs: true,
        searchEnabled: true
      },
      features: {
        enabled: [],
        disabled: [],
        pinned: [],
        recommendations: true,
        guidedTours: true
      },
      productivity: {
        autoSave: true,
        keyboardShortcuts: false,
        batchOperations: false,
        smartSuggestions: true,
        workflowOptimization: false
      },
      lastUpdated: new Date()
    }
  }

  private getDefaultAdaptiveState(): AdaptiveUIState {
    return {
      showQuickActions: true,
      showRecommendations: true,
      showGuidedTours: true,
      showProgressIndicators: true,
      showContextualHelp: false,
      autoCollapseSidebar: false,
      smartSearchEnabled: true,
      predictiveNavigation: false
    }
  }

  private determineSidebarPreference(pattern: BehaviorPattern): 'collapsed' | 'expanded' | 'auto' {
    if (pattern.optimalInterfaceLayout === 'compact') return 'collapsed'
    if (pattern.optimalInterfaceLayout === 'spacious') return 'expanded'
    return 'auto'
  }

  private getQuickActions(pattern: BehaviorPattern): string[] {
    return pattern.mostUsedFeatures.slice(0, 5)
  }

  private generateKeyboardShortcuts(pattern: BehaviorPattern): Record<string, string> {
    const shortcuts: Record<string, string> = {}
    pattern.mostUsedFeatures.slice(0, 5).forEach((feature, index) => {
      shortcuts[feature] = `Ctrl+${index + 1}`
    })
    return shortcuts
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
}

export const interfacePersonalizationEngine = new InterfacePersonalizationEngine()
