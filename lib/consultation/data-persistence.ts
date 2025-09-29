import { createClient } from '@supabase/supabase-js'
import { LeadData, ConsultationSession } from './state-manager'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface ConsultationRecord {
  id: string
  session_id: string
  lead_name: string
  lead_email: string
  lead_company: string
  lead_phone?: string
  questionnaire_answers?: Record<string, unknown>
  consultation_results?: Record<string, unknown>
  status: 'lead_captured' | 'questionnaire_started' | 'questionnaire_completed' | 'consultation_generated' | 'consultation_delivered'
  created_at: string
  updated_at: string
  expires_at: string
}

export interface QuestionnaireSubmission {
  id: string
  session_id: string
  questionnaire_id: string
  answers: Record<string, unknown>
  completion_rate: number
  time_spent_seconds?: number
  submitted_at: string
}

export interface ConsultationGeneration {
  id: string
  session_id: string
  questionnaire_submission_id: string
  selected_plan_id?: string
  ai_recommendations: Record<string, unknown>
  generation_metadata: {
    model_version?: string
    processing_time_ms?: number
    confidence_score?: number
  }
  generated_at: string
}

export class ConsultationDataPersistence {

  /**
   * Save lead data and create initial consultation record
   */
  static async saveLead(sessionId: string, leadData: LeadData): Promise<string> {
    try {
      const now = new Date().toISOString()
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours

      const { data, error } = await supabase
        .from('consultation_sessions')
        .insert({
          session_id: sessionId,
          lead_name: leadData.name,
          lead_email: leadData.email,
          lead_company: leadData.company,
          lead_phone: leadData.phone,
          status: 'lead_captured',
          created_at: now,
          updated_at: now,
          expires_at: expiresAt
        })
        .select()
        .single()

      if (error) {
        console.error('Database error saving lead:', error)
        throw new Error(`Failed to save lead data: ${error.message}`)
      }

      console.log('Lead data saved to database:', data.id)
      return data.id
    } catch (error) {
      console.error('Failed to save lead data:', error)
      throw error
    }
  }

  /**
   * Save questionnaire submission
   */
  static async saveQuestionnaireSubmission(
    sessionId: string,
    questionnaireId: string,
    answers: Record<string, unknown>,
    metadata?: { timeSpentSeconds?: number; completionRate?: number }
  ): Promise<string> {
    try {
      const now = new Date().toISOString()

      // Calculate completion rate if not provided
      const completionRate = metadata?.completionRate ?? this.calculateCompletionRate(answers)

      const { data, error } = await supabase
        .from('questionnaire_submissions')
        .insert({
          session_id: sessionId,
          questionnaire_id: questionnaireId,
          answers: answers,
          completion_rate: completionRate,
          time_spent_seconds: metadata?.timeSpentSeconds,
          submitted_at: now
        })
        .select()
        .single()

      if (error) {
        console.error('Database error saving questionnaire:', error)
        throw new Error(`Failed to save questionnaire: ${error.message}`)
      }

      // Update consultation session status
      await this.updateSessionStatus(sessionId, 'questionnaire_completed')

      console.log('Questionnaire submission saved:', data.id)
      return data.id
    } catch (error) {
      console.error('Failed to save questionnaire submission:', error)
      throw error
    }
  }

  /**
   * Save AI consultation generation results
   */
  static async saveConsultationGeneration(
    sessionId: string,
    questionnaireSubmissionId: string,
    selectedPlanId: string | undefined,
    aiRecommendations: Record<string, unknown>,
    metadata?: {
      modelVersion?: string
      processingTimeMs?: number
      confidenceScore?: number
    }
  ): Promise<string> {
    try {
      const now = new Date().toISOString()

      const { data, error } = await supabase
        .from('consultation_generations')
        .insert({
          session_id: sessionId,
          questionnaire_submission_id: questionnaireSubmissionId,
          selected_plan_id: selectedPlanId,
          ai_recommendations: aiRecommendations,
          generation_metadata: metadata || {},
          generated_at: now
        })
        .select()
        .single()

      if (error) {
        console.error('Database error saving consultation generation:', error)
        throw new Error(`Failed to save consultation generation: ${error.message}`)
      }

      // Update consultation session status
      await this.updateSessionStatus(sessionId, 'consultation_generated')

      console.log('Consultation generation saved:', data.id)
      return data.id
    } catch (error) {
      console.error('Failed to save consultation generation:', error)
      throw error
    }
  }

