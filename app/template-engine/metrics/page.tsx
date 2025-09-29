'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart3, Clock, Cpu, Database, HardDrive, Network, RefreshCw, TrendingDown, TrendingUp, Activity, Zap } from 'lucide-react'

interface MetricData {
  timestamp: Date
  value: number
  status: 'healthy' | 'warning' | 'critical'
}

interface PerformanceMetric {
  id: string
  name: string
  description: string
  unit: string
  currentValue: number
  target: number
  category: 'compilation' | 'loading' | 'generation' | 'system'
  data: MetricData[]
  trend: 'improving' | 'degrading' | 'stable'
  alerts: Alert[]
}

interface Alert {
  id: string
  type: 'warning' | 'critical' | 'info'
  message: string
  timestamp: Date
  resolved: boolean
}

interface BenchmarkComparison {
  metric: string
  currentValue: number
  industry: number
  target: number
  percentile: number
}

export default function PerformanceMetricsPage() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([
    {
      id: 'template-compilation-time',
      name: 'Template Compilation Time',
      description: 'Time taken to compile template configurations into executable components',
      unit: 'ms',
      currentValue: 1200,
      target: 30000,
      category: 'compilation',
      trend: 'improving',
      alerts: [],
      data: generateMetricData(1200, 500, 24)
    },
    {
      id: 'app-generation-time',
      name: 'App Generation Time',
      description: 'Total time to generate complete client application from template',
      unit: 'seconds',
      currentValue: 108,
      target: 120,
      category: 'generation',
      trend: 'stable',
      alerts: [],
      data: generateMetricData(108, 20, 24)
    },
    {
      id: 'template-loading-time',
      name: 'Template Loading Time',
      description: 'Time to load and parse template configuration files',
      unit: 'ms',
      currentValue: 2100,
      target: 5000,
      category: 'loading',
      trend: 'improving',
      alerts: [],
      data: generateMetricData(2100, 300, 24)
    },
    {
      id: 'component-injection-time',
      name: 'Component Injection Time',
      description: 'Time to inject components into template structure',
      unit: 'ms',
      currentValue: 8500,
      target: 10000,
      category: 'compilation',
      trend: 'stable',
      alerts: [],
      data: generateMetricData(8500, 1000, 24)
    },
    {
      id: 'memory-usage',
      name: 'Memory Usage',
      description: 'RAM consumption during template processing',
      unit: 'MB',
      currentValue: 145,
      target: 200,
      category: 'system',
      trend: 'stable',
      alerts: [
        {
          id: 'mem-1',
          type: 'warning',
          message: 'Memory usage approaching 75% of target',
          timestamp: new Date(Date.now() - 3600000),
          resolved: false
        }
      ],
      data: generateMetricData(145, 25, 24)
    },
    {
      id: 'cpu-usage',
      name: 'CPU Usage',
      description: 'Processor utilization during template operations',
      unit: '%',
      currentValue: 65,
      target: 80,
      category: 'system',
      trend: 'degrading',
      alerts: [],
      data: generateMetricData(65, 15, 24)
    },
    {
      id: 'bundle-size',
      name: 'Generated Bundle Size',
      description: 'Size of generated client application bundles',
      unit: 'MB',
      currentValue: 2.8,
      target: 5.0,
      category: 'generation',
      trend: 'improving',
      alerts: [],
      data: generateMetricData(2.8, 0.5, 24)
    },
    {
      id: 'cache-hit-rate',
      name: 'Template Cache Hit Rate',
      description: 'Percentage of template requests served from cache',
      unit: '%',
      currentValue: 94,
      target: 90,
      category: 'loading',
      trend: 'stable',
      alerts: [],
      data: generateMetricData(94, 5, 24)
    }
  ])

  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'compilation' | 'loading' | 'generation' | 'system'>('all')
  const [benchmarks] = useState<BenchmarkComparison[]>([
    { metric: 'Template Compilation', currentValue: 1.2, industry: 15.0, target: 30.0, percentile: 95 },
    { metric: 'App Generation', currentValue: 108, industry: 180, target: 120, percentile: 88 },
    { metric: 'Template Loading', currentValue: 2.1, industry: 8.5, target: 5.0, percentile: 92 },
    { metric: 'Bundle Size', currentValue: 2.8, industry: 4.2, target: 5.0, percentile: 85 },
    { metric: 'Memory Usage', currentValue: 145, industry: 220, target: 200, percentile: 78 },
    { metric: 'Cache Hit Rate', currentValue: 94, industry: 85, target: 90, percentile: 98 }
  ])

  const refreshMetrics = async () => {
    // Simulate metrics refresh
    setMetrics(prev => prev.map(metric => ({
      ...metric,
      currentValue: metric.currentValue + (Math.random() - 0.5) * metric.currentValue * 0.1,
      data: [...metric.data.slice(1), {
        timestamp: new Date(),
        value: metric.currentValue + (Math.random() - 0.5) * metric.currentValue * 0.1,
        status: Math.random() > 0.1 ? 'healthy' : Math.random() > 0.5 ? 'warning' : 'critical'
      }]
    })))
  }

  const filteredMetrics = selectedCategory === 'all'
    ? metrics
    : metrics.filter(metric => metric.category === selectedCategory)

  const getMetricStatus = (metric: PerformanceMetric): 'excellent' | 'good' | 'warning' | 'critical' => {
    const ratio = metric.currentValue / metric.target
    if (metric.unit === '%' || metric.id === 'cache-hit-rate') {
      if (metric.currentValue >= metric.target) return 'excellent'
      if (metric.currentValue >= metric.target * 0.8) return 'good'
      if (metric.currentValue >= metric.target * 0.6) return 'warning'
      return 'critical'
    } else {
      if (ratio <= 0.5) return 'excellent'
      if (ratio <= 0.7) return 'good'
      if (ratio <= 0.9) return 'warning'
      return 'critical'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      excellent: 'default',
      good: 'secondary',
      warning: 'outline',
      critical: 'destructive'
    } as const

    return <Badge variant={variants[status as keyof typeof variants]}>{status.toUpperCase()}</Badge>
  }

  const getTrendIcon = (trend: PerformanceMetric['trend']) => {
    switch (trend) {
      case 'improving': return <TrendingDown className="h-4 w-4 text-green-600" />
      case 'degrading': return <TrendingUp className="h-4 w-4 text-red-600" />
      case 'stable': return <Activity className="h-4 w-4 text-blue-600" />
    }
  }

  const getCategoryIcon = (category: PerformanceMetric['category']) => {
    switch (category) {
      case 'compilation': return <Cpu className="h-4 w-4" />
      case 'loading': return <Clock className="h-4 w-4" />
      case 'generation': return <Zap className="h-4 w-4" />
      case 'system': return <HardDrive className="h-4 w-4" />
    }
  }

  const activeAlerts = metrics.flatMap(m => m.alerts.filter(a => !a.resolved))
  const averagePerformanceScore = Math.round(
    filteredMetrics.reduce((acc, metric) => {
      const status = getMetricStatus(metric)
      const score = { excellent: 100, good: 80, warning: 60, critical: 30 }[status]
      return acc + score
    }, 0) / filteredMetrics.length
  )

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Metrics</h1>
          <p className="text-muted-foreground">
            Real-time performance monitoring and analytics for the template engine
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={refreshMetrics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Overview
          </CardTitle>
          <CardDescription>
            Current performance status and key metrics summary
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{averagePerformanceScore}%</div>
              <div className="text-sm text-muted-foreground">Performance Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{filteredMetrics.length}</div>
              <div className="text-sm text-muted-foreground">Active Metrics</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{activeAlerts.length}</div>
              <div className="text-sm text-muted-foreground">Active Alerts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {metrics.filter(m => m.trend === 'improving').length}
              </div>
              <div className="text-sm text-muted-foreground">Improving</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.slice(0, 4).map((metric) => {
              const status = getMetricStatus(metric)
              return (
                <div key={metric.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    {getCategoryIcon(metric.category)}
                    {getTrendIcon(metric.trend)}
                  </div>
                  <div className="font-medium text-sm mb-1">{metric.name}</div>
                  <div className={`text-xl font-bold ${getStatusColor(status)}`}>
                    {metric.currentValue.toFixed(metric.unit === 'ms' ? 0 : 1)}{metric.unit}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Target: {metric.target}{metric.unit}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Metrics by Category */}
      <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)} className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Metrics</TabsTrigger>
          <TabsTrigger value="compilation">Compilation</TabsTrigger>
          <TabsTrigger value="loading">Loading</TabsTrigger>
          <TabsTrigger value="generation">Generation</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredMetrics.map((metric) => {
              const status = getMetricStatus(metric)
              const progressValue = metric.unit === '%' || metric.id === 'cache-hit-rate'
                ? (metric.currentValue / 100) * 100
                : Math.min((metric.target - metric.currentValue) / metric.target * 100, 100)

              return (
                <Card key={metric.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(metric.category)}
                        <CardTitle className="text-base">{metric.name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(metric.trend)}
                        {getStatusBadge(status)}
                      </div>
                    </div>
                    <CardDescription className="text-sm">
                      {metric.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`text-2xl font-bold ${getStatusColor(status)}`}>
                            {metric.currentValue.toFixed(metric.unit === 'ms' ? 0 : 1)}{metric.unit}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Target: {metric.target}{metric.unit}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {progressValue.toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {metric.unit === '%' || metric.id === 'cache-hit-rate' ? 'Efficiency' : 'Under Target'}
                          </div>
                        </div>
                      </div>

                      <Progress value={progressValue} className="h-2" />

                      {metric.alerts.length > 0 && (
                        <div className="space-y-2">
                          {metric.alerts.map((alert) => (
                            <div
                              key={alert.id}
                              className={`text-xs p-2 rounded border ${
                                alert.type === 'critical' ? 'border-red-200 bg-red-50 text-red-700' :
                                alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50 text-yellow-700' :
                                'border-blue-200 bg-blue-50 text-blue-700'
                              }`}
                            >
                              {alert.message}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Benchmark Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Industry Benchmark Comparison
          </CardTitle>
          <CardDescription>
            Performance comparison against industry standards and best practices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {benchmarks.map((benchmark, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">{benchmark.metric}</div>
                  <div className="text-sm text-muted-foreground">
                    {benchmark.percentile}th percentile performance
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-sm">
                    <span className="font-medium text-green-600">
                      Current: {benchmark.currentValue}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Industry: {benchmark.industry}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Target: {benchmark.target}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <Badge
                    variant={benchmark.currentValue < benchmark.industry ? 'default' : 'secondary'}
                  >
                    {benchmark.currentValue < benchmark.industry ? 'ABOVE AVERAGE' : 'BELOW AVERAGE'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function generateMetricData(baseValue: number, variance: number, points: number): MetricData[] {
  const data: MetricData[] = []
  let currentValue = baseValue

  for (let i = 0; i < points; i++) {
    const change = (Math.random() - 0.5) * variance
    currentValue = Math.max(0, currentValue + change)

    data.push({
      timestamp: new Date(Date.now() - (points - i) * 3600000), // Hour intervals
      value: currentValue,
      status: Math.random() > 0.1 ? 'healthy' : Math.random() > 0.7 ? 'warning' : 'critical'
    })
  }

  return data
}