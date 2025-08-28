import { ModuleRegistry } from '@/types/config'
import fs from 'fs/promises'
import path from 'path'

// Cache for base configuration
let baseConfigCache: unknown = null

async function getBaseConfig() {
  if (baseConfigCache) {
    return baseConfigCache
  }
  
  try {
    const configPath = path.join(process.cwd(), 'configs', 'microapps', 'base.microapp.json')
    const configData = await fs.readFile(configPath, 'utf-8')
    baseConfigCache = JSON.parse(configData)
    return baseConfigCache
  } catch (error) {
    console.error('Failed to load base configuration:', error)
    throw new Error('Failed to load base configuration')
  }
}

export async function getBaseModuleRegistry(): Promise<ModuleRegistry> {
  const config = await getBaseConfig() as Record<string, unknown>
  return (config.modules as ModuleRegistry) ?? { modules: [] }
}

export async function getRuntimeConfig(clientId?: string) {
  const baseConfig = await getBaseConfig()
  
  if (!clientId) {
    return baseConfig
  }
  
  try {
    // Import the server-side Supabase client
    const { createServerSupabase } = await import('@/lib/supabase/server')
    const supabase = await createServerSupabase()
    
    // Get client overrides
    const { data: overrides } = await supabase
      .from('client_app_overrides')
      .select('*')
      .eq('client_id', clientId)
      .single()
    
    if (!overrides) {
      return baseConfig
    }
    
    // Merge overrides with base config
    const baseConfigTyped = baseConfig as Record<string, unknown>
    const baseModules = baseConfigTyped.modules as ModuleRegistry
    const mergedConfig: Record<string, unknown> = {
      ...baseConfigTyped,
      modules: {
        ...baseModules,
        modules: baseModules.modules.filter(module => 
          overrides.modules_enabled.includes(module.id)
        )
      }
    }
    
    // Apply other overrides if present
    if (overrides.theme_overrides && Object.keys(overrides.theme_overrides).length > 0) {
      mergedConfig.theme = { ...mergedConfig.theme as Record<string, unknown>, ...overrides.theme_overrides }
    }
    
    if (overrides.consultation_config && Object.keys(overrides.consultation_config).length > 0) {
      mergedConfig.consultation = { ...mergedConfig.consultation as Record<string, unknown>, ...overrides.consultation_config }
    }
    
    if (overrides.plan_catalog_overrides && Object.keys(overrides.plan_catalog_overrides).length > 0) {
      mergedConfig.catalog = { ...mergedConfig.catalog as Record<string, unknown>, ...overrides.plan_catalog_overrides }
    }

    // Apply new catalog overrides if present
    if (overrides.catalog_overrides && Object.keys(overrides.catalog_overrides).length > 0) {
      const baseCatalog = mergedConfig.catalog as { plans: Array<Record<string, unknown>> }
      if (baseCatalog?.plans) {
        const mergedPlans = baseCatalog.plans.map((plan: Record<string, unknown>) => {
          const planOverride = overrides.catalog_overrides[plan.id as string]
          if (!planOverride) return plan
          
          return {
            ...plan,
            ...(planOverride.title && { title: planOverride.title }),
            ...(planOverride.includes && { includes: planOverride.includes }),
            ...(planOverride.priceBand && { priceBand: planOverride.priceBand })
          }
        })
        
        mergedConfig.catalog = {
          ...baseCatalog,
          plans: mergedPlans
        }
      }
    }
    
    return mergedConfig
  } catch (error) {
    console.error('Failed to get runtime config:', error)
    return baseConfig
  }
}

export function getEnabledModuleIds(modules: ModuleRegistry, enabledIds?: string[]): string[] {
  if (!enabledIds) {
    return modules.modules.map(m => m.id)
  }
  
  return modules.modules
    .filter(m => enabledIds.includes(m.id))
    .map(m => m.id)
}

export function filterPlanIncludes(planIncludes: string[], enabledModuleIds: string[], moduleRegistry: ModuleRegistry): string[] {
  // This is a simplified implementation - in a real scenario you'd have more sophisticated
  // mapping between modules and plan includes
  const moduleLabels = moduleRegistry.modules
    .filter(m => enabledModuleIds.includes(m.id))
    .map(m => m.label.toLowerCase())
  
  // Filter plan includes to only show those related to enabled modules
  return planIncludes.filter(include => {
    const includeLower = include.toLowerCase()
    return moduleLabels.some(label => 
      includeLower.includes(label) || 
      includeLower.includes('basic') || // Always include basic items
      includeLower.includes('initial') ||
      includeLower.includes('core') ||
      includeLower.includes('support')
    )
  })
}