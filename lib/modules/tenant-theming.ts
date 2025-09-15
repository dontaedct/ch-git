/**
 * HT-022.3.2: Simple Tenant Theming & Configuration
 *
 * Simple tenant theming system with per-tenant configuration management,
 * basic data separation, and module integration.
 */

import { ThemeTokens } from '@/types/config'
import { configManager } from './module-config'

export interface SimpleTenantTheme {
  tenantId: string
  name: string
  displayName: string
  isDefault: boolean
  isActive: boolean
  tokens: ThemeTokens
  presetId?: string
  customizations: Record<string, unknown>
  lastUpdated: Date
  version: string
}

export interface TenantThemeConfig {
  tenantId: string
  activeTheme: string
  availableThemes: string[]
  allowCustomization: boolean
  inheritFromDefault: boolean
  restrictions: {
    allowColorChanges: boolean
    allowFontChanges: boolean
    allowLayoutChanges: boolean
    maxCustomThemes: number
  }
  metadata: {
    createdAt: Date
    updatedAt: Date
    lastUsedAt: Date
  }
}

export interface ThemeActivationRequest {
  tenantId: string
  themeId: string
  customizations?: Record<string, unknown>
}

export interface ThemeActivationResult {
  success: boolean
  tenantId: string
  themeId: string
  message: string
  appliedTokens?: ThemeTokens
}

export interface TenantConfigurationRequest {
  tenantId: string
  moduleId: string
  config: Record<string, unknown>
  inheritFromDefault?: boolean
  validateOnly?: boolean
}

export interface TenantConfigurationResult {
  success: boolean
  tenantId: string
  moduleId: string
  config: Record<string, unknown>
  errors?: string[]
  warnings?: string[]
}

class SimpleTenantThemingManager {
  private tenantThemes: Map<string, Map<string, SimpleTenantTheme>> = new Map() // tenantId -> themeId -> theme
  private tenantConfigs: Map<string, TenantThemeConfig> = new Map() // tenantId -> config
  private activeThemes: Map<string, string> = new Map() // tenantId -> activeThemeId

  constructor() {
    this.initializeDefaultThemes()
  }

  private initializeDefaultThemes() {
    // Default theme presets
    const defaultThemes: Omit<SimpleTenantTheme, 'tenantId' | 'lastUpdated'>[] = [
      {
        name: 'default-blue',
        displayName: 'Professional Blue',
        isDefault: true,
        isActive: true,
        presetId: 'blue-preset',
        customizations: {},
        version: '1.0.0',
        tokens: {
          colors: {
            primary: '#3b82f6',
            neutral: {
              50: '#f8fafc',
              100: '#f1f5f9',
              200: '#e2e8f0',
              300: '#cbd5e1',
              400: '#94a3b8',
              500: '#64748b',
              600: '#475569',
              700: '#334155',
              800: '#1e293b',
              900: '#0f172a'
            },
            accent: '#10b981'
          },
          typography: {
            fontFamily: 'Inter, system-ui, sans-serif',
            scales: {
              display: '2.5rem',
              headline: '1.5rem',
              body: '1rem',
              caption: '0.875rem'
            }
          },
          motion: {
            duration: '150ms',
            easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
          },
          radii: {
            sm: '4px',
            md: '8px',
            lg: '12px'
          },
          shadows: {
            sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
          }
        }
      },
      {
        name: 'default-green',
        displayName: 'Nature Green',
        isDefault: true,
        isActive: false,
        presetId: 'green-preset',
        customizations: {},
        version: '1.0.0',
        tokens: {
          colors: {
            primary: '#10b981',
            neutral: {
              50: '#f0fdf4',
              100: '#dcfce7',
              200: '#bbf7d0',
              300: '#86efac',
              400: '#4ade80',
              500: '#22c55e',
              600: '#16a34a',
              700: '#15803d',
              800: '#166534',
              900: '#14532d'
            },
            accent: '#3b82f6'
          },
          typography: {
            fontFamily: 'Inter, system-ui, sans-serif',
            scales: {
              display: '2.5rem',
              headline: '1.5rem',
              body: '1rem',
              caption: '0.875rem'
            }
          },
          motion: {
            duration: '150ms',
            easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
          },
          radii: {
            sm: '4px',
            md: '8px',
            lg: '12px'
          },
          shadows: {
            sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
          }
        }
      },
      {
        name: 'default-purple',
        displayName: 'Creative Purple',
        isDefault: true,
        isActive: false,
        presetId: 'purple-preset',
        customizations: {},
        version: '1.0.0',
        tokens: {
          colors: {
            primary: '#8b5cf6',
            neutral: {
              50: '#faf5ff',
              100: '#f3e8ff',
              200: '#e9d5ff',
              300: '#d8b4fe',
              400: '#c084fc',
              500: '#a855f7',
              600: '#9333ea',
              700: '#7c3aed',
              800: '#6b21a8',
              900: '#581c87'
            },
            accent: '#f59e0b'
          },
          typography: {
            fontFamily: 'Inter, system-ui, sans-serif',
            scales: {
              display: '2.5rem',
              headline: '1.5rem',
              body: '1rem',
              caption: '0.875rem'
            }
          },
          motion: {
            duration: '150ms',
            easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
          },
          radii: {
            sm: '4px',
            md: '8px',
            lg: '12px'
          },
          shadows: {
            sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
          }
        }
      }
    ]

    // Initialize for default tenant
    const defaultTenantThemes = new Map<string, SimpleTenantTheme>()
    defaultThemes.forEach(theme => {
      const tenantTheme: SimpleTenantTheme = {
        ...theme,
        tenantId: 'default',
        lastUpdated: new Date()
      }
      defaultTenantThemes.set(theme.name, tenantTheme)
    })

    this.tenantThemes.set('default', defaultTenantThemes)
    this.activeThemes.set('default', 'default-blue')

    // Default tenant configuration
    this.tenantConfigs.set('default', {
      tenantId: 'default',
      activeTheme: 'default-blue',
      availableThemes: defaultThemes.map(t => t.name),
      allowCustomization: true,
      inheritFromDefault: false,
      restrictions: {
        allowColorChanges: true,
        allowFontChanges: false,
        allowLayoutChanges: false,
        maxCustomThemes: 5
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        lastUsedAt: new Date()
      }
    })
  }

  // Tenant Theme Management
  getTenantThemes(tenantId: string): SimpleTenantTheme[] {
    const themes = this.tenantThemes.get(tenantId) || new Map()
    return Array.from(themes.values())
  }

  getTenantTheme(tenantId: string, themeId: string): SimpleTenantTheme | undefined {
    const themes = this.tenantThemes.get(tenantId)
    return themes?.get(themeId)
  }

  getActiveTenantTheme(tenantId: string): SimpleTenantTheme | undefined {
    const activeThemeId = this.activeThemes.get(tenantId)
    if (!activeThemeId) {
      // Try to inherit from default tenant
      const defaultThemeId = this.activeThemes.get('default')
      return defaultThemeId ? this.getTenantTheme('default', defaultThemeId) : undefined
    }
    return this.getTenantTheme(tenantId, activeThemeId)
  }

  createTenantTheme(tenantId: string, theme: Omit<SimpleTenantTheme, 'tenantId' | 'lastUpdated'>): boolean {
    try {
      if (!this.tenantThemes.has(tenantId)) {
        this.tenantThemes.set(tenantId, new Map())
      }

      const themes = this.tenantThemes.get(tenantId)!
      const newTheme: SimpleTenantTheme = {
        ...theme,
        tenantId,
        lastUpdated: new Date()
      }

      themes.set(theme.name, newTheme)

      // Update tenant config
      const config = this.getTenantConfig(tenantId)
      if (config) {
        config.availableThemes.push(theme.name)
        config.metadata.updatedAt = new Date()
      }

      return true
    } catch (error) {
      console.error(`Failed to create tenant theme: ${error}`)
      return false
    }
  }

  activateTenantTheme(request: ThemeActivationRequest): ThemeActivationResult {
    const { tenantId, themeId, customizations } = request

    try {
      let theme = this.getTenantTheme(tenantId, themeId)

      // If not found for tenant, try to inherit from default
      if (!theme) {
        theme = this.getTenantTheme('default', themeId)
        if (theme) {
          // Clone the default theme for this tenant
          this.createTenantTheme(tenantId, {
            ...theme,
            customizations: customizations || {}
          })
          theme = this.getTenantTheme(tenantId, themeId)
        }
      }

      if (!theme) {
        return {
          success: false,
          tenantId,
          themeId,
          message: `Theme ${themeId} not found for tenant ${tenantId}`
        }
      }

      // Apply customizations if provided
      if (customizations) {
        theme.customizations = { ...theme.customizations, ...customizations }
        theme.lastUpdated = new Date()
      }

      // Set as active theme
      this.activeThemes.set(tenantId, themeId)

      // Update tenant config
      const config = this.getTenantConfig(tenantId)
      if (config) {
        config.activeTheme = themeId
        config.metadata.updatedAt = new Date()
        config.metadata.lastUsedAt = new Date()
      }

      // Apply theme tokens with customizations
      const appliedTokens = this.applyCustomizationsToTokens(theme.tokens, theme.customizations)

      return {
        success: true,
        tenantId,
        themeId,
        message: `Theme ${themeId} activated for tenant ${tenantId}`,
        appliedTokens
      }
    } catch (error) {
      return {
        success: false,
        tenantId,
        themeId,
        message: `Failed to activate theme: ${error}`
      }
    }
  }

  // Tenant Configuration Management
  getTenantConfig(tenantId: string): TenantThemeConfig | undefined {
    let config = this.tenantConfigs.get(tenantId)
    if (!config && tenantId !== 'default') {
      // Create config inheriting from default
      const defaultConfig = this.tenantConfigs.get('default')
      if (defaultConfig) {
        config = {
          ...defaultConfig,
          tenantId,
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            lastUsedAt: new Date()
          }
        }
        this.tenantConfigs.set(tenantId, config)
      }
    }
    return config
  }

  updateTenantConfig(tenantId: string, updates: Partial<TenantThemeConfig>): boolean {
    try {
      const config = this.getTenantConfig(tenantId)
      if (!config) return false

      Object.assign(config, updates, {
        metadata: {
          ...config.metadata,
          updatedAt: new Date()
        }
      })

      return true
    } catch (error) {
      console.error(`Failed to update tenant config: ${error}`)
      return false
    }
  }

  // Per-tenant module configuration
  setTenantModuleConfig(request: TenantConfigurationRequest): TenantConfigurationResult {
    const { tenantId, moduleId, config, inheritFromDefault = true, validateOnly = false } = request

    try {
      // Validate configuration
      const validation = configManager.validateConfig(moduleId, config)
      if (!validation.valid) {
        return {
          success: false,
          tenantId,
          moduleId,
          config,
          errors: validation.errors
        }
      }

      if (validateOnly) {
        return {
          success: true,
          tenantId,
          moduleId,
          config: validation.sanitizedConfig!,
          warnings: validation.errors
        }
      }

      // Set the configuration
      const success = configManager.setTenantConfig(tenantId, moduleId, config, inheritFromDefault)

      if (success) {
        return {
          success: true,
          tenantId,
          moduleId,
          config: configManager.getTenantConfig(tenantId, moduleId)
        }
      } else {
        return {
          success: false,
          tenantId,
          moduleId,
          config,
          errors: ['Failed to save configuration']
        }
      }
    } catch (error) {
      return {
        success: false,
        tenantId,
        moduleId,
        config,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }

  getTenantModuleConfig(tenantId: string, moduleId: string): Record<string, unknown> {
    return configManager.getTenantConfig(tenantId, moduleId)
  }

  getAllTenantModuleConfigs(tenantId: string): Record<string, Record<string, unknown>> {
    return configManager.getAllTenantConfigs(tenantId)
  }

  // Data separation and security
  validateTenantAccess(requestTenantId: string, targetTenantId: string): boolean {
    // Basic tenant isolation - tenants can only access their own data
    return requestTenantId === targetTenantId
  }

  sanitizeTenantData(tenantId: string, data: any): any {
    // Remove sensitive fields and ensure tenant isolation
    const sanitized = { ...data }

    // Remove internal fields
    delete sanitized.internalConfig
    delete sanitized.systemFlags
    delete sanitized.adminOverrides

    // Ensure tenant ID matches
    if (sanitized.tenantId && sanitized.tenantId !== tenantId) {
      delete sanitized.tenantId
    }

    return sanitized
  }

  // Multi-tenant security validation
  validateMultiTenantSecurity(tenantId: string): {
    valid: boolean
    issues: string[]
    recommendations: string[]
  } {
    const issues: string[] = []
    const recommendations: string[] = []

    const config = this.getTenantConfig(tenantId)
    if (!config) {
      issues.push('No tenant configuration found')
      recommendations.push('Initialize tenant configuration')
      return { valid: false, issues, recommendations }
    }

    // Check theme isolation
    const themes = this.getTenantThemes(tenantId)
    const hasOnlyTenantThemes = themes.every(theme => theme.tenantId === tenantId || theme.tenantId === 'default')
    if (!hasOnlyTenantThemes) {
      issues.push('Theme data leakage detected')
      recommendations.push('Audit and clean theme data')
    }

    // Check configuration isolation
    const moduleConfigs = this.getAllTenantModuleConfigs(tenantId)
    const sanitizedConfigs = this.sanitizeTenantData(tenantId, moduleConfigs)
    if (JSON.stringify(moduleConfigs) !== JSON.stringify(sanitizedConfigs)) {
      issues.push('Configuration data contains cross-tenant references')
      recommendations.push('Review and sanitize configuration data')
    }

    // Check customization limits
    const customThemes = themes.filter(theme => !theme.isDefault)
    if (customThemes.length > config.restrictions.maxCustomThemes) {
      issues.push(`Too many custom themes: ${customThemes.length}/${config.restrictions.maxCustomThemes}`)
      recommendations.push('Remove excess custom themes or increase limit')
    }

    return {
      valid: issues.length === 0,
      issues,
      recommendations
    }
  }

  // Helper methods
  private applyCustomizationsToTokens(baseTokens: ThemeTokens, customizations: Record<string, unknown>): ThemeTokens {
    const tokens = JSON.parse(JSON.stringify(baseTokens)) // Deep clone

    // Apply color customizations
    if (customizations.colors && typeof customizations.colors === 'object') {
      Object.assign(tokens.colors, customizations.colors)
    }

    // Apply typography customizations
    if (customizations.typography && typeof customizations.typography === 'object') {
      Object.assign(tokens.typography, customizations.typography)
    }

    // Apply other customizations
    if (customizations.radii && typeof customizations.radii === 'object') {
      Object.assign(tokens.radii, customizations.radii)
    }

    if (customizations.shadows && typeof customizations.shadows === 'object') {
      Object.assign(tokens.shadows, customizations.shadows)
    }

    return tokens
  }

  // Export/import for migration
  exportTenantData(tenantId: string): {
    themes: SimpleTenantTheme[]
    config: TenantThemeConfig | undefined
    moduleConfigs: Record<string, Record<string, unknown>>
  } {
    return {
      themes: this.getTenantThemes(tenantId),
      config: this.getTenantConfig(tenantId),
      moduleConfigs: this.getAllTenantModuleConfigs(tenantId)
    }
  }

  importTenantData(tenantId: string, data: {
    themes?: SimpleTenantTheme[]
    config?: TenantThemeConfig
    moduleConfigs?: Record<string, Record<string, unknown>>
  }): boolean {
    try {
      // Import themes
      if (data.themes) {
        const themes = new Map<string, SimpleTenantTheme>()
        data.themes.forEach(theme => {
          themes.set(theme.name, { ...theme, tenantId })
        })
        this.tenantThemes.set(tenantId, themes)
      }

      // Import config
      if (data.config) {
        this.tenantConfigs.set(tenantId, { ...data.config, tenantId })
      }

      // Import module configs
      if (data.moduleConfigs) {
        configManager.importTenantConfigs(tenantId, data.moduleConfigs as any)
      }

      return true
    } catch (error) {
      console.error(`Failed to import tenant data: ${error}`)
      return false
    }
  }
}

// Singleton instance
export const tenantThemingManager = new SimpleTenantThemingManager()

// Utility functions
export function getTenantActiveTheme(tenantId?: string): SimpleTenantTheme | undefined {
  return tenantThemingManager.getActiveTenantTheme(tenantId || 'default')
}

export function activateThemeForTenant(tenantId: string, themeId: string, customizations?: Record<string, unknown>): ThemeActivationResult {
  return tenantThemingManager.activateTenantTheme({ tenantId, themeId, customizations })
}

export function getTenantThemes(tenantId: string): SimpleTenantTheme[] {
  return tenantThemingManager.getTenantThemes(tenantId)
}

export function setTenantModuleConfiguration(tenantId: string, moduleId: string, config: Record<string, unknown>): TenantConfigurationResult {
  return tenantThemingManager.setTenantModuleConfig({ tenantId, moduleId, config })
}

export function getTenantModuleConfiguration(tenantId: string, moduleId: string): Record<string, unknown> {
  return tenantThemingManager.getTenantModuleConfig(tenantId, moduleId)
}

export function validateTenantSecurity(tenantId: string) {
  return tenantThemingManager.validateMultiTenantSecurity(tenantId)
}