/**
 * Enhanced Error Notification Components
 * 
 * Integrated with the unified error handling system to provide
 * user-friendly error notifications across different UI contexts.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  RefreshCw,
  ExternalLink,
  Copy,
  AlertCircle,
  Shield,
  Clock,
  Database,
  Wifi,
  Server,
  FileX,
  Settings
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from './button';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { Toast, ToastAction, ToastClose, ToastDescription, ToastTitle } from './toast';
import { Badge } from './badge';
import { AppError, ErrorCategory, ErrorSeverity, isAppError } from '@/lib/errors/types';
import { ErrorMessageMapper, UserErrorMessage } from '@/lib/errors/messages';

/**
 * Error notification variants for different UI contexts
 */
const errorNotificationVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm transition-all duration-200',
  {
    variants: {
      variant: {
        inline: 'border-l-4 bg-card',
        card: 'shadow-sm bg-card',
        banner: 'border-x-0 border-t-0 border-b rounded-none bg-background/95 backdrop-blur-sm',
        modal: 'shadow-lg bg-card border-2',
      },
      severity: {
        low: 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20',
        medium: 'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20',
        high: 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20',
        critical: 'border-red-300 bg-red-100/50 dark:border-red-700 dark:bg-red-900/30 ring-1 ring-red-200 dark:ring-red-800',
      },
    },
    compoundVariants: [
      {
        variant: 'inline',
        severity: 'low',
        class: 'border-l-blue-500',
      },
      {
        variant: 'inline',
        severity: 'medium',
        class: 'border-l-amber-500',
      },
      {
        variant: 'inline',
        severity: 'high',
        class: 'border-l-red-500',
      },
      {
        variant: 'inline',
        severity: 'critical',
        class: 'border-l-red-600',
      },
    ],
    defaultVariants: {
      variant: 'card',
      severity: 'medium',
    },
  }
);

/**
 * Icon mapping for error categories
 */
const ERROR_ICONS: Record<ErrorCategory, React.ComponentType<{ className?: string }>> = {
  [ErrorCategory.VALIDATION]: AlertTriangle,
  [ErrorCategory.AUTHENTICATION]: Shield,
  [ErrorCategory.AUTHORIZATION]: Shield,
  [ErrorCategory.DATABASE]: Database,
  [ErrorCategory.EXTERNAL_SERVICE]: Server,
  [ErrorCategory.NETWORK]: Wifi,
  [ErrorCategory.BUSINESS_LOGIC]: AlertCircle,
  [ErrorCategory.SYSTEM]: Settings,
  [ErrorCategory.SECURITY]: Shield,
  [ErrorCategory.RATE_LIMIT]: Clock,
  [ErrorCategory.NOT_FOUND]: FileX,
  [ErrorCategory.CONFLICT]: AlertTriangle,
  [ErrorCategory.INTERNAL]: AlertCircle,
};

/**
 * Severity colors for consistent styling
 */
