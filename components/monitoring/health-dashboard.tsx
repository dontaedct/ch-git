'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Shield,
  TrendingUp,
  Zap,
  Globe,
  Database,
  Server,
  Wifi
} from 'lucide-react'
import healthChecker, { HealthCheckResult, HealthCheck } from '@/lib/monitoring/health-checker'
import deploymentMonitor from '@/lib/monitoring/deployment-monitor'

interface HealthMetrics {
  overallHealth: 'healthy' | 'degraded' | 'unhealthy'
  totalChecks: number
  passedChecks: number
  failedChecks: number
  warningChecks: number
  lastCheckTime: Date
  avgResponseTime: number
  uptime24h: number
}

interface HealthCheckHistory {
  timestamp: Date
  overall: HealthCheckResult['overall']
  checkCount: number
  duration: number
}

export default function HealthDashboard({ deploymentId }: { deploymentId: string }) {
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics | null>(null)
  const [latestHealthCheck, setLatestHealthCheck] = useState<HealthCheckResult | null>(null)
  const [healthHistory, setHealthHistory] = useState<HealthCheckHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [runningCheck, setRunningCheck] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    loadHealthData()
  }, [deploymentId])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadHealthData()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, deploymentId])

  const loadHealthData = async () => {
    try {
      setLoading(true)

      // Load latest health check
      const latestHealth = await healthChecker.getLatestHealthStatus(deploymentId)
      setLatestHealthCheck(latestHealth)

      // Load health history
      const history = await healthChecker.getHealthCheckHistory(deploymentId, {
        limit: 50,
        since: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      })

      const historyData: HealthCheckHistory[] = history.map(h => ({
        timestamp: h.timestamp,
        overall: h.overall,
        checkCount: h.metadata.totalChecks,
        duration: h.metadata.totalDuration
      }))

      setHealthHistory(historyData)

      // Calculate health metrics
      if (latestHealth) {
        const summary = await deploymentMonitor.getDeploymentSummary(deploymentId)

        const metrics: HealthMetrics = {
          overallHealth: latestHealth.overall,
          totalChecks: latestHealth.metadata.totalChecks,
          passedChecks: latestHealth.metadata.passedChecks,
          failedChecks: latestHealth.metadata.failedChecks,
          warningChecks: latestHealth.metadata.warningChecks,
          lastCheckTime: latestHealth.timestamp,
          avgResponseTime: latestHealth.metadata.totalDuration,
          uptime24h: summary.uptime24h
        }

        setHealthMetrics(metrics)
      }
    } catch (error) {
      console.error('Failed to load health data:', error)
    } finally {
      setLoading(false)
    }
  }

  const runHealthCheck = async () => {
    try {
      setRunningCheck(true)
      await healthChecker.performHealthCheck(deploymentId)
      await loadHealthData()
    } catch (error) {
      console.error('Failed to run health check:', error)
    } finally {
      setRunningCheck(false)
    }
  }

  const getHealthIcon = (status: HealthCheckResult['overall']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'unhealthy':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  const getHealthColor = (status: HealthCheckResult['overall']) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50'
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50'
      case 'unhealthy':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getCheckIcon = (checkName: string) => {
    if (checkName.includes('http') || checkName.includes('connectivity')) {
      return <Globe className="h-4 w-4" />
    }
    if (checkName.includes('database') || checkName.includes('db')) {
      return <Database className="h-4 w-4" />
    }
    if (checkName.includes('security') || checkName.includes('ssl')) {
      return <Shield className="h-4 w-4" />
    }
    if (checkName.includes('performance') || checkName.includes('response')) {
      return <TrendingUp className="h-4 w-4" />
    }
    if (checkName.includes('api')) {
      return <Wifi className="h-4 w-4" />
    }
    return <Server className="h-4 w-4" />
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  const formatLastCheck = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffMins < 1) return 'Just now'
    if (diffMins === 1) return '1 minute ago'
    if (diffMins < 60) return `${diffMins} minutes ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours === 1) return '1 hour ago'
    if (diffHours < 24) return `${diffHours} hours ago`

    return new Date(date).toLocaleString()
  }

  const calculateHealthScore = () => {
    if (!healthMetrics) return 0
    if (healthMetrics.totalChecks === 0) return 0
    return Math.round((healthMetrics.passedChecks / healthMetrics.totalChecks) * 100)
  }

  if (loading && !healthMetrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Health Dashboard</h2>
          <p className="text-gray-600">
            Comprehensive health monitoring and system diagnostics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-pulse' : ''}`} />
            Auto Refresh {autoRefresh ? 'On' : 'Off'}
          </Button>
          <Button
            onClick={runHealthCheck}
            disabled={runningCheck}
            size="sm"
          >
            <Zap className="h-4 w-4 mr-2" />
            {runningCheck ? 'Running...' : 'Run Check'}
          </Button>
        </div>
      </div>

      {/* Health Overview */}
      {healthMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                {getHealthIcon(healthMetrics.overallHealth)}
                <div>
                  <div className="text-sm font-medium">Overall Health</div>
                  <div className={`text-lg font-bold capitalize ${getHealthColor(healthMetrics.overallHealth)}`}>
                    {healthMetrics.overallHealth}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="text-sm font-medium">Health Score</div>
                  <div className="text-lg font-bold text-blue-600">
                    {calculateHealthScore()}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <div className="text-sm font-medium">Uptime (24h)</div>
                  <div className="text-lg font-bold text-green-600">
                    {(healthMetrics.uptime24h * 100).toFixed(2)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-purple-500" />
                <div>
                  <div className="text-sm font-medium">Last Check</div>
                  <div className="text-lg font-bold text-purple-600">
                    {formatLastCheck(healthMetrics.lastCheckTime)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Health Information */}
      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">Current Status</TabsTrigger>
          <TabsTrigger value="checks">Health Checks</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          {healthMetrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Check Summary</CardTitle>
                  <CardDescription>
                    Overview of all health check results
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Checks</span>
                      <span className="font-medium">{healthMetrics.totalChecks}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-600">Passed</span>
                      <span className="font-medium text-green-600">{healthMetrics.passedChecks}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-yellow-600">Warnings</span>
                      <span className="font-medium text-yellow-600">{healthMetrics.warningChecks}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-red-600">Failed</span>
                      <span className="font-medium text-red-600">{healthMetrics.failedChecks}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Health Score</span>
                      <span>{calculateHealthScore()}%</span>
                    </div>
                    <Progress value={calculateHealthScore()} className="w-full" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>
                    Health check performance and timing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg Response Time</span>
                      <span className="font-medium">{formatDuration(healthMetrics.avgResponseTime)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">24h Uptime</span>
                      <span className="font-medium">{(healthMetrics.uptime24h * 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Last Check</span>
                      <span className="font-medium">{formatLastCheck(healthMetrics.lastCheckTime)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uptime Score</span>
                      <span>{(healthMetrics.uptime24h * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={healthMetrics.uptime24h * 100} className="w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="checks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Health Checks</CardTitle>
              <CardDescription>
                Individual health check results and diagnostics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {latestHealthCheck ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getHealthIcon(latestHealthCheck.overall)}
                      <div>
                        <div className="font-medium">Overall Status</div>
                        <div className="text-sm text-gray-600">
                          {latestHealthCheck.metadata.passedChecks}/{latestHealthCheck.metadata.totalChecks} checks passed
                        </div>
                      </div>
                    </div>
                    <Badge className={getHealthColor(latestHealthCheck.overall)}>
                      {latestHealthCheck.overall}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(latestHealthCheck.checks).map(([checkName, result]) => (
                      <div key={checkName} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {getCheckIcon(checkName)}
                            <div className={`w-2 h-2 rounded-full ${
                              result.status === 'pass'
                                ? 'bg-green-500'
                                : result.status === 'warn'
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`} />
                          </div>
                          <div>
                            <div className="font-medium text-sm capitalize">
                              {checkName.replace(/-/g, ' ')}
                            </div>
                            <div className="text-xs text-gray-600">{result.message}</div>
                            {result.details && Object.keys(result.details).length > 0 && (
                              <div className="text-xs text-gray-500 mt-1">
                                {Object.entries(result.details).slice(0, 2).map(([key, value]) => (
                                  <span key={key} className="mr-3">
                                    {key}: {String(value).slice(0, 30)}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-500">{formatDuration(result.duration)}</span>
                          <Badge variant={
                            result.status === 'pass' ? 'default' :
                            result.status === 'warn' ? 'secondary' : 'destructive'
                          }>
                            {result.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-lg font-medium text-gray-600 mb-2">No Health Data Available</div>
                  <div className="text-sm text-gray-500 mb-4">
                    Run a health check to see detailed system diagnostics
                  </div>
                  <Button onClick={runHealthCheck} disabled={runningCheck}>
                    <Zap className="h-4 w-4 mr-2" />
                    {runningCheck ? 'Running Health Check...' : 'Run Health Check'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Health Check History</CardTitle>
              <CardDescription>
                Historical health check results over the past 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              {healthHistory.length > 0 ? (
                <div className="space-y-3">
                  {healthHistory.slice(0, 20).map((history, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getHealthIcon(history.overall)}
                        <div>
                          <div className="font-medium text-sm capitalize">{history.overall}</div>
                          <div className="text-xs text-gray-600">
                            {history.checkCount} checks • {formatDuration(history.duration)}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatLastCheck(history.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-lg font-medium text-gray-600 mb-2">No History Available</div>
                  <div className="text-sm text-gray-500">
                    Health check history will appear here as checks are performed
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Health Trends</CardTitle>
              <CardDescription>
                Analysis of health patterns and trends over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {healthHistory.length > 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round((healthHistory.filter(h => h.overall === 'healthy').length / healthHistory.length) * 100)}%
                      </div>
                      <div className="text-sm text-gray-500">Healthy Checks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatDuration(healthHistory.reduce((sum, h) => sum + h.duration, 0) / healthHistory.length)}
                      </div>
                      <div className="text-sm text-gray-500">Avg Check Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {healthHistory.length}
                      </div>
                      <div className="text-sm text-gray-500">Total Checks (24h)</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Recent Trend Analysis</h4>
                    <div className="text-sm text-gray-600">
                      {(() => {
                        const recent = healthHistory.slice(0, 10)
                        const older = healthHistory.slice(10, 20)

                        const recentHealthy = recent.filter(h => h.overall === 'healthy').length / recent.length
                        const olderHealthy = older.length > 0 ? older.filter(h => h.overall === 'healthy').length / older.length : recentHealthy

                        if (recentHealthy > olderHealthy) {
                          return '📈 Health is improving - more checks are passing recently'
                        } else if (recentHealthy < olderHealthy) {
                          return '📉 Health may be declining - fewer checks are passing recently'
                        } else {
                          return '📊 Health is stable - consistent check results over time'
                        }
                      })()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-lg font-medium text-gray-600 mb-2">No Trend Data Available</div>
                  <div className="text-sm text-gray-500">
                    Perform more health checks to see trend analysis
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}