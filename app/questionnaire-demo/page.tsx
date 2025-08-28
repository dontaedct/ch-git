'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { QuestionnaireEngine } from '@/components/questionnaire-engine'
import demoConfig from '@/configs/microapps/demo.microapp.json'

export default function QuestionnaireDemoPage() {
  const router = useRouter()
  
  const handleComplete = (answers: Record<string, unknown>) => {
    console.log('Demo questionnaire completed:', answers)
    
    // Store answers for consultation page
    sessionStorage.setItem('questionnaire-demo-answers', JSON.stringify(answers))
    
    alert(`Demo completed! Check console for answers. This demonstrates: 
    - 4 steps instead of 3 
    - 1-2 questions per view instead of 2-3 
    - Zero code changes needed`)
    
    // Redirect to consultation page
    router.push('/consultation')
  }
  
  const handleAnalyticsEvent = (event: string, data: Record<string, unknown>) => {
    console.log('Demo Analytics event:', event, data)
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
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">Configuration Demo</h2>
            <p className="text-blue-800 text-sm">
              This demonstrates the schema-first questionnaire engine. The original config had 3 steps with 2-3 questions per view.
              This demo config has <strong>4 steps with 1-2 questions per view</strong> - all configured through JSON with zero code changes.
            </p>
          </div>
        </div>
        
        <div className="bg-card rounded-lg shadow-sm border border-border p-8">
          <QuestionnaireEngine
            config={demoConfig.questionnaire}
            onComplete={handleComplete}
            onAnalyticsEvent={handleAnalyticsEvent}
          />
        </div>
      </div>
    </div>
  )
}