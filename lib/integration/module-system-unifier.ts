/**
 * HT-036.2.3: Module System Unifier
 *
 * Unifies existing basic module management (client_app_overrides)
 * with HT-035 comprehensive hot-pluggable system.
 *
 * Features:
 * - Unified module management interface
 * - Backward compatibility with client_app_overrides
 * - Integration with HT-035 module registry
 * - Seamless migration from basic to advanced system
 * - Configuration consolidation
 */

import { moduleRegistry, type ModuleRegistryEntry } from '@/lib/modules/module-registry'
import { createServerSupabase } from '@/lib/supabase/server'
import { lifecycleManager } from '@/lib/modules/module-lifecycle'
import { configManager } from '@/lib/modules/module-config'

export interface UnifiedModuleConfig {
  moduleId: string
  enabled: boolean

  legacyConfig?: {
    modulesEnabled: string[]
    themeOverrides?: Record<string, unknown>
    consultationConfig?: Record<string, unknown>
    planCatalogOverrides?: Record<string, unknown>
  }

  advancedConfig?: {
    registryEntry: ModuleRegistryEntry
    capabilities: string[]
    dependencies: string[]
    customSettings: Record<string, unknown>
  }

  source: 'legacy' | 'registry' | 'unified'
  migratedAt?: Date
}

export interface ModuleUnificationResult {
  success: boolean
  unifiedModules: UnifiedModuleConfig[]
  legacyCount: number
  registryCount: number
  migrationNeeded: boolean
  errors: UnificationError[]
  warnings: UnificationWarning[]
}

export interface UnificationError {
  code: string
  message: string
  moduleId?: string
  details?: Record<string, unknown>
}

export interface UnificationWarning {
  code: string
  message: string
  moduleId?: string
  recommendation?: string
}

export class ModuleSystemUnifier {
  private legacyModuleMap: Map<string, UnifiedModuleConfig> = new Map()
  private registryModuleMap: Map<string, UnifiedModuleConfig> = new Map()
  private unifiedModules: Map<string, UnifiedModuleConfig> = new Map()

  async unifyModuleSystems(clientId: string): Promise<ModuleUnificationResult> {
    const errors: UnificationError[] = []
    const warnings: UnificationWarning[] = []

    try {
      const legacyModules = await this.getLegacyModules(clientId)
      const registryModules = await this.getRegistryModules()

      const unifiedConfigs = this.mergeModuleSystems(
        legacyModules,
        registryModules,
        errors,
        warnings
      )

      const migrationNeeded = this.checkMigrationRequired(unifiedConfigs)

      unifiedConfigs.forEach(config => {
        this.unifiedModules.set(config.moduleId, config)
      })

      return {
        success: errors.length === 0,
        unifiedModules: unifiedConfigs,
        legacyCount: legacyModules.length,
        registryCount: registryModules.length,
        migrationNeeded,
        errors,
        warnings
      }
    } catch (error) {
      errors.push({
        code: 'UNIFICATION_ERROR',
        message: error instanceof Error ? error.message : String(error)
      })

      return {
        success: false,
        unifiedModules: [],
        legacyCount: 0,
        registryCount: 0,
        migrationNeeded: false,
        errors,
        warnings
      }
    }
  }

  async getModuleConfig(
    clientId: string,
    moduleId: string
  ): Promise<UnifiedModuleConfig | null> {
    const cached = this.unifiedModules.get(moduleId)
    if (cached) {
      return cached
    }

    const result = await this.unifyModuleSystems(clientId)
    return result.unifiedModules.find(m => m.moduleId === moduleId) || null
  }

  async enableModule(
    clientId: string,
    moduleId: string,
    useAdvanced: boolean = true
  ): Promise<boolean> {
    try {
      if (useAdvanced) {
        const entry = moduleRegistry.getModule(moduleId)
        if (!entry) {
          return false
        }

        const config: UnifiedModuleConfig = {
          moduleId,
          enabled: true,
          advancedConfig: {
            registryEntry: entry,
            capabilities: entry.capabilities.map(c => c.id),
            dependencies: entry.dependencies.map(d => d.id),
            customSettings: {}
          },
          source: 'registry'
        }

        this.unifiedModules.set(moduleId, config)
        await this.persistToRegistry(clientId, config)
      } else {
        await this.enableLegacyModule(clientId, moduleId)
      }

      return true
    } catch (error) {
      console.error('Failed to enable module:', error)
      return false
    }
  }

