import { redirect } from 'next/navigation';
import { requireClient } from '@/lib/auth/guard';
import { getPublicEnv } from '@/lib/env';
import Link from 'next/link';
import { ArrowLeft, Plus, Settings, Activity, Database, Globe, Key, Shield, AlertTriangle, CheckCircle, Clock, ExternalLink, Code, Zap, RefreshCw, Download, Upload, Filter, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function ConnectorsPage() {
  const isSafeMode = getPublicEnv().NEXT_PUBLIC_SAFE_MODE === '1';

  let client = null;

  if (!isSafeMode) {
    try {
      client = await requireClient();
    } catch {
      redirect('/login');
    }
  }

  const connectorStats = {
    totalConnectors: 12,
    activeConnectors: 9,
    pendingConfiguration: 3,
    dataTransformed: 1247,
    apiCalls: 8532,
    uptime: 99.7
  };

  const serviceConnectors = [
    {
      id: 'stripe-connector',
      name: 'Stripe Payment Connector',
      service: 'Stripe',
      type: 'Payment Processing',
      icon: Database,
      status: 'active',
      health: 'healthy',
      authMethod: 'API Key',
      version: 'v2024-06-20',
      lastSync: '2 minutes ago',
      requests: 1234,
      successRate: 99.8,
      avgResponseTime: '245ms',
      dataFormats: ['JSON'],
      endpoints: 4,
      features: [
        'Payment Processing',
        'Subscription Management',
        'Webhook Handling',
        'Refund Processing'
      ]
    },
    {
      id: 'sendgrid-connector',
      name: 'SendGrid Email Connector',
      service: 'SendGrid',
      type: 'Email Delivery',
      icon: Globe,
      status: 'active',
      health: 'healthy',
      authMethod: 'API Key',
      version: 'v3',
      lastSync: '5 minutes ago',
      requests: 567,
      successRate: 99.5,
      avgResponseTime: '180ms',
      dataFormats: ['JSON', 'HTML'],
      endpoints: 3,
      features: [
        'Email Sending',
        'Template Management',
        'Delivery Tracking',
        'Bounce Handling'
      ]
    },
    {
      id: 'aws-s3-connector',
      name: 'AWS S3 Storage Connector',
      service: 'AWS S3',
      type: 'File Storage',
      icon: Database,
      status: 'active',
      health: 'warning',
      authMethod: 'IAM Role',
      version: '2006-03-01',
      lastSync: '15 minutes ago',
      requests: 2341,
      successRate: 98.9,
      avgResponseTime: '320ms',
      dataFormats: ['Binary', 'JSON', 'XML'],
      endpoints: 6,
      features: [
        'File Upload/Download',
        'Bucket Management',
        'Access Control',
        'Lifecycle Management'
      ]
    },
    {
      id: 'slack-connector',
      name: 'Slack API Connector',
      service: 'Slack',
      type: 'Team Communication',
      icon: Globe,
      status: 'active',
      health: 'healthy',
      authMethod: 'OAuth 2.0',
      version: 'v1.7.0',
      lastSync: '1 minute ago',
      requests: 89,
      successRate: 100,
      avgResponseTime: '150ms',
      dataFormats: ['JSON'],
      endpoints: 5,
      features: [
        'Message Posting',
        'Channel Management',
        'User Information',
        'File Sharing'
      ]
    },
    {
      id: 'google-analytics-connector',
      name: 'Google Analytics Connector',
      service: 'Google Analytics',
      type: 'Analytics',
      icon: Activity,
      status: 'configured',
      health: 'pending',
      authMethod: 'OAuth 2.0',
      version: 'v4',
      lastSync: 'Never',
      requests: 0,
      successRate: 0,
      avgResponseTime: 'N/A',
      dataFormats: ['JSON'],
      endpoints: 2,
      features: [
        'Reporting API',
        'Real-time Data',
        'Custom Dimensions',
        'Goal Tracking'
      ]
    }
  ];

  const authenticationTypes = [
    {
      type: 'API Key',
      description: 'Simple API key authentication',
      security: 'Basic',
      setup: 'Header or Query Parameter',
      connectors: 4,
      status: 'supported'
    },
    {
      type: 'OAuth 2.0',
      description: 'Standard OAuth authorization flow',
      security: 'High',
      setup: 'Authorization Code Flow',
      connectors: 3,
      status: 'supported'
    },
    {
      type: 'JWT Token',
      description: 'JSON Web Token authentication',
      security: 'High',
      setup: 'Bearer Token',
      connectors: 2,
      status: 'supported'
    },
    {
      type: 'mTLS',
      description: 'Mutual TLS certificate authentication',
      security: 'Very High',
      setup: 'Client Certificates',
      connectors: 1,
      status: 'supported'
    }
  ];

  const dataTransformations = [
    {
      name: 'JSON to XML Transformation',
      description: 'Convert JSON data to XML format for legacy systems',
      inputFormat: 'JSON',
      outputFormat: 'XML',
      usage: 45,
      performance: 'Fast'
    },
    {
      name: 'CSV Data Normalization',
      description: 'Normalize and validate CSV data imports',
      inputFormat: 'CSV',
      outputFormat: 'JSON',
      usage: 23,
      performance: 'Medium'
    },
    {
      name: 'API Response Mapping',
      description: 'Map external API responses to internal schema',
      inputFormat: 'JSON',
      outputFormat: 'JSON',
      usage: 78,
      performance: 'Fast'
    },
    {
      name: 'Data Enrichment',
      description: 'Enrich data with additional context and metadata',
      inputFormat: 'JSON',
      outputFormat: 'JSON',
      usage: 34,
      performance: 'Medium'
    }
  ];

  const availableConnectors = [
    { name: 'Shopify', type: 'E-commerce', category: 'Commerce', status: 'available' },
    { name: 'HubSpot', type: 'CRM', category: 'Sales', status: 'available' },
    { name: 'Salesforce', type: 'CRM', category: 'Sales', status: 'available' },
    { name: 'Twilio', type: 'SMS/Voice', category: 'Communication', status: 'available' },
    { name: 'Mailchimp', type: 'Email Marketing', category: 'Marketing', status: 'available' },
    { name: 'Zapier', type: 'Automation', category: 'Integration', status: 'available' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/integrations">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Integrations
              </Button>
            </Link>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Connector
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">External Service Connectors</h1>
          <p className="text-gray-600">
            Manage API integrations, authentication, and data transformation for external services
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Connectors</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{connectorStats.totalConnectors}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{connectorStats.activeConnectors}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Calls</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{connectorStats.apiCalls.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Transformed</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{connectorStats.dataTransformed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{connectorStats.uptime}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{connectorStats.pendingConfiguration}</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Service Connectors */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <ExternalLink className="mr-2 h-5 w-5" />
                Active Service Connectors
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-1" />
                  Search
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {serviceConnectors.map((connector) => {
                const Icon = connector.icon;
                return (
                  <div key={connector.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <Icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{connector.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{connector.type}</p>
                          <div className="flex items-center space-x-2">
                            {connector.health === 'healthy' ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : connector.health === 'warning' ? (
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <Clock className="h-4 w-4 text-gray-400" />
                            )}
                            <Badge variant={connector.status === 'active' ? 'default' : 'secondary'}>
                              {connector.status}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {connector.authMethod} • {connector.version}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Activity className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold">{connector.requests}</div>
                        <div className="text-xs text-gray-600">API Requests</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold">{connector.successRate}%</div>
                        <div className="text-xs text-gray-600">Success Rate</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold">{connector.avgResponseTime}</div>
                        <div className="text-xs text-gray-600">Avg Response</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-semibold">{connector.endpoints}</div>
                        <div className="text-xs text-gray-600">Endpoints</div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Supported Features</h4>
                      <div className="flex flex-wrap gap-2">
                        {connector.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div>
                        Last sync: {connector.lastSync}
                      </div>
                      <div className="flex items-center space-x-4">
                        <span>Formats: {connector.dataFormats.join(', ')}</span>
                        <Button variant="outline" size="sm" className="text-xs">
                          Test Connection
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Authentication & Data Transformation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Authentication Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="mr-2 h-5 w-5" />
                Authentication Methods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {authenticationTypes.map((auth, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">{auth.type}</h4>
                        <Badge variant={auth.security === 'Very High' ? 'default' : auth.security === 'High' ? 'secondary' : 'outline'}>
                          {auth.security}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{auth.description}</p>
                      <p className="text-xs text-gray-500 mt-1">Setup: {auth.setup}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{auth.connectors}</div>
                      <div className="text-xs text-gray-600">Connectors</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Transformations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <RefreshCw className="mr-2 h-5 w-5" />
                Data Transformations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dataTransformations.map((transform, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{transform.name}</h4>
                      <Badge variant="outline">{transform.performance}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{transform.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Upload className="h-3 w-3 mr-1" />
                          {transform.inputFormat}
                        </span>
                        <span className="flex items-center">
                          <Download className="h-3 w-3 mr-1" />
                          {transform.outputFormat}
                        </span>
                      </div>
                      <span>{transform.usage} uses</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Connectors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              Available Connectors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {availableConnectors.map((connector, index) => (
                <div key={index} className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
                  <div className="bg-gray-50 p-3 rounded-lg mb-3 inline-block">
                    <ExternalLink className="h-6 w-6 text-gray-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">{connector.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{connector.type}</p>
                  <Badge variant="outline" className="mb-3">{connector.category}</Badge>
                  <div>
                    <Button variant="outline" size="sm" className="w-full">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Connector
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}