/**
 * @fileoverview HT-021.3.3: Error Handling Infrastructure for State Management
 * @module lib/state/error-handling
 * @author OSS Hero System
 * @version 1.0.0
 *
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-021.3.3 - State Management Foundation
 * Focus: Comprehensive error handling with boundaries and recovery patterns
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (error handling critical for UX)
 */

import React, {
  Component,
  ErrorInfo,
  ReactNode,
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
} from 'react';
import { QueryClient } from '@tanstack/react-query';

// ============================================================================
// ERROR TYPES AND INTERFACES
// ============================================================================

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory = 'network' | 'validation' | 'authentication' | 'authorization' | 'business' | 'system' | 'unknown';

export interface EnhancedError extends Error {
  id?: string;
  code?: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  timestamp: number;
  context?: Record<string, any>;
  recoverable?: boolean;
  userMessage?: string;
  technicalMessage?: string;
  retryable?: boolean;
  source?: 'client' | 'server' | 'network';
  stack?: string;
}

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  route?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface ErrorRecoveryStrategy {
  name: string;
  description: string;
  action: () => Promise<void> | void;
  automatic?: boolean;
  priority?: number;
}

export interface ErrorHandlerConfig {
  maxRetries?: number;
  retryDelay?: number;
  enableNotifications?: boolean;
  enableLogging?: boolean;
  enableTelemetry?: boolean;
  fallbackComponent?: React.ComponentType<{ error: EnhancedError }>;
  onError?: (error: EnhancedError, context: ErrorContext) => void;
  onRecovery?: (error: EnhancedError, strategy: ErrorRecoveryStrategy) => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: EnhancedError | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
  lastRetry: Date | null;
  recoveryStrategies: ErrorRecoveryStrategy[];
}

// ============================================================================
// ERROR FACTORY
// ============================================================================

export class ErrorFactory {
  static create(
    message: string,
    options?: {
      code?: string;
      severity?: ErrorSeverity;
      category?: ErrorCategory;
      context?: Record<string, any>;
      recoverable?: boolean;
      userMessage?: string;
      retryable?: boolean;
      source?: 'client' | 'server' | 'network';
      cause?: Error;
    }
  ): EnhancedError {
    const error = new Error(message) as EnhancedError;

    error.id = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    error.code = options?.code || 'GENERIC_ERROR';
    error.severity = options?.severity || 'medium';
    error.category = options?.category || 'unknown';
    error.timestamp = Date.now();
    error.context = options?.context;
    error.recoverable = options?.recoverable ?? true;
    error.userMessage = options?.userMessage || message;
    error.technicalMessage = message;
    error.retryable = options?.retryable ?? false;
    error.source = options?.source || 'client';

    if (options?.cause) {
      error.cause = options.cause;
      error.stack = options.cause.stack;
    }

    return error;
  }

  static fromApiError(
    status: number,
    message: string,
    code?: string,
    endpoint?: string
  ): EnhancedError {
    const severity: ErrorSeverity = status >= 500 ? 'high' : status >= 400 ? 'medium' : 'low';
    const category: ErrorCategory =
      status === 401 ? 'authentication' :
      status === 403 ? 'authorization' :
      status >= 400 && status < 500 ? 'validation' :
      status >= 500 ? 'system' : 'network';

    return ErrorFactory.create(message, {
      code: code || `HTTP_${status}`,
      severity,
      category,
      context: { endpoint, status },
      retryable: status >= 500 || status === 408 || status === 429,
      source: 'server',
      userMessage: status >= 500
        ? 'Something went wrong on our end. Please try again later.'
        : message,
    });
  }

  static fromNetworkError(originalError: Error): EnhancedError {
    return ErrorFactory.create(originalError.message, {
      code: 'NETWORK_ERROR',
      severity: 'high',
      category: 'network',
      retryable: true,
      source: 'network',
      userMessage: 'Network connection failed. Please check your internet connection and try again.',
      cause: originalError,
    });
  }

