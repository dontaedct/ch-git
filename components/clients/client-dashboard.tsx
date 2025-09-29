'use client';

/**
 * Client Dashboard Interface for HT-033.3.1
 * Individual client dashboard with comprehensive information and actions
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  User,
  Building,
  Mail,
  Phone,
  Globe,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Settings,
  FileText,
  Layers,
  Deployment,
  BarChart3,
  PieChart,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Edit,
  Download,
  Share,
  ExternalLink,
  Zap,
  Shield,
  Target,
  Palette,
  Code,
  Monitor,
  Server,
  Database,
  Cloud
} from 'lucide-react';
import { ClientManager, ClientWithStats } from '@/lib/clients/client-manager';
import { CustomizationStorage } from '@/lib/clients/customization-storage';
import { DeploymentTracker, DeploymentSummary } from '@/lib/clients/deployment-tracking';

interface ClientDashboardProps {
  clientId: string;
  onClose?: () => void;
  onEdit?: () => void;
}

interface ClientDashboardData {
  client: ClientWithStats | null;
  customizations: any[];
  deployments: DeploymentSummary[];
  activeCustomization: any | null;
  metrics: {
    totalProjects: number;
    activeDeployments: number;
    totalRevenue: number;
    uptimePercentage: number;
    performanceScore: number;
    satisfactionScore: number;
  };
}

export default function ClientDashboard({ clientId, onClose, onEdit }: ClientDashboardProps) {
  const [data, setData] = useState<ClientDashboardData>({
    client: null,
    customizations: [],
    deployments: [],
    activeCustomization: null,
    metrics: {
      totalProjects: 0,
      activeDeployments: 0,
      totalRevenue: 0,
      uptimePercentage: 0,
      performanceScore: 0,
      satisfactionScore: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const clientManager = new ClientManager();
  const customizationStorage = new CustomizationStorage();
  const deploymentTracker = new DeploymentTracker();

  useEffect(() => {
    loadClientData();
  }, [clientId]);

  const loadClientData = async () => {
    setLoading(true);
    try {
      // Load client information
      const clientResult = await clientManager.getClientWithStats(clientId);
      if (clientResult.error) {
        console.error('Error loading client:', clientResult.error);
        return;
      }

      // Load customizations
      const customizationsResult = await customizationStorage.getClientCustomizations(clientId);
      if (customizationsResult.error) {
        console.error('Error loading customizations:', customizationsResult.error);
      }

      // Load active customization
      const activeCustomizationResult = await customizationStorage.getActiveCustomization(clientId);
      if (activeCustomizationResult.error) {
        console.error('Error loading active customization:', activeCustomizationResult.error);
      }

      // Load deployments
      const deploymentsResult = await deploymentTracker.getClientDeployments(clientId);
      if (deploymentsResult.error) {
        console.error('Error loading deployments:', deploymentsResult.error);
      }

      // Calculate metrics
      const deployments = deploymentsResult.data || [];
      const activeDeployments = deployments.filter(d => d.status === 'deployed').length;
      const totalRevenue = clientResult.data?.annual_revenue || 0;
      const avgUptime = deployments.length > 0
        ? deployments.reduce((sum, d) => sum + (d.uptime_percentage || 0), 0) / deployments.length
        : 0;

      setData({
        client: clientResult.data,
        customizations: customizationsResult.data || [],
        deployments: [],
        activeCustomization: activeCustomizationResult.data,
        metrics: {
          totalProjects: (customizationsResult.data || []).length,
          activeDeployments,
          totalRevenue,
          uptimePercentage: avgUptime,
          performanceScore: 85, // Simulated
          satisfactionScore: 92 // Simulated
        }
      });
    } catch (error) {
      console.error('Error loading client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadClientData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'churned': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'standard': return 'bg-purple-100 text-purple-800';
      case 'premium': return 'bg-orange-100 text-orange-800';
      case 'enterprise': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading client dashboard...</span>
      </div>
    );
  }

  if (!data.client) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <span className="ml-2">Client not found</span>
      </div>
    );
  }

  const { client, customizations, deployments, activeCustomization, metrics } = data;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              {client.name?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{client.name}</h1>
              <p className="text-gray-600">{client.company_name || 'Individual Client'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className={getStatusColor(client.status || 'unknown')}>
              {client.status}
            </Badge>
            <Badge className={getTierColor(client.tier || 'unknown')}>
              {client.tier}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          )}
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Projects</p>
                <p className="text-xl font-bold">{metrics.totalProjects}</p>
              </div>
              <Layers className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Deployments</p>
                <p className="text-xl font-bold text-green-600">{metrics.activeDeployments}</p>
              </div>
              <Server className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(metrics.totalRevenue)}</p>
              </div>
              <DollarSign className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Uptime</p>
                <p className="text-xl font-bold">{metrics.uptimePercentage.toFixed(1)}%</p>
              </div>
              <Activity className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Performance</p>
                <p className="text-xl font-bold">{metrics.performanceScore}%</p>
              </div>
              <Zap className="h-6 w-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Satisfaction</p>
                <p className="text-xl font-bold">{metrics.satisfactionScore}%</p>
              </div>
              <Target className="h-6 w-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="customization">Customization</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{client.phone}</span>
                    </div>
                  )}
                  {client.website_url && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <a
                        href={client.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {client.website_url}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Joined {formatDate(client.created_at)}</span>
                  </div>
                  {client.industry && (
                    <div className="flex items-center gap-3">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{client.industry}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Deployment completed</p>
                      <p className="text-xs text-gray-600">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Code className="h-5 w-5 text-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Customization updated</p>
                      <p className="text-xs text-gray-600">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <Monitor className="h-5 w-5 text-yellow-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Health check completed</p>
                      <p className="text-xs text-gray-600">2 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Uptime</span>
                    <span className="text-sm text-gray-600">{metrics.uptimePercentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.uptimePercentage} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Performance</span>
                    <span className="text-sm text-gray-600">{metrics.performanceScore}%</span>
                  </div>
                  <Progress value={metrics.performanceScore} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Satisfaction</span>
                    <span className="text-sm text-gray-600">{metrics.satisfactionScore}%</span>
                  </div>
                  <Progress value={metrics.satisfactionScore} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Client Projects ({customizations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customizations.length > 0 ? (
                <div className="space-y-4">
                  {customizations.map((customization, index) => (
                    <div key={customization.id || index} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{customization.template_id || `Project ${index + 1}`}</h3>
                        <Badge className={customization.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {customization.status || 'draft'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Template: {customization.template_id}</p>
                        <p>Version: {customization.version || 1}</p>
                        <p>Created: {formatDate(customization.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Layers className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No projects found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Deployments ({deployments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deployments.length > 0 ? (
                <div className="space-y-4">
                  {deployments.map((deployment) => (
                    <div key={deployment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{deployment.deployment_name}</h3>
                        <div className="flex gap-2">
                          <Badge className={deployment.status === 'deployed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {deployment.status}
                          </Badge>
                          <Badge className={deployment.health_status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {deployment.health_status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>URL: {deployment.deployment_url}</p>
                        <p>Uptime: {deployment.uptime_percentage.toFixed(1)}%</p>
                        <p>Last Check: {formatDate(deployment.last_health_check)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Server className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No deployments found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Client Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Detailed analytics coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Active Customization
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeCustomization ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Template</Label>
                      <p className="text-sm text-gray-600">{activeCustomization.template_id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Version</Label>
                      <p className="text-sm text-gray-600">{activeCustomization.version}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <Badge className="bg-green-100 text-green-800">
                        {activeCustomization.status}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Last Updated</Label>
                      <p className="text-sm text-gray-600">{formatDate(activeCustomization.updated_at)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Palette className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No active customization</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Client Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Settings panel coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}