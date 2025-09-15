/**
 * @fileoverview Brand-Aware Error Context Provider
 * @module lib/errors/brand-aware-context
 * @author OSS Hero System
 * @version 1.0.0
 */

'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { AppError, isAppError, ErrorCategory, ErrorSeverity } from './types';
import { errorHandler } from './handler';
import { 
  generateBrandAwareErrorMessage,
  generateBrandAwareCategoryMessage,
  BrandAwareErrorMessage 
} from '@/lib/branding/error-messages';
import { logoManager } from '@/lib/branding/logo-manager';

/**
 * Brand-aware error state
 */
interface BrandAwareErrorState {
  errors: AppError[];
  notifications: AppError[];
  globalError: AppError | null;
  isLoading: boolean;
  brandConfig: any; // Will be typed properly when logo manager types are available
}

/**
 * Brand-aware error actions
 */
type BrandAwareErrorAction =
  | { type: 'ADD_ERROR'; error: AppError; brandAwareMessage: BrandAwareErrorMessage }
  | { type: 'REMOVE_ERROR'; correlationId: string }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'ADD_NOTIFICATION'; error: AppError; brandAwareMessage: BrandAwareErrorMessage }
  | { type: 'REMOVE_NOTIFICATION'; correlationId: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'SET_GLOBAL_ERROR'; error: AppError | null; brandAwareMessage: BrandAwareErrorMessage | null }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'UPDATE_BRAND_CONFIG'; brandConfig: any };

/**
 * Brand-aware error context type
 */
interface BrandAwareErrorContextType extends BrandAwareErrorState {
  // Error management
  addError: (error: AppError | Error | string, context?: Record<string, any>) => AppError;
  removeError: (correlationId: string) => void;
  clearErrors: () => void;
  
  // Notifications
  showNotification: (error: AppError | Error | string, context?: Record<string, any>) => void;
  removeNotification: (correlationId: string) => void;
  clearNotifications: () => void;
  
  // Global error handling
  setGlobalError: (error: AppError | Error | string | null, context?: Record<string, any>) => void;
  
  // Brand-aware message generation
  getBrandAwareMessage: (error: AppError, context?: Record<string, any>) => BrandAwareErrorMessage;
  getBrandAwareCategoryMessage: (category: ErrorCategory, severity: ErrorSeverity, context?: Record<string, any>) => BrandAwareErrorMessage;
  
  // Utility functions
  showSuccess: (message: string, context?: Record<string, any>) => void;
  showWarning: (message: string, context?: Record<string, any>) => void;
  showInfo: (message: string, context?: Record<string, any>) => void;
  
  // Specialized error handlers
  handleApiError: (error: AppError | Error | string, context?: Record<string, any>) => AppError;
  handleFormError: (error: AppError | Error | string, context?: Record<string, any>) => AppError;
  handleNetworkError: (error: AppError | Error | string, context?: Record<string, any>) => AppError;
}

/**
 * Brand-aware error reducer
 */
function brandAwareErrorReducer(state: BrandAwareErrorState, action: BrandAwareErrorAction): BrandAwareErrorState {
  switch (action.type) {
    case 'ADD_ERROR':
      return {
        ...state,
        errors: [...state.errors, action.error],
      };
      
    case 'REMOVE_ERROR':
      return {
        ...state,
        errors: state.errors.filter(error => error.correlationId !== action.correlationId),
      };
      
    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: [],
      };
      
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.error],
      };
      
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(error => error.correlationId !== action.correlationId),
      };
      
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
      };
      
    case 'SET_GLOBAL_ERROR':
      return {
        ...state,
        globalError: action.error,
      };
      
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.isLoading,
      };
      
    case 'UPDATE_BRAND_CONFIG':
      return {
        ...state,
        brandConfig: action.brandConfig,
      };
      
    default:
      return state;
  }
}

/**
 * Brand-aware error context
 */
const BrandAwareErrorContext = createContext<BrandAwareErrorContextType | undefined>(undefined);

/**
 * Brand-aware error provider props
 */
interface BrandAwareErrorProviderProps {
  children: React.ReactNode;
  maxErrors?: number;
  maxNotifications?: number;
  autoRemoveNotifications?: boolean;
  notificationDuration?: number;
}

/**
 * Brand-aware error provider component
 */
