'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { FeatureConfigurationGenerator } from '@/lib/ai/feature-configuration-generator'
import {
  FeatureGenerationConfig,
  GeneratedFeature,
  FeatureSet
} from '@/types/ai/customization'
import {
  Puzzle,
  Code,
  Palette,
  Zap,
  Shield,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  Package,
  Layers,
  Sparkles
} from 'lucide-react'

interface FeatureConfigurationProps {
  config: FeatureGenerationConfig
  onConfigurationComplete?: (features: FeatureSet) => void
  className?: string
}

export function FeatureConfiguration({
  config,
  onConfigurationComplete,
  className
}: FeatureConfigurationProps) {
  const [featureSet, setFeatureSet] = useState<FeatureSet | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationResult, setValidationResult] = useState<any>(null)
  const [optimizedFeatures, setOptimizedFeatures] = useState<FeatureSet | null>(null)
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState('overview')

  const generator = new FeatureConfigurationGenerator()

  useEffect(() => {
    generateFeatures()
  }, [config])

  const generateFeatures = async () => {
    setLoading(true)
    setError(null)

    try {
      const features = await generator.generateFeatureSet(config)
      setFeatureSet(features as unknown as FeatureSet)

      // Auto-select high priority features
      const highPriorityFeatures = new Set<string>()
      Object.values(features).flat().forEach((feature: any) => {
        if (feature.priority === 'high') {
          highPriorityFeatures.add(feature.id)
        }
      })
      setSelectedFeatures(highPriorityFeatures)

      // Validate the feature set
      const validation = await generator.validateFeatureSet(features)
      setValidationResult(validation)

      // Generate optimized version
      if (validation.isValid) {
        const optimized = await generator.optimizeFeatureSet(features)
        setOptimizedFeatures(optimized as unknown as FeatureSet)
      }

      onConfigurationComplete?.(features as unknown as FeatureSet)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate features')
    } finally {
      setLoading(false)
    }
  }

  const toggleFeature = (featureId: string) => {
    const newSelected = new Set(selectedFeatures)
    if (newSelected.has(featureId)) {
      newSelected.delete(featureId)
    } else {
      newSelected.add(featureId)
    }
    setSelectedFeatures(newSelected)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <Star className="h-4 w-4 text-red-500" />
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />
      default: return <Settings className="h-4 w-4 text-gray-500" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'core': return <Package className="h-5 w-5" />
      case 'business': return <Zap className="h-5 w-5" />
      case 'ui': return <Palette className="h-5 w-5" />
      case 'integration': return <Layers className="h-5 w-5" />
      case 'security': return <Shield className="h-5 w-5" />
      default: return <Puzzle className="h-5 w-5" />
    }
  }

  const getTotalEstimatedTime = (features: FeatureSet) => {
    return Object.values(features).flat().reduce((total, feature) => {
      return selectedFeatures.has(feature.id) ? total + feature.estimatedImplementationTime : total
    }, 0)
  }

  const getSelectedFeaturesCount = (features: FeatureSet) => {
    return Object.values(features).flat().filter(feature => selectedFeatures.has(feature.id)).length
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Generating Feature Configuration
          </CardTitle>
          <CardDescription>
            Analyzing requirements and generating optimal feature set...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={45} />
            <div className="text-sm text-muted-foreground">
              Creating features based on your requirements...
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Feature Generation Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={generateFeatures} className="mt-4">
            Retry Generation
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!featureSet) {
    return null
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Puzzle className="h-5 w-5" />
              Feature Configuration
            </div>
            <Badge variant="outline">
              {Object.values(featureSet).flat().length} total features
            </Badge>
          </CardTitle>
          <CardDescription>
            Generated features for {config.targetFramework} with {config.complexityLevel} complexity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {getSelectedFeaturesCount(featureSet)}
              </div>
              <div className="text-sm text-muted-foreground">
                Selected Features
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {getTotalEstimatedTime(featureSet)}h
              </div>
              <div className="text-sm text-muted-foreground">
                Estimated Implementation
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Object.values(featureSet).flat().filter(f => f.priority === 'high').length}
              </div>
              <div className="text-sm text-muted-foreground">
                High Priority Features
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Results */}
      {validationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {validationResult.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              Feature Validation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {validationResult.errors.length > 0 && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium">Validation Errors:</div>
                  <ul className="list-disc list-inside mt-2">
                    {validationResult.errors.map((error: string, index: number) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {validationResult.warnings.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium">Warnings:</div>
                  <ul className="list-disc list-inside mt-2">
                    {validationResult.warnings.map((warning: string, index: number) => (
                      <li key={index} className="text-sm">{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {validationResult.isValid && validationResult.errors.length === 0 && validationResult.warnings.length === 0 && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Feature configuration is valid and optimized</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Feature Categories */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="core">Core</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="ui">UI/UX</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(featureSet).map(([category, features]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getCategoryIcon(category)}
                    <span className="capitalize">{category} Features</span>
                    <Badge variant="outline">
                      {features.filter((f: any) => selectedFeatures.has(f.id)).length}/{features.length} selected
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Total implementation time: {features.filter((f: any) => selectedFeatures.has(f.id)).reduce((sum: number, f: any) => sum + f.estimatedImplementationTime, 0)} hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {features.map((feature: any) => (
                      <div
                        key={feature.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedFeatures.has(feature.id)
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleFeature(feature.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getPriorityIcon(feature.priority)}
                            <span className="text-sm font-medium">{feature.name}</span>
                          </div>
                          <Switch
                            checked={selectedFeatures.has(feature.id)}
                            onCheckedChange={() => toggleFeature(feature.id)}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {feature.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge className={getPriorityColor(feature.priority)} variant="secondary">
                            {feature.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {feature.estimatedImplementationTime}h
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Individual Category Tabs */}
        {Object.entries(featureSet).map(([category, features]) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {features.map((feature: any) => (
                <Card key={feature.id} className={selectedFeatures.has(feature.id) ? 'border-blue-300' : ''}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(feature.priority)}
                        {feature.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(feature.priority)}>
                          {feature.priority}
                        </Badge>
                        <Switch
                          checked={selectedFeatures.has(feature.id)}
                          onCheckedChange={() => toggleFeature(feature.id)}
                        />
                      </div>
                    </CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Implementation Details</Label>
                          <div className="mt-2 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Estimated Time:</span>
                              <span>{feature.estimatedImplementationTime} hours</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Module Path:</span>
                              <code className="text-xs">{feature.module.path}</code>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Dependencies:</span>
                              <span>{feature.dependencies.length}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Components</Label>
                          <div className="mt-2 space-y-1">
                            {feature.components.map((component: any, index: number) => (
                              <div key={index} className="text-sm">
                                <code className="text-xs">{component.name}</code>
                                <span className="text-muted-foreground ml-2">
                                  ({component.path})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {feature.dependencies.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium">Dependencies</Label>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {feature.dependencies.map((dep: any, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {dep}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <Separator />

                      <div>
                        <Label className="text-sm font-medium">Configuration</Label>
                        <div className="mt-2 bg-gray-50 p-3 rounded-md">
                          <pre className="text-xs overflow-auto">
                            {JSON.stringify(feature.configuration, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Selection Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Selection Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {getSelectedFeaturesCount(featureSet)}
                </div>
                <div className="text-sm text-muted-foreground">Features Selected</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {getTotalEstimatedTime(featureSet)}h
                </div>
                <div className="text-sm text-muted-foreground">Implementation Time</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {Object.values(featureSet).flat().filter(f => selectedFeatures.has(f.id) && f.priority === 'high').length}
                </div>
                <div className="text-sm text-muted-foreground">High Priority</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">
                  {new Set(Object.values(featureSet).flat().filter(f => selectedFeatures.has(f.id)).flatMap(f => f.dependencies)).size}
                </div>
                <div className="text-sm text-muted-foreground">Unique Dependencies</div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-sm font-medium">Selected Features by Category</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.entries(featureSet).map(([category, features]) => {
                  const selectedCount = features.filter((f: any) => selectedFeatures.has(f.id)).length
                  return (
                    <div key={category} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium capitalize">{category}</span>
                      <Badge variant="outline">
                        {selectedCount}/{features.length}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between gap-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const allFeatures = new Set(Object.values(featureSet).flat().map(f => f.id))
              setSelectedFeatures(allFeatures)
            }}
          >
            Select All
          </Button>
          <Button
            variant="outline"
            onClick={() => setSelectedFeatures(new Set())}
          >
            Clear Selection
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateFeatures}>
            Regenerate
          </Button>
          <Button onClick={() => onConfigurationComplete?.(featureSet)}>
            Apply Configuration
          </Button>
        </div>
      </div>
    </div>
  )
}