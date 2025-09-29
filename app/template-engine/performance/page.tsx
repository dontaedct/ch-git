'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Zap, Clock, Cpu, HardDrive, Network, TrendingUp, Settings, Play, RotateCcw, CheckCircle, AlertTriangle } from 'lucide-react'

interface PerformanceMetric {
  id: string
  name: string
  currentValue: number
  targetValue: number
  unit: string
  status: 'excellent' | 'good' | 'needs-improvement' | 'poor'
  trend: 'up' | 'down' | 'stable'
}

interface OptimizationSetting {
  id: string
  name: string
  description: string
  enabled: boolean
  impact: 'high' | 'medium' | 'low'
  category: 'compilation' | 'loading' | 'caching' | 'bundling'
  value?: number
  range?: [number, number]
}

interface OptimizationResult {
  id: string
  name: string
  beforeValue: number
  afterValue: number
  improvement: number
  unit: string
  status: 'completed' | 'running' | 'pending' | 'failed'
}

export default function PerformanceOptimizationPage() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([
    {
      id: 'template-compilation',
      name: 'Template Compilation Time',
      currentValue: 1.2,
      targetValue: 30.0,
      unit: 'seconds',
      status: 'excellent',
      trend: 'down'
    },
    {
      id: 'app-generation',
      name: 'App Generation Time',
      currentValue: 108,
      targetValue: 120,
      unit: 'seconds',
      status: 'good',
      trend: 'down'
    },
    {
      id: 'template-loading',
      name: 'Template Loading Time',
      currentValue: 2.1,
      targetValue: 5.0,
      unit: 'seconds',
      status: 'excellent',
      trend: 'stable'
    },
    {
      id: 'component-injection',
      name: 'Component Injection Time',
      currentValue: 8.5,
      targetValue: 10.0,
      unit: 'seconds',
      status: 'good',
      trend: 'down'
    },
    {
      id: 'bundle-size',
      name: 'Bundle Size',
      currentValue: 2.8,
      targetValue: 5.0,
      unit: 'MB',
      status: 'excellent',
      trend: 'down'
    },
    {
      id: 'memory-usage',
      name: 'Memory Usage',
      currentValue: 145,
      targetValue: 200,
      unit: 'MB',
      status: 'good',
      trend: 'stable'
    }
  ])

  const [optimizations, setOptimizations] = useState<OptimizationSetting[]>([
    {
      id: 'template-caching',
      name: 'Template Caching',
      description: 'Cache compiled templates to avoid recompilation',
      enabled: true,
      impact: 'high',
      category: 'caching'
    },
    {
      id: 'component-lazy-loading',
      name: 'Component Lazy Loading',
      description: 'Load components only when needed',
      enabled: true,
      impact: 'medium',
      category: 'loading'
    },
    {
      id: 'code-splitting',
      name: 'Code Splitting',
      description: 'Split generated code into smaller chunks',
      enabled: true,
      impact: 'high',
      category: 'bundling'
    },
    {
      id: 'tree-shaking',
      name: 'Tree Shaking',
      description: 'Remove unused code from bundles',
      enabled: true,
      impact: 'medium',
      category: 'bundling'
    },
    {
      id: 'parallel-compilation',
      name: 'Parallel Compilation',
      description: 'Compile templates in parallel when possible',
      enabled: false,
      impact: 'high',
      category: 'compilation'
    },
    {
      id: 'minification',
      name: 'Asset Minification',
      description: 'Minify CSS, JS, and HTML output',
      enabled: true,
      impact: 'medium',
      category: 'bundling'
    },
    {
      id: 'image-optimization',
      name: 'Image Optimization',
      description: 'Optimize and compress template images',
      enabled: true,
      impact: 'medium',
      category: 'loading'
    },
    {
      id: 'preload-critical',
      name: 'Critical Resource Preloading',
      description: 'Preload critical resources for faster loading',
      enabled: false,
      impact: 'medium',
      category: 'loading'
    }
  ])

  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResult[]>([])
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'compilation' | 'loading' | 'caching' | 'bundling'>('all')

  const runOptimization = async () => {
    setIsOptimizing(true)
    setOptimizationResults([])

    const enabledOptimizations = optimizations.filter(opt => opt.enabled)
    const results: OptimizationResult[] = []

    for (const optimization of enabledOptimizations) {
      const result: OptimizationResult = {
        id: optimization.id,
        name: optimization.name,
        beforeValue: Math.random() * 100 + 50,
        afterValue: 0,
        improvement: 0,
        unit: 'ms',
        status: 'running'
      }

      results.push(result)
      setOptimizationResults([...results])

      // Simulate optimization execution
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000))

      // Calculate improvement based on impact
      const impactMultiplier = { high: 0.4, medium: 0.25, low: 0.15 }[optimization.impact]
      const improvement = result.beforeValue * impactMultiplier * (0.8 + Math.random() * 0.4)

      result.afterValue = result.beforeValue - improvement
      result.improvement = improvement
      result.status = 'completed'

      setOptimizationResults([...results])
    }

    // Update metrics after optimization
    setMetrics(prev => prev.map(metric => {
      const relevantOptimizations = enabledOptimizations.filter(opt =>
        (metric.id.includes('compilation') && opt.category === 'compilation') ||
        (metric.id.includes('loading') && opt.category === 'loading') ||
        (metric.id.includes('bundle') && opt.category === 'bundling')
      )

      if (relevantOptimizations.length > 0) {
        const totalImprovement = relevantOptimizations.reduce((acc, opt) => {
          const impactMultiplier = { high: 0.3, medium: 0.15, low: 0.05 }[opt.impact]
          return acc + impactMultiplier
        }, 0)

        const newValue = metric.currentValue * (1 - Math.min(totalImprovement, 0.6))
        return {
          ...metric,
          currentValue: Math.round(newValue * 100) / 100,
          status: newValue < metric.targetValue * 0.5 ? 'excellent' :
                  newValue < metric.targetValue * 0.7 ? 'good' :
                  newValue < metric.targetValue ? 'needs-improvement' : 'poor' as const,
          trend: 'down' as const
        }
      }
      return metric
    }))

    setIsOptimizing(false)
  }

  const toggleOptimization = (id: string) => {
    setOptimizations(prev => prev.map(opt =>
      opt.id === id ? { ...opt, enabled: !opt.enabled } : opt
    ))
  }

  const getStatusColor = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'needs-improvement': return 'text-yellow-600'
      case 'poor': return 'text-red-600'
    }
  }

  const getStatusBadge = (status: PerformanceMetric['status']) => {
    const variants = {
      excellent: 'default',
      good: 'secondary',
      'needs-improvement': 'outline',
      poor: 'destructive'
    } as const

    return <Badge variant={variants[status]}>{status.replace('-', ' ').toUpperCase()}</Badge>
  }

  const getTrendIcon = (trend: PerformanceMetric['trend']) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'down': return <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />
      case 'stable': return <div className="h-4 w-4 border-b-2 border-gray-400" />
    }
  }

  const getImpactBadge = (impact: OptimizationSetting['impact']) => {
    const variants = {
      high: 'destructive',
      medium: 'secondary',
      low: 'outline'
    } as const

    return <Badge variant={variants[impact]} className="text-xs">{impact.toUpperCase()}</Badge>
  }

  const filteredOptimizations = selectedCategory === 'all'
    ? optimizations
    : optimizations.filter(opt => opt.category === selectedCategory)

  const overallScore = Math.round(
    metrics.reduce((acc, metric) => {
      const score = Math.min((metric.targetValue / metric.currentValue) * 100, 100)
      return acc + score
    }, 0) / metrics.length
  )

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Optimization</h1>
          <p className="text-muted-foreground">
            Optimize template engine performance with advanced caching, compilation, and loading strategies
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runOptimization}
            disabled={isOptimizing}
            className="flex items-center gap-2"
          >
            {isOptimizing ? <Clock className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {isOptimizing ? 'Optimizing...' : 'Run Optimization'}
          </Button>
        </div>
      </div>

      {/* Overall Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Overview
          </CardTitle>
          <CardDescription>
            Current performance metrics and optimization status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">{overallScore}%</div>
              <div className="text-sm text-muted-foreground">Overall Performance Score</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metrics.slice(0, 3).map((metric) => (
              <div key={metric.id} className="text-center p-4 border rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {getTrendIcon(metric.trend)}
                  <span className="font-medium">{metric.name}</span>
                </div>
                <div className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                  {metric.currentValue}{metric.unit}
                </div>
                <div className="text-xs text-muted-foreground">
                  Target: {metric.targetValue}{metric.unit}
                </div>
                <div className="mt-2">
                  {getStatusBadge(metric.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Detailed Performance Metrics
          </CardTitle>
          <CardDescription>
            Comprehensive performance metrics with targets and current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.map((metric) => (
              <div key={metric.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getTrendIcon(metric.trend)}
                  <div>
                    <div className="font-medium">{metric.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Target: {metric.targetValue}{metric.unit}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${getStatusColor(metric.status)}`}>
                      {metric.currentValue}{metric.unit}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {((1 - metric.currentValue / metric.targetValue) * 100).toFixed(1)}% under target
                    </div>
                  </div>
                  {getStatusBadge(metric.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optimization Settings */}
      <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Optimizations</TabsTrigger>
            <TabsTrigger value="compilation">Compilation</TabsTrigger>
            <TabsTrigger value="loading">Loading</TabsTrigger>
            <TabsTrigger value="caching">Caching</TabsTrigger>
            <TabsTrigger value="bundling">Bundling</TabsTrigger>
          </TabsList>
          <div className="text-sm text-muted-foreground">
            {optimizations.filter(opt => opt.enabled).length} of {optimizations.length} optimizations enabled
          </div>
        </div>

        <TabsContent value={selectedCategory}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Optimization Settings
              </CardTitle>
              <CardDescription>
                Configure performance optimization strategies for the template engine
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredOptimizations.map((optimization) => (
                  <div key={optimization.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={optimization.enabled}
                        onCheckedChange={() => toggleOptimization(optimization.id)}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{optimization.name}</span>
                          {getImpactBadge(optimization.impact)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {optimization.description}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {optimization.category}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Optimization Results */}
      {optimizationResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Optimization Results
            </CardTitle>
            <CardDescription>
              Performance improvements from recent optimization run
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {optimizationResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {result.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : result.status === 'running' ? (
                      <Clock className="h-4 w-4 text-blue-600 animate-spin" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    )}
                    <div>
                      <div className="font-medium">{result.name}</div>
                      {result.status === 'completed' && (
                        <div className="text-sm text-green-600">
                          Improved by {result.improvement.toFixed(1)}{result.unit}
                        </div>
                      )}
                    </div>
                  </div>
                  {result.status === 'completed' && (
                    <div className="text-right">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Before: </span>
                        <span>{result.beforeValue.toFixed(1)}{result.unit}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">After: </span>
                        <span className="text-green-600">{result.afterValue.toFixed(1)}{result.unit}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}