  static fromValidationError(
    field: string,
    message: string,
    value?: any
  ): EnhancedError {
    return ErrorFactory.create(`Validation failed for ${field}: ${message}`, {
      code: 'VALIDATION_ERROR',
      severity: 'low',
      category: 'validation',
      context: { field, value },
      recoverable: true,
      retryable: false,
      userMessage: message,
    });
  }
}

// ============================================================================
// ERROR MONITOR
// ============================================================================

export class ErrorMonitor {
  private static instance: ErrorMonitor;
  private config: ErrorHandlerConfig;
  private errors: Map<string, EnhancedError> = new Map();
  private listeners: Set<(error: EnhancedError) => void> = new Set();

  private constructor(config: ErrorHandlerConfig = {}) {
    this.config = {
      maxRetries: 3,
      retryDelay: 1000,
      enableNotifications: true,
      enableLogging: true,
      enableTelemetry: process.env.NODE_ENV === 'production',
      ...config,
    };
  }

  static getInstance(config?: ErrorHandlerConfig): ErrorMonitor {
    if (!ErrorMonitor.instance) {
      ErrorMonitor.instance = new ErrorMonitor(config);
    }
    return ErrorMonitor.instance;
  }

  captureError(error: EnhancedError, context?: ErrorContext) {
    // Store error
    if (error.id) {
      this.errors.set(error.id, error);
    }

    // Log error
    if (this.config.enableLogging) {
      this.logError(error, context);
    }

    // Send telemetry
    if (this.config.enableTelemetry) {
      this.sendTelemetry(error, context);
    }

    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(error);
      } catch (listenerError) {
        console.error('Error listener failed:', listenerError);
      }
    });

    // Call config callback
    if (this.config.onError) {
      try {
        this.config.onError(error, context || {});
      } catch (callbackError) {
        console.error('Error callback failed:', callbackError);
      }
    }
  }

  subscribe(listener: (error: EnhancedError) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getError(id: string): EnhancedError | undefined {
    return this.errors.get(id);
  }

  getRecentErrors(count = 10): EnhancedError[] {
    return Array.from(this.errors.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, count);
  }

  clearError(id: string): boolean {
    return this.errors.delete(id);
  }

  clearAllErrors(): void {
    this.errors.clear();
  }

  private logError(error: EnhancedError, context?: ErrorContext) {
    const logLevel = error.severity === 'critical' ? 'error' :
                    error.severity === 'high' ? 'error' :
                    error.severity === 'medium' ? 'warn' : 'info';

    console[logLevel](`[ErrorMonitor] ${error.category}/${error.code}: ${error.message}`, {
      error,
      context,
      stack: error.stack,
    });
  }

  private sendTelemetry(error: EnhancedError, context?: ErrorContext) {
    // Implementation would send to telemetry service (e.g., Sentry, LogRocket)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: error.severity === 'critical',
        error_code: error.code,
        error_category: error.category,
      });
    }
  }
}

// ============================================================================
// COMMON RECOVERY STRATEGIES
// ============================================================================

export const commonRecoveryStrategies = {
  retry: (action: () => Promise<void> | void, delay = 1000): ErrorRecoveryStrategy => ({
    name: 'retry',
    description: 'Retry the operation',
    action: async () => {
      await new Promise(resolve => setTimeout(resolve, delay));
      await action();
    },
    automatic: false,
    priority: 1,
  }),

  refresh: (): ErrorRecoveryStrategy => ({
    name: 'refresh',
    description: 'Refresh the page',
    action: () => {
      window.location.reload();
    },
    automatic: false,
    priority: 2,
  }),

  goBack: (): ErrorRecoveryStrategy => ({
    name: 'goBack',
    description: 'Go back to the previous page',
    action: () => {
      if (typeof window !== 'undefined' && window.history.length > 1) {
        window.history.back();
      }
    },
    automatic: false,
    priority: 3,
  }),

  resetState: (resetFn: () => void): ErrorRecoveryStrategy => ({
    name: 'resetState',
    description: 'Reset application state',
    action: resetFn,
    automatic: false,
    priority: 4,
  }),

  logout: (logoutFn: () => void): ErrorRecoveryStrategy => ({
    name: 'logout',
    description: 'Log out and return to login',
    action: logoutFn,
    automatic: false,
    priority: 5,
  }),
};

