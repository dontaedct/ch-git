/**
 * Configuration Service
 * 
 * Manages micro-app configuration with base config and overrides
 */

import { MicroAppConfig } from '@/types/config'

interface ConfigOverride {
  id: string
  label: string
  description: string
  active: boolean
  value: unknown
  path: string
}

// Base configuration (demo data)
const BASE_CONFIG: Partial<MicroAppConfig> = {
  id: 'brandless-consultation',
  name: 'Brandless Consultation Engine',
  version: '1.0.0',
  theme: {
    colors: {
      primary: '#007AFF',
      neutral: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827'
      }
    },
    typography: {
      fontFamily: 'system-ui, sans-serif',
      scales: {
        display: '2.5rem',
        headline: '1.5rem',
        body: '1rem',
        caption: '0.875rem'
      }
    },
    motion: {
      duration: '150ms',
      easing: 'cubic-bezier(.2,.8,.2,1)'
    },
    radii: {
      sm: '4px',
      md: '8px',
      lg: '12px'
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
    }
  }
}

// Mock active overrides
const ACTIVE_OVERRIDES: ConfigOverride[] = [
  {
    id: 'primary-color',
    label: 'Primary Color',
    description: 'Brand primary color override',
    active: true,
    value: '#007AFF',
    path: 'theme.colors.primary'
  },
  {
    id: 'webhook-endpoint',
    label: 'N8N Webhook',
    description: 'Custom webhook endpoint configuration',
    active: Boolean(process.env.N8N_WEBHOOK_URL),
    value: process.env.N8N_WEBHOOK_URL ?? 'Not configured',
    path: 'integrations.n8n.webhookUrl'
  },
  {
    id: 'safe-mode',
    label: 'Safe Mode',
    description: 'Development safe mode bypass',
    active: process.env.NEXT_PUBLIC_SAFE_MODE === '1',
    value: process.env.NEXT_PUBLIC_SAFE_MODE === '1',
    path: 'global.safeMode'
  }
]

export interface DashboardStats {
  consultationsToday: number
  activeBookingLink: string | null
  catalogInUse: string
  lastConsultationGenerated: string | null
  systemStatus: 'operational' | 'degraded' | 'down'
}

/**
 * Get current configuration with overrides applied
 */
export function getCurrentConfig(): Partial<MicroAppConfig> {
  return BASE_CONFIG
}

/**
 * Get base configuration without overrides
 */
export function getBaseConfig(): Partial<MicroAppConfig> {
  return BASE_CONFIG
}

/**
 * Get active configuration overrides
 */
export function getActiveOverrides(): ConfigOverride[] {
  return ACTIVE_OVERRIDES.filter(override => override.active)
}

/**
 * Get all possible overrides (active and inactive)
 */
export function getAllOverrides(): ConfigOverride[] {
  return ACTIVE_OVERRIDES
}

/**
 * Check if any overrides are active
 */
export function hasActiveOverrides(): boolean {
  return ACTIVE_OVERRIDES.some(override => override.active)
}

/**
 * Get dashboard statistics
 */
export function getDashboardStats(): DashboardStats {
  return {
    consultationsToday: 0, // This would come from database
    activeBookingLink: process.env.NEXT_PUBLIC_BOOKING_URL ?? null,
    catalogInUse: 'Default Plan Catalog',
    lastConsultationGenerated: null, // This would come from database
    systemStatus: 'operational'
  }
}

/**
 * Revert to base configuration (mock implementation)
 */
export async function revertToBaseConfig(): Promise<{ success: boolean; message: string }> {
  // In a real implementation, this would:
  // 1. Clear environment variable overrides
  // 2. Reset database configuration
  // 3. Reload application config
  
  return {
    success: true,
    message: 'Configuration reverted to base settings. Note: This is a demo implementation.'
  }
}