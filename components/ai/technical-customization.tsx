'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { TechnicalCustomizationEngine } from '@/lib/ai/technical-customization-engine'
import {
  CustomizationResult,
  TechnicalCustomizationConfig,
  TechnicalCustomization,
  FeatureSet,
  IntegrationConfig
} from '@/types/ai/customization'
import {
  Cpu,
  Database,
  Cloud,
  Settings,
  Code,
  Zap,
  Shield,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp
} from 'lucide-react'

interface TechnicalCustomizationProps {
  config: TechnicalCustomizationConfig
  onCustomizationComplete?: (result: CustomizationResult) => void
  className?: string
}

export function TechnicalCustomization({
  config,
  onCustomizationComplete,
  className
}: TechnicalCustomizationProps) {
  const [customization, setCustomization] = useState<CustomizationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationResult, setValidationResult] = useState<any>(null)
  const [optimizedResult, setOptimizedResult] = useState<CustomizationResult | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  const engine = new TechnicalCustomizationEngine()

  useEffect(() => {
    generateCustomization()
  }, [config])

  const generateCustomization = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await engine.generateCustomization(config)
      setCustomization(result)

      // Validate the customization
      const validation = await engine.validateCustomization(result)
      setValidationResult(validation)

      // Generate optimized version
      if (validation.isValid) {
        const optimized = await engine.optimizeCustomization(result)
        setOptimizedResult(optimized)
      }

      onCustomizationComplete?.(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate customization')
    } finally {
      setLoading(false)
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'high': return <TrendingUp className="h-4 w-4 text-orange-500" />
      case 'medium': return <BarChart3 className="h-4 w-4 text-yellow-500" />
      case 'low': return <Clock className="h-4 w-4 text-green-500" />
      default: return <Settings className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Generating Technical Customization
          </CardTitle>
          <CardDescription>
            Analyzing requirements and generating optimized technical configuration...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={33} />
            <div className="text-sm text-muted-foreground">
              Analyzing technical requirements and constraints...
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
            Technical Customization Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={generateCustomization} className="mt-4">
            Retry Generation
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!customization) {
    return null
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Technical Customization Analysis
            </div>
            <Badge className={getComplexityColor(customization.complexity)}>
              {customization.complexity} complexity
            </Badge>
          </CardTitle>
          <CardDescription>
            Customization ID: {customization.id}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {customization.estimatedDevelopmentTime}h
              </div>
              <div className="text-sm text-muted-foreground">
                Estimated Development Time
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(customization.features).flat().length}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Features
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {customization.integrations.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Integrations
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
              Validation Results
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
                <span className="text-sm">All validations passed successfully</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Technical Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Architecture:</span>
                  <Badge variant="outline">{customization.configuration.architecture}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Frontend:</span>
                  <Badge variant="outline">{customization.configuration.frontendFramework}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">State Management:</span>
                  <Badge variant="outline">{customization.configuration.stateManagement}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Database:</span>
                  <Badge variant="outline">{customization.configuration.database.primary}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Performance Estimates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Load Time:</span>
                  <span className="text-sm">{customization.performance.estimatedLoadTime.toFixed(1)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Bundle Size:</span>
                  <span className="text-sm">{customization.performance.estimatedBundleSize}KB</span>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium">Optimizations:</span>
                  <div className="text-xs space-y-1">
                    {customization.performance.optimizationRecommendations.map((rec, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-blue-500" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(customization.features).map(([category, features]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="capitalize">{category} Features</CardTitle>
                  <CardDescription>
                    {features.length} features in this category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="justify-center py-1">
                        {feature.replace(/-/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {customization.integrations.map((integration, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cloud className="h-4 w-4" />
                      {integration.provider} Integration
                    </div>
                    <Badge>{integration.type}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium">Configuration:</span>
                      <div className="mt-1 space-y-1">
                        {Object.entries(integration.configuration).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{key}:</span>
                            <span>{value?.toString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Estimated Load Time</span>
                    <span>{customization.performance.estimatedLoadTime.toFixed(1)}s</span>
                  </div>
                  <Progress
                    value={Math.min(100, (3 - customization.performance.estimatedLoadTime) / 3 * 100)}
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Bundle Size</span>
                    <span>{customization.performance.estimatedBundleSize}KB</span>
                  </div>
                  <Progress
                    value={Math.min(100, Math.max(0, (500 - customization.performance.estimatedBundleSize) / 500 * 100))}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Optimization Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {customization.performance.optimizationRecommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {optimizedResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Optimized Performance
                </CardTitle>
                <CardDescription>
                  Performance improvements after optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Load Time Improvement</div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {customization.performance.estimatedLoadTime.toFixed(1)}s
                      </span>
                      <span className="text-sm">→</span>
                      <span className="text-sm font-medium text-green-600">
                        {optimizedResult.performance.estimatedLoadTime.toFixed(1)}s
                      </span>
                      <Badge variant="outline" className="text-green-600">
                        -{((customization.performance.estimatedLoadTime - optimizedResult.performance.estimatedLoadTime) / customization.performance.estimatedLoadTime * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Bundle Size Improvement</div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {customization.performance.estimatedBundleSize}KB
                      </span>
                      <span className="text-sm">→</span>
                      <span className="text-sm font-medium text-green-600">
                        {optimizedResult.performance.estimatedBundleSize}KB
                      </span>
                      <Badge variant="outline" className="text-green-600">
                        -{((customization.performance.estimatedBundleSize - optimizedResult.performance.estimatedBundleSize) / customization.performance.estimatedBundleSize * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="architecture" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Database Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(customization.configuration.database).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-sm font-medium capitalize">{key}:</span>
                    <span className="text-sm">{value?.toString()}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Security Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(customization.configuration.authentication).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-sm font-medium capitalize">{key}:</span>
                    <span className="text-sm">{value?.toString()}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  Deployment Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(customization.configuration.deployment).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-sm font-medium capitalize">{key}:</span>
                    <span className="text-sm">{value?.toString()}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Caching Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(customization.configuration.caching).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-sm font-medium capitalize">{key}:</span>
                    <span className="text-sm">{value?.toString()}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={generateCustomization}>
          Regenerate
        </Button>
        <Button onClick={() => onCustomizationComplete?.(customization)}>
          Apply Customization
        </Button>
      </div>
    </div>
  )
}