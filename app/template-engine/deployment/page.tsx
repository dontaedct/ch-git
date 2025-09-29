/**
 * @fileoverview Deployment Integration Interface
 * Advanced deployment configuration and management system
 * HT-029.3.4 Implementation
 */
"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Cloud,
  Server,
  Globe,
  Shield,
  Zap,
  Settings,
  Monitor,
  Database,
  Key,
  Lock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Copy,
  Eye,
  Edit,
  Trash2,
  Plus,
  GitBranch,
  Terminal,
  Activity,
  BarChart3,
  Clock,
  Users,
  FileText,
  Download,
  Upload
} from "lucide-react";

interface DeploymentProvider {
  id: string;
  name: string;
  description: string;
  logo: string;
  features: string[];
  pricing: 'free' | 'premium' | 'enterprise';
  supported: boolean;
  regions: string[];
  capabilities: {
    autoSSL: boolean;
    customDomains: boolean;
    serverless: boolean;
    edgeComputing: boolean;
    analytics: boolean;
    monitoring: boolean;
  };
}

interface DeploymentConfig {
  id: string;
  name: string;
  provider: string;
  environment: 'development' | 'staging' | 'production';
  settings: {
    region: string;
    framework: string;
    buildCommand: string;
    outputDirectory: string;
    environmentVariables: Record<string, string>;
    customDomain?: string;
    autoSSL: boolean;
    caching: boolean;
    monitoring: boolean;
  };
  status: 'active' | 'inactive' | 'error';
  lastDeployed?: Date;
  deploymentUrl?: string;
  metrics: {
    uptime: number;
    responseTime: number;
    deployments: number;
    errors: number;
  };
}

interface DeploymentLog {
  id: string;
  timestamp: Date;
  type: 'deployment' | 'error' | 'rollback' | 'config';
  message: string;
  status: 'success' | 'warning' | 'error';
  duration?: number;
  buildId?: string;
}

