/**
 * Form Submissions Management Hook
 * Provides comprehensive form submission data management
 * Part of Phase 1.2 Database Schema & State Management
 */

import { useState, useEffect, useCallback } from 'react'

export interface FormSubmission {
  id: string
  tenant_app_id: string
  form_id: string
  form_data: Record<string, any>
  submitted_at: string
  ip_address?: string
  user_agent?: string
  referrer_url?: string
  session_id?: string
  status: 'submitted' | 'processed' | 'failed' | 'archived'
  processed_at?: string
  error_message?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface FormSubmissionFilters {
  tenant_app_id?: string
  form_id?: string
  status?: string
  date_from?: string
  date_to?: string
  search?: string
}

export interface FormSubmissionStats {
  total: number
  by_status: Record<string, number>
  by_form: Record<string, number>
  by_date: Record<string, number>
  recent_submissions: FormSubmission[]
}

export interface UseFormSubmissionsReturn {
  // Data
  submissions: FormSubmission[]
  stats: FormSubmissionStats | null
  loading: boolean
  error: string | null

  // Actions
  fetchSubmissions: (filters?: FormSubmissionFilters) => Promise<void>
  fetchSubmission: (id: string) => Promise<FormSubmission | null>
  fetchStats: (tenantAppId?: string) => Promise<void>
  updateSubmission: (id: string, updates: Partial<FormSubmission>) => Promise<FormSubmission>
  deleteSubmission: (id: string) => Promise<void>
  archiveSubmission: (id: string) => Promise<FormSubmission>
  restoreSubmission: (id: string) => Promise<FormSubmission>
  exportSubmissions: (filters?: FormSubmissionFilters, format?: 'csv' | 'json' | 'excel') => Promise<Blob>
  refreshSubmissions: () => Promise<void>
}

export function useFormSubmissions(): UseFormSubmissionsReturn {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [stats, setStats] = useState<FormSubmissionStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch form submissions with optional filters
   */
  const fetchSubmissions = useCallback(async (filters: FormSubmissionFilters = {}) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString())
        }
      })

      const url = `/api/form-submissions${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Failed to fetch form submissions')
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch form submissions')
      }

      setSubmissions(data.submissions || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch form submissions'
      setError(errorMessage)
      console.error('Error fetching form submissions:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Fetch a single form submission by ID
   */
  const fetchSubmission = useCallback(async (id: string): Promise<FormSubmission | null> => {
    try {
      setError(null)

      const response = await fetch(`/api/form-submissions/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch form submission')
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch form submission')
      }

      return data.submission
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch form submission'
      setError(errorMessage)
      console.error('Error fetching form submission:', err)
      return null
    }
  }, [])

  /**
   * Fetch form submission statistics
   */
  const fetchStats = useCallback(async (tenantAppId?: string) => {
    try {
      setError(null)

      const url = `/api/form-submissions/stats${tenantAppId ? `?tenant_app_id=${tenantAppId}` : ''}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Failed to fetch form submission stats')
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch form submission stats')
      }

      setStats(data.stats)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch form submission stats'
      setError(errorMessage)
      console.error('Error fetching form submission stats:', err)
    }
  }, [])

  /**
   * Update a form submission
   */
  const updateSubmission = useCallback(async (id: string, updates: Partial<FormSubmission>): Promise<FormSubmission> => {
    try {
      setError(null)

      const response = await fetch(`/api/form-submissions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update form submission')
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to update form submission')
      }

      // Update local state
      setSubmissions(prev => prev.map(submission => 
        submission.id === id ? data.submission : submission
      ))

      return data.submission
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update form submission'
      setError(errorMessage)
      console.error('Error updating form submission:', err)
      throw err
    }
  }, [])

  /**
   * Delete a form submission
   */
  const deleteSubmission = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null)

      const response = await fetch(`/api/form-submissions/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete form submission')
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete form submission')
      }

      // Update local state
      setSubmissions(prev => prev.filter(submission => submission.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete form submission'
      setError(errorMessage)
      console.error('Error deleting form submission:', err)
      throw err
    }
  }, [])

  /**
   * Archive a form submission
   */
  const archiveSubmission = useCallback(async (id: string): Promise<FormSubmission> => {
    try {
      setError(null)

      const response = await fetch(`/api/form-submissions/${id}/archive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'archive' }),
      })

      if (!response.ok) {
        throw new Error('Failed to archive form submission')
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to archive form submission')
      }

      // Update local state
      setSubmissions(prev => prev.map(submission => 
        submission.id === id ? data.submission : submission
      ))

      return data.submission
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to archive form submission'
      setError(errorMessage)
      console.error('Error archiving form submission:', err)
      throw err
    }
  }, [])

  /**
   * Restore an archived form submission
   */
  const restoreSubmission = useCallback(async (id: string): Promise<FormSubmission> => {
    try {
      setError(null)

      const response = await fetch(`/api/form-submissions/${id}/archive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'restore' }),
      })

      if (!response.ok) {
        throw new Error('Failed to restore form submission')
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to restore form submission')
      }

      // Update local state
      setSubmissions(prev => prev.map(submission => 
        submission.id === id ? data.submission : submission
      ))

      return data.submission
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to restore form submission'
      setError(errorMessage)
      console.error('Error restoring form submission:', err)
      throw err
    }
  }, [])

  /**
   * Export form submissions
   */
  const exportSubmissions = useCallback(async (
    filters: FormSubmissionFilters = {},
    format: 'csv' | 'json' | 'excel' = 'csv'
  ): Promise<Blob> => {
    try {
      setError(null)

      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString())
        }
      })
      params.append('format', format)

      const url = `/api/form-submissions/export?${params.toString()}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Failed to export form submissions')
      }

      return await response.blob()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export form submissions'
      setError(errorMessage)
      console.error('Error exporting form submissions:', err)
      throw err
    }
  }, [])

  /**
   * Refresh submissions (re-fetch current data)
   */
  const refreshSubmissions = useCallback(async () => {
    await fetchSubmissions()
  }, [fetchSubmissions])

  // Initial fetch
  useEffect(() => {
    fetchSubmissions()
  }, [fetchSubmissions])

  return {
    // Data
    submissions,
    stats,
    loading,
    error,

    // Actions
    fetchSubmissions,
    fetchSubmission,
    fetchStats,
    updateSubmission,
    deleteSubmission,
    archiveSubmission,
    restoreSubmission,
    exportSubmissions,
    refreshSubmissions
  }
}

