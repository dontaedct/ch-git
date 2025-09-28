import { NextRequest, NextResponse } from 'next/server'
import { ConsultationDataPersistence } from '@/lib/consultation/data-persistence'
import { emitConsultationGenerated } from '@/lib/webhooks/emitter'

export interface ConsultationGenerationRequest {
  sessionId: string
  answers: Record<string, unknown>
  options?: {
    includeAlternatives?: boolean
    modelVersion?: string
    customPrompt?: string
  }
}

export interface ConsultationGenerationResponse {
  success: boolean
  generationId?: string
  sessionId: string
  message: string
  consultation?: {
    selectedPlanId: string
    recommendations: {
      summary: string
      primaryPlan: any
      alternativePlans: any[]
      confidence: number
    }
    metadata: {
      modelVersion: string
      processingTimeMs: number
      generatedAt: string
    }
  }
}

// Business plan catalog (same as in results page)
const BUSINESS_PLAN_CATALOG = {
  id: 'business-consultation-plans-v1',
  name: 'Business Growth Plans',
  plans: [
    {
      id: 'foundation-plan',
      title: 'Foundation Builder',
      description: 'Perfect for startups and small businesses looking to establish solid fundamentals',
      tier: 'foundation',
      eligibleIf: {
        'company-size': ['solo', 'small'],
        'annual-revenue': ['startup', 'under-100k', '100k-500k'],
        'budget-range': ['under-1k', '1k-5k']
      }
    },
    {
      id: 'growth-accelerator',
      title: 'Growth Accelerator',
      description: 'Designed for established businesses ready to scale operations and increase market reach',
      tier: 'growth',
      eligibleIf: {
        'company-size': ['small', 'medium'],
        'annual-revenue': ['500k-1m', '1m-5m'],
        'budget-range': ['5k-10k', '10k-25k']
      }
    },
    {
      id: 'enterprise-transformation',
      title: 'Enterprise Transformation',
      description: 'Comprehensive transformation program for large organizations and complex business challenges',
      tier: 'enterprise',
      eligibleIf: {
        'company-size': ['large', 'enterprise'],
        'annual-revenue': ['5m-10m', 'over-10m'],
        'budget-range': ['25k-50k', 'over-50k']
      }
    },
    {
      id: 'strategic-consulting',
      title: 'Strategic Consulting',
      description: 'Flexible consulting support for specific business challenges and opportunities',
      tier: 'growth',
      eligibleIf: {
        'consultation-focus': ['strategy', 'leadership', 'innovation']
      }
    }
  ],
  defaults: {
    fallbackPlan: 'strategic-consulting',
    preferHigherTier: true
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now()

  try {
    // Parse request body
    const body: ConsultationGenerationRequest = await request.json()

    // Validate required fields
    const validation = validateGenerationRequest(body)
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          sessionId: body.sessionId || 'unknown',
          message: `Validation failed: ${validation.errors.join(', ')}`
        } as ConsultationGenerationResponse,
        { status: 400 }
      )
    }

    const { sessionId, answers, options } = body

    console.log('Processing consultation generation:', {
      sessionId,
      answerCount: Object.keys(answers).length,
      options
    })

    // Verify session exists
    const session = await ConsultationDataPersistence.getSession(sessionId)
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          sessionId,
          message: 'Session not found'
        } as ConsultationGenerationResponse,
        { status: 404 }
      )
    }

    // Get questionnaire submission
    const submission = await ConsultationDataPersistence.getQuestionnaireSubmission(sessionId)
    if (!submission) {
      return NextResponse.json(
        {
          success: false,
          sessionId,
          message: 'Questionnaire submission not found'
        } as ConsultationGenerationResponse,
        { status: 404 }
      )
    }

    // Generate AI consultation
    const aiConsultation = await generateAIConsultation(answers, options)

    // Calculate processing time
    const processingTimeMs = Date.now() - startTime

    // Save consultation generation
    const generationId = await ConsultationDataPersistence.saveConsultationGeneration(
      sessionId,
      submission.id,
      aiConsultation.selectedPlanId,
      aiConsultation.recommendations,
      {
        modelVersion: aiConsultation.metadata.modelVersion,
        processingTimeMs,
        confidenceScore: aiConsultation.recommendations.confidence
      }
    )

    // Emit webhook events
    try {
      await emitConsultationGenerated({
        consultationId: generationId,
        clientName: session.lead_name,
        clientEmail: session.lead_email,
        templateId: BUSINESS_PLAN_CATALOG.id,
        generatedAt: new Date()
      })

      console.log('Consultation generated webhook emitted successfully')
    } catch (webhookError) {
      console.warn('Failed to emit consultation generated webhook:', webhookError)
    }

    // Prepare response
    const response: ConsultationGenerationResponse = {
      success: true,
      generationId,
      sessionId,
      message: 'Consultation generated successfully',
      consultation: {
        selectedPlanId: aiConsultation.selectedPlanId,
        recommendations: aiConsultation.recommendations,
        metadata: {
          modelVersion: aiConsultation.metadata.modelVersion,
          processingTimeMs,
          generatedAt: new Date().toISOString()
        }
      }
    }

    console.log('Consultation generation completed successfully:', {
      generationId,
      sessionId,
      selectedPlan: aiConsultation.selectedPlanId,
      processingTimeMs
    })

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Error generating consultation:', error)

    const errorResponse: ConsultationGenerationResponse = {
      success: false,
      sessionId: 'unknown',
      message: error instanceof Error ? error.message : 'Internal server error'
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId parameter is required' },
        { status: 400 }
      )
    }

    // Retrieve consultation generation
    const generation = await ConsultationDataPersistence.getConsultationGeneration(sessionId)

    if (!generation) {
      return NextResponse.json(
        { error: 'Consultation generation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: generation
    }, { status: 200 })

  } catch (error) {
    console.error('Error retrieving consultation generation:', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function generateAIConsultation(
  answers: Record<string, unknown>,
  options?: ConsultationGenerationRequest['options']
): Promise<{
  selectedPlanId: string
  recommendations: {
    summary: string
    primaryPlan: any
    alternativePlans: any[]
    confidence: number
  }
  metadata: {
    modelVersion: string
  }
}> {
  const modelVersion = options?.modelVersion || 'consultation-ai-v1.0'

  // Apply business logic to determine best plan
  const selectedPlans = selectEligiblePlans(answers)

  if (selectedPlans.length === 0) {
    // Fallback to default plan
    const fallbackPlan = BUSINESS_PLAN_CATALOG.plans.find(
      p => p.id === BUSINESS_PLAN_CATALOG.defaults.fallbackPlan
    )

    return {
      selectedPlanId: fallbackPlan!.id,
      recommendations: {
        summary: generateBusinessSummary(answers),
        primaryPlan: fallbackPlan,
        alternativePlans: [],
        confidence: 0.7
      },
      metadata: {
        modelVersion
      }
    }
  }

  // Select primary plan and alternatives
  const primaryPlan = selectedPlans[0]
  const alternativePlans = selectedPlans.slice(1, 3)

  // Calculate confidence based on plan match
  const confidence = calculatePlanConfidence(answers, primaryPlan)

  return {
    selectedPlanId: primaryPlan.id,
    recommendations: {
      summary: generateBusinessSummary(answers),
      primaryPlan,
      alternativePlans,
      confidence
    },
    metadata: {
      modelVersion
    }
  }
}

function selectEligiblePlans(answers: Record<string, unknown>) {
  const eligible = BUSINESS_PLAN_CATALOG.plans.filter(plan => {
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
  if (BUSINESS_PLAN_CATALOG.defaults.preferHigherTier) {
    const tierOrder = { foundation: 1, growth: 2, enterprise: 3 }
    eligible.sort((a, b) => tierOrder[b.tier as keyof typeof tierOrder] - tierOrder[a.tier as keyof typeof tierOrder])
  }

  return eligible
}

function generateBusinessSummary(answers: Record<string, unknown>): string {
  const businessType = answers['business-type'] as string || 'business'
  const companySize = answers['company-size'] as string || 'company'
  const goals = Array.isArray(answers['primary-goals'])
    ? (answers['primary-goals'] as string[]).join(', ')
    : answers['primary-goals'] as string || 'growth'
  const timeline = answers['timeline'] as string || 'medium-term'

  return `Based on your questionnaire responses, we've identified you as a ${companySize} ${businessType} company focused on ${goals}. With your ${timeline} timeline, we recommend a strategic approach that balances immediate needs with long-term growth objectives. Our recommendations are tailored specifically to businesses in your situation, ensuring maximum impact and sustainable results.`
}

function calculatePlanConfidence(answers: Record<string, unknown>, plan: any): number {
  let confidence = 0.8 // Base confidence

  // Increase confidence if multiple criteria match
  if (plan.eligibleIf) {
    const matchingCriteria = Object.entries(plan.eligibleIf).filter(([questionId, requiredValues]) => {
      const answerValue = answers[questionId]
      if (Array.isArray(answerValue)) {
        return answerValue.some(val => requiredValues.includes(val as string))
      }
      return requiredValues.includes(answerValue as string)
    })

    const criteriaScore = matchingCriteria.length / Object.keys(plan.eligibleIf).length
    confidence = 0.6 + (criteriaScore * 0.4) // Scale between 0.6 and 1.0
  }

  // Adjust based on answer completeness
  const totalAnswers = Object.keys(answers).length
  const answeredQuestions = Object.values(answers).filter(v =>
    v !== null && v !== undefined && v !== '' &&
    (!Array.isArray(v) || v.length > 0)
  ).length

  const completionRate = totalAnswers > 0 ? answeredQuestions / totalAnswers : 0
  confidence *= (0.7 + (completionRate * 0.3)) // Adjust by completion rate

  return Math.round(confidence * 100) / 100 // Round to 2 decimal places
}

function validateGenerationRequest(body: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!body.sessionId || typeof body.sessionId !== 'string') {
    errors.push('sessionId is required and must be a string')
  }

  if (!body.answers || typeof body.answers !== 'object' || Array.isArray(body.answers)) {
    errors.push('answers is required and must be an object')
  } else if (Object.keys(body.answers).length === 0) {
    errors.push('answers cannot be empty')
  }

  if (body.options && typeof body.options !== 'object') {
    errors.push('options must be an object if provided')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}