import { ModuleRegistry } from '@/types/config'
import { getRuntimeConfigWithOverrides } from '@/lib/modules/runtime-config-actions'

// Client-safe module configuration
// This version doesn't use Node.js APIs like fs/promises

export async function getBaseModuleRegistry(): Promise<ModuleRegistry> {
  // Use server action to get config data
  try {
    const config = await getRuntimeConfigWithOverrides()
    return (config.modules as ModuleRegistry) ?? { modules: [] }
  } catch (error) {
    console.error('Failed to load base module registry from server:', error)
    return { modules: [] }
  }
}

export async function getBaseConfigClient(): Promise<Record<string, unknown>> {
  // Use server action to get config data
  try {
    const config = await getRuntimeConfigWithOverrides()
    return config
  } catch (error) {
    console.error('Failed to load base config from server:', error)
    return {}
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
