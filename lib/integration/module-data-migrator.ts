/**
 * HT-036.2.3: Module Data Migrator
 *
 * Handles migration of existing module configurations from
 * client_app_overrides to HT-035 module registry system.
 *
 * Features:
 * - Automated migration of legacy configurations
 * - Data integrity validation
 * - Rollback capabilities
 * - Progress tracking
 * - Batch migration support
 */

import { createServerSupabase } from '@/lib/supabase/server'
import { moduleRegistry, type ModuleRegistryEntry } from '@/lib/modules/module-registry'
import { configManager } from '@/lib/modules/module-config'
import { moduleSystemUnifier, type UnifiedModuleConfig } from './module-system-unifier'

export interface MigrationPlan {
  clientId: string
  modulesToMigrate: ModuleMigrationItem[]
  estimatedDuration: number
  requiresBackup: boolean
  conflicts: MigrationConflict[]
  warnings: MigrationWarning[]
}

export interface ModuleMigrationItem {
  moduleId: string
  currentSource: 'legacy' | 'registry' | 'unified'
  targetSource: 'unified'
  legacyConfig?: Record<string, unknown>
  registryEntry?: ModuleRegistryEntry
  migrationStrategy: 'merge' | 'replace' | 'preserve'
}

export interface MigrationConflict {
  moduleId: string
  conflictType: 'version' | 'configuration' | 'dependency' | 'capability'
  description: string
  resolution: 'manual' | 'automatic'
  resolutionStrategy?: string
}

export interface MigrationWarning {
  moduleId: string
  warningType: 'data_loss' | 'compatibility' | 'performance' | 'feature_change'
  message: string
  severity: 'low' | 'medium' | 'high'
}

export interface MigrationResult {
  success: boolean
  clientId: string
  migratedCount: number
  failedCount: number
  skippedCount: number
  totalCount: number
  migratedModules: string[]
  failedModules: MigrationFailure[]
  skippedModules: string[]
  duration: number
  rollbackAvailable: boolean
  rollbackId?: string
}

export interface MigrationFailure {
  moduleId: string
  error: string
  details?: Record<string, unknown>
  canRetry: boolean
}

export interface MigrationBackup {
  backupId: string
  clientId: string
  timestamp: Date
  legacyData: {
    modulesEnabled: string[]
    themeOverrides?: Record<string, unknown>
    consultationConfig?: Record<string, unknown>
    planCatalogOverrides?: Record<string, unknown>
  }
  registryData: ModuleRegistryEntry[]
}

export class ModuleDataMigrator {
  private backups: Map<string, MigrationBackup> = new Map()
  private migrationProgress: Map<string, number> = new Map()

  async createMigrationPlan(clientId: string): Promise<MigrationPlan> {
    const conflicts: MigrationConflict[] = []
    const warnings: MigrationWarning[] = []

    const unificationResult = await moduleSystemUnifier.unifyModuleSystems(clientId)

    const modulesToMigrate: ModuleMigrationItem[] = unificationResult.unifiedModules
      .filter(config => config.source === 'legacy' || config.source === 'unified')
      .map(config => this.createMigrationItem(config, conflicts, warnings))

    const estimatedDuration = this.calculateEstimatedDuration(modulesToMigrate)

    return {
      clientId,
      modulesToMigrate,
      estimatedDuration,
      requiresBackup: modulesToMigrate.length > 0,
      conflicts,
      warnings
    }
  }

