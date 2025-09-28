'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { QuestionnaireEngine } from '@/components/questionnaire-engine'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeft,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  TrendingUp,
  Target,
  Brain
} from 'lucide-react'
import { toast } from 'sonner'
import { useConsultationStore } from '@/lib/consultation/state-manager'
import { ENHANCED_CONSULTATION_QUESTIONNAIRE } from '@/lib/consultation/questionnaire-config'
import { applyQuestionRouting, calculateAIReadiness } from '@/lib/consultation/question-routing'

interface ConsultationQuestionnaireWrapperProps {
  onComplete: (answers: Record<string, unknown>) => void
  onBackToLanding: () => void
}

interface AnalyticsData {
  startTime: number
  questionTimes: Record<string, number>
  totalQuestions: number
  questionsAnswered: number
  completionRate: number
  aiReadinessScore: number
}

export function ConsultationQuestionnaireWrapper({
  onComplete,
  onBackToLanding
}: ConsultationQuestionnaireWrapperProps) {
  const router = useRouter()
  const { currentSession, updateSession, saveQuestionnaireAnswers } = useConsultationStore()

  const [analytics, setAnalytics] = useState<AnalyticsData>({
    startTime: Date.now(),
    questionTimes: {},
    totalQuestions: 0,
    questionsAnswered: 0,
    completionRate: 0,
    aiReadinessScore: 0
  })

  const [insights, setInsights] = useState<{
    show: boolean
    message: string
    type: 'tip' | 'warning' | 'success'
  }>({
    show: false,
    message: '',
    type: 'tip'
  })

  const [isProcessing, setIsProcessing] = useState(false)

  // Enhanced questionnaire configuration with dynamic routing
  const [questionnaireConfig, setQuestionnaireConfig] = useState(ENHANCED_CONSULTATION_QUESTIONNAIRE)

  useEffect(() => {
    if (!currentSession) {
      toast.error('Please start from the beginning')
      onBackToLanding()
      return
    }

    // Update session status
    updateSession({ status: 'questionnaire_started' })

    // Initialize analytics
    const totalQuestions = ENHANCED_CONSULTATION_QUESTIONNAIRE.steps
      .flatMap(step => step.questions).length

    setAnalytics(prev => ({
      ...prev,
      totalQuestions
    }))

    console.log('Consultation questionnaire initialized:', {
      sessionId: currentSession.id,
      leadName: currentSession.leadData.name,
      totalQuestions
    })
  }, [currentSession, updateSession, onBackToLanding])

  const handleQuestionnaireComplete = async (answers: Record<string, unknown>) => {
    if (!currentSession) {
      toast.error('Session expired. Please start over.')
      onBackToLanding()
      return
    }

    setIsProcessing(true)

    try {
      // Calculate final analytics
      const finalAnalytics = calculateFinalAnalytics(answers)

      // Apply question routing and validation
      const routingResult = applyQuestionRouting(answers)
      const aiReadiness = calculateAIReadiness(answers)

      console.log('Questionnaire completion analytics:', {
        sessionId: currentSession.id,
        completionRate: finalAnalytics.completionRate,
        aiReadinessScore: aiReadiness.score,
        routingRecommendation: routingResult.recommendation
      })

      // Save to state manager (which will persist to database)
      await saveQuestionnaireAnswers({
        ...answers,
        _metadata: {
          completionRate: finalAnalytics.completionRate,
          timeSpentSeconds: Math.round((Date.now() - analytics.startTime) / 1000),
          aiReadinessScore: aiReadiness.score,
          routingResult: routingResult,
          analytics: finalAnalytics
        }
      })

      // Show completion success
      setInsights({
        show: true,
        message: `Assessment completed with ${finalAnalytics.completionRate}% completion rate. AI readiness score: ${aiReadiness.score}/100.`,
        type: 'success'
      })

      // Brief delay to show success message
      setTimeout(() => {
        onComplete(answers)
      }, 1500)

    } catch (error) {
      console.error('Failed to process questionnaire completion:', error)
      toast.error('Failed to save your responses. Please try again.')
      setIsProcessing(false)
    }
  }

  const handleAnalyticsEvent = useCallback((event: string, data: Record<string, unknown>) => {
    const timestamp = Date.now()

    switch (event) {
      case 'question_answered':
        const questionId = data.questionId as string
        setAnalytics(prev => ({
          ...prev,
          questionTimes: {
            ...prev.questionTimes,
            [questionId]: timestamp
          }
        }))
        break

      case 'view_advanced':
        // Update completion metrics
        updateCompletionMetrics(data.answers as Record<string, unknown> || {})
        break

      case 'questionnaire_autosaved':
        // Show save confirmation
        if (Math.random() < 0.3) { // Show occasionally to avoid spam
          setInsights({
            show: true,
            message: 'Your progress has been saved automatically.',
            type: 'tip'
          })

          setTimeout(() => {
            setInsights(prev => ({ ...prev, show: false }))
          }, 3000)
        }
        break
    }

    console.log('Questionnaire analytics event:', event, data)
  }, [])

  const updateCompletionMetrics = (answers: Record<string, unknown>) => {
    const answeredQuestions = Object.values(answers).filter(value => {
      if (value === null || value === undefined || value === '') return false
      if (Array.isArray(value) && value.length === 0) return false
      return true
    }).length

    const completionRate = analytics.totalQuestions > 0
      ? Math.round((answeredQuestions / analytics.totalQuestions) * 100)
      : 0

    const aiReadiness = calculateAIReadiness(answers)

    setAnalytics(prev => ({
      ...prev,
      questionsAnswered: answeredQuestions,
      completionRate,
      aiReadinessScore: aiReadiness.score
    }))

    // Show insights based on progress
    if (completionRate >= 70 && aiReadiness.score >= 75 && !insights.show) {
      setInsights({
        show: true,
        message: 'Excellent! You\'ve provided enough detail for high-quality AI recommendations.',
        type: 'success'
      })

      setTimeout(() => {
        setInsights(prev => ({ ...prev, show: false }))
      }, 4000)
    } else if (completionRate >= 50 && aiReadiness.score < 60) {
      setInsights({
        show: true,
        message: 'Consider providing more detailed answers to get better recommendations.',
        type: 'tip'
      })

      setTimeout(() => {
        setInsights(prev => ({ ...prev, show: false }))
      }, 4000)
    }
  }

  const calculateFinalAnalytics = (answers: Record<string, unknown>): AnalyticsData => {
    const answeredQuestions = Object.values(answers).filter(value => {
      if (value === null || value === undefined || value === '') return false
      if (Array.isArray(value) && value.length === 0) return false
      return true
    }).length

    const completionRate = analytics.totalQuestions > 0
      ? Math.round((answeredQuestions / analytics.totalQuestions) * 100)
      : 0

    const aiReadiness = calculateAIReadiness(answers)

    return {
      ...analytics,
      questionsAnswered: answeredQuestions,
      completionRate,
      aiReadinessScore: aiReadiness.score
    }
  }

  const getProgressColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-500'
    if (rate >= 60) return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  const getAIReadinessColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-gray-600'
  }

  if (!currentSession) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Session Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              Please start from the beginning to begin your assessment.
            </p>
            <Button onClick={onBackToLanding}>
              Return to Start
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Enhanced Header with Analytics */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToLanding}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Start
          </Button>

          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="gap-2">
              <Clock className="w-4 h-4" />
              5-10 minutes
            </Badge>
            <Badge variant="outline" className="gap-2">
              <Brain className="w-4 h-4" />
              AI-Enhanced
            </Badge>
          </div>
        </div>

        {/* Welcome Card with Session Info */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              Welcome back, {currentSession.leadData.name}!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Company:</span>
                <p className="text-gray-600">{currentSession.leadData.company}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Session ID:</span>
                <p className="text-gray-600 font-mono text-xs">
                  {currentSession.id.split('_')[1]}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Started:</span>
                <p className="text-gray-600">
                  {new Date(currentSession.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Progress Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-0 bg-white/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-700">Completion</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{analytics.questionsAnswered} of {analytics.totalQuestions}</span>
                  <span className="font-medium">{analytics.completionRate}%</span>
                </div>
                <Progress
                  value={analytics.completionRate}
                  className={`h-2 ${getProgressColor(analytics.completionRate)}`}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3 mb-2">
                <Brain className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-700">AI Readiness</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Quality Score</span>
                  <span className={`font-medium ${getAIReadinessColor(analytics.aiReadinessScore)}`}>
                    {analytics.aiReadinessScore}/100
                  </span>
                </div>
                <Progress
                  value={analytics.aiReadinessScore}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-700">Insights</span>
              </div>
              <div className="text-sm text-gray-600">
                {analytics.completionRate >= 70 ? (
                  <span className="text-green-600 font-medium">Ready for AI analysis</span>
                ) : analytics.completionRate >= 40 ? (
                  <span className="text-yellow-600">Building profile...</span>
                ) : (
                  <span className="text-gray-500">Getting started...</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dynamic Insights Banner */}
        {insights.show && (
          <Card className={`mb-6 border-0 ${
            insights.type === 'success' ? 'bg-green-50/80' :
            insights.type === 'warning' ? 'bg-yellow-50/80' :
            'bg-blue-50/80'
          }`}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                {insights.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : insights.type === 'warning' ? (
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                ) : (
                  <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {insights.message}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Enhanced Questionnaire Engine */}
      <div className="mb-8">
        {isProcessing ? (
          <Card className="border-0 bg-white/90">
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Processing Your Assessment
                </h3>
                <p className="text-gray-600 mb-4">
                  Analyzing your responses and preparing personalized recommendations...
                </p>
                <div className="max-w-md mx-auto">
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>Analyzing responses...</span>
                    <span>95%</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <QuestionnaireEngine
            config={questionnaireConfig}
            onComplete={handleQuestionnaireComplete}
            onAnalyticsEvent={handleAnalyticsEvent}
          />
        )}
      </div>

      {/* Enhanced Help Section */}
      <Card className="bg-gradient-to-r from-blue-50/50 to-green-50/50 border-blue-200/50">
        <CardContent className="pt-6">
          <div className="text-center">
            <Target className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Maximizing Your Consultation Value
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              The more detailed your responses, the more personalized and actionable your recommendations will be.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-2" />
                <p className="font-medium text-gray-700">Be Specific</p>
                <p className="text-gray-600">Detailed answers help our AI understand your unique situation</p>
              </div>
              <div className="text-center">
                <Brain className="w-5 h-5 text-purple-600 mx-auto mb-2" />
                <p className="font-medium text-gray-700">Think Strategy</p>
                <p className="text-gray-600">Focus on your biggest opportunities and challenges</p>
              </div>
              <div className="text-center">
                <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                <p className="font-medium text-gray-700">Consider Growth</p>
                <p className="text-gray-600">Share your ambitious goals and growth timeline</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}