'use server'

import { getBaseConfigExport } from '@/lib/config/modules'
import { createServerSupabase } from '@/lib/supabase/server'

export async function getRuntimeConfigWithOverrides(clientId?: string) {
  const baseConfig = await getBaseConfigExport()
  
  if (!clientId) {
    return baseConfig
  }
  
  try {
    // Import the server-side Supabase client
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
    const baseModules = baseConfigTyped.modules as { modules: Array<{ id: string }> }
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
