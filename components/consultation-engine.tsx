'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TabsUnderline, TabsUnderlineContent, TabsUnderlineList, TabsUnderlineTrigger } from '@/components/ui/tabs-underline'
import { Separator } from '@/components/ui/separator'
import { Clock, CheckCircle, ArrowRight, Download, Mail, Calendar, User } from 'lucide-react'
import { usePdfExport } from '@/hooks/use-pdf-export'
import { useN8nEvents } from '@/lib/n8n-events'
import { emitConsultationGenerated, emitPdfDownloaded, emitEmailCopyRequested } from '@/lib/webhooks/emitter'
import { EmailModal } from '@/components/email-modal'

// Types based on the config structure
interface Plan {
  id: string
  title: string
  description: string
  priceBand?: string
  includes: string[]
  timeline?: string
  tier: 'foundation' | 'growth' | 'enterprise'
  eligibleIf?: Record<string, string[]>
  content: {
    whatYouGet?: string
    whyThisFits?: string
    timeline?: string
    nextSteps?: string
  }
}

interface PlanCatalog {
  id: string
  name: string
  plans: Plan[]
  defaults: {
    fallbackPlan: string
    preferHigherTier: boolean
  }
}

type PlanCardSection = 'whatYouGet' | 'whyThisFits' | 'timeline' | 'nextSteps'

interface ConsultationTemplate {
  summary: {
    minWords: number
    maxWords: number
    tone: 'professional' | 'friendly' | 'direct'
  }
  planDeck: {
    primaryCount: number
    alternatesCount: number
  }
  sections: PlanCardSection[]
  actions: {
    downloadPdf: boolean
    emailCopy: boolean
    bookCtaLabel: string
    bookingUrl?: string
  }
}

interface ConsultationEngineProps {
  answers: Record<string, unknown>
  catalog: PlanCatalog
  template: ConsultationTemplate
  onComplete?: (planId: string, action: string) => void
  timestamp?: string
  clientName?: string
}

const SECTION_LABELS: Record<PlanCardSection, string> = {
  whatYouGet: 'What You Get',
  whyThisFits: 'Why This Fits',
  timeline: 'Timeline',
  nextSteps: 'Next Steps'
}

const SECTION_ICONS: Record<PlanCardSection, React.ReactNode> = {
  whatYouGet: <CheckCircle className="w-4 h-4" />,
  whyThisFits: <ArrowRight className="w-4 h-4" />,
  timeline: <Clock className="w-4 h-4" />,
  nextSteps: <ArrowRight className="w-4 h-4" />
}