/**
 * Hook for managing form submissions for a specific tenant app
 */
export function useTenantAppFormSubmissions(tenantAppId: string): UseFormSubmissionsReturn {
  const {
    submissions,
    stats,
    loading,
    error,
    fetchSubmissions,
    fetchSubmission,
    fetchStats,
    updateSubmission,
    deleteSubmission,
    archiveSubmission,
    restoreSubmission,
    exportSubmissions,
    refreshSubmissions
  } = useFormSubmissions()

  // Override fetchSubmissions to always include tenant_app_id filter
  const fetchTenantSubmissions = useCallback(async (filters: FormSubmissionFilters = {}) => {
    await fetchSubmissions({
      ...filters,
      tenant_app_id: tenantAppId
    })
  }, [fetchSubmissions, tenantAppId])

  // Override fetchStats to always include tenant_app_id
  const fetchTenantStats = useCallback(async () => {
    await fetchStats(tenantAppId)
  }, [fetchStats, tenantAppId])

  // Override refreshSubmissions
  const refreshTenantSubmissions = useCallback(async () => {
    await fetchTenantSubmissions()
  }, [fetchTenantSubmissions])

  // Initial fetch for this tenant app
  useEffect(() => {
    if (tenantAppId) {
      fetchTenantSubmissions()
      fetchTenantStats()
    }
  }, [tenantAppId, fetchTenantSubmissions, fetchTenantStats])

  return {
    submissions,
    stats,
    loading,
    error,
    fetchSubmissions: fetchTenantSubmissions,
    fetchSubmission,
    fetchStats: fetchTenantStats,
    updateSubmission,
    deleteSubmission,
    archiveSubmission,
    restoreSubmission,
    exportSubmissions,
    refreshSubmissions: refreshTenantSubmissions
  }
}
