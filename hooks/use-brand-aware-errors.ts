/**
 * @fileoverview Brand-Aware Error Handling Hook
 * @module hooks/use-brand-aware-errors
 * @author OSS Hero System
 * @version 1.0.0
 */

import { useState, useCallback, useEffect } from 'react';
import { AppError, ErrorCategory, ErrorSeverity, isAppError, SystemError } from '@/lib/errors/types';
import { 
  generateBrandAwareErrorMessage,
  generateBrandAwareCategoryMessage,
  BrandAwareErrorMessage 
} from '@/lib/branding/error-messages';
import { logoManager } from '@/lib/branding/logo-manager';

export interface BrandAwareErrorState {
  /** Current error */
  error: AppError | null;
  /** Brand-aware error message */
  brandAwareMessage: BrandAwareErrorMessage | null;
  /** Whether error is visible */
  isVisible: boolean;
  /** Error context */
  context: Record<string, string>;
}

export interface BrandAwareErrorActions {
  /** Set error */
  setError: (error: AppError | Error | string, context?: Record<string, string>) => void;
  /** Clear error */
  clearError: () => void;
  /** Show error */
  showError: () => void;
  /** Hide error */
  hideError: () => void;
  /** Retry action */
  retry: () => void;
  /** Contact support */
  contactSupport: () => void;
  /** Update context */
  updateContext: (context: Record<string, string>) => void;
}

export interface UseBrandAwareErrorsOptions {
  /** Auto-hide error after duration (ms) */
  autoHideDuration?: number;
  /** Default error context */
  defaultContext?: Record<string, string>;
  /** Custom retry handler */
  onRetry?: () => void;
  /** Custom support handler */
  onSupport?: () => void;
  /** Custom error handler */
  onError?: (error: AppError, brandAwareMessage: BrandAwareErrorMessage) => void;
}

/**
 * Hook for managing brand-aware error states and actions
 */
