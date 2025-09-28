/**
 * Documents Management Hook
 * Provides comprehensive document management and tracking
 * Part of Phase 1.2 Database Schema & State Management
 */

import { useState, useEffect, useCallback } from 'react'

export interface Document {
  id: string
  tenant_app_id: string
  submission_id?: string
  filename: string
  file_path: string
  file_size: number
  file_type: string
  mime_type: string
  storage_provider: 'supabase' | 's3' | 'gcs' | 'azure'
  storage_bucket?: string
  storage_key?: string
  checksum?: string
  status: 'uploaded' | 'processing' | 'ready' | 'failed' | 'archived'
  generated_at: string
  expires_at?: string
  download_count: number
  last_downloaded_at?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface DocumentFilters {
  tenant_app_id?: string
  submission_id?: string
  status?: string
  file_type?: string
  date_from?: string
  date_to?: string
  search?: string
}

export interface DocumentStats {
  total: number
  total_size: number
  by_status: Record<string, number>
  by_type: Record<string, number>
  by_storage: Record<string, number>
  by_date: Record<string, number>
  recent_documents: Document[]
}

export interface DocumentUploadOptions {
  file: File
  tenant_app_id: string
  submission_id?: string
  metadata?: Record<string, any>
  expires_at?: string
}

export interface UseDocumentsReturn {
  // Data
  documents: Document[]
  stats: DocumentStats | null
  loading: boolean
  error: string | null

