/**
 * Error Boundary and Fallback Components
 *
 * Comprehensive error handling system for the preview and renderer components.
 * Provides graceful error recovery and detailed error reporting.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
  isolate?: boolean;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  resetError: () => void;
  errorId: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;

    // Update state with error info
    this.setState({
      errorInfo
    });

    // Call error handler
    onError?.(error, errorInfo);

    // Log error for development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.groupEnd();
    }

    // Report to error tracking service
    this.reportError(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys?.length) {
        const hasResetKeyChanged = resetKeys.some(
          (key, idx) => prevProps.resetKeys?.[idx] !== key
        );

        if (hasResetKeyChanged) {
          this.resetError();
        }
      }
    }

    if (hasError && resetOnPropsChange) {
      this.resetError();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  reportError(error: Error, errorInfo: ErrorInfo) {
    // Report to analytics service
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('Error Boundary Triggered', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId
      });
    }

    // Report to error monitoring service (e.g., Sentry)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.withScope((scope: any) => {
        scope.setTag('errorBoundary', true);
        scope.setContext('errorInfo', errorInfo);
        (window as any).Sentry.captureException(error);
      });
    }
  }

  render() {
    const { hasError, error, errorInfo, errorId } = this.state;
    const { children, fallback: FallbackComponent, isolate } = this.props;

    if (hasError) {
      const fallbackProps: ErrorFallbackProps = {
        error,
        errorInfo,
        resetError: this.resetError,
        errorId
      };

      if (FallbackComponent) {
        return <FallbackComponent {...fallbackProps} />;
      }

      return <DefaultErrorFallback {...fallbackProps} />;
    }

    // Wrap children in isolation container if needed
    if (isolate) {
      return (
        <div className="error-boundary-isolate" style={{ isolation: 'isolate' }}>
          {children}
        </div>
      );
    }

    return children;
  }
}

// Default error fallback component
export const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  resetError,
  errorId
}) => {
  const [showDetails, setShowDetails] = React.useState(false);
  const [reportSent, setReportSent] = React.useState(false);

  const handleSendReport = async () => {
    try {
      const report = {
        errorId,
        error: {
          message: error?.message,
          stack: error?.stack,
          name: error?.name
        },
        errorInfo: {
          componentStack: errorInfo?.componentStack
        },
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        url: window.location.href
      };

      // Send error report to API
      await fetch('/api/error-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      });

      setReportSent(true);
    } catch (reportError) {
      console.error('Failed to send error report:', reportError);
    }
  };

  return (
    <div className="error-fallback-container">
      <div className="error-fallback-content">
        {/* Error icon */}
        <div className="error-icon">
          <svg
            className="w-16 h-16 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>

        {/* Error message */}
        <div className="error-message">
          <h2 className="error-title">Something went wrong</h2>
          <p className="error-description">
            An unexpected error occurred while rendering this component.
            {process.env.NODE_ENV === 'development' && error && (
              <span className="error-name"> ({error.name})</span>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="error-actions">
          <button
            onClick={resetError}
            className="btn-primary"
            type="button"
          >
            Try Again
          </button>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="btn-secondary"
            type="button"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>

          {!reportSent && (
            <button
              onClick={handleSendReport}
              className="btn-outline"
              type="button"
            >
              Report Issue
            </button>
          )}

          {reportSent && (
            <span className="text-green-600 text-sm">
              ✓ Report sent
            </span>
          )}
        </div>

        {/* Error details */}
        {showDetails && (
          <div className="error-details">
            <h3 className="details-title">Error Details</h3>

            <div className="detail-section">
              <h4>Error ID</h4>
              <code className="error-id">{errorId}</code>
            </div>

            {error && (
              <div className="detail-section">
                <h4>Error Message</h4>
                <pre className="error-text">{error.message}</pre>
              </div>
            )}

            {process.env.NODE_ENV === 'development' && error?.stack && (
              <div className="detail-section">
                <h4>Stack Trace</h4>
                <pre className="error-stack">{error.stack}</pre>
              </div>
            )}

            {process.env.NODE_ENV === 'development' && errorInfo?.componentStack && (
              <div className="detail-section">
                <h4>Component Stack</h4>
                <pre className="component-stack">{errorInfo.componentStack}</pre>
              </div>
            )}
          </div>
        )}

        {/* Help text */}
        <div className="error-help">
          <p className="help-text">
            If this problem persists, please try refreshing the page or contact support.
          </p>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .error-fallback-container {
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 0.5rem;
          margin: 1rem;
        }

        .error-fallback-content {
          max-width: 600px;
          text-align: center;
        }

        .error-icon {
          margin-bottom: 1.5rem;
        }

        .error-message {
          margin-bottom: 2rem;
        }

        .error-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #dc2626;
          margin-bottom: 0.5rem;
        }

        .error-description {
          color: #7f1d1d;
          line-height: 1.5;
        }

        .error-name {
          font-family: monospace;
          font-size: 0.875rem;
          background: rgba(239, 68, 68, 0.1);
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
        }

        .error-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }

        .btn-primary {
          background: #dc2626;
          color: white;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.375rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .btn-primary:hover {
          background: #b91c1c;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          padding: 0.75rem 1.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        .btn-outline {
          background: transparent;
          color: #dc2626;
          padding: 0.75rem 1.5rem;
          border: 1px solid #dc2626;
          border-radius: 0.375rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-outline:hover {
          background: #dc2626;
          color: white;
        }

        .error-details {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 1.5rem;
          text-align: left;
          margin-bottom: 1.5rem;
        }

        .details-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 1rem;
        }

        .detail-section {
          margin-bottom: 1rem;
        }

        .detail-section h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .error-id {
          background: #f3f4f6;
          color: #1f2937;
          padding: 0.5rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.875rem;
          display: block;
          word-break: break-all;
        }

        .error-text,
        .error-stack,
        .component-stack {
          background: #1f2937;
          color: #f9fafb;
          padding: 1rem;
          border-radius: 0.375rem;
          font-family: monospace;
          font-size: 0.75rem;
          line-height: 1.5;
          overflow-x: auto;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .error-help {
          border-top: 1px solid #e5e7eb;
          padding-top: 1rem;
        }

        .help-text {
          color: #6b7280;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .error-fallback-container {
            background: #1f2937;
            border-color: #374151;
          }

          .error-title {
            color: #f87171;
          }

          .error-description {
            color: #d1d5db;
          }

          .error-details {
            background: #111827;
            border-color: #374151;
          }

          .details-title {
            color: #f9fafb;
          }

          .detail-section h4 {
            color: #d1d5db;
          }

          .help-text {
            color: #9ca3af;
          }
        }

        /* Mobile responsiveness */
        @media (max-width: 640px) {
          .error-fallback-container {
            padding: 1rem;
            margin: 0.5rem;
          }

          .error-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .btn-primary,
          .btn-secondary,
          .btn-outline {
            width: 100%;
          }

          .error-details {
            padding: 1rem;
          }

          .error-text,
          .error-stack,
          .component-stack {
            font-size: 0.625rem;
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

// Specialized error boundaries for different contexts

export const ComponentErrorBoundary: React.FC<{
  children: ReactNode;
  componentName?: string;
  onError?: (error: Error) => void;
}> = ({ children, componentName, onError }) => (
  <ErrorBoundary
    onError={onError}
    fallback={({ error, resetError, errorId }) => (
      <div className="component-error-boundary">
        <div className="error-content">
          <h3>Component Error</h3>
          <p>Failed to render {componentName || 'component'}</p>
          <button onClick={resetError} className="retry-button">
            Retry
          </button>
        </div>
        <style jsx>{`
          .component-error-boundary {
            background: #fef2f2;
            border: 1px dashed #fca5a5;
            border-radius: 0.375rem;
            padding: 1rem;
            text-align: center;
            color: #dc2626;
          }
          .error-content h3 {
            margin: 0 0 0.5rem 0;
            font-size: 1rem;
            font-weight: 600;
          }
          .error-content p {
            margin: 0 0 1rem 0;
            font-size: 0.875rem;
          }
          .retry-button {
            background: #dc2626;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 0.25rem;
            cursor: pointer;
            font-size: 0.875rem;
          }
          .retry-button:hover {
            background: #b91c1c;
          }
        `}</style>
      </div>
    )}
    isolate
  >
    {children}
  </ErrorBoundary>
);

export const PreviewErrorBoundary: React.FC<{
  children: ReactNode;
  onError?: (error: Error) => void;
}> = ({ children, onError }) => (
  <ErrorBoundary
    onError={onError}
    fallback={({ error, resetError }) => (
      <div className="preview-error-boundary">
        <div className="error-icon">⚠️</div>
        <h3>Preview Error</h3>
        <p>Unable to render preview</p>
        <div className="error-actions">
          <button onClick={resetError} className="retry-button">
            Retry Preview
          </button>
        </div>
        <style jsx>{`
          .preview-error-boundary {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 300px;
            background: #f9fafb;
            border: 2px dashed #d1d5db;
            border-radius: 0.5rem;
            color: #6b7280;
            text-align: center;
            padding: 2rem;
          }
          .error-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
          }
          .preview-error-boundary h3 {
            margin: 0 0 0.5rem 0;
            color: #374151;
            font-size: 1.125rem;
          }
          .preview-error-boundary p {
            margin: 0 0 1.5rem 0;
            font-size: 0.875rem;
          }
          .retry-button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.375rem;
            cursor: pointer;
            font-weight: 500;
          }
          .retry-button:hover {
            background: #2563eb;
          }
        `}</style>
      </div>
    )}
  >
    {children}
  </ErrorBoundary>
);

export default ErrorBoundary;