export function BrandAwareErrorProvider({
  children,
  maxErrors = 10,
  maxNotifications = 5,
  autoRemoveNotifications = true,
  notificationDuration = 5000,
}: BrandAwareErrorProviderProps) {
  const [state, dispatch] = useReducer(brandAwareErrorReducer, {
    errors: [],
    notifications: [],
    globalError: null,
    isLoading: false,
    brandConfig: logoManager.getCurrentConfig(),
  });

  // Subscribe to brand configuration changes
  useEffect(() => {
    const unsubscribe = logoManager.subscribe((brandConfig) => {
      dispatch({ type: 'UPDATE_BRAND_CONFIG', brandConfig });
    });
    return unsubscribe;
  }, []);

  /**
   * Process error and convert to AppError
   */
  const processError = useCallback((error: AppError | Error | string, context?: Record<string, any>): AppError => {
    if (isAppError(error)) {
      return error;
    }

    if (typeof error === 'string') {
      return {
        code: 'GENERIC_ERROR',
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.MEDIUM,
        getUserSafeMessage: () => error,
        correlationId: `client-${Date.now()}`,
        retryable: false,
        context: context || {},
      } as AppError;
    }

    return {
      message: error.message,
      code: 'GENERIC_ERROR',
      timestamp: new Date().toISOString(),
      context: context || {},
      severity: ErrorSeverity.MEDIUM,
    } as AppError;
  }, []);

  /**
   * Add error to the context
   */
  const addError = useCallback((error: AppError | Error | string, context?: Record<string, any>): AppError => {
    const appError = processError(error, context);
    
    // Process through error handler
    const processedError = errorHandler.processError(appError, context);
    
    // Generate brand-aware message
    const brandAwareMessage = generateBrandAwareErrorMessage(processedError, context);
    
    dispatch({ type: 'ADD_ERROR', error: processedError, brandAwareMessage });
    
    // Limit number of errors
    if (state.errors.length >= maxErrors) {
      const oldestError = state.errors[0];
      dispatch({ type: 'REMOVE_ERROR', correlationId: oldestError.correlationId });
    }
    
    return processedError;
  }, [processError, state.errors.length, maxErrors]);

  /**
   * Remove error from context
   */
  const removeError = useCallback((correlationId: string) => {
    dispatch({ type: 'REMOVE_ERROR', correlationId });
  }, []);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' });
  }, []);

  /**
   * Show notification
   */
  const showNotification = useCallback((error: AppError | Error | string, context?: Record<string, any>) => {
    const appError = processError(error, context);
    const brandAwareMessage = generateBrandAwareErrorMessage(appError, context);
    
    dispatch({ type: 'ADD_NOTIFICATION', error: appError, brandAwareMessage });
    
    // Limit number of notifications
    if (state.notifications.length >= maxNotifications) {
      const oldestNotification = state.notifications[0];
      dispatch({ type: 'REMOVE_NOTIFICATION', correlationId: oldestNotification.correlationId });
    }
    
    // Auto-remove notification after duration
    if (autoRemoveNotifications) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', correlationId: appError.correlationId });
      }, notificationDuration);
    }
  }, [processError, state.notifications.length, maxNotifications, autoRemoveNotifications, notificationDuration]);

  /**
   * Remove notification
   */
  const removeNotification = useCallback((correlationId: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', correlationId });
  }, []);

  /**
   * Clear all notifications
   */
  const clearNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  }, []);

  /**
   * Set global error
   */
  const setGlobalError = useCallback((error: AppError | Error | string | null, context?: Record<string, any>) => {
    if (error === null) {
      dispatch({ type: 'SET_GLOBAL_ERROR', error: null, brandAwareMessage: null });
      return;
    }

    const appError = processError(error, context);
    const brandAwareMessage = generateBrandAwareErrorMessage(appError, context);
    
    dispatch({ type: 'SET_GLOBAL_ERROR', error: appError, brandAwareMessage });
  }, [processError]);

  /**
   * Get brand-aware message for error
   */
  const getBrandAwareMessage = useCallback((error: AppError, context?: Record<string, any>): BrandAwareErrorMessage => {
    return generateBrandAwareErrorMessage(error, context);
  }, []);

  /**
   * Get brand-aware message for category and severity
   */
  const getBrandAwareCategoryMessage = useCallback((
    category: ErrorCategory, 
    severity: ErrorSeverity, 
    context?: Record<string, any>
  ): BrandAwareErrorMessage => {
    return generateBrandAwareCategoryMessage(category, severity, context);
  }, []);

  /**
   * Show success message
   */
  const showSuccess = useCallback((message: string, context?: Record<string, any>) => {
    const processedMessage = message.replace(/\{brandName\}/g, state.brandConfig.brandName.appName);
    // This would typically integrate with a toast system
    console.log('Success:', processedMessage);
  }, [state.brandConfig.brandName.appName]);

  /**
   * Show warning message
   */
  const showWarning = useCallback((message: string, context?: Record<string, any>) => {
    const processedMessage = message.replace(/\{brandName\}/g, state.brandConfig.brandName.appName);
    // This would typically integrate with a toast system
    console.log('Warning:', processedMessage);
  }, [state.brandConfig.brandName.appName]);

  /**
   * Show info message
   */
  const showInfo = useCallback((message: string, context?: Record<string, any>) => {
    const processedMessage = message.replace(/\{brandName\}/g, state.brandConfig.brandName.appName);
    // This would typically integrate with a toast system
    console.log('Info:', processedMessage);
  }, [state.brandConfig.brandName.appName]);

  /**
   * Handle API errors
   */
  const handleApiError = useCallback((error: AppError | Error | string, context?: Record<string, any>): AppError => {
    const appError = addError(error, { ...context, source: 'api' });
    showNotification(appError, context);
    return appError;
  }, [addError, showNotification]);

  /**
   * Handle form errors
   */
  const handleFormError = useCallback((error: AppError | Error | string, context?: Record<string, any>): AppError => {
    return addError(error, { ...context, source: 'form' });
  }, [addError]);

  /**
   * Handle network errors
   */
  const handleNetworkError = useCallback((error: AppError | Error | string, context?: Record<string, any>): AppError => {
    const appError = addError(error, { ...context, source: 'network' });
    showNotification(appError, context);
    return appError;
  }, [addError, showNotification]);

  const contextValue: BrandAwareErrorContextType = {
    ...state,
    addError,
    removeError,
    clearErrors,
    showNotification,
    removeNotification,
    clearNotifications,
    setGlobalError,
    getBrandAwareMessage,
    getBrandAwareCategoryMessage,
    showSuccess,
    showWarning,
    showInfo,
    handleApiError,
    handleFormError,
    handleNetworkError,
  };

  return (
    <BrandAwareErrorContext.Provider value={contextValue}>
      {children}
    </BrandAwareErrorContext.Provider>
  );
}

/**
 * Hook to use brand-aware error context
 */
export function useBrandAwareErrorContext(): BrandAwareErrorContextType {
  const context = useContext(BrandAwareErrorContext);
  if (context === undefined) {
    throw new Error('useBrandAwareErrorContext must be used within a BrandAwareErrorProvider');
  }
  return context;
}
