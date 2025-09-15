/**
 * HT-022.3.3: Basic Module Configuration UI
 *
 * Complete admin interface for module management, configuration,
 * and tenant-specific settings with validation and activation controls.
 */

'use client'

import React, { useState, useEffect } from 'react'
import {
  Package,
  Settings,
  Users,
  Power,
  PowerOff,
  Check,
  X,
  AlertTriangle,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Palette,
  Shield,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
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

interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

interface ConfigFormData {
  [key: string]: unknown
}

export function ModuleManagementInterface() {
  // State management
  const [selectedTenant, setSelectedTenant] = useState<string>('default')
  const [availableModules, setAvailableModules] = useState<ModuleInfo[]>([])
  const [activeModules, setActiveModules] = useState<ModuleInfo[]>([])
  const [availableThemes, setAvailableThemes] = useState<SimpleTenantTheme[]>([])
  const [activeTheme, setActiveTheme] = useState<SimpleTenantTheme | undefined>()
  const [selectedModule, setSelectedModule] = useState<string | null>(null)
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [moduleConfig, setModuleConfig] = useState<ConfigFormData>({})
  const [configValidation, setConfigValidation] = useState<ValidationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [securityHealth, setSecurityHealth] = useState<any>(null)

  // Load initial data
  useEffect(() => {
    loadModuleData()
    loadThemeData()
    loadSecurityHealth()
  }, [selectedTenant])

  const loadModuleData = async () => {
    try {
      setIsLoading(true)
      const all = getAllAvailableModules()
      const active = getActiveModulesForTenant(selectedTenant)
      setAvailableModules(all)
      setActiveModules(active)
    } catch (error) {
      console.error('Failed to load module data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadThemeData = async () => {
    try {
      const themes = getTenantThemes(selectedTenant)
      const active = getTenantActiveTheme(selectedTenant)
      setAvailableThemes(themes)
      setActiveTheme(active)
    } catch (error) {
      console.error('Failed to load theme data:', error)
    }
  }

  const loadSecurityHealth = async () => {
    try {
      const health = validateTenantSecurity(selectedTenant)
      setSecurityHealth(health)
    } catch (error) {
      console.error('Failed to load security health:', error)
    }
  }

  const loadModuleConfiguration = async (moduleId: string) => {
    try {
      const config = getTenantModuleConfiguration(selectedTenant, moduleId)
      setModuleConfig(config)
      setConfigValidation(null)
    } catch (error) {
      console.error('Failed to load module configuration:', error)
    }
  }

  // Module activation/deactivation
  const handleModuleToggle = async (moduleId: string, isActive: boolean) => {
    setIsLoading(true)
    try {
      if (isActive) {
        const result = await deactivateModule(moduleId, selectedTenant)
        if (result) {
          await loadModuleData()
        }
      } else {
        const result = await activateModule(moduleId, selectedTenant)
        if (result.success) {
          await loadModuleData()
        }
      }
    } catch (error) {
      console.error('Failed to toggle module:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Theme activation
  const handleThemeActivation = async (themeId: string, customizations?: any) => {
    setIsLoading(true)
    try {
      const result: ThemeActivationResult = activateThemeForTenant(
        selectedTenant,
        themeId,
        customizations
      )
      if (result.success) {
        await loadThemeData()
      }
    } catch (error) {
      console.error('Failed to activate theme:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Configuration management
  const handleConfigurationSave = async (moduleId: string) => {
    setIsLoading(true)
    try {
      const result: TenantConfigurationResult = setTenantModuleConfiguration(
        selectedTenant,
        moduleId,
        moduleConfig
      )

      setConfigValidation({
        valid: result.success,
        errors: result.errors || [],
        warnings: result.warnings || []
      })

      if (result.success) {
        setModuleConfig(result.config)
      }
    } catch (error) {
      console.error('Failed to save configuration:', error)
      setConfigValidation({
        valid: false,
        errors: ['Failed to save configuration'],
        warnings: []
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfigFieldChange = (field: string, value: any) => {
    setModuleConfig(prev => ({
      ...prev,
      [field]: value
    }))
    setConfigValidation(null)
  }

  const toggleModuleExpansion = (moduleId: string) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
      if (selectedModule !== moduleId) {
        setSelectedModule(moduleId)
        loadModuleConfiguration(moduleId)
      }
    }
    setExpandedModules(newExpanded)
  }

  // Render module configuration form
  const renderModuleConfigForm = (moduleId: string) => {
    const commonConfigs = {
      'questionnaire-engine': [
        { key: 'maxSteps', label: 'Maximum Steps', type: 'number', min: 1, max: 50 },
        { key: 'allowSkipRequired', label: 'Allow Skip Required', type: 'boolean' },
        { key: 'saveProgress', label: 'Save Progress', type: 'boolean' },
        { key: 'progressStyle', label: 'Progress Style', type: 'select', options: ['thinBar', 'steps', 'percentage'] }
      ],
      'consultation-generator': [
        { key: 'aiProvider', label: 'AI Provider', type: 'select', options: ['openai', 'anthropic', 'local'] },
        { key: 'maxTokens', label: 'Max Tokens', type: 'number', min: 100, max: 4000 },
        { key: 'temperature', label: 'Temperature', type: 'number', min: 0, max: 1, step: 0.1 },
        { key: 'includeRecommendations', label: 'Include Recommendations', type: 'boolean' }
      ],
      'theme-customizer': [
        { key: 'allowCustomColors', label: 'Allow Custom Colors', type: 'boolean' },
        { key: 'allowCustomFonts', label: 'Allow Custom Fonts', type: 'boolean' },
        { key: 'maxThemes', label: 'Max Themes', type: 'number', min: 1, max: 10 },
        { key: 'previewMode', label: 'Preview Mode', type: 'boolean' }
      ],
      'email-integration': [
        { key: 'provider', label: 'Provider', type: 'select', options: ['smtp', 'sendgrid', 'mailgun'] },
        { key: 'fromAddress', label: 'From Address', type: 'email' },
        { key: 'bccAdmin', label: 'BCC Admin', type: 'boolean' }
      ],
      'analytics-basic': [
        { key: 'trackPageViews', label: 'Track Page Views', type: 'boolean' },
        { key: 'trackEvents', label: 'Track Events', type: 'boolean' },
        { key: 'anonymizeIp', label: 'Anonymize IP', type: 'boolean' },
        { key: 'retentionDays', label: 'Retention Days', type: 'number', min: 1, max: 365 }
      ]
    }

    const fields = commonConfigs[moduleId as keyof typeof commonConfigs] || []

    return (
      <div className="space-y-4">
        {fields.map(field => (
          <div key={field.key} className="grid gap-2">
            <Label htmlFor={field.key}>{field.label}</Label>
            {field.type === 'boolean' ? (
              <Switch
                id={field.key}
                checked={Boolean(moduleConfig[field.key])}
                onCheckedChange={(checked) => handleConfigFieldChange(field.key, checked)}
              />
            ) : field.type === 'select' ? (
              <Select
                value={String(moduleConfig[field.key] || '')}
                onValueChange={(value) => handleConfigFieldChange(field.key, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${field.label}`} />
                </SelectTrigger>
                <SelectContent>
                  {'options' in field && field.options?.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id={field.key}
                type={field.type || 'text'}
                value={String(moduleConfig[field.key] || '')}
                min={'min' in field ? field.min : undefined}
                max={'max' in field ? field.max : undefined}
                step={'step' in field ? field.step : undefined}
                onChange={(e) => handleConfigFieldChange(field.key,
                  field.type === 'number' ? Number(e.target.value) : e.target.value
                )}
                placeholder={`Enter ${field.label.toLowerCase()}`}
              />
            )}
          </div>
        ))}

        {configValidation && (
          <Alert variant={configValidation.valid ? 'default' : 'destructive'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {configValidation.valid ? 'Configuration saved successfully!' : (
                <div>
                  <div className="font-medium">Configuration errors:</div>
                  <ul className="list-disc list-inside text-sm">
                    {configValidation.errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end">
          <Button
            onClick={() => handleConfigurationSave(moduleId)}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Settings className="h-4 w-4 mr-2" />
            )}
            Save Configuration
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Module Management</h1>
          <p className="text-gray-600">Manage modules, themes, and tenant configurations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
          </Button>
          <Button variant="outline" size="sm" onClick={loadModuleData} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tenant Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Tenant Settings
          </CardTitle>
          <CardDescription>
            Select tenant to manage modules and configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="tenant-select">Active Tenant</Label>
              <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                <SelectTrigger id="tenant-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default Tenant</SelectItem>
                  <SelectItem value="tenant-demo">Demo Tenant</SelectItem>
                  <SelectItem value="tenant-test">Test Tenant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {securityHealth && (
              <div>
                <Label>Security Health</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={securityHealth.healthy ? 'default' : 'destructive'}>
                    {securityHealth.healthy ? (
                      <Check className="h-3 w-3 mr-1" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 mr-1" />
                    )}
                    Score: {securityHealth.score}/100
                  </Badge>
                  {securityHealth.issues.length > 0 && (
                    <span className="text-sm text-gray-500">
                      {securityHealth.issues.length} issues
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Interface */}
      <Tabs defaultValue="modules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Modules
          </TabsTrigger>
          <TabsTrigger value="themes" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Themes
          </TabsTrigger>
          {showAdvanced && (
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          )}
        </TabsList>

        {/* Modules Tab */}
        <TabsContent value="modules" className="space-y-4">
          <div className="grid gap-4">
            {availableModules.map(module => {
              const isActive = activeModules.some(active => active.id === module.id)
              const isExpanded = expandedModules.has(module.id)

              return (
                <Card key={module.id} className={cn(
                  "transition-all",
                  isActive && "border-primary/50 bg-primary/5"
                )}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <button
                        className="flex items-center gap-3 text-left flex-1"
                        onClick={() => toggleModuleExpansion(module.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{module.label}</CardTitle>
                            <Badge variant={isActive ? 'default' : 'secondary'}>
                              {isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {module.tiers && (
                              <Badge variant="outline" className="text-xs">
                                {module.tiers.join(', ')}
                              </Badge>
                            )}
                          </div>
                          {module.description && (
                            <CardDescription className="mt-1">
                              {module.description}
                            </CardDescription>
                          )}
                        </div>
                      </button>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={isActive}
                          onCheckedChange={() => handleModuleToggle(module.id, isActive)}
                          disabled={isLoading}
                        />
                        {isActive ? (
                          <Power className="h-4 w-4 text-green-600" />
                        ) : (
                          <PowerOff className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="pt-0 border-t">
                      <div className="space-y-4">
                        <div className="grid gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Module ID:</span>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {module.id}
                            </code>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Version:</span>
                            <span>{module.version}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className={isActive ? 'text-green-600' : 'text-gray-500'}>
                              {module.status}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Dependencies:</span>
                            <span>{module.dependencies.length || 'None'}</span>
                          </div>
                        </div>

                        {isActive && (
                          <div className="border-t pt-4">
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <Settings className="h-4 w-4" />
                              Configuration
                            </h4>
                            {renderModuleConfigForm(module.id)}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Themes Tab */}
        <TabsContent value="themes" className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Available Themes</h3>
              {activeTheme && (
                <Badge variant="default" className="flex items-center gap-1">
                  <Palette className="h-3 w-3" />
                  Active: {activeTheme.displayName}
                </Badge>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableThemes.map(theme => {
                const isActive = activeTheme?.name === theme.name

                return (
                  <Card key={theme.name} className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    isActive && "border-primary bg-primary/5"
                  )}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{theme.displayName}</CardTitle>
                          <CardDescription className="text-sm">
                            {theme.isDefault ? 'Built-in theme' : 'Custom theme'}
                          </CardDescription>
                        </div>
                        {isActive && <Check className="h-5 w-5 text-primary" />}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Theme preview */}
                      <div className="space-y-3">
                        <div className="flex gap-1">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: theme.tokens.colors.primary }}
                          />
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: theme.tokens.colors.neutral['500'] }}
                          />
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: theme.tokens.colors.accent }}
                          />
                        </div>
                        <div className="text-xs text-gray-600">
                          Font: {theme.tokens.typography.fontFamily.split(',')[0]}
                        </div>
                        <Button
                          size="sm"
                          variant={isActive ? "secondary" : "default"}
                          className="w-full"
                          onClick={() => !isActive && handleThemeActivation(theme.name)}
                          disabled={isActive || isLoading}
                        >
                          {isActive ? 'Active' : 'Activate'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        {showAdvanced && (
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Health Report
                </CardTitle>
                <CardDescription>
                  Review tenant security status and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {securityHealth ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold">
                          {securityHealth.score}/100
                        </div>
                        <div className="text-sm text-gray-600">Security Score</div>
                      </div>
                      <Badge variant={securityHealth.healthy ? 'default' : 'destructive'} className="text-sm">
                        {securityHealth.healthy ? 'Healthy' : 'Needs Attention'}
                      </Badge>
                    </div>

                    {securityHealth.issues.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Issues Found</h4>
                        <div className="space-y-2">
                          {securityHealth.issues.map((issue: any, index: number) => (
                            <Alert key={index} variant="destructive">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                <span className="font-medium capitalize">{issue.severity}:</span> {issue.message}
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}

                    {securityHealth.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Recommendations</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {securityHealth.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    Loading security health report...
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}