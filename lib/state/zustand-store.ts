/**
 * @fileoverview HT-021.3.3: Core State Management Infrastructure - Zustand Implementation
 * @module lib/state/zustand-store
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-021.3.3 - State Management Foundation
 * Focus: Core state management infrastructure with Zustand and React Query
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: MEDIUM (state architecture)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import { OptimisticAction } from './optimistic-updates';

// ============================================================================
// CORE STATE TYPES
// ============================================================================

export interface AppState {
  // UI State
  ui: {
    theme: 'light' | 'dark' | 'system';
    sidebar: {
      isOpen: boolean;
      activeSection: string | null;
    };
    modals: Record<string, boolean>;
    notifications: Notification[];
  };
  
  // User State
  user: {
    isAuthenticated: boolean;
    profile: UserProfile | null;
    preferences: UserPreferences;
    permissions: string[];
  };
  
  // Application Data
  data: {
    heroTasks: HeroTask[];
    designTokens: DesignToken[];
    components: Component[];
    cache: Record<string, any>;
  };
  
  // Form State
  forms: Record<string, FormState>;
  
  // Error State
  errors: {
    global: AppError[];
    form: Record<string, FormError[]>;
    api: Record<string, ApiError>;
  };
  
  // Optimistic Updates
  optimistic: {
    actions: OptimisticAction[];
  };
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  duration?: number;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };
}

export interface HeroTask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  metadata: Record<string, any>;
  workflow_phase?: string;
}

export interface DesignToken {
  id: string;
  name: string;
  value: string;
  type: 'color' | 'spacing' | 'typography' | 'shadow' | 'border';
  category: string;
  description?: string;
}

export interface Component {
  id: string;
  name: string;
  type: 'atom' | 'molecule' | 'organism' | 'template';
  props: Record<string, any>;
  variants: ComponentVariant[];
  documentation?: string;
}

export interface ComponentVariant {
  name: string;
  props: Record<string, any>;
  description?: string;
}

export interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValidating: boolean;
  isDirty: boolean;
}

export interface AppError {
  id: string;
  message: string;
  code?: string;
  timestamp: number;
  context?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface FormError {
  field: string;
  message: string;
  code?: string;
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  timestamp: number;
  endpoint?: string;
  context?: Record<string, any>;
}

// ============================================================================
// STORE ACTIONS
// ============================================================================

export interface AppActions {
  // UI Actions
  setTheme: (theme: AppState['ui']['theme']) => void;
  toggleSidebar: () => void;
  setSidebarSection: (section: string | null) => void;
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // User Actions
  setAuthenticated: (isAuthenticated: boolean) => void;
  setProfile: (profile: UserProfile | null) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  setPermissions: (permissions: string[]) => void;
  
  // Data Actions
  setHeroTasks: (tasks: HeroTask[]) => void;
  addHeroTask: (task: HeroTask) => void;
  updateHeroTask: (id: string, updates: Partial<HeroTask>) => void;
  removeHeroTask: (id: string) => void;
  setDesignTokens: (tokens: DesignToken[]) => void;
  updateDesignToken: (id: string, updates: Partial<DesignToken>) => void;
  setComponents: (components: Component[]) => void;
  updateComponent: (id: string, updates: Partial<Component>) => void;
  setCache: (key: string, value: any) => void;
  clearCache: (key?: string) => void;
  
  // Form Actions
  initializeForm: (formId: string, initialValues?: Record<string, any>) => void;
  setFormValue: (formId: string, field: string, value: any) => void;
  setFormValues: (formId: string, values: Record<string, any>) => void;
  setFormError: (formId: string, field: string, error: string) => void;
  setFormErrors: (formId: string, errors: Record<string, string>) => void;
  clearFormErrors: (formId: string) => void;
  setFormTouched: (formId: string, field: string, touched: boolean) => void;
  setFormSubmitting: (formId: string, isSubmitting: boolean) => void;
  setFormValidating: (formId: string, isValidating: boolean) => void;
  resetForm: (formId: string) => void;
  destroyForm: (formId: string) => void;
  
  // Error Actions
  addGlobalError: (error: Omit<AppError, 'id' | 'timestamp'>) => void;
  removeGlobalError: (id: string) => void;
  clearGlobalErrors: () => void;
  addFormError: (formId: string, error: FormError) => void;
  clearFormErrorState: (formId: string) => void;
  setApiError: (endpoint: string, error: ApiError) => void;
  clearApiError: (endpoint: string) => void;
  clearAllErrors: () => void;
  
  // Optimistic Actions
  optimistic: {
    actions: OptimisticAction[];
    addAction: (action: Omit<OptimisticAction, 'id' | 'timestamp' | 'status'>) => string;
    updateActionStatus: (id: string, status: OptimisticAction['status']) => void;
    removeAction: (id: string) => void;
    clearActions: () => void;
    getActionsByEntity: (entity: string) => OptimisticAction[];
    getPendingActions: () => OptimisticAction[];
    getErrorActions: () => OptimisticAction[];
  };
  
  // Utility Actions
  reset: () => void;
  hydrate: (state: Partial<AppState>) => void;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: AppState = {
  ui: {
    theme: 'system',
    sidebar: {
      isOpen: true,
      activeSection: null,
    },
    modals: {},
    notifications: [],
  },
  user: {
    isAuthenticated: false,
    profile: null,
    preferences: {
      theme: 'system',
      language: 'en',
      timezone: 'UTC',
      notifications: {
        email: true,
        push: true,
        desktop: true,
      },
    },
    permissions: [],
  },
  data: {
    heroTasks: [],
    designTokens: [],
    components: [],
    cache: {},
  },
  forms: {},
  errors: {
    global: [],
    form: {},
    api: {},
  },
  optimistic: {
    actions: [],
  },
};

// ============================================================================
// MAIN STORE
// ============================================================================

export const useAppStore = create<AppState & AppActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,
        
        // UI Actions
        setTheme: (theme) => set((state) => {
          state.ui.theme = theme;
          state.user.preferences.theme = theme;
        }),
        
        toggleSidebar: () => set((state) => {
          state.ui.sidebar.isOpen = !state.ui.sidebar.isOpen;
        }),
        
        setSidebarSection: (section) => set((state) => {
          state.ui.sidebar.activeSection = section;
        }),
        
        openModal: (modalId) => set((state) => {
          state.ui.modals[modalId] = true;
        }),
        
        closeModal: (modalId) => set((state) => {
          state.ui.modals[modalId] = false;
        }),
        
        addNotification: (notification) => set((state) => {
          const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          state.ui.notifications.push({
            ...notification,
            id,
            timestamp: Date.now(),
          });
        }),
        
        removeNotification: (id) => set((state) => {
          const index = state.ui.notifications.findIndex(n => n.id === id);
          if (index !== -1) {
            state.ui.notifications.splice(index, 1);
          }
        }),
        
        clearNotifications: () => set((state) => {
          state.ui.notifications = [];
        }),
        
        // User Actions
        setAuthenticated: (isAuthenticated) => set((state) => {
          state.user.isAuthenticated = isAuthenticated;
          if (!isAuthenticated) {
            state.user.profile = null;
            state.user.permissions = [];
          }
        }),
        
        setProfile: (profile) => set((state) => {
          state.user.profile = profile;
        }),
        
        updatePreferences: (preferences) => set((state) => {
          Object.assign(state.user.preferences, preferences);
        }),
        
        setPermissions: (permissions) => set((state) => {
          state.user.permissions = permissions;
        }),
        
        // Data Actions
        setHeroTasks: (tasks) => set((state) => {
          state.data.heroTasks = tasks;
        }),
        
        addHeroTask: (task) => set((state) => {
          state.data.heroTasks.push(task);
        }),
        
        updateHeroTask: (id, updates) => set((state) => {
          const index = state.data.heroTasks.findIndex(t => t.id === id);
          if (index !== -1) {
            Object.assign(state.data.heroTasks[index], updates, { updatedAt: new Date().toISOString() });
          }
        }),
        
        removeHeroTask: (id) => set((state) => {
          const index = state.data.heroTasks.findIndex(t => t.id === id);
          if (index !== -1) {
            state.data.heroTasks.splice(index, 1);
          }
        }),
        
        setDesignTokens: (tokens) => set((state) => {
          state.data.designTokens = tokens;
        }),
        
        updateDesignToken: (id, updates) => set((state) => {
          const index = state.data.designTokens.findIndex(t => t.id === id);
          if (index !== -1) {
            Object.assign(state.data.designTokens[index], updates);
          }
        }),
        
        setComponents: (components) => set((state) => {
          state.data.components = components;
        }),
        
        updateComponent: (id, updates) => set((state) => {
          const index = state.data.components.findIndex(c => c.id === id);
          if (index !== -1) {
            Object.assign(state.data.components[index], updates);
          }
        }),
        
        setCache: (key, value) => set((state) => {
          state.data.cache[key] = value;
        }),
        
        clearCache: (key) => set((state) => {
          if (key) {
            delete state.data.cache[key];
          } else {
            state.data.cache = {};
          }
        }),
        
        // Form Actions
        initializeForm: (formId, initialValues = {}) => set((state) => {
          state.forms[formId] = {
            values: initialValues,
            errors: {},
            touched: {},
            isSubmitting: false,
            isValidating: false,
            isDirty: false,
          };
        }),
        
        setFormValue: (formId, field, value) => set((state) => {
          if (state.forms[formId]) {
            state.forms[formId].values[field] = value;
            state.forms[formId].isDirty = true;
            // Clear error when value changes
            if (state.forms[formId].errors[field]) {
              delete state.forms[formId].errors[field];
            }
          }
        }),
        
        setFormValues: (formId, values) => set((state) => {
          if (state.forms[formId]) {
            Object.assign(state.forms[formId].values, values);
            state.forms[formId].isDirty = true;
          }
        }),
        
        setFormError: (formId, field, error) => set((state) => {
          if (state.forms[formId]) {
            state.forms[formId].errors[field] = error;
          }
        }),
        
        setFormErrors: (formId, errors) => set((state) => {
          if (state.forms[formId]) {
            state.forms[formId].errors = errors;
          }
        }),
        
        clearFormErrors: (formId) => set((state) => {
          if (state.forms[formId]) {
            state.forms[formId].errors = {};
          }
        }),
        
        setFormTouched: (formId, field, touched) => set((state) => {
          if (state.forms[formId]) {
            state.forms[formId].touched[field] = touched;
          }
        }),
        
        setFormSubmitting: (formId, isSubmitting) => set((state) => {
          if (state.forms[formId]) {
            state.forms[formId].isSubmitting = isSubmitting;
          }
        }),
        
        setFormValidating: (formId, isValidating) => set((state) => {
          if (state.forms[formId]) {
            state.forms[formId].isValidating = isValidating;
          }
        }),
        
        resetForm: (formId) => set((state) => {
          if (state.forms[formId]) {
            state.forms[formId] = {
              values: {},
              errors: {},
              touched: {},
              isSubmitting: false,
              isValidating: false,
              isDirty: false,
            };
          }
        }),
        
        destroyForm: (formId) => set((state) => {
          delete state.forms[formId];
        }),
        
        // Error Actions
        addGlobalError: (error) => set((state) => {
          const id = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          state.errors.global.push({
            ...error,
            id,
            timestamp: Date.now(),
          });
        }),
        
        removeGlobalError: (id) => set((state) => {
          const index = state.errors.global.findIndex(e => e.id === id);
          if (index !== -1) {
            state.errors.global.splice(index, 1);
          }
        }),
        
        clearGlobalErrors: () => set((state) => {
          state.errors.global = [];
        }),
        
        addFormError: (formId, error) => set((state) => {
          if (!state.errors.form[formId]) {
            state.errors.form[formId] = [];
          }
          state.errors.form[formId].push(error);
        }),
        
        clearFormErrorState: (formId) => set((state) => {
          state.errors.form[formId] = [];
        }),
        
        setApiError: (endpoint, error) => set((state) => {
          state.errors.api[endpoint] = error;
        }),
        
        clearApiError: (endpoint) => set((state) => {
          delete state.errors.api[endpoint];
        }),
        
        clearAllErrors: () => set((state) => {
          state.errors = {
            global: [],
            form: {},
            api: {},
          };
        }),
        
        // Optimistic Actions
        optimistic: {
          actions: [], // This will be populated from initialState
          addAction: (action) => {
            const id = `optimistic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const optimisticAction: OptimisticAction = {
              ...action,
              id,
              timestamp: Date.now(),
              status: 'pending',
            };
            set((state) => {
              state.optimistic.actions.push(optimisticAction);
            });
            return id;
          },
          
          updateActionStatus: (id, status) => set((state) => {
            const action = state.optimistic.actions.find(a => a.id === id);
            if (action) {
              action.status = status;
            }
          }),
          
          removeAction: (id) => set((state) => {
            const index = state.optimistic.actions.findIndex(a => a.id === id);
            if (index !== -1) {
              state.optimistic.actions.splice(index, 1);
            }
          }),
          
          clearActions: () => set((state) => {
            state.optimistic.actions = [];
          }),
          
          getActionsByEntity: (entity) => {
            const state = get();
            return state.optimistic.actions.filter(a => a.entity === entity);
          },
          
          getPendingActions: () => {
            const state = get();
            return state.optimistic.actions.filter(a => a.status === 'pending');
          },
          
          getErrorActions: () => {
            const state = get();
            return state.optimistic.actions.filter(a => a.status === 'error');
          },
        },
        
        // Utility Actions
        reset: () => set(() => ({ ...initialState })),
        
        hydrate: (partialState) => set((state) => {
          Object.assign(state, partialState);
        }),
      })),
      {
        name: 'app-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          ui: {
            theme: state.ui.theme,
            sidebar: state.ui.sidebar,
          },
          user: {
            preferences: state.user.preferences,
          },
        }),
      }
    ),
    {
      name: 'app-store',
    }
  )
);

// ============================================================================
// STORE SELECTORS
// ============================================================================

export const useUIStore = () => useAppStore((state) => ({
  ...state.ui,
  ...state.ui,
}));

export const useUserStore = () => useAppStore((state) => ({
  ...state.user,
  ...state.user,
}));

export const useDataStore = () => useAppStore((state) => ({
  ...state.data,
  ...state.data,
}));

export const useFormStore = (formId: string) => useAppStore((state) => ({
  form: state.forms[formId],
  ...state.forms,
}));

export const useErrorStore = () => useAppStore((state) => ({
  ...state.errors,
  ...state.errors,
}));

// ============================================================================
// UTILITY HOOKS
// ============================================================================

export const useNotifications = () => {
  const notifications = useAppStore((state) => state.ui.notifications);
  const addNotification = useAppStore((state) => state.addNotification);
  const removeNotification = useAppStore((state) => state.removeNotification);
  const clearNotifications = useAppStore((state) => state.clearNotifications);
  
  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  };
};

export const useAuth = () => {
  const user = useAppStore((state) => state.user);
  const setAuthenticated = useAppStore((state) => state.setAuthenticated);
  const setProfile = useAppStore((state) => state.setProfile);
  
  return {
    isAuthenticated: user.isAuthenticated,
    profile: user.profile,
    permissions: user.permissions,
    setAuthenticated,
    setProfile,
  };
};

export const useTheme = () => {
  const theme = useAppStore((state) => state.ui.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  
  return {
    theme,
    setTheme,
  };
};

export default useAppStore;