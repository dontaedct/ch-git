/**
 * HT-022.3.3: Module Management UI Hooks
 *
 * React hooks for module management interface with state management,
 * real-time updates, and error handling.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getAllAvailableModules,
  getActiveModulesForTenant,
  activateModule,
  deactivateModule,
  getTenantActiveTheme,
  getTenantThemes,
  activateThemeForTenant,
  setTenantModuleConfiguration,
  getTenantModuleConfiguration,
  validateTenantSecurity,
  type ModuleInfo,
  type SimpleTenantTheme,
  type ThemeActivationResult,
  type TenantConfigurationResult
} from '@/lib/modules'

export interface ModuleManagementState {
  availableModules: ModuleInfo[]
  activeModules: ModuleInfo[]
  availableThemes: SimpleTenantTheme[]
  activeTheme: SimpleTenantTheme | undefined
  securityHealth: any
  isLoading: boolean
  error: string | null
}

export interface ModuleManagementActions {
  refreshData: () => Promise<void>
  toggleModule: (moduleId: string, isActive: boolean) => Promise<boolean>
  activateTheme: (themeId: string, customizations?: any) => Promise<ThemeActivationResult>
  saveModuleConfig: (moduleId: string, config: Record<string, unknown>) => Promise<TenantConfigurationResult>
  getModuleConfig: (moduleId: string) => Record<string, unknown>
  changeTenant: (tenantId: string) => void
}

export function useModuleManagement(initialTenant: string = 'default'): [ModuleManagementState, ModuleManagementActions] {
  const [state, setState] = useState<ModuleManagementState>({
    availableModules: [],
    activeModules: [],
    availableThemes: [],
    activeTheme: undefined,
    securityHealth: null,
    isLoading: false,
    error: null
  })

  const [currentTenant, setCurrentTenant] = useState(initialTenant)

  // Load all data for current tenant
  const loadData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const [allModules, activeModules, themes, activeTheme, security] = await Promise.all([
        Promise.resolve(getAllAvailableModules()),
        Promise.resolve(getActiveModulesForTenant(currentTenant)),
        Promise.resolve(getTenantThemes(currentTenant)),
        Promise.resolve(getTenantActiveTheme(currentTenant)),
        Promise.resolve(validateTenantSecurity(currentTenant))
      ])

      setState(prev => ({
        ...prev,
        availableModules: allModules,
        activeModules: activeModules,
        availableThemes: themes,
        activeTheme: activeTheme,
        securityHealth: security,
        isLoading: false,
        error: null
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load data'
      }))
    }
  }, [currentTenant])

  // Load data when tenant changes
  useEffect(() => {
    loadData()
  }, [loadData])

  // Actions
  const actions: ModuleManagementActions = {
    refreshData: loadData,

    toggleModule: async (moduleId: string, isActive: boolean): Promise<boolean> => {
      setState(prev => ({ ...prev, isLoading: true }))

      try {
        let success = false

        if (isActive) {
          success = await deactivateModule(moduleId, currentTenant)
        } else {
          const result = await activateModule(moduleId, currentTenant)
          success = result.success
        }

        if (success) {
          // Reload active modules
          const activeModules = getActiveModulesForTenant(currentTenant)
          setState(prev => ({
            ...prev,
            activeModules,
            isLoading: false
          }))
        } else {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: `Failed to ${isActive ? 'deactivate' : 'activate'} module`
          }))
        }

        return success
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Module operation failed'
        }))
        return false
      }
    },

    activateTheme: async (themeId: string, customizations?: any): Promise<ThemeActivationResult> => {
      setState(prev => ({ ...prev, isLoading: true }))

      try {
        const result = activateThemeForTenant(currentTenant, themeId, customizations)

        if (result.success) {
          // Reload theme data
          const [themes, activeTheme] = await Promise.all([
            Promise.resolve(getTenantThemes(currentTenant)),
            Promise.resolve(getTenantActiveTheme(currentTenant))
          ])

          setState(prev => ({
            ...prev,
            availableThemes: themes,
            activeTheme: activeTheme,
            isLoading: false
          }))
        } else {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: result.message
          }))
        }

        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Theme activation failed'
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage
        }))

        return {
          success: false,
          tenantId: currentTenant,
          themeId,
          message: errorMessage
        }
      }
    },

    saveModuleConfig: async (moduleId: string, config: Record<string, unknown>): Promise<TenantConfigurationResult> => {
      setState(prev => ({ ...prev, isLoading: true }))

      try {
        const result = setTenantModuleConfiguration(currentTenant, moduleId, config)

        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.success ? null : (result.errors?.[0] || 'Configuration save failed')
        }))

        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Configuration save failed'
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage
        }))

        return {
          success: false,
          tenantId: currentTenant,
          moduleId,
          config,
          errors: [errorMessage]
        }
      }
    },

    getModuleConfig: (moduleId: string): Record<string, unknown> => {
      try {
        return getTenantModuleConfiguration(currentTenant, moduleId)
      } catch (error) {
        console.error('Failed to get module configuration:', error)
        return {}
      }
    },

    changeTenant: (tenantId: string) => {
      setCurrentTenant(tenantId)
      setState(prev => ({ ...prev, error: null }))
    }
  }

  return [state, actions]
}

// Hook for managing theme customization
export function useThemeCustomization(tenantId: string) {
  const [customizations, setCustomizations] = useState<Record<string, any>>({})
  const [isApplying, setIsApplying] = useState(false)

  const updateCustomization = useCallback((key: string, value: any) => {
    setCustomizations(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const resetCustomizations = useCallback(() => {
    setCustomizations({})
  }, [])

  const applyCustomizations = useCallback(async (themeId: string) => {
    setIsApplying(true)
    try {
      const result = activateThemeForTenant(tenantId, themeId, customizations)
      return result
    } finally {
      setIsApplying(false)
    }
  }, [tenantId, customizations])

  return {
    customizations,
    isApplying,
    updateCustomization,
    resetCustomizations,
    applyCustomizations
  }
}

// Hook for module configuration forms
export function useModuleConfigForm(moduleId: string, tenantId: string) {
  const [config, setConfig] = useState<Record<string, unknown>>({})
  const [validation, setValidation] = useState<{
    valid: boolean
    errors: string[]
    warnings: string[]
  } | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  // Load initial configuration
  useEffect(() => {
    try {
      const initialConfig = getTenantModuleConfiguration(tenantId, moduleId)
      setConfig(initialConfig)
      setIsDirty(false)
    } catch (error) {
      console.error('Failed to load module configuration:', error)
    }
  }, [moduleId, tenantId])

  const updateField = useCallback((field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }))
    setIsDirty(true)
    setValidation(null)
  }, [])

  const saveConfiguration = useCallback(async () => {
    try {
      const result = setTenantModuleConfiguration(tenantId, moduleId, config)

      setValidation({
        valid: result.success,
        errors: result.errors || [],
        warnings: result.warnings || []
      })

      if (result.success) {
        setConfig(result.config)
        setIsDirty(false)
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Save failed'
      setValidation({
        valid: false,
        errors: [errorMessage],
        warnings: []
      })

      return {
        success: false,
        tenantId,
        moduleId,
        config,
        errors: [errorMessage]
      }
    }
  }, [tenantId, moduleId, config])

  const resetForm = useCallback(() => {
    try {
      const initialConfig = getTenantModuleConfiguration(tenantId, moduleId)
      setConfig(initialConfig)
      setIsDirty(false)
      setValidation(null)
    } catch (error) {
      console.error('Failed to reset configuration:', error)
    }
  }, [moduleId, tenantId])

  return {
    config,
    validation,
    isDirty,
    updateField,
    saveConfiguration,
    resetForm
  }
}