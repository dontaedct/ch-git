'use client';

import { SystemError, ErrorSeverity } from '@/lib/errors/types';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  const isDev = process.env.NODE_ENV === 'development';
  
  // Convert the error to AppError for better handling
  const appError = new SystemError(
    error?.message || 'Application crashed',
    {
      digest: error?.digest,
      stack: error?.stack,
      source: 'next-global-error-boundary',
      severity: ErrorSeverity.CRITICAL
    }
  );

  return (
    <html>
      <body style={{
        padding: 24,
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: '#fafafa',
        color: '#1a1a1a',
        lineHeight: 1.6
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e5e5'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#fee2e2',
              borderRadius: '50%',
              margin: '0 auto 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              ⚠️
            </div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#dc2626',
              margin: 0
            }}>
              Application Error
            </h1>
          </div>

          {/* Error Message */}
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <p style={{ margin: '0 0 0.5rem', fontWeight: '500', color: '#991b1b' }}>
              {error?.message || 'An unexpected error occurred'}
            </p>
            <p style={{ margin: 0, fontSize: '14px', color: '#7f1d1d' }}>
              Error ID: {appError.correlationId}
            </p>
          </div>

          {/* Stack Trace (Development Only) */}
          {isDev && error?.stack && (
            <details style={{ marginBottom: '1.5rem' }}>
              <summary style={{
                cursor: 'pointer',
                color: '#6b7280',
                fontSize: '14px',
                padding: '0.5rem',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '6px'
              }}>
                Stack trace (development only)
              </summary>
              <pre style={{
                whiteSpace: 'pre-wrap',
                fontSize: '12px',
                backgroundColor: '#1f2937',
                color: '#f9fafb',
                padding: '1rem',
                borderRadius: '6px',
                marginTop: '0.5rem',
                overflow: 'auto',
                maxHeight: '300px'
              }}>
                {error.stack}
              </pre>
            </details>
          )}

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button 
              onClick={() => reset()} 
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'}
              onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6'}
            >
              🔄 Try again
            </button>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#4b5563'}
              onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#6b7280'}
            >
              🔄 Hard reload
            </button>
          </div>

          {/* Help Text */}
          <div style={{
            textAlign: 'center',
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: '#475569'
            }}>
              If this problem persists, please contact support with Error ID: <strong>{appError.correlationId.substring(0, 8)}</strong>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}

