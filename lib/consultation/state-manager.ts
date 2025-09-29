'use client'

import React from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { toast } from 'sonner'

export interface LeadData {
  name: string
  email: string
  company: string
  phone?: string
}

export interface ConsultationSession {
  id: string
  leadData: LeadData
  questionnaireAnswers?: Record<string, unknown>
  consultationResults?: {
    selectedPlanId?: string
    generatedAt?: string
    recommendations?: Record<string, unknown>
  }
  status: 'lead_captured' | 'questionnaire_started' | 'questionnaire_completed' | 'consultation_generated' | 'consultation_delivered'
  createdAt: string
  updatedAt: string
  expiresAt: string
}

interface ConsultationState {
  // Current session
  currentSession: ConsultationSession | null

  // Session management
  createSession: (leadData: LeadData) => ConsultationSession
  updateSession: (updates: Partial<ConsultationSession>) => void
  clearSession: () => void

  // Data operations
  saveQuestionnaireAnswers: (answers: Record<string, unknown>) => Promise<void>
  saveConsultationResults: (results: any) => Promise<void>

  // Persistence operations
  persistToStorage: () => void
  loadFromStorage: () => ConsultationSession | null
  clearStorage: () => void

  // Validation
  validateSession: () => boolean
  isSessionExpired: () => boolean

  // Recovery
  recoverSession: () => ConsultationSession | null
}

// Session duration: 24 hours
const SESSION_DURATION = 24 * 60 * 60 * 1000

