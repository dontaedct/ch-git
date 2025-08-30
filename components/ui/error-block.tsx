import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink, 
  Bug, 
  Wifi, 
  Server, 
  Shield,
  Clock,
  Database,
  FileX
} from 'lucide-react'
import Link from 'next/link'

export type ErrorType = 
  | 'network' 
  | 'server' 
  | 'auth' 
  | 'timeout' 
  | 'not-found' 
  | 'permission' 
  | 'validation' 
  | 'database'
  | 'generic'

interface ErrorBlockProps {
  type?: ErrorType
  title?: string
  message?: string
  error?: Error | string
  showRetry?: boolean
  showSupport?: boolean
  retryLabel?: string
  supportLabel?: string
  supportUrl?: string
  onRetry?: () => void
  className?: string
}

const ERROR_CONFIG: Record<ErrorType, {
  icon: React.ReactNode
  defaultTitle: string
  defaultMessage: string
  variant: 'default' | 'destructive'
}> = {
  network: {
    icon: <Wifi className="h-4 w-4" />,
    defaultTitle: "Connection Error",
    defaultMessage: "Unable to connect to the server. Please check your internet connection and try again.",
    variant: 'destructive'
  },
  server: {
    icon: <Server className="h-4 w-4" />,
    defaultTitle: "Server Error",
    defaultMessage: "Something went wrong on our end. Our team has been notified and is working on a fix.",
    variant: 'destructive'
  },
  auth: {
    icon: <Shield className="h-4 w-4" />,
    defaultTitle: "Authentication Error",
    defaultMessage: "Your session has expired. Please log in again to continue.",
    variant: 'destructive'
  },
  timeout: {
    icon: <Clock className="h-4 w-4" />,
    defaultTitle: "Request Timeout",
    defaultMessage: "The request took too long to complete. Please try again.",
    variant: 'destructive'
  },
  'not-found': {
    icon: <FileX className="h-4 w-4" />,
    defaultTitle: "Not Found",
    defaultMessage: "The requested resource could not be found.",
    variant: 'default'
  },
  permission: {
    icon: <Shield className="h-4 w-4" />,
    defaultTitle: "Access Denied",
    defaultMessage: "You don't have permission to access this resource.",
    variant: 'destructive'
  },
  validation: {
    icon: <AlertTriangle className="h-4 w-4" />,
    defaultTitle: "Validation Error",
    defaultMessage: "Please check your input and try again.",
    variant: 'default'
  },
  database: {
    icon: <Database className="h-4 w-4" />,
    defaultTitle: "Database Error",
    defaultMessage: "There was a problem accessing the data. Please try again later.",
    variant: 'destructive'
  },
  generic: {
    icon: <Bug className="h-4 w-4" />,
    defaultTitle: "Something went wrong",
    defaultMessage: "An unexpected error occurred. Please try again or contact support if the problem persists.",
    variant: 'destructive'
  }
}

export function ErrorBlock({
  type = 'generic',
  title,
  message,
  error,
  showRetry = true,
  showSupport = true,
  retryLabel = "Try Again",
  supportLabel = "Contact Support",
  supportUrl = "/support",
  onRetry,
  className = ''
}: ErrorBlockProps) {
  const config = ERROR_CONFIG[type]
  const displayTitle = title ?? config.defaultTitle
  const displayMessage = message ?? config.defaultMessage
  
  // If error is provided and no custom message, try to extract meaningful info
  const errorMessage = error 
    ? (typeof error === 'string' ? error : error.message)
    : displayMessage

  return (
    <Alert variant={config.variant} className={`max-w-md mx-auto ${className}`}>
      {config.icon}
      <div className="space-y-3">
        <div>
          <h3 className="font-medium text-sm mb-1">{displayTitle}</h3>
          <AlertDescription className="text-sm">
            {errorMessage}
          </AlertDescription>
        </div>
        
        {(showRetry || showSupport) && (
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            {showRetry && onRetry && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRetry}
                className="h-8 text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                {retryLabel}
              </Button>
            )}
            
            {showSupport && (
              <Link href={supportUrl} target="_blank" rel="noopener noreferrer">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 text-xs"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  {supportLabel}
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </Alert>
  )
}

// Specialized error blocks for common scenarios
export function NetworkErrorBlock({ onRetry, ...props }: Omit<ErrorBlockProps, 'type'>) {
  return (
    <ErrorBlock 
      type="network" 
      onRetry={onRetry}
      {...props} 
    />
  )
}

export function ServerErrorBlock({ onRetry, ...props }: Omit<ErrorBlockProps, 'type'>) {
  return (
    <ErrorBlock 
      type="server" 
      onRetry={onRetry}
      showRetry={false}
      {...props} 
    />
  )
}

export function AuthErrorBlock({ ...props }: Omit<ErrorBlockProps, 'type'>) {
  return (
    <ErrorBlock 
      type="auth" 
      showRetry={false}
      supportLabel="Sign In"
      supportUrl="/login"
      {...props} 
    />
  )
}

export function NotFoundErrorBlock({ ...props }: Omit<ErrorBlockProps, 'type'>) {
  return (
    <ErrorBlock 
      type="not-found" 
      showRetry={false}
      supportLabel="Go Home"
      supportUrl="/"
      {...props} 
    />
  )
}

export function ValidationErrorBlock({ onRetry, ...props }: Omit<ErrorBlockProps, 'type'>) {
  return (
    <ErrorBlock 
      type="validation" 
      onRetry={onRetry}
      showSupport={false}
      retryLabel="Fix and Try Again"
      {...props} 
    />
  )
}

// Inline error for form fields and small contexts
export function InlineError({ 
  message, 
  className = '' 
}: { 
  message: string
  className?: string 
}) {
  return (
    <div className={`flex items-center gap-1 text-destructive text-xs mt-1 ${className}`}>
      <AlertTriangle className="h-3 w-3 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

// Error boundary fallback component
export function ErrorBoundaryFallback({ 
  error, 
  onRetry 
}: { 
  error: Error
  onRetry?: () => void 
}) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <ErrorBlock
        type="generic"
        title="Application Error"
        message="Something unexpected happened. The error has been logged and our team notified."
        error={error}
        onRetry={onRetry}
        showSupport={true}
        supportUrl="/support?error=boundary"
        className="max-w-lg"
      />
    </div>
  )
}

// Loading error for async operations
export function LoadingErrorBlock({ 
  onRetry, 
  isRetrying = false,
  ...props 
}: Omit<ErrorBlockProps, 'type'> & { 
  isRetrying?: boolean 
}) {
  return (
    <ErrorBlock 
      type="generic"
      title="Failed to Load"
      message="Unable to load the requested data. Please try again."
      onRetry={onRetry}
      retryLabel={isRetrying ? "Retrying..." : "Retry"}
      {...props} 
    />
  )
}