// ============================================================================
// ERROR BOUNDARY COMPONENT
// ============================================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: EnhancedError; retry: () => void }>;
  onError?: (error: EnhancedError, errorInfo: ErrorInfo) => void;
  recoveryStrategies?: ErrorRecoveryStrategy[];
  maxRetries?: number;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private errorMonitor: ErrorMonitor;
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.errorMonitor = ErrorMonitor.getInstance();

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      lastRetry: null,
      recoveryStrategies: props.recoveryStrategies || [
        commonRecoveryStrategies.retry(() => this.retry()),
        commonRecoveryStrategies.refresh(),
      ],
    };

    this.retry = this.retry.bind(this);
    this.executeRecoveryStrategy = this.executeRecoveryStrategy.bind(this);
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const enhancedError = error instanceof Error && 'severity' in error
      ? error as EnhancedError
      : ErrorFactory.create(error.message, {
          severity: 'high',
          category: 'system',
          recoverable: true,
          cause: error,
        });

    return {
      hasError: true,
      error: enhancedError,
      errorId: enhancedError.id || null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const enhancedError = this.state.error || ErrorFactory.create(error.message, {
      severity: 'high',
      category: 'system',
      cause: error,
    });

    this.setState({ errorInfo });

    // Capture error with monitor
    this.errorMonitor.captureError(enhancedError, {
      component: this.constructor.name,
      action: 'render',
      metadata: {
        componentStack: errorInfo.componentStack,
      },
    });

    // Call props callback
    if (this.props.onError) {
      this.props.onError(enhancedError, errorInfo);
    }
  }

  retry() {
    if (this.state.retryCount >= (this.props.maxRetries || 3)) {
      return;
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: prevState.retryCount + 1,
      lastRetry: new Date(),
    }));
  }

  async executeRecoveryStrategy(strategy: ErrorRecoveryStrategy) {
    try {
      await strategy.action();

      if (this.errorMonitor && this.state.error) {
        this.errorMonitor.captureError(
          ErrorFactory.create('Recovery strategy executed', {
            severity: 'low',
            category: 'system',
            context: { strategy: strategy.name },
          })
        );
      }
    } catch (recoveryError) {
      console.error(`Recovery strategy ${strategy.name} failed:`, recoveryError);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback;

      if (FallbackComponent) {
        return <FallbackComponent error={this.state.error} retry={this.retry} />;
      }

      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error.userMessage || this.state.error.message}</p>

          <div className="error-actions">
            {this.state.recoveryStrategies.map((strategy, index) => (
              <button
                key={strategy.name}
                onClick={() => this.executeRecoveryStrategy(strategy)}
                className="error-recovery-button"
              >
                {strategy.description}
              </button>
            ))}
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="error-details">
              <summary>Error Details (Development Only)</summary>
              <pre>{JSON.stringify(this.state.error, null, 2)}</pre>
              {this.state.errorInfo && (
                <pre>{this.state.errorInfo.componentStack}</pre>
              )}
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// ERROR CONTEXT AND PROVIDER
// ============================================================================

interface ErrorContextValue {
  errors: EnhancedError[];
  addError: (error: EnhancedError) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
  retryError: (id: string, action: () => Promise<void> | void) => void;
}

const ErrorContext = createContext<ErrorContextValue | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
  maxErrors?: number;
}