export function ConsultationEngine({
  answers,
  catalog,
  template,
  onComplete,
  timestamp,
  clientName
}: ConsultationEngineProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [currentPdfBlob, setCurrentPdfBlob] = useState<Blob | undefined>()
  const ariaLiveRef = React.useRef<HTMLDivElement>(null)
  const [prevSelectedPlan, setPrevSelectedPlan] = React.useState('')
  
  // N8N event system
  const n8nEvents = useN8nEvents()
  
  // PDF export functionality
  const { generatePdf } = usePdfExport({
    filename: `consultation-${clientName?.replace(/\s+/g, '-').toLowerCase() ?? 'report'}-${new Date().toISOString().split('T')[0]}.pdf`,
    onSuccess: (blob) => {
      // Store blob for email modal
      setCurrentPdfBlob(blob)
      
      // Emit PDF download event (both old and new systems for compatibility)
      n8nEvents.emitPdfDownload({
        source: 'consultation-engine',
        planId: selectedPlan,
        clientName,
        size: blob.size,
        filename: `consultation-${clientName?.replace(/\s+/g, '-').toLowerCase() ?? 'report'}-${new Date().toISOString().split('T')[0]}.pdf`
      })
      
      // New webhook emitter system
      emitPdfDownloaded({
        consultationId: `consultation_${Date.now()}`,
        filename: `consultation-${clientName?.replace(/\s+/g, '-').toLowerCase() ?? 'report'}-${new Date().toISOString().split('T')[0]}.pdf`,
        fileSize: blob.size,
        source: 'consultation-engine',
        userId: 'demo-user' // TODO: Get from auth context
      }).catch(error => {
        console.warn('Failed to emit PDF downloaded event:', error)
      })
    }
  })
  
  // Plan selection logic
  const selectedPlans = useMemo(() => {
    const eligible = catalog.plans.filter(plan => {
      if (!plan.eligibleIf) return true
      
      return Object.entries(plan.eligibleIf).every(([questionId, requiredValues]) => {
        const answerValue = answers[questionId]
        if (Array.isArray(answerValue)) {
          return answerValue.some(val => requiredValues.includes(val as string))
        }
        return requiredValues.includes(answerValue as string)
      })
    })
    
    // Sort by tier preference if configured
    if (catalog.defaults.preferHigherTier) {
      const tierOrder = { foundation: 1, growth: 2, enterprise: 3 }
      eligible.sort((a, b) => tierOrder[b.tier] - tierOrder[a.tier])
    }
    
    // Return fallback if no eligible plans
    if (eligible.length === 0) {
      const fallback = catalog.plans.find(p => p.id === catalog.defaults.fallbackPlan)
      return fallback ? [fallback] : []
    }
    
    return eligible
  }, [answers, catalog])
  
  // Get primary recommendation and alternates
  const primaryPlan = selectedPlans[0]
  const alternatePs = selectedPlans.slice(1, template.planDeck.alternatesCount + 1)
  
  // Set initial selected plan and emit consultation generated event
  useEffect(() => {
    if (primaryPlan && !selectedPlan) {
      setSelectedPlan(primaryPlan.id)
      
      // Emit consultation generated event
      emitConsultationGenerated({
        consultationId: `consultation_${Date.now()}`,
        planIds: selectedPlans.map(p => p.id),
        source: 'consultation-engine',
        userId: 'demo-user' // TODO: Get from auth context
      }).catch(error => {
        console.warn('Failed to emit consultation generated event:', error)
      })
    }
  }, [primaryPlan, selectedPlan, selectedPlans])

  // Update aria-live region when selected plan changes
  useEffect(() => {
    if (selectedPlan !== prevSelectedPlan && selectedPlan && ariaLiveRef.current) {
      const currentPlan = selectedPlans.find(p => p.id === selectedPlan)
      if (currentPlan) {
        ariaLiveRef.current.textContent = `Selected plan: ${currentPlan.title}. ${currentPlan.description}`
      }
      setPrevSelectedPlan(selectedPlan)
    }
  }, [selectedPlan, prevSelectedPlan, selectedPlans])
  
  // Generate summary based on answers
  const summary = useMemo(() => {
    const businessType = answers['business-type'] as string
    const companySize = answers['company-size'] as string
    const goals = Array.isArray(answers['primary-goals']) 
      ? (answers['primary-goals'] as string[]).join(', ')
      : answers['primary-goals'] as string
    const timeline = answers['timeline'] as string
    
    // Note: tone variable available for future summary customization
    
    return `Based on your questionnaire responses, we've identified you as a ${companySize} ${businessType} company focused on ${goals}. With your ${timeline} timeline, we recommend a strategic approach that balances immediate needs with long-term growth objectives. Our recommendations are tailored specifically to businesses in your situation, ensuring maximum impact and sustainable results.`
  }, [answers])
  
  const getCurrentPlan = () => selectedPlans.find(p => p.id === selectedPlan) ?? primaryPlan
  
  const renderPlanSection = (section: PlanCardSection, plan: Plan) => {
    const content = plan.content[section]
    if (!content) return null
    
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            {React.cloneElement(SECTION_ICONS[section] as React.ReactElement<React.SVGProps<SVGSVGElement>>, {
              className: 'w-4 h-4 text-primary',
              strokeWidth: 2
            })}
          </div>
          <h4 className="text-lg font-semibold text-gray-900">
            {SECTION_LABELS[section]}
          </h4>
        </div>
        <div className="text-gray-700 leading-relaxed ml-11 font-normal text-sm sm:text-base">
          {content}
        </div>
      </div>
    )
  }
  
  
  const currentPlan = getCurrentPlan()
  
  const handlePdfDownload = async () => {
    try {
      await generatePdf('consultation-content')
      onComplete?.(selectedPlan, 'download')
    } catch (error) {
      console.error('PDF download failed:', error)
    }
  }

  const handleEmailRequest = async () => {
    try {
      // Generate PDF first if we don't have one
      if (!currentPdfBlob) {
        await generatePdf('consultation-content')
      }
      
      // Open email modal
      setIsEmailModalOpen(true)
      
      // Emit event for tracking
      emitEmailCopyRequested({
        consultationId: `consultation_${Date.now()}`,
        email: 'pending', // Will be provided in modal
        source: 'consultation-engine',
        userId: 'demo-user' // TODO: Get from auth context
      }).catch(error => {
        console.warn('Failed to emit email copy requested event:', error)
      })
      
      onComplete?.(selectedPlan, 'email')
    } catch (error) {
      console.error('Email request failed:', error)
    }
  }
  
  return (
    <div id="consultation-content" className="max-w-5xl mx-auto bg-white">
      <div aria-live="polite" aria-atomic="true" className="sr-only" ref={ariaLiveRef} />
      
      {/* Header */}
      <header className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-gradient-to-br from-slate-50/50 via-white to-blue-50/30 border-b border-border/30">
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl shadow-sm">
            <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-primary" strokeWidth={1.5} />
          </div>
          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-gray-900">
              Your Consultation
            </h1>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm text-muted-foreground">
              {timestamp && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" strokeWidth={1.5} />
                  <span className="font-medium">
                    {new Date(timestamp).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
              {clientName && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" strokeWidth={1.5} />
                  <span className="font-medium">{clientName}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Summary */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900 mb-4 sm:mb-6">
            Executive Summary
          </h2>
          <div className="prose prose-lg prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed font-normal text-base sm:text-[17px] tracking-[0.011em]">
              {summary}
            </p>
          </div>
        </div>
      </section>
      
      <Separator className="mx-4 sm:mx-6 lg:mx-8" />
      
      {/* Plan Deck */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 sm:space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">
            Recommended Solutions
          </h2>
          <p className="text-gray-600 font-normal text-sm sm:text-base">
            Based on your responses, here are our tailored recommendations
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <TabsUnderline value={selectedPlan} onValueChange={setSelectedPlan}>
            <TabsUnderlineList className="w-full justify-center">
              {primaryPlan && (
                <TabsUnderlineTrigger 
                  value={primaryPlan.id} 
                  className="relative px-4 sm:px-6 py-3 text-sm sm:text-base font-medium transition-all duration-200"
                >
                  <span className="truncate">{primaryPlan.title}</span>
                  <Badge variant="secondary" className="ml-2 text-xs font-medium px-2 py-0.5">
                    Primary
                  </Badge>
                </TabsUnderlineTrigger>
              )}
              {alternatePs.map(plan => (
                <TabsUnderlineTrigger 
                  key={plan.id} 
                  value={plan.id}
                  className="px-4 sm:px-6 py-3 text-sm sm:text-base font-medium transition-all duration-200"
                >
                  <span className="truncate">{plan.title}</span>
                </TabsUnderlineTrigger>
              ))}
            </TabsUnderlineList>
          
            
            {/* Plan Details */}
            {currentPlan && (
              <TabsUnderlineContent value={currentPlan.id} className="mt-6 sm:mt-8">
                <div className="bg-white border border-border/40 rounded-2xl shadow-sm overflow-hidden">
                  {/* Plan Header */}
                  <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-gradient-to-r from-slate-50/50 to-blue-50/20 border-b border-border/30">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-2">
                        <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">
                          {currentPlan.title}
                        </h3>
                        <p className="text-gray-600 font-normal leading-relaxed text-sm sm:text-base">
                          {currentPlan.description}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {currentPlan.priceBand && (
                          <Badge variant="outline" className="text-sm font-medium px-3 py-1">
                            {currentPlan.priceBand}
                          </Badge>
                        )}
                        {currentPlan.timeline && (
                          <Badge variant="outline" className="text-sm font-medium px-3 py-1">
                            {currentPlan.timeline}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Plan Content */}
                  <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
                    {/* Dynamic Sections */}
                    {template.sections.map((section, index) => {
                      const content = renderPlanSection(section, currentPlan)
                      if (!content) return null
                      
                      return (
                        <div key={section}>
                          {content}
                          {index < template.sections.length - 1 && (
                            <Separator className="mt-6 sm:mt-8" />
                          )}
                        </div>
                      )
                    })}
                    
                    {/* What's Included */}
                    {currentPlan.includes.length > 0 && (
                      <div>
                        {template.sections.length > 0 && <Separator className="mb-6 sm:mb-8" />}
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-primary" strokeWidth={2} />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              What&apos;s Included
                            </h4>
                          </div>
                          <div className="grid gap-3 ml-11">
                            {currentPlan.includes.map((item, index) => (
                              <div key={index} className="flex items-start gap-3 text-gray-700 text-sm sm:text-base">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2.5 shrink-0" />
                                <span className="leading-relaxed">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsUnderlineContent>
            )}
          </TabsUnderline>
        </div>
      </section>
      
      <Separator className="mx-4 sm:mx-6 lg:mx-8" />
      
      {/* CTA Cluster */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col gap-4">
            {/* Primary CTA */}
            <Button 
              size="lg" 
              className="w-full h-12 text-base font-semibold shadow-sm hover:shadow-md transition-all duration-200"
              onClick={() => {
                // Emit booking request event
                n8nEvents.emitBookingRequest({
                  source: 'consultation-engine',
                  planId: selectedPlan,
                  clientName,
                  bookingUrl: template.actions.bookingUrl
                })
                onComplete?.(selectedPlan, 'book')
              }}
            >
              {template.actions.bookCtaLabel}
            </Button>
            
            {/* Secondary CTAs */}
            <div className="flex gap-3 justify-center">
              {template.actions.downloadPdf && (
                <Button 
                  variant="outline" 
                  size="lg"
                  className="px-6 h-11 text-sm font-medium border-border/60 hover:border-border transition-all duration-200"
                  onClick={handlePdfDownload}
                >
                  <Download className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Download PDF
                </Button>
              )}
              
              {template.actions.emailCopy && (
                <Button 
                  variant="outline" 
                  size="lg"
                  className="px-6 h-11 text-sm font-medium border-border/60 hover:border-border transition-all duration-200"
                  onClick={handleEmailRequest}
                >
                  <Mail className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Email Copy
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Email Modal */}
      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        clientName={clientName ?? 'Valued Client'}
        planTitle={currentPlan?.title ?? 'Consultation Plan'}
        pdfBlob={currentPdfBlob}
        filename={`consultation-${clientName?.replace(/\s+/g, '-').toLowerCase() ?? 'report'}-${new Date().toISOString().split('T')[0]}.pdf`}
        initialEmail=""
      />
    </div>
  )
}