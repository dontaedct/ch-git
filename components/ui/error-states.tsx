/**
 * @fileoverview HT-008.5.4: Comprehensive Error States and User Guidance System
 * @module components/ui/error-states
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.5.4 - Implement proper error states and user guidance
 * Focus: Vercel/Apply-level error handling with comprehensive user guidance
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (user experience and error recovery)
 */

'use client'

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  ExternalLink, 
  HelpCircle, 
  Info, 
  CheckCircle2,
  Wifi,
  Server,
  Shield,
  Clock,
  FileX,
  Database,
  Bug,
  Lightbulb,
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

// HT-008.5.4: Enhanced Error States System
// Comprehensive error handling with Vercel/Apply-level user guidance

/**
 * Error Severity Levels
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Error Categories
 */
export type ErrorCategory = 
  | 'network' 
  | 'server' 
  | 'auth' 
  | 'validation' 
  | 'permission' 
  | 'timeout' 
  | 'not-found' 
  | 'database' 
  | 'client' 
  | 'generic';

/**
 * Error Context Types
 */
export type ErrorContext = 'form' | 'page' | 'modal' | 'toast' | 'inline' | 'banner';

/**
 * Error Configuration Interface
 */
interface ErrorConfig {
  icon: React.ReactNode;
  title: string;
  message: string;
  severity: ErrorSeverity;
  variant: 'default' | 'destructive' | 'warning' | 'info';
  actions: {
    retry?: boolean;
    support?: boolean;
    dismiss?: boolean;
    help?: boolean;
  };
  guidance?: {
    title: string;
    steps: string[];
    resources?: Array<{
      title: string;
      url: string;
      description?: string;
    }>;
  };
}

/**
 * Error Configuration Map
 */
