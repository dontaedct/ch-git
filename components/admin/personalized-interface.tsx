/**
 * Personalized Interface Components
 * HT-032.2.4: AI-Powered User Experience & Personalized Admin Interface
 * 
 * AI-powered personalized interface components that adapt the admin interface
 * based on user behavior patterns, preferences, and productivity metrics.
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Settings, 
  Palette, 
  Layout, 
  Zap, 
  TrendingUp, 
  Target, 
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Info,
  RefreshCw,
  Eye,
  EyeOff,
  Maximize,
  Minimize,
  Grid,
  List,
  Monitor,
  Smartphone,
  Tablet,
  Moon,
  Sun,
  Contrast,
  Type,
  Volume2,
  VolumeX
} from 'lucide-react'
import { interfacePersonalizationEngine, PersonalizationSettings, PersonalizationRecommendation } from '@/lib/ai/interface-personalization'
import { userBehaviorAnalyzer, BehaviorPattern, BehaviorInsight } from '@/lib/ai/user-behavior-analyzer'
import { userExperienceOptimizer, UXOptimizationRecommendation } from '@/lib/ai/user-experience-optimizer'

interface PersonalizedInterfaceProps {
  userId?: string
  className?: string
}

interface SettingCardProps {
  title: string
  description: string
  icon: React.ReactNode
  children: React.ReactNode
  isEnabled?: boolean
  onToggle?: (enabled: boolean) => void
}

interface RecommendationCardProps {
  recommendation: PersonalizationRecommendation | UXOptimizationRecommendation
  onApply: () => void
  onDismiss: () => void
}

export const PersonalizedInterface: React.FC<PersonalizedInterfaceProps> = ({ 
  userId = 'current-user', 
  className = '' 
}) => {
  const [personalizedSettings, setPersonalizedSettings] = useState<PersonalizationSettings | null>(null)
  const [behaviorPattern, setBehaviorPattern] = useState<BehaviorPattern | null>(null)
  const [behaviorInsights, setBehaviorInsights] = useState<BehaviorInsight[]>([])
  const [personalizationRecommendations, setPersonalizationRecommendations] = useState<PersonalizationRecommendation[]>([])
  const [uxOptimizations, setUxOptimizations] = useState<UXOptimizationRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'settings' | 'recommendations' | 'insights'>('settings')

  useEffect(() => {
    initializePersonalization()
  }, [userId])

  const initializePersonalization = async () => {
    try {
      setIsLoading(true)
      
      // Load all personalization data
      const [
        settings,
        pattern,
        insights,
        personalizationRecs,
        optimizationRecs
      ] = await Promise.all([
        interfacePersonalizationEngine.getPersonalizedSettings(userId),
        userBehaviorAnalyzer.analyzeBehaviorPatterns(userId),
        userBehaviorAnalyzer.generateBehaviorInsights(userId),
        interfacePersonalizationEngine.getPersonalizationRecommendations(userId),
        userExperienceOptimizer.analyzeUXAndOptimize(userId)
      ])

      setPersonalizedSettings(settings)
      setBehaviorPattern(pattern)
      setBehaviorInsights(insights)
      setPersonalizationRecommendations(personalizationRecs)
      setUxOptimizations(optimizationRecs)
      
    } catch (error) {
      console.error('Error initializing personalization:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSettingChange = useCallback(async (key: string, value: any) => {
    if (!personalizedSettings) return

    try {
      const updatedSettings = { ...personalizedSettings }
      
      // Update nested settings
      const keys = key.split('.')
      let current = updatedSettings
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i] as keyof typeof current] as any
      }
      current[keys[keys.length - 1] as keyof typeof current] = value

      // Apply the changes
      await interfacePersonalizationEngine.applyPersonalization(userId, updatedSettings)
      setPersonalizedSettings(updatedSettings)

      // Track the setting change
      await userBehaviorAnalyzer.trackBehavior({
        userId,
        action: 'setting_changed',
        page: '/admin/personalized',
        preferences: { [key]: value }
      })
    } catch (error) {
      console.error('Error updating setting:', error)
    }
  }, [userId, personalizedSettings])

  const handleApplyRecommendation = useCallback(async (recommendation: PersonalizationRecommendation | UXOptimizationRecommendation) => {
    try {
      if ('recommendedValue' in recommendation) {
        // Personalization recommendation
        await interfacePersonalizationEngine.applyPersonalization(userId, {
          [recommendation.type]: recommendation.recommendedValue
        })
      } else {
        // UX optimization recommendation
        await userExperienceOptimizer.applyOptimization(userId, recommendation)
      }

      // Refresh data
      await initializePersonalization()
    } catch (error) {
      console.error('Error applying recommendation:', error)
    }
  }, [userId])

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-8 bg-gray-200 rounded-lg mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Personalized Interface</h1>
          <p className="text-gray-600 mt-1">
            AI-powered interface customization based on your usage patterns
          </p>
        </div>
        
        <button
          onClick={initializePersonalization}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
            { id: 'insights', label: 'Insights', icon: TrendingUp }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'settings' && personalizedSettings && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Layout Settings */}
          <SettingCard
            title="Layout & Appearance"
            description="Customize your interface layout and visual preferences"
            icon={<Layout size={20} />}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interface Density
                </label>
                <select
                  value={personalizedSettings.layout.density}
                  onChange={(e) => handleSettingChange('layout.density', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="compact">Compact</option>
                  <option value="balanced">Balanced</option>
                  <option value="spacious">Spacious</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <div className="flex space-x-2">
                  {[
                    { value: 'light', icon: Sun, label: 'Light' },
                    { value: 'dark', icon: Moon, label: 'Dark' },
                    { value: 'auto', icon: Monitor, label: 'Auto' }
                  ].map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => handleSettingChange('layout.theme', theme.value)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
                        personalizedSettings.layout.theme === theme.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <theme.icon size={16} />
                      <span className="text-sm">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Size
                </label>
                <select
                  value={personalizedSettings.layout.fontSize}
                  onChange={(e) => handleSettingChange('layout.fontSize', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
          </SettingCard>

          {/* Navigation Settings */}
          <SettingCard
            title="Navigation & Shortcuts"
            description="Customize your navigation preferences and keyboard shortcuts"
            icon={<Zap size={20} />}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Breadcrumbs</div>
                  <div className="text-sm text-gray-500">Show navigation breadcrumbs</div>
                </div>
                <button
                  onClick={() => handleSettingChange('navigation.breadcrumbs', !personalizedSettings.navigation.breadcrumbs)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    personalizedSettings.navigation.breadcrumbs ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      personalizedSettings.navigation.breadcrumbs ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Search Enabled</div>
                  <div className="text-sm text-gray-500">Enable global search functionality</div>
                </div>
                <button
                  onClick={() => handleSettingChange('navigation.searchEnabled', !personalizedSettings.navigation.searchEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    personalizedSettings.navigation.searchEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      personalizedSettings.navigation.searchEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Actions
                </label>
                <div className="space-y-2">
                  {personalizedSettings.navigation.quickActions.map((action, index) => (
                    <div key={action} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 capitalize">{action}</span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {personalizedSettings.navigation.shortcuts[action] || `Ctrl+${index + 1}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SettingCard>

          {/* Accessibility Settings */}
          <SettingCard
            title="Accessibility"
            description="Accessibility and usability preferences"
            icon={<Contrast size={20} />}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">High Contrast</div>
                  <div className="text-sm text-gray-500">Enable high contrast mode</div>
                </div>
                <button
                  onClick={() => handleSettingChange('layout.highContrast', !personalizedSettings.layout.highContrast)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    personalizedSettings.layout.highContrast ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      personalizedSettings.layout.highContrast ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Reduced Motion</div>
                  <div className="text-sm text-gray-500">Reduce animations and transitions</div>
                </div>
                <button
                  onClick={() => handleSettingChange('layout.reducedMotion', !personalizedSettings.layout.reducedMotion)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    personalizedSettings.layout.reducedMotion ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      personalizedSettings.layout.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </SettingCard>

          {/* Productivity Settings */}
          <SettingCard
            title="Productivity"
            description="Productivity and workflow optimization settings"
            icon={<Target size={20} />}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Auto Save</div>
                  <div className="text-sm text-gray-500">Automatically save your work</div>
                </div>
                <button
                  onClick={() => handleSettingChange('productivity.autoSave', !personalizedSettings.productivity.autoSave)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    personalizedSettings.productivity.autoSave ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      personalizedSettings.productivity.autoSave ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Keyboard Shortcuts</div>
                  <div className="text-sm text-gray-500">Enable keyboard shortcuts</div>
                </div>
                <button
                  onClick={() => handleSettingChange('productivity.keyboardShortcuts', !personalizedSettings.productivity.keyboardShortcuts)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    personalizedSettings.productivity.keyboardShortcuts ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      personalizedSettings.productivity.keyboardShortcuts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Smart Suggestions</div>
                  <div className="text-sm text-gray-500">Show AI-powered suggestions</div>
                </div>
                <button
                  onClick={() => handleSettingChange('productivity.smartSuggestions', !personalizedSettings.productivity.smartSuggestions)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    personalizedSettings.productivity.smartSuggestions ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      personalizedSettings.productivity.smartSuggestions ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </SettingCard>
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personalization Recommendations */}
            {personalizationRecommendations.map((recommendation) => (
              <RecommendationCard
                key={recommendation.title}
                recommendation={recommendation}
                onApply={() => handleApplyRecommendation(recommendation)}
                onDismiss={() => {}}
              />
            ))}

            {/* UX Optimization Recommendations */}
            {uxOptimizations.map((recommendation) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                onApply={() => handleApplyRecommendation(recommendation)}
                onDismiss={() => {}}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-4">
          {/* Behavior Insights */}
          {behaviorInsights.map((insight) => (
            <div key={insight.title} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${
                  insight.type === 'efficiency' ? 'bg-green-100 text-green-600' :
                  insight.type === 'usability' ? 'bg-yellow-100 text-yellow-600' :
                  insight.type === 'preference' ? 'bg-blue-100 text-blue-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {insight.type === 'efficiency' && <TrendingUp size={16} />}
                  {insight.type === 'usability' && <AlertCircle size={16} />}
                  {insight.type === 'preference' && <Target size={16} />}
                  {insight.type === 'optimization' && <Lightbulb size={16} />}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{insight.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                  <p className="text-sm text-blue-600 mt-2">{insight.recommendation}</p>
                  <div className="flex items-center space-x-4 mt-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      insight.impact === 'high' ? 'bg-red-100 text-red-700' :
                      insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {insight.impact} impact
                    </span>
                    <span className="text-xs text-gray-500">
                      {Math.round(insight.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const SettingCard: React.FC<SettingCardProps> = ({ 
  title, 
  description, 
  icon, 
  children,
  isEnabled = true,
  onToggle 
}) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {icon}
          <div>
            <h3 className="font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        {onToggle && (
          <button
            onClick={() => onToggle(!isEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isEnabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ 
  recommendation, 
  onApply, 
  onDismiss 
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-red-500 bg-red-50'
      case 'high': return 'border-orange-500 bg-orange-50'
      case 'medium': return 'border-yellow-500 bg-yellow-50'
      default: return 'border-blue-500 bg-blue-50'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertCircle size={16} className="text-red-600" />
      case 'high': return <TrendingUp size={16} className="text-orange-600" />
      case 'medium': return <Info size={16} className="text-yellow-600" />
      default: return <Lightbulb size={16} className="text-blue-600" />
    }
  }

  const priority = 'priority' in recommendation ? recommendation.priority : 'medium'

  return (
    <div className={`p-4 rounded-lg border-2 ${getPriorityColor(priority)}`}>
      <div className="flex items-start space-x-3">
        {getPriorityIcon(priority)}
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{recommendation.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{recommendation.description}</p>
          
          {'reasoning' in recommendation && (
            <p className="text-sm text-blue-600 mt-2">{recommendation.reasoning}</p>
          )}
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              <span className={`text-xs px-2 py-1 rounded-full ${
                priority === 'critical' ? 'bg-red-100 text-red-700' :
                priority === 'high' ? 'bg-orange-100 text-orange-700' :
                priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {priority} priority
              </span>
              <span className="text-xs text-gray-500">
                {Math.round(recommendation.confidence * 100)}% confidence
              </span>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={onApply}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                Apply
              </button>
              <button
                onClick={onDismiss}
                className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PersonalizedInterface
