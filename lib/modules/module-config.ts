/**
 * HT-022.3.1: Module Configuration Management
 *
 * Simple configuration management system for modules with validation,
 * inheritance, and tenant-specific overrides.
 */

import { z } from 'zod'

export interface ModuleConfigSchema {
  [key: string]: z.ZodSchema
}

export interface ConfigValidationResult {
  valid: boolean
  errors: string[]
  sanitizedConfig?: Record<string, unknown>
}

export interface TenantModuleConfig {
  moduleId: string
  tenantId: string
  config: Record<string, unknown>
  schema?: ModuleConfigSchema
  inheritFromDefault: boolean
  lastUpdated: Date
  version: string
}

class ModuleConfigManager {
  private schemas: Map<string, ModuleConfigSchema> = new Map()
  private defaultConfigs: Map<string, Record<string, unknown>> = new Map()
  private tenantConfigs: Map<string, Map<string, TenantModuleConfig>> = new Map() // tenantId -> moduleId -> config

  constructor() {
    this.initializeDefaultSchemas()
  }

  private initializeDefaultSchemas() {
    // Default schemas for built-in modules
    const schemas: Record<string, ModuleConfigSchema> = {
      'questionnaire-engine': {
        maxSteps: z.number().min(1).max(50).default(10),
        allowSkipRequired: z.boolean().default(false),
        saveProgress: z.boolean().default(true),
        progressStyle: z.enum(['thinBar', 'steps', 'percentage']).default('thinBar')
      },
      'consultation-generator': {
        aiProvider: z.enum(['openai', 'anthropic', 'local']).default('openai'),
        maxTokens: z.number().min(100).max(4000).default(2000),
        temperature: z.number().min(0).max(1).default(0.7),
        includeRecommendations: z.boolean().default(true)
      },
      'theme-customizer': {
        allowCustomColors: z.boolean().default(true),
        allowCustomFonts: z.boolean().default(false),
        maxThemes: z.number().min(1).max(10).default(5),
        previewMode: z.boolean().default(true)
      },
      'email-integration': {
        provider: z.enum(['smtp', 'sendgrid', 'mailgun']).default('smtp'),
        fromAddress: z.string().email(),
        templates: z.array(z.string()).default(['consultation', 'welcome']),
        bccAdmin: z.boolean().default(false)
      },
      'analytics-basic': {
        trackPageViews: z.boolean().default(true),
        trackEvents: z.boolean().default(true),
        anonymizeIp: z.boolean().default(true),
        retentionDays: z.number().min(1).max(365).default(90)
      }
    }

    Object.entries(schemas).forEach(([moduleId, schema]) => {
      this.schemas.set(moduleId, schema)
    })

    // Set default configurations
    const defaults: Record<string, Record<string, unknown>> = {
      'questionnaire-engine': {
        maxSteps: 10,
        allowSkipRequired: false,
        saveProgress: true,
        progressStyle: 'thinBar'
      },
      'consultation-generator': {
        aiProvider: 'openai',
        maxTokens: 2000,
        temperature: 0.7,
        includeRecommendations: true
      },
      'theme-customizer': {
        allowCustomColors: true,
        allowCustomFonts: false,
        maxThemes: 5,
        previewMode: true
      },
      'email-integration': {
        provider: 'smtp',
        fromAddress: 'noreply@example.com',
        templates: ['consultation', 'welcome'],
        bccAdmin: false
      },
      'analytics-basic': {
        trackPageViews: true,
        trackEvents: true,
        anonymizeIp: true,
        retentionDays: 90
      }
    }

    Object.entries(defaults).forEach(([moduleId, config]) => {
      this.defaultConfigs.set(moduleId, config)
    })
  }

  registerModuleSchema(moduleId: string, schema: ModuleConfigSchema): void {
    this.schemas.set(moduleId, schema)
  }

  setDefaultConfig(moduleId: string, config: Record<string, unknown>): boolean {
    const validation = this.validateConfig(moduleId, config)
    if (!validation.valid) {
      console.error(`Invalid default config for ${moduleId}:`, validation.errors)
      return false
    }

    this.defaultConfigs.set(moduleId, validation.sanitizedConfig!)
    return true
  }

