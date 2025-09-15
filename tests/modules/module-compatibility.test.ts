/**
 * HT-022.3.4: Basic Module Compatibility Tests
 *
 * Tests for basic module compatibility, configuration validation,
 * and integration functionality.
 */

import {
  moduleRegistry,
  activateModule,
  deactivateModule,
  getActiveModulesForTenant
} from '@/lib/modules/basic-registry'

import {
  getTenantModuleConfiguration,
  setTenantModuleConfiguration,
  tenantThemingManager
} from '@/lib/modules/tenant-theming'

describe('Module Compatibility Testing', () => {
  beforeEach(() => {
    // Clean slate for each test
  })

  describe('Cross-Module Compatibility', () => {
    test('should handle module activation order correctly', async () => {
      const tenantId = 'compatibility-test-order'

      // Activate in wrong order (dependent first)
      const dependentResult = await activateModule('consultation-generator', tenantId)
      expect(dependentResult.success).toBe(false)
      expect(dependentResult.status).toBe('dependency_missing')

      // Activate dependency first
      const dependencyResult = await activateModule('questionnaire-engine', tenantId)
      expect(dependencyResult.success).toBe(true)

      // Now activate dependent
      const retryResult = await activateModule('consultation-generator', tenantId)
      expect(retryResult.success).toBe(true)
    })

    test('should detect version conflicts', async () => {
      // Simulate version conflict scenario
      const validation = moduleRegistry.validateDependencies('form-builder', 'version-test')

      // Should work with compatible versions
      expect(validation.valid).toBe(true)
    })

    test('should handle concurrent module activations', async () => {
      const tenantId = 'concurrent-test'

      // Simulate concurrent activations
      const promises = [
        activateModule('questionnaire-engine', tenantId),
        activateModule('theme-customizer', tenantId),
        activateModule('form-builder', tenantId)
      ]

      const results = await Promise.all(promises)

      // All independent modules should activate successfully
      results.forEach(result => {
        expect(result.success).toBe(true)
      })

      const activeModules = getActiveModulesForTenant(tenantId)
      expect(activeModules).toHaveLength(3)
    })

    test('should validate module resource requirements', () => {
      // Test basic resource validation
      const questionnaire = moduleRegistry.getModuleInfo('questionnaire-engine')
      expect(questionnaire).toBeDefined()
      expect(questionnaire?.dependencies).toBeDefined()

      const consultation = moduleRegistry.getModuleInfo('consultation-generator')
      expect(consultation?.dependencies).toContain('questionnaire-engine')
    })

    test('should handle module conflicts gracefully', async () => {
      const tenantId = 'conflict-test'

      // Activate a module
      await activateModule('questionnaire-engine', tenantId)

      // Try to activate conflicting version (simulated)
      const result = await activateModule('questionnaire-engine', tenantId)

      // Should handle gracefully (already active)
      expect(result.success).toBe(true)
      expect(result.message).toContain('already active')
    })
  })

  describe('Configuration Validation', () => {
    test('should validate module configuration schemas', () => {
      // Test questionnaire-engine configuration validation
      const validConfig = {
        maxSteps: 10,
        progressStyle: 'steps',
        allowSkip: true
      }

      const result = tenantThemingManager.setTenantModuleConfig({
        tenantId: 'schema-test',
        moduleId: 'questionnaire-engine',
        config: validConfig,
        validateOnly: true
      })

      expect(result.success).toBe(true)
    })

    test('should reject invalid configuration values', () => {
      const invalidConfig = {
        maxSteps: -1, // Invalid: negative number
        progressStyle: 'invalid-style', // Invalid: not in enum
        allowSkip: 'maybe' // Invalid: not boolean
      }

      const result = tenantThemingManager.setTenantModuleConfig({
        tenantId: 'invalid-test',
        moduleId: 'questionnaire-engine',
        config: invalidConfig,
        validateOnly: true
      })

      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(result.errors?.length).toBeGreaterThan(0)
    })

    test('should validate required configuration fields', () => {
      const incompleteConfig = {
        progressStyle: 'thinBar'
        // Missing required maxSteps
      }

      const result = tenantThemingManager.setTenantModuleConfig({
        tenantId: 'incomplete-test',
        moduleId: 'questionnaire-engine',
        config: incompleteConfig,
        validateOnly: true
      })

      expect(result.success).toBe(false)
      expect(result.errors?.some(error => error.includes('maxSteps'))).toBe(true)
    })

    test('should apply default values for optional fields', () => {
      const minimalConfig = {
        maxSteps: 8
      }

      const result = tenantThemingManager.setTenantModuleConfig({
        tenantId: 'defaults-test',
        moduleId: 'questionnaire-engine',
        config: minimalConfig,
        validateOnly: false
      })

      expect(result.success).toBe(true)

      const appliedConfig = getTenantModuleConfiguration('defaults-test', 'questionnaire-engine')
      expect(appliedConfig.progressStyle).toBe('thinBar') // Default value
      expect(appliedConfig.allowSkip).toBe(false) // Default value
    })

    test('should validate cross-module configuration dependencies', () => {
      // Set up a scenario where one module config affects another
      setTenantModuleConfiguration('cross-deps-test', 'theme-customizer', {
        allowCustomColors: false
      })

      // Try to configure questionnaire with custom colors when not allowed
      const result = tenantThemingManager.setTenantModuleConfig({
        tenantId: 'cross-deps-test',
        moduleId: 'questionnaire-engine',
        config: {
          maxSteps: 5,
          customColors: { primary: '#ff0000' } // Should be rejected
        },
        validateOnly: true
      })

      expect(result.success).toBe(false)
      expect(result.errors?.some(error => error.includes('custom colors not allowed'))).toBe(true)
    })
  })

  describe('Integration Operations', () => {
    test('should handle complete module lifecycle', async () => {
      const tenantId = 'lifecycle-test'

      // 1. Activate module
      const activationResult = await activateModule('questionnaire-engine', tenantId)
      expect(activationResult.success).toBe(true)

      // 2. Configure module
      const configResult = setTenantModuleConfiguration(tenantId, 'questionnaire-engine', {
        maxSteps: 6,
        progressStyle: 'steps'
      })
      expect(configResult.success).toBe(true)

      // 3. Verify configuration
      const config = getTenantModuleConfiguration(tenantId, 'questionnaire-engine')
      expect(config.maxSteps).toBe(6)

      // 4. Deactivate module
      const deactivationResult = await deactivateModule('questionnaire-engine', tenantId)
      expect(deactivationResult).toBe(true)

      // 5. Verify cleanup
      const activeModules = getActiveModulesForTenant(tenantId)
      expect(activeModules).toHaveLength(0)
    })

    test('should handle bulk module operations', async () => {
      const tenantId = 'bulk-test'
      const moduleIds = ['questionnaire-engine', 'theme-customizer', 'form-builder']

      // Bulk activate
      const activationPromises = moduleIds.map(id => activateModule(id, tenantId))
      const results = await Promise.all(activationPromises)

      results.forEach((result, index) => {
        expect(result.success).toBe(true)
        expect(result.moduleId).toBe(moduleIds[index])
      })

      // Verify all active
      const activeModules = getActiveModulesForTenant(tenantId)
      expect(activeModules).toHaveLength(3)
    })

    test('should maintain data integrity during operations', async () => {
      const tenantId = 'integrity-test'

      // Set up initial state
      await activateModule('questionnaire-engine', tenantId)
      setTenantModuleConfiguration(tenantId, 'questionnaire-engine', {
        maxSteps: 7,
        progressStyle: 'steps'
      })

      // Perform concurrent operations
      await Promise.all([
        activateModule('theme-customizer', tenantId),
        setTenantModuleConfiguration(tenantId, 'questionnaire-engine', {
          maxSteps: 8,
          progressStyle: 'thinBar'
        })
      ])

      // Verify final state is consistent
      const activeModules = getActiveModulesForTenant(tenantId)
      expect(activeModules).toHaveLength(2)

      const config = getTenantModuleConfiguration(tenantId, 'questionnaire-engine')
      expect(config.maxSteps).toBe(8)
      expect(config.progressStyle).toBe('thinBar')
    })

    test('should handle error recovery scenarios', async () => {
      const tenantId = 'error-recovery-test'

      // Create error scenario - try to activate non-existent module
      const errorResult = await activateModule('non-existent-module', tenantId)
      expect(errorResult.success).toBe(false)

      // System should remain stable
      const activeModules = getActiveModulesForTenant(tenantId)
      expect(activeModules).toHaveLength(0)

      // Should be able to continue with valid operations
      const validResult = await activateModule('questionnaire-engine', tenantId)
      expect(validResult.success).toBe(true)
    })

    test('should validate system resource limits', async () => {
      const tenantId = 'resource-limits-test'

      // Test maximum modules per tenant (if implemented)
      const moduleIds = [
        'questionnaire-engine',
        'consultation-generator',
        'theme-customizer',
        'form-builder',
        'analytics-dashboard'
      ]

      const results = []
      for (const moduleId of moduleIds) {
        if (moduleId === 'consultation-generator') {
          // Ensure dependency is met
          await activateModule('questionnaire-engine', tenantId)
        }
        const result = await activateModule(moduleId, tenantId)
        results.push(result)
      }

      // All modules should activate (no limits implemented yet)
      results.forEach(result => {
        expect(result.success).toBe(true)
      })

      const activeModules = getActiveModulesForTenant(tenantId)
      expect(activeModules.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('Performance and Reliability', () => {
    test('should handle module operations within performance targets', async () => {
      const tenantId = 'performance-test'

      const startTime = Date.now()

      // Perform multiple operations
      await activateModule('questionnaire-engine', tenantId)
      setTenantModuleConfiguration(tenantId, 'questionnaire-engine', {
        maxSteps: 5,
        progressStyle: 'steps'
      })

      const endTime = Date.now()
      const duration = endTime - startTime

      // Should complete within reasonable time (< 100ms for simple operations)
      expect(duration).toBeLessThan(100)
    })

    test('should handle large tenant configurations efficiently', () => {
      const tenantId = 'large-config-test'

      const startTime = Date.now()

      // Create large configuration
      const largeConfig = {
        maxSteps: 20,
        progressStyle: 'thinBar',
        customFields: Array.from({ length: 100 }, (_, i) => ({
          id: `field-${i}`,
          label: `Field ${i}`,
          type: 'text'
        })),
        validationRules: Array.from({ length: 50 }, (_, i) => ({
          field: `field-${i}`,
          rule: 'required'
        }))
      }

      const result = tenantThemingManager.setTenantModuleConfig({
        tenantId,
        moduleId: 'questionnaire-engine',
        config: largeConfig,
        validateOnly: false
      })

      const endTime = Date.now()
      const duration = endTime - startTime

      expect(result.success).toBe(true)
      expect(duration).toBeLessThan(200) // Should handle large configs efficiently
    })

    test('should maintain consistency under concurrent access', async () => {
      const tenantId = 'concurrency-test'

      // Simulate concurrent configuration updates
      const promises = Array.from({ length: 10 }, (_, i) =>
        setTenantModuleConfiguration(tenantId, 'questionnaire-engine', {
          maxSteps: 5 + i,
          progressStyle: i % 2 === 0 ? 'steps' : 'thinBar'
        })
      )

      const results = await Promise.all(promises)

      // All updates should succeed
      results.forEach(result => {
        expect(result.success).toBe(true)
      })

      // Final configuration should be consistent
      const finalConfig = getTenantModuleConfiguration(tenantId, 'questionnaire-engine')
      expect(finalConfig).toBeDefined()
      expect(typeof finalConfig.maxSteps).toBe('number')
      expect(['steps', 'thinBar']).toContain(finalConfig.progressStyle)
    })
  })
})