  // Actions
  fetchDocuments: (filters?: DocumentFilters) => Promise<void>
  fetchDocument: (id: string) => Promise<Document | null>
  fetchStats: (tenantAppId?: string) => Promise<void>
  uploadDocument: (options: DocumentUploadOptions) => Promise<Document>
  updateDocument: (id: string, updates: Partial<Document>) => Promise<Document>
  deleteDocument: (id: string) => Promise<void>
  archiveDocument: (id: string) => Promise<Document>
  restoreDocument: (id: string) => Promise<Document>
  downloadDocument: (id: string) => Promise<Blob>
  getDownloadUrl: (id: string, expiresIn?: number) => Promise<string>
  generateDocument: (submissionId: string, templateId: string, options?: {
    format?: 'pdf' | 'docx' | 'html'
    metadata?: Record<string, any>
  }) => Promise<Document>
  refreshDocuments: () => Promise<void>
}

export function useDocuments(): UseDocumentsReturn {
  const [documents, setDocuments] = useState<Document[]>([])
  const [stats, setStats] = useState<DocumentStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch documents with optional filters
   */
  const fetchDocuments = useCallback(async (filters: DocumentFilters = {}) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString())
        }
      })

      const url = `/api/documents${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Failed to fetch documents')
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch documents')
      }

      setDocuments(data.documents || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch documents'
      setError(errorMessage)
      console.error('Error fetching documents:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Fetch a single document by ID
   */
  const fetchDocument = useCallback(async (id: string): Promise<Document | null> => {
    try {
      setError(null)

      const response = await fetch(`/api/documents/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch document')
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch document')
      }

      return data.document
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch document'
      setError(errorMessage)
      console.error('Error fetching document:', err)
      return null
    }
  }, [])

  /**
   * Fetch document statistics
   */
  const fetchStats = useCallback(async (tenantAppId?: string) => {
    try {
      setError(null)

      const url = `/api/documents/stats${tenantAppId ? `?tenant_app_id=${tenantAppId}` : ''}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Failed to fetch document stats')
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch document stats')
      }

      setStats(data.stats)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch document stats'
      setError(errorMessage)
      console.error('Error fetching document stats:', err)
    }
  }, [])

  /**
   * Upload a new document
   */
  const uploadDocument = useCallback(async (options: DocumentUploadOptions): Promise<Document> => {
    try {
      setError(null)

      const formData = new FormData()
      formData.append('file', options.file)
      formData.append('tenant_app_id', options.tenant_app_id)
      
      if (options.submission_id) {
        formData.append('submission_id', options.submission_id)
      }
      
      if (options.metadata) {
        formData.append('metadata', JSON.stringify(options.metadata))
      }
      
      if (options.expires_at) {
        formData.append('expires_at', options.expires_at)
      }

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload document')
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to upload document')
      }

      // Update local state
      setDocuments(prev => [data.document, ...prev])

      return data.document
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload document'
      setError(errorMessage)
      console.error('Error uploading document:', err)
      throw err
    }
  }, [])

  /**
   * Update a document
   */
  const updateDocument = useCallback(async (id: string, updates: Partial<Document>): Promise<Document> => {
    try {
      setError(null)

      const response = await fetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update document')
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to update document')
      }

      // Update local state
      setDocuments(prev => prev.map(doc => 
        doc.id === id ? data.document : doc
      ))

      return data.document
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update document'
      setError(errorMessage)
      console.error('Error updating document:', err)
      throw err
    }
  }, [])

  /**
   * Delete a document
   */
  const deleteDocument = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null)

      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete document')
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete document')
      }

      // Update local state
      setDocuments(prev => prev.filter(doc => doc.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete document'
      setError(errorMessage)
      console.error('Error deleting document:', err)
      throw err
    }
  }, [])

  /**
   * Archive a document
   */
  const archiveDocument = useCallback(async (id: string): Promise<Document> => {
    try {
      setError(null)

      const response = await fetch(`/api/documents/${id}/archive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'archive' }),
      })

      if (!response.ok) {
        throw new Error('Failed to archive document')
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to archive document')
      }

      // Update local state
      setDocuments(prev => prev.map(doc => 
        doc.id === id ? data.document : doc
      ))

      return data.document
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to archive document'
      setError(errorMessage)
      console.error('Error archiving document:', err)
      throw err
    }
  }, [])

  /**
   * Restore an archived document
   */
  const restoreDocument = useCallback(async (id: string): Promise<Document> => {
    try {
      setError(null)

      const response = await fetch(`/api/documents/${id}/archive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'restore' }),
      })

      if (!response.ok) {
        throw new Error('Failed to restore document')
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to restore document')
      }

      // Update local state
      setDocuments(prev => prev.map(doc => 
        doc.id === id ? data.document : doc
      ))

      return data.document
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to restore document'
      setError(errorMessage)
      console.error('Error restoring document:', err)
      throw err
    }
  }, [])

  /**
   * Download a document
   */
  const downloadDocument = useCallback(async (id: string): Promise<Blob> => {
    try {
      setError(null)

      const response = await fetch(`/api/documents/${id}/download`)
      if (!response.ok) {
        throw new Error('Failed to download document')
      }

      return await response.blob()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download document'
      setError(errorMessage)
      console.error('Error downloading document:', err)
      throw err
    }
  }, [])

  /**
   * Get a signed download URL
   */
  const getDownloadUrl = useCallback(async (id: string, expiresIn: number = 3600): Promise<string> => {
    try {
      setError(null)

      const response = await fetch(`/api/documents/${id}/download-url?expires_in=${expiresIn}`)
      if (!response.ok) {
        throw new Error('Failed to get download URL')
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to get download URL')
      }

      return data.download_url
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get download URL'
      setError(errorMessage)
      console.error('Error getting download URL:', err)
      throw err
    }
  }, [])

  /**
   * Generate a document from a form submission
   */
  const generateDocument = useCallback(async (
    submissionId: string,
    templateId: string,
    options: {
      format?: 'pdf' | 'docx' | 'html'
      metadata?: Record<string, any>
    } = {}
  ): Promise<Document> => {
    try {
      setError(null)

      const response = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submission_id: submissionId,
          template_id: templateId,
          format: options.format || 'pdf',
          metadata: options.metadata || {}
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate document')
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate document')
      }

      // Update local state
      setDocuments(prev => [data.document, ...prev])

      return data.document
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate document'
      setError(errorMessage)
      console.error('Error generating document:', err)
      throw err
    }
  }, [])

  /**
   * Refresh documents (re-fetch current data)
   */
  const refreshDocuments = useCallback(async () => {
    await fetchDocuments()
  }, [fetchDocuments])

  // Initial fetch
  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  return {
    // Data
    documents,
    stats,
    loading,
    error,

    // Actions
    fetchDocuments,
    fetchDocument,
    fetchStats,
    uploadDocument,
    updateDocument,
    deleteDocument,
    archiveDocument,
    restoreDocument,
    downloadDocument,
    getDownloadUrl,
    generateDocument,
    refreshDocuments
  }
}

/**
 * Hook for managing documents for a specific tenant app
 */
export function useTenantAppDocuments(tenantAppId: string): UseDocumentsReturn {
  const {
    documents,
    stats,
    loading,
    error,
    fetchDocuments,
    fetchDocument,
    fetchStats,
    uploadDocument,
    updateDocument,
    deleteDocument,
    archiveDocument,
    restoreDocument,
    downloadDocument,
    getDownloadUrl,
    generateDocument,
    refreshDocuments
  } = useDocuments()

  // Override fetchDocuments to always include tenant_app_id filter
  const fetchTenantDocuments = useCallback(async (filters: DocumentFilters = {}) => {
    await fetchDocuments({
      ...filters,
      tenant_app_id: tenantAppId
    })
  }, [fetchDocuments, tenantAppId])

  // Override fetchStats to always include tenant_app_id
  const fetchTenantStats = useCallback(async () => {
    await fetchStats(tenantAppId)
  }, [fetchStats, tenantAppId])

  // Override refreshDocuments
  const refreshTenantDocuments = useCallback(async () => {
    await fetchTenantDocuments()
  }, [fetchTenantDocuments])

  // Initial fetch for this tenant app
  useEffect(() => {
    if (tenantAppId) {
      fetchTenantDocuments()
      fetchTenantStats()
    }
  }, [tenantAppId, fetchTenantDocuments, fetchTenantStats])

  return {
    documents,
    stats,
    loading,
    error,
    fetchDocuments: fetchTenantDocuments,
    fetchDocument,
    fetchStats: fetchTenantStats,
    uploadDocument,
    updateDocument,
    deleteDocument,
    archiveDocument,
    restoreDocument,
    downloadDocument,
    getDownloadUrl,
    generateDocument,
    refreshDocuments: refreshTenantDocuments
  }
}