const ERROR_CONFIGS: Record<ErrorCategory, ErrorConfig> = {
  network: {
    icon: <Wifi className="w-5 h-5" />,
    title: "Connection Problem",
    message: "We're having trouble connecting to our servers. This might be a temporary issue.",
    severity: 'medium',
    variant: 'warning',
    actions: { retry: true, support: true },
    guidance: {
      title: "How to fix connection issues",
      steps: [
        "Check your internet connection",
        "Try refreshing the page",
        "Disable VPN or proxy if you're using one",
        "Clear your browser cache and cookies"
      ],
      resources: [
        {
          title: "Network Troubleshooting Guide",
          url: "/help/network-issues",
          description: "Detailed steps to resolve connection problems"
        }
      ]
    }
  },
  server: {
    icon: <Server className="w-5 h-5" />,
    title: "Server Error",
    message: "Something went wrong on our end. Our team has been notified and is working on a fix.",
    severity: 'high',
    variant: 'destructive',
    actions: { retry: true, support: true },
    guidance: {
      title: "What to do when our servers are down",
      steps: [
        "Wait a few minutes and try again",
        "Check our status page for updates",
        "Contact support if the issue persists",
        "Save your work frequently to avoid data loss"
      ],
      resources: [
        {
          title: "Service Status",
          url: "/status",
          description: "Real-time status of all our services"
        }
      ]
    }
  },
  auth: {
    icon: <Shield className="w-5 h-5" />,
    title: "Authentication Required",
    message: "Your session has expired or you need to log in to access this feature.",
    severity: 'medium',
    variant: 'warning',
    actions: { retry: false, support: true },
    guidance: {
      title: "How to resolve authentication issues",
      steps: [
        "Click the login button to sign in again",
        "Make sure you're using the correct email and password",
        "Check if your account has been suspended",
        "Contact support if you can't access your account"
      ],
      resources: [
        {
          title: "Account Recovery",
          url: "/help/account-recovery",
          description: "Steps to recover your account"
        }
      ]
    }
  },
  validation: {
    icon: <AlertTriangle className="w-5 h-5" />,
    title: "Invalid Input",
    message: "Please check your input and correct any errors before continuing.",
    severity: 'low',
    variant: 'default',
    actions: { retry: false, support: false },
    guidance: {
      title: "How to fix validation errors",
      steps: [
        "Review the highlighted fields for errors",
        "Make sure all required fields are filled",
        "Check that email addresses are valid",
        "Ensure passwords meet the requirements"
      ]
    }
  },
  permission: {
    icon: <Shield className="w-5 h-5" />,
    title: "Access Denied",
    message: "You don't have permission to perform this action or access this resource.",
    severity: 'medium',
    variant: 'warning',
    actions: { retry: false, support: true },
    guidance: {
      title: "How to get access",
      steps: [
        "Contact your administrator for permission",
        "Check if you're logged in with the correct account",
        "Verify your subscription includes this feature",
        "Request access through our support team"
      ],
      resources: [
        {
          title: "Request Access",
          url: "/support/access-request",
          description: "Submit a request for additional permissions"
        }
      ]
    }
  },
  timeout: {
    icon: <Clock className="w-5 h-5" />,
    title: "Request Timeout",
    message: "The request took too long to complete. This might be due to a slow connection or server load.",
    severity: 'medium',
    variant: 'warning',
    actions: { retry: true, support: true },
    guidance: {
      title: "How to resolve timeout issues",
      steps: [
        "Check your internet connection speed",
        "Try again during off-peak hours",
        "Reduce the amount of data being processed",
        "Contact support if timeouts persist"
      ]
    }
  },
  'not-found': {
    icon: <FileX className="w-5 h-5" />,
    title: "Not Found",
    message: "The requested resource could not be found. It may have been moved or deleted.",
    severity: 'low',
    variant: 'default',
    actions: { retry: false, support: true },
    guidance: {
      title: "What to do when something is missing",
      steps: [
        "Check if the URL is correct",
        "Navigate back to the main page",
        "Use the search function to find what you're looking for",
        "Contact support if you believe this is an error"
      ],
      resources: [
        {
          title: "Site Map",
          url: "/sitemap",
          description: "Browse all available pages"
        }
      ]
    }
  },
  database: {
    icon: <Database className="w-5 h-5" />,
    title: "Database Error",
    message: "We're experiencing issues with our database. Your data is safe and we're working to restore service.",
    severity: 'high',
    variant: 'destructive',
    actions: { retry: true, support: true },
    guidance: {
      title: "What happens during database issues",
      steps: [
        "Your data is automatically backed up and safe",
        "Wait for our team to resolve the issue",
        "Avoid making changes until service is restored",
        "Contact support for urgent matters"
      ],
      resources: [
        {
          title: "Data Safety Information",
          url: "/help/data-safety",
          description: "Learn about our data protection measures"
        }
      ]
    }
  },
  client: {
    icon: <Bug className="w-5 h-5" />,
    title: "Client Error",
    message: "There's an issue with your browser or device. Try refreshing the page or using a different browser.",
    severity: 'medium',
    variant: 'warning',
    actions: { retry: true, support: true },
    guidance: {
      title: "How to fix client-side issues",
      steps: [
        "Refresh the page (Ctrl+F5 or Cmd+Shift+R)",
        "Clear your browser cache and cookies",
        "Try using a different browser",
        "Disable browser extensions temporarily"
      ],
      resources: [
        {
          title: "Browser Compatibility",
          url: "/help/browser-support",
          description: "Supported browsers and troubleshooting"
        }
      ]
    }
  },
  generic: {
    icon: <XCircle className="w-5 h-5" />,
    title: "Something went wrong",
    message: "An unexpected error occurred. Please try again or contact support if the problem persists.",
    severity: 'medium',
    variant: 'destructive',
    actions: { retry: true, support: true },
    guidance: {
      title: "General troubleshooting steps",
      steps: [
        "Try refreshing the page",
        "Check your internet connection",
        "Clear your browser cache",
        "Contact support with details about what you were doing"
      ]
    }
  }
};

/**
 * Error State Component Variants
 */
