'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Clock, CheckCircle, ArrowRight, Download, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
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
      <div key={section} className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {SECTION_ICONS[section]}
          {SECTION_LABELS[section]}
        </div>
        <div className="text-sm text-foreground leading-relaxed pl-6">
          {content}
        </div>
      </div>
    )
  }
  
  const renderPlanCard = (plan: Plan, isRecommended = false) => (
    <Card className={cn(
      'cursor-pointer transition-all duration-200',
      selectedPlan === plan.id 
        ? 'ring-2 ring-primary shadow-md' 
        : 'hover:shadow-sm',
      isRecommended && 'border-primary/50'
    )} onClick={() => setSelectedPlan(plan.id)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{plan.title}</CardTitle>
          {isRecommended && (
            <Badge variant="secondary" className="text-xs">
              Recommended
            </Badge>
          )}
        </div>
        <CardDescription>{plan.description}</CardDescription>
        {plan.priceBand && (
          <div className="flex items-center gap-2 pt-2">
            <Badge variant="outline" className="text-xs">
              {plan.priceBand}
            </Badge>
            {plan.timeline && (
              <Badge variant="outline" className="text-xs">
                {plan.timeline}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
    </Card>
  )
  
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
    <div id="consultation-content" className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-2">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Your Custom Consultation
            {clientName && <span className="text-muted-foreground"> for {clientName}</span>}
          </h1>
          {timestamp && (
            <p className="text-sm text-muted-foreground">
              Generated on {new Date(timestamp).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">{summary}</p>
        </CardContent>
      </Card>
      
      {/* Plan Selection */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Recommended Solutions</h2>
          <p className="text-muted-foreground">
            Based on your responses, here are our tailored recommendations
          </p>
        </div>
        
        <Tabs value={selectedPlan} onValueChange={setSelectedPlan}>
          <TabsList className={cn(
            "grid w-full gap-1",
            primaryPlan && alternatePs.length === 0 ? "grid-cols-1" :
            primaryPlan && alternatePs.length === 1 ? "grid-cols-2" :
            primaryPlan && alternatePs.length === 2 ? "grid-cols-3" :
            "grid-cols-4"
          )}>
            {primaryPlan && (
              <TabsTrigger 
                value={primaryPlan.id} 
                className="relative transition-all duration-150"
              >
                <span className="truncate">{primaryPlan.title}</span>
                <Badge variant="secondary" className="ml-2 text-xs">
                  Best Match
                </Badge>
              </TabsTrigger>
            )}
            {alternatePs.map(plan => (
              <TabsTrigger 
                key={plan.id} 
                value={plan.id}
                className="transition-all duration-150"
              >
                <span className="truncate">{plan.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {/* Plan Details */}
          {currentPlan && (
            <TabsContent value={currentPlan.id} className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{currentPlan.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {currentPlan.description}
                      </CardDescription>
                    </div>
                    {currentPlan.priceBand && (
                      <Badge variant="outline" className="text-sm">
                        {currentPlan.priceBand}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Sections */}
                  {template.sections.map(section => 
                    renderPlanSection(section, currentPlan)
                  )}
                  
                  {/* Includes */}
                  {currentPlan.includes.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <CheckCircle className="w-4 h-4" />
                        What&apos;s Included
                      </div>
                      <div className="pl-6 space-y-1">
                        {currentPlan.includes.map((item, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
      
      {/* Alternative Plans Grid */}
      {alternatePs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Alternative Options</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {alternatePs.map(plan => renderPlanCard(plan))}
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
        <Button 
          size="lg" 
          className="flex-1"
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
        
        <div className="flex gap-2">
          {template.actions.downloadPdf && (
            <Button 
              variant="outline" 
              size="lg"
              onClick={handlePdfDownload}
            >
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
          )}
          
          {template.actions.emailCopy && (
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleEmailRequest}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
          )}
        </div>
      </div>
      
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