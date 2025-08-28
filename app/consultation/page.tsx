'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ConsultationEngine } from '@/components/consultation-engine'

// Type for Plan Card Sections
type PlanCardSection = 'whatYouGet' | 'whyThisFits' | 'timeline' | 'nextSteps'

// Demo configuration - in real app this would come from microapp config
const demoConfig = {
  catalog: {
    id: 'consultation-plans',
    name: 'Consultation Plans',
    plans: [
      {
        id: 'foundation',
        title: 'Foundation Strategy',
        description: 'Essential business foundation and core systems setup',
        priceBand: '$5K-15K',
        includes: ['Business process analysis', 'Core system recommendations', 'Initial automation setup', '3-month roadmap'],
        timeline: '4-6 weeks',
        tier: 'foundation' as const,
        eligibleIf: { 'company-size': ['startup', 'small'] } as Record<string, string[]>,
        content: {
          whatYouGet: 'A comprehensive foundation strategy including business process analysis, core system recommendations, and initial automation setup to streamline your operations.',
          whyThisFits: 'Perfect for growing businesses that need to establish solid operational foundations before scaling further.',
          timeline: '4-6 weeks with weekly check-ins and milestone reviews',
          nextSteps: 'Schedule a consultation to discuss your specific needs and customize the approach'
        }
      },
      {
        id: 'growth',
        title: 'Growth Acceleration',
        description: 'Advanced systems and processes for scaling businesses',
        priceBand: '$15K-35K',
        includes: ['Advanced automation workflows', 'Integration architecture', 'Performance optimization', 'Team training program', '6-month roadmap'],
        timeline: '6-8 weeks',
        tier: 'growth' as const,
        eligibleIf: { 'company-size': ['small', 'medium'], 'primary-goals': ['growth', 'efficiency'] } as Record<string, string[]>,
        content: {
          whatYouGet: 'Complete growth acceleration package with advanced automation, integration architecture, and comprehensive team training program.',
          whyThisFits: 'Ideal for businesses ready to scale rapidly with sophisticated systems and processes in place.',
          timeline: '6-8 weeks with bi-weekly sprints and continuous optimization',
          nextSteps: 'Book a strategy session to map out your growth trajectory and system requirements'
        }
      },
      {
        id: 'quick-start',
        title: 'Quick Start Package',
        description: 'Rapid implementation for urgent needs',
        priceBand: '$3K-8K',
        includes: ['Rapid assessment', 'Priority fixes', 'Quick wins implementation', '30-day support'],
        timeline: '2-3 weeks',
        tier: 'foundation' as const,
        eligibleIf: { 'timeline': ['urgent'] } as Record<string, string[]>,
        content: {
          whatYouGet: 'Fast-track solution focused on immediate priority fixes and quick wins to address urgent business needs.',
          whyThisFits: 'Perfect when you need results quickly and have specific urgent challenges to address.',
          timeline: '2-3 weeks with daily progress updates and immediate implementation',
          nextSteps: 'Contact us immediately to discuss your urgent requirements and timeline'
        }
      }
    ],
    defaults: {
      fallbackPlan: 'foundation',
      preferHigherTier: true
    }
  },
  template: {
    summary: {
      minWords: 80,
      maxWords: 150,
      tone: 'professional' as const
    },
    planDeck: {
      primaryCount: 1,
      alternatesCount: 3
    },
    sections: ['whatYouGet', 'whyThisFits', 'timeline', 'nextSteps'] as PlanCardSection[],
    actions: {
      downloadPdf: true,
      emailCopy: true,
      bookCtaLabel: 'Schedule Consultation',
      bookingUrl: 'https://calendly.com/example/consultation'
    }
  }
}

export default function ConsultationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Try to get answers from localStorage or URL params
    const savedAnswers = localStorage.getItem('questionnaire-answers')
    
    if (savedAnswers) {
      try {
        const parsed = JSON.parse(savedAnswers)
        setAnswers(parsed)
      } catch (error) {
        console.warn('Failed to parse saved answers:', error)
      }
    }
    
    // Also check URL params for demo data
    const params = Object.fromEntries(searchParams.entries())
    if (Object.keys(params).length > 0) {
      setAnswers(prev => ({ ...prev, ...params }))
    }
    
    // Set demo data if no answers found
    if (!savedAnswers && Object.keys(params).length === 0) {
      setAnswers({
        'business-type': 'saas',
        'company-size': 'startup',
        'primary-goals': ['growth', 'automation'],
        'timeline': 'soon'
      })
    }
    
    setIsLoading(false)
  }, [searchParams])

  const handleComplete = (planId: string, action: string) => {
    if (action === 'book') {
      // Open booking URL
      if (demoConfig.template.actions.bookingUrl) {
        window.open(demoConfig.template.actions.bookingUrl, '_blank')
      }
    } else if (action === 'download') {
      // Trigger PDF download
      console.log('Downloading PDF for plan:', planId)
    } else if (action === 'email') {
      // Request email copy
      console.log('Requesting email copy for plan:', planId)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your consultation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Link 
            href="/questionnaire"
            className="text-primary hover:text-primary/80 font-medium text-sm inline-flex items-center gap-2"
          >
            ← Back to questionnaire
          </Link>
        </div>
        
        <ConsultationEngine
          answers={answers}
          catalog={demoConfig.catalog}
          template={demoConfig.template}
          onComplete={handleComplete}
          timestamp={new Date().toISOString()}
        />
      </div>
    </div>
  )
}