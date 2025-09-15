/**
 * HT-022.3.1: Basic Module Registry & Management System
 *
 * Simple module registry with activation capabilities, basic dependency management,
 * and simple version control for agency micro-app toolkit.
 */

import { ModuleRegistry } from '@/types/config'
import { lifecycleManager } from './module-lifecycle'
import { configManager } from './module-config'

export interface ModuleInfo {
  id: string
  label: string
  description?: string
  version: string
  status: 'active' | 'inactive' | 'pending'
  dependencies: string[]
  tiers?: Array<'foundation' | 'growth' | 'enterprise'>
  activatedAt?: Date
  lastUpdated: Date
}

export interface ModuleActivationRequest {
  moduleId: string
  tenantId?: string
  config?: Record<string, unknown>
}

export interface ModuleActivationResult {
  success: boolean
  moduleId: string
  status: 'active' | 'failed' | 'dependency_missing'
  message: string
  dependencyErrors?: string[]
}

class BasicModuleRegistry {
  private modules: Map<string, ModuleInfo> = new Map()
  private activeModules: Map<string, Set<string>> = new Map() // tenantId -> moduleIds

  constructor() {
    this.initializeDefaultModules()
  }

  private initializeDefaultModules() {
    const defaultModules: Omit<ModuleInfo, 'lastUpdated'>[] = [
      {
        id: 'questionnaire-engine',
        label: 'Questionnaire Engine',
        description: 'Core questionnaire functionality',
        version: '1.0.0',
        status: 'active',
        dependencies: [],
        tiers: ['foundation', 'growth', 'enterprise']
      },
      {
        id: 'consultation-generator',
        label: 'Consultation Generator',
        description: 'AI-powered consultation report generation',
        version: '1.0.0',
        status: 'active',
        dependencies: ['questionnaire-engine'],
        tiers: ['growth', 'enterprise']
      },
      {
        id: 'theme-customizer',
        label: 'Theme Customizer',
        description: 'Client branding and theme customization',
        version: '1.0.0',
        status: 'active',
        dependencies: [],
        tiers: ['foundation', 'growth', 'enterprise']
      },
      {
        id: 'email-integration',
        label: 'Email Integration',
        description: 'Email service and template management',
        version: '1.0.0',
        status: 'inactive',
        dependencies: ['consultation-generator'],
        tiers: ['growth', 'enterprise']
      },
      {
        id: 'analytics-basic',
        label: 'Basic Analytics',
        description: 'Simple usage tracking and metrics',
        version: '1.0.0',
        status: 'inactive',
        dependencies: [],
        tiers: ['foundation', 'growth', 'enterprise']
      }
    ]

    defaultModules.forEach(module => {
      this.modules.set(module.id, {
        ...module,
        lastUpdated: new Date()
      })
    })
  }

  registerModule(module: Omit<ModuleInfo, 'lastUpdated'>): boolean {
    try {
      this.modules.set(module.id, {
        ...module,
        lastUpdated: new Date()
      })
      return true
    } catch (error) {
      console.error(`Failed to register module ${module.id}:`, error)
      return false
    }
  }

  getModule(moduleId: string): ModuleInfo | undefined {
    return this.modules.get(moduleId)
  }

  getAllModules(): ModuleInfo[] {
    return Array.from(this.modules.values())
  }

  getModulesForTier(tier: 'foundation' | 'growth' | 'enterprise'): ModuleInfo[] {
    return this.getAllModules().filter(module =>
      !module.tiers || module.tiers.includes(tier)
    )
  }

  validateDependencies(moduleId: string, tenantId: string = 'default'): {
    valid: boolean
    missing: string[]
    circular: string[]
  } {
    const module = this.modules.get(moduleId)
    if (!module) {
      return { valid: false, missing: [moduleId], circular: [] }
    }

    const activeTenantModules = this.activeModules.get(tenantId) || new Set()
    const missing: string[] = []
    const circular: string[] = []

    // Check for missing dependencies - must be both registered AND active for tenant
    for (const depId of module.dependencies) {
      if (!this.modules.has(depId)) {
        missing.push(`${depId} (not registered)`)
      } else if (!activeTenantModules.has(depId)) {
        missing.push(`${depId} (not active)`)
      }
    }

    // Basic circular dependency check
    const visited = new Set<string>()
    const checkCircular = (currentId: string, path: string[]): boolean => {
      if (path.includes(currentId)) {
        circular.push(currentId)
        return true
      }

      if (visited.has(currentId)) return false
      visited.add(currentId)

      const currentModule = this.modules.get(currentId)
      if (!currentModule) return false

      for (const depId of currentModule.dependencies) {
        if (checkCircular(depId, [...path, currentId])) {
          return true
        }
      }

      return false
    }

    checkCircular(moduleId, [])

    return {
      valid: missing.length === 0 && circular.length === 0,
      missing,
      circular
    }
  }

