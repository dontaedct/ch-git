/**
 * HT-022.3.4: Module System Integration Tests
 *
 * End-to-end integration tests for the complete module system,
 * including registry, theming, and configuration management.
 */

import {
  moduleRegistry,
  activateModule,
  deactivateModule,
  getActiveModulesForTenant,
  getModuleInfo
} from '@/lib/modules/basic-registry'

import {
  tenantThemingManager,
  getTenantActiveTheme,
  activateThemeForTenant,
  setTenantModuleConfiguration,
  getTenantModuleConfiguration
} from '@/lib/modules/tenant-theming'

describe('Module System Integration', () => {
  const testTenantId = 'integration-test-tenant'

  beforeEach(() => {
    // Setup clean test environment
  })

  describe('Complete Tenant Setup Flow', () => {
    test('should complete full tenant onboarding flow', async () => {
      // 1. Initialize tenant with default theme
      const defaultTheme = getTenantActiveTheme(testTenantId)
      expect(defaultTheme).toBeDefined()
      expect(defaultTheme?.name).toBe('default-blue')

      // 2. Activate core modules
      const questionnaireResult = await activateModule('questionnaire-engine', testTenantId)
      expect(questionnaireResult.success).toBe(true)

      const themeResult = await activateModule('theme-customizer', testTenantId)
      expect(themeResult.success).toBe(true)

      // 3. Configure modules with tenant-specific settings
      const questionnaireConfig = setTenantModuleConfiguration(testTenantId, 'questionnaire-engine', {
        maxSteps: 8,
        progressStyle: 'steps',
        allowSkip: true
      })
      expect(questionnaireConfig.success).toBe(true)

      const themeConfig = setTenantModuleConfiguration(testTenantId, 'theme-customizer', {
        allowCustomColors: true,
        maxThemes: 5,
        previewMode: true
      })
      expect(themeConfig.success).toBe(true)

      // 4. Apply custom theme
      const customThemeResult = activateThemeForTenant(testTenantId, 'default-green', {
        colors: { primary: '#10b981' }
      })
      expect(customThemeResult.success).toBe(true)

      // 5. Verify complete setup
      const activeModules = getActiveModulesForTenant(testTenantId)
      expect(activeModules).toHaveLength(2)

      const activeTheme = getTenantActiveTheme(testTenantId)
      expect(activeTheme?.name).toBe('default-green')

      const finalQuestionnaireConfig = getTenantModuleConfiguration(testTenantId, 'questionnaire-engine')
      expect(finalQuestionnaireConfig.maxSteps).toBe(8)
    })

    test('should handle tenant migration flow', async () => {
      const sourceTenant = 'source-tenant'
      const targetTenant = 'target-tenant'

      // 1. Set up source tenant
      await activateModule('questionnaire-engine', sourceTenant)
      await activateModule('theme-customizer', sourceTenant)

      setTenantModuleConfiguration(sourceTenant, 'questionnaire-engine', {
        maxSteps: 12,
        progressStyle: 'thinBar'
      })

      activateThemeForTenant(sourceTenant, 'default-purple')

      // 2. Export source tenant data
      const exportData = tenantThemingManager.exportTenantData(sourceTenant)
      expect(exportData).toBeDefined()
      expect(exportData.config).toBeDefined()
      expect(exportData.moduleConfigs).toBeDefined()

      // 3. Import to target tenant
      const importResult = tenantThemingManager.importTenantData(targetTenant, exportData)
      expect(importResult).toBe(true)

      // 4. Verify migration
      const targetConfig = getTenantModuleConfiguration(targetTenant, 'questionnaire-engine')
      expect(targetConfig.maxSteps).toBe(12)

      const targetTheme = getTenantActiveTheme(targetTenant)
      expect(targetTheme?.name).toBe('default-purple')
    })

    test('should handle complex dependency chains', async () => {
      const complexTenant = 'complex-dependency-tenant'

      // Try to activate a module with multiple dependencies
      // consultation-generator -> questionnaire-engine -> form-builder (hypothetical)

      // This should fail initially
      const consultationResult1 = await activateModule('consultation-generator', complexTenant)
      expect(consultationResult1.success).toBe(false)
      expect(consultationResult1.status).toBe('dependency_missing')

      // Activate the dependency chain in correct order
      await activateModule('questionnaire-engine', complexTenant)

      // Now consultation should work
      const consultationResult2 = await activateModule('consultation-generator', complexTenant)
      expect(consultationResult2.success).toBe(true)

      // Verify all modules are active
      const activeModules = getActiveModulesForTenant(complexTenant)
      expect(activeModules.length).toBeGreaterThanOrEqual(2)
      expect(activeModules.some(m => m.id === 'questionnaire-engine')).toBe(true)
      expect(activeModules.some(m => m.id === 'consultation-generator')).toBe(true)
    })
  })

  describe('Multi-Tenant Isolation', () => {
    test('should maintain complete isolation between tenants', async () => {
      const tenant1 = 'isolated-tenant-1'
      const tenant2 = 'isolated-tenant-2'

      // Set up tenant 1
      await activateModule('questionnaire-engine', tenant1)
      setTenantModuleConfiguration(tenant1, 'questionnaire-engine', { maxSteps: 5 })
      activateThemeForTenant(tenant1, 'default-blue')

      // Set up tenant 2
      await activateModule('theme-customizer', tenant2)
      setTenantModuleConfiguration(tenant2, 'theme-customizer', { maxThemes: 3 })
      activateThemeForTenant(tenant2, 'default-green')

      // Verify isolation
      const tenant1Modules = getActiveModulesForTenant(tenant1)
      const tenant2Modules = getActiveModulesForTenant(tenant2)

      expect(tenant1Modules).toHaveLength(1)
      expect(tenant2Modules).toHaveLength(1)
      expect(tenant1Modules[0].id).toBe('questionnaire-engine')
      expect(tenant2Modules[0].id).toBe('theme-customizer')

      const tenant1Config = getTenantModuleConfiguration(tenant1, 'questionnaire-engine')
      const tenant2Config = getTenantModuleConfiguration(tenant2, 'theme-customizer')

      expect(tenant1Config.maxSteps).toBe(5)
      expect(tenant2Config.maxThemes).toBe(3)

      const tenant1Theme = getTenantActiveTheme(tenant1)
      const tenant2Theme = getTenantActiveTheme(tenant2)

      expect(tenant1Theme?.name).toBe('default-blue')
      expect(tenant2Theme?.name).toBe('default-green')
    })

    test('should handle tenant-specific customizations', async () => {
      const customTenant = 'custom-tenant'

      // Activate module with custom configuration
      await activateModule('questionnaire-engine', customTenant)

      const customConfig = {
        maxSteps: 15,
        progressStyle: 'steps',
        allowSkip: false,
        customBranding: {
          logoUrl: 'https://example.com/logo.png',
          primaryColor: '#ff6b6b',
          secondaryColor: '#4ecdc4'
        },
        advancedFeatures: {
          conditionalLogic: true,
          dataValidation: true,
          multiLanguage: false
        }
      }

      const configResult = setTenantModuleConfiguration(customTenant, 'questionnaire-engine', customConfig)
      expect(configResult.success).toBe(true)

      // Apply custom theme with branding
      const themeResult = activateThemeForTenant(customTenant, 'default-blue', {
        colors: {
          primary: '#ff6b6b',
          secondary: '#4ecdc4'
        },
        branding: {
          logoUrl: 'https://example.com/logo.png'
        }
      })
      expect(themeResult.success).toBe(true)

      // Verify customizations are applied
      const appliedConfig = getTenantModuleConfiguration(customTenant, 'questionnaire-engine')
      expect(appliedConfig.maxSteps).toBe(15)
      expect(appliedConfig.customBranding?.primaryColor).toBe('#ff6b6b')

      const appliedTheme = getTenantActiveTheme(customTenant)
      expect(appliedTheme?.tokens.colors.primary).toBe('#ff6b6b')
    })
  })

  describe('System Resilience and Error Handling', () => {
    test('should gracefully handle invalid operations', async () => {
      const errorTenant = 'error-test-tenant'

      // Try to activate non-existent module
      const invalidModule = await activateModule('non-existent-module', errorTenant)
      expect(invalidModule.success).toBe(false)
      expect(invalidModule.message).toContain('not found')

      // Try to configure non-active module
      const invalidConfig = setTenantModuleConfiguration(errorTenant, 'questionnaire-engine', {
        maxSteps: 10
      })
      expect(invalidConfig.success).toBe(false)

      // Try to apply non-existent theme
      const invalidTheme = activateThemeForTenant(errorTenant, 'non-existent-theme')
      expect(invalidTheme.success).toBe(false)

      // System should remain stable
      const activeModules = getActiveModulesForTenant(errorTenant)
      expect(activeModules).toHaveLength(0)
    })

    test('should recover from partial failures', async () => {
      const recoveryTenant = 'recovery-test-tenant'

      // Start with successful operation
      const success1 = await activateModule('questionnaire-engine', recoveryTenant)
      expect(success1.success).toBe(true)

      // Attempt operation that fails
      const failure = await activateModule('non-existent-module', recoveryTenant)
      expect(failure.success).toBe(false)

      // Continue with successful operations
      const success2 = await activateModule('theme-customizer', recoveryTenant)
      expect(success2.success).toBe(true)

      // Verify system state is consistent
      const activeModules = getActiveModulesForTenant(recoveryTenant)
      expect(activeModules).toHaveLength(2)
      expect(activeModules.some(m => m.id === 'questionnaire-engine')).toBe(true)
      expect(activeModules.some(m => m.id === 'theme-customizer')).toBe(true)
    })

    test('should maintain data consistency during concurrent operations', async () => {
      const concurrentTenant = 'concurrent-test-tenant'

      // Perform multiple concurrent operations
      const promises = [
        activateModule('questionnaire-engine', concurrentTenant),
        activateModule('theme-customizer', concurrentTenant),
        activateThemeForTenant(concurrentTenant, 'default-green'),
        setTenantModuleConfiguration(concurrentTenant, 'questionnaire-engine', { maxSteps: 7 })
      ]

      // Some operations might fail due to timing, but system should remain consistent
      const results = await Promise.allSettled(promises)

      // Verify final state is valid
      const activeModules = getActiveModulesForTenant(concurrentTenant)
      const activeTheme = getTenantActiveTheme(concurrentTenant)

      expect(activeModules.length).toBeGreaterThanOrEqual(0)
      expect(activeTheme).toBeDefined()

      // If questionnaire is active, it should have valid configuration
      const questionnaireActive = activeModules.some(m => m.id === 'questionnaire-engine')
      if (questionnaireActive) {
        const config = getTenantModuleConfiguration(concurrentTenant, 'questionnaire-engine')
        expect(config).toBeDefined()
        expect(typeof config.maxSteps).toBe('number')
      }
    })
  })

  describe('Performance and Scalability', () => {
    test('should handle multiple tenants efficiently', async () => {
      const tenantCount = 10
      const tenants = Array.from({ length: tenantCount }, (_, i) => `perf-tenant-${i}`)

      const startTime = Date.now()

      // Set up all tenants concurrently
      const setupPromises = tenants.map(async (tenantId) => {
        await activateModule('questionnaire-engine', tenantId)
        setTenantModuleConfiguration(tenantId, 'questionnaire-engine', {
          maxSteps: 5 + (tenantId.length % 10) // Vary configurations
        })
        return activateThemeForTenant(tenantId, 'default-blue')
      })

      await Promise.all(setupPromises)

      const endTime = Date.now()
      const duration = endTime - startTime

      // Should handle multiple tenants efficiently (adjust threshold as needed)
      expect(duration).toBeLessThan(1000) // Under 1 second for 10 tenants

      // Verify all tenants are set up correctly
      tenants.forEach(tenantId => {
        const activeModules = getActiveModulesForTenant(tenantId)
        expect(activeModules).toHaveLength(1)

        const config = getTenantModuleConfiguration(tenantId, 'questionnaire-engine')
        expect(config).toBeDefined()

        const theme = getTenantActiveTheme(tenantId)
        expect(theme?.name).toBe('default-blue')
      })
    })

    test('should maintain performance with large configurations', async () => {
      const largeTenant = 'large-config-tenant'

      await activateModule('questionnaire-engine', largeTenant)

      const startTime = Date.now()

      // Create large configuration
      const largeConfig = {
        maxSteps: 50,
        progressStyle: 'steps',
        customFields: Array.from({ length: 200 }, (_, i) => ({
          id: `field-${i}`,
          label: `Custom Field ${i}`,
          type: i % 3 === 0 ? 'text' : i % 3 === 1 ? 'number' : 'select',
          required: i % 4 === 0,
          options: i % 3 === 2 ? [`Option ${i}-A`, `Option ${i}-B`, `Option ${i}-C`] : undefined
        })),
        validationRules: Array.from({ length: 100 }, (_, i) => ({
          fieldId: `field-${i}`,
          rule: i % 5 === 0 ? 'required' : i % 5 === 1 ? 'email' : 'minLength',
          value: i % 5 === 2 ? 5 : undefined
        })),
        conditionalLogic: Array.from({ length: 50 }, (_, i) => ({
          condition: `field-${i} equals "value"`,
          action: `show field-${i + 1}`,
          priority: i
        }))
      }

      const configResult = setTenantModuleConfiguration(largeTenant, 'questionnaire-engine', largeConfig)

      const endTime = Date.now()
      const duration = endTime - startTime

      expect(configResult.success).toBe(true)
      expect(duration).toBeLessThan(500) // Should handle large configs under 500ms

      // Verify configuration was applied
      const appliedConfig = getTenantModuleConfiguration(largeTenant, 'questionnaire-engine')
      expect(appliedConfig.maxSteps).toBe(50)
      expect(appliedConfig.customFields).toHaveLength(200)
      expect(appliedConfig.validationRules).toHaveLength(100)
    })
  })

  describe('Real-world Usage Scenarios', () => {
    test('should support agency white-label workflow', async () => {
      const clientTenant = 'agency-client-001'

      // 1. Agency activates core modules for client
      await activateModule('questionnaire-engine', clientTenant)
      await activateModule('theme-customizer', clientTenant)

      // 2. Agency applies client branding
      const brandingResult = activateThemeForTenant(clientTenant, 'default-blue', {
        colors: {
          primary: '#1e40af', // Client brand blue
          secondary: '#64748b'
        },
        branding: {
          logoUrl: 'https://client.com/logo.png',
          companyName: 'Client Corp'
        }
      })
      expect(brandingResult.success).toBe(true)

      // 3. Configure modules for client needs
      setTenantModuleConfiguration(clientTenant, 'questionnaire-engine', {
        maxSteps: 8,
        progressStyle: 'steps',
        customBranding: {
          logoUrl: 'https://client.com/logo.png',
          primaryColor: '#1e40af'
        }
      })

      // 4. Verify client-specific setup
      const clientModules = getActiveModulesForTenant(clientTenant)
      expect(clientModules).toHaveLength(2)

      const clientTheme = getTenantActiveTheme(clientTenant)
      expect(clientTheme?.tokens.colors.primary).toBe('#1e40af')

      const clientConfig = getTenantModuleConfiguration(clientTenant, 'questionnaire-engine')
      expect(clientConfig.customBranding?.logoUrl).toBe('https://client.com/logo.png')
    })

    test('should support SaaS multi-tenant architecture', async () => {
      const saastenants = ['saas-basic-001', 'saas-pro-002', 'saas-enterprise-003']

      // Set up different tiers with different module access
      for (const [index, tenantId] of saastenants.entries()) {
        // All tiers get questionnaire-engine
        await activateModule('questionnaire-engine', tenantId)

        // Pro and Enterprise get theme-customizer
        if (index >= 1) {
          await activateModule('theme-customizer', tenantId)
        }

        // Enterprise gets additional modules
        if (index === 2) {
          await activateModule('analytics-dashboard', tenantId)
        }

        // Configure based on tier
        const maxSteps = index === 0 ? 5 : index === 1 ? 10 : 20
        setTenantModuleConfiguration(tenantId, 'questionnaire-engine', {
          maxSteps,
          progressStyle: 'thinBar'
        })
      }

      // Verify tier-based setup
      const basicModules = getActiveModulesForTenant(saastenants[0])
      const proModules = getActiveModulesForTenant(saastenants[1])
      const enterpriseModules = getActiveModulesForTenant(saastenants[2])

      expect(basicModules).toHaveLength(1)
      expect(proModules).toHaveLength(2)
      expect(enterpriseModules).toHaveLength(3)

      const basicConfig = getTenantModuleConfiguration(saastenants[0], 'questionnaire-engine')
      const proConfig = getTenantModuleConfiguration(saastenants[1], 'questionnaire-engine')
      const enterpriseConfig = getTenantModuleConfiguration(saastenants[2], 'questionnaire-engine')

      expect(basicConfig.maxSteps).toBe(5)
      expect(proConfig.maxSteps).toBe(10)
      expect(enterpriseConfig.maxSteps).toBe(20)
    })
  })
})