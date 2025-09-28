/**
 * HT-035.2.3: Module Activation Interface
 * 
 * User interface for zero-downtime module activation with real-time
 * monitoring, progress tracking, and comprehensive management per PRD Section 7.
 * 
 * Features:
 * - Module activation interface
 * - Real-time progress monitoring
 * - Activation strategy selection
 * - Health checks configuration
 * - Rollback management
 * - Activation history and logs
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Play, 
  Square, 
  RotateCcw, 
  Settings, 
  Monitor, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Activity,
  Zap,
  Shield,
  Database,
  Network,
  Server,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface ModuleInfo {
  id: string
  name: string
  version: string
  description: string
  status: 'registered' | 'validating' | 'ready' | 'active' | 'inactive' | 'error'
  capabilities: string[]
  dependencies: string[]
  lastActivated?: string
  resourceUsage?: {
    memory: number
    cpu: number
    disk: number
    network: number
  }
}

interface ActivationConfig {
  strategy: 'gradual' | 'instant' | 'blue-green'
  timeout: number
  automaticRollback: boolean
  monitoring: boolean
  preValidation: boolean
  healthChecks: HealthCheck[]
  rollbackTriggers: RollbackTrigger[]
  trafficShifting?: TrafficShifting
}

interface HealthCheck {
  id: string
  name: string
  url: string
  method: string
  expectedStatus: number
  timeout: number
  critical: boolean
}

interface RollbackTrigger {
  type: 'health_check_failure' | 'error_rate_exceeded' | 'response_time_exceeded' | 'activation_timeout' | 'critical_error'
  threshold?: number
  timeout?: number
  enabled: boolean
}

interface TrafficShifting {
  initial: number
  increment: number
  maxIncrement: number
  interval: number
  healthCheckInterval: number
  failureThreshold: number
}

interface ActivationProgress {
  currentStep: string
  progress: number
  state: string
  estimatedTimeRemaining: number
  healthCheckStatus: 'pending' | 'passing' | 'failing' | 'unknown'
  trafficPercentage: number
  errorCount: number
  warningCount: number
}

interface ActivationLog {
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  data?: Record<string, unknown>
  step?: string
  progress?: number
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ModuleActivationPage() {
  // State
  const [modules, setModules] = useState<ModuleInfo[]>([])
  const [selectedModule, setSelectedModule] = useState<ModuleInfo | null>(null)
  const [activationConfig, setActivationConfig] = useState<ActivationConfig>({
    strategy: 'gradual',
    timeout: 300000,
    automaticRollback: true,
    monitoring: true,
    preValidation: true,
    healthChecks: [],
    rollbackTriggers: []
  })
  const [activeActivations, setActiveActivations] = useState<Map<string, ActivationProgress>>(new Map())
  const [activationLogs, setActivationLogs] = useState<Map<string, ActivationLog[]>>(new Map())
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Load modules on mount
  useEffect(() => {
    loadModules()
  }, [])

  // Poll for activation progress
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeActivations.size > 0) {
        updateActivationProgress()
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [activeActivations])

  // =============================================================================
  // DATA LOADING FUNCTIONS
  // =============================================================================

  const loadModules = async () => {
    try {
      setRefreshing(true)
      // Mock data - in real implementation, this would fetch from API
      const mockModules: ModuleInfo[] = [
        {
          id: 'auth-module',
          name: 'Authentication Module',
          version: '2.1.0',
          description: 'Enhanced authentication with SSO and MFA support',
          status: 'ready',
          capabilities: ['authentication', 'sso', 'mfa'],
          dependencies: ['database-module'],
          resourceUsage: { memory: 128, cpu: 15, disk: 50, network: 10 }
        },
        {
          id: 'payment-module',
          name: 'Payment Processing Module',
          version: '1.8.2',
          description: 'Stripe and PayPal payment processing',
          status: 'inactive',
          capabilities: ['payments', 'subscriptions', 'webhooks'],
          dependencies: ['auth-module'],
          resourceUsage: { memory: 256, cpu: 25, disk: 100, network: 25 }
        },
        {
          id: 'analytics-module',
          name: 'Analytics Module',
          version: '3.0.1',
          description: 'Real-time analytics and reporting',
          status: 'active',
          capabilities: ['analytics', 'reporting', 'dashboards'],
          dependencies: ['database-module'],
          lastActivated: '2025-09-23T12:30:00Z',
          resourceUsage: { memory: 512, cpu: 40, disk: 200, network: 50 }
        }
      ]
      setModules(mockModules)
    } catch (error) {
      toast.error('Failed to load modules')
      console.error('Load modules error:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const updateActivationProgress = async () => {
    for (const [activationId] of activeActivations) {
      try {
        const response = await fetch(`/api/modules/activate?activationId=${activationId}`)
        if (response.ok) {
          const data = await response.json()
          
          if (data.status === 'completed') {
            // Remove from active activations
            setActiveActivations(prev => {
              const newMap = new Map(prev)
              newMap.delete(activationId)
              return newMap
            })
            
            toast.success(`Activation completed: ${data.result?.success ? 'Success' : 'Failed'}`)
            
            // Refresh modules
            await loadModules()
          } else if (data.status === 'in_progress' && data.progress) {
            // Update progress
            setActiveActivations(prev => {
              const newMap = new Map(prev)
              newMap.set(activationId, data.progress)
              return newMap
            })
          }
        }
      } catch (error) {
        console.error('Update progress error:', error)
      }
    }
  }

  // =============================================================================
  // ACTIVATION FUNCTIONS
  // =============================================================================

  const activateModule = async () => {
    if (!selectedModule) {
      toast.error('Please select a module to activate')
      return
    }

    try {
      setLoading(true)
      
      const requestBody = {
        moduleId: selectedModule.id,
        tenantId: 'default', // In real implementation, get from context
        strategy: activationConfig.strategy,
        timeout: activationConfig.timeout,
        automaticRollback: activationConfig.automaticRollback,
        monitoring: activationConfig.monitoring,
        healthChecks: activationConfig.healthChecks,
        rollbackTriggers: activationConfig.rollbackTriggers,
        trafficShifting: activationConfig.trafficShifting,
        preValidation: {
          enabled: activationConfig.preValidation,
          rules: ['compatibility_check', 'resource_check', 'security_check'],
          timeout: 60000,
          parallelism: 1
        },
        metadata: {
          source: 'admin_ui',
          timestamp: new Date().toISOString()
        }
      }

      const response = await fetch('/api/modules/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Activation failed')
      }

      if (data.success) {
        toast.success('Module activation started')
        
        // Add to active activations
        setActiveActivations(prev => {
          const newMap = new Map(prev)
          newMap.set(data.activationId, {
            currentStep: 'initializing',
            progress: 0,
            state: 'pending',
            estimatedTimeRemaining: data.estimatedDuration,
            healthCheckStatus: 'pending',
            trafficPercentage: 0,
            errorCount: 0,
            warningCount: 0
          })
          return newMap
        })
      } else {
        throw new Error(data.message || 'Activation failed')
      }

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Activation failed')
      console.error('Activation error:', error)
    } finally {
      setLoading(false)
    }
  }

  const rollbackModule = async (activationId: string) => {
    try {
      const requestBody = {
        rollbackType: 'activation',
        activationId,
        moduleId: selectedModule?.id,
        tenantId: 'default',
        reason: 'Manual rollback requested',
        timeout: 300000,
        performanceMonitoring: true,
        preserveData: true
      }

      const response = await fetch('/api/modules/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Rollback failed')
      }

      if (data.success) {
        toast.success('Module rollback started')
      } else {
        throw new Error(data.message || 'Rollback failed')
      }

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Rollback failed')
      console.error('Rollback error:', error)
    }
  }

  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'ready': return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'inactive': return <XCircle className="h-4 w-4 text-gray-500" />
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'ready': return 'bg-blue-100 text-blue-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  // =============================================================================
  // RENDER COMPONENT
  // =============================================================================

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Module Activation</h1>
          <p className="text-muted-foreground">
            Zero-downtime module activation with comprehensive monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadModules}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Available Modules
              </CardTitle>
              <CardDescription>
                Select a module to activate or manage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {modules.map((module) => (
                    <Card
                      key={module.id}
                      className={`cursor-pointer transition-colors ${
                        selectedModule?.id === module.id 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedModule(module)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(module.status)}
                              <h4 className="font-medium">{module.name}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              v{module.version}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {module.description}
                            </p>
                          </div>
                          <Badge className={getStatusColor(module.status)}>
                            {module.status}
                          </Badge>
                        </div>
                        
                        {module.resourceUsage && (
                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                            <div>Memory: {module.resourceUsage.memory}MB</div>
                            <div>CPU: {module.resourceUsage.cpu}%</div>
                            <div>Disk: {module.resourceUsage.disk}MB</div>
                            <div>Network: {module.resourceUsage.network}MB/s</div>
                          </div>
                        )}
                        
                        <div className="mt-3 flex flex-wrap gap-1">
                          {module.capabilities.slice(0, 3).map((capability) => (
                            <Badge key={capability} variant="secondary" className="text-xs">
                              {capability}
                            </Badge>
                          ))}
                          {module.capabilities.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{module.capabilities.length - 3}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Activation Configuration and Monitoring */}
        <div className="lg:col-span-2">
          {selectedModule ? (
            <Tabs defaultValue="configure" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="configure">Configure</TabsTrigger>
                <TabsTrigger value="monitor">Monitor</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
              </TabsList>

              {/* Configuration Tab */}
              <TabsContent value="configure" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Activation Configuration
                    </CardTitle>
                    <CardDescription>
                      Configure activation settings for {selectedModule.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Strategy Selection */}
                    <div className="space-y-2">
                      <Label>Activation Strategy</Label>
                      <Select
                        value={activationConfig.strategy}
                        onValueChange={(value: 'gradual' | 'instant' | 'blue-green') => 
                          setActivationConfig(prev => ({ ...prev, strategy: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gradual">
                            <div className="flex items-center gap-2">
                              <Activity className="h-4 w-4" />
                              Gradual (Recommended)
                            </div>
                          </SelectItem>
                          <SelectItem value="instant">
                            <div className="flex items-center gap-2">
                              <Zap className="h-4 w-4" />
                              Instant
                            </div>
                          </SelectItem>
                          <SelectItem value="blue-green">
                            <div className="flex items-center gap-2">
                              <Network className="h-4 w-4" />
                              Blue-Green
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Timeout */}
                    <div className="space-y-2">
                      <Label>Timeout (minutes)</Label>
                      <Input
                        type="number"
                        value={activationConfig.timeout / 60000}
                        onChange={(e) => 
                          setActivationConfig(prev => ({ 
                            ...prev, 
                            timeout: parseInt(e.target.value) * 60000 
                          }))
                        }
                      />
                    </div>

                    {/* Options */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={activationConfig.automaticRollback}
                          onCheckedChange={(checked) =>
                            setActivationConfig(prev => ({ ...prev, automaticRollback: checked }))
                          }
                        />
                        <Label>Automatic rollback on failure</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={activationConfig.monitoring}
                          onCheckedChange={(checked) =>
                            setActivationConfig(prev => ({ ...prev, monitoring: checked }))
                          }
                        />
                        <Label>Enable monitoring</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={activationConfig.preValidation}
                          onCheckedChange={(checked) =>
                            setActivationConfig(prev => ({ ...prev, preValidation: checked }))
                          }
                        />
                        <Label>Pre-activation validation</Label>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-4">
                      <Button
                        onClick={activateModule}
                        disabled={loading || selectedModule.status === 'active'}
                        className="flex items-center gap-2"
                      >
                        <Play className="h-4 w-4" />
                        {loading ? 'Activating...' : 'Activate Module'}
                      </Button>

                      {selectedModule.status === 'active' && (
                        <Button
                          variant="outline"
                          onClick={() => rollbackModule(`${selectedModule.id}-latest`)}
                          className="flex items-center gap-2"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Rollback
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Monitor Tab */}
              <TabsContent value="monitor" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="h-5 w-5" />
                      Activation Monitoring
                    </CardTitle>
                    <CardDescription>
                      Real-time monitoring of active module activations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {activeActivations.size === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No active activations
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {Array.from(activeActivations.entries()).map(([activationId, progress]) => (
                          <Card key={activationId}>
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium">
                                    Activation: {activationId.split('-')[0]}
                                  </h4>
                                  <Badge>{progress.state}</Badge>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>Current Step: {progress.currentStep}</span>
                                    <span>{progress.progress}%</span>
                                  </div>
                                  <Progress value={progress.progress} />
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Health Status:</span>
                                    <Badge 
                                      variant={progress.healthCheckStatus === 'passing' ? 'default' : 'destructive'}
                                      className="ml-2"
                                    >
                                      {progress.healthCheckStatus}
                                    </Badge>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Traffic:</span>
                                    <span className="ml-2">{progress.trafficPercentage}%</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Errors:</span>
                                    <span className="ml-2">{progress.errorCount}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">ETA:</span>
                                    <span className="ml-2">{formatDuration(progress.estimatedTimeRemaining)}</span>
                                  </div>
                                </div>

                                <div className="flex justify-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => rollbackModule(activationId)}
                                  >
                                    <Square className="h-4 w-4 mr-2" />
                                    Cancel & Rollback
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Activation History
                    </CardTitle>
                    <CardDescription>
                      Previous activation attempts for {selectedModule.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      No activation history available
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Logs Tab */}
              <TabsContent value="logs" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Activation Logs
                    </CardTitle>
                    <CardDescription>
                      Detailed logs for module activation process
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      No logs available
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="p-8">
                <div className="text-center text-muted-foreground">
                  <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Module Selected</h3>
                  <p>Select a module from the list to configure activation settings</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