  async disableModule(
    clientId: string,
    moduleId: string
  ): Promise<boolean> {
    try {
      const config = this.unifiedModules.get(moduleId)

      if (config?.source === 'registry' || config?.source === 'unified') {
        config.enabled = false
        await this.persistToRegistry(clientId, config)
      }

      if (config?.source === 'legacy' || config?.source === 'unified') {
        await this.disableLegacyModule(clientId, moduleId)
      }

      this.unifiedModules.delete(moduleId)
      return true
    } catch (error) {
      console.error('Failed to disable module:', error)
      return false
    }
  }

  async migrateToUnified(
    clientId: string,
    moduleId: string
  ): Promise<boolean> {
    try {
      const config = this.unifiedModules.get(moduleId)
      if (!config) {
        return false
      }

      if (config.source === 'legacy') {
        const registryEntry = moduleRegistry.getModule(moduleId)

        if (registryEntry) {
          config.advancedConfig = {
            registryEntry,
            capabilities: registryEntry.capabilities.map(c => c.id),
            dependencies: registryEntry.dependencies.map(d => d.id),
            customSettings: config.legacyConfig || {}
          }

          config.source = 'unified'
          config.migratedAt = new Date()

          await this.persistToRegistry(clientId, config)

          this.unifiedModules.set(moduleId, config)

          return true
        }
      }

      return false
    } catch (error) {
      console.error('Failed to migrate module:', error)
      return false
    }
  }

  async getUnifiedModuleList(clientId: string): Promise<UnifiedModuleConfig[]> {
    const result = await this.unifyModuleSystems(clientId)
    return result.unifiedModules
  }

  private async getLegacyModules(clientId: string): Promise<UnifiedModuleConfig[]> {
    try {
      const supabase = await createServerSupabase()

      const { data, error } = await supabase
        .from('client_app_overrides')
        .select('*')
        .eq('client_id', clientId)
        .single()

      if (error || !data) {
        return []
      }

      const modulesEnabled = (data.modules_enabled || []) as string[]

      return modulesEnabled.map(moduleId => ({
        moduleId,
        enabled: true,
        legacyConfig: {
          modulesEnabled,
          themeOverrides: data.theme_overrides || {},
          consultationConfig: data.consultation_config || {},
          planCatalogOverrides: data.plan_catalog_overrides || {}
        },
        source: 'legacy' as const
      }))
    } catch (error) {
      console.error('Failed to get legacy modules:', error)
      return []
    }
  }

  private async getRegistryModules(): Promise<UnifiedModuleConfig[]> {
    try {
      const entries = moduleRegistry.getAllModules()

      return entries
        .filter(entry => entry.status.status === 'active' || entry.status.status === 'ready')
        .map(entry => ({
          moduleId: entry.definition.id,
          enabled: entry.status.status === 'active',
          advancedConfig: {
            registryEntry: entry,
            capabilities: entry.capabilities.map(c => c.id),
            dependencies: entry.dependencies.map(d => d.id),
            customSettings: {}
          },
          source: 'registry' as const
        }))
    } catch (error) {
      console.error('Failed to get registry modules:', error)
      return []
    }
  }

