/**
 * HT-022.3.1: Basic Module Registry Tests
 */

import {
  moduleRegistry,
  activateModule,
  deactivateModule,
  getActiveModulesForTenant,
  getModuleInfo,
  getAllAvailableModules,
  getModulesForTier
} from '@/lib/modules/basic-registry'

describe('Basic Module Registry', () => {
  beforeEach(() => {
    // Reset registry for each test
    // Note: In a real implementation, we'd want to provide a reset method
  })

  describe('Module Registration and Info', () => {
    test('should get module information', () => {
      const moduleInfo = getModuleInfo('questionnaire-engine')

      expect(moduleInfo).toBeDefined()
      expect(moduleInfo?.id).toBe('questionnaire-engine')
      expect(moduleInfo?.label).toBe('Questionnaire Engine')
      expect(moduleInfo?.version).toBe('1.0.0')
      expect(moduleInfo?.dependencies).toEqual([])
    })

    test('should return undefined for non-existent module', () => {
      const moduleInfo = getModuleInfo('non-existent-module')
      expect(moduleInfo).toBeUndefined()
    })

    test('should get all available modules', () => {
      const modules = getAllAvailableModules()

      expect(modules.length).toBeGreaterThanOrEqual(5)
      expect(modules.some(m => m.id === 'questionnaire-engine')).toBe(true)
      expect(modules.some(m => m.id === 'consultation-generator')).toBe(true)
    })

    test('should get modules for specific tier', () => {
      const foundationModules = getModulesForTier('foundation')
      const growthModules = getModulesForTier('growth')

      expect(foundationModules.some(m => m.id === 'questionnaire-engine')).toBe(true)
      expect(growthModules.some(m => m.id === 'consultation-generator')).toBe(true)
    })
  })

  describe('Module Activation', () => {
    test('should activate module successfully', async () => {
      const result = await activateModule('questionnaire-engine', 'test-tenant')

      expect(result.success).toBe(true)
      expect(result.status).toBe('active')
      expect(result.moduleId).toBe('questionnaire-engine')
      expect(result.message).toContain('activated successfully')
    })

    test('should fail to activate non-existent module', async () => {
      const result = await activateModule('non-existent-module', 'test-tenant')

      expect(result.success).toBe(false)
      expect(result.status).toBe('failed')
      expect(result.message).toContain('not found in registry')
    })

    test('should activate module with configuration', async () => {
      const config = {
        maxSteps: 8,
        progressStyle: 'steps'
      }

      const result = await activateModule('questionnaire-engine', 'test-tenant', config)

      expect(result.success).toBe(true)
      expect(result.status).toBe('active')
    })

    test('should handle dependency validation', async () => {
      // Try to activate consultation-generator without questionnaire-engine
      const result = await activateModule('consultation-generator', 'test-tenant-deps')

      expect(result.success).toBe(false)
      expect(result.status).toBe('dependency_missing')
      expect(result.dependencyErrors).toContain('Missing dependency: questionnaire-engine (not active)')
    })

    test('should activate module with dependencies', async () => {
      // First activate dependency
      await activateModule('questionnaire-engine', 'test-tenant-deps')

      // Then activate dependent module
      const result = await activateModule('consultation-generator', 'test-tenant-deps')

      expect(result.success).toBe(true)
      expect(result.status).toBe('active')
    })
  })

  describe('Module Deactivation', () => {
    test('should deactivate module successfully', async () => {
      // First activate
      await activateModule('questionnaire-engine', 'test-tenant-deactivate')

      // Then deactivate
      const result = await deactivateModule('questionnaire-engine', 'test-tenant-deactivate')

      expect(result).toBe(true)
    })

    test('should fail to deactivate non-active module', async () => {
      const result = await deactivateModule('questionnaire-engine', 'test-tenant-not-active')

      expect(result).toBe(false)
    })

    test('should prevent deactivation of module with dependents', async () => {
      // Activate both modules
      await activateModule('questionnaire-engine', 'test-tenant-dependents')
      await activateModule('consultation-generator', 'test-tenant-dependents')

      // Try to deactivate the dependency
      const result = await deactivateModule('questionnaire-engine', 'test-tenant-dependents')

      expect(result).toBe(false)
    })
  })

  describe('Active Module Management', () => {
    test('should get active modules for tenant', async () => {
      await activateModule('questionnaire-engine', 'test-tenant-active')
      await activateModule('theme-customizer', 'test-tenant-active')

      const activeModules = getActiveModulesForTenant('test-tenant-active')

      expect(activeModules.length).toBe(2)
      expect(activeModules.some(m => m.id === 'questionnaire-engine')).toBe(true)
      expect(activeModules.some(m => m.id === 'theme-customizer')).toBe(true)
    })

    test('should isolate modules between tenants', async () => {
      await activateModule('questionnaire-engine', 'tenant-a')
      await activateModule('theme-customizer', 'tenant-b')

      const tenantAModules = getActiveModulesForTenant('tenant-a')
      const tenantBModules = getActiveModulesForTenant('tenant-b')

      expect(tenantAModules.length).toBe(1)
      expect(tenantBModules.length).toBe(1)
      expect(tenantAModules[0].id).toBe('questionnaire-engine')
      expect(tenantBModules[0].id).toBe('theme-customizer')
    })
  })

  describe('Dependency Validation', () => {
    test('should validate dependencies correctly', () => {
      const validation = moduleRegistry.validateDependencies('consultation-generator', 'test-validation')

      expect(validation.valid).toBe(false)
      expect(validation.missing).toContain('questionnaire-engine (not active)')
    })

    test('should detect circular dependencies', () => {
      // Register modules with circular dependencies for testing
      moduleRegistry.registerModule({
        id: 'circular-a',
        label: 'Circular A',
        version: '1.0.0',
        status: 'inactive',
        dependencies: ['circular-b'],
        lastUpdated: new Date()
      })

      moduleRegistry.registerModule({
        id: 'circular-b',
        label: 'Circular B',
        version: '1.0.0',
        status: 'inactive',
        dependencies: ['circular-a'],
        lastUpdated: new Date()
      })

      const validation = moduleRegistry.validateDependencies('circular-a', 'test-circular')

      expect(validation.valid).toBe(false)
      expect(validation.circular.length).toBeGreaterThan(0)
    })
  })
})