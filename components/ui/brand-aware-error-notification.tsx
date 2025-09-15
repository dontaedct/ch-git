/**
 * @fileoverview Brand-Aware Error Notification Components
 * @module components/ui/brand-aware-error-notification
 * @author OSS Hero System
 * @version 1.0.0
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
  Copy,
  AlertCircle,
  Shield,
  Clock,
  Database,
  Wifi,
  Server,
  FileX,
  Settings,
  MessageCircle
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from './button';
import { Toast, ToastAction, ToastClose, ToastDescription, ToastTitle } from './toast';
import { Badge } from './badge';
import { AppError, ErrorCategory, ErrorSeverity, isAppError } from '@/lib/errors/types';
import { useSecureClipboard } from '@/hooks/use-secure-clipboard';
import { 
  generateBrandAwareErrorMessage
} from '@/lib/branding/error-messages';
import { logoManager } from '@/lib/branding/logo-manager';

// Error category icons mapping
const ERROR_ICONS: Record<ErrorCategory, React.ComponentType<any>> = {
  [ErrorCategory.VALIDATION]: AlertTriangle,
  [ErrorCategory.AUTHENTICATION]: Shield,
  [ErrorCategory.AUTHORIZATION]: Shield,
  [ErrorCategory.DATABASE]: Database,
  [ErrorCategory.EXTERNAL_SERVICE]: Server,
  [ErrorCategory.NETWORK]: Wifi,
  [ErrorCategory.BUSINESS_LOGIC]: Settings,
  [ErrorCategory.NOT_FOUND]: FileX,
  [ErrorCategory.RATE_LIMIT]: Clock,
  [ErrorCategory.SECURITY]: Shield,
  [ErrorCategory.SYSTEM]: Server,
  [ErrorCategory.CONFLICT]: AlertCircle,
  [ErrorCategory.INTERNAL]: AlertTriangle,
};

// Severity color mapping
const SEVERITY_COLORS = {
  [ErrorSeverity.LOW]: 'text-blue-600 bg-blue-50 border-blue-200',
  [ErrorSeverity.MEDIUM]: 'text-amber-600 bg-amber-50 border-amber-200',
  [ErrorSeverity.HIGH]: 'text-orange-600 bg-orange-50 border-orange-200',
  [ErrorSeverity.CRITICAL]: 'text-red-600 bg-red-50 border-red-200',
};

// Brand-aware error notification variants
export const brandAwareErrorVariants = cva(
  'relative flex w-full items-start gap-3 p-4 rounded-lg border transition-all duration-200',
  {
    variants: {
      variant: {
        card: 'bg-background border-border shadow-sm',
        banner: 'bg-background/95 border-border/50 backdrop-blur-sm',
        inline: 'bg-transparent border-transparent',
        modal: 'bg-background border-border shadow-lg',
      },
      severity: {
        [ErrorSeverity.LOW]: 'border-blue-200 bg-blue-50/50',
        [ErrorSeverity.MEDIUM]: 'border-amber-200 bg-amber-50/50',
        [ErrorSeverity.HIGH]: 'border-orange-200 bg-orange-50/50',
        [ErrorSeverity.CRITICAL]: 'border-red-200 bg-red-50/50',
      },
    },
    defaultVariants: {
      variant: 'card',
      severity: ErrorSeverity.MEDIUM,
    },
  }
);

export interface BrandAwareErrorNotificationProps extends VariantProps<typeof brandAwareErrorVariants> {
  /** Error to display */
  error: AppError | Error | string;
  /** Display variant */
  variant?: 'card' | 'banner' | 'inline' | 'modal';
  /** Show action buttons */
  showActions?: boolean;
  /** Show correlation ID */
  showCorrelationId?: boolean;
  /** Show retry button */
  showRetry?: boolean;
  /** Show support contact */
  showSupport?: boolean;
  /** Show dismiss button */
  showDismiss?: boolean;
  /** Custom retry handler */
  onRetry?: () => void;
  /** Custom support handler */
  onSupport?: () => void;
  /** Custom dismiss handler */
  onDismiss?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Custom children */
  children?: React.ReactNode;
  /** Custom brand context */
  brandContext?: Record<string, string>;
}

