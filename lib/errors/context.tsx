/**
 * Error Context Provider
 * 
 * Provides global error state management and notification system
 * for the application.
 */

'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { AppError, isAppError, ErrorCategory, ErrorSeverity, createErrorContext } from './types';
import { errorHandler } from './handler';
import { ErrorMessageMapper } from './messages';

/**
 * Error state for the context
 */
interface ErrorState {
  errors: AppError[];
  notifications: AppError[];
  globalError: AppError | null;
  isLoading: boolean;
}

/**
 * Error actions
 */
type ErrorAction =
  | { type: 'ADD_ERROR'; error: AppError }
  | { type: 'REMOVE_ERROR'; correlationId: string }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'ADD_NOTIFICATION'; error: AppError }
  | { type: 'REMOVE_NOTIFICATION'; correlationId: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'SET_GLOBAL_ERROR'; error: AppError | null }
  | { type: 'SET_LOADING'; isLoading: boolean };

/**
 * Error context type
 */
interface ErrorContextType extends ErrorState {
  // Error management
  addError: (error: AppError | Error | string, context?: Record<string, any>) => AppError;
  removeError: (correlationId: string) => void;
  clearErrors: () => void;
  
  // Notifications
  showNotification: (error: AppError | Error | string, context?: Record<string, any>) => void;
  removeNotification: (correlationId: string) => void;
  clearNotifications: () => void;
  
  // Global error (for critical errors that need app-wide attention)
  setGlobalError: (error: AppError | Error | string | null, context?: Record<string, any>) => void;
  
  // Loading state
  setLoading: (isLoading: boolean) => void;
  
  // Convenience methods
  showSuccess: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
  
  // Error handling methods
  handleApiError: (error: AppError | Error | string, context?: Record<string, any>) => AppError;
  handleFormError: (error: AppError | Error | string, context?: Record<string, any>) => AppError;
  handleNetworkError: (error: AppError | Error | string, context?: Record<string, any>) => AppError;
}

/**
 * Initial state
 */
const initialState: ErrorState = {
  errors: [],
  notifications: [],
  globalError: null,
  isLoading: false,
};

/**
 * Error reducer
 */
function errorReducer(state: ErrorState, action: ErrorAction): ErrorState {
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
      // Limit notifications to prevent spam
      const notifications = [...state.notifications, action.error];
      return {
        ...state,
        notifications: notifications.slice(-5), // Keep only last 5
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
      
    default:
      return state;
  }
}

/**
 * Error context
 */
const ErrorContext = createContext<ErrorContextType | null>(null);

/**
 * Error provider props
 */
interface ErrorProviderProps {
  children: React.ReactNode;
  maxErrors?: number;
  maxNotifications?: number;
  autoRemoveNotifications?: boolean;
  notificationDuration?: number;
}

/**
 * Error provider component
 */
