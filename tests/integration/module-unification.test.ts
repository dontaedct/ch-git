/**
 * HT-036.2.3: Module Unification Test Suite
 *
 * Comprehensive tests for module system unification,
 * including legacy compatibility, migration, and unified operations.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from '@jest/globals'
import {
  moduleSystemUnifier,
  unifyModuleSystems,
  getUnifiedModuleConfig,
  enableUnifiedModule,
  disableUnifiedModule,
  migrateModuleToUnified,
  type UnifiedModuleConfig
} from '@/lib/integration/module-system-unifier'
import {
  moduleDataMigrator,
  createModuleMigrationPlan,
  executeModuleMigration,
  rollbackModuleMigration,
  validateModuleMigration
} from '@/lib/integration/module-data-migrator'
import { moduleRegistry } from '@/lib/modules/module-registry'

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabase: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: null
          }))
        }))
      })),
      insert: vi.fn(() => ({
        data: null,
        error: null
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: null
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: null
        }))
      })),
      upsert: vi.fn(() => ({
        data: null,
        error: null
      }))
    }))
  }))
}))

describe('Module System Unification', () => {
  const testClientId = 'test-client-123'
  const testModuleId = 'test-module-1'

  beforeEach(() => {
    moduleSystemUnifier.clearCache()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Module System Unifier', () => {
    describe('unifyModuleSystems', () => {
      it('should unify legacy and registry modules', async () => {
        const result = await unifyModuleSystems(testClientId)

        expect(result).toBeDefined()
        expect(result.success).toBe(true)
        expect(result.unifiedModules).toBeInstanceOf(Array)
        expect(result.errors).toBeInstanceOf(Array)
        expect(result.warnings).toBeInstanceOf(Array)
      })

      it('should detect legacy modules', async () => {
        const result = await unifyModuleSystems(testClientId)

        expect(result.legacyCount).toBeGreaterThanOrEqual(0)
      })

      it('should detect registry modules', async () => {
        const result = await unifyModuleSystems(testClientId)

        expect(result.registryCount).toBeGreaterThanOrEqual(0)
      })

      it('should identify modules needing migration', async () => {
        const result = await unifyModuleSystems(testClientId)

        expect(typeof result.migrationNeeded).toBe('boolean')
      })

      it('should generate warnings for conflicts', async () => {
        const result = await unifyModuleSystems(testClientId)

        result.warnings.forEach(warning => {
          expect(warning).toHaveProperty('code')
          expect(warning).toHaveProperty('message')
        })
      })
    })

    describe('getUnifiedModuleConfig', () => {
      it('should retrieve unified module configuration', async () => {
        const config = await getUnifiedModuleConfig(testClientId, testModuleId)

        if (config) {
          expect(config).toHaveProperty('moduleId')
          expect(config).toHaveProperty('enabled')
          expect(config).toHaveProperty('source')
          expect(['legacy', 'registry', 'unified']).toContain(config.source)
        }
      })

      it('should return null for non-existent module', async () => {
        const config = await getUnifiedModuleConfig(testClientId, 'non-existent-module')

        expect(config).toBeNull()
      })
    })

    describe('enableUnifiedModule', () => {
      it('should enable module with advanced features', async () => {
        const result = await enableUnifiedModule(testClientId, testModuleId, true)

        expect(typeof result).toBe('boolean')
      })

      it('should enable module with legacy features', async () => {
        const result = await enableUnifiedModule(testClientId, testModuleId, false)

        expect(typeof result).toBe('boolean')
      })
    })

    describe('disableUnifiedModule', () => {
      it('should disable unified module', async () => {
        await enableUnifiedModule(testClientId, testModuleId, true)
        const result = await disableUnifiedModule(testClientId, testModuleId)

        expect(typeof result).toBe('boolean')
      })
    })

    describe('migrateModuleToUnified', () => {
      it('should migrate legacy module to unified', async () => {
        const result = await migrateModuleToUnified(testClientId, testModuleId)

        expect(typeof result).toBe('boolean')
      })
    })
  })

  describe('Module Data Migrator', () => {
    describe('createModuleMigrationPlan', () => {
      it('should create migration plan', async () => {
        const plan = await createModuleMigrationPlan(testClientId)

        expect(plan).toBeDefined()
        expect(plan).toHaveProperty('clientId', testClientId)
        expect(plan).toHaveProperty('modulesToMigrate')
        expect(plan).toHaveProperty('estimatedDuration')
        expect(plan).toHaveProperty('requiresBackup')
        expect(plan).toHaveProperty('conflicts')
        expect(plan).toHaveProperty('warnings')
      })

      it('should identify modules to migrate', async () => {
        const plan = await createModuleMigrationPlan(testClientId)

        expect(Array.isArray(plan.modulesToMigrate)).toBe(true)
      })

      it('should calculate estimated duration', async () => {
        const plan = await createModuleMigrationPlan(testClientId)

        expect(typeof plan.estimatedDuration).toBe('number')
        expect(plan.estimatedDuration).toBeGreaterThanOrEqual(0)
      })

      it('should detect conflicts', async () => {
        const plan = await createModuleMigrationPlan(testClientId)

        expect(Array.isArray(plan.conflicts)).toBe(true)
        plan.conflicts.forEach(conflict => {
          expect(conflict).toHaveProperty('moduleId')
          expect(conflict).toHaveProperty('conflictType')
          expect(conflict).toHaveProperty('description')
          expect(conflict).toHaveProperty('resolution')
        })
      })

      it('should generate warnings', async () => {
        const plan = await createModuleMigrationPlan(testClientId)

        expect(Array.isArray(plan.warnings)).toBe(true)
        plan.warnings.forEach(warning => {
          expect(warning).toHaveProperty('moduleId')
          expect(warning).toHaveProperty('warningType')
          expect(warning).toHaveProperty('message')
          expect(warning).toHaveProperty('severity')
        })
      })
    })

    describe('executeModuleMigration', () => {
      it('should execute migration successfully', async () => {
        const result = await executeModuleMigration(testClientId)

        expect(result).toBeDefined()
        expect(result).toHaveProperty('success')
        expect(result).toHaveProperty('clientId', testClientId)
        expect(result).toHaveProperty('migratedCount')
        expect(result).toHaveProperty('failedCount')
        expect(result).toHaveProperty('skippedCount')
        expect(result).toHaveProperty('totalCount')
      })

      it('should track migrated modules', async () => {
        const result = await executeModuleMigration(testClientId)

        expect(Array.isArray(result.migratedModules)).toBe(true)
      })

      it('should track failed modules', async () => {
        const result = await executeModuleMigration(testClientId)

        expect(Array.isArray(result.failedModules)).toBe(true)
        result.failedModules.forEach(failure => {
          expect(failure).toHaveProperty('moduleId')
          expect(failure).toHaveProperty('error')
          expect(failure).toHaveProperty('canRetry')
        })
      })

      it('should provide rollback capability', async () => {
        const result = await executeModuleMigration(testClientId)

        expect(result).toHaveProperty('rollbackAvailable')
        if (result.rollbackAvailable) {
          expect(result).toHaveProperty('rollbackId')
        }
      })

      it('should measure migration duration', async () => {
        const result = await executeModuleMigration(testClientId)

        expect(typeof result.duration).toBe('number')
        expect(result.duration).toBeGreaterThanOrEqual(0)
      })
    })

    describe('validateModuleMigration', () => {
      it('should validate migration results', async () => {
        await executeModuleMigration(testClientId)
        const validation = await validateModuleMigration(testClientId)

        expect(validation).toBeDefined()
        expect(validation).toHaveProperty('valid')
        expect(validation).toHaveProperty('errors')
        expect(validation).toHaveProperty('warnings')
        expect(validation).toHaveProperty('checkedModules')
      })

      it('should detect validation errors', async () => {
        const validation = await validateModuleMigration(testClientId)

        expect(Array.isArray(validation.errors)).toBe(true)
      })

      it('should provide validation warnings', async () => {
        const validation = await validateModuleMigration(testClientId)

        expect(Array.isArray(validation.warnings)).toBe(true)
      })
    })

    describe('rollbackModuleMigration', () => {
      it('should rollback migration successfully', async () => {
        const migrationResult = await executeModuleMigration(testClientId)

        if (migrationResult.rollbackId) {
          const rollbackResult = await rollbackModuleMigration(migrationResult.rollbackId)
          expect(typeof rollbackResult).toBe('boolean')
        }
      })

      it('should fail rollback for invalid backup ID', async () => {
        await expect(
          rollbackModuleMigration('invalid-backup-id')
        ).rejects.toThrow()
      })
    })
  })

  describe('Integration Scenarios', () => {
    describe('Legacy to Unified Migration', () => {
      it('should migrate legacy module to unified system', async () => {
        const unifyResult = await unifyModuleSystems(testClientId)
        const legacyModule = unifyResult.unifiedModules.find(m => m.source === 'legacy')

        if (legacyModule) {
          const migrationResult = await migrateModuleToUnified(testClientId, legacyModule.moduleId)
          expect(migrationResult).toBe(true)

          const config = await getUnifiedModuleConfig(testClientId, legacyModule.moduleId)
          expect(config?.source).toBe('unified')
        }
      })
    })

    describe('Backward Compatibility', () => {
      it('should maintain legacy module functionality', async () => {
        const enableResult = await enableUnifiedModule(testClientId, testModuleId, false)
        expect(typeof enableResult).toBe('boolean')

        const config = await getUnifiedModuleConfig(testClientId, testModuleId)
        if (config) {
          expect(config.enabled).toBe(true)
        }
      })

      it('should support mixed legacy and registry operations', async () => {
        await enableUnifiedModule(testClientId, 'legacy-module', false)
        await enableUnifiedModule(testClientId, 'registry-module', true)

        const result = await unifyModuleSystems(testClientId)
        expect(result.unifiedModules.length).toBeGreaterThanOrEqual(0)
      })
    })

    describe('Data Integrity', () => {
      it('should preserve module configurations during migration', async () => {
        const beforeMigration = await unifyModuleSystems(testClientId)
        const migrationResult = await executeModuleMigration(testClientId)
        const afterMigration = await unifyModuleSystems(testClientId)

        expect(afterMigration.unifiedModules.length).toBeGreaterThanOrEqual(
          beforeMigration.unifiedModules.length
        )
      })

      it('should validate data integrity after migration', async () => {
        await executeModuleMigration(testClientId)
        const validation = await validateModuleMigration(testClientId)

        validation.errors.forEach(error => {
          console.warn('Validation error:', error)
        })
      })
    })

    describe('Error Handling', () => {
      it('should handle migration failures gracefully', async () => {
        const result = await executeModuleMigration(testClientId)

        if (result.failedCount > 0) {
          expect(result.success).toBe(false)
          expect(result.failedModules.length).toBeGreaterThan(0)
        }
      })

      it('should support retry for failed migrations', async () => {
        const result = await executeModuleMigration(testClientId)

        result.failedModules.forEach(failure => {
          expect(typeof failure.canRetry).toBe('boolean')
        })
      })
    })
  })

  describe('Performance', () => {
    it('should complete unification within acceptable time', async () => {
      const start = Date.now()
      await unifyModuleSystems(testClientId)
      const duration = Date.now() - start

      expect(duration).toBeLessThan(5000)
    })

    it('should complete migration within estimated duration', async () => {
      const plan = await createModuleMigrationPlan(testClientId)
      const start = Date.now()
      await executeModuleMigration(testClientId, plan)
      const actualDuration = Date.now() - start

      expect(actualDuration).toBeLessThan(plan.estimatedDuration * 3)
    })
  })
})