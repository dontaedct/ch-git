/**
 * HT-035.2.2: Module Registry Interface
 * 
 * Comprehensive module registry interface for managing modules, capabilities,
 * and dependencies per PRD Section 7 requirements.
 * 
 * Features:
 * - Module registry overview and management
 * - Module registration and unregistration
 * - Capability discovery and management
 * - Dependency resolution and visualization
 * - Integration status monitoring
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Package, 
  Search, 
  Plus, 
  Trash2, 
  Settings, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Edit,
  Play,
  Pause,
  Stop
} from 'lucide-react'

interface ModuleRegistryEntry {
  id: string
  name: string
  version: string
  description: string
  author: string
  license: string
  status: 'registered' | 'validating' | 'ready' | 'active' | 'inactive' | 'error' | 'unregistered'
  registration: {
    id: string
    source: 'manual' | 'automatic' | 'marketplace' | 'system'
    registeredAt: string
    metadata: Record<string, unknown>
  }
  capabilities: Array<{
    id: string
    name: string
    description: string
    version: string
    category: {
      id: string
      name: string
      description: string
    }
  }>
  dependencies: Array<{
    id: string
    version: string
    required: boolean
  }>
  integrations: {
    uiRoutes: Array<{
      id: string
      path: string
      component: string
      status: 'pending' | 'active' | 'inactive' | 'error'
    }>
    apiRoutes: Array<{
      id: string
      path: string
      methods: string[]
      status: 'pending' | 'active' | 'inactive' | 'error'
    }>
    components: Array<{
      id: string
      name: string
      type: 'page' | 'component' | 'layout' | 'widget'
      status: 'pending' | 'active' | 'inactive' | 'error'
    }>
    navigation: Array<{
      id: string
      label: string
      path: string
      status: 'pending' | 'active' | 'inactive' | 'error'
    }>
  }
  metrics: {
    registrationTime: number
    activationTime: number
    lastAccessed: string
    accessCount: number
    errorCount: number
  }
}

interface CapabilityEntry {
  id: string
  name: string
  description: string
  version: string
  category: {
    id: string
    name: string
    description: string
  }
  provider: {
    moduleId: string
    moduleVersion: string
    status: 'active' | 'inactive' | 'deprecated' | 'removed'
    priority: number
  }
  status: {
    status: 'available' | 'unavailable' | 'deprecated' | 'experimental' | 'maintenance'
    message: string
    timestamp: string
  }
  metrics: {
    usageCount: number
    lastUsed: string
    averageResponseTime: number
    errorRate: number
    successRate: number
  }
}

export default function ModuleRegistryPage() {
  const [modules, setModules] = useState<ModuleRegistryEntry[]>([])
  const [capabilities, setCapabilities] = useState<CapabilityEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [selectedModule, setSelectedModule] = useState<ModuleRegistryEntry | null>(null)
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [registrationForm, setRegistrationForm] = useState({
    type: 'manifest',
    manifest: '',
    options: {
      autoIntegrate: true,
      resolveDependencies: true,
      source: 'manual'
    }
  })

  // Load modules and capabilities
  useEffect(() => {
    loadModules()
    loadCapabilities()
  }, [])

  const loadModules = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/modules/register')
      const data = await response.json()
      
      if (data.success) {
        setModules(data.modules)
      } else {
        setError(data.message || 'Failed to load modules')
      }
    } catch (err) {
      setError('Failed to load modules')
      console.error('Error loading modules:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadCapabilities = async () => {
    try {
      const response = await fetch('/api/modules/capabilities')
      const data = await response.json()
      
      if (data.success) {
        setCapabilities(data.capabilities)
      }
    } catch (err) {
      console.error('Error loading capabilities:', err)
    }
  }

  const handleModuleRegistration = async () => {
    try {
      setLoading(true)
      
      const requestBody = {
        type: registrationForm.type,
        manifest: registrationForm.type === 'manifest' ? JSON.parse(registrationForm.manifest) : undefined,
        options: registrationForm.options
      }

      const response = await fetch('/api/modules/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()
      
      if (data.success) {
        await loadModules()
        setShowRegistrationForm(false)
        setRegistrationForm({
          type: 'manifest',
          manifest: '',
          options: {
            autoIntegrate: true,
            resolveDependencies: true,
            source: 'manual'
          }
        })
      } else {
        setError(data.message || 'Module registration failed')
      }
    } catch (err) {
      setError('Module registration failed')
      console.error('Error registering module:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleModuleUnregistration = async (moduleId: string) => {
    try {
      setLoading(true)
      
      const response = await fetch(`/api/modules/register?moduleId=${moduleId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        await loadModules()
      } else {
        setError(data.message || 'Module unregistration failed')
      }
    } catch (err) {
      setError('Module unregistration failed')
      console.error('Error unregistering module:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      registered: { color: 'bg-blue-100 text-blue-800', icon: Package },
      ready: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      error: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: Pause },
      validating: { color: 'bg-orange-100 text-orange-800', icon: Activity }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive
    const Icon = config.icon

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    )
  }

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || module.status === statusFilter
    const matchesSource = sourceFilter === 'all' || module.registration.source === sourceFilter

    return matchesSearch && matchesStatus && matchesSource
  })

  if (loading && modules.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading module registry...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Module Registry</h1>
          <p className="text-muted-foreground">
            Manage modules, capabilities, and dependencies
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowRegistrationForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Register Module
          </Button>
          <Button variant="outline" onClick={loadModules}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modules.length}</div>
            <p className="text-xs text-muted-foreground">
              {modules.filter(m => m.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capabilities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{capabilities.length}</div>
            <p className="text-xs text-muted-foreground">
              {capabilities.filter(c => c.status.status === 'available').length} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Integrations</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {modules.reduce((acc, m) => acc + m.integrations.uiRoutes.length + m.integrations.apiRoutes.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Routes & APIs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dependencies</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {modules.reduce((acc, m) => acc + m.dependencies.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total dependencies
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="modules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
          <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* Modules Tab */}
        <TabsContent value="modules" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search modules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="registered">Registered</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="automatic">Automatic</SelectItem>
                <SelectItem value="marketplace">Marketplace</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Modules Table */}
          <Card>
            <CardHeader>
              <CardTitle>Registered Modules</CardTitle>
              <CardDescription>
                {filteredModules.length} of {modules.length} modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Capabilities</TableHead>
                    <TableHead>Dependencies</TableHead>
                    <TableHead>Last Accessed</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredModules.map((module) => (
                    <TableRow key={module.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{module.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {module.id} v{module.version}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {module.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(module.status)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {module.registration.source}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {module.capabilities.length} capabilities
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {module.dependencies.length} dependencies
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {new Date(module.metrics.lastAccessed).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedModule(module)}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleModuleUnregistration(module.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Capabilities Tab */}
        <TabsContent value="capabilities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Module Capabilities</CardTitle>
              <CardDescription>
                {capabilities.length} capabilities available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Capability</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {capabilities.map((capability) => (
                    <TableRow key={capability.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{capability.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {capability.id} v{capability.version}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {capability.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {capability.category.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {capability.provider.moduleId}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          v{capability.provider.moduleVersion}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(capability.status.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {capability.metrics.usageCount} uses
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Last: {new Date(capability.metrics.lastUsed).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {capability.metrics.averageResponseTime}ms avg
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {capability.metrics.successRate}% success
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dependencies Tab */}
        <TabsContent value="dependencies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Module Dependencies</CardTitle>
              <CardDescription>
                Dependency relationships and resolution status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Dependency visualization coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Module Integrations</CardTitle>
              <CardDescription>
                UI routes, API endpoints, and component integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {modules.map((module) => (
                  <div key={module.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{module.name}</h4>
                      {getStatusBadge(module.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="font-medium">UI Routes</div>
                        <div className="text-muted-foreground">
                          {module.integrations.uiRoutes.length} routes
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">API Routes</div>
                        <div className="text-muted-foreground">
                          {module.integrations.apiRoutes.length} endpoints
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Components</div>
                        <div className="text-muted-foreground">
                          {module.integrations.components.length} components
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Navigation</div>
                        <div className="text-muted-foreground">
                          {module.integrations.navigation.length} items
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Module Registration Form */}
      {showRegistrationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Register New Module</CardTitle>
              <CardDescription>
                Register a new module using manifest, definition, or contract
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="type">Registration Type</Label>
                <Select
                  value={registrationForm.type}
                  onValueChange={(value) => setRegistrationForm({ ...registrationForm, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manifest">Manifest</SelectItem>
                    <SelectItem value="definition">Definition</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {registrationForm.type === 'manifest' && (
                <div>
                  <Label htmlFor="manifest">Module Manifest (JSON)</Label>
                  <Textarea
                    id="manifest"
                    placeholder="Paste module manifest JSON here..."
                    value={registrationForm.manifest}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, manifest: e.target.value })}
                    rows={10}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="source">Source</Label>
                  <Select
                    value={registrationForm.options.source}
                    onValueChange={(value) => setRegistrationForm({
                      ...registrationForm,
                      options: { ...registrationForm.options, source: value as any }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="automatic">Automatic</SelectItem>
                      <SelectItem value="marketplace">Marketplace</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleModuleRegistration} disabled={loading}>
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Register Module
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowRegistrationForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