  async executeMigration(
    clientId: string,
    plan?: MigrationPlan
  ): Promise<MigrationResult> {
    const startTime = Date.now()
    const migrationPlan = plan || await this.createMigrationPlan(clientId)

    const backup = await this.createBackup(clientId, migrationPlan)
    const rollbackId = backup.backupId

    const migratedModules: string[] = []
    const failedModules: MigrationFailure[] = []
    const skippedModules: string[] = []

    for (let i = 0; i < migrationPlan.modulesToMigrate.length; i++) {
      const item = migrationPlan.modulesToMigrate[i]
      this.migrationProgress.set(clientId, (i / migrationPlan.modulesToMigrate.length) * 100)

      try {
        const shouldSkip = await this.shouldSkipMigration(item)
        if (shouldSkip) {
          skippedModules.push(item.moduleId)
          continue
        }

        await this.migrateModule(clientId, item)
        migratedModules.push(item.moduleId)
      } catch (error) {
        failedModules.push({
          moduleId: item.moduleId,
          error: error instanceof Error ? error.message : String(error),
          canRetry: this.canRetryMigration(error)
        })
      }
    }

    this.migrationProgress.delete(clientId)

    const duration = Date.now() - startTime

    return {
      success: failedModules.length === 0,
      clientId,
      migratedCount: migratedModules.length,
      failedCount: failedModules.length,
      skippedCount: skippedModules.length,
      totalCount: migrationPlan.modulesToMigrate.length,
      migratedModules,
      failedModules,
      skippedModules,
      duration,
      rollbackAvailable: true,
      rollbackId
    }
  }

  async rollbackMigration(backupId: string): Promise<boolean> {
    const backup = this.backups.get(backupId)
    if (!backup) {
      throw new Error(`Backup ${backupId} not found`)
    }

    try {
      const supabase = await createServerSupabase()

      await supabase
        .from('client_app_overrides')
        .upsert({
          client_id: backup.clientId,
          modules_enabled: backup.legacyData.modulesEnabled,
          theme_overrides: backup.legacyData.themeOverrides || {},
          consultation_config: backup.legacyData.consultationConfig || {},
          plan_catalog_overrides: backup.legacyData.planCatalogOverrides || {},
          updated_at: new Date().toISOString()
        })

      for (const entry of backup.registryData) {
        if (entry.status.status === 'active') {
          await moduleRegistry.updateModuleStatus(
            entry.definition.id,
            'inactive',
            'Rolled back from migration'
          )
        }
      }

      moduleSystemUnifier.clearCache()

      return true
    } catch (error) {
      console.error('Rollback failed:', error)
      return false
    }
  }

  async validateMigration(clientId: string): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      const unifiedModules = await moduleSystemUnifier.getUnifiedModuleList(clientId)

