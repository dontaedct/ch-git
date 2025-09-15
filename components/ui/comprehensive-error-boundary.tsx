/**
 * @fileoverview Comprehensive Error Boundary System
 * @module components/ui/comprehensive-error-boundary
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Comprehensive Error Boundary System
 * Purpose: Production-grade error boundary with comprehensive error handling
 * Safety: Comprehensive error tracking, reporting, and recovery mechanisms
 */

'use client'

import React, { Component, ReactNode, ErrorInfo } from 'react'
import { ErrorNotification } from './error-notification'
import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { AlertTriangle, RefreshCw, Bug, Shield, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import { handleError } from '@/lib/types/type-safe-utils'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string
  retryCount: number
  lastErrorTime: number
  errorHistory: ErrorEntry[]
}

interface ErrorEntry {
  id: string
  error: Error
  errorInfo: ErrorInfo
  timestamp: number
  componentStack: string
  retryCount: number
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void
  onRetry?: (errorId: string) => void
  maxRetries?: number
  retryDelay?: number
  enableErrorReporting?: boolean
  enableErrorRecovery?: boolean
  className?: string
  level?: 'page' | 'component' | 'feature'
}

interface ErrorFallbackProps {
  error: Error
  errorInfo: ErrorInfo
  errorId: string
  retryCount: number
  onRetry: () => void
  onReport: () => void
  canRetry: boolean
  level: 'page' | 'component' | 'feature'
}

/**
 * Comprehensive Error Boundary with advanced error handling
 */
export class ComprehensiveErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null
  private errorReportingEnabled: boolean = true

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
      lastErrorTime: 0,
      errorHistory: []
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    return {
      hasError: true,
      error,
      errorId,
      lastErrorTime: Date.now()
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { errorId, retryCount } = this.state
    const errorEntry: ErrorEntry = {
      id: errorId,
      error,
      errorInfo,
      timestamp: Date.now(),
      componentStack: errorInfo.componentStack || '',
      retryCount
    }

    // Add to error history
    this.setState(prevState => ({
      errorInfo,
      errorHistory: [...prevState.errorHistory, errorEntry].slice(-10) // Keep last 10 errors
    }))

    // Report error
    this.reportError(error, errorInfo, errorId)

    // Call custom error handler
    this.props.onError?.(error, errorInfo, errorId)

    // Log error details
    console.error('ComprehensiveErrorBoundary caught an error:', {
      error,
      errorInfo,
      errorId,
      retryCount,
      timestamp: new Date().toISOString()
    })
  }

  private reportError = (error: Error, errorInfo: ErrorInfo, errorId: string): void => {
    if (!this.props.enableErrorReporting) return

    try {
      // Send error to monitoring service
      const errorReport = {
        errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        level: this.props.level || 'component',
        retryCount: this.state.retryCount
      }

      // In a real application, send to Sentry, LogRocket, or similar
      if (typeof window !== 'undefined' && 'fetch' in window) {
        fetch('/api/errors/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorReport)
        }).catch(reportError => {
          console.warn('Failed to report error:', reportError)
        })
      }
    } catch (reportingError) {
      console.warn('Error reporting failed:', reportingError)
    }
  }

  private handleRetry = (): void => {
    const { maxRetries = 3, retryDelay = 1000 } = this.props
    const { retryCount } = this.state

    if (retryCount >= maxRetries) {
      console.warn('Maximum retry attempts reached')
      return
    }

    // Clear any existing timeout
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }

    // Increment retry count
    this.setState(prevState => ({
      retryCount: prevState.retryCount + 1
    }))

    // Call custom retry handler
    this.props.onRetry?.(this.state.errorId)

    // Reset error state after delay
    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: ''
      })
    }, retryDelay)
  }

  private handleReport = (): void => {
    const { error, errorInfo, errorId } = this.state
    if (error && errorInfo) {
      this.reportError(error, errorInfo, errorId)
    }
  }

  componentWillUnmount(): void {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      const { maxRetries = 3 } = this.props
      const canRetry = this.state.retryCount < maxRetries

      return (
        <FallbackComponent
          error={this.state.error!}
          errorInfo={this.state.errorInfo!}
          errorId={this.state.errorId}
          retryCount={this.state.retryCount}
          onRetry={this.handleRetry}
          onReport={this.handleReport}
          canRetry={canRetry}
          level={this.props.level || 'component'}
        />
      )
    }

    return this.props.children
  }
}

/**
 * Default error fallback component
 */
function DefaultErrorFallback({
  error,
  errorInfo,
  errorId,
  retryCount,
  onRetry,
  onReport,
  canRetry,
  level
}: ErrorFallbackProps) {
  const errorDetails = handleError(error)
  const isPageLevel = level === 'page'
  const isComponentLevel = level === 'component'

  if (isPageLevel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Application Error</CardTitle>
            <p className="text-muted-foreground">
              Something went wrong. Our team has been notified.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline">Error ID</Badge>
                <code className="text-sm font-mono">{errorId}</code>
              </div>
              <p className="text-sm text-muted-foreground">
                {errorDetails.message}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              {canRetry && (
                <Button onClick={onRetry} className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again ({retryCount}/3)
                </Button>
              )}
              <Button variant="outline" onClick={onReport} className="flex-1">
                <Bug className="mr-2 h-4 w-4" />
                Report Issue
              </Button>
            </div>

            <div className="text-center">
              <Button variant="ghost" asChild>
                <a href="/">Return to Home</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isComponentLevel) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-destructive">
                Component Error
              </h3>
              <Badge variant="outline" className="text-xs">
                {errorId.slice(-8)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {errorDetails.message}
            </p>
            <div className="flex space-x-2">
              {canRetry && (
                <Button size="sm" onClick={onRetry}>
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Retry
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={onReport}>
                <Bug className="mr-1 h-3 w-3" />
                Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Feature level fallback
  return (
    <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950">
      <div className="flex items-start space-x-3">
        <Shield className="h-5 w-5 text-orange-600 mt-0.5" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200">
              Feature Error
            </h3>
            <Badge variant="outline" className="text-xs">
              {errorId.slice(-8)}
            </Badge>
          </div>
          <p className="text-sm text-orange-700 dark:text-orange-300">
            This feature encountered an error. You can continue using other parts of the application.
          </p>
          <div className="flex space-x-2">
            {canRetry && (
              <Button size="sm" variant="outline" onClick={onRetry}>
                <RefreshCw className="mr-1 h-3 w-3" />
                Retry
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={onReport}>
              <Activity className="mr-1 h-3 w-3" />
              Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Hook for error boundary context
 */
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { captureError, resetError }
}

/**
 * Higher-order component for error boundaries
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ComprehensiveErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ComprehensiveErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}

export default ComprehensiveErrorBoundary
