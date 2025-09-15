/**
 * @fileoverview Global Error Boundary Provider
 * @module components/providers/ErrorBoundaryProvider
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Global Error Boundary Provider
 * Purpose: Application-wide error boundary with comprehensive error handling
 * Safety: Global error tracking and recovery mechanisms
 */

'use client'

import React, { createContext, useContext, useCallback, useState } from 'react'
import { ComprehensiveErrorBoundary } from '@/components/ui/comprehensive-error-boundary'
import { ErrorNotification } from '@/components/ui/error-notification'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ErrorContextType {
  reportError: (error: Error, context?: string) => void
  clearErrors: () => void
  getErrorHistory: () => ErrorEntry[]
}

interface ErrorEntry {
  id: string
  error: Error
  context?: string
  timestamp: number
  resolved: boolean
}

const ErrorContext = createContext<ErrorContextType | null>(null)

interface ErrorBoundaryProviderProps {
  children: React.ReactNode
  enableErrorReporting?: boolean
  enableErrorRecovery?: boolean
  maxRetries?: number
  className?: string
}

export function ErrorBoundaryProvider({
  children,
  enableErrorReporting = true,
  enableErrorRecovery = true,
  maxRetries = 3,
  className
}: ErrorBoundaryProviderProps) {
  const [errorHistory, setErrorHistory] = useState<ErrorEntry[]>([])

  const reportError = useCallback((error: Error, context?: string) => {
    const errorEntry: ErrorEntry = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      error,
      context,
      timestamp: Date.now(),
      resolved: false
    }

    setErrorHistory(prev => [...prev, errorEntry].slice(-50)) // Keep last 50 errors

    // Report to external service
    if (enableErrorReporting) {
      try {
        fetch('/api/errors/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...errorEntry,
            userAgent: navigator.userAgent,
            url: window.location.href,
            stack: error.stack
          })
        }).catch(reportError => {
          console.warn('Failed to report error:', reportError)
        })
      } catch (reportingError) {
        console.warn('Error reporting failed:', reportingError)
      }
    }
  }, [enableErrorReporting])

  const clearErrors = useCallback(() => {
    setErrorHistory([])
  }, [])

  const getErrorHistory = useCallback(() => {
    return errorHistory
  }, [errorHistory])

  const contextValue: ErrorContextType = {
    reportError,
    clearErrors,
    getErrorHistory
  }

  return (
    <ErrorContext.Provider value={contextValue}>
      <ComprehensiveErrorBoundary
        level="page"
        enableErrorReporting={enableErrorReporting}
        enableErrorRecovery={enableErrorRecovery}
        maxRetries={maxRetries}
        onError={(error, errorInfo, errorId) => reportError(error, `ErrorBoundary: ${errorId}`)}
        className={className}
        fallback={GlobalErrorFallback}
      >
        {children}
      </ComprehensiveErrorBoundary>
    </ErrorContext.Provider>
  )
}

/**
 * Global error fallback component
 */
function GlobalErrorFallback({
  error,
  errorInfo,
  errorId,
  retryCount,
  onRetry,
  onReport,
  canRetry
}: {
  error: Error
  errorInfo: React.ErrorInfo
  errorId: string
  retryCount: number
  onRetry: () => void
  onReport: () => void
  canRetry: boolean
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-3xl">Application Error</CardTitle>
          <p className="text-muted-foreground text-lg">
            Something went wrong. Our team has been automatically notified.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error Details */}
          <div className="rounded-lg bg-muted p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-sm">
                Error ID: {errorId}
              </Badge>
              <Badge variant="secondary" className="text-sm">
                Retry {retryCount}/3
              </Badge>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Error Message:</h4>
              <p className="text-sm text-muted-foreground font-mono bg-background p-2 rounded border">
                {error.message}
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Component Stack:</h4>
                <pre className="text-xs text-muted-foreground bg-background p-2 rounded border overflow-auto max-h-32">
                  {errorInfo.componentStack}
                </pre>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {canRetry && (
              <Button onClick={onRetry} className="flex-1" size="lg">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
            <Button variant="outline" onClick={onReport} className="flex-1" size="lg">
              <Bug className="mr-2 h-4 w-4" />
              Report Issue
            </Button>
          </div>

          {/* Navigation */}
          <div className="text-center space-y-2">
            <Button variant="ghost" asChild>
              <a href="/" className="inline-flex items-center">
                <Home className="mr-2 h-4 w-4" />
                Return to Home
              </a>
            </Button>
            <p className="text-xs text-muted-foreground">
              If this problem persists, please contact support with the error ID above.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Hook to use error context
 */
export function useErrorBoundary() {
  const context = useContext(ErrorContext)
  if (!context) {
    throw new Error('useErrorBoundary must be used within an ErrorBoundaryProvider')
  }
  return context
}

/**
 * Hook for manual error reporting
 */
export function useErrorReporting() {
  const { reportError } = useErrorBoundary()

  const reportClientError = useCallback((error: Error, context?: string) => {
    reportError(error, context)
  }, [reportError])

  const reportAsyncError = useCallback(async (
    asyncFn: () => Promise<unknown>,
    context?: string
  ) => {
    try {
      return await asyncFn()
    } catch (error) {
      if (error instanceof Error) {
        reportError(error, context)
      } else {
        reportError(new Error(String(error)), context)
      }
      throw error
    }
  }, [reportError])

  return {
    reportClientError,
    reportAsyncError
  }
}

export default ErrorBoundaryProvider
