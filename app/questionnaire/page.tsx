'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { QuestionnaireEngine } from '@/components/questionnaire-engine'
import configData from '@/configs/microapps/base.microapp.json'

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
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <Link 
            href="/"
            className="text-primary hover:text-primary/80 font-medium text-sm"
          >
            ← Back to home
          </Link>
        </div>
        
        <div className="bg-card rounded-lg shadow-sm border border-border p-8">
          <QuestionnaireEngine
            config={configData.questionnaire}
            onComplete={handleComplete}
            onAnalyticsEvent={handleAnalyticsEvent}
          />
        </div>
      </div>
    </div>
  )
}