  /**
   * Retrieve consultation session by session ID
   */
  static async getSession(sessionId: string): Promise<ConsultationRecord | null> {
    try {
      const { data, error } = await supabase
        .from('consultation_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') { // No rows found
          return null
        }
        console.error('Database error retrieving session:', error)
        throw new Error(`Failed to retrieve session: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Failed to retrieve consultation session:', error)
      throw error
    }
  }

  /**
   * Retrieve questionnaire submission by session ID
   */
  static async getQuestionnaireSubmission(sessionId: string): Promise<QuestionnaireSubmission | null> {
    try {
      const { data, error } = await supabase
        .from('questionnaire_submissions')
        .select('*')
        .eq('session_id', sessionId)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        if (error.code === 'PGRST116') { // No rows found
          return null
        }
        console.error('Database error retrieving questionnaire submission:', error)
        throw new Error(`Failed to retrieve questionnaire submission: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Failed to retrieve questionnaire submission:', error)
      throw error
    }
  }

  /**
   * Retrieve consultation generation by session ID
   */
  static async getConsultationGeneration(sessionId: string): Promise<ConsultationGeneration | null> {
    try {
      const { data, error } = await supabase
        .from('consultation_generations')
        .select('*')
        .eq('session_id', sessionId)
        .order('generated_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        if (error.code === 'PGRST116') { // No rows found
          return null
        }
        console.error('Database error retrieving consultation generation:', error)
        throw new Error(`Failed to retrieve consultation generation: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Failed to retrieve consultation generation:', error)
      throw error
    }
  }

  /**
   * Update consultation session status
   */
  static async updateSessionStatus(
    sessionId: string,
    status: ConsultationRecord['status']
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('consultation_sessions')
        .update({
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId)

      if (error) {
        console.error('Database error updating session status:', error)
        throw new Error(`Failed to update session status: ${error.message}`)
      }

      console.log('Session status updated:', sessionId, status)
    } catch (error) {
      console.error('Failed to update session status:', error)
      throw error
    }
  }

  /**
   * Clean up expired sessions
   */
  static async cleanupExpiredSessions(): Promise<number> {
    try {
      const now = new Date().toISOString()

      const { data, error } = await supabase
        .from('consultation_sessions')
        .delete()
        .lt('expires_at', now)
        .select('id')

      if (error) {
        console.error('Database error cleaning up expired sessions:', error)
        throw new Error(`Failed to cleanup expired sessions: ${error.message}`)
      }

      const deletedCount = data?.length || 0
      console.log(`Cleaned up ${deletedCount} expired sessions`)
      return deletedCount
    } catch (error) {
      console.error('Failed to cleanup expired sessions:', error)
      throw error
    }
  }

  /**
   * Get session analytics
   */
  static async getSessionAnalytics(timeframe: 'day' | 'week' | 'month' = 'week') {
    try {
      const now = new Date()
      let startDate: Date

      switch (timeframe) {
        case 'day':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
      }

      const { data, error } = await supabase
        .from('consultation_sessions')
        .select('status, created_at')
        .gte('created_at', startDate.toISOString())

      if (error) {
        console.error('Database error retrieving analytics:', error)
        throw new Error(`Failed to retrieve analytics: ${error.message}`)
      }

      // Process analytics data
      const analytics = {
        totalSessions: data.length,
        byStatus: data.reduce((acc, session) => {
          acc[session.status] = (acc[session.status] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        conversionRate: 0
      }

      // Calculate conversion rate (leads that complete questionnaire)
      const completed = analytics.byStatus.questionnaire_completed || 0
      const generated = analytics.byStatus.consultation_generated || 0
      const delivered = analytics.byStatus.consultation_delivered || 0

      const conversions = completed + generated + delivered
      analytics.conversionRate = analytics.totalSessions > 0
        ? (conversions / analytics.totalSessions) * 100
        : 0

      return analytics
    } catch (error) {
      console.error('Failed to retrieve session analytics:', error)
      throw error
    }
  }

  /**
   * Calculate completion rate for questionnaire answers
   */
  private static calculateCompletionRate(answers: Record<string, unknown>): number {
    if (!answers || typeof answers !== 'object') return 0

    const values = Object.values(answers)
    const totalQuestions = values.length

    if (totalQuestions === 0) return 0

    const answeredQuestions = values.filter(value => {
      if (value === null || value === undefined || value === '') return false
      if (Array.isArray(value) && value.length === 0) return false
      return true
    }).length

    return Math.round((answeredQuestions / totalQuestions) * 100)
  }

  /**
   * Validate session data before persistence
   */
  static validateSessionData(sessionData: Partial<ConsultationSession>): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (!sessionData.id) {
      errors.push('Session ID is required')
    }

    if (!sessionData.leadData) {
      errors.push('Lead data is required')
    } else {
      if (!sessionData.leadData.name?.trim()) {
        errors.push('Lead name is required')
      }
      if (!sessionData.leadData.email?.trim()) {
        errors.push('Lead email is required')
      }
      if (!sessionData.leadData.company?.trim()) {
        errors.push('Lead company is required')
      }
      if (sessionData.leadData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sessionData.leadData.email)) {
        errors.push('Invalid email format')
      }
    }

    if (!sessionData.status) {
      errors.push('Session status is required')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Backup session data to local storage
   */
  static backupToLocalStorage(sessionData: ConsultationSession): void {
    try {
      const backup = {
        ...sessionData,
        backedUpAt: new Date().toISOString()
      }
      localStorage.setItem(`consultation_backup_${sessionData.id}`, JSON.stringify(backup))
    } catch (error) {
      console.warn('Failed to backup session to local storage:', error)
    }
  }

  /**
   * Restore session data from local storage
   */
  static restoreFromLocalStorage(sessionId: string): ConsultationSession | null {
    try {
      const backupData = localStorage.getItem(`consultation_backup_${sessionId}`)
      if (backupData) {
        const backup = JSON.parse(backupData)
        // Remove backup timestamp before returning
        delete backup.backedUpAt
        return backup
      }
      return null
    } catch (error) {
      console.warn('Failed to restore session from local storage:', error)
      return null
    }
  }
}