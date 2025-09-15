/**
 * @fileoverview HT-021.3.3: React Query Setup and Configuration
 * @module lib/state/react-query-setup
 * @author OSS Hero System
 * @version 1.0.0
 *
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-021.3.3 - State Management Foundation
 * Focus: React Query setup for server state management
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: MEDIUM (server state management)
 */

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React, { ReactNode } from 'react';
import type { HeroTask, DesignToken, Component, UserProfile } from './zustand-store';

// ============================================================================
// API CLIENT CONFIGURATION
// ============================================================================

export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL = '/api', defaultHeaders: Record<string, string> = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          response.status,
          errorData.message || response.statusText,
          errorData.code,
          endpoint
        );
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      } else {
        return response.text() as T;
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        0,
        error instanceof Error ? error.message : 'Network error',
        'NETWORK_ERROR',
        endpoint
      );
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const searchParams = params ? new URLSearchParams(params).toString() : '';
    const url = searchParams ? `${endpoint}?${searchParams}` : endpoint;
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string,
    public endpoint?: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
    this.timestamp = Date.now();
  }

  timestamp: number;
}

// Global API client instance
export const apiClient = new ApiClient();

// ============================================================================
// QUERY KEYS FACTORY
// ============================================================================

export const queryKeys = {
  // Hero Tasks
  heroTasks: {
    all: ['heroTasks'] as const,
    lists: () => [...queryKeys.heroTasks.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.heroTasks.lists(), filters] as const,
    details: () => [...queryKeys.heroTasks.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.heroTasks.details(), id] as const,
  },

  // Design Tokens
  designTokens: {
    all: ['designTokens'] as const,
    lists: () => [...queryKeys.designTokens.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.designTokens.lists(), filters] as const,
    details: () => [...queryKeys.designTokens.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.designTokens.details(), id] as const,
  },

  // Components
  components: {
    all: ['components'] as const,
    lists: () => [...queryKeys.components.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.components.lists(), filters] as const,
    details: () => [...queryKeys.components.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.components.details(), id] as const,
  },

  // User
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    preferences: () => [...queryKeys.user.all, 'preferences'] as const,
  },
} as const;

// ============================================================================
// QUERY CLIENT CONFIGURATION
// ============================================================================

export function createQueryClient(options?: {
  defaultStaleTime?: number;
  defaultGcTime?: number;
  retry?: number | ((failureCount: number, error: Error) => boolean);
  retryDelay?: number | ((retryAttempt: number) => number);
}) {
  const {
    defaultStaleTime = 5 * 60 * 1000, // 5 minutes
    defaultGcTime = 10 * 60 * 1000,   // 10 minutes
    retry = 1,
    retryDelay = (retryAttempt: number) => Math.min(1000 * 2 ** retryAttempt, 30000),
  } = options || {};

  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: defaultStaleTime,
        gcTime: defaultGcTime,
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors (client errors)
          if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
            return false;
          }

          if (typeof retry === 'function') {
            return retry(failureCount, error);
          }

          return failureCount < retry;
        },
        retryDelay,
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
      },
      mutations: {
        retry: 0, // Don't retry mutations by default
        onError: (error) => {
          console.error('Mutation error:', error);
        },
      },
    },
  });
}

// ============================================================================
// QUERY PROVIDER COMPONENT
// ============================================================================

interface QueryProviderProps {
  children: ReactNode;
  client?: QueryClient;
  showDevtools?: boolean;
}

export function QueryProvider({
  children,
  client,
  showDevtools = process.env.NODE_ENV === 'development'
}: QueryProviderProps) {
  const queryClient = client || createQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {showDevtools && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

// ============================================================================
// HERO TASKS HOOKS
// ============================================================================

export function useHeroTasks(filters?: any) {
  return useQuery({
    queryKey: queryKeys.heroTasks.list(filters || {}),
    queryFn: () => apiClient.get<HeroTask[]>('/hero-tasks', filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useHeroTask(id: string) {
  return useQuery({
    queryKey: queryKeys.heroTasks.detail(id),
    queryFn: () => apiClient.get<HeroTask>(`/hero-tasks/${id}`),
    enabled: !!id,
  });
}

export function useCreateHeroTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<HeroTask, 'id' | 'createdAt' | 'updatedAt'>) =>
      apiClient.post<HeroTask>('/hero-tasks', data),
    onSuccess: (newTask) => {
      // Update the list cache
      queryClient.setQueryData<HeroTask[]>(
        queryKeys.heroTasks.lists(),
        (old) => old ? [...old, newTask] : [newTask]
      );

      // Add to detail cache
      queryClient.setQueryData(
        queryKeys.heroTasks.detail(newTask.id),
        newTask
      );
    },
    onError: (error) => {
      console.error('Failed to create hero task:', error);
    },
  });
}

export function useUpdateHeroTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<HeroTask>) =>
      apiClient.patch<HeroTask>(`/hero-tasks/${id}`, data),
    onSuccess: (updatedTask) => {
      // Update list caches
      queryClient.setQueriesData<HeroTask[]>(
        { queryKey: queryKeys.heroTasks.lists() },
        (old) => old ? old.map(task =>
          task.id === updatedTask.id ? updatedTask : task
        ) : [updatedTask]
      );

      // Update detail cache
      queryClient.setQueryData(
        queryKeys.heroTasks.detail(updatedTask.id),
        updatedTask
      );
    },
    onError: (error) => {
      console.error('Failed to update hero task:', error);
    },
  });
}

