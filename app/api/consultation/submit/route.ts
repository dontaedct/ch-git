import { NextRequest, NextResponse } from 'next/server'
import { ConsultationDataPersistence } from '@/lib/consultation/data-persistence'
import { emitLeadStartedQuestionnaire, emitLeadCompletedQuestionnaire } from '@/lib/webhooks/emitter'

export interface QuestionnaireSubmissionRequest {
  sessionId: string
  leadData: {
    name: string
    email: string
    company: string
    phone?: string
  }
  answers: Record<string, unknown>
  metadata?: {
    timeSpentSeconds?: number
    questionnaireId?: string
    startedAt?: string
    completedAt?: string
  }
}

export interface QuestionnaireSubmissionResponse {
  success: boolean
  submissionId?: string
  sessionId: string
  message: string
  analytics?: {
    completionRate: number
    timeSpent?: number
    questionsAnswered: number
    totalQuestions: number
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body: QuestionnaireSubmissionRequest = await request.json()

    // Validate required fields
    const validation = validateSubmissionRequest(body)
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          sessionId: body.sessionId || 'unknown',
          message: `Validation failed: ${validation.errors.join(', ')}`
        } as QuestionnaireSubmissionResponse,
        { status: 400 }
      )
    }

    const { sessionId, leadData, answers, metadata } = body

    console.log('Processing questionnaire submission:', {
      sessionId,
      leadEmail: leadData.email,
      answerCount: Object.keys(answers).length
    })

    // Check if session exists, create if not
    let existingSession = await ConsultationDataPersistence.getSession(sessionId)

    if (!existingSession) {
      console.log('Creating new consultation session for submission')
      await ConsultationDataPersistence.saveLead(sessionId, leadData)
    }

    // Calculate analytics
    const analytics = calculateSubmissionAnalytics(answers, metadata)

    // Save questionnaire submission
    const submissionId = await ConsultationDataPersistence.saveQuestionnaireSubmission(
      sessionId,
      metadata?.questionnaireId || 'business-consultation-v1',
      answers,
      {
        timeSpentSeconds: metadata?.timeSpentSeconds,
        completionRate: analytics.completionRate
      }
    )

    // Emit webhook events
    try {
      // Emit questionnaire completion event
      await emitLeadCompletedQuestionnaire({
        leadId: sessionId,
        clientName: leadData.name,
        clientEmail: leadData.email,
        questionnaireId: metadata?.questionnaireId || 'business-consultation-v1',
        completedAt: new Date(),
        responses: answers
      })

      console.log('Webhook events emitted successfully')
    } catch (webhookError) {
      console.warn('Failed to emit webhook events:', webhookError)
      // Don't fail the request for webhook errors
    }

    // Prepare response
    const response: QuestionnaireSubmissionResponse = {
      success: true,
      submissionId,
      sessionId,
      message: 'Questionnaire submitted successfully',
      analytics
    }

    console.log('Questionnaire submission processed successfully:', {
      submissionId,
      sessionId,
      completionRate: analytics.completionRate
    })

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('Error processing questionnaire submission:', error)

    const errorResponse: QuestionnaireSubmissionResponse = {
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

    // Retrieve submission data
    const submission = await ConsultationDataPersistence.getQuestionnaireSubmission(sessionId)

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: submission
    }, { status: 200 })

  } catch (error) {
    console.error('Error retrieving questionnaire submission:', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function validateSubmissionRequest(body: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check required fields
  if (!body.sessionId || typeof body.sessionId !== 'string') {
    errors.push('sessionId is required and must be a string')
  }

  if (!body.leadData || typeof body.leadData !== 'object') {
    errors.push('leadData is required and must be an object')
  } else {
    if (!body.leadData.name || typeof body.leadData.name !== 'string') {
      errors.push('leadData.name is required and must be a string')
    }

    if (!body.leadData.email || typeof body.leadData.email !== 'string') {
      errors.push('leadData.email is required and must be a string')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.leadData.email)) {
      errors.push('leadData.email must be a valid email address')
    }

    if (!body.leadData.company || typeof body.leadData.company !== 'string') {
      errors.push('leadData.company is required and must be a string')
    }

    if (body.leadData.phone && typeof body.leadData.phone !== 'string') {
      errors.push('leadData.phone must be a string if provided')
    }
  }

  if (!body.answers || typeof body.answers !== 'object' || Array.isArray(body.answers)) {
    errors.push('answers is required and must be an object')
  } else if (Object.keys(body.answers).length === 0) {
    errors.push('answers cannot be empty')
  }

  // Validate metadata if provided
  if (body.metadata && typeof body.metadata !== 'object') {
    errors.push('metadata must be an object if provided')
  }

  if (body.metadata?.timeSpentSeconds && (typeof body.metadata.timeSpentSeconds !== 'number' || body.metadata.timeSpentSeconds < 0)) {
    errors.push('metadata.timeSpentSeconds must be a positive number if provided')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

function calculateSubmissionAnalytics(
  answers: Record<string, unknown>,
  metadata?: QuestionnaireSubmissionRequest['metadata']
): {
  completionRate: number
  timeSpent?: number
  questionsAnswered: number
  totalQuestions: number
} {
  const totalQuestions = Object.keys(answers).length

  // Count answered questions (non-empty values)
  const questionsAnswered = Object.values(answers).filter(value => {
    if (value === null || value === undefined || value === '') return false
    if (Array.isArray(value) && value.length === 0) return false
    return true
  }).length

  const completionRate = totalQuestions > 0
    ? Math.round((questionsAnswered / totalQuestions) * 100)
    : 0

  return {
    completionRate,
    timeSpent: metadata?.timeSpentSeconds,
    questionsAnswered,
    totalQuestions
  }
}