const errorStateVariants = cva(
  "flex flex-col items-center justify-center gap-4 p-6 text-center rounded-lg border",
  {
    variants: {
      variant: {
        default: "bg-background border-border",
        destructive: "bg-destructive/5 border-destructive/20",
        warning: "bg-warning/5 border-warning/20",
        info: "bg-info/5 border-info/20",
      },
      size: {
        sm: "min-h-[120px] p-4",
        md: "min-h-[200px] p-6",
        lg: "min-h-[300px] p-8",
        xl: "min-h-[400px] p-12",
      },
      layout: {
        vertical: "flex-col",
        horizontal: "flex-row text-left",
        centered: "flex-col items-center justify-center",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      layout: "vertical",
    },
  }
);

/**
 * Error State Props Interface
 */
interface ErrorStateProps extends VariantProps<typeof errorStateVariants> {
  category: ErrorCategory;
  title?: string;
  message?: string;
  error?: Error | string;
  showActions?: boolean;
  showGuidance?: boolean;
  showCorrelationId?: boolean;
  correlationId?: string;
  onRetry?: () => void;
  onSupport?: () => void;
  onDismiss?: () => void;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Enhanced Error State Component
 */
export function ErrorState({
  category,
  title,
  message,
  error,
  showActions = true,
  showGuidance = false,
  showCorrelationId = false,
  correlationId,
  onRetry,
  onSupport,
  onDismiss,
  variant,
  size,
  layout,
  className,
  children,
}: ErrorStateProps) {
  const config = ERROR_CONFIGS[category];
  const displayTitle = title || config.title;
  const displayMessage = message || config.message;
  
  // Determine variant based on error severity if not explicitly set
  const errorVariant = variant || config.variant;
  
  // Get error details
  const errorDetails = error 
    ? (typeof error === 'string' ? error : error.message)
    : displayMessage;

  return (
    <div className={cn(errorStateVariants({ variant: errorVariant, size, layout }), className)}>
      {/* Error Icon */}
      <div className={cn(
        "flex items-center justify-center w-12 h-12 rounded-full",
        errorVariant === 'destructive' && "bg-destructive/10 text-destructive",
        errorVariant === 'warning' && "bg-warning/10 text-warning",
        errorVariant === 'info' && "bg-info/10 text-info",
        errorVariant === 'default' && "bg-muted text-muted-foreground"
      )}>
        {config.icon}
      </div>

      {/* Error Content */}
      <div className="space-y-3 max-w-md">
        <h3 className="text-lg font-semibold text-foreground">
          {displayTitle}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {errorDetails}
        </p>
        
        {/* Correlation ID */}
        {showCorrelationId && correlationId && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Error ID: {correlationId}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => navigator.clipboard?.writeText(correlationId)}
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex flex-col sm:flex-row gap-3">
          {config.actions.retry && onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          )}
          
          {config.actions.support && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSupport}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Get Help
            </Button>
          )}
          
          {config.actions.dismiss && onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
            >
              Dismiss
            </Button>
          )}
        </div>
      )}

      {/* Guidance Section */}
      {showGuidance && config.guidance && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg text-left max-w-lg w-full">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-warning" />
            <h4 className="font-medium text-sm">{config.guidance.title}</h4>
          </div>
          
          <ol className="space-y-2 text-sm text-muted-foreground">
            {config.guidance.steps.map((step, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          
          {/* Resources */}
          {config.guidance.resources && config.guidance.resources.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <h5 className="font-medium text-sm mb-2">Helpful Resources</h5>
              <div className="space-y-2">
                {config.guidance.resources.map((resource, index) => (
                  <Link
                    key={index}
                    href={resource.url}
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <ArrowRight className="w-3 h-3" />
                    <span>{resource.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {children}
    </div>
  );
}

/**
 * Inline Error Component
 * For form fields and small error states
 */
interface InlineErrorProps {
  message: string;
  variant?: 'default' | 'destructive' | 'warning';
  showIcon?: boolean;
  className?: string;
}

export function InlineError({
  message,
  variant = 'destructive',
  showIcon = true,
  className,
}: InlineErrorProps) {
  const iconMap = {
    default: <Info className="w-4 h-4" />,
    destructive: <XCircle className="w-4 h-4" />,
    warning: <AlertTriangle className="w-4 h-4" />,
  };

  const colorMap = {
    default: "text-muted-foreground",
    destructive: "text-destructive",
    warning: "text-warning",
  };

  return (
    <div className={cn("flex items-center gap-2 text-sm", colorMap[variant], className)}>
      {showIcon && iconMap[variant]}
      <span>{message}</span>
    </div>
  );
}

/**
 * Error Boundary Fallback Component
 */
interface ErrorBoundaryFallbackProps {
  error: Error;
  resetError: () => void;
  showDetails?: boolean;
}

export function ErrorBoundaryFallback({
  error,
  resetError,
  showDetails = false,
}: ErrorBoundaryFallbackProps) {
  return (
    <ErrorState
      category="client"
      title="Application Error"
      message="Something went wrong with the application. This error has been reported to our team."
      error={error}
      showActions={true}
      showGuidance={true}
      showCorrelationId={showDetails}
      correlationId={showDetails ? `error-${Date.now()}` : undefined}
      onRetry={resetError}
      onSupport={() => window.open('/support', '_blank')}
      size="lg"
    />
  );
}

/**
 * Form Error Summary Component
 */
interface FormErrorSummaryProps {
  errors: Record<string, string>;
  title?: string;
  className?: string;
}

export function FormErrorSummary({
  errors,
  title = "Please fix the following errors",
  className,
}: FormErrorSummaryProps) {
  const errorEntries = Object.entries(errors);
  
  if (errorEntries.length === 0) return null;

  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <div className="space-y-2">
        <AlertDescription className="font-medium">
          {title}
        </AlertDescription>
        <ul className="space-y-1 text-sm">
          {errorEntries.map(([field, message]) => (
            <li key={field} className="flex items-start gap-2">
              <span className="text-destructive">•</span>
              <span>{message}</span>
            </li>
          ))}
        </ul>
      </div>
    </Alert>
  );
}

/**
 * Success State Component
 * For successful operations
 */
interface SuccessStateProps {
  title: string;
  message?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export function SuccessState({
  title,
  message,
  showIcon = true,
  size = 'md',
  className,
  children,
}: SuccessStateProps) {
  const sizeClasses = {
    sm: "min-h-[120px] p-4",
    md: "min-h-[200px] p-6",
    lg: "min-h-[300px] p-8",
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center gap-4 text-center rounded-lg border bg-success/5 border-success/20",
      sizeClasses[size],
      className
    )}>
      {showIcon && (
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-success/10 text-success">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      )}
      
      <div className="space-y-2 max-w-md">
        <h3 className="text-lg font-semibold text-foreground">
          {title}
        </h3>
        {message && (
          <p className="text-sm text-muted-foreground">
            {message}
          </p>
        )}
      </div>
      
      {children}
    </div>
  );
}

/**
 * Error Toast Component
 * For temporary error notifications
 */
interface ErrorToastProps {
  category: ErrorCategory;
  message?: string;
  duration?: number;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorToast({
  category,
  message,
  duration = 5000,
  onDismiss,
  className,
}: ErrorToastProps) {
  const config = ERROR_CONFIGS[category];
  const displayMessage = message || config.message;

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onDismiss?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-md",
      config.variant === 'destructive' && "bg-destructive/5 border-destructive/20",
      config.variant === 'warning' && "bg-warning/5 border-warning/20",
      config.variant === 'info' && "bg-info/5 border-info/20",
      config.variant === 'default' && "bg-background border-border",
      className
    )}>
      <div className="flex-shrink-0">
        {config.icon}
      </div>
      
      <div className="flex-1 space-y-1">
        <h4 className="font-medium text-sm">{config.title}</h4>
        <p className="text-sm text-muted-foreground">{displayMessage}</p>
      </div>
      
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="flex-shrink-0 h-6 w-6 p-0"
        >
          <XCircle className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

/**
 * Error Context Provider
 * For managing global error state
 */
interface ErrorContextValue {
  errors: Array<{
    id: string;
    category: ErrorCategory;
    message: string;
    timestamp: Date;
  }>;
  addError: (category: ErrorCategory, message: string) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
}

const ErrorContext = React.createContext<ErrorContextValue | undefined>(undefined);

export function ErrorProvider({ children }: { children: React.ReactNode }) {
  const [errors, setErrors] = React.useState<ErrorContextValue['errors']>([]);

  const addError = React.useCallback((category: ErrorCategory, message: string) => {
    const id = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setErrors(prev => [...prev, { id, category, message, timestamp: new Date() }]);
  }, []);

  const removeError = React.useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const clearErrors = React.useCallback(() => {
    setErrors([]);
  }, []);

  const value = React.useMemo(() => ({
    errors,
    addError,
    removeError,
    clearErrors,
  }), [errors, addError, removeError, clearErrors]);

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useErrorContext() {
  const context = React.useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useErrorContext must be used within an ErrorProvider');
  }
  return context;
}

export default {
  ErrorState,
  InlineError,
  ErrorBoundaryFallback,
  FormErrorSummary,
  SuccessState,
  ErrorToast,
  ErrorProvider,
  useErrorContext,
  ERROR_CONFIGS,
};