export function useBrandAwareErrors(options: UseBrandAwareErrorsOptions = {}): BrandAwareErrorState & BrandAwareErrorActions {
  const {
    autoHideDuration,
    defaultContext = {},
    onRetry,
    onSupport,
    onError,
  } = options;

  const [state, setState] = useState<BrandAwareErrorState>({
    error: null,
    brandAwareMessage: null,
    isVisible: false,
    context: defaultContext,
  });

  const [brandConfig, setBrandConfig] = useState(logoManager.getCurrentConfig());

  // Subscribe to brand configuration changes
  useEffect(() => {
    const unsubscribe = logoManager.subscribe(setBrandConfig);
    return unsubscribe;
  }, []);

  // Auto-hide error after duration
  useEffect(() => {
    if (autoHideDuration && state.error && state.isVisible) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, isVisible: false }));
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [autoHideDuration, state.error, state.isVisible]);

  // Set error
  const setError = useCallback((error: AppError | Error | string, context?: Record<string, string>) => {
    // Convert error to AppError if needed
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

    // Generate brand-aware error message
    const brandAwareMessage = generateBrandAwareErrorMessage(appError, {
      ...state.context,
      ...context,
    });

    setState(prev => ({
      ...prev,
      error: appError,
      brandAwareMessage,
      isVisible: true,
      context: { ...prev.context, ...context },
    }));

    // Call custom error handler
    onError?.(appError, brandAwareMessage);
  }, [state.context, onError]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      brandAwareMessage: null,
      isVisible: false,
    }));
  }, []);

  // Show error
  const showError = useCallback(() => {
    setState(prev => ({ ...prev, isVisible: true }));
  }, []);

  // Hide error
  const hideError = useCallback(() => {
    setState(prev => ({ ...prev, isVisible: false }));
  }, []);

  // Retry action
  const retry = useCallback(() => {
    if (onRetry) {
      onRetry();
    } else if (state.error?.retryable) {
      // Default retry behavior - clear error and let component handle retry
      clearError();
    }
  }, [onRetry, state.error, clearError]);

  // Contact support
  const contactSupport = useCallback(() => {
    if (onSupport) {
      onSupport();
    } else if (state.error) {
      // Default support action - open email client
      const subject = `Error Report - ${state.error.code}`;
      const body = `Correlation ID: ${state.error.correlationId}\n\nError Details:\n${state.brandAwareMessage?.message || state.error.getUserSafeMessage()}`;
      window.open(`mailto:support@example.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
    }
  }, [onSupport, state.error, state.brandAwareMessage]);

  // Update context
  const updateContext = useCallback((context: Record<string, string>) => {
    setState(prev => ({
      ...prev,
      context: { ...prev.context, ...context },
    }));
  }, []);

  return {
    ...state,
    setError,
    clearError,
    showError,
    hideError,
    retry,
    contactSupport,
    updateContext,
  };
}

/**
 * Hook for brand-aware error notifications
 */
export function useBrandAwareErrorNotifications() {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    error: AppError;
    brandAwareMessage: BrandAwareErrorMessage;
    timestamp: number;
  }>>([]);

  const [brandConfig, setBrandConfig] = useState(logoManager.getCurrentConfig());

  // Subscribe to brand configuration changes
  useEffect(() => {
    const unsubscribe = logoManager.subscribe(setBrandConfig);
    return unsubscribe;
  }, []);

  // Add notification
  const addNotification = useCallback((error: AppError | Error | string, context?: Record<string, string>) => {
    // Convert error to AppError if needed
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

    // Generate brand-aware error message
    const brandAwareMessage = generateBrandAwareErrorMessage(appError, context);

    const notification = {
      id: appError.correlationId,
      error: appError,
      brandAwareMessage,
      timestamp: Date.now(),
    };

    setNotifications(prev => [...prev, notification]);
  }, []);

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Show success notification
  const showSuccess = useCallback((message: string, context?: Record<string, string>) => {
    const processedMessage = message.replace(/\{brandName\}/g, brandConfig.brandName.appName);
    // This would typically integrate with a toast system
    console.log('Success:', processedMessage);
  }, [brandConfig.brandName.appName]);

  // Show warning notification
  const showWarning = useCallback((message: string, context?: Record<string, string>) => {
    const processedMessage = message.replace(/\{brandName\}/g, brandConfig.brandName.appName);
    // This would typically integrate with a toast system
    console.log('Warning:', processedMessage);
  }, [brandConfig.brandName.appName]);

  // Show info notification
  const showInfo = useCallback((message: string, context?: Record<string, string>) => {
    const processedMessage = message.replace(/\{brandName\}/g, brandConfig.brandName.appName);
    // This would typically integrate with a toast system
    console.log('Info:', processedMessage);
  }, [brandConfig.brandName.appName]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showWarning,
    showInfo,
  };
}

/**
 * Hook for brand-aware error boundaries
 */
export function useBrandAwareErrorBoundary() {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [brandAwareMessage, setBrandAwareMessage] = useState<BrandAwareErrorMessage | null>(null);

  const [brandConfig, setBrandConfig] = useState(logoManager.getCurrentConfig());

  // Subscribe to brand configuration changes
  useEffect(() => {
    const unsubscribe = logoManager.subscribe(setBrandConfig);
    return unsubscribe;
  }, []);

  // Handle error
  const handleError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    const appError = new SystemError(
      error.message || 'An unknown error occurred',
      {
        requestId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        componentStack: errorInfo.componentStack || undefined,
        // Store errorInfo in additionalData
        additionalData: { errorInfo }
      }
    );

    const brandAwareMessage = generateBrandAwareErrorMessage(appError, {
      component: errorInfo.componentStack?.split('\n')[0] || 'Unknown',
    });

    setError(appError);
    setBrandAwareMessage(brandAwareMessage);
    setHasError(true);
  }, []);

  // Reset error boundary
  const resetErrorBoundary = useCallback(() => {
    setHasError(false);
    setError(null);
    setBrandAwareMessage(null);
  }, []);

  return {
    hasError,
    error,
    brandAwareMessage,
    handleError,
    resetErrorBoundary,
  };
}
