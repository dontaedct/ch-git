'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  universalClientManager,
  ClientDeployment
} from '@/lib/control/universal-client-manager';
import {
  centralizedActionsManager,
  ActionExecution
} from '@/lib/control/centralized-actions';
import {
  Activity,
  Server,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';

interface UniversalDashboardProps {
  className?: string;
}

export const UniversalDashboard: React.FC<UniversalDashboardProps> = ({ className }) => {
  const [clients, setClients] = useState<ClientDeployment[]>([]);
  const [recentExecutions, setRecentExecutions] = useState<ActionExecution[]>([]);
  const [aggregatedMetrics, setAggregatedMetrics] = useState({
    totalClients: 0,
    activeClients: 0,
    totalRevenue: 0,
    averageUptime: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [clientsData, metricsData, executionsData] = await Promise.all([
        universalClientManager.getAllClients(),
        universalClientManager.getAggregatedMetrics(),
        centralizedActionsManager.getAllActionExecutions()
      ]);

      setClients(clientsData);
      setAggregatedMetrics(metricsData);
      setRecentExecutions(executionsData.slice(0, 10));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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

  const getStatusColor = (status: ClientDeployment['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-gray-500';
      case 'deploying':
        return 'bg-blue-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getHealthColor = (health: ClientDeployment['health']) => {
    switch (health) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Universal Client Control</h1>
          <p className="text-gray-600 mt-2">
            Centralized management for all client deployments
          </p>
        </div>
        <Button onClick={loadDashboardData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aggregatedMetrics.totalClients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {aggregatedMetrics.activeClients}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${aggregatedMetrics.totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Uptime</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aggregatedMetrics.averageUptime.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aggregatedMetrics.totalUsers.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="clients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="clients">Client Overview</TabsTrigger>
          <TabsTrigger value="actions">Recent Actions</TabsTrigger>
          <TabsTrigger value="monitoring">System Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          {/* Client Selection Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Client Management</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {selectedClients.length === clients.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Badge variant="secondary">
                    {selectedClients.length} selected
                  </Badge>
                </div>
              </CardTitle>
              <CardDescription>
                Select clients to perform bulk operations
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Client List */}
          <div className="grid gap-4">
            {clients.map((client) => (
              <Card
                key={client.id}
                className={`transition-all cursor-pointer ${
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
                          className={`w-3 h-3 rounded-full ${getStatusColor(client.status)}`}
                        />
                        <h3 className="font-semibold">{client.name}</h3>
                      </div>
                      <Badge variant="outline">{client.template}</Badge>
                      <Badge variant="secondary">{client.version}</Badge>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className={`flex items-center space-x-1 ${getHealthColor(client.health)}`}>
                        {client.health === 'healthy' && <CheckCircle className="h-4 w-4" />}
                        {client.health === 'warning' && <AlertTriangle className="h-4 w-4" />}
                        {client.health === 'critical' && <AlertTriangle className="h-4 w-4" />}
                        <span className="text-sm capitalize">{client.health}</span>
                      </div>

                      <div className="text-sm text-gray-600">
                        ${client.billing.monthlyRevenue}/mo
                      </div>

                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Domain:</span>
                      <div className="font-medium">{client.domain}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Uptime:</span>
                      <div className="font-medium">{client.metrics.uptime}%</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Response Time:</span>
                      <div className="font-medium">{client.metrics.responseTime}ms</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Daily Users:</span>
                      <div className="font-medium">{client.metrics.dailyUsers}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Actions</CardTitle>
              <CardDescription>
                Latest centralized actions performed across clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentExecutions.map((execution) => (
                  <div
                    key={execution.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-semibold">{execution.templateName}</h4>
                      <p className="text-sm text-gray-600">
                        {execution.targetClients.length} clients • {execution.executedBy}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          execution.status === 'completed'
                            ? 'default'
                            : execution.status === 'failed'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {execution.status}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {execution.progress}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Monitoring</CardTitle>
              <CardDescription>
                Real-time monitoring of client deployment health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Health Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-green-600">Healthy</span>
                      <span>{clients.filter(c => c.health === 'healthy').length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-600">Warning</span>
                      <span>{clients.filter(c => c.health === 'warning').length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-red-600">Critical</span>
                      <span>{clients.filter(c => c.health === 'critical').length}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Status Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-green-600">Active</span>
                      <span>{clients.filter(c => c.status === 'active').length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600">Deploying</span>
                      <span>{clients.filter(c => c.status === 'deploying').length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Inactive</span>
                      <span>{clients.filter(c => c.status === 'inactive').length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-red-600">Error</span>
                      <span>{clients.filter(c => c.status === 'error').length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UniversalDashboard;