'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Suspense, lazy } from 'react'
import configData from '@/configs/microapps/base.microapp.json'

// Lazy load the QuestionnaireEngine component
const QuestionnaireEngine = lazy(() => import('@/components/questionnaire-engine').then(module => ({ default: module.QuestionnaireEngine })))

export default function QuestionnairePage() {
  const router = useRouter()
  
  const handleComplete = (answers: Record<string, unknown>) => {
    console.log('Questionnaire completed:', answers)
    
    // Store answers for consultation page
    sessionStorage.setItem('questionnaire-answers', JSON.stringify(answers))
    
    // Redirect to consultation page
    router.push('/consultation')
  }
  
  const handleAnalyticsEvent = (event: string, data: Record<string, unknown>) => {
    console.log('Analytics event:', event, data)
    
    // In a real app, you would send this to your analytics provider
    // Example: analytics.track(event, data)
  }
  
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container-prose">
        <div className="mb-8">
          <Link 
            href="/"
            className="text-primary hover:text-primary/80 font-medium text-caption tracking-wide inline-flex items-center gap-2"
          >
            ← Back to home
          </Link>
        </div>
        
        <div className="bg-card rounded-lg shadow-sm border border-border p-8">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-caption text-muted-foreground">Loading questionnaire...</p>
            </div>
          }>
            <QuestionnaireEngine
              config={configData.questionnaire}
              onComplete={handleComplete}
              onAnalyticsEvent={handleAnalyticsEvent}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}