/**
 * HT-021 Foundation Architecture: State Management Types
 * 
 * Core interfaces for state management and data flow
 * Part of the foundation layer that supports all Hero Tasks
 */

export interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  lastRetry: Date | null;
}

export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
  errorBoundaryStack?: string;
}

export interface CacheConfig {
  staleTime: number;
  cacheTime: number;
  refetchOnWindowFocus: boolean;
  refetchOnReconnect: boolean | 'always';
  retry: number | ((failureCount: number, error: any) => boolean);
}

export interface QueryConfig extends CacheConfig {
  queryKey: string[];
  queryFn: () => Promise<any>;
  enabled?: boolean;
  suspense?: boolean;
}

export interface MutationConfig {
  mutationFn: (variables: any) => Promise<any>;
  onMutate?: (variables: any) => Promise<any>;
  onError?: (error: any, variables: any, context: any) => void;
  onSuccess?: (data: any, variables: any, context: any) => void;
  onSettled?: (data: any, error: any, variables: any, context: any) => void;
  retry?: number | ((failureCount: number, error: any) => boolean);
}

export interface StateBoundary {
  id: string;
  type: 'global' | 'module' | 'component';
  scope: string[];
  dependencies: string[];
  isolation: boolean;
}

export interface StateContext {
  boundary: StateBoundary;
  cache: Map<string, any>;
  subscriptions: Set<string>;
  errorState?: ErrorState;
}
