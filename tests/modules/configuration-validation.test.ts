/**
 * HT-022.3.4: Configuration Validation Tests
 *
 * Comprehensive tests for module and tenant configuration validation,
 * schema compliance, and data integrity.
 */

import {
  tenantThemingManager,
  setTenantModuleConfiguration,
  getTenantModuleConfiguration
} from '@/lib/modules/tenant-theming'

describe('Configuration Validation', () => {
  describe('Schema Validation', () => {
    test('should validate questionnaire-engine configuration schema', () => {
      const validConfigs = [
        {
          maxSteps: 5,
          progressStyle: 'steps',
          allowSkip: true
        },
        {
          maxSteps: 10,
          progressStyle: 'thinBar',
          allowSkip: false,
          customFields: []
        },
        {
          maxSteps: 20,
          progressStyle: 'steps',
          allowSkip: true,
          customFields: [
            { id: 'field1', label: 'Field 1', type: 'text', required: true }
          ]
        }
      ]

      validConfigs.forEach((config, index) => {
        const result = tenantThemingManager.setTenantModuleConfig({
          tenantId: `schema-valid-${index}`,
          moduleId: 'questionnaire-engine',
          config,
          validateOnly: true
        })

        expect(result.success).toBe(true)
        expect(result.errors).toBeUndefined()
      })
    })

    test('should reject invalid questionnaire-engine configurations', () => {
      const invalidConfigs = [
        {
          maxSteps: 0, // Invalid: must be positive
          progressStyle: 'steps'
        },
        {
          maxSteps: 5,
          progressStyle: 'invalidStyle' // Invalid: not in enum
        },
        {
          maxSteps: '5', // Invalid: must be number
          progressStyle: 'steps'
        },
        {
          maxSteps: 5,
          progressStyle: 'steps',
          allowSkip: 'yes' // Invalid: must be boolean
        },
        {
          maxSteps: 101, // Invalid: exceeds maximum
          progressStyle: 'steps'
        }
      ]

      invalidConfigs.forEach((config, index) => {
        const result = tenantThemingManager.setTenantModuleConfig({
          tenantId: `schema-invalid-${index}`,
          moduleId: 'questionnaire-engine',
          config,
          validateOnly: true
        })

        expect(result.success).toBe(false)
        expect(result.errors).toBeDefined()
        expect(result.errors!.length).toBeGreaterThan(0)
      })
    })

    test('should validate theme-customizer configuration schema', () => {
      const validConfigs = [
        {
          allowCustomColors: true,
          allowCustomFonts: false,
          maxThemes: 3,
          previewMode: true
        },
        {
          allowCustomColors: false,
          maxThemes: 1
        },
        {
          allowCustomColors: true,
          allowCustomFonts: true,
          maxThemes: 10,
          previewMode: false,
          restrictedColors: ['#ff0000', '#00ff00']
        }
      ]

      validConfigs.forEach((config, index) => {
        const result = tenantThemingManager.setTenantModuleConfig({
          tenantId: `theme-valid-${index}`,
          moduleId: 'theme-customizer',
          config,
          validateOnly: true
        })

        expect(result.success).toBe(true)
      })
    })

    test('should reject invalid theme-customizer configurations', () => {
      const invalidConfigs = [
        {
          allowCustomColors: 'true', // Invalid: must be boolean
          maxThemes: 3
        },
        {
          allowCustomColors: true,
          maxThemes: 0 // Invalid: must be positive
        },
        {
          allowCustomColors: true,
          maxThemes: 'unlimited' // Invalid: must be number
        },
        {
          allowCustomColors: true,
          maxThemes: 101 // Invalid: exceeds maximum
        }
      ]

      invalidConfigs.forEach((config, index) => {
        const result = tenantThemingManager.setTenantModuleConfig({
          tenantId: `theme-invalid-${index}`,
          moduleId: 'theme-customizer',
          config,
          validateOnly: true
        })

        expect(result.success).toBe(false)
        expect(result.errors?.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Data Type Validation', () => {
    test('should validate number ranges correctly', () => {
      const numberValidationCases = [
        { maxSteps: 1, expectValid: true },
        { maxSteps: 50, expectValid: true },
        { maxSteps: 100, expectValid: true },
        { maxSteps: 0, expectValid: false },
        { maxSteps: -1, expectValid: false },
        { maxSteps: 101, expectValid: false },
        { maxSteps: 1.5, expectValid: false }, // Should be integer
        { maxSteps: '10', expectValid: false } // Should be number
      ]

      numberValidationCases.forEach(({ maxSteps, expectValid }, index) => {
        const result = tenantThemingManager.setTenantModuleConfig({
          tenantId: `number-validation-${index}`,
          moduleId: 'questionnaire-engine',
          config: { maxSteps, progressStyle: 'steps' },
          validateOnly: true
        })

        expect(result.success).toBe(expectValid)
      })
    })

    test('should validate enum values correctly', () => {
      const enumValidationCases = [
        { progressStyle: 'steps', expectValid: true },
        { progressStyle: 'thinBar', expectValid: true },
        { progressStyle: 'percentage', expectValid: true },
        { progressStyle: 'invalid', expectValid: false },
        { progressStyle: 'STEPS', expectValid: false }, // Case sensitive
        { progressStyle: '', expectValid: false },
        { progressStyle: null, expectValid: false }
      ]

      enumValidationCases.forEach(({ progressStyle, expectValid }, index) => {
        const result = tenantThemingManager.setTenantModuleConfig({
          tenantId: `enum-validation-${index}`,
          moduleId: 'questionnaire-engine',
          config: { maxSteps: 5, progressStyle },
          validateOnly: true
        })

        expect(result.success).toBe(expectValid)
      })
    })

    test('should validate boolean values correctly', () => {
      const booleanValidationCases = [
        { allowSkip: true, expectValid: true },
        { allowSkip: false, expectValid: true },
        { allowSkip: 'true', expectValid: false },
        { allowSkip: 1, expectValid: false },
        { allowSkip: 0, expectValid: false },
        { allowSkip: null, expectValid: false }
      ]

      booleanValidationCases.forEach(({ allowSkip, expectValid }, index) => {
        const result = tenantThemingManager.setTenantModuleConfig({
          tenantId: `boolean-validation-${index}`,
          moduleId: 'questionnaire-engine',
          config: { maxSteps: 5, progressStyle: 'steps', allowSkip },
          validateOnly: true
        })

        expect(result.success).toBe(expectValid)
      })
    })

    test('should validate array structures correctly', () => {
      const arrayValidationCases = [
        {
          customFields: [],
          expectValid: true
        },
        {
          customFields: [
            { id: 'field1', label: 'Field 1', type: 'text', required: true }
          ],
          expectValid: true
        },
        {
          customFields: [
            { id: 'field1', label: 'Field 1', type: 'text', required: true },
            { id: 'field2', label: 'Field 2', type: 'number', required: false }
          ],
          expectValid: true
        },
        {
          customFields: [
            { id: '', label: 'Field 1', type: 'text', required: true } // Invalid: empty id
          ],
          expectValid: false
        },
        {
          customFields: [
            { label: 'Field 1', type: 'text', required: true } // Invalid: missing id
          ],
          expectValid: false
        },
        {
          customFields: [
            { id: 'field1', label: 'Field 1', type: 'invalidType', required: true }
          ],
          expectValid: false
        }
      ]

      arrayValidationCases.forEach(({ customFields, expectValid }, index) => {
        const result = tenantThemingManager.setTenantModuleConfig({
          tenantId: `array-validation-${index}`,
          moduleId: 'questionnaire-engine',
          config: { maxSteps: 5, progressStyle: 'steps', customFields },
          validateOnly: true
        })

        expect(result.success).toBe(expectValid)
      })
    })
  })

  describe('Business Logic Validation', () => {
    test('should validate cross-field dependencies', () => {
      // Test cases where one field affects validation of another
      const crossValidationCases = [
        {
          config: {
            maxSteps: 5,
            progressStyle: 'steps',
            allowSkip: true,
            skipValidation: 'warn' // Valid when allowSkip is true
          },
          expectValid: true
        },
        {
          config: {
            maxSteps: 5,
            progressStyle: 'steps',
            allowSkip: false,
            skipValidation: 'warn' // Invalid when allowSkip is false
          },
          expectValid: false
        },
        {
          config: {
            maxSteps: 10,
            progressStyle: 'percentage',
            customFields: Array.from({ length: 15 }, (_, i) => ({
              id: `field${i}`,
              label: `Field ${i}`,
              type: 'text',
              required: true
            })) // Too many fields for maxSteps
          },
          expectValid: false
        }
      ]

      crossValidationCases.forEach(({ config, expectValid }, index) => {
        const result = tenantThemingManager.setTenantModuleConfig({
          tenantId: `cross-validation-${index}`,
          moduleId: 'questionnaire-engine',
          config,
          validateOnly: true
        })

        expect(result.success).toBe(expectValid)
      })
    })

    test('should validate resource limits', () => {
      const resourceLimitCases = [
        {
          config: {
            maxSteps: 100,
            customFields: Array.from({ length: 100 }, (_, i) => ({
              id: `field${i}`,
              label: `Field ${i}`,
              type: 'text',
              required: false
            }))
          },
          expectValid: true
        },
        {
          config: {
            maxSteps: 100,
            customFields: Array.from({ length: 1000 }, (_, i) => ({
              id: `field${i}`,
              label: `Field ${i}`,
              type: 'text',
              required: false
            })) // Exceeds reasonable limits
          },
          expectValid: false
        }
      ]

      resourceLimitCases.forEach(({ config, expectValid }, index) => {
        const result = tenantThemingManager.setTenantModuleConfig({
          tenantId: `resource-limit-${index}`,
          moduleId: 'questionnaire-engine',
          config,
          validateOnly: true
        })

        expect(result.success).toBe(expectValid)
      })
    })

    test('should validate tenant-specific restrictions', () => {
      const tenantId = 'restricted-tenant'

      // Set up tenant with restrictions
      tenantThemingManager.updateTenantConfig(tenantId, {
        allowCustomization: true,
        restrictions: {
          allowColorChanges: false,
          allowFontChanges: false,
          allowLayoutChanges: false,
          maxCustomThemes: 1
        }
      })

      // Try to set configuration that violates restrictions
      const restrictedConfig = {
        maxSteps: 5,
        progressStyle: 'steps',
        customBranding: {
          primaryColor: '#ff0000', // Should be rejected due to color restrictions
          fontFamily: 'Comic Sans MS' // Should be rejected due to font restrictions
        }
      }

      const result = tenantThemingManager.setTenantModuleConfig({
        tenantId,
        moduleId: 'questionnaire-engine',
        config: restrictedConfig,
        validateOnly: true
      })

      expect(result.success).toBe(false)
      expect(result.errors?.some(error => error.includes('color changes not allowed'))).toBe(true)
      expect(result.errors?.some(error => error.includes('font changes not allowed'))).toBe(true)
    })
  })

  describe('Configuration Migration and Compatibility', () => {
    test('should handle configuration version upgrades', () => {
      const tenantId = 'version-upgrade-tenant'

      // Simulate old configuration format
      const oldConfig = {
        maxSteps: 10,
        progressStyle: 'thinBar',
        // Old format fields
        oldStyleField: true,
        deprecatedOption: 'value'
      }

      const result = tenantThemingManager.setTenantModuleConfig({
        tenantId,
        moduleId: 'questionnaire-engine',
        config: oldConfig,
        validateOnly: false,
        migrateFromVersion: '1.0.0'
      })

      expect(result.success).toBe(true)

      // Verify migration was applied
      const migratedConfig = getTenantModuleConfiguration(tenantId, 'questionnaire-engine')
      expect(migratedConfig.maxSteps).toBe(10)
      expect(migratedConfig.progressStyle).toBe('thinBar')
      expect(migratedConfig.oldStyleField).toBeUndefined() // Should be removed
    })

    test('should maintain backward compatibility', () => {
      const tenantId = 'backward-compat-tenant'

      // Use minimal configuration (v1.0 style)
      const minimalConfig = {
        maxSteps: 5
      }

      const result = tenantThemingManager.setTenantModuleConfig({
        tenantId,
        moduleId: 'questionnaire-engine',
        config: minimalConfig,
        validateOnly: false
      })

      expect(result.success).toBe(true)

      // Verify defaults were applied for missing fields
      const config = getTenantModuleConfiguration(tenantId, 'questionnaire-engine')
      expect(config.maxSteps).toBe(5)
      expect(config.progressStyle).toBe('thinBar') // Default value
      expect(config.allowSkip).toBe(false) // Default value
    })

    test('should validate configuration exports/imports', () => {
      const sourceTenant = 'export-source'
      const targetTenant = 'import-target'

      // Set up source configuration
      setTenantModuleConfiguration(sourceTenant, 'questionnaire-engine', {
        maxSteps: 8,
        progressStyle: 'steps',
        allowSkip: true,
        customFields: [
          { id: 'name', label: 'Name', type: 'text', required: true },
          { id: 'email', label: 'Email', type: 'email', required: true }
        ]
      })

      // Export configuration
      const exportData = tenantThemingManager.exportTenantData(sourceTenant)

      // Validate export format
      expect(exportData).toBeDefined()
      expect(exportData.moduleConfigs).toBeDefined()
      expect(exportData.moduleConfigs['questionnaire-engine']).toBeDefined()

      const exportedConfig = exportData.moduleConfigs['questionnaire-engine']
      expect(exportedConfig.config.maxSteps).toBe(8)
      expect(exportedConfig.config.customFields).toHaveLength(2)

      // Import to target tenant
      const importResult = tenantThemingManager.importTenantData(targetTenant, exportData)
      expect(importResult).toBe(true)

      // Verify imported configuration
      const importedConfig = getTenantModuleConfiguration(targetTenant, 'questionnaire-engine')
      expect(importedConfig.maxSteps).toBe(8)
      expect(importedConfig.progressStyle).toBe('steps')
      expect(importedConfig.customFields).toHaveLength(2)
    })
  })

  describe('Security and Sanitization', () => {
    test('should sanitize malicious configuration input', () => {
      const maliciousConfig = {
        maxSteps: 5,
        progressStyle: 'steps',
        customFields: [
          {
            id: 'field1',
            label: '<script>alert("XSS")</script>', // XSS attempt
            type: 'text',
            required: true
          }
        ],
        internalSystemFlag: true, // Should be stripped
        __proto__: { malicious: 'payload' }, // Prototype pollution attempt
        constructor: { name: 'malicious' }
      }

      const result = tenantThemingManager.setTenantModuleConfig({
        tenantId: 'security-test',
        moduleId: 'questionnaire-engine',
        config: maliciousConfig,
        validateOnly: false
      })

      expect(result.success).toBe(true)

      // Verify sanitization
      const config = getTenantModuleConfiguration('security-test', 'questionnaire-engine')
      expect(config.customFields[0].label).not.toContain('<script>')
      expect(config.internalSystemFlag).toBeUndefined()
      expect(config.__proto__).toBeUndefined()
      expect(config.constructor).toBeUndefined()
    })

    test('should prevent tenant data leakage', () => {
      const tenant1 = 'tenant-1'
      const tenant2 = 'tenant-2'

      // Set up different configurations for each tenant
      setTenantModuleConfiguration(tenant1, 'questionnaire-engine', { maxSteps: 5 })
      setTenantModuleConfiguration(tenant2, 'questionnaire-engine', { maxSteps: 10 })

      // Try to access tenant1's config as tenant2
      const config1 = getTenantModuleConfiguration(tenant1, 'questionnaire-engine')
      const config2 = getTenantModuleConfiguration(tenant2, 'questionnaire-engine')

      // Verify isolation
      expect(config1.maxSteps).toBe(5)
      expect(config2.maxSteps).toBe(10)

      // Verify no cross-contamination
      expect(config1).not.toEqual(config2)
    })

    test('should validate tenant access permissions', () => {
      const restrictedTenant = 'restricted-access-tenant'

      // Set up tenant with no customization permissions
      tenantThemingManager.updateTenantConfig(restrictedTenant, {
        allowCustomization: false,
        restrictions: {
          allowColorChanges: false,
          allowFontChanges: false,
          allowLayoutChanges: false,
          maxCustomThemes: 0
        }
      })

      // Try to set configuration on restricted tenant
      const result = tenantThemingManager.setTenantModuleConfig({
        tenantId: restrictedTenant,
        moduleId: 'questionnaire-engine',
        config: { maxSteps: 20, progressStyle: 'steps' },
        validateOnly: false
      })

      expect(result.success).toBe(false)
      expect(result.errors?.some(error => error.includes('customization not allowed'))).toBe(true)
    })
  })
})