  private mergeModuleSystems(
    legacyModules: UnifiedModuleConfig[],
    registryModules: UnifiedModuleConfig[],
    errors: UnificationError[],
    warnings: UnificationWarning[]
  ): UnifiedModuleConfig[] {
    const merged = new Map<string, UnifiedModuleConfig>()

    legacyModules.forEach(legacy => {
      merged.set(legacy.moduleId, legacy)
      this.legacyModuleMap.set(legacy.moduleId, legacy)
    })

    registryModules.forEach(registry => {
      const existing = merged.get(registry.moduleId)

      if (existing) {
        const unified: UnifiedModuleConfig = {
          moduleId: registry.moduleId,
          enabled: existing.enabled || registry.enabled,
          legacyConfig: existing.legacyConfig,
          advancedConfig: registry.advancedConfig,
          source: 'unified'
        }

        merged.set(registry.moduleId, unified)

        warnings.push({
          code: 'MODULE_CONFLICT_RESOLVED',
          message: `Module ${registry.moduleId} exists in both legacy and registry systems`,
          moduleId: registry.moduleId,
          recommendation: 'Consider migrating to unified configuration'
        })
      } else {
        merged.set(registry.moduleId, registry)
      }

      this.registryModuleMap.set(registry.moduleId, registry)
    })

    return Array.from(merged.values())
  }

  private checkMigrationRequired(configs: UnifiedModuleConfig[]): boolean {
    return configs.some(config =>
      config.source === 'legacy' &&
      this.registryModuleMap.has(config.moduleId)
    )
  }

  private async enableLegacyModule(clientId: string, moduleId: string): Promise<void> {
    const supabase = await createServerSupabase()

    const { data: existing } = await supabase
      .from('client_app_overrides')
      .select('modules_enabled')
      .eq('client_id', clientId)
      .single()

    const modulesEnabled = (existing?.modules_enabled || []) as string[]

    if (!modulesEnabled.includes(moduleId)) {
      modulesEnabled.push(moduleId)
    }

    if (existing) {
      await supabase
        .from('client_app_overrides')
        .update({
          modules_enabled: modulesEnabled,
          updated_at: new Date().toISOString()
        })
        .eq('client_id', clientId)
    } else {
      await supabase
        .from('client_app_overrides')
        .insert({
          client_id: clientId,
          modules_enabled: modulesEnabled
        })
    }
  }

  private async disableLegacyModule(clientId: string, moduleId: string): Promise<void> {
    const supabase = await createServerSupabase()

    const { data: existing } = await supabase
      .from('client_app_overrides')
      .select('modules_enabled')
      .eq('client_id', clientId)
      .single()

    if (!existing) return

    const modulesEnabled = ((existing.modules_enabled || []) as string[])
      .filter(id => id !== moduleId)

    await supabase
      .from('client_app_overrides')
      .update({
        modules_enabled: modulesEnabled,
        updated_at: new Date().toISOString()
      })
      .eq('client_id', clientId)
  }

  private async persistToRegistry(
    clientId: string,
    config: UnifiedModuleConfig
  ): Promise<void> {
    await configManager.setModuleConfig(
      config.moduleId,
      clientId,
      {
        enabled: config.enabled,
        source: config.source,
        legacyConfig: config.legacyConfig,
        advancedConfig: config.advancedConfig,
        migratedAt: config.migratedAt?.toISOString()
      }
    )
  }

  clearCache(): void {
    this.legacyModuleMap.clear()
    this.registryModuleMap.clear()
    this.unifiedModules.clear()
  }
}

export const moduleSystemUnifier = new ModuleSystemUnifier()

export async function unifyModuleSystems(clientId: string): Promise<ModuleUnificationResult> {
  return moduleSystemUnifier.unifyModuleSystems(clientId)
}

export async function getUnifiedModuleConfig(
  clientId: string,
  moduleId: string
): Promise<UnifiedModuleConfig | null> {
  return moduleSystemUnifier.getModuleConfig(clientId, moduleId)
}

export async function enableUnifiedModule(
  clientId: string,
  moduleId: string,
  useAdvanced: boolean = true
): Promise<boolean> {
  return moduleSystemUnifier.enableModule(clientId, moduleId, useAdvanced)
}

export async function disableUnifiedModule(
  clientId: string,
  moduleId: string
): Promise<boolean> {
  return moduleSystemUnifier.disableModule(clientId, moduleId)
}

export async function migrateModuleToUnified(
  clientId: string,
  moduleId: string
): Promise<boolean> {
  return moduleSystemUnifier.migrateToUnified(clientId, moduleId)
}

export async function getUnifiedModuleList(
  clientId: string
): Promise<UnifiedModuleConfig[]> {
  return moduleSystemUnifier.getUnifiedModuleList(clientId)
}