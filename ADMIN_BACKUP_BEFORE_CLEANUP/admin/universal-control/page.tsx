'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UniversalDashboard } from '@/components/control/universal-dashboard';
import { BulkActions } from '@/components/control/bulk-actions';
import {
  universalClientManager,
  ClientDeployment
} from '@/lib/control/universal-client-manager';
import {
  centralizedActionsManager,
  ActionExecution
} from '@/lib/control/centralized-actions';
import {
  bulkOperationsManager,
  BulkOperation
} from '@/lib/control/bulk-operations';
import {
  Activity,
  BarChart3,
  Settings,
  Users,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function UniversalControlPage() {
  const [clients, setClients] = useState<ClientDeployment[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [recentExecutions, setRecentExecutions] = useState<ActionExecution[]>([]);
  const [bulkOperations, setBulkOperations] = useState<BulkOperation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [clientsData, executionsData, operationsData] = await Promise.all([
        universalClientManager.getAllClients(),
        centralizedActionsManager.getAllActionExecutions(),
        bulkOperationsManager.getAllBulkOperations()
      ]);

      setClients(clientsData);
      setRecentExecutions(executionsData.slice(0, 10));
      setBulkOperations(operationsData.slice(0, 10));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClientSelect = (clientId: string) => {
    setSelectedClients(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedClients.length === clients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(clients.map(c => c.id));
    }
  };

  const getExecutionStatusIcon = (status: ActionExecution['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <Activity className="h-4 w-4 text-blue-600 animate-pulse" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="text-lg">Loading Universal Control Center...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Settings className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold">Universal Client Control</h1>
                  <p className="text-sm text-gray-600">
                    Centralized management for all client deployments
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {clients.length} total clients • {selectedClients.length} selected
              </div>
              <Button onClick={loadData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Client Management</span>
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Bulk Actions</span>
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>System Monitor</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <UniversalDashboard />
          </TabsContent>

          {/* Client Management Tab */}
          <TabsContent value="clients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Management</CardTitle>
                <CardDescription>
                  Select and manage individual client deployments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Button onClick={handleSelectAll} variant="outline">
                      {selectedClients.length === clients.length ? 'Deselect All' : 'Select All'}
                    </Button>
                    <span className="text-sm text-gray-600">
                      {selectedClients.length} of {clients.length} clients selected
                    </span>
                  </div>

                  <div className="grid gap-4">
                    {clients.map((client) => (
                      <Card
                        key={client.id}
                        className={`cursor-pointer transition-all ${
                          selectedClients.includes(client.id)
                            ? 'ring-2 ring-blue-500 border-blue-500'
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => handleClientSelect(client.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <div
                                  className={`w-3 h-3 rounded-full ${
                                    client.status === 'active'
                                      ? 'bg-green-500'
                                      : client.status === 'deploying'
                                      ? 'bg-blue-500'
                                      : client.status === 'error'
                                      ? 'bg-red-500'
                                      : 'bg-gray-500'
                                  }`}
                                />
                                <h3 className="font-semibold">{client.name}</h3>
                              </div>
                              <div className="flex space-x-2">
                                <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                                  {client.template}
                                </span>
                                <span className="text-sm bg-blue-100 px-2 py-1 rounded">
                                  v{client.version}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">{client.metrics.uptime}%</span>
                                <span className="ml-1">uptime</span>
                              </div>
                              <div>
                                <span className="font-medium">{client.metrics.dailyUsers}</span>
                                <span className="ml-1">users</span>
                              </div>
                              <div>
                                <span className="font-medium">${client.billing.monthlyRevenue}</span>
                                <span className="ml-1">/mo</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-2 text-sm text-gray-600">
                            {client.domain}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bulk Actions Tab */}
          <TabsContent value="actions">
            <BulkActions
              selectedClients={selectedClients}
              onExecutionComplete={loadData}
            />
          </TabsContent>

          {/* System Monitor Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Executions */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Executions</CardTitle>
                  <CardDescription>
                    Latest centralized actions and their status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentExecutions.map((execution) => (
                      <div
                        key={execution.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {getExecutionStatusIcon(execution.status)}
                          <div>
                            <h4 className="font-medium">{execution.templateName}</h4>
                            <p className="text-sm text-gray-600">
                              {execution.targetClients.length} clients • {execution.executedBy}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {execution.progress}%
                          </div>
                          <div className="text-xs text-gray-500">
                            {execution.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Bulk Operations */}
              <Card>
                <CardHeader>
                  <CardTitle>Bulk Operations</CardTitle>
                  <CardDescription>
                    System-wide operations and their progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bulkOperations.map((operation) => (
                      <div
                        key={operation.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {getExecutionStatusIcon(operation.status as any)}
                          <div>
                            <h4 className="font-medium capitalize">{operation.type}</h4>
                            <p className="text-sm text-gray-600">
                              {operation.targetClients.length} clients
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {operation.progress}%
                          </div>
                          <div className="text-xs text-gray-500">
                            {operation.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle>System Health Overview</CardTitle>
                <CardDescription>
                  Overall health and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {clients.filter(c => c.health === 'healthy').length}
                    </div>
                    <div className="text-sm text-gray-600">Healthy Clients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {clients.filter(c => c.health === 'warning').length}
                    </div>
                    <div className="text-sm text-gray-600">Warning Status</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {clients.filter(c => c.health === 'critical').length}
                    </div>
                    <div className="text-sm text-gray-600">Critical Status</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {clients.filter(c => c.status === 'active').length}
                    </div>
                    <div className="text-sm text-gray-600">Active Deployments</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}