export default function DeploymentIntegrationInterface() {
  const [selectedProvider, setSelectedProvider] = useState<DeploymentProvider | null>(null);
  const [deploymentConfigs, setDeploymentConfigs] = useState<DeploymentConfig[]>([]);
  const [deploymentLogs, setDeploymentLogs] = useState<DeploymentLog[]>([]);
  const [currentTab, setCurrentTab] = useState("providers");
  const [isConnecting, setIsConnecting] = useState(false);

  const [providers] = useState<DeploymentProvider[]>([
    {
      id: 'vercel',
      name: 'Vercel',
      description: 'The platform for frontend developers, providing the speed and reliability innovators need',
      logo: '▲',
      features: ['Zero-config deployments', 'Global CDN', 'Serverless functions', 'Real-time collaboration'],
      pricing: 'free',
      supported: true,
      regions: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'],
      capabilities: {
        autoSSL: true,
        customDomains: true,
        serverless: true,
        edgeComputing: true,
        analytics: true,
        monitoring: true
      }
    },
    {
      id: 'netlify',
      name: 'Netlify',
      description: 'The fastest way to combine your favorite tools and APIs to build the fastest sites',
      logo: '◉',
      features: ['Git-based workflow', 'Form handling', 'Split testing', 'Edge functions'],
      pricing: 'free',
      supported: true,
      regions: ['us-east-1', 'us-west-2', 'eu-central-1'],
      capabilities: {
        autoSSL: true,
        customDomains: true,
        serverless: true,
        edgeComputing: false,
        analytics: true,
        monitoring: true
      }
    },
    {
      id: 'aws',
      name: 'AWS Amplify',
      description: 'Fast, secure, reliable static and server-side rendered apps',
      logo: '☁',
      features: ['Full-stack development', 'CI/CD', 'Hosting', 'Backend services'],
      pricing: 'premium',
      supported: true,
      regions: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1', 'ap-northeast-1'],
      capabilities: {
        autoSSL: true,
        customDomains: true,
        serverless: true,
        edgeComputing: true,
        analytics: true,
        monitoring: true
      }
    },
    {
      id: 'cloudflare',
      name: 'Cloudflare Pages',
      description: 'JAMstack platform for frontend developers to collaborate and deploy websites',
      logo: '☁',
      features: ['Global network', 'Unlimited bandwidth', 'Custom domains', 'Preview deployments'],
      pricing: 'free',
      supported: true,
      regions: ['global-edge-network'],
      capabilities: {
        autoSSL: true,
        customDomains: true,
        serverless: true,
        edgeComputing: true,
        analytics: true,
        monitoring: false
      }
    },
    {
      id: 'github',
      name: 'GitHub Pages',
      description: 'Websites for you and your projects, hosted directly from your GitHub repository',
      logo: '⚡',
      features: ['GitHub integration', 'Jekyll support', 'Custom domains', 'HTTPS'],
      pricing: 'free',
      supported: false,
      regions: ['global'],
      capabilities: {
        autoSSL: true,
        customDomains: true,
        serverless: false,
        edgeComputing: false,
        analytics: false,
        monitoring: false
      }
    }
  ]);

  const [sampleConfigs] = useState<DeploymentConfig[]>([
    {
      id: 'config-1',
      name: 'Production Deployment',
      provider: 'vercel',
      environment: 'production',
      settings: {
        region: 'us-east-1',
        framework: 'nextjs',
        buildCommand: 'npm run build',
        outputDirectory: '.next',
        environmentVariables: {
          'NODE_ENV': 'production',
          'NEXT_PUBLIC_API_URL': 'https://api.example.com'
        },
        customDomain: 'consultation.example.com',
        autoSSL: true,
        caching: true,
        monitoring: true
      },
      status: 'active',
      lastDeployed: new Date('2025-01-15T10:30:00Z'),
      deploymentUrl: 'https://consultation.vercel.app',
      metrics: {
        uptime: 99.9,
        responseTime: 120,
        deployments: 45,
        errors: 2
      }
    },
    {
      id: 'config-2',
      name: 'Staging Environment',
      provider: 'netlify',
      environment: 'staging',
      settings: {
        region: 'us-east-1',
        framework: 'react',
        buildCommand: 'npm run build',
        outputDirectory: 'build',
        environmentVariables: {
          'NODE_ENV': 'staging',
          'REACT_APP_API_URL': 'https://staging-api.example.com'
        },
        autoSSL: true,
        caching: false,
        monitoring: false
      },
      status: 'active',
      lastDeployed: new Date('2025-01-14T15:20:00Z'),
      deploymentUrl: 'https://staging-consultation.netlify.app',
      metrics: {
        uptime: 98.5,
        responseTime: 180,
        deployments: 23,
        errors: 1
      }
    }
  ]);

  const [sampleLogs] = useState<DeploymentLog[]>([
    {
      id: 'log-1',
      timestamp: new Date('2025-01-15T10:30:00Z'),
      type: 'deployment',
      message: 'Production deployment completed successfully',
      status: 'success',
      duration: 120,
      buildId: 'bld_abc123'
    },
    {
      id: 'log-2',
      timestamp: new Date('2025-01-15T09:15:00Z'),
      type: 'config',
      message: 'Environment variables updated',
      status: 'success'
    },
    {
      id: 'log-3',
      timestamp: new Date('2025-01-14T15:20:00Z'),
      type: 'deployment',
      message: 'Staging deployment completed',
      status: 'success',
      duration: 95,
      buildId: 'bld_def456'
    },
    {
      id: 'log-4',
      timestamp: new Date('2025-01-14T10:45:00Z'),
      type: 'error',
      message: 'Build failed: Missing environment variable',
      status: 'error',
      buildId: 'bld_ghi789'
    }
  ]);

  useEffect(() => {
    setDeploymentConfigs(sampleConfigs);
    setDeploymentLogs(sampleLogs);
    setSelectedProvider(providers.find(p => p.id === 'vercel') || null);
  }, [sampleConfigs, sampleLogs, providers]);

  const handleConnectProvider = async (provider: DeploymentProvider) => {
    setIsConnecting(true);

    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Add new deployment config
    const newConfig: DeploymentConfig = {
      id: `config-${Date.now()}`,
      name: `${provider.name} Deployment`,
      provider: provider.id,
      environment: 'production',
      settings: {
        region: provider.regions[0],
        framework: 'nextjs',
        buildCommand: 'npm run build',
        outputDirectory: '.next',
        environmentVariables: {},
        autoSSL: true,
        caching: true,
        monitoring: true
      },
      status: 'active',
      lastDeployed: new Date(),
      deploymentUrl: `https://your-app.${provider.id === 'vercel' ? 'vercel.app' : provider.id === 'netlify' ? 'netlify.app' : 'example.com'}`,
      metrics: {
        uptime: 100,
        responseTime: 0,
        deployments: 0,
        errors: 0
      }
    };

    setDeploymentConfigs(prev => [...prev, newConfig]);
    setIsConnecting(false);
  };

  const renderProviderCard = (provider: DeploymentProvider) => {
    const isConnected = deploymentConfigs.some(config => config.provider === provider.id);

    return (
      <Card
        key={provider.id}
        className={`cursor-pointer transition-all hover:shadow-lg ${
          selectedProvider?.id === provider.id ? 'ring-2 ring-blue-500' : ''
        } ${!provider.supported ? 'opacity-60' : ''}`}
        onClick={() => setSelectedProvider(provider)}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{provider.logo}</div>
              <div>
                <h3 className="font-semibold text-lg">{provider.name}</h3>
                <p className="text-sm text-gray-600">{provider.description}</p>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <Badge
                variant={provider.pricing === 'free' ? 'secondary' : 'default'}
                className={
                  provider.pricing === 'free'
                    ? 'bg-green-100 text-green-800'
                    : provider.pricing === 'premium'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-purple-100 text-purple-800'
                }
              >
                {provider.pricing}
              </Badge>
              {isConnected && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              )}
              {!provider.supported && (
                <Badge variant="secondary">Coming Soon</Badge>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Key Features</h4>
              <div className="flex flex-wrap gap-2">
                {provider.features.slice(0, 3).map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Capabilities</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-1">
                  {provider.capabilities.autoSSL ? (
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-gray-400" />
                  )}
                  <span>Auto SSL</span>
                </div>
                <div className="flex items-center space-x-1">
                  {provider.capabilities.serverless ? (
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-gray-400" />
                  )}
                  <span>Serverless</span>
                </div>
                <div className="flex items-center space-x-1">
                  {provider.capabilities.customDomains ? (
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-gray-400" />
                  )}
                  <span>Custom Domains</span>
                </div>
                <div className="flex items-center space-x-1">
                  {provider.capabilities.monitoring ? (
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-gray-400" />
                  )}
                  <span>Monitoring</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-2 mt-4">
            {provider.supported ? (
              <>
                {isConnected ? (
                  <Button size="sm" variant="outline" className="flex-1">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConnectProvider(provider);
                    }}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Connect
                      </>
                    )}
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline" className="flex-1" disabled>
                Coming Soon
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderConfigCard = (config: DeploymentConfig) => {
    const provider = providers.find(p => p.id === config.provider);
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'active': return 'bg-green-100 text-green-800';
        case 'inactive': return 'bg-gray-100 text-gray-800';
        case 'error': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <Card key={config.id} className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="text-lg">{provider?.logo}</div>
              <div>
                <h3 className="font-semibold">{config.name}</h3>
                <p className="text-sm text-gray-600">{provider?.name} • {config.settings.region}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(config.status)}>
                {config.status}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {config.environment}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-green-600">{config.metrics.uptime}%</div>
              <div className="text-xs text-gray-600">Uptime</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-blue-600">{config.metrics.responseTime}ms</div>
              <div className="text-xs text-gray-600">Response Time</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-purple-600">{config.metrics.deployments}</div>
              <div className="text-xs text-gray-600">Deployments</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-orange-600">{config.metrics.errors}</div>
              <div className="text-xs text-gray-600">Errors</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <span>Last deployed: {config.lastDeployed?.toLocaleDateString()}</span>
            <span>Framework: {config.settings.framework}</span>
          </div>

          <div className="flex space-x-2">
            <Button size="sm" className="flex-1" asChild>
              <a href={config.deploymentUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Live
              </a>
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Monitor className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Deployment Integration</h1>
              <p className="text-gray-600 mt-1">
                Configure and manage deployment providers for your generated applications
              </p>
            </div>
            <div className="flex space-x-4">
              <Link href="/template-engine/generation-pipeline">
                <Button variant="outline">
                  <GitBranch className="h-4 w-4 mr-2" />
                  Generation Pipeline
                </Button>
              </Link>
              <Link href="/template-engine">
                <Button variant="outline">Back to Engine</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="configurations">Configurations</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="logs">Deployment Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="providers" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Deployment Providers</h2>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Custom Provider
              </Button>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {providers.map(renderProviderCard)}
            </div>

            {selectedProvider && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="text-2xl">{selectedProvider.logo}</span>
                    <span>{selectedProvider.name} Details</span>
                  </CardTitle>
                  <CardDescription>
                    {selectedProvider.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-3">Available Regions</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProvider.regions.map((region) => (
                          <Badge key={region} variant="outline">
                            {region}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-3">All Features</h3>
                      <div className="space-y-2">
                        {selectedProvider.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="configurations" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Deployment Configurations</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Configuration
              </Button>
            </div>

            {deploymentConfigs.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Configurations</h3>
                  <p className="text-gray-600 mb-4">
                    Connect a deployment provider to create your first configuration
                  </p>
                  <Button onClick={() => setCurrentTab('providers')}>
                    <Cloud className="h-4 w-4 mr-2" />
                    Browse Providers
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid lg:grid-cols-2 gap-6">
                {deploymentConfigs.map(renderConfigCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Active Deployments</p>
                      <p className="text-2xl font-bold text-green-600">
                        {deploymentConfigs.filter(c => c.status === 'active').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Activity className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Avg Uptime</p>
                      <p className="text-2xl font-bold text-blue-600">99.2%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Clock className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Avg Response</p>
                      <p className="text-2xl font-bold text-purple-600">150ms</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Deployments</p>
                      <p className="text-2xl font-bold text-orange-600">68</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Deployment Health</CardTitle>
                <CardDescription>
                  Real-time monitoring of your deployed applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deploymentConfigs.map((config) => {
                    const provider = providers.find(p => p.id === config.provider);
                    return (
                      <div key={config.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="text-lg">{provider?.logo}</div>
                          <div>
                            <p className="font-medium">{config.name}</p>
                            <p className="text-sm text-gray-600">{config.deploymentUrl}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Uptime</p>
                            <p className="font-semibold text-green-600">{config.metrics.uptime}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Response</p>
                            <p className="font-semibold text-blue-600">{config.metrics.responseTime}ms</p>
                          </div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Deployment Logs</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Logs
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {deploymentLogs.map((log) => {
                    const getLogIcon = () => {
                      switch (log.type) {
                        case 'deployment': return <GitBranch className="h-4 w-4" />;
                        case 'error': return <AlertCircle className="h-4 w-4" />;
                        case 'rollback': return <RefreshCw className="h-4 w-4" />;
                        case 'config': return <Settings className="h-4 w-4" />;
                        default: return <FileText className="h-4 w-4" />;
                      }
                    };

                    const getStatusColor = () => {
                      switch (log.status) {
                        case 'success': return 'text-green-600';
                        case 'warning': return 'text-yellow-600';
                        case 'error': return 'text-red-600';
                        default: return 'text-gray-600';
                      }
                    };

                    return (
                      <div key={log.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                        <div className={`p-1 rounded ${getStatusColor()}`}>
                          {getLogIcon()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{log.message}</p>
                            <span className="text-sm text-gray-500">
                              {log.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="capitalize">{log.type}</span>
                            {log.duration && <span>{log.duration}s</span>}
                            {log.buildId && <span>Build: {log.buildId}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Integration Status</CardTitle>
                <CardDescription>
                  Deployment integration system status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    {[
                      { name: 'App Generation Pipeline', status: 'operational' },
                      { name: 'Build System', status: 'operational' },
                      { name: 'Deployment Automation', status: 'operational' },
                      { name: 'Monitoring System', status: 'operational' }
                    ].map((integration) => (
                      <div key={integration.name} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <span className="font-medium">{integration.name}</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          {integration.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: 'Provider APIs', status: 'operational' },
                      { name: 'SSL Management', status: 'operational' },
                      { name: 'Domain Management', status: 'operational' },
                      { name: 'Analytics Tracking', status: 'operational' }
                    ].map((integration) => (
                      <div key={integration.name} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <span className="font-medium">{integration.name}</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          {integration.status}
                        </Badge>
                      </div>
                    ))}
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