export function ErrorProvider({ children, maxErrors = 10 }: ErrorProviderProps) {
  const [errors, setErrors] = useState<EnhancedError[]>([]);
  const errorMonitor = ErrorMonitor.getInstance();

  useEffect(() => {
    const unsubscribe = errorMonitor.subscribe((error) => {
      setErrors(prev => {
        const newErrors = [error, ...prev].slice(0, maxErrors);
        return newErrors;
      });
    });

    return unsubscribe;
  }, [errorMonitor, maxErrors]);

  const addError = useCallback((error: EnhancedError) => {
    errorMonitor.captureError(error);
  }, [errorMonitor]);

  const removeError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
    errorMonitor.clearError(id);
  }, [errorMonitor]);

  const clearErrors = useCallback(() => {
    setErrors([]);
    errorMonitor.clearAllErrors();
  }, [errorMonitor]);

  const retryError = useCallback(async (id: string, action: () => Promise<void> | void) => {
    try {
      await action();
      removeError(id);
    } catch (error) {
      const retryError = ErrorFactory.create('Retry failed', {
        severity: 'medium',
        category: 'system',
        context: { originalErrorId: id },
        cause: error instanceof Error ? error : new Error(String(error)),
      });
      addError(retryError);
    }
  }, [addError, removeError]);

  const contextValue: ErrorContextValue = {
    errors,
    addError,
    removeError,
    clearErrors,
    retryError,
  };

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
    </ErrorContext.Provider>
  );
}

// ============================================================================
// ERROR HOOKS
// ============================================================================

export function useErrorHandler() {
  const context = useContext(ErrorContext);

  if (!context) {
    throw new Error('useErrorHandler must be used within an ErrorProvider');
  }

  return context;
}

export function useFormErrorHandler(formId: string) {
  const { addError, removeError } = useErrorHandler();

  const handleFormError = useCallback((error: Error | string, field?: string) => {
    const enhancedError = typeof error === 'string'
      ? ErrorFactory.fromValidationError(field || 'form', error)
      : ErrorFactory.create(error.message, {
          severity: 'low',
          category: 'validation',
          context: { formId, field },
          cause: error,
        });

    addError(enhancedError);
    return enhancedError.id;
  }, [addError, formId]);

  const clearFormErrors = useCallback(() => {
    // Implementation would filter and remove form-specific errors
    // This is a simplified version
  }, []);

  return {
    handleFormError,
    clearFormErrors,
  };
}

export function useAsyncErrorHandler() {
  const { addError } = useErrorHandler();

  const handleAsyncError = useCallback(
    <T,>(promise: Promise<T>, context?: Partial<ErrorContext>): Promise<T> => {
      return promise.catch((error) => {
        const enhancedError = error instanceof Error
          ? ErrorFactory.create(error.message, {
              severity: 'medium',
              category: 'system',
              context: context?.metadata,
              cause: error,
            })
          : ErrorFactory.create('Unknown async error', {
              severity: 'medium',
              category: 'unknown',
              context: { ...context?.metadata, originalError: error },
            });

        addError(enhancedError);
        throw enhancedError;
      });
    },
    [addError]
  );

  return { handleAsyncError };
}

// ============================================================================
// QUERY CLIENT ERROR INTEGRATION
// ============================================================================

export function createErrorHandlingQueryClient(
  errorHandler?: (error: EnhancedError) => void
): QueryClient {
  const errorMonitor = ErrorMonitor.getInstance();

  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount: number, error: Error): boolean => {
          const enhancedError = ErrorFactory.fromNetworkError(error as Error);

          if (errorHandler) {
            errorHandler(enhancedError);
          } else {
            errorMonitor.captureError(enhancedError);
          }

          return Boolean(enhancedError.retryable) && failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        onError: (error) => {
          const enhancedError = error instanceof Error
            ? ErrorFactory.create(error.message, {
                severity: 'medium',
                category: 'network',
                retryable: false,
                cause: error,
              })
            : ErrorFactory.create('Mutation failed', {
                severity: 'medium',
                category: 'unknown',
              });

          if (errorHandler) {
            errorHandler(enhancedError);
          } else {
            errorMonitor.captureError(enhancedError);
          }
        },
      },
    },
  });
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  ErrorFactory,
  ErrorMonitor,
  ErrorBoundary,
  ErrorProvider,
  useErrorHandler,
  useFormErrorHandler,
  useAsyncErrorHandler,
  createErrorHandlingQueryClient,
  commonRecoveryStrategies,
};