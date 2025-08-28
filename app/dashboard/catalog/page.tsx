'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, RefreshCw, Save, Undo2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { getRuntimeConfig } from '@/lib/config/modules'
import { getCatalogOverrides, saveCatalogOverrides, resetCatalogOverrides, CatalogOverrides } from '@/lib/modules/catalog-actions'
import { Plan, PlanCatalog } from '@/types/config'

// Use the CatalogOverrides type from actions
// Remove duplicate interface definitions

function CatalogOverridesPage() {
  const [baseCatalog, setBaseCatalog] = useState<PlanCatalog | null>(null)
  const [overrides, setOverrides] = useState<CatalogOverrides>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const { toast } = useToast()

  // Load base catalog and existing overrides
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get base config to access catalog (without client-specific overrides)
        const baseConfig = await getRuntimeConfig() as { catalog: PlanCatalog }
        setBaseCatalog(baseConfig.catalog)
        
        if (baseConfig.catalog?.plans?.length > 0) {
          setSelectedPlan(baseConfig.catalog.plans[0].id)
        }
        
        // Load existing catalog overrides
        // TODO: Get actual client ID from auth context
        const existingOverrides = await getCatalogOverrides('demo-client-id')
        setOverrides(existingOverrides)
      } catch (error) {
        console.error('Failed to load catalog data:', error)
        toast({
          title: "Error",
          description: "Failed to load catalog data",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  const handleOverrideChange = (planId: string, field: keyof CatalogOverrides[string], value: string | string[]) => {
    setOverrides(prev => ({
      ...prev,
      [planId]: {
        ...prev[planId],
        [field]: value
      }
    }))
  }

  const handleIncludesChange = (planId: string, index: number, value: string) => {
    const currentIncludes = overrides[planId]?.includes ?? getBasePlan(planId)?.includes ?? []
    const newIncludes = [...currentIncludes]
    newIncludes[index] = value
    handleOverrideChange(planId, 'includes', newIncludes)
  }

  const addInclude = (planId: string) => {
    const currentIncludes = overrides[planId]?.includes ?? getBasePlan(planId)?.includes ?? []
    handleOverrideChange(planId, 'includes', [...currentIncludes, ''])
  }

  const removeInclude = (planId: string, index: number) => {
    const currentIncludes = overrides[planId]?.includes ?? getBasePlan(planId)?.includes ?? []
    const newIncludes = currentIncludes.filter((_, i) => i !== index)
    handleOverrideChange(planId, 'includes', newIncludes)
  }

  const resetPlan = async (planId: string) => {
    const newOverrides = { ...overrides }
    delete newOverrides[planId]
    
    try {
      // TODO: Get actual client ID from auth context
      const result = await saveCatalogOverrides('demo-client-id', newOverrides)
      if (result.success) {
        setOverrides(newOverrides)
        toast({
          title: "Plan Reset",
          description: "Plan values restored to base configuration"
        })
      } else {
        throw new Error(result.error ?? 'Reset failed')
      }
    } catch {
      toast({
        title: "Reset Failed",
        description: "Failed to reset plan values",
        variant: "destructive"
      })
    }
  }

  const resetAllOverrides = async () => {
    try {
      // TODO: Get actual client ID from auth context
      const result = await resetCatalogOverrides('demo-client-id')
      if (result.success) {
        setOverrides({})
        toast({
          title: "All Overrides Reset",
          description: "All plan values restored to base configuration"
        })
      } else {
        throw new Error(result.error ?? 'Reset failed')
      }
    } catch {
      toast({
        title: "Reset Failed",
        description: "Failed to reset catalog overrides",
        variant: "destructive"
      })
    }
  }

  const saveOverrides = async () => {
    setSaving(true)
    try {
      // TODO: Get actual client ID from auth context
      const result = await saveCatalogOverrides('demo-client-id', overrides)
      if (result.success) {
        toast({
          title: "Overrides Saved",
          description: "Catalog overrides have been saved successfully"
        })
      } else {
        throw new Error(result.error ?? 'Save failed')
      }
    } catch {
      toast({
        title: "Save Failed",
        description: "Failed to save catalog overrides",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const getBasePlan = (planId: string): Plan | undefined => {
    return baseCatalog?.plans.find(p => p.id === planId)
  }

  const getMergedPlan = (planId: string): Plan | undefined => {
    const basePlan = getBasePlan(planId)
    if (!basePlan) return undefined

    const override = overrides[planId]
    if (!override) return basePlan

    return {
      ...basePlan,
      title: override.title ?? basePlan.title,
      includes: override.includes ?? basePlan.includes,
      priceBand: override.priceBand ?? basePlan.priceBand
    }
  }

  const hasOverrides = (planId: string): boolean => {
    return Boolean(overrides[planId] && Object.keys(overrides[planId]).length > 0)
  }

  const hasAnyOverrides = (): boolean => {
    return Object.keys(overrides).length > 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!baseCatalog) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No catalog configuration found. Please check your base configuration.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Catalog Overrides</h1>
              <p className="text-gray-600">
                Customize plan titles, includes, and price bands per client
              </p>
            </div>
        <div className="flex gap-2">
          {hasAnyOverrides() && (
            <Button
              variant="outline"
              onClick={resetAllOverrides}
              disabled={saving}
            >
              <Undo2 className="w-4 h-4 mr-2" />
              Reset All
            </Button>
          )}
          <Button
            onClick={saveOverrides}
            disabled={saving || !hasAnyOverrides()}
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Plan Selection Tabs */}
      <Tabs value={selectedPlan} onValueChange={setSelectedPlan}>
        <TabsList className="grid w-full grid-cols-3">
          {baseCatalog.plans.map(plan => (
            <TabsTrigger key={plan.id} value={plan.id} className="relative">
              {plan.title}
              {hasOverrides(plan.id) && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {baseCatalog.plans.map(basePlan => {
          const mergedPlan = getMergedPlan(basePlan.id)
          if (!mergedPlan) return null

          return (
            <TabsContent key={basePlan.id} value={basePlan.id} className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold">{basePlan.title}</h2>
                  {hasOverrides(basePlan.id) && (
                    <Badge variant="secondary">Modified</Badge>
                  )}
                </div>
                {hasOverrides(basePlan.id) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resetPlan(basePlan.id)}
                  >
                    <Undo2 className="w-4 h-4 mr-2" />
                    Reset Plan
                  </Button>
                )}
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Override Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>Plan Overrides</CardTitle>
                    <CardDescription>
                      Override specific fields for this plan
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Title Override */}
                    <div className="space-y-2">
                      <Label htmlFor={`title-${basePlan.id}`}>Title (optional)</Label>
                      <Input
                        id={`title-${basePlan.id}`}
                        placeholder={basePlan.title}
                        value={overrides[basePlan.id]?.title ?? ''}
                        onChange={(e) => handleOverrideChange(basePlan.id, 'title', e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Leave empty to use base title: &quot;{basePlan.title}&quot;
                      </p>
                    </div>

                    <Separator />

                    {/* Price Band Override */}
                    <div className="space-y-2">
                      <Label htmlFor={`priceBand-${basePlan.id}`}>Price Band (optional)</Label>
                      <Input
                        id={`priceBand-${basePlan.id}`}
                        placeholder={basePlan.priceBand ?? 'No base price band'}
                        value={overrides[basePlan.id]?.priceBand ?? ''}
                        onChange={(e) => handleOverrideChange(basePlan.id, 'priceBand', e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        {basePlan.priceBand 
                          ? `Leave empty to use base price band: &quot;${basePlan.priceBand}&quot;`
                          : 'No base price band set'
                        }
                      </p>
                    </div>

                    <Separator />

                    {/* Includes Override */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Includes (optional)</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addInclude(basePlan.id)}
                        >
                          Add Item
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {(overrides[basePlan.id]?.includes ?? basePlan.includes).map((item, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={item}
                              onChange={(e) => handleIncludesChange(basePlan.id, index, e.target.value)}
                              placeholder="Include item..."
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeInclude(basePlan.id, index)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Customize the list of included items for this plan
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Live Preview</CardTitle>
                    <CardDescription>
                      How this plan will appear to users
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{mergedPlan.title}</h3>
                        {mergedPlan.priceBand && (
                          <Badge variant="outline">{mergedPlan.priceBand}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{mergedPlan.description}</p>
                      
                      {mergedPlan.includes.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Includes:</p>
                          <div className="space-y-1">
                            {mergedPlan.includes.map((item, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )
        })}
      </Tabs>
        </div>
      </div>
    </div>
  )
}

export default function CatalogPage() {
  return <CatalogOverridesPage />
}