'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ConsultationEngine } from '@/components/consultation-engine'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Sparkles, Clock, Calendar } from 'lucide-react'
import { toast } from 'sonner'

interface LeadData {
  name: string
  email: string
  company: string
  phone?: string
}

interface ConsultationData {
  lead: LeadData
  answers: Record<string, unknown>
  timestamp: string
  questionnaireId: string
}

// Service plan catalog for business consultations
const BUSINESS_PLAN_CATALOG = {
  id: 'business-consultation-plans-v1',
  name: 'Business Growth Plans',
  plans: [
    {
      id: 'foundation-plan',
      title: 'Foundation Builder',
      description: 'Perfect for startups and small businesses looking to establish solid fundamentals',
      priceBand: '$2,500 - $5,000',
      timeline: '4-6 weeks',
      tier: 'foundation' as const,
      includes: [
        'Business model optimization',
        'Market analysis and positioning',
        'Basic digital presence setup',
        'Financial planning fundamentals',
        'Growth strategy roadmap',
        '2 strategy sessions',
        'Email support for 30 days'
      ],
      eligibleIf: {
        'company-size': ['solo', 'small'],
        'annual-revenue': ['startup', 'under-100k', '100k-500k'],
        'budget-range': ['under-1k', '1k-5k']
      },
      content: {
        whatYouGet: 'Our Foundation Builder plan provides the essential framework for sustainable business growth. You\'ll receive a comprehensive business model review, market positioning analysis, and a practical roadmap to establish your business fundamentals.',
        whyThisFits: 'Based on your responses, you\'re in the critical early stage where establishing strong foundations will determine your long-term success. This plan addresses your immediate needs while setting you up for future growth.',
        timeline: 'Over 4-6 weeks, we\'ll work together to build your business foundation. Week 1-2: Analysis and strategy development. Week 3-4: Implementation planning. Week 5-6: Execution support and optimization.',
        nextSteps: 'Schedule your initial strategy session to begin the foundation-building process. We\'ll start with a comprehensive business audit and create your customized growth roadmap.'
      }
    },
    {
      id: 'growth-accelerator',
      title: 'Growth Accelerator',
      description: 'Designed for established businesses ready to scale operations and increase market reach',
      priceBand: '$7,500 - $15,000',
      timeline: '6-8 weeks',
      tier: 'growth' as const,
      includes: [
        'Advanced market expansion strategy',
        'Sales and marketing optimization',
        'Operational efficiency improvements',
        'Technology integration planning',
        'Performance monitoring systems',
        'Team development framework',
        '4 strategy sessions',
        'Priority support for 60 days'
      ],
      eligibleIf: {
        'company-size': ['small', 'medium'],
        'annual-revenue': ['500k-1m', '1m-5m'],
        'budget-range': ['5k-10k', '10k-25k']
      },
      content: {
        whatYouGet: 'The Growth Accelerator plan focuses on scaling your established business through advanced strategies, operational improvements, and market expansion. You\'ll receive detailed implementation guides, performance tracking systems, and ongoing strategic support.',
        whyThisFits: 'Your business has proven its viability and is ready for the next level. This plan addresses the scaling challenges you\'re facing while capitalizing on your existing strengths to accelerate growth.',
        timeline: 'Over 6-8 weeks, we\'ll implement comprehensive growth strategies. Week 1-2: Deep analysis and opportunity identification. Week 3-5: Strategy implementation and optimization. Week 6-8: Performance monitoring and refinement.',
        nextSteps: 'Begin with a strategic growth assessment to identify your highest-impact opportunities. We\'ll create a detailed action plan with clear milestones and success metrics.'
      }
    },
    {
      id: 'enterprise-transformation',
      title: 'Enterprise Transformation',
      description: 'Comprehensive transformation program for large organizations and complex business challenges',
      priceBand: '$25,000 - $75,000',
      timeline: '12-16 weeks',
      tier: 'enterprise' as const,
      includes: [
        'Full organizational assessment',
        'Digital transformation strategy',
        'Change management program',
        'Leadership development',
        'Custom technology solutions',
        'Performance optimization',
        'Market disruption strategies',
        'Weekly strategy sessions',
        'Dedicated account management',
        'Priority support for 90 days'
      ],
      eligibleIf: {
        'company-size': ['large', 'enterprise'],
        'annual-revenue': ['5m-10m', 'over-10m'],
        'budget-range': ['25k-50k', 'over-50k']
      },
      content: {
        whatYouGet: 'Our most comprehensive program designed for large-scale transformation. You\'ll receive end-to-end strategic planning, implementation support, change management, and ongoing optimization across all business areas.',
        whyThisFits: 'Your organization requires sophisticated strategies and comprehensive transformation to stay competitive. This program addresses complex challenges with enterprise-grade solutions and dedicated expert support.',
        timeline: 'Over 12-16 weeks, we\'ll execute a complete transformation program. Week 1-4: Comprehensive assessment and strategy development. Week 5-12: Implementation and change management. Week 13-16: Optimization and performance monitoring.',
        nextSteps: 'Schedule an executive briefing to outline your transformation roadmap. We\'ll begin with a comprehensive organizational assessment and develop your customized transformation strategy.'
      }
    },
    {
      id: 'strategic-consulting',
      title: 'Strategic Consulting',
      description: 'Flexible consulting support for specific business challenges and opportunities',
      priceBand: '$150 - $500/hour',
      timeline: 'Ongoing',
      tier: 'growth' as const,
      includes: [
        'Expert strategic guidance',
        'Problem-specific solutions',
        'Flexible engagement model',
        'Industry best practices',
        'Custom recommendations',
        'Implementation support',
        'Performance tracking'
      ],
      eligibleIf: {
        'consultation-focus': ['strategy', 'leadership', 'innovation']
      },
      content: {
        whatYouGet: 'Flexible strategic consulting that adapts to your specific needs. You\'ll work directly with senior consultants to address particular challenges, explore opportunities, and implement targeted solutions.',
        whyThisFits: 'You have specific strategic challenges that require expert guidance without the commitment of a full program. This flexible approach allows you to access high-level expertise when you need it most.',
        timeline: 'Flexible scheduling based on your needs. Engagements can range from single sessions to ongoing monthly support, allowing you to scale consulting support up or down as required.',
        nextSteps: 'Schedule a consultation to discuss your specific needs and challenges. We\'ll design a flexible engagement that provides exactly the support you require.'
      }
    }
  ],
  defaults: {
    fallbackPlan: 'strategic-consulting',
    preferHigherTier: true
  }
}

