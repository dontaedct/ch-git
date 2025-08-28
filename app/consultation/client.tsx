'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ConsultationEngine } from '@/components/consultation-engine'
import { Toaster } from '@/components/ui/sonner'
import { setupN8nEventListeners } from '@/lib/n8n-events'

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
          whatYouGet: 'A comprehensive foundation strategy including business process analysis, core system recommendations, and initial automation setup to streamline your operations. This package includes detailed documentation of your current processes, identification of bottlenecks and inefficiencies, recommendations for digital tools and workflows, and a step-by-step implementation plan. We will conduct stakeholder interviews, create process maps, evaluate technology options, and provide training materials for your team. The deliverables include a complete process audit report, technology recommendation matrix, implementation roadmap with milestones, and 90 days of post-implementation support.',
          whyThisFits: 'Perfect for growing businesses that need to establish solid operational foundations before scaling further. Many companies at this stage struggle with manual processes, disconnected systems, and unclear workflows that become major bottlenecks as they grow. This foundation strategy addresses these core issues by creating standardized, efficient processes and implementing the right technology stack to support sustainable growth. By investing in these foundations now, you will avoid costly rework later and position your business for scalable success.',
          timeline: '4-6 weeks with weekly check-ins and milestone reviews. Week 1: Discovery and current state analysis. Week 2-3: Process design and technology evaluation. Week 4: Implementation planning and documentation. Week 5-6: Pilot implementation and team training. Throughout the process, you will have weekly progress calls and access to our project portal for real-time updates.',
          nextSteps: 'Schedule a consultation to discuss your specific needs and customize the approach. During the consultation, we will review your current challenges, understand your growth goals, and identify the specific areas where this foundation strategy can deliver the most value. We will also discuss timeline, budget considerations, and success metrics to ensure the project delivers measurable ROI for your business.'
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
          whatYouGet: 'Complete growth acceleration package with advanced automation, integration architecture, and comprehensive team training program. This extensive engagement includes enterprise-grade workflow automation, custom API integrations, advanced analytics and reporting systems, scalability architecture planning, and organization-wide digital transformation. We provide detailed system architecture documentation, custom workflow implementations, advanced reporting dashboards, team training programs, change management support, and ongoing optimization services. The package includes quarterly strategic reviews, performance monitoring, continuous improvement recommendations, and priority technical support for 12 months.',
          whyThisFits: 'Ideal for businesses ready to scale rapidly with sophisticated systems and processes in place. Companies at this stage typically have established revenue streams but face growing pains from manual processes, disconnected systems, and operational bottlenecks that limit growth velocity. This growth acceleration program addresses these challenges through advanced automation, seamless integrations, and scalable architecture that can support 10x growth without breaking. The comprehensive approach ensures all aspects of your business operations are optimized for rapid scaling while maintaining quality and efficiency.',
          timeline: '6-8 weeks with bi-weekly sprints and continuous optimization. Week 1-2: Strategic assessment and architecture planning. Week 3-4: Core system implementation and integration development. Week 5-6: Advanced automation and workflow optimization. Week 7-8: Team training, change management, and go-live support. Post-launch: 90-day optimization period with weekly reviews and monthly strategic assessments to ensure maximum ROI and continued growth acceleration.',
          nextSteps: 'Book a strategy session to map out your growth trajectory and system requirements. In this comprehensive session, we will analyze your current growth bottlenecks, identify scalability challenges, assess your technology stack, and create a detailed roadmap for acceleration. We will also discuss resource requirements, timeline considerations, success metrics, and expected ROI to ensure this investment delivers transformational results for your business growth.'
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

export function ConsultationPageClient() {
  const _router = useRouter()
  const searchParams = useSearchParams()
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Set up N8N event listeners for debugging
    setupN8nEventListeners()
    
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
          clientName="Demo Client"
        />
      </div>
      <Toaster />
    </div>
  )
}