/**
 * Brand-Aware Error Notification Component
 */
export function BrandAwareErrorNotification({
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
  brandContext,
}: BrandAwareErrorNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [copiedCorrelationId, setCopiedCorrelationId] = useState(false);
  const [brandConfig, setBrandConfig] = useState(logoManager.getCurrentConfig());
  const { copyToClipboard } = useSecureClipboard();

  // Subscribe to brand configuration changes
  useEffect(() => {
    const unsubscribe = logoManager.subscribe(setBrandConfig);
    return unsubscribe;
  }, []);

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

  // Generate brand-aware error message
  const brandAwareMessage = generateBrandAwareErrorMessage(appError, brandContext);

  // Get appropriate icon
  const IconComponent = ERROR_ICONS[appError.category] || AlertCircle;
  const severityStyle = SEVERITY_COLORS[appError.severity];

  // Handle correlation ID copy
  const handleCopyCorrelationId = async () => {
    if (appError.correlationId) {
      try {
        await copyToClipboard(appError.correlationId);
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

  // Handle support contact
  const handleSupport = () => {
    if (onSupport) {
      onSupport();
    } else {
      // Default support action - could open email client or support page
      window.open(`mailto:support@example.com?subject=Error Report - ${appError.code}&body=Correlation ID: ${appError.correlationId}`, '_blank');
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={cn(brandAwareErrorVariants({ variant, severity: appError.severity }), className)}>
      {/* Error Icon */}
      <div className={cn('flex-shrink-0', severityStyle)}>
        <IconComponent className="h-5 w-5" />
      </div>

      {/* Error Content */}
      <div className="flex-1 min-w-0">
        {/* Error Title */}
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-medium text-foreground">
            {brandAwareMessage.title}
          </h4>
          <Badge variant="outline" className="text-xs">
            {appError.severity}
          </Badge>
        </div>

        {/* Error Message */}
        <p className="text-sm text-muted-foreground mb-2">
          {brandAwareMessage.message}
        </p>

        {/* Correlation ID */}
        {showCorrelationId && appError.correlationId && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-muted-foreground">ID:</span>
            <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">
              {appError.correlationId}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyCorrelationId}
              className="h-6 w-6 p-0"
            >
              {copiedCorrelationId ? (
                <CheckCircle2 className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        )}

        {/* Help Text */}
        <p className="text-xs text-muted-foreground mb-3">
          {brandAwareMessage.helpText}
        </p>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex items-center gap-2">
            {showRetry && appError.retryable && onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="h-8"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
            
            {showSupport && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSupport}
                className="h-8"
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                Contact {brandConfig.brandName.appName} Support
              </Button>
            )}

            {showDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-8"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}

        {/* Custom Children */}
        {children}
      </div>
    </div>
  );
}

/**
 * Brand-Aware Toast Error Notification
 */
export function BrandAwareErrorToast({
  error,
  onRetry,
  onSupport,
  onDismiss,
  brandContext,
  ...props
}: Omit<BrandAwareErrorNotificationProps, 'variant'> & {
  error: AppError | Error | string;
}) {
  const [brandConfig, setBrandConfig] = useState(logoManager.getCurrentConfig());

  // Subscribe to brand configuration changes
  useEffect(() => {
    const unsubscribe = logoManager.subscribe(setBrandConfig);
    return unsubscribe;
  }, []);

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

  // Generate brand-aware error message
  const brandAwareMessage = generateBrandAwareErrorMessage(appError, brandContext);

  return (
    <Toast variant="destructive" {...props}>
      <div className="grid gap-1">
        <ToastTitle>{brandAwareMessage.title}</ToastTitle>
        <ToastDescription>{brandAwareMessage.message}</ToastDescription>
      </div>
      
      <div className="flex gap-2">
        {appError.retryable && onRetry && (
          <ToastAction altText="Retry" onClick={onRetry}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </ToastAction>
        )}
        
        {onSupport && (
          <ToastAction altText="Contact Support" onClick={onSupport}>
            <MessageCircle className="h-3 w-3 mr-1" />
            Support
          </ToastAction>
        )}
      </div>
      
      <ToastClose onClick={onDismiss} />
    </Toast>
  );
}

/**
 * Brand-Aware Success Notification
 */
export function BrandAwareSuccessNotification({
  message,
  title,
  onDismiss,
  className,
  brandContext,
}: {
  message: string;
  title?: string;
  onDismiss?: () => void;
  className?: string;
  brandContext?: Record<string, string>;
}) {
  const [brandConfig, setBrandConfig] = useState(logoManager.getCurrentConfig());

  // Subscribe to brand configuration changes
  useEffect(() => {
    const unsubscribe = logoManager.subscribe(setBrandConfig);
    return unsubscribe;
  }, []);

  const processedTitle = title || `Success - ${brandConfig.brandName.appName}`;
  const processedMessage = message.replace(/\{brandName\}/g, brandConfig.brandName.appName);

  return (
    <div className={cn(
      'relative flex w-full items-start gap-3 p-4 rounded-lg border border-green-200 bg-green-50/50 transition-all duration-200',
      className
    )}>
      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-green-900 mb-1">
          {processedTitle}
        </h4>
        <p className="text-sm text-green-700">
          {processedMessage}
        </p>
      </div>

      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

/**
 * Brand-Aware Warning Notification
 */
export function BrandAwareWarningNotification({
  message,
  title,
  onDismiss,
  className,
  brandContext,
}: {
  message: string;
  title?: string;
  onDismiss?: () => void;
  className?: string;
  brandContext?: Record<string, string>;
}) {
  const [brandConfig, setBrandConfig] = useState(logoManager.getCurrentConfig());

  // Subscribe to brand configuration changes
  useEffect(() => {
    const unsubscribe = logoManager.subscribe(setBrandConfig);
    return unsubscribe;
  }, []);

  const processedTitle = title || `Warning - ${brandConfig.brandName.appName}`;
  const processedMessage = message.replace(/\{brandName\}/g, brandConfig.brandName.appName);

  return (
    <div className={cn(
      'relative flex w-full items-start gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50/50 transition-all duration-200',
      className
    )}>
      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-amber-900 mb-1">
          {processedTitle}
        </h4>
        <p className="text-sm text-amber-700">
          {processedMessage}
        </p>
      </div>

      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

/**
 * Brand-Aware Info Notification
 */
export function BrandAwareInfoNotification({
  message,
  title,
  onDismiss,
  className,
  brandContext,
}: {
  message: string;
  title?: string;
  onDismiss?: () => void;
  className?: string;
  brandContext?: Record<string, string>;
}) {
  const [brandConfig, setBrandConfig] = useState(logoManager.getCurrentConfig());

  // Subscribe to brand configuration changes
  useEffect(() => {
    const unsubscribe = logoManager.subscribe(setBrandConfig);
    return unsubscribe;
  }, []);

  const processedTitle = title || `Info - ${brandConfig.brandName.appName}`;
  const processedMessage = message.replace(/\{brandName\}/g, brandConfig.brandName.appName);

  return (
    <div className={cn(
      'relative flex w-full items-start gap-3 p-4 rounded-lg border border-blue-200 bg-blue-50/50 transition-all duration-200',
      className
    )}>
      <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-blue-900 mb-1">
          {processedTitle}
        </h4>
        <p className="text-sm text-blue-700">
          {processedMessage}
        </p>
      </div>

      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}