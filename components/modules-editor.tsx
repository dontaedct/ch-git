'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Loader2, RotateCcw, Save, CheckCircle } from 'lucide-react'
import { saveModuleOverrides, getModuleOverrides, resetToDefaults } from '@/lib/modules/actions'
import { getBaseModuleRegistry } from '@/lib/config/modules'

interface Module {
  id: string
  label: string
  description?: string
  tiers?: Array<'foundation' | 'growth' | 'enterprise'>
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

  // Load modules and current overrides
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        
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
        toast.error('Failed to load modules configuration')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [clientId])

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

  const getTierBadgeVariant = (tiers: string[] = []) => {
    if (tiers.includes('enterprise')) return 'default'
    if (tiers.includes('growth')) return 'secondary'
    return 'outline'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading modules...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
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
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => {
          const isEnabled = enabledModules.includes(module.id)
          
          return (
            <Card 
              key={module.id} 
              className={`transition-all duration-200 ${
                isEnabled 
                  ? 'ring-2 ring-primary/20 bg-primary/5' 
                  : 'opacity-60 hover:opacity-80'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{module.label}</CardTitle>
                    <CardDescription className="mt-1">
                      {module.description ?? 'No description available'}
                    </CardDescription>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={() => handleToggleModule(module.id)}
                    disabled={isSaving || isResetting}
                  />
                </div>
                
                {/* Tier badges */}
                {module.tiers && module.tiers.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {module.tiers.map((tier) => (
                      <Badge 
                        key={tier} 
                        variant={getTierBadgeVariant(module.tiers)}
                        className="text-xs"
                      >
                        {tier.charAt(0).toUpperCase() + tier.slice(1)}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardHeader>
              
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <span className={`font-medium ${
                      isEnabled ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  
                  {module.tiers && (
                    <div className="flex items-center justify-between mt-1">
                      <span>Available in:</span>
                      <span className="text-right">
                        {module.tiers.join(', ')} plans
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Changes indicator */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-2 text-yellow-800">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">You have unsaved changes</span>
          </div>
        </div>
      )}

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