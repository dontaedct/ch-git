'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Activity,
  Server,
  Globe,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  ExternalLink,
  RefreshCw,
  Play,
  Pause,
  Square
} from 'lucide-react'

interface DeploymentMetrics {
  totalDeployments: number
  activeDeployments: number
  successfulDeployments: number
  failedDeployments: number
  averageDeploymentTime: number
  successRate: number
}

interface InfrastructureStatus {
  databases: { active: number; total: number }
  storage: { active: number; total: number }
  apis: { active: number; total: number }
  domains: { active: number; total: number }
}

interface RecentActivity {
  id: string
  type: 'deployment' | 'failure' | 'scaling' | 'maintenance'
  message: string
  timestamp: Date
  clientId?: string
  severity: 'info' | 'warning' | 'error' | 'success'
}

interface DeploymentDashboardProps {
  clientId?: string
  view?: 'overview' | 'detailed'
}

export default function DeploymentDashboard({ clientId, view = 'overview' }: DeploymentDashboardProps) {
  const [metrics, setMetrics] = useState<DeploymentMetrics>({
    totalDeployments: 0,
    activeDeployments: 0,
    successfulDeployments: 0,
    failedDeployments: 0,
    averageDeploymentTime: 0,
    successRate: 0
  })

  const [infrastructure, setInfrastructure] = useState<InfrastructureStatus>({
    databases: { active: 0, total: 0 },
    storage: { active: 0, total: 0 },
    apis: { active: 0, total: 0 },
    domains: { active: 0, total: 0 }
  })

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [clientId])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      // Mock data - replace with actual API calls
      const mockMetrics: DeploymentMetrics = {
        totalDeployments: 147,
        activeDeployments: 8,
        successfulDeployments: 135,
        failedDeployments: 4,
        averageDeploymentTime: 28,
        successRate: 95.2
      }

      const mockInfrastructure: InfrastructureStatus = {
        databases: { active: 42, total: 45 },
        storage: { active: 38, total: 40 },
        apis: { active: 51, total: 52 },
        domains: { active: 47, total: 48 }
      }

      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'deployment',
          message: 'Client app deployed successfully to production',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          clientId: 'client_123',
          severity: 'success'
        },
        {
          id: '2',
          type: 'scaling',
          message: 'Database scaled up due to increased load',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          clientId: 'client_456',
          severity: 'info'
        },
        {
          id: '3',
          type: 'failure',
          message: 'Deployment failed: Build process error',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          clientId: 'client_789',
          severity: 'error'
        },
        {
          id: '4',
          type: 'maintenance',
          message: 'SSL certificate auto-renewed',
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          clientId: 'client_321',
          severity: 'info'
        }
      ]

      setMetrics(mockMetrics)
      setInfrastructure(mockInfrastructure)
      setRecentActivity(mockActivity)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'deployment':
        return <Server className="h-4 w-4" />
      case 'scaling':
        return <TrendingUp className="h-4 w-4" />
      case 'failure':
        return <AlertTriangle className="h-4 w-4" />
      case 'maintenance':
        return <Shield className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
    return timestamp.toLocaleDateString()
  }

  if (view === 'overview') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Deployment Overview</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <Button variant="outline" size="sm" onClick={loadDashboardData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Deployments</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{metrics.activeDeployments}</div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metrics.successRate}%</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Deploy Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{metrics.averageDeploymentTime}m</div>
              <p className="text-xs text-muted-foreground">Average duration</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deployments</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{metrics.totalDeployments}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Infrastructure Health</CardTitle>
              <CardDescription>Status of deployment infrastructure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Server className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Databases</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{infrastructure.databases.active}/{infrastructure.databases.total}</span>
                    <Progress value={(infrastructure.databases.active / infrastructure.databases.total) * 100} className="w-20 h-2" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Storage</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{infrastructure.storage.active}/{infrastructure.storage.total}</span>
                    <Progress value={(infrastructure.storage.active / infrastructure.storage.total) * 100} className="w-20 h-2" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">APIs</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{infrastructure.apis.active}/{infrastructure.apis.total}</span>
                    <Progress value={(infrastructure.apis.active / infrastructure.apis.total) * 100} className="w-20 h-2" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Domains</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{infrastructure.domains.active}/{infrastructure.domains.total}</span>
                    <Progress value={(infrastructure.domains.active / infrastructure.domains.total) * 100} className="w-20 h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest deployment events and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className={`p-3 rounded-lg border ${getSeverityColor(activity.severity)}`}>
                    <div className="flex items-start space-x-3">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          {activity.clientId && (
                            <Badge variant="outline" className="text-xs">
                              {activity.clientId}
                            </Badge>
                          )}
                          <span className="text-xs opacity-75">
                            {formatTimestamp(activity.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="deployments" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="deployments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Pipeline Status</CardTitle>
              <CardDescription>Real-time deployment monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Detailed deployment pipeline view
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="infrastructure" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Infrastructure Resources</CardTitle>
              <CardDescription>Manage deployment infrastructure</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Infrastructure management interface
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Monitoring</CardTitle>
              <CardDescription>Monitor deployment performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Performance monitoring dashboard
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alerts & Notifications</CardTitle>
              <CardDescription>Deployment alerts and incident management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Alerts and notification center
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}