/**
 * @fileoverview Application State Management Hook
 * Centralized state management for the entire application
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { UserRole } from '@/lib/auth/permissions';

interface AppState {
  // User & Authentication
  user: {
    id: string;
    email: string;
    name?: string;
    role: UserRole;
    status: 'active' | 'inactive';
    lastActive: string;
  } | null;
  
  // App Configuration
  app: {
    id: string;
    name: string;
    slug: string;
    status: 'sandbox' | 'production' | 'disabled';
    environment: 'development' | 'staging' | 'production';
    template_id: string;
    admin_email: string;
    submissions_count: number;
    documents_count: number;
    last_activity_at: string;
  } | null;
  
  // UI State
  ui: {
    theme: 'light' | 'dark' | 'system';
    sidebarOpen: boolean;
    activeTab: string;
    notifications: Notification[];
    loading: boolean;
    error: string | null;
  };
  
  // Data State
  data: {
    submissions: any[];
    documents: any[];
    users: any[];
    stats: {
      totalSubmissions: number;
      totalDocuments: number;
      totalUsers: number;
      conversionRate: number;
    };
  };
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

const initialState: AppState = {
  user: null,
  app: null,
  ui: {
    theme: 'system',
    sidebarOpen: false,
    activeTab: 'overview',
    notifications: [],
    loading: false,
    error: null
  },
  data: {
    submissions: [],
    documents: [],
    users: [],
    stats: {
      totalSubmissions: 0,
      totalDocuments: 0,
      totalUsers: 0,
      conversionRate: 0
    }
  }
};

export function useAppState() {
  const [state, setState] = useState<AppState>(initialState);

  // User Management
  const setUser = useCallback((user: AppState['user']) => {
    setState(prev => ({ ...prev, user }));
  }, []);

  const updateUserRole = useCallback((role: UserRole) => {
    setState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, role } : null
    }));
  }, []);

  // App Management
  const setApp = useCallback((app: AppState['app']) => {
    setState(prev => ({ ...prev, app }));
  }, []);

  const updateAppStatus = useCallback((status: AppState['app']['status']) => {
    setState(prev => ({
      ...prev,
      app: prev.app ? { ...prev.app, status } : null
    }));
  }, []);

  // UI Management
  const setTheme = useCallback((theme: AppState['ui']['theme']) => {
    setState(prev => ({ ...prev, ui: { ...prev.ui, theme } }));
  }, []);

  const setSidebarOpen = useCallback((open: boolean) => {
    setState(prev => ({ ...prev, ui: { ...prev.ui, sidebarOpen: open } }));
  }, []);

  const setActiveTab = useCallback((tab: string) => {
    setState(prev => ({ ...prev, ui: { ...prev.ui, activeTab: tab } }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, ui: { ...prev.ui, loading } }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, ui: { ...prev.ui, error } }));
  }, []);

  // Notification Management
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false
    };
    
    setState(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        notifications: [...prev.ui.notifications, newNotification]
      }
    }));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        notifications: prev.ui.notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        )
      }
    }));
  }, []);

  const clearNotifications = useCallback(() => {
    setState(prev => ({
      ...prev,
      ui: { ...prev.ui, notifications: [] }
    }));
  }, []);

  // Data Management
  const setSubmissions = useCallback((submissions: any[]) => {
    setState(prev => ({ ...prev, data: { ...prev.data, submissions } }));
  }, []);

  const addSubmission = useCallback((submission: any) => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        submissions: [...prev.data.submissions, submission]
      }
    }));
  }, []);

  const setDocuments = useCallback((documents: any[]) => {
    setState(prev => ({ ...prev, data: { ...prev.data, documents } }));
  }, []);

  const addDocument = useCallback((document: any) => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        documents: [...prev.data.documents, document]
      }
    }));
  }, []);

  const setUsers = useCallback((users: any[]) => {
    setState(prev => ({ ...prev, data: { ...prev.data, users } }));
  }, []);

  const updateUser = useCallback((userId: string, updates: Partial<any>) => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        users: prev.data.users.map(user => 
          user.id === userId ? { ...user, ...updates } : user
        )
      }
    }));
  }, []);

  const setStats = useCallback((stats: AppState['data']['stats']) => {
    setState(prev => ({ ...prev, data: { ...prev.data, stats } }));
  }, []);

  // Computed Values
  const permissions = useMemo(() => {
    if (!state.user?.role) return {};

    return {
      canRead: true,
      canWrite: state.user.role !== 'viewer',
      canDelete: state.user.role === 'admin',
      canManageUsers: state.user.role === 'admin',
      canManageSettings: state.user.role === 'admin'
    };
  }, [state.user?.role]);

  const isAdmin = useMemo(() => {
    return state.user?.role === 'admin';
  }, [state.user?.role]);

  const isOwner = useMemo(() => {
    // In the new 3-role system, admin is the highest role
    return state.user?.role === 'admin';
  }, [state.user?.role]);

  const unreadNotifications = useMemo(() => {
    return state.ui.notifications.filter(n => !n.read).length;
  }, [state.ui.notifications]);

  // Actions
  const actions = {
    // User actions
    setUser,
    updateUserRole,
    
    // App actions
    setApp,
    updateAppStatus,
    
    // UI actions
    setTheme,
    setSidebarOpen,
    setActiveTab,
    setLoading,
    setError,
    
    // Notification actions
    addNotification,
    markNotificationRead,
    clearNotifications,
    
    // Data actions
    setSubmissions,
    addSubmission,
    setDocuments,
    addDocument,
    setUsers,
    updateUser,
    setStats,
    
    // Utility actions
    reset: () => setState(initialState)
  };

  return {
    state,
    permissions,
    isAdmin,
    isOwner,
    unreadNotifications,
    actions
  };
}
