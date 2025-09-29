/**
 * Module Status Checker
 * Real-time status checking for HT-035 integrated modules
 */

export interface ModuleStatus {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'error' | 'maintenance';
  health: 'healthy' | 'degraded' | 'critical';
  lastChecked: Date;
  metrics?: Record<string, any>;
}

export interface OrchestrationStatus {
  active: number;
  total: number;
  lastRun?: string;
  status: 'healthy' | 'warning' | 'error';
}

export interface ModuleRegistryStatus {
  installed: number;
  available: number;
  pendingActivation: number;
  status: 'operational' | 'syncing' | 'error';
}

export interface MarketplaceMetrics {
  totalInstalls: number;
  activeListings: number;
  monthlyRevenue: number;
  status: 'active' | 'maintenance' | 'offline';
}

export interface HandoverProgress {
  inProgress: number;
  completed: number;
  totalPackages: number;
  completionRate: number;
  status: 'active' | 'idle' | 'error';
}

/**
 * Check orchestration module status
 */
export async function checkOrchestrationStatus(): Promise<OrchestrationStatus> {
  try {
    const response = await fetch('/api/orchestration/status', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      return await response.json();
    }

    return {
      active: 0,
      total: 0,
      status: 'error'
    };
  } catch (error) {
    console.error('Failed to check orchestration status:', error);
    return {
      active: 0,
      total: 0,
      status: 'error'
    };
  }
}

/**
 * Check module registry status
 */
export async function checkModuleRegistryStatus(): Promise<ModuleRegistryStatus> {
  try {
    const response = await fetch('/api/modules/registry-status', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      return await response.json();
    }

    return {
      installed: 0,
      available: 0,
      pendingActivation: 0,
      status: 'error'
    };
  } catch (error) {
    console.error('Failed to check module registry status:', error);
    return {
      installed: 0,
      available: 0,
      pendingActivation: 0,
      status: 'error'
    };
  }
}

/**
 * Check marketplace metrics
 */
export async function checkMarketplaceMetrics(): Promise<MarketplaceMetrics> {
  try {
    const response = await fetch('/api/marketplace/metrics', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      return await response.json();
    }

    return {
      totalInstalls: 0,
      activeListings: 0,
      monthlyRevenue: 0,
      status: 'offline'
    };
  } catch (error) {
    console.error('Failed to check marketplace metrics:', error);
    return {
      totalInstalls: 0,
      activeListings: 0,
      monthlyRevenue: 0,
      status: 'offline'
    };
  }
}

/**
 * Check handover progress
 */
export async function checkHandoverProgress(): Promise<HandoverProgress> {
  try {
    const response = await fetch('/api/handover/progress', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      return await response.json();
    }

    return {
      inProgress: 0,
      completed: 0,
      totalPackages: 0,
      completionRate: 0,
      status: 'error'
    };
  } catch (error) {
    console.error('Failed to check handover progress:', error);
    return {
      inProgress: 0,
      completed: 0,
      totalPackages: 0,
      completionRate: 0,
      status: 'error'
    };
  }
}

/**
 * Check all HT-035 module statuses
 */
export async function checkAllModuleStatuses(): Promise<{
  orchestration: OrchestrationStatus;
  modules: ModuleRegistryStatus;
  marketplace: MarketplaceMetrics;
  handover: HandoverProgress;
}> {
  const [orchestration, modules, marketplace, handover] = await Promise.all([
    checkOrchestrationStatus(),
    checkModuleRegistryStatus(),
    checkMarketplaceMetrics(),
    checkHandoverProgress()
  ]);

  return {
    orchestration,
    modules,
    marketplace,
    handover
  };
}

/**
 * Get overall health status for all modules
 */
export function getOverallHealth(statuses: {
  orchestration: OrchestrationStatus;
  modules: ModuleRegistryStatus;
  marketplace: MarketplaceMetrics;
  handover: HandoverProgress;
}): 'healthy' | 'degraded' | 'critical' {
  const hasError =
    statuses.orchestration.status === 'error' ||
    statuses.modules.status === 'error' ||
    statuses.marketplace.status === 'offline' ||
    statuses.handover.status === 'error';

  const hasWarning =
    statuses.orchestration.status === 'warning' ||
    statuses.modules.status === 'syncing' ||
    statuses.marketplace.status === 'maintenance';

  if (hasError) return 'critical';
  if (hasWarning) return 'degraded';
  return 'healthy';
}