export function ErrorProvider({
  children,
  maxErrors = 10,
  maxNotifications = 5,
  autoRemoveNotifications = true,
  notificationDuration = 5000,
}: ErrorProviderProps) {
  const [state, dispatch] = useReducer(errorReducer, initialState);

  /**
   * Convert any error to AppError and add to state
   */
  const processError = useCallback((
    error: AppError | Error | string,
    context?: Record<string, any>
  ): AppError => {
    const errorContext = createErrorContext(undefined, context);
    const appError = errorHandler.processError(error, errorContext);
    
    // Log the error
    errorHandler.logError(appError);
    
    return appError;
  }, []);

  /**
   * Add error to error list
   */
  const addError = useCallback((
    error: AppError | Error | string,
    context?: Record<string, any>
  ): AppError => {
    const appError = processError(error, context);
    dispatch({ type: 'ADD_ERROR', error: appError });
    
    // Auto-remove errors to prevent memory leaks
    if (state.errors.length >= maxErrors) {
      const oldestError = state.errors[0];
      if (oldestError) {
        setTimeout(() => {
          dispatch({ type: 'REMOVE_ERROR', correlationId: oldestError.correlationId });
        }, 100);
      }
    }
    
    return appError;
  }, [processError, state.errors.length, maxErrors]);

  /**
   * Remove specific error
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
  const showNotification = useCallback((
    error: AppError | Error | string,
    context?: Record<string, any>
  ) => {
    const appError = processError(error, context);
    dispatch({ type: 'ADD_NOTIFICATION', error: appError });
    
    // Auto-remove notifications
    if (autoRemoveNotifications) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', correlationId: appError.correlationId });
      }, notificationDuration);
    }
  }, [processError, autoRemoveNotifications, notificationDuration]);

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
  const setGlobalError = useCallback((
    error: AppError | Error | string | null,
    context?: Record<string, any>
  ) => {
    if (error === null) {
      dispatch({ type: 'SET_GLOBAL_ERROR', error: null });
    } else {
      const appError = processError(error, context);
      dispatch({ type: 'SET_GLOBAL_ERROR', error: appError });
    }
  }, [processError]);

  /**
   * Set loading state
   */
  const setLoading = useCallback((isLoading: boolean) => {
    dispatch({ type: 'SET_LOADING', isLoading });
  }, []);

  /**
   * Convenience methods for different types of notifications
   */
  const showSuccess = useCallback((message: string) => {
    const successError = processError(`SUCCESS: ${message}`, { source: 'user-success' });
    
    dispatch({ type: 'ADD_NOTIFICATION', error: successError });
    
    if (autoRemoveNotifications) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', correlationId: successError.correlationId });
      }, notificationDuration);
    }
  }, [autoRemoveNotifications, notificationDuration]);

  const showWarning = useCallback((message: string) => {
    const warningError = processError(`WARNING: ${message}`, { source: 'user-warning' });
    
    dispatch({ type: 'ADD_NOTIFICATION', error: warningError });
    
    if (autoRemoveNotifications) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', correlationId: warningError.correlationId });
      }, notificationDuration);
    }
  }, [autoRemoveNotifications, notificationDuration]);

  const showInfo = useCallback((message: string) => {
    const infoError = processError(`INFO: ${message}`, { source: 'user-info' });
    
    dispatch({ type: 'ADD_NOTIFICATION', error: infoError });
    
    if (autoRemoveNotifications) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', correlationId: infoError.correlationId });
      }, notificationDuration);
    }
  }, [autoRemoveNotifications, notificationDuration]);

  /**
   * Specialized error handlers
   */
  const handleApiError = useCallback((
    error: AppError | Error | string,
    context?: Record<string, any>
  ): AppError => {
    const appError = addError(error, { ...context, source: 'api' });
    showNotification(appError);
    return appError;
  }, [addError, showNotification]);

  const handleFormError = useCallback((
    error: AppError | Error | string,
    context?: Record<string, any>
  ): AppError => {
    return addError(error, { ...context, source: 'form' });
  }, [addError]);

  const handleNetworkError = useCallback((
    error: AppError | Error | string,
    context?: Record<string, any>
  ): AppError => {
    const appError = addError(error, { ...context, source: 'network' });
    showNotification(appError);
    return appError;
  }, [addError, showNotification]);

  /**
   * Handle global unhandled errors and promise rejections
   */
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      const error = event.error || event.message;
      setGlobalError(error as Error | string, { 
        source: 'global', 
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno 
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setGlobalError(event.reason as Error | string, { source: 'promise' });
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [setGlobalError]);

  const contextValue: ErrorContextType = {
    ...state,
    addError,
    removeError,
    clearErrors,
    showNotification,
    removeNotification,
    clearNotifications,
    setGlobalError,
    setLoading,
    showSuccess,
    showWarning,
    showInfo,
    handleApiError,
    handleFormError,
    handleNetworkError,
  };

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
    </ErrorContext.Provider>
  );
}

/**
 * Hook to use error context
 */
export function useError(): ErrorContextType {
  const context = useContext(ErrorContext);
  
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  
  return context;
}

/**
 * Hook for handling async operations with error management
 */
export function useAsyncError() {
  const { addError, setLoading, showNotification } = useError();

  const executeAsync = useCallback(async function<T>(
    asyncFn: () => Promise<T>,
    options?: {
      showNotification?: boolean;
      context?: Record<string, any>;
      onError?: (error: AppError) => void;
    }
  ): Promise<T | null> {
    try {
      setLoading(true);
      const result = await asyncFn();
      return result;
    } catch (error) {
      const appError = addError(error as Error | string, options?.context);
      
      if (options?.showNotification !== false) {
        showNotification(appError);
      }
      
      options?.onError?.(appError);
      return null;
    } finally {
      setLoading(false);
    }
  }, [addError, setLoading, showNotification]);

  return { executeAsync };
}

/**
 * HOC for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: AppError; reset: () => void }>
) {
  return function ErrorBoundaryWrapper(props: P) {
    const { setGlobalError } = useError();
    
    // This would need to be implemented with a class-based error boundary
    // or using React 18's error boundary hook when available
    return <Component {...props} />;
  };
}

/**
 * Error boundary component (class-based for catching React errors)
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{
    fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  }>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{
    fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  }>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo);
    
    // Log to error handler
    errorHandler.handleServerError(error, {
      componentStack: errorInfo.componentStack || undefined,
      source: 'react-error-boundary'
    });
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback;
      
      if (FallbackComponent) {
        return <FallbackComponent error={this.state.error} reset={this.reset} />;
      }
      
      // Default fallback
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md text-center">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={this.reset}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}