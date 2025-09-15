/**
 * @fileoverview HT-021.3.3: State Management Foundation - Main Export Module
 * @module lib/state/index
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-021.3.3 - State Management Foundation
 * Focus: Unified state management system exports
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: LOW (aggregation module)
 */

// ============================================================================
// IMPORTS FOR INTERNAL USE
// ============================================================================

import { createQueryClient, QueryProvider } from './react-query-setup';
import { ErrorMonitor, ErrorBoundary, ErrorProvider } from './error-handling';
import { createPersistentStorage } from './persistence';
import { useAppStore } from './zustand-store';
import type { StorageBackend } from './persistence';

// ============================================================================
// CORE STATE MANAGEMENT EXPORTS
// ============================================================================

// Zustand Store
export {
  useAppStore,
  useUIStore,
  useUserStore,
  useDataStore,
  useFormStore,
  useErrorStore,
  useNotifications,
  useAuth,
  useTheme,
} from './zustand-store';

export type {
  AppState,
  AppActions,
  Notification,
  UserProfile,
  UserPreferences,
  HeroTask,
  DesignToken,
  Component,
  ComponentVariant,
  FormState,
  AppError,
  FormError,
} from './zustand-store';

// ============================================================================
// REACT QUERY INTEGRATION EXPORTS
// ============================================================================

// React Query Setup
export {
  QueryProvider,
  createQueryClient,
  apiClient,
  queryKeys,
  ApiClient,
  ApiError,
} from './react-query-setup';

// Hero Tasks Hooks
export {
  useHeroTasks,
  useHeroTask,
  useCreateHeroTask,
  useUpdateHeroTask,
  useDeleteHeroTask,
} from './react-query-setup';

// Design Tokens Hooks
export {
  useDesignTokens,
  useUpdateDesignToken,
} from './react-query-setup';

// Components Hooks
export {
  useComponents,
} from './react-query-setup';

// User Hooks
export {
  useUserProfile,
  useUpdateUserPreferences,
} from './react-query-setup';

// Utility Hooks
export {
  useOptimisticMutation,
  usePrefetchQuery,
} from './react-query-setup';

// ============================================================================
// OPTIMISTIC UPDATES EXPORTS
// ============================================================================

// Core Optimistic Updates
export {
  useOptimisticUpdate,
  useBatchOptimisticUpdate,
  useOptimisticStatus,
  useConflictResolution,
  useOfflineOptimisticUpdate,
} from './optimistic-updates';

// Entity-Specific Optimistic Hooks
export {
  useOptimisticCreateHeroTask,
  useOptimisticUpdateHeroTask,
  useOptimisticDeleteHeroTask,
  useOptimisticUpdateDesignToken,
  useOptimisticUpdateComponent,
} from './optimistic-updates';

export type {
  OptimisticAction,
  OptimisticState,
  OptimisticUpdateConfig,
} from './optimistic-updates';

// ============================================================================
// ERROR HANDLING EXPORTS
// ============================================================================

// Error Components and Providers
export {
  ErrorBoundary,
  ErrorProvider,
} from './error-handling';

// Error Hooks
export {
  useErrorHandler,
  useFormErrorHandler,
  useAsyncErrorHandler,
} from './error-handling';

// Error Utilities
export {
  ErrorFactory,
  ErrorMonitor,
  createErrorHandlingQueryClient,
  commonRecoveryStrategies,
} from './error-handling';

export type {
  EnhancedError,
  ErrorHandlerConfig,
  ErrorBoundaryState,
  ErrorRecoveryStrategy,
  ErrorSeverity,
  ErrorCategory,
  ErrorContext,
} from './error-handling';

// ============================================================================
// PERSISTENCE EXPORTS
// ============================================================================

// Storage Management
export {
  StorageManager,
  createPersistentStorage,
  createPartitionedStorage,
  defaultStorageConfigs,
} from './persistence';

// Storage Adapters are already exported above

export type {
  StorageBackend,
  StorageConfig,
  StorageAdapter,
  StorageItem,
  PersistenceMetadata,
} from './persistence';

// ============================================================================
// LEGACY STATE MANAGEMENT EXPORTS (for compatibility)
// ============================================================================

// Legacy architecture state management (if needed for migration)
export {
  StateStoreImpl,
  EventDrivenStateManager,
  StateSynchronizer,
  createStateContext,
  StateProvider,
  useStateContext,
  createSelector,
  createAction,
  createAsyncAction,
  combineReducers,
  createLoggerMiddleware,
  createThunkMiddleware,
  createPersistMiddleware,
} from '../architecture/state-management';

export type {
  StateAction,
  StateReducer,
  StateStore,
  StateListener,
  StateSelector,
  StateMiddleware,
  StateContextValue,
  StateProviderProps,
  StateEvent,
  StateEventHandler,
  StateSyncConfig,
} from '../architecture/state-management';

// ============================================================================
// UTILITY FUNCTIONS AND CONSTANTS
// ============================================================================

/**
 * Initialize the complete state management system
 */
export function initializeStateManagement(config?: {
  queryClient?: any;
  storageConfig?: Record<string, any>;
  errorMonitoring?: boolean;
}) {
  const queryClient = config?.queryClient || createQueryClient();
  
  // Initialize error monitoring
  if (config?.errorMonitoring !== false) {
    ErrorMonitor.getInstance();
  }
  
  // Initialize storage if custom config provided
  if (config?.storageConfig) {
    // Storage initialization would be handled by individual stores
  }
  
  return {
    queryClient,
  };
}

/**
 * State management configuration presets
 */
export const stateManagementPresets = {
  development: {
    queryClient: {
      defaultOptions: {
        queries: { staleTime: 0, gcTime: 0 },
        mutations: { retry: false },
      },
    },
    storageConfig: {
      backend: 'memory' as StorageBackend,
      encryption: false,
      compression: false,
    },
    errorMonitoring: true,
  },
  
  production: {
    queryClient: {
      defaultOptions: {
        queries: { staleTime: 5 * 60 * 1000, gcTime: 10 * 60 * 1000 },
        mutations: { retry: 1 },
      },
    },
    storageConfig: {
      backend: 'hybrid' as StorageBackend,
      encryption: true,
      compression: true,
    },
    errorMonitoring: true,
  },
  
  testing: {
    queryClient: {
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    },
    storageConfig: {
      backend: 'memory' as StorageBackend,
      encryption: false,
      compression: false,
    },
    errorMonitoring: false,
  },
} as const;

/**
 * Get state management preset by environment
 */
export function getStateManagementPreset(env: 'development' | 'production' | 'testing' = 'development') {
  return stateManagementPresets[env];
}

// ============================================================================
// VERSION INFORMATION
// ============================================================================

export const STATE_MANAGEMENT_VERSION = '1.0.0';
export const SUPPORTED_FEATURES = [
  'zustand-store',
  'react-query-integration',
  'optimistic-updates',
  'error-handling',
  'persistence',
  'offline-support',
  'type-safety',
  'performance-optimization',
] as const;

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  // Core
  useAppStore,
  QueryProvider,
  ErrorBoundary,
  ErrorProvider,
  
  // Utilities
  initializeStateManagement,
  getStateManagementPreset,
  createQueryClient,
  createPersistentStorage,
  
  // Constants
  STATE_MANAGEMENT_VERSION,
  SUPPORTED_FEATURES,
};