export function useDeleteHeroTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete<{ id: string }>(`/hero-tasks/${id}`),
    onSuccess: (_, deletedId) => {
      // Remove from list caches
      queryClient.setQueriesData<HeroTask[]>(
        { queryKey: queryKeys.heroTasks.lists() },
        (old) => old ? old.filter(task => task.id !== deletedId) : []
      );

      // Remove detail cache
      queryClient.removeQueries({
        queryKey: queryKeys.heroTasks.detail(deletedId)
      });
    },
    onError: (error) => {
      console.error('Failed to delete hero task:', error);
    },
  });
}

// ============================================================================
// DESIGN TOKENS HOOKS
// ============================================================================

export function useDesignTokens(filters?: any) {
  return useQuery({
    queryKey: queryKeys.designTokens.list(filters || {}),
    queryFn: () => apiClient.get<DesignToken[]>('/design-tokens', filters),
    staleTime: 10 * 60 * 1000, // 10 minutes (tokens change less frequently)
  });
}

export function useUpdateDesignToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<DesignToken>) =>
      apiClient.patch<DesignToken>(`/design-tokens/${id}`, data),
    onSuccess: (updatedToken) => {
      // Update list caches
      queryClient.setQueriesData<DesignToken[]>(
        { queryKey: queryKeys.designTokens.lists() },
        (old) => old ? old.map(token =>
          token.id === updatedToken.id ? updatedToken : token
        ) : [updatedToken]
      );

      // Update detail cache
      queryClient.setQueryData(
        queryKeys.designTokens.detail(updatedToken.id),
        updatedToken
      );
    },
    onError: (error) => {
      console.error('Failed to update design token:', error);
    },
  });
}

// ============================================================================
// COMPONENTS HOOKS
// ============================================================================

export function useComponents(filters?: any) {
  return useQuery({
    queryKey: queryKeys.components.list(filters || {}),
    queryFn: () => apiClient.get<Component[]>('/components', filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// USER HOOKS
// ============================================================================

export function useUserProfile() {
  return useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: () => apiClient.get<UserProfile>('/user/profile'),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useUpdateUserPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preferences: Partial<UserProfile>) =>
      apiClient.patch<UserProfile>('/user/preferences', preferences),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(queryKeys.user.profile(), updatedProfile);
    },
    onError: (error) => {
      console.error('Failed to update user preferences:', error);
    },
  });
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

export function useOptimisticMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onMutate?: (variables: TVariables) => any;
    onError?: (error: Error, variables: TVariables, context: any) => void;
    onSuccess?: (data: TData, variables: TVariables, context: any) => void;
  }
) {
  return useMutation({
    mutationFn,
    ...options,
  });
}

export function usePrefetchQuery<TData = unknown>(
  queryKey: any[],
  queryFn: () => Promise<TData>,
  options?: { staleTime?: number }
) {
  const queryClient = useQueryClient();

  return React.useCallback(
    () => {
      return queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime: options?.staleTime || 5 * 60 * 1000,
      });
    },
    [queryClient, queryKey, queryFn, options?.staleTime]
  );
}

// ============================================================================
// ERROR HANDLING QUERY CLIENT
// ============================================================================

export function createErrorHandlingQueryClient(
  errorHandler?: (error: Error) => void
) {
  return createQueryClient({
    retry: (failureCount, error) => {
      // Call error handler if provided
      if (errorHandler) {
        errorHandler(error);
      }

      // Don't retry on client errors
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        return false;
      }

      return failureCount < 2;
    },
  });
}

// ============================================================================
// DEVELOPMENT HELPERS
// ============================================================================

export function getQueryClientState(queryClient: QueryClient) {
  if (process.env.NODE_ENV === 'development') {
    return {
      queries: queryClient.getQueryCache().getAll().map(query => ({
        queryKey: query.queryKey,
        state: query.state,
        isStale: query.isStale(),
        isInvalidated: query.state.isInvalidated,
      })),
      mutations: queryClient.getMutationCache().getAll().map(mutation => ({
        mutationKey: mutation.options.mutationKey,
        state: mutation.state,
      })),
    };
  }
  return null;
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  QueryProvider,
  createQueryClient,
  createErrorHandlingQueryClient,
  apiClient,
  ApiClient,
  ApiError,
  queryKeys,

  // Hooks
  useHeroTasks,
  useHeroTask,
  useCreateHeroTask,
  useUpdateHeroTask,
  useDeleteHeroTask,
  useDesignTokens,
  useUpdateDesignToken,
  useComponents,
  useUserProfile,
  useUpdateUserPreferences,
  useOptimisticMutation,
  usePrefetchQuery,

  // Utilities
  getQueryClientState,
};