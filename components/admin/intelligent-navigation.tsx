/**
 * Intelligent Navigation Components
 * HT-032.2.4: AI-Powered User Experience & Personalized Admin Interface
 * 
 * AI-powered navigation components that adapt based on user behavior patterns,
 * providing intelligent shortcuts, predictive navigation, and personalized menus.
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Search, 
  Clock, 
  Star, 
  Zap, 
  TrendingUp, 
  Bookmark, 
  History,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Lightbulb,
  Target,
  BarChart3
} from 'lucide-react'
import { interfacePersonalizationEngine, PersonalizationSettings } from '@/lib/ai/interface-personalization'
import { userBehaviorAnalyzer, BehaviorPattern } from '@/lib/ai/user-behavior-analyzer'
import { userExperienceOptimizer } from '@/lib/ai/user-experience-optimizer'

interface NavigationItem {
  id: string
  label: string
  href: string
  icon: React.ReactNode
  category: 'core' | 'features' | 'tools' | 'analytics'
  frequency: number
  lastUsed?: Date
  isRecommended?: boolean
  shortcut?: string
}

interface IntelligentNavigationProps {
  userId?: string
  className?: string
}

interface QuickActionProps {
  item: NavigationItem
  onClick: () => void
  isActive: boolean
}

interface PredictiveSearchProps {
  onSelect: (item: NavigationItem) => void
  placeholder?: string
}

interface SmartSidebarProps {
  isCollapsed: boolean
  onToggle: () => void
  items: NavigationItem[]
  onItemClick: (item: NavigationItem) => void
}

export const IntelligentNavigation: React.FC<IntelligentNavigationProps> = ({ 
  userId = 'current-user', 
  className = '' 
}) => {
  const [personalizedSettings, setPersonalizedSettings] = useState<PersonalizationSettings | null>(null)
  const [behaviorPattern, setBehaviorPattern] = useState<BehaviorPattern | null>(null)
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showRecommendations, setShowRecommendations] = useState(false)

  useEffect(() => {
    initializeNavigation()
  }, [userId])

  const initializeNavigation = async () => {
    try {
      setIsLoading(true)
      
      // Load personalized settings and behavior patterns
      const [settings, pattern] = await Promise.all([
        interfacePersonalizationEngine.getPersonalizedSettings(userId),
        userBehaviorAnalyzer.analyzeBehaviorPatterns(userId)
      ])

      setPersonalizedSettings(settings)
      setBehaviorPattern(pattern)

      // Generate intelligent navigation items
      const items = generateNavigationItems(settings, pattern)
      setNavigationItems(items)

      // Show recommendations if needed
      const adaptiveState = await interfacePersonalizationEngine.getAdaptiveUIState(userId)
      setShowRecommendations(adaptiveState.showRecommendations)
      
    } catch (error) {
      console.error('Error initializing navigation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateNavigationItems = (
    settings: PersonalizationSettings | null,
    pattern: BehaviorPattern | null
  ): NavigationItem[] => {
    const baseItems: NavigationItem[] = [
      { id: 'dashboard', label: 'Dashboard', href: '/admin', icon: <BarChart3 size={16} />, category: 'core', frequency: 100 },
      { id: 'templates', label: 'Templates', href: '/admin/templates', icon: <Bookmark size={16} />, category: 'features', frequency: 80 },
      { id: 'settings', label: 'Settings', href: '/admin/settings', icon: <Target size={16} />, category: 'core', frequency: 60 },
      { id: 'analytics', label: 'Analytics', href: '/admin/analytics', icon: <TrendingUp size={16} />, category: 'analytics', frequency: 40 },
      { id: 'users', label: 'Users', href: '/admin/users', icon: <Star size={16} />, category: 'core', frequency: 30 },
      { id: 'branding', label: 'Branding', href: '/admin/branding', icon: <Zap size={16} />, category: 'features', frequency: 25 },
      { id: 'modules', label: 'Modules', href: '/admin/modules', icon: <Menu size={16} />, category: 'tools', frequency: 20 },
      { id: 'customization', label: 'Customization', href: '/admin/customization', icon: <Lightbulb size={16} />, category: 'features', frequency: 15 }
    ]

    // Apply personalization based on behavior patterns
    if (pattern) {
      return baseItems.map(item => {
        const frequency = pattern.mostUsedFeatures.includes(item.id) ? 
          pattern.mostUsedFeatures.indexOf(item.id) * 10 + 90 : item.frequency
        
        const isRecommended = pattern.mostUsedFeatures.slice(0, 3).includes(item.id)
        
        return {
          ...item,
          frequency,
          isRecommended,
          shortcut: settings?.navigation.shortcuts[item.id]
        }
      }).sort((a, b) => b.frequency - a.frequency)
    }

    return baseItems
  }

  const handleItemClick = useCallback(async (item: NavigationItem) => {
    // Track navigation behavior
    await userBehaviorAnalyzer.trackBehavior({
      userId,
      action: 'navigation_click',
      page: item.href,
      featuresUsed: [item.id]
    })
  }, [userId])

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query)
    
    if (query.length > 2) {
      // Track search behavior
      await userBehaviorAnalyzer.trackBehavior({
        userId,
        action: 'search',
        page: '/admin',
        preferences: { searchQuery: query }
      })
    }
  }, [userId])

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-12 bg-gray-200 rounded-lg mb-4"></div>
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Intelligent Search */}
      <PredictiveSearch 
        onSelect={handleItemClick}
        placeholder="Search admin features..."
      />

      {/* Quick Actions */}
      {personalizedSettings?.navigation.quickActions && (
        <QuickActions 
          items={navigationItems.filter(item => 
            personalizedSettings.navigation.quickActions.includes(item.id)
          )}
          onItemClick={handleItemClick}
        />
      )}

      {/* Smart Navigation Menu */}
      <SmartNavigationMenu 
        items={navigationItems}
        onItemClick={handleItemClick}
        showRecommendations={showRecommendations}
      />

      {/* Recent Activity */}
      <RecentActivity 
        items={navigationItems.slice(0, 5)}
        onItemClick={handleItemClick}
      />
    </div>
  )
}

const PredictiveSearch: React.FC<PredictiveSearchProps> = ({ onSelect, placeholder }) => {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<NavigationItem[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    
    if (value.length > 2) {
      // Generate suggestions based on query
      const filtered = generateSearchSuggestions(value)
      setSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const generateSearchSuggestions = (query: string): NavigationItem[] => {
    const allItems: NavigationItem[] = [
      { id: 'dashboard', label: 'Dashboard', href: '/admin', icon: <BarChart3 size={16} />, category: 'core', frequency: 100 },
      { id: 'templates', label: 'Templates', href: '/admin/templates', icon: <Bookmark size={16} />, category: 'features', frequency: 80 },
      { id: 'settings', label: 'Settings', href: '/admin/settings', icon: <Target size={16} />, category: 'core', frequency: 60 },
      { id: 'analytics', label: 'Analytics', href: '/admin/analytics', icon: <TrendingUp size={16} />, category: 'analytics', frequency: 40 },
      { id: 'users', label: 'Users', href: '/admin/users', icon: <Star size={16} />, category: 'core', frequency: 30 },
      { id: 'branding', label: 'Branding', href: '/admin/branding', icon: <Zap size={16} />, category: 'features', frequency: 25 },
      { id: 'modules', label: 'Modules', href: '/admin/modules', icon: <Menu size={16} />, category: 'tools', frequency: 20 },
      { id: 'customization', label: 'Customization', href: '/admin/customization', icon: <Lightbulb size={16} />, category: 'features', frequency: 15 }
    ]

    return allItems.filter(item => 
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5)
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {suggestions.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSelect(item)
                setQuery('')
                setShowSuggestions(false)
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
            >
              {item.icon}
              <span>{item.label}</span>
              <span className="text-xs text-gray-500 ml-auto capitalize">{item.category}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const QuickActions: React.FC<{ items: NavigationItem[]; onItemClick: (item: NavigationItem) => void }> = ({ 
  items, 
  onItemClick 
}) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700 flex items-center">
        <Zap size={16} className="mr-2" />
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {items.slice(0, 4).map((item) => (
          <QuickAction 
            key={item.id}
            item={item}
            onClick={() => onItemClick(item)}
            isActive={false}
          />
        ))}
      </div>
    </div>
  )
}

const QuickAction: React.FC<QuickActionProps> = ({ item, onClick, isActive }) => {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
        isActive 
          ? 'border-blue-500 bg-blue-50 text-blue-700' 
          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
      }`}
    >
      <div className="flex items-center space-x-2">
        {item.icon}
        <span className="text-sm font-medium">{item.label}</span>
      </div>
      {item.shortcut && (
        <div className="text-xs text-gray-500 mt-1">{item.shortcut}</div>
      )}
    </button>
  )
}

const SmartNavigationMenu: React.FC<{ 
  items: NavigationItem[]; 
  onItemClick: (item: NavigationItem) => void;
  showRecommendations: boolean;
}> = ({ items, onItemClick, showRecommendations }) => {
  const pathname = usePathname()

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, NavigationItem[]>)

  return (
    <div className="space-y-4">
      {Object.entries(groupedItems).map(([category, categoryItems]) => (
        <div key={category} className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 capitalize flex items-center">
            {category === 'core' && <Target size={16} className="mr-2" />}
            {category === 'features' && <Zap size={16} className="mr-2" />}
            {category === 'tools' && <Menu size={16} className="mr-2" />}
            {category === 'analytics' && <TrendingUp size={16} className="mr-2" />}
            {category}
          </h3>
          
          <div className="space-y-1">
            {categoryItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => onItemClick(item)}
                className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                  {item.isRecommended && showRecommendations && (
                    <Lightbulb size={14} className="text-yellow-500" />
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {item.shortcut && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {item.shortcut}
                    </span>
                  )}
                  <ChevronRight size={14} className="text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const RecentActivity: React.FC<{ 
  items: NavigationItem[]; 
  onItemClick: (item: NavigationItem) => void;
}> = ({ items, onItemClick }) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700 flex items-center">
        <History size={16} className="mr-2" />
        Recent Activity
      </h3>
      
      <div className="space-y-1">
        {items.slice(0, 3).map((item, index) => (
          <button
            key={item.id}
            onClick={() => onItemClick(item)}
            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Clock size={14} className="text-gray-400" />
              <span className="text-sm">{item.label}</span>
            </div>
            <span className="text-xs text-gray-500">
              {index === 0 ? '2m ago' : index === 1 ? '15m ago' : '1h ago'}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default IntelligentNavigation
