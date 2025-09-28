/**
 * Enhanced Tenant Apps Hooks - React hooks for comprehensive tenant app management
 * Part of Phase 1.2 Database Schema & State Management
 */

import { useState, useEffect, useCallback } from 'react';
import { TenantApp, CreateTenantAppRequest, UpdateTenantAppRequest, TenantAppStats } from '@/types/tenant-apps';

interface UseTenantAppsReturn {
  apps: TenantApp[];
  loading: boolean;
  error: string | null;
  createApp: (data: CreateTenantAppRequest) => Promise<TenantApp>;
  updateApp: (data: UpdateTenantAppRequest) => Promise<TenantApp>;
  deleteApp: (id: string) => Promise<void>;
  archiveApp: (id: string) => Promise<TenantApp>;
  restoreApp: (id: string) => Promise<TenantApp>;
  duplicateApp: (id: string, newName: string, newAdminEmail: string) => Promise<TenantApp>;
  toggleAppStatus: (id: string, status: 'sandbox' | 'production' | 'disabled') => Promise<TenantApp>;
  refreshApps: (includeArchived?: boolean) => Promise<void>;
}

export function useTenantApps(): UseTenantAppsReturn {
  const [apps, setApps] = useState<TenantApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApps = useCallback(async (includeArchived = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const url = includeArchived ? '/api/tenant-apps?include_archived=true' : '/api/tenant-apps';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch tenant apps');
      }
      
      const data = await response.json();
      setApps(data.apps || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const createApp = useCallback(async (data: CreateTenantAppRequest): Promise<TenantApp> => {
    try {
      const response = await fetch('/api/tenant-apps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create tenant app');
      }
      
      const result = await response.json();
      setApps(prev => [result.app, ...prev]);
      return result.app;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, []);

  const updateApp = useCallback(async (data: UpdateTenantAppRequest): Promise<TenantApp> => {
    try {
      const response = await fetch('/api/tenant-apps', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update tenant app');
      }
      
      const result = await response.json();
      setApps(prev => prev.map(app => app.id === data.id ? result.app : app));
      return result.app;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, []);

  const deleteApp = useCallback(async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/tenant-apps/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete tenant app');
      }
      
      setApps(prev => prev.filter(app => app.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, []);

  const archiveApp = useCallback(async (id: string): Promise<TenantApp> => {
    try {
      const response = await fetch(`/api/tenant-apps/${id}/archive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'archive' }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to archive tenant app');
      }
      
      const result = await response.json();
      setApps(prev => prev.map(app => app.id === id ? result.app : app));
      return result.app;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, []);

  const restoreApp = useCallback(async (id: string): Promise<TenantApp> => {
    try {
      const response = await fetch(`/api/tenant-apps/${id}/archive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'restore' }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to restore tenant app');
      }
      
      const result = await response.json();
      setApps(prev => prev.map(app => app.id === id ? result.app : app));
      return result.app;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, []);

  const duplicateApp = useCallback(async (id: string, newName: string, newAdminEmail: string): Promise<TenantApp> => {
    try {
      const response = await fetch(`/api/tenant-apps/${id}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'duplicate',
          new_name: newName,
          new_admin_email: newAdminEmail,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to duplicate tenant app');
      }
      
      const result = await response.json();
      setApps(prev => [result.app, ...prev]);
      return result.app;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, []);

  const toggleAppStatus = useCallback(async (id: string, status: 'sandbox' | 'production' | 'disabled'): Promise<TenantApp> => {
    try {
      const response = await fetch(`/api/tenant-apps/${id}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'toggle-status',
          status,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update tenant app status');
      }
      
      const result = await response.json();
      setApps(prev => prev.map(app => app.id === id ? result.app : app));
      return result.app;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, []);

  const refreshApps = useCallback(async (includeArchived = false) => {
    await fetchApps(includeArchived);
  }, [fetchApps]);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  return {
    apps,
    loading,
    error,
    createApp,
    updateApp,
    deleteApp,
    archiveApp,
    restoreApp,
    duplicateApp,
    toggleAppStatus,
    refreshApps,
  };
}

interface UseTenantAppStatsReturn {
  stats: TenantAppStats | null;
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
}

export function useTenantAppStats(): UseTenantAppStatsReturn {
  const [stats, setStats] = useState<TenantAppStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/tenant-apps/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch tenant app stats');
      }
      
      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStats = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refreshStats,
  };
}