  async activateModule(request: ModuleActivationRequest): Promise<ModuleActivationResult> {
    const { moduleId, tenantId = 'default', config } = request
    const module = this.modules.get(moduleId)

    if (!module) {
      return {
        success: false,
        moduleId,
        status: 'failed',
        message: `Module ${moduleId} not found in registry`
      }
    }

    // Emit before activation event
    await lifecycleManager.emit('beforeActivation', {
      moduleId,
      tenantId,
      data: { config }
    })

    // Validate dependencies
    const validation = this.validateDependencies(moduleId, tenantId)
    if (!validation.valid) {
      await lifecycleManager.emit('error', {
        moduleId,
        tenantId,
        error: new Error(`Dependency validation failed: ${validation.missing.join(', ')}`)
      })

      return {
        success: false,
        moduleId,
        status: 'dependency_missing',
        message: `Cannot activate module due to dependency issues`,
        dependencyErrors: [
          ...validation.missing.map(id => `Missing dependency: ${id}`),
          ...validation.circular.map(id => `Circular dependency detected: ${id}`)
        ]
      }
    }

    try {
      // Set module configuration if provided
      if (config) {
        const configSet = configManager.setTenantConfig(tenantId, moduleId, config)
        if (!configSet) {
          await lifecycleManager.emit('error', {
            moduleId,
            tenantId,
            error: new Error('Invalid module configuration provided')
          })

          return {
            success: false,
            moduleId,
            status: 'failed',
            message: 'Invalid module configuration provided'
          }
        }
      }

      // Activate module for tenant
      if (!this.activeModules.has(tenantId)) {
        this.activeModules.set(tenantId, new Set())
      }

      const tenantModules = this.activeModules.get(tenantId)!
      tenantModules.add(moduleId)

      // Update module status
      const updatedModule = { ...module, status: 'active' as const, activatedAt: new Date() }
      this.modules.set(moduleId, updatedModule)

      // Emit after activation event
      await lifecycleManager.emit('afterActivation', {
        moduleId,
        tenantId,
        data: { config }
      })

      return {
        success: true,
        moduleId,
        status: 'active',
        message: `Module ${moduleId} activated successfully for tenant ${tenantId}`
      }
    } catch (error) {
      await lifecycleManager.emit('error', {
        moduleId,
        tenantId,
        error: error instanceof Error ? error : new Error(String(error))
      })

      return {
        success: false,
        moduleId,
        status: 'failed',
        message: `Failed to activate module: ${error}`
      }
    }
  }

  async deactivateModule(moduleId: string, tenantId: string = 'default'): Promise<boolean> {
    const tenantModules = this.activeModules.get(tenantId)
    if (!tenantModules || !tenantModules.has(moduleId)) {
      return false
    }

    // Emit before deactivation event
    await lifecycleManager.emit('beforeDeactivation', {
      moduleId,
      tenantId
    })

    try {
      // Check if other modules depend on this one
      const dependentModules = this.getAllModules().filter(module =>
        module.dependencies.includes(moduleId) &&
        tenantModules.has(module.id)
      )

      if (dependentModules.length > 0) {
        const errorMsg = `Cannot deactivate ${moduleId}: required by ${dependentModules.map(m => m.id).join(', ')}`
        await lifecycleManager.emit('error', {
          moduleId,
          tenantId,
          error: new Error(errorMsg)
        })
        return false
      }

      tenantModules.delete(moduleId)

      const module = this.modules.get(moduleId)
      if (module) {
        const updatedModule = { ...module, status: 'inactive' as const }
        this.modules.set(moduleId, updatedModule)
      }

      // Emit after deactivation event
      await lifecycleManager.emit('afterDeactivation', {
        moduleId,
        tenantId
      })

      return true
    } catch (error) {
      await lifecycleManager.emit('error', {
        moduleId,
        tenantId,
        error: error instanceof Error ? error : new Error(String(error))
      })
      return false
    }
  }

  getActiveModules(tenantId: string = 'default'): ModuleInfo[] {
    const activeIds = this.activeModules.get(tenantId) || new Set()
    return Array.from(activeIds)
      .map(id => this.modules.get(id))
      .filter(Boolean) as ModuleInfo[]
  }

  getModuleStatus(moduleId: string, tenantId: string = 'default'): 'active' | 'inactive' | 'not_found' {
    if (!this.modules.has(moduleId)) {
      return 'not_found'
    }

    const tenantModules = this.activeModules.get(tenantId)
    return tenantModules?.has(moduleId) ? 'active' : 'inactive'
  }

  // Legacy compatibility with existing ModuleRegistry format
  toModuleRegistry(tenantId: string = 'default'): ModuleRegistry {
    const activeIds = this.activeModules.get(tenantId) || new Set()
    const modules = Array.from(this.modules.values())
      .filter(module => activeIds.has(module.id))
      .map(module => ({
        id: module.id,
        label: module.label,
        description: module.description,
        tiers: module.tiers
      }))

    return { modules }
  }

  // Simple version management
  updateModuleVersion(moduleId: string, newVersion: string): boolean {
    const module = this.modules.get(moduleId)
    if (!module) return false

    const updatedModule = {
      ...module,
      version: newVersion,
      lastUpdated: new Date()
    }

    this.modules.set(moduleId, updatedModule)
    return true
  }

  getModuleVersions(): Record<string, string> {
    const versions: Record<string, string> = {}
    this.modules.forEach((module, id) => {
      versions[id] = module.version
    })
    return versions
  }
}

// Singleton instance
export const moduleRegistry = new BasicModuleRegistry()

// Utility functions for external use
export function getActiveModulesForTenant(tenantId?: string): ModuleInfo[] {
  return moduleRegistry.getActiveModules(tenantId)
}

export async function activateModule(moduleId: string, tenantId?: string, config?: Record<string, unknown>): Promise<ModuleActivationResult> {
  return await moduleRegistry.activateModule({ moduleId, tenantId, config })
}

export async function deactivateModule(moduleId: string, tenantId?: string): Promise<boolean> {
  return await moduleRegistry.deactivateModule(moduleId, tenantId)
}

export function getModuleInfo(moduleId: string): ModuleInfo | undefined {
  return moduleRegistry.getModule(moduleId)
}

export function getAllAvailableModules(): ModuleInfo[] {
  return moduleRegistry.getAllModules()
}

export function getModulesForTier(tier: 'foundation' | 'growth' | 'enterprise'): ModuleInfo[] {
  return moduleRegistry.getModulesForTier(tier)
}

export function getLegacyModuleRegistry(tenantId?: string): ModuleRegistry {
  return moduleRegistry.toModuleRegistry(tenantId)
}