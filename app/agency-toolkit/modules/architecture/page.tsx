/**
 * HT-035.2.1: Module Architecture Dashboard
 * 
 * Admin interface for viewing and managing the hot-pluggable module
 * architecture, activation engine status, and module lifecycle management.
 * 
 * Features:
 * - Module architecture overview
 * - Activation engine status monitoring
 * - Module lifecycle state visualization
 * - Configuration and contract management
 * - Performance metrics and health monitoring
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Activity, 
  Cpu, 
  Database, 
  Globe, 
  HardDrive, 
  MemoryStick, 
  Monitor, 
  Network, 
  Settings, 
  Shield, 
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw
} from 'lucide-react'

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface ModuleArchitectureStatus {
  engineStatus: 'active' | 'inactive' | 'error'
  activeModules: number
  totalModules: number
  activationQueue: number
  healthStatus: 'healthy' | 'degraded' | 'unhealthy'
  lastUpdate: Date
}

interface ModuleLifecycleMetrics {
  totalActivations: number
  successfulActivations: number
  failedActivations: number
  averageActivationTime: number
  currentActiveModules: number
  totalDeactivations: number
  rollbackCount: number
}

interface ModuleSystemHealth {
  activationEngine: HealthStatus
  moduleRegistry: HealthStatus
  securitySandbox: HealthStatus
  integrationLayer: HealthStatus
  databaseConnections: HealthStatus
  networkConnectivity: HealthStatus
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  message: string
  lastCheck: Date
  responseTime: number
}

interface ModuleCapability {
  id: string
  name: string
  category: string
  status: 'available' | 'in_use' | 'deprecated'
  modules: number
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ModuleArchitecturePage() {
  const [architectureStatus, setArchitectureStatus] = useState<ModuleArchitectureStatus | null>(null)
  const [lifecycleMetrics, setLifecycleMetrics] = useState<ModuleLifecycleMetrics | null>(null)
  const [systemHealth, setSystemHealth] = useState<ModuleSystemHealth | null>(null)
  const [capabilities, setCapabilities] = useState<ModuleCapability[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadArchitectureData()
    const interval = setInterval(loadArchitectureData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadArchitectureData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Simulate API calls - replace with actual API endpoints
      const [statusResponse, metricsResponse, healthResponse, capabilitiesResponse] = await Promise.all([
        fetch('/api/modules/architecture/status'),
        fetch('/api/modules/architecture/metrics'),
        fetch('/api/modules/architecture/health'),
        fetch('/api/modules/architecture/capabilities')
      ])

      if (!statusResponse.ok || !metricsResponse.ok || !healthResponse.ok || !capabilitiesResponse.ok) {
        throw new Error('Failed to load architecture data')
      }

      const [status, metrics, health, caps] = await Promise.all([
        statusResponse.json(),
        metricsResponse.json(),
        healthResponse.json(),
        capabilitiesResponse.json()
      ])

      setArchitectureStatus(status)
      setLifecycleMetrics(metrics)
      setSystemHealth(health)
      setCapabilities(caps)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'active':
        return 'text-green-600'
      case 'degraded':
        return 'text-yellow-600'
      case 'unhealthy':
      case 'error':
      case 'inactive':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>
      case 'degraded':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Degraded</Badge>
      case 'unhealthy':
      case 'error':
        return <Badge variant="destructive">Unhealthy</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-lg">Loading module architecture...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading module architecture: {error}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Module Architecture</h1>
          <p className="text-gray-600 mt-2">
            Hot-pluggable module system architecture and activation engine monitoring
          </p>
        </div>
        <Button onClick={loadArchitectureData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Architecture Status Overview */}
      {architectureStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Architecture Status
            </CardTitle>
            <CardDescription>
              Current status of the hot-pluggable module system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Engine Status</span>
                  {getStatusBadge(architectureStatus.engineStatus)}
                </div>
                <div className="text-2xl font-bold">
                  {architectureStatus.engineStatus === 'active' ? 'Active' : 'Inactive'}
                </div>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm font-medium">Active Modules</span>
                <div className="text-2xl font-bold">
                  {architectureStatus.activeModules} / {architectureStatus.totalModules}
                </div>
                <Progress 
                  value={(architectureStatus.activeModules / architectureStatus.totalModules) * 100} 
                  className="h-2"
                />
              </div>
              
              <div className="space-y-2">
                <span className="text-sm font-medium">Activation Queue</span>
                <div className="text-2xl font-bold">{architectureStatus.activationQueue}</div>
                <span className="text-xs text-gray-500">Pending activations</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Health Status</span>
                  {getHealthIcon(architectureStatus.healthStatus)}
                </div>
                <div className="text-lg font-semibold capitalize">
                  {architectureStatus.healthStatus}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Architecture */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Architecture
                </CardTitle>
                <CardDescription>
                  Core components of the hot-pluggable module system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Module Registry</span>
                    </div>
                    {getStatusBadge('healthy')}
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium">Activation Engine</span>
                    </div>
                    {getStatusBadge(architectureStatus?.engineStatus || 'inactive')}
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Security Sandbox</span>
                    </div>
                    {getStatusBadge('healthy')}
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Network className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">Integration Layer</span>
                    </div>
                    {getStatusBadge('healthy')}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
                <CardDescription>
                  Key performance indicators for the module system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {lifecycleMetrics ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {lifecycleMetrics.totalActivations}
                        </div>
                        <div className="text-sm text-gray-600">Total Activations</div>
                      </div>
                      
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {Math.round((lifecycleMetrics.successfulActivations / lifecycleMetrics.totalActivations) * 100)}%
                        </div>
                        <div className="text-sm text-gray-600">Success Rate</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Average Activation Time</span>
                        <span className="font-medium">{lifecycleMetrics.averageActivationTime}ms</span>
                      </div>
                      <Progress value={Math.min((lifecycleMetrics.averageActivationTime / 30000) * 100, 100)} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="font-semibold">{lifecycleMetrics.currentActiveModules}</div>
                        <div className="text-xs text-gray-600">Active</div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="font-semibold">{lifecycleMetrics.totalDeactivations}</div>
                        <div className="text-xs text-gray-600">Deactivated</div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="font-semibold">{lifecycleMetrics.rollbackCount}</div>
                        <div className="text-xs text-gray-600">Rollbacks</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No metrics data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Lifecycle Tab */}
        <TabsContent value="lifecycle" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Module Lifecycle Management
              </CardTitle>
              <CardDescription>
                Monitor and manage module activation, deactivation, and lifecycle events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Lifecycle management interface coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Tab */}
        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                System Health Monitoring
              </CardTitle>
              <CardDescription>
                Real-time health status of all module system components
              </CardDescription>
            </CardHeader>
            <CardContent>
              {systemHealth ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(systemHealth).map(([component, health]) => (
                    <div key={component} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium capitalize">{component.replace(/([A-Z])/g, ' $1')}</h3>
                        <div className="flex items-center gap-2">
                          {getHealthIcon(health.status)}
                          {getStatusBadge(health.status)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{health.message}</p>
                      <div className="text-xs text-gray-500">
                        Last check: {new Date(health.lastCheck).toLocaleString()}
                        <span className="ml-2">Response: {health.responseTime}ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No health data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Capabilities Tab */}
        <TabsContent value="capabilities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Module Capabilities
              </CardTitle>
              <CardDescription>
                Available capabilities and their usage across modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              {capabilities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {capabilities.map((capability) => (
                    <div key={capability.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{capability.name}</h3>
                        <Badge variant={capability.status === 'available' ? 'default' : 'secondary'}>
                          {capability.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{capability.category}</p>
                      <div className="text-sm">
                        <span className="font-medium">{capability.modules}</span> modules using this capability
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No capabilities data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration Management
              </CardTitle>
              <CardDescription>
                Manage module system configuration and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Configuration management interface coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