const SEVERITY_COLORS: Record<ErrorSeverity, {
  text: string;
  icon: string;
  badge: string;
}> = {
  [ErrorSeverity.LOW]: {
    text: 'text-blue-700 dark:text-blue-300',
    icon: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  [ErrorSeverity.MEDIUM]: {
    text: 'text-amber-700 dark:text-amber-300',
    icon: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  },
  [ErrorSeverity.HIGH]: {
    text: 'text-red-700 dark:text-red-300',
    icon: 'text-red-600 dark:text-red-400',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
  [ErrorSeverity.CRITICAL]: {
    text: 'text-red-800 dark:text-red-200',
    icon: 'text-red-700 dark:text-red-300',
    badge: 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100',
  },
};

/**
 * Props for error notification components
 */
interface ErrorNotificationProps {
  error: AppError | Error | string;
  variant?: 'inline' | 'card' | 'banner' | 'modal';
  showActions?: boolean;
  showCorrelationId?: boolean;
  showRetry?: boolean;
  showSupport?: boolean;
  showDismiss?: boolean;
  onRetry?: () => void;
  onSupport?: () => void;
  onDismiss?: () => void;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Enhanced Error Notification Component
 */
export function ErrorNotification({
  error,
  variant = 'card',
  showActions = true,
  showCorrelationId = false,
  showRetry = true,
  showSupport = true,
  showDismiss = false,
  onRetry,
  onSupport,
  onDismiss,
  className,
  children,
}: ErrorNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [copiedCorrelationId, setCopiedCorrelationId] = useState(false);

  // Convert error to AppError if needed
  const appError = isAppError(error) 
    ? error 
    : typeof error === 'string' 
      ? { 
          code: 'GENERIC_ERROR',
          category: ErrorCategory.SYSTEM,
          severity: ErrorSeverity.MEDIUM,
          getUserSafeMessage: () => error,
          correlationId: 'unknown',
          retryable: false 
        } as AppError
      : {
          code: 'GENERIC_ERROR',
          category: ErrorCategory.SYSTEM,  
          severity: ErrorSeverity.MEDIUM,
          getUserSafeMessage: () => error.message,
          correlationId: 'unknown',
          retryable: false
        } as AppError;

  // Get user-friendly message
  const userMessage = ErrorMessageMapper.formatForContext(
    appError.code,
    appError.category,
    appError.severity,
    variant === 'banner' ? 'toast' : variant === 'inline' ? 'inline' : 'modal'
  );

  // Get appropriate icon
  const IconComponent = ERROR_ICONS[appError.category] || AlertCircle;
  const severityStyle = SEVERITY_COLORS[appError.severity];

  // Handle correlation ID copy
  const handleCopyCorrelationId = async () => {
    if (navigator.clipboard && appError.correlationId) {
      try {
        await navigator.clipboard.writeText(appError.correlationId);
        setCopiedCorrelationId(true);
        setTimeout(() => setCopiedCorrelationId(false), 2000);
      } catch (error) {
        console.warn('Failed to copy correlation ID:', error);
      }
    }
  };

  // Handle dismiss
  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        errorNotificationVariants({ variant, severity: appError.severity }),
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn('flex-shrink-0 mt-0.5', severityStyle.icon)}>
          <IconComponent className="h-4 w-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title and Severity Badge */}
          <div className="flex items-center gap-2 mb-1">
            {userMessage.title && (
              <h4 className={cn('font-medium text-sm', severityStyle.text)}>
                {userMessage.title}
              </h4>
            )}
            {variant === 'modal' && (
              <Badge variant="secondary" className={severityStyle.badge}>
                {appError.severity.toUpperCase()}
              </Badge>
            )}
          </div>

          {/* Message */}
          <p className={cn('text-sm leading-relaxed', severityStyle.text)}>
            {userMessage.message}
          </p>

          {/* Action text */}
          {userMessage.action && (
            <p className="text-sm text-muted-foreground mt-1">
              {userMessage.action}
            </p>
          )}

          {/* Help text */}
          {userMessage.helpText && variant !== 'inline' && (
            <p className="text-xs text-muted-foreground mt-2">
              {userMessage.helpText}
            </p>
          )}

          {/* Correlation ID */}
          {showCorrelationId && appError.correlationId && appError.correlationId !== 'unknown' && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">
                Error ID: {appError.correlationId.substring(0, 8)}...
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={handleCopyCorrelationId}
              >
                {copiedCorrelationId ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          )}

          {/* Custom children */}
          {children && (
            <div className="mt-3">
              {children}
            </div>
          )}

          {/* Actions */}
          {showActions && (showRetry || showSupport) && variant !== 'inline' && (
            <div className="flex flex-wrap gap-2 mt-3">
              {showRetry && appError.retryable && onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  className="h-8 text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Try Again
                </Button>
              )}
              
              {showSupport && onSupport && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSupport}
                  className="h-8 text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Get Help
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Dismiss button */}
        {showDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="flex-shrink-0 h-6 w-6 p-0 hover:bg-background/80"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Dismiss</span>
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Toast Error Notification
 */
interface ErrorToastProps {
  error: AppError | Error | string;
  duration?: number;
  showCorrelationId?: boolean;
  onRetry?: () => void;
  onSupport?: () => void;
}

export function ErrorToast({
  error,
  duration = 5000,
  showCorrelationId = false,
  onRetry,
  onSupport,
}: ErrorToastProps) {
  const appError = isAppError(error) 
    ? error 
    : typeof error === 'string'
      ? { 
          code: 'GENERIC_ERROR',
          category: ErrorCategory.SYSTEM,
          severity: ErrorSeverity.MEDIUM,
          getUserSafeMessage: () => error,
          correlationId: 'unknown',
          retryable: false 
        } as AppError
      : {
          code: 'GENERIC_ERROR', 
          category: ErrorCategory.SYSTEM,
          severity: ErrorSeverity.MEDIUM,
          getUserSafeMessage: () => error.message,
          correlationId: 'unknown',
          retryable: false
        } as AppError;

  const userMessage = ErrorMessageMapper.formatForContext(
    appError.code,
    appError.category,
    appError.severity,
    'toast'
  );

  const getToastVariant = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 'info';
      case ErrorSeverity.MEDIUM:
        return 'warning';
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return 'destructive';
      default:
        return 'destructive';
    }
  };

  return (
    <Toast variant={getToastVariant(appError.severity)} duration={duration}>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          {userMessage.title && (
            <ToastTitle className="text-sm font-medium">
              {userMessage.title}
            </ToastTitle>
          )}
          <ToastDescription className="text-sm">
            {userMessage.message}
          </ToastDescription>
          
          {showCorrelationId && appError.correlationId && appError.correlationId !== 'unknown' && (
            <div className="text-xs opacity-70 mt-1">
              ID: {appError.correlationId.substring(0, 8)}
            </div>
          )}
        </div>
      </div>
      
      {/* Toast Actions */}
      {(appError.retryable && onRetry) && (
        <ToastAction altText="Try again" onClick={onRetry}>
          Try Again
        </ToastAction>
      )}
      
      <ToastClose />
    </Toast>
  );
}

/**
 * Inline Error for form fields
 */
interface InlineErrorProps {
  error: AppError | Error | string;
  className?: string;
}

export function InlineError({ error, className }: InlineErrorProps) {
  const message = isAppError(error) 
    ? error.getUserSafeMessage()
    : typeof error === 'string'
      ? error
      : error.message;

  return (
    <div className={cn('flex items-center gap-1 text-destructive text-xs mt-1', className)}>
      <AlertTriangle className="h-3 w-3 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/**
 * Full Page Error Component
 */
interface ErrorPageProps {
  error: AppError | Error | string;
  title?: string;
  showRetry?: boolean;
  showSupport?: boolean;
  onRetry?: () => void;
  onSupport?: () => void;
  className?: string;
}

export function ErrorPage({
  error,
  title = "Something went wrong",
  showRetry = true,
  showSupport = true,
  onRetry,
  onSupport,
  className,
}: ErrorPageProps) {
  return (
    <div className={cn('min-h-[60vh] flex items-center justify-center p-6', className)}>
      <div className="max-w-lg w-full">
        <ErrorNotification
          error={error}
          variant="modal"
          showActions={showRetry || showSupport}
          showCorrelationId={true}
          showRetry={showRetry}
          showSupport={showSupport}
          onRetry={onRetry}
          onSupport={onSupport}
          className="text-center"
        >
          {title && (
            <div className="mb-4">
              <h1 className="text-2xl font-semibold mb-2">{title}</h1>
            </div>
          )}
        </ErrorNotification>
      </div>
    </div>
  );
}

/**
 * Specialized error components for common scenarios
 */
export function ValidationErrorNotification({ 
  error, 
  onRetry, 
  ...props 
}: Omit<ErrorNotificationProps, 'error'> & { 
  error: AppError | Error | string 
}) {
  return (
    <ErrorNotification
      error={error}
      variant="inline"
      showSupport={false}
      showRetry={true}
      onRetry={onRetry}
      {...props}
    />
  );
}

export function NetworkErrorNotification({ 
  error, 
  onRetry, 
  ...props 
}: Omit<ErrorNotificationProps, 'error'> & { 
  error: AppError | Error | string 
}) {
  return (
    <ErrorNotification
      error={error}
      variant="card"
      showRetry={true}
      onRetry={onRetry}
      {...props}
    />
  );
}

export function AuthErrorNotification({ 
  error, 
  onSupport, 
  ...props 
}: Omit<ErrorNotificationProps, 'error'> & { 
  error: AppError | Error | string 
}) {
  return (
    <ErrorNotification
      error={error}
      variant="banner"
      showRetry={false}
      showSupport={true}
      onSupport={onSupport}
      {...props}
    />
  );
}

/**
 * Hook for managing error notifications
 */
export function useErrorNotification() {
  const [errors, setErrors] = useState<AppError[]>([]);

  const addError = (error: AppError | Error | string) => {
    const appError = isAppError(error) 
      ? error 
      : typeof error === 'string'
        ? { 
            code: 'GENERIC_ERROR',
            category: ErrorCategory.SYSTEM,
            severity: ErrorSeverity.MEDIUM,
            getUserSafeMessage: () => error,
            correlationId: `client-${Date.now()}`,
            retryable: false 
          } as AppError
        : {
            code: 'GENERIC_ERROR',
            category: ErrorCategory.SYSTEM,
            severity: ErrorSeverity.MEDIUM,
            getUserSafeMessage: () => error.message,
            correlationId: `client-${Date.now()}`,
            retryable: false
          } as AppError;

    setErrors(prev => [...prev, appError]);
  };

  const removeError = (correlationId: string) => {
    setErrors(prev => prev.filter(error => error.correlationId !== correlationId));
  };

  const clearErrors = () => {
    setErrors([]);
  };

  return {
    errors,
    addError,
    removeError,
    clearErrors,
  };
}