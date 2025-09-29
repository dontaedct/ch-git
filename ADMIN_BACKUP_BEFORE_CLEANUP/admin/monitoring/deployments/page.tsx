'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Activity, AlertTriangle, CheckCircle, Clock, Server, TrendingUp, Zap, Eye } from 'lucide-react'
import deploymentMonitor, { DeploymentStatus, DeploymentAlert } from '@/lib/monitoring/deployment-monitor'
import healthChecker, { HealthCheckResult } from '@/lib/monitoring/health-checker'
import performanceMonitor, { PerformanceMetrics } from '@/lib/monitoring/performance-monitor'
import incidentManager, { Incident } from '@/lib/monitoring/incident-manager'

interface DeploymentSummary {
  deploymentId: string
  clientName: string
  url: string
  status: DeploymentStatus['status']
  lastCheck: Date
  uptime: number
  responseTime: number
  errors: number
  alerts: number
}

export default function DeploymentMonitoringPage() {
  const [deployments, setDeployments] = useState<DeploymentSummary[]>([])
  const [selectedDeployment, setSelectedDeployment] = useState<string>('')
  const [deploymentDetails, setDeploymentDetails] = useState<{
    status: DeploymentStatus | null
    health: HealthCheckResult | null
    performance: PerformanceMetrics | null
    alerts: DeploymentAlert[]
    incidents: Incident[]
  }>({
    status: null,
    health: null,
    performance: null,
    alerts: [],
    incidents: []
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadDeployments()
  }, [])

  useEffect(() => {
    if (selectedDeployment) {
      loadDeploymentDetails(selectedDeployment)
    }
  }, [selectedDeployment])

  const loadDeployments = async () => {
    try {
      setLoading(true)

      // Mock deployment data - in real implementation, this would come from the database
      const mockDeployments: DeploymentSummary[] = [
        {
          deploymentId: 'deploy_001',
          clientName: 'TechStart Inc',
          url: 'https://techstart.example.com',
          status: 'healthy',
          lastCheck: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
          uptime: 0.999,
          responseTime: 245,
          errors: 0,
          alerts: 0
        },
        {
          deploymentId: 'deploy_002',
          clientName: 'EcoSolutions',
          url: 'https://ecosolutions.example.com',
          status: 'degraded',
          lastCheck: new Date(Date.now() - 1 * 60 * 1000), // 1 minute ago
          uptime: 0.987,
          responseTime: 1850,
          errors: 3,
          alerts: 2
        },
        {
          deploymentId: 'deploy_003',
          clientName: 'FinanceHub',
          url: 'https://financehub.example.com',
          status: 'healthy',
          lastCheck: new Date(Date.now() - 3 * 60 * 1000), // 3 minutes ago
          uptime: 0.995,
          responseTime: 180,
          errors: 1,
          alerts: 0
        },
        {
          deploymentId: 'deploy_004',
          clientName: 'HealthCarePlus',
          url: 'https://healthcareplus.example.com',
          status: 'failed',
          lastCheck: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          uptime: 0.923,
          responseTime: 0,
          errors: 15,
          alerts: 5
        }
      ]

      setDeployments(mockDeployments)

      if (!selectedDeployment && mockDeployments.length > 0) {
        setSelectedDeployment(mockDeployments[0].deploymentId)
      }
    } catch (error) {
      console.error('Failed to load deployments:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadDeploymentDetails = async (deploymentId: string) => {
    try {
      setRefreshing(true)

      // Load deployment status
      const statuses = await deploymentMonitor.getDeploymentStatuses({
        deploymentId,
        limit: 1
      })

      // Load health check results
      const healthResult = await healthChecker.getLatestHealthStatus(deploymentId)

      // Load performance metrics
      const performanceHistory = await performanceMonitor.getPerformanceHistory(deploymentId, {
        limit: 1
      })

      // Load alerts
      const alerts = await deploymentMonitor.getDeploymentAlerts({
        deploymentId,
        resolved: false,
        limit: 10
      })

      // Load incidents
      const incidents = await incidentManager.getIncidents({
        deploymentId,
        status: ['open', 'investigating', 'identified', 'monitoring'],
        limit: 5
      })

      setDeploymentDetails({
        status: statuses[0] || null,
        health: healthResult,
        performance: performanceHistory[0] || null,
        alerts,
        incidents
      })
    } catch (error) {
      console.error('Failed to load deployment details:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    loadDeployments()
    if (selectedDeployment) {
      loadDeploymentDetails(selectedDeployment)
    }
  }

  const handleRunHealthCheck = async () => {
    if (!selectedDeployment) return

    try {
      setRefreshing(true)
      await healthChecker.performHealthCheck(selectedDeployment)
      await loadDeploymentDetails(selectedDeployment)
    } catch (error) {
      console.error('Failed to run health check:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const getStatusIcon = (status: DeploymentStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'maintenance':
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: DeploymentStatus['status']) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800'
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'maintenance':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatUptime = (uptime: number) => {
    return `${(uptime * 100).toFixed(2)}%`
  }

  const formatResponseTime = (responseTime: number) => {
    return responseTime > 0 ? `${responseTime}ms` : 'N/A'
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

    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return '1 day ago'
    return `${diffDays} days ago`
  }

  const selectedDeploymentData = deployments.find(d => d.deploymentId === selectedDeployment)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Deployment Monitoring</h1>
          <p className="text-gray-600 mt-2">
            Monitor the health, performance, and status of all client deployments
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            onClick={handleRunHealthCheck}
            disabled={!selectedDeployment || refreshing}
          >
            <Activity className="h-4 w-4 mr-2" />
            Run Health Check
          </Button>
        </div>
      </div>

      {/* Deployment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {deployments.map((deployment) => (
          <Card
            key={deployment.deploymentId}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedDeployment === deployment.deploymentId ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedDeployment(deployment.deploymentId)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {deployment.clientName}
                </CardTitle>
                {getStatusIcon(deployment.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge className={getStatusColor(deployment.status)}>
                  {deployment.status}
                </Badge>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Uptime: {formatUptime(deployment.uptime)}</div>
                  <div>Response: {formatResponseTime(deployment.responseTime)}</div>
                  <div>Errors: {deployment.errors}</div>
                  <div>Last check: {formatLastCheck(deployment.lastCheck)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Deployment Details */}
      {selectedDeploymentData && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    {getStatusIcon(selectedDeploymentData.status)}
                    <span>{selectedDeploymentData.clientName}</span>
                  </CardTitle>
                  <CardDescription>
                    {selectedDeploymentData.url}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(selectedDeploymentData.status)}>
                  {selectedDeploymentData.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatUptime(selectedDeploymentData.uptime)}
                  </div>
                  <div className="text-sm text-gray-500">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatResponseTime(selectedDeploymentData.responseTime)}
                  </div>
                  <div className="text-sm text-gray-500">Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {selectedDeploymentData.errors}
                  </div>
                  <div className="text-sm text-gray-500">Errors (24h)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {selectedDeploymentData.alerts}
                  </div>
                  <div className="text-sm text-gray-500">Active Alerts</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="health">Health Checks</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
              <TabsTrigger value="incidents">Incidents</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Server className="h-5 w-5" />
                      <span>Deployment Status</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {deploymentDetails.status ? (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Status</span>
                          <Badge className={getStatusColor(deploymentDetails.status.status)}>
                            {deploymentDetails.status.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Version</span>
                          <span className="text-sm font-medium">
                            {deploymentDetails.status.version}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Last Check</span>
                          <span className="text-sm font-medium">
                            {formatLastCheck(deploymentDetails.status.timestamp)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Uptime</span>
                          <span className="text-sm font-medium">
                            {deploymentDetails.status.metadata.uptime
                              ? formatUptime(deploymentDetails.status.metadata.uptime)
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">No status data available</div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Performance Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {deploymentDetails.performance ? (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Avg Response Time</span>
                          <span className="text-sm font-medium">
                            {deploymentDetails.performance.metrics.responseTime.avg.toFixed(0)}ms
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Throughput</span>
                          <span className="text-sm font-medium">
                            {deploymentDetails.performance.metrics.throughput.requestsPerSecond.toFixed(1)} req/sec
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Error Rate</span>
                          <span className="text-sm font-medium">
                            {(deploymentDetails.performance.metrics.errors.errorRate * 100).toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">CPU Usage</span>
                          <span className="text-sm font-medium">
                            {deploymentDetails.performance.metrics.resources.cpuUsage
                              ? `${(deploymentDetails.performance.metrics.resources.cpuUsage * 100).toFixed(1)}%`
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">No performance data available</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="health" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Health Check Results</CardTitle>
                  <CardDescription>
                    Detailed health check results for all system components
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {deploymentDetails.health ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={
                            deploymentDetails.health.overall === 'healthy'
                              ? 'bg-green-100 text-green-800'
                              : deploymentDetails.health.overall === 'degraded'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }>
                            {deploymentDetails.health.overall}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Last check: {formatLastCheck(deploymentDetails.health.timestamp)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {deploymentDetails.health.metadata.passedChecks}/{deploymentDetails.health.metadata.totalChecks} checks passed
                        </div>
                      </div>

                      <div className="space-y-2">
                        {Object.entries(deploymentDetails.health.checks).map(([checkName, result]) => (
                          <div key={checkName} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`w-2 h-2 rounded-full ${
                                result.status === 'pass'
                                  ? 'bg-green-500'
                                  : result.status === 'warn'
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`} />
                              <div>
                                <div className="font-medium text-sm">{checkName}</div>
                                <div className="text-xs text-gray-500">{result.message}</div>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              {result.duration}ms
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Eye className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-500">No health check data available</div>
                      <Button
                        onClick={handleRunHealthCheck}
                        className="mt-2"
                        size="sm"
                      >
                        Run Health Check
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>
                    Real-time performance monitoring and analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {deploymentDetails.performance ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {deploymentDetails.performance.metrics.responseTime.avg.toFixed(0)}ms
                          </div>
                          <div className="text-sm text-gray-500">Average Response Time</div>
                          <div className="text-xs text-gray-400 mt-1">
                            P95: {deploymentDetails.performance.metrics.responseTime.p95.toFixed(0)}ms
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {deploymentDetails.performance.metrics.throughput.requestsPerSecond.toFixed(1)}
                          </div>
                          <div className="text-sm text-gray-500">Requests/Second</div>
                          <div className="text-xs text-gray-400 mt-1">
                            Total: {deploymentDetails.performance.metrics.throughput.totalRequests}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {(deploymentDetails.performance.metrics.errors.errorRate * 100).toFixed(2)}%
                          </div>
                          <div className="text-sm text-gray-500">Error Rate</div>
                          <div className="text-xs text-gray-400 mt-1">
                            Total: {deploymentDetails.performance.metrics.errors.totalErrors}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Resource Usage</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">CPU</span>
                              <span className="text-sm font-medium">
                                {deploymentDetails.performance.metrics.resources.cpuUsage
                                  ? `${(deploymentDetails.performance.metrics.resources.cpuUsage * 100).toFixed(1)}%`
                                  : 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Memory</span>
                              <span className="text-sm font-medium">
                                {deploymentDetails.performance.metrics.resources.memoryUsage
                                  ? `${(deploymentDetails.performance.metrics.resources.memoryUsage * 100).toFixed(1)}%`
                                  : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">User Experience</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">LCP</span>
                              <span className="text-sm font-medium">
                                {deploymentDetails.performance.metrics.userExperience.largestContentfulPaint
                                  ? `${deploymentDetails.performance.metrics.userExperience.largestContentfulPaint.toFixed(0)}ms`
                                  : 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">FID</span>
                              <span className="text-sm font-medium">
                                {deploymentDetails.performance.metrics.userExperience.firstInputDelay
                                  ? `${deploymentDetails.performance.metrics.userExperience.firstInputDelay.toFixed(0)}ms`
                                  : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-500">No performance data available</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Active Alerts</CardTitle>
                  <CardDescription>
                    Current alerts and notifications for this deployment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {deploymentDetails.alerts.length > 0 ? (
                    <div className="space-y-3">
                      {deploymentDetails.alerts.map((alert) => (
                        <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <AlertTriangle className={`h-4 w-4 ${
                              alert.severity === 'critical'
                                ? 'text-red-500'
                                : alert.severity === 'high'
                                ? 'text-orange-500'
                                : alert.severity === 'medium'
                                ? 'text-yellow-500'
                                : 'text-blue-500'
                            }`} />
                            <div>
                              <div className="font-medium text-sm">{alert.message}</div>
                              <div className="text-xs text-gray-500">
                                {alert.type} • {formatLastCheck(alert.timestamp)}
                              </div>
                            </div>
                          </div>
                          <Badge variant={
                            alert.severity === 'critical' ? 'destructive' :
                            alert.severity === 'high' ? 'destructive' :
                            alert.severity === 'medium' ? 'secondary' : 'outline'
                          }>
                            {alert.severity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-500">No active alerts</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="incidents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Open Incidents</CardTitle>
                  <CardDescription>
                    Current incidents requiring attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {deploymentDetails.incidents.length > 0 ? (
                    <div className="space-y-3">
                      {deploymentDetails.incidents.map((incident) => (
                        <div key={incident.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Zap className={`h-4 w-4 ${
                              incident.severity === 'critical'
                                ? 'text-red-500'
                                : incident.severity === 'high'
                                ? 'text-orange-500'
                                : incident.severity === 'medium'
                                ? 'text-yellow-500'
                                : 'text-blue-500'
                            }`} />
                            <div>
                              <div className="font-medium text-sm">{incident.title}</div>
                              <div className="text-xs text-gray-500">
                                {incident.type} • {formatLastCheck(incident.created_at)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={
                              incident.severity === 'critical' ? 'destructive' :
                              incident.severity === 'high' ? 'destructive' :
                              incident.severity === 'medium' ? 'secondary' : 'outline'
                            }>
                              {incident.severity}
                            </Badge>
                            <Badge variant="outline">
                              {incident.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-500">No open incidents</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}