  validateConfig(moduleId: string, config: Record<string, unknown>): ConfigValidationResult {
    const schema = this.schemas.get(moduleId)
    if (!schema) {
      return { valid: true, errors: [], sanitizedConfig: config }
    }

    const errors: string[] = []
    const sanitizedConfig: Record<string, unknown> = {}

    for (const [key, validator] of Object.entries(schema)) {
      try {
        const result = validator.safeParse(config[key])
        if (result.success) {
          sanitizedConfig[key] = result.data
        } else {
          errors.push(`${key}: ${result.error.errors.map(e => e.message).join(', ')}`)
        }
      } catch (error) {
        errors.push(`${key}: validation error - ${error}`)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitizedConfig: errors.length === 0 ? sanitizedConfig : undefined
    }
  }

  setTenantConfig(
    tenantId: string,
    moduleId: string,
    config: Record<string, unknown>,
    inheritFromDefault: boolean = true
  ): boolean {
    const validation = this.validateConfig(moduleId, config)
    if (!validation.valid) {
      console.error(`Invalid tenant config for ${moduleId}:`, validation.errors)
      return false
    }

    if (!this.tenantConfigs.has(tenantId)) {
      this.tenantConfigs.set(tenantId, new Map())
    }

    const tenantModuleConfigs = this.tenantConfigs.get(tenantId)!
    const tenantConfig: TenantModuleConfig = {
      moduleId,
      tenantId,
      config: validation.sanitizedConfig!,
      schema: this.schemas.get(moduleId),
      inheritFromDefault,
      lastUpdated: new Date(),
      version: '1.0.0'
    }

    tenantModuleConfigs.set(moduleId, tenantConfig)
    return true
  }

  getTenantConfig(tenantId: string, moduleId: string): Record<string, unknown> {
    const tenantModuleConfigs = this.tenantConfigs.get(tenantId)
    const tenantConfig = tenantModuleConfigs?.get(moduleId)

    if (!tenantConfig) {
      // Return default config if no tenant-specific config exists
      return this.getDefaultConfig(moduleId)
    }

    if (tenantConfig.inheritFromDefault) {
      // Merge with default config, tenant config takes precedence
      const defaultConfig = this.getDefaultConfig(moduleId)
      return { ...defaultConfig, ...tenantConfig.config }
    }

    return tenantConfig.config
  }

  getDefaultConfig(moduleId: string): Record<string, unknown> {
    return this.defaultConfigs.get(moduleId) || {}
  }

  getAllTenantConfigs(tenantId: string): Record<string, Record<string, unknown>> {
    const tenantModuleConfigs = this.tenantConfigs.get(tenantId)
    if (!tenantModuleConfigs) {
      return {}
    }

    const result: Record<string, Record<string, unknown>> = {}
    tenantModuleConfigs.forEach((config, moduleId) => {
      result[moduleId] = this.getTenantConfig(tenantId, moduleId)
    })

    return result
  }

  deleteTenantConfig(tenantId: string, moduleId: string): boolean {
    const tenantModuleConfigs = this.tenantConfigs.get(tenantId)
    if (!tenantModuleConfigs) {
      return false
    }

    return tenantModuleConfigs.delete(moduleId)
  }

  deleteTenantConfigs(tenantId: string): boolean {
    return this.tenantConfigs.delete(tenantId)
  }

  getModuleSchema(moduleId: string): ModuleConfigSchema | undefined {
    return this.schemas.get(moduleId)
  }

  // Configuration inheritance utilities
  mergeConfigs(...configs: Record<string, unknown>[]): Record<string, unknown> {
    return configs.reduce((merged, config) => ({ ...merged, ...config }), {})
  }

  // Simple configuration versioning
  updateTenantConfigVersion(tenantId: string, moduleId: string, version: string): boolean {
    const tenantModuleConfigs = this.tenantConfigs.get(tenantId)
    const config = tenantModuleConfigs?.get(moduleId)

    if (!config) return false

    config.version = version
    config.lastUpdated = new Date()
    return true
  }

  getTenantConfigMetadata(tenantId: string, moduleId: string): {
    lastUpdated?: Date
    version?: string
    inheritFromDefault?: boolean
  } {
    const tenantModuleConfigs = this.tenantConfigs.get(tenantId)
    const config = tenantModuleConfigs?.get(moduleId)

    if (!config) return {}

    return {
      lastUpdated: config.lastUpdated,
      version: config.version,
      inheritFromDefault: config.inheritFromDefault
    }
  }

  // Export configuration for backup/migration
  exportTenantConfigs(tenantId: string): Record<string, TenantModuleConfig> {
    const tenantModuleConfigs = this.tenantConfigs.get(tenantId)
    if (!tenantModuleConfigs) return {}

    const exported: Record<string, TenantModuleConfig> = {}
    tenantModuleConfigs.forEach((config, moduleId) => {
      exported[moduleId] = { ...config, schema: undefined } // Remove schema for export
    })

    return exported
  }

  // Import configuration from backup/migration
  importTenantConfigs(tenantId: string, configs: Record<string, TenantModuleConfig>): boolean {
    try {
      if (!this.tenantConfigs.has(tenantId)) {
        this.tenantConfigs.set(tenantId, new Map())
      }

      const tenantModuleConfigs = this.tenantConfigs.get(tenantId)!

      Object.entries(configs).forEach(([moduleId, config]) => {
        // Validate imported config
        const validation = this.validateConfig(moduleId, config.config)
        if (validation.valid) {
          const importedConfig: TenantModuleConfig = {
            ...config,
            schema: this.schemas.get(moduleId), // Restore schema reference
            config: validation.sanitizedConfig!
          }
          tenantModuleConfigs.set(moduleId, importedConfig)
        } else {
          console.warn(`Skipping invalid imported config for ${moduleId}:`, validation.errors)
        }
      })

      return true
    } catch (error) {
      console.error('Failed to import tenant configs:', error)
      return false
    }
  }
}

// Singleton instance
export const configManager = new ModuleConfigManager()

// Utility functions
export function getModuleConfig(moduleId: string, tenantId?: string): Record<string, unknown> {
  if (tenantId) {
    return configManager.getTenantConfig(tenantId, moduleId)
  }
  return configManager.getDefaultConfig(moduleId)
}

export function setModuleConfig(
  moduleId: string,
  config: Record<string, unknown>,
  tenantId?: string
): boolean {
  if (tenantId) {
    return configManager.setTenantConfig(tenantId, moduleId, config)
  }
  return configManager.setDefaultConfig(moduleId, config)
}

export function validateModuleConfig(moduleId: string, config: Record<string, unknown>): ConfigValidationResult {
  return configManager.validateConfig(moduleId, config)
}

export function registerModuleConfigSchema(moduleId: string, schema: ModuleConfigSchema): void {
  configManager.registerModuleSchema(moduleId, schema)
}