const generateSessionId = (): string => {
  return `consultation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const isSessionValid = (session: ConsultationSession): boolean => {
  const now = new Date()
  const expiresAt = new Date(session.expiresAt)
  return now < expiresAt
}

export const useConsultationStore = create<ConsultationState>()(
  persist(
    (set, get) => ({
      currentSession: null,

      createSession: (leadData: LeadData) => {
        const now = new Date()
        const expiresAt = new Date(now.getTime() + SESSION_DURATION)

        const session: ConsultationSession = {
          id: generateSessionId(),
          leadData,
          status: 'lead_captured',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          expiresAt: expiresAt.toISOString()
        }

        set({ currentSession: session })

        console.log('Created consultation session:', session.id)
        return session
      },

      updateSession: (updates: Partial<ConsultationSession>) => {
        const current = get().currentSession
        if (!current) {
          console.warn('No current session to update')
          return
        }

        const updatedSession = {
          ...current,
          ...updates,
          updatedAt: new Date().toISOString()
        }

        set({ currentSession: updatedSession })
        console.log('Updated consultation session:', updatedSession.id, updates)
      },

      clearSession: () => {
        set({ currentSession: null })
        console.log('Cleared consultation session')
      },

      saveQuestionnaireAnswers: async (answers: Record<string, unknown>) => {
        const { currentSession, updateSession } = get()

        if (!currentSession) {
          throw new Error('No active consultation session')
        }

        try {
          // Update local state
          updateSession({
            questionnaireAnswers: answers,
            status: 'questionnaire_completed'
          })

          // Persist to API
          const response = await fetch('/api/consultation/submit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId: currentSession.id,
              leadData: currentSession.leadData,
              answers
            })
          })

          if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`)
          }

          const result = await response.json()
          console.log('Questionnaire answers saved:', result)

        } catch (error) {
          console.error('Failed to save questionnaire answers:', error)
          toast.error('Failed to save questionnaire answers. Data saved locally.')
          throw error
        }
      },

      saveConsultationResults: async (results: any) => {
        const { currentSession, updateSession } = get()

        if (!currentSession) {
          throw new Error('No active consultation session')
        }

        try {
          // Update local state
          updateSession({
            consultationResults: {
              selectedPlanId: results.selectedPlanId,
              generatedAt: new Date().toISOString(),
              recommendations: results
            },
            status: 'consultation_generated'
          })

          console.log('Consultation results saved locally:', results)

        } catch (error) {
          console.error('Failed to save consultation results:', error)
          toast.error('Failed to save consultation results')
          throw error
        }
      },

      persistToStorage: () => {
        const { currentSession } = get()
        if (currentSession) {
          try {
            sessionStorage.setItem('consultation_session', JSON.stringify(currentSession))
            localStorage.setItem('consultation_session_backup', JSON.stringify(currentSession))
          } catch (error) {
            console.warn('Failed to persist session to storage:', error)
          }
        }
      },

      loadFromStorage: () => {
        try {
          // Try session storage first (current session)
          const sessionData = sessionStorage.getItem('consultation_session')
          if (sessionData) {
            const session = JSON.parse(sessionData)
            if (isSessionValid(session)) {
              set({ currentSession: session })
              return session
            }
          }

          // Fallback to local storage (backup)
          const backupData = localStorage.getItem('consultation_session_backup')
          if (backupData) {
            const session = JSON.parse(backupData)
            if (isSessionValid(session)) {
              set({ currentSession: session })
              return session
            }
          }

          return null
        } catch (error) {
          console.warn('Failed to load session from storage:', error)
          return null
        }
      },

      clearStorage: () => {
        try {
          sessionStorage.removeItem('consultation_session')
          sessionStorage.removeItem('consultation_lead')
          sessionStorage.removeItem('consultation_data')
          localStorage.removeItem('consultation_session_backup')
        } catch (error) {
          console.warn('Failed to clear storage:', error)
        }
      },

      validateSession: () => {
        const { currentSession } = get()
        return currentSession !== null && isSessionValid(currentSession)
      },

      isSessionExpired: () => {
        const { currentSession } = get()
        if (!currentSession) return true
        return !isSessionValid(currentSession)
      },

      recoverSession: () => {
        const { loadFromStorage, validateSession } = get()

        // Try to recover from storage
        const recovered = loadFromStorage()

        if (recovered && validateSession()) {
          console.log('Session recovered successfully:', recovered.id)
          return recovered
        }

        // Clean up if session is invalid or expired
        get().clearStorage()
        get().clearSession()

        return null
      }
    }),
    {
      name: 'consultation-state',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        currentSession: state.currentSession
      }),
      onRehydrateStorage: () => (state) => {
        // Validate session on rehydration
        if (state?.currentSession && !isSessionValid(state.currentSession)) {
          state.clearSession()
          state.clearStorage()
        }
      }
    }
  )
)

// Utility hook for session management
export const useConsultationSession = () => {
  const store = useConsultationStore()

  // Auto-recovery on mount
  React.useEffect(() => {
    if (!store.currentSession) {
      store.recoverSession()
    }
  }, [store])

  return {
    session: store.currentSession,
    createSession: store.createSession,
    updateSession: store.updateSession,
    clearSession: store.clearSession,
    isValid: store.validateSession(),
    isExpired: store.isSessionExpired(),
    recover: store.recoverSession
  }
}

// Migration utility to convert legacy session storage format
export const migrateLegacySession = (): ConsultationSession | null => {
  try {
    const legacyLead = sessionStorage.getItem('consultation_lead')
    const legacyData = sessionStorage.getItem('consultation_data')

    if (legacyLead) {
      const leadData = JSON.parse(legacyLead)
      const store = useConsultationStore.getState()

      const session = store.createSession(leadData)

      if (legacyData) {
        const data = JSON.parse(legacyData)
        if (data.answers) {
          store.updateSession({
            questionnaireAnswers: data.answers,
            status: 'questionnaire_completed'
          })
        }
      }

      // Clean up legacy data
      sessionStorage.removeItem('consultation_lead')
      sessionStorage.removeItem('consultation_data')

      console.log('Migrated legacy session to new format')
      return session
    }

    return null
  } catch (error) {
    console.warn('Failed to migrate legacy session:', error)
    return null
  }
}