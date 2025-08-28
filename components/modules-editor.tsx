'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Loader2, RotateCcw, Save, CheckCircle, Layers, Zap, Link, HeadphonesIcon } from 'lucide-react'
import { saveModuleOverrides, getModuleOverrides, resetToDefaults } from '@/lib/modules/actions'
import { getBaseModuleRegistry } from '@/lib/config/modules'
import { CardSkeleton } from '@/components/ui/skeletons'
import { ModulesEmptyState } from '@/components/empty-states'
import { LoadingErrorBlock } from '@/components/ui/error-block'

interface Module {
  id: string
  label: string
  description?: string
  tiers?: Array<'foundation' | 'growth' | 'enterprise'>
}

interface ModuleGroup {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  modules: Module[]
}

interface ModulesEditorProps {
  clientId?: string
}

export function ModulesEditor({ clientId }: ModulesEditorProps) {
  const [modules, setModules] = useState<Module[]>([])
  const [enabledModules, setEnabledModules] = useState<string[]>([])
  const [originalEnabledModules, setOriginalEnabledModules] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Load modules and current overrides
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        setLoadError(null)
        
        // Get base module registry
        const baseModules = await getBaseModuleRegistry()
        setModules(baseModules.modules)
        
        // Get current overrides for this client
        const overrides = clientId ? await getModuleOverrides(clientId) : null
        const enabled = overrides?.modules_enabled ?? baseModules.modules.map(m => m.id)
        
        setEnabledModules(enabled)
        setOriginalEnabledModules(enabled)
      } catch (error) {
        console.error('Failed to load modules data:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to load modules configuration'
        setLoadError(errorMessage)
        toast.error('Failed to load modules configuration')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [clientId])

  const handleRetryLoad = () => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setLoadError(null)
        
        const baseModules = await getBaseModuleRegistry()
        setModules(baseModules.modules)
        
        const overrides = clientId ? await getModuleOverrides(clientId) : null
        const enabled = overrides?.modules_enabled ?? baseModules.modules.map(m => m.id)
        
        setEnabledModules(enabled)
        setOriginalEnabledModules(enabled)
      } catch (error) {
        console.error('Failed to load modules data:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to load modules configuration'
        setLoadError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }

  // Check if there are unsaved changes
  const hasChanges = JSON.stringify(enabledModules.sort()) !== JSON.stringify(originalEnabledModules.sort())

  const handleToggleModule = (moduleId: string) => {
    setEnabledModules(prev => {
      if (prev.includes(moduleId)) {
        return prev.filter(id => id !== moduleId)
      } else {
        return [...prev, moduleId]
      }
    })
  }

  const handleSave = async () => {
    if (!clientId) {
      toast.error('No client ID available')
      return
    }

    try {
      setIsSaving(true)
      await saveModuleOverrides(clientId, enabledModules)
      setOriginalEnabledModules(enabledModules)
      setLastSaved(new Date())
      toast.success('Module configuration saved successfully')
    } catch (error) {
      console.error('Failed to save module overrides:', error)
      toast.error('Failed to save configuration')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    if (!clientId) {
      toast.error('No client ID available')
      return
    }

    try {
      setIsResetting(true)
      await resetToDefaults(clientId)
      
      // Reset to all modules enabled (base configuration)
      const allModuleIds = modules.map(m => m.id)
      setEnabledModules(allModuleIds)
      setOriginalEnabledModules(allModuleIds)
      setLastSaved(new Date())
      toast.success('Reset to default configuration')
    } catch (error) {
      console.error('Failed to reset to defaults:', error)
      toast.error('Failed to reset configuration')
    } finally {
      setIsResetting(false)
    }
  }

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'foundation': return 'Tier1'
      case 'growth': return 'Pro'
      case 'enterprise': return 'Advanced'
      default: return tier
    }
  }

  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case 'foundation': return 'outline'
      case 'growth': return 'secondary'
      case 'enterprise': return 'default'
      default: return 'outline'
    }
  }

  // Group modules by category
  const getModuleGroups = (): ModuleGroup[] => {
    const groups: ModuleGroup[] = [
      {
        id: 'analytics',
        label: 'Analytics',
        icon: Layers,
        modules: modules.filter(m => m.id === 'analytics')
      },
      {
        id: 'automation',
        label: 'Automation',
        icon: Zap,
        modules: modules.filter(m => m.id === 'automation')
      },
      {
        id: 'integrations',
        label: 'Integrations',
        icon: Link,
        modules: modules.filter(m => m.id === 'integrations')
      },
      {
        id: 'support',
        label: 'Support',
        icon: HeadphonesIcon,
        modules: modules.filter(m => m.id === 'support')
      }
    ]
    return groups.filter(group => group.modules.length > 0)
  }

  // Generate preview of enabled modules
  const getEnabledModulesPreview = () => {
    return modules
      .filter(module => enabledModules.includes(module.id))
      .map(module => module.label)
      .join(', ') || 'No modules enabled'
  }

  if (loadError) {
    return (
      <div className="py-12">
        <LoadingErrorBlock
          onRetry={handleRetryLoad}
          message={loadError}
        />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Preview skeleton */}
        <CardSkeleton />
        
        {/* Module groups skeleton */}
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(2)].map((_, j) => (
                  <CardSkeleton key={j} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (modules.length === 0) {
    return <ModulesEmptyState />
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Preview Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900">Module Preview</CardTitle>
          <CardDescription className="text-blue-700">
            Current consultation modules: {getEnabledModulesPreview()}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {enabledModules.length} of {modules.length} modules enabled
          </div>
          {lastSaved && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              Last saved: {lastSaved.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* Grouped Modules */}
      <div className="space-y-6">
        {getModuleGroups().map((group) => {
          const IconComponent = group.icon
          
          return (
            <div key={group.id}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <IconComponent className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{group.label}</h3>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {group.modules.map((module) => {
                  const isEnabled = enabledModules.includes(module.id)
                  
                  return (
                    <Card 
                      key={module.id} 
                      className={`transition-all duration-200 hover:shadow-md ${
                        isEnabled 
                          ? 'ring-2 ring-primary/20 bg-primary/5 shadow-sm' 
                          : 'opacity-70 hover:opacity-90'
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg truncate mb-2">{module.label}</CardTitle>
                            <CardDescription className="text-sm leading-relaxed">
                              {module.description ?? 'No description available'}
                            </CardDescription>
                            
                            {/* Tier badges */}
                            {module.tiers && module.tiers.length > 0 && (
                              <div className="flex gap-1 mt-3">
                                {module.tiers.map((tier) => (
                                  <Badge 
                                    key={tier} 
                                    variant={getTierBadgeVariant(tier)}
                                    className="text-xs px-2 py-1"
                                  >
                                    {getTierLabel(tier)}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="ml-3 flex-shrink-0">
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={() => handleToggleModule(module.id)}
                              disabled={isSaving || isResetting}
                              aria-label={`Toggle ${module.label}`}
                            />
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="text-sm text-muted-foreground">
                          <div className="flex items-center justify-between">
                            <span>Status:</span>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                isEnabled ? 'bg-green-500' : 'bg-gray-400'
                              }`} />
                              <span className={`font-medium ${
                                isEnabled ? 'text-green-600' : 'text-gray-500'
                              }`}>
                                {isEnabled ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Sticky Action Bar */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg transition-all duration-300 z-50 ${
        hasChanges || lastSaved ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {hasChanges && (
                <div className="flex items-center gap-2 text-amber-600">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Unsaved changes</span>
                </div>
              )}
              {!hasChanges && lastSaved && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Saved at {lastSaved.toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReset}
                disabled={isSaving || isResetting}
              >
                {isResetting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RotateCcw className="h-4 w-4 mr-2" />
                )}
                Reset to Defaults
              </Button>
              
              <Button 
                onClick={handleSave}
                disabled={!hasChanges || isSaving || isResetting}
                size="sm"
                className="min-w-[120px]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Help text */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">How Module Configuration Works</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• <strong>Enabled modules</strong> will appear in consultation plan includes and be available for selection</p>
          <p>• <strong>Disabled modules</strong> will be hidden from plans and not mentioned in consultations</p>
          <p>• Changes apply to new consultations generated after saving</p>
          <p>• <strong>Reset to Defaults</strong> enables all modules from the base configuration</p>
        </div>
      </div>
    </div>
  )
}