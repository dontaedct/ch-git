import { ModuleRegistry } from '@/types/config'

// Client-safe module configuration
// This version doesn't use Node.js APIs like fs/promises

export async function getBaseModuleRegistry(): Promise<ModuleRegistry> {
  // For client components, we'll return a default empty registry
  // The actual configuration should be loaded via server actions or API routes
  return { modules: [] }
}

export async function getBaseConfigClient(): Promise<Record<string, unknown>> {
  // For client components, we'll return an empty config
  // The actual configuration should be loaded via server actions or API routes
  return {}
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
