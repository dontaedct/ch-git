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

export async function getBaseConfigExport(): Promise<Record<string, unknown>> {
  const config = await getBaseConfig()
  return config as Record<string, unknown>
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