      for (const config of unifiedModules) {
        if (config.source === 'legacy') {
          const registryEntry = moduleRegistry.getModule(config.moduleId)
          if (registryEntry) {
            warnings.push(
              `Module ${config.moduleId} exists in both legacy and registry but not migrated`
            )
          }
        }

        if (config.source === 'unified') {
          if (!config.advancedConfig || !config.legacyConfig) {
            errors.push(
              `Unified module ${config.moduleId} missing required configuration`
            )
          }

          const dataIntegrity = await this.validateDataIntegrity(config)
          if (!dataIntegrity.valid) {
            errors.push(...dataIntegrity.errors)
          }
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        checkedModules: unifiedModules.length
      }
    } catch (error) {
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : String(error)],
        warnings,
        checkedModules: 0
      }
    }
  }

  getMigrationProgress(clientId: string): number {
    return this.migrationProgress.get(clientId) || 0
  }

  private async createBackup(
    clientId: string,
    plan: MigrationPlan
  ): Promise<MigrationBackup> {
    const supabase = await createServerSupabase()

    const { data: legacyData } = await supabase
      .from('client_app_overrides')
      .select('*')
      .eq('client_id', clientId)
      .single()

    const registryData = plan.modulesToMigrate
      .map(item => item.registryEntry)
      .filter(Boolean) as ModuleRegistryEntry[]

    const backup: MigrationBackup = {
      backupId: `backup-${clientId}-${Date.now()}`,
      clientId,
      timestamp: new Date(),
      legacyData: {
        modulesEnabled: (legacyData?.modules_enabled || []) as string[],
        themeOverrides: legacyData?.theme_overrides,
        consultationConfig: legacyData?.consultation_config,
        planCatalogOverrides: legacyData?.plan_catalog_overrides
      },
      registryData
    }

    this.backups.set(backup.backupId, backup)

    return backup
  }

  private createMigrationItem(
    config: UnifiedModuleConfig,
    conflicts: MigrationConflict[],
    warnings: MigrationWarning[]
  ): ModuleMigrationItem {
    let migrationStrategy: 'merge' | 'replace' | 'preserve' = 'merge'

    if (config.source === 'unified') {
      migrationStrategy = 'preserve'
    } else if (config.advancedConfig && config.legacyConfig) {
      const hasConflict = this.detectConfigurationConflict(config)
      if (hasConflict) {
        conflicts.push({
          moduleId: config.moduleId,
          conflictType: 'configuration',
          description: 'Legacy and registry configurations differ',
          resolution: 'automatic',
          resolutionStrategy: 'merge_with_registry_priority'
        })
        migrationStrategy = 'merge'
      }
    }

    return {
      moduleId: config.moduleId,
      currentSource: config.source,
      targetSource: 'unified',
      legacyConfig: config.legacyConfig,
      registryEntry: config.advancedConfig?.registryEntry,
      migrationStrategy
    }
  }

  private async migrateModule(
    clientId: string,
    item: ModuleMigrationItem
  ): Promise<void> {
    switch (item.migrationStrategy) {
      case 'merge':
        await this.mergeMigration(clientId, item)
        break
      case 'replace':
        await this.replaceMigration(clientId, item)
        break
      case 'preserve':
        break
      default:
        throw new Error(`Unknown migration strategy: ${item.migrationStrategy}`)
    }

    await moduleSystemUnifier.migrateToUnified(clientId, item.moduleId)
  }

  private async mergeMigration(
    clientId: string,
    item: ModuleMigrationItem
  ): Promise<void> {
    const mergedConfig = {
      ...item.legacyConfig,
      registryEntry: item.registryEntry,
      capabilities: item.registryEntry?.capabilities.map(c => c.id) || [],
      dependencies: item.registryEntry?.dependencies.map(d => d.id) || []
    }

    await configManager.setModuleConfig(item.moduleId, clientId, mergedConfig)
  }

  private async replaceMigration(
    clientId: string,
    item: ModuleMigrationItem
  ): Promise<void> {
    const newConfig = {
      registryEntry: item.registryEntry,
      capabilities: item.registryEntry?.capabilities.map(c => c.id) || [],
      dependencies: item.registryEntry?.dependencies.map(d => d.id) || []
    }

    await configManager.setModuleConfig(item.moduleId, clientId, newConfig)
  }

  private async shouldSkipMigration(item: ModuleMigrationItem): Promise<boolean> {
    if (item.currentSource === 'unified') {
      return true
    }

    if (!item.registryEntry) {
      return true
    }

    return false
  }

  private canRetryMigration(error: unknown): boolean {
    if (error instanceof Error) {
      return !error.message.includes('validation') &&
             !error.message.includes('conflict')
    }
    return false
  }

  private detectConfigurationConflict(config: UnifiedModuleConfig): boolean {
    if (!config.legacyConfig || !config.advancedConfig) {
      return false
    }

    return true
  }

  private async validateDataIntegrity(
    config: UnifiedModuleConfig
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []

    if (config.source === 'unified') {
      if (!config.legacyConfig && !config.advancedConfig) {
        errors.push(`Module ${config.moduleId} has no configuration data`)
      }

      if (config.advancedConfig) {
        if (!config.advancedConfig.registryEntry) {
          errors.push(`Module ${config.moduleId} missing registry entry`)
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  private calculateEstimatedDuration(items: ModuleMigrationItem[]): number {
    return items.length * 500
  }
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  checkedModules: number
}

export const moduleDataMigrator = new ModuleDataMigrator()

export async function createModuleMigrationPlan(
  clientId: string
): Promise<MigrationPlan> {
  return moduleDataMigrator.createMigrationPlan(clientId)
}

export async function executeModuleMigration(
  clientId: string,
  plan?: MigrationPlan
): Promise<MigrationResult> {
  return moduleDataMigrator.executeMigration(clientId, plan)
}

export async function rollbackModuleMigration(
  backupId: string
): Promise<boolean> {
  return moduleDataMigrator.rollbackMigration(backupId)
}

export async function validateModuleMigration(
  clientId: string
): Promise<ValidationResult> {
  return moduleDataMigrator.validateMigration(clientId)
}

export function getModuleMigrationProgress(clientId: string): number {
  return moduleDataMigrator.getMigrationProgress(clientId)
}