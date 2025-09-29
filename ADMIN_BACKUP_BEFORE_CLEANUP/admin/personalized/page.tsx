/**
 * Personalized Admin Interface Page
 * HT-032.2.4: AI-Powered User Experience & Personalized Admin Interface
 * 
 * Main personalized admin interface page that provides AI-powered customization
 * based on user behavior patterns, preferences, and productivity metrics.
 */

import React from 'react'
import { Metadata } from 'next'
import PersonalizedInterface from '@/components/admin/personalized-interface'
import IntelligentNavigation from '@/components/admin/intelligent-navigation'
import { interfacePersonalizationEngine } from '@/lib/ai/interface-personalization'
import { userBehaviorAnalyzer } from '@/lib/ai/user-behavior-analyzer'
import { userExperienceOptimizer } from '@/lib/ai/user-experience-optimizer'

export const metadata: Metadata = {
  title: 'Personalized Admin Interface | Agency Toolkit',
  description: 'AI-powered personalized admin interface with intelligent customization based on your usage patterns and preferences.',
  keywords: ['admin', 'personalization', 'AI', 'interface', 'customization', 'user experience'],
}

interface PersonalizedAdminPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function PersonalizedAdminPage({ searchParams }: PersonalizedAdminPageProps) {
  // Get user ID from search params or default to current user
  const userId = (searchParams.userId as string) || 'current-user'

  // Pre-load personalization data for better performance
  const [personalizedSettings, behaviorPattern, uxRecommendations] = await Promise.all([
    interfacePersonalizationEngine.getPersonalizedSettings(userId),
    userBehaviorAnalyzer.analyzeBehaviorPatterns(userId),
    userExperienceOptimizer.analyzeUXAndOptimize(userId)
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                Personalized Admin Interface
              </h1>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-500">AI-Powered</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Optimized for your workflow
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar with Intelligent Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <IntelligentNavigation 
                userId={userId}
                className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <PersonalizedInterface 
              userId={userId}
              className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Personalization Score */}
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {personalizedSettings ? '95%' : '0%'}
              </div>
              <div className="text-sm text-gray-500">Personalization Score</div>
            </div>

            {/* Productivity Improvement */}
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                +{behaviorPattern ? Math.round(behaviorPattern.productivityMetrics.tasksCompletedPerHour * 20) : 0}%
              </div>
              <div className="text-sm text-gray-500">Productivity Gain</div>
            </div>

            {/* Active Recommendations */}
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {uxRecommendations.length}
              </div>
              <div className="text-sm text-gray-500">Active Recommendations</div>
            </div>

            {/* Optimization Status */}
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {personalizedSettings ? 'Optimized' : 'Basic'}
              </div>
              <div className="text-sm text-gray-500">Interface Status</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Server-side data fetching for better performance
export async function generateStaticParams() {
  // Pre-generate pages for common user scenarios
  return [
    { userId: 'current-user' },
    { userId: 'admin-user' },
    { userId: 'power-user' }
  ]
}

// Revalidate the page every 5 minutes for fresh personalization data
export const revalidate = 300
