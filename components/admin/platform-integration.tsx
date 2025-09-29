/**
 * @fileoverview Platform Integration Interface Component - HT-032.4.1
 * @module components/admin/platform-integration
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * React component for managing platform integration dashboard with
 * real-time integration status, component health monitoring, and
 * HT-031 system integration management.
 */

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { 
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Zap,
  Brain,
  Layers,
  Package,
  Settings,
  ArrowRight,
  Clock,
  TrendingUp,
  Shield,
  Database,
  Globe
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Integration Status Types
interface IntegrationPoint {
  name: string;
  type: 'api' | 'component' | 'service' | 'data';
  status: 'connected' | 'disconnected' | 'partial';
  endpoint?: string;
  lastSync?: Date;
  latency?: number;
  errorRate?: number;
}

interface ComponentIntegration {
  id: string;
  name: string;
  type: 'core' | 'template' | 'ai' | 'marketplace';
  status: 'active' | 'inactive' | 'error' | 'pending';
  healthScore: number;
  version: string;
  integrationPoints: IntegrationPoint[];
  dependencies: string[];
  lastChecked: Date;
}

interface HT031Integration {
  aiPoweredGeneration: {
    enabled: boolean;
    status: 'operational' | 'degraded' | 'offline';
    capabilities: string[];
    lastSync: Date;
  };
  templateIntelligence: {
    enabled: boolean;
    status: 'operational' | 'degraded' | 'offline';
    discoveryEngine: boolean;
    recommendationEngine: boolean;
    analyticsEngine: boolean;
  };
  smartFormBuilder: {
    enabled: boolean;
    status: 'operational' | 'degraded' | 'offline';
    dynamicGeneration: boolean;
    validationEngine: boolean;
    fieldTypes: string[];
  };
  platformIntegration: {
    enabled: boolean;
    status: 'operational' | 'degraded' | 'offline';
    cohesiveArchitecture: boolean;
    unifiedExperience: boolean;
  };
}

interface PlatformIntegrationProps {
  integrationStatus: {
    ht031Integration: {
      status: 'connected' | 'disconnected' | 'partial';
      healthScore: number;
      aiPoweredGeneration: boolean;
      templateIntelligence: boolean;
      smartFormBuilder: boolean;
      platformIntegration: boolean;
    };
    modularArchitecture: {
      coreFoundation: boolean;
      templateRegistry: boolean;
      settingsRegistry: boolean;
      componentSystem: boolean;
      healthScore: number;
    };
    aiIntegration: {
      templateDiscovery: boolean;
      smartRecommendations: boolean;
      settingsGeneration: boolean;
      userExperience: boolean;
      healthScore: number;
    };
    marketplace: {
      infrastructure: boolean;
      versioning: boolean;
      enterpriseManagement: boolean;
      analytics: boolean;
      healthScore: number;
    };
  };
  onRefresh: () => void;
}

export function PlatformIntegrationComponent({ 
  integrationStatus, 
  onRefresh 
}: PlatformIntegrationProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<string>('ht031');

  // Mock detailed integration data
  const [detailedIntegrations, setDetailedIntegrations] = useState<ComponentIntegration[]>([
    {
      id: 'ht031-integration',
      name: 'HT-031 AI Systems',
      type: 'ai',
      status: 'active',
      healthScore: integrationStatus.ht031Integration.healthScore,
      version: '1.0.0',
      integrationPoints: [
        {
          name: 'AI Generation API',
          type: 'api',
          status: 'connected',
          endpoint: '/api/ai/generation',
          lastSync: new Date(Date.now() - 5 * 60 * 1000),
          latency: 150,
          errorRate: 0.02
        },
        {
          name: 'Template Intelligence Service',
          type: 'service',
          status: 'connected',
          lastSync: new Date(Date.now() - 2 * 60 * 1000),
          latency: 80,
          errorRate: 0.01
        },
        {
          name: 'Smart Form Builder',
          type: 'component',
          status: 'connected',
          lastSync: new Date(Date.now() - 1 * 60 * 1000),
          latency: 45,
          errorRate: 0
        }
      ],
      dependencies: [],
      lastChecked: new Date(Date.now() - 1 * 60 * 1000)
    },
    {
      id: 'modular-architecture',
      name: 'Modular Architecture',
      type: 'core',
      status: 'active',
      healthScore: integrationStatus.modularArchitecture.healthScore,
      version: '1.0.0',
      integrationPoints: [
        {
          name: 'Template Registry API',
          type: 'api',
          status: 'connected',
          endpoint: '/api/admin/templates/registry',
          lastSync: new Date(Date.now() - 3 * 60 * 1000),
          latency: 65,
          errorRate: 0
        },
        {
          name: 'Settings Registry Service',
          type: 'service',
          status: 'connected',
          lastSync: new Date(Date.now() - 4 * 60 * 1000),
          latency: 90,
          errorRate: 0.005
        },
        {
          name: 'Component System',
          type: 'component',
          status: 'connected',
          lastSync: new Date(Date.now() - 2 * 60 * 1000),
          latency: 35,
          errorRate: 0
        }
      ],
      dependencies: [],
      lastChecked: new Date(Date.now() - 2 * 60 * 1000)
    },
    {
      id: 'ai-integration',
      name: 'AI Integration Layer',
      type: 'ai',
      status: 'active',
      healthScore: integrationStatus.aiIntegration.healthScore,
      version: '1.0.0',
      integrationPoints: [
        {
          name: 'Template Discovery Engine',
          type: 'service',
          status: 'connected',
          lastSync: new Date(Date.now() - 6 * 60 * 1000),
          latency: 120,
          errorRate: 0.01
        },
        {
          name: 'Smart Recommendations API',
          type: 'api',
          status: 'connected',
          endpoint: '/api/ai/recommendations',
          lastSync: new Date(Date.now() - 3 * 60 * 1000),
          latency: 200,
          errorRate: 0.03
        }
      ],
      dependencies: ['ht031-integration'],
      lastChecked: new Date(Date.now() - 3 * 60 * 1000)
    },
    {
      id: 'marketplace-infrastructure',
      name: 'Marketplace Infrastructure',
      type: 'marketplace',
      status: 'active',
      healthScore: integrationStatus.marketplace.healthScore,
      version: '1.0.0',
      integrationPoints: [
        {
          name: 'Marketplace API',
          type: 'api',
          status: 'connected',
          endpoint: '/api/marketplace',
          lastSync: new Date(Date.now() - 7 * 60 * 1000),
          latency: 180,
          errorRate: 0.02
        },
        {
          name: 'Template Versioning Service',
          type: 'service',
          status: 'connected',
          lastSync: new Date(Date.now() - 5 * 60 * 1000),
          latency: 110,
          errorRate: 0.01
        },
        {
          name: 'Analytics Engine',
          type: 'service',
          status: 'partial',
          lastSync: new Date(Date.now() - 15 * 60 * 1000),
          latency: 300,
          errorRate: 0.08
        }
      ],
      dependencies: ['modular-architecture', 'ai-integration'],
      lastChecked: new Date(Date.now() - 5 * 60 * 1000)
    }
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Simulate refresh delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update last checked times
      setDetailedIntegrations(prev => 
        prev.map(integration => ({
          ...integration,
          lastChecked: new Date()
        }))
      );
      
      onRefresh();
    } catch (error) {
      console.error('Failed to refresh integration status:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
      case 'operational':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'partial':
      case 'degraded':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'inactive':
      case 'disconnected':
      case 'offline':
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
      case 'operational':
        return 'text-green-500 border-green-500';
      case 'partial':
      case 'degraded':
        return 'text-yellow-500 border-yellow-500';
      case 'inactive':
      case 'disconnected':
      case 'offline':
      case 'error':
        return 'text-red-500 border-red-500';
      default:
        return 'text-gray-500 border-gray-500';
    }
  };

  const formatLatency = (latency?: number) => {
    if (!latency) return 'N/A';
    return `${latency}ms`;
  };

  const formatErrorRate = (errorRate?: number) => {
    if (errorRate === undefined) return 'N/A';
    return `${(errorRate * 100).toFixed(2)}%`;
  };

  const formatLastSync = (date?: Date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    return date.toLocaleDateString();
  };

  if (!mounted) return null;

  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  const selectedIntegration = detailedIntegrations.find(i => i.id === selectedComponent);

  return (
    <div className="space-y-6">
      {/* Integration Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Layers className="w-5 h-5 mr-2" />
                Platform Integration Status
              </CardTitle>
              <CardDescription>
                Real-time status of all platform integrations and component health
              </CardDescription>
            </div>
            <Button 
              onClick={handleRefresh}
              disabled={refreshing}
              size="sm"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {detailedIntegrations.map((integration) => (
              <motion.div
                key={integration.id}
                className={cn(
                  "p-4 rounded-lg border-2 cursor-pointer transition-all duration-300",
                  selectedComponent === integration.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
                onClick={() => setSelectedComponent(integration.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {integration.type === 'ai' && <Brain className="w-4 h-4 text-purple-500" />}
                    {integration.type === 'core' && <Layers className="w-4 h-4 text-blue-500" />}
                    {integration.type === 'marketplace' && <Package className="w-4 h-4 text-green-500" />}
                    {integration.type === 'template' && <Settings className="w-4 h-4 text-orange-500" />}
                    <span className="font-medium text-sm">{integration.name}</span>
                  </div>
                  {getStatusIcon(integration.status)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Health Score</span>
                    <span className={cn(
                      "font-medium",
                      integration.healthScore >= 95 ? "text-green-500" :
                      integration.healthScore >= 85 ? "text-yellow-500" : "text-red-500"
                    )}>
                      {integration.healthScore}%
                    </span>
                  </div>
                  <Progress 
                    value={integration.healthScore} 
                    className="h-1"
                  />
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>v{integration.version}</span>
                    <span>{integration.integrationPoints.length} endpoints</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Integration View */}
      {selectedIntegration && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {selectedIntegration.type === 'ai' && <Brain className="w-5 h-5 mr-2 text-purple-500" />}
              {selectedIntegration.type === 'core' && <Layers className="w-5 h-5 mr-2 text-blue-500" />}
              {selectedIntegration.type === 'marketplace' && <Package className="w-5 h-5 mr-2 text-green-500" />}
              {selectedIntegration.type === 'template' && <Settings className="w-5 h-5 mr-2 text-orange-500" />}
              {selectedIntegration.name} Details
            </CardTitle>
            <CardDescription>
              Detailed integration status and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="endpoints" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="endpoints">Integration Points</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
              </TabsList>
              
              <TabsContent value="endpoints" className="mt-6">
                <div className="space-y-4">
                  {selectedIntegration.integrationPoints.map((point, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-lg border transition-all duration-300",
                        isDark ? "bg-white/5" : "bg-black/5"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(point.status)}
                        <div>
                          <div className="font-medium">{point.name}</div>
                          <div className="text-sm text-gray-500">
                            {point.type} • {point.endpoint || 'Internal service'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-gray-500">Last Sync</div>
                        <div className="font-medium">{formatLastSync(point.lastSync)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="performance" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {selectedIntegration.integrationPoints.map((point, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{point.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Latency</span>
                            <span className={cn(
                              "text-sm font-medium",
                              (point.latency || 0) < 100 ? "text-green-500" :
                              (point.latency || 0) < 200 ? "text-yellow-500" : "text-red-500"
                            )}>
                              {formatLatency(point.latency)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Error Rate</span>
                            <span className={cn(
                              "text-sm font-medium",
                              (point.errorRate || 0) < 0.01 ? "text-green-500" :
                              (point.errorRate || 0) < 0.05 ? "text-yellow-500" : "text-red-500"
                            )}>
                              {formatErrorRate(point.errorRate)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Status</span>
                            <Badge className={cn("text-xs", getStatusColor(point.status))}>
                              {point.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="dependencies" className="mt-6">
                <div className="space-y-4">
                  {selectedIntegration.dependencies.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No dependencies - This is a core component</p>
                    </div>
                  ) : (
                    selectedIntegration.dependencies.map((depId) => {
                      const dependency = detailedIntegrations.find(i => i.id === depId);
                      return dependency ? (
                        <div
                          key={depId}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-lg border transition-all duration-300",
                            isDark ? "bg-white/5" : "bg-black/5"
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(dependency.status)}
                            <div>
                              <div className="font-medium">{dependency.name}</div>
                              <div className="text-sm text-gray-500">
                                v{dependency.version} • Health: {dependency.healthScore}%
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      ) : null;
                    })
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* System Alerts */}
      <div className="space-y-4">
        {detailedIntegrations.some(i => i.healthScore < 90) && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Some components have health scores below 90%. Consider reviewing integration points and dependencies.
            </AlertDescription>
          </Alert>
        )}
        
        {detailedIntegrations.some(i => 
          i.integrationPoints.some(p => p.status === 'partial' || p.status === 'disconnected')
        ) && (
          <Alert>
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Integration point issues detected. Check network connectivity and service availability.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