// Consultation template configuration
const CONSULTATION_TEMPLATE = {
  summary: {
    minWords: 150,
    maxWords: 300,
    tone: 'professional' as const
  },
  planDeck: {
    primaryCount: 1,
    alternatesCount: 2
  },
  sections: ['whatYouGet', 'whyThisFits', 'timeline', 'nextSteps'] as const,
  actions: {
    downloadPdf: true,
    emailCopy: true,
    bookCtaLabel: 'Schedule Strategy Session',
    bookingUrl: 'https://calendly.com/business-consultation/strategy-session'
  }
}

export default function ConsultationResults() {
  const router = useRouter()
  const [consultationData, setConsultationData] = useState<ConsultationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load consultation data from session storage
    const savedData = sessionStorage.getItem('consultation_data')
    if (savedData) {
      try {
        const data = JSON.parse(savedData)
        setConsultationData(data)
      } catch (error) {
        console.error('Failed to parse consultation data:', error)
        toast.error('Unable to load consultation results')
        router.push('/consultation/landing')
        return
      }
    } else {
      toast.error('No consultation data found. Please complete the assessment first.')
      router.push('/consultation/landing')
      return
    }

    setIsLoading(false)
  }, [router])

  const handleConsultationComplete = (planId: string, action: string) => {
    console.log('Consultation action:', { planId, action, lead: consultationData?.lead })

    switch (action) {
      case 'book':
        toast.success('Redirecting to booking page...')
        // In a real app, this would redirect to the actual booking system
        break
      case 'download':
        toast.success('PDF downloaded successfully!')
        break
      case 'email':
        toast.success('Email sent successfully!')
        break
      default:
        console.log('Unknown action:', action)
    }
  }

  const handleBackToQuestionnaire = () => {
    router.push('/consultation/questionnaire')
  }

  const handleStartNewConsultation = () => {
    // Clear all session data and start fresh
    sessionStorage.removeItem('consultation_lead')
    sessionStorage.removeItem('consultation_data')
    router.push('/consultation/landing')
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Generating Your Consultation
            </h2>
            <p className="text-gray-600">
              Our AI is analyzing your responses and creating personalized recommendations...
            </p>
            <div className="mt-6 max-w-md mx-auto">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Analyzing responses...</span>
                <span>90%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all duration-1000" style={{ width: '90%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!consultationData) {
    return null // Will redirect to landing page
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToQuestionnaire}
            className="absolute left-4 top-4 md:relative md:left-auto md:top-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assessment
          </Button>

          <div className="flex-1">
            <Badge variant="secondary" className="mb-3">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Generated Results
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Your Business Consultation
            </h1>
            <p className="text-gray-600">
              Personalized recommendations based on your assessment
            </p>
          </div>
        </div>

        {/* Consultation Summary Card */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-0">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-3 text-xl">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              Consultation Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="flex items-center justify-center gap-2 text-gray-700 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Generated</span>
                </div>
                <p className="text-sm text-gray-600">
                  {new Date(consultationData.timestamp).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 text-gray-700 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Company</span>
                </div>
                <p className="text-sm text-gray-600">
                  {consultationData.lead.company}
                </p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 text-gray-700 mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-medium">Questionnaire</span>
                </div>
                <p className="text-sm text-gray-600">
                  {Object.keys(consultationData.answers).length} responses analyzed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consultation Engine */}
      <div className="mb-8">
        <ConsultationEngine
          answers={consultationData.answers}
          catalog={BUSINESS_PLAN_CATALOG}
          template={CONSULTATION_TEMPLATE}
          onComplete={handleConsultationComplete}
          timestamp={consultationData.timestamp}
          clientName={consultationData.lead.name}
        />
      </div>

      {/* Action Section */}
      <Card className="bg-gray-50/50 border-0 mb-8">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              What's Next?
            </h3>
            <p className="text-gray-600 mb-6">
              Take action on your consultation results or explore other options
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleStartNewConsultation}
                variant="outline"
                className="gap-2"
              >
                Start New Consultation
              </Button>
              <Button
                onClick={() => window.print()}
                variant="outline"
                className="gap-2"
              >
                Print Results
              </Button>
              <Button variant="outline" className="gap-2">
                Share Results
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="text-center text-sm text-gray-500 mb-8">
        <p>
          This consultation is generated by AI based on your responses and should be considered as guidance.
          For specific business decisions, we recommend consulting with a qualified business advisor.
        </p>
      </div>
    </div>
  )
}