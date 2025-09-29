'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Play, Pause, Square, RefreshCw, ExternalLink, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react'

interface DeploymentStep {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  startTime?: Date
  endTime?: Date
  logs: string[]
  error?: string
}

interface DeploymentPipeline {
  id: string
  clientId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  steps: DeploymentStep[]
  createdAt: Date
  completedAt?: Date
  deploymentUrl?: string
  config: {
    templateId: string
    environment: 'staging' | 'production'
    customizations: Record<string, any>
  }
}

export default function DeploymentPipelinePage() {
  const [deployments, setDeployments] = useState<DeploymentPipeline[]>([])
  const [selectedDeployment, setSelectedDeployment] = useState<DeploymentPipeline | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [newDeployment, setNewDeployment] = useState({
    clientId: '',
    templateId: '',
    environment: 'staging' as const,
    subdomain: '',
    customDomain: '',
    sslEnabled: true
  })

  useEffect(() => {
    loadDeployments()
  }, [])

  const loadDeployments = async () => {
    setIsLoading(true)
    try {
      const mockDeployments: DeploymentPipeline[] = [
        {
          id: 'deploy_001',
          clientId: 'client_123',
          status: 'running',
          createdAt: new Date(Date.now() - 10 * 60 * 1000),
          deploymentUrl: 'https://client-123.vercel.app',
          config: {
            templateId: 'template_business',
            environment: 'production',
            customizations: {}
          },
          steps: [
            { id: 'validate', name: 'Validate Configuration', status: 'completed', logs: ['Configuration validated'], startTime: new Date(Date.now() - 9 * 60 * 1000), endTime: new Date(Date.now() - 8 * 60 * 1000) },
            { id: 'prepare', name: 'Prepare Assets', status: 'completed', logs: ['Assets prepared'], startTime: new Date(Date.now() - 8 * 60 * 1000), endTime: new Date(Date.now() - 7 * 60 * 1000) },
            { id: 'build', name: 'Build Application', status: 'running', logs: ['Building application...', 'Compiling TypeScript...'], startTime: new Date(Date.now() - 5 * 60 * 1000) },
            { id: 'deploy', name: 'Deploy Application', status: 'pending', logs: [] },
            { id: 'finalize', name: 'Finalize', status: 'pending', logs: [] }
          ]
        },
        {
          id: 'deploy_002',
          clientId: 'client_456',
          status: 'completed',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 90 * 60 * 1000),
          deploymentUrl: 'https://client-456.vercel.app',
          config: {
            templateId: 'template_portfolio',
            environment: 'production',
            customizations: {}
          },
          steps: [
            { id: 'validate', name: 'Validate Configuration', status: 'completed', logs: ['Configuration validated'], startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), endTime: new Date(Date.now() - 119 * 60 * 1000) },
            { id: 'prepare', name: 'Prepare Assets', status: 'completed', logs: ['Assets prepared'], startTime: new Date(Date.now() - 119 * 60 * 1000), endTime: new Date(Date.now() - 110 * 60 * 1000) },
            { id: 'build', name: 'Build Application', status: 'completed', logs: ['Application built successfully'], startTime: new Date(Date.now() - 110 * 60 * 1000), endTime: new Date(Date.now() - 95 * 60 * 1000) },
            { id: 'deploy', name: 'Deploy Application', status: 'completed', logs: ['Application deployed'], startTime: new Date(Date.now() - 95 * 60 * 1000), endTime: new Date(Date.now() - 90 * 60 * 1000) },
            { id: 'finalize', name: 'Finalize', status: 'completed', logs: ['Deployment finalized'], startTime: new Date(Date.now() - 90 * 60 * 1000), endTime: new Date(Date.now() - 90 * 60 * 1000) }
          ]
        }
      ]
      setDeployments(mockDeployments)
    } catch (error) {
      console.error('Failed to load deployments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createDeployment = async () => {
    try {
      console.log('Creating deployment:', newDeployment)
      await loadDeployments()
    } catch (error) {
      console.error('Failed to create deployment:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'running':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateProgress = (deployment: DeploymentPipeline) => {
    const totalSteps = deployment.steps.length
    const completedSteps = deployment.steps.filter(step => step.status === 'completed').length
    return (completedSteps / totalSteps) * 100
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Deployment Pipeline</h1>
          <p className="text-gray-600 mt-2">Manage and monitor client application deployments</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="create">Create Deployment</TabsTrigger>
            <TabsTrigger value="monitor">Monitor</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Active Deployments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {deployments.filter(d => d.status === 'running').length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Completed Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {deployments.filter(d => d.status === 'completed').length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">95%</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Deployments</CardTitle>
                <CardDescription>Latest deployment pipeline executions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deployments.map((deployment) => (
                    <div key={deployment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(deployment.status)}
                          <div>
                            <div className="font-semibold">{deployment.id}</div>
                            <div className="text-sm text-gray-500">Client: {deployment.clientId}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(deployment.status)}>
                            {deployment.status}
                          </Badge>
                          {deployment.deploymentUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={deployment.deploymentUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View
                              </a>
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedDeployment(deployment)}
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round(calculateProgress(deployment))}%</span>
                        </div>
                        <Progress value={calculateProgress(deployment)} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Deployment</CardTitle>
                <CardDescription>Deploy a new client application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientId">Client ID</Label>
                    <Input
                      id="clientId"
                      value={newDeployment.clientId}
                      onChange={(e) => setNewDeployment(prev => ({ ...prev, clientId: e.target.value }))}
                      placeholder="Enter client ID"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="templateId">Template</Label>
                    <Select
                      value={newDeployment.templateId}
                      onValueChange={(value) => setNewDeployment(prev => ({ ...prev, templateId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="template_business">Business Template</SelectItem>
                        <SelectItem value="template_portfolio">Portfolio Template</SelectItem>
                        <SelectItem value="template_ecommerce">E-commerce Template</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="environment">Environment</Label>
                    <Select
                      value={newDeployment.environment}
                      onValueChange={(value: 'staging' | 'production') => setNewDeployment(prev => ({ ...prev, environment: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staging">Staging</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subdomain">Subdomain</Label>
                    <Input
                      id="subdomain"
                      value={newDeployment.subdomain}
                      onChange={(e) => setNewDeployment(prev => ({ ...prev, subdomain: e.target.value }))}
                      placeholder="client-app"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customDomain">Custom Domain (Optional)</Label>
                    <Input
                      id="customDomain"
                      value={newDeployment.customDomain}
                      onChange={(e) => setNewDeployment(prev => ({ ...prev, customDomain: e.target.value }))}
                      placeholder="example.com"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sslEnabled"
                      checked={newDeployment.sslEnabled}
                      onCheckedChange={(checked) => setNewDeployment(prev => ({ ...prev, sslEnabled: checked }))}
                    />
                    <Label htmlFor="sslEnabled">Enable SSL</Label>
                  </div>
                </div>

                <Button onClick={createDeployment} className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Create Deployment
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitor" className="space-y-6">
            {selectedDeployment ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Deployment Details: {selectedDeployment.id}</CardTitle>
                      <CardDescription>Monitor deployment progress and logs</CardDescription>
                    </div>
                    <Button variant="outline" onClick={() => setSelectedDeployment(null)}>
                      Back to List
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Status</div>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusIcon(selectedDeployment.status)}
                        <Badge className={getStatusColor(selectedDeployment.status)}>
                          {selectedDeployment.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Started</div>
                      <div className="mt-1">{selectedDeployment.createdAt.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Duration</div>
                      <div className="mt-1">
                        {selectedDeployment.completedAt
                          ? `${Math.round((selectedDeployment.completedAt.getTime() - selectedDeployment.createdAt.getTime()) / 1000 / 60)} min`
                          : `${Math.round((Date.now() - selectedDeployment.createdAt.getTime()) / 1000 / 60)} min`
                        }
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Deployment Steps</h3>
                    <div className="space-y-3">
                      {selectedDeployment.steps.map((step, index) => (
                        <div key={step.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(step.status)}
                              <span className="font-medium">{step.name}</span>
                            </div>
                            <Badge className={getStatusColor(step.status)}>
                              {step.status}
                            </Badge>
                          </div>
                          {step.logs.length > 0 && (
                            <div className="mt-3">
                              <div className="text-sm font-medium mb-2">Logs:</div>
                              <div className="bg-gray-900 text-green-400 p-3 rounded text-sm font-mono max-h-32 overflow-y-auto">
                                {step.logs.map((log, logIndex) => (
                                  <div key={logIndex}>{log}</div>
                                ))}
                              </div>
                            </div>
                          )}
                          {step.error && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                              <div className="flex items-center space-x-2 text-red-600">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="text-sm font-medium">Error: {step.error}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-gray-500">Select a deployment to view details</div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}