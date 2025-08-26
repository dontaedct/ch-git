/**
 * Feature Flags Server Utilities
 * 
 * Provides server-side feature flag management with in-memory caching
 * and edge-safe fetchers. Never leaks server keys to client.
 */

import { createServerClient } from '@lib/supabase/server';
import type { FeatureFlag } from '@lib/supabase/types';

// In-memory cache with TTL
interface CacheEntry {
  data: FeatureFlag[];
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry>();
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get a single feature flag for a tenant
 */
export async function getFlag(
  tenantId: string, 
  key: string,
  options: { ttl?: number; bypassCache?: boolean } = {}
): Promise<boolean> {
  const { ttl = DEFAULT_TTL, bypassCache = false } = options;
  
  try {
    // Check cache first (unless bypassed)
    if (!bypassCache) {
      const cached = getCachedFlags(tenantId, ttl);
      if (cached) {
        const flag = cached.find(f => f.key === key);
        return flag?.enabled ?? false;
      }
    }

    // Fetch from database
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('feature_flags')
      .select('enabled')
      .eq('tenant_id', tenantId)
      .eq('key', key)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching feature flag:', error);
      return false;
    }

    const enabled = data?.enabled ?? false;
    
    // Update cache
    updateCache(tenantId, [{ key, enabled, payload: {}, tenant_id: tenantId, id: '', created_at: new Date().toISOString() }], ttl);
    
    return enabled;
  } catch (error) {
    console.error('Error in getFlag:', error);
    return false;
  }
}

/**
 * Get all feature flags for a tenant
 */
export async function getAllFlags(
  tenantId: string,
  options: { ttl?: number; bypassCache?: boolean } = {}
): Promise<FeatureFlag[]> {
  const { ttl = DEFAULT_TTL, bypassCache = false } = options;
  
  try {
    // Check cache first (unless bypassed)
    if (!bypassCache) {
      const cached = getCachedFlags(tenantId, ttl);
      if (cached) {
        return cached;
      }
    }

    // Fetch from database
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('key');

    if (error) {
      console.error('Error fetching feature flags:', error);
      return [];
    }

    const flags = data ?? [];
    
    // Update cache
    updateCache(tenantId, flags, ttl);
    
    return flags;
  } catch (error) {
    console.error('Error in getAllFlags:', error);
    return [];
  }
}

/**
 * Get flags as a key-value map for easier access
 */
export async function getFlagsMap(
  tenantId: string,
  options: { ttl?: number; bypassCache?: boolean } = {}
): Promise<Record<string, boolean>> {
  const flags = await getAllFlags(tenantId, options);
  return flags.reduce((acc, flag) => {
    acc[flag.key] = flag.enabled;
    return acc;
  }, {} as Record<string, boolean>);
}

/**
 * Set a feature flag (admin only)
 */
export async function setFlag(
  tenantId: string,
  key: string,
  enabled: boolean,
  payload: Record<string, unknown> = {}
): Promise<boolean> {
  try {
    const supabase = await createServerClient();
    
    // Upsert the flag
    const { error } = await supabase
      .from('feature_flags')
      .upsert({
        tenant_id: tenantId,
        key,
        enabled,
        payload,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error setting feature flag:', error);
      return false;
    }

    // Invalidate cache
    cache.delete(tenantId);
    
    return true;
  } catch (error) {
    console.error('Error in setFlag:', error);
    return false;
  }
}

/**
 * Bulk set multiple flags (admin only)
 */
export async function setFlags(
  tenantId: string,
  flags: Array<{ key: string; enabled: boolean; payload?: Record<string, unknown> }>
): Promise<boolean> {
  try {
    const supabase = await createServerClient();
    
    const flagData = flags.map(flag => ({
      tenant_id: tenantId,
      key: flag.key,
      enabled: flag.enabled,
      payload: flag.payload ?? {},
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('feature_flags')
      .upsert(flagData);

    if (error) {
      console.error('Error setting feature flags:', error);
      return false;
    }

    // Invalidate cache
    cache.delete(tenantId);
    
    return true;
  } catch (error) {
    console.error('Error in setFlags:', error);
    return false;
  }
}

/**
 * Check if user is admin (for admin-only operations)
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('auth.users')
      .select('raw_user_meta_data')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return false;
    }

    return data.raw_user_meta_data?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Get cached flags if they exist and are not expired
 */
function getCachedFlags(tenantId: string, _ttl: number): FeatureFlag[] | null {
  const entry = cache.get(tenantId);
  if (!entry) {
    return null;
  }

  const now = Date.now();
  if (now - entry.timestamp > entry.ttl) {
    cache.delete(tenantId);
    return null;
  }

  return entry.data;
}

/**
 * Update cache with new data
 */
function updateCache(tenantId: string, flags: FeatureFlag[], ttl: number): void {
  cache.set(tenantId, {
    data: flags,
    timestamp: Date.now(),
    ttl
  });
}

/**
 * Clear cache for a specific tenant
 */
export function clearCache(tenantId: string): void {
  cache.delete(tenantId);
}

/**
 * Clear all cache
 */
export function clearAllCache(): void {
  cache.clear();
}

/**
 * Get cache statistics (for debugging)
 */
export function getCacheStats(): { size: number; entries: string[] } {
  return {
    size: cache.size,
    entries: Array.from(cache.keys())
  };
}

/**
 * Edge-safe flag checker (for use in edge functions)
 * Uses direct database query without caching for edge compatibility
 */
export async function getFlagEdge(tenantId: string, key: string): Promise<boolean> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('feature_flags')
      .select('enabled')
      .eq('tenant_id', tenantId)
      .eq('key', key)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching feature flag in edge:', error);
      return false;
    }

    return data?.enabled ?? false;
  } catch (error) {
    console.error('Error in getFlagEdge:', error);
    return false;
  }
}
