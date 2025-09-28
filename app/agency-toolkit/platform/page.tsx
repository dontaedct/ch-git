'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  BarChart3,
  Bot,
  Cog,
  Database,
  GitBranch,
  Globe,
  Lock,
  Monitor,
  Puzzle,
  Rocket,
  Shield,
  Sparkles,
  Users,
  Zap
} from 'lucide-react';

interface PlatformMetrics {
  totalApps: number;
  activeUsers: number;
  deployments: number;
  uptime: number;
  performance: number;
  security: number;
}

interface FeatureModule {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'maintenance';
  version: string;
  icon: any;
  metrics?: {
    usage: number;
    performance: number;
    health: number;
  };
}

export default function PlatformDashboard() {
  const [metrics, setMetrics] = useState<PlatformMetrics>({
    totalApps: 127,
    activeUsers: 1584,
    deployments: 342,
    uptime: 99.7,
    performance: 94.2,
    security: 98.5
  });

  const [features, setFeatures] = useState<FeatureModule[]>([
    {
      id: 'ai-generator',
      name: 'AI App Generator',
      description: 'Intelligent app generation with template intelligence',
      status: 'active',
      version: '2.1.0',
      icon: Bot,
      metrics: { usage: 89, performance: 92, health: 96 }
    },
    {
      id: 'form-builder',
      name: 'Advanced Form Builder',
      description: 'Sophisticated form system with 11 field types',
      status: 'active',
      version: '1.8.3',
      icon: Puzzle,
      metrics: { usage: 76, performance: 88, health: 94 }
    },
    {
      id: 'security-framework',
      name: 'Enterprise Security',
      description: 'Guardian system with advanced authentication',
      status: 'active',
      version: '3.2.1',
      icon: Shield,
      metrics: { usage: 100, performance: 97, health: 99 }
    },
    {
      id: 'automation-engine',
      name: 'Workflow Automation',
      description: 'N8N integration with business process automation',
      status: 'active',
      version: '1.5.2',
      icon: Zap,
      metrics: { usage: 67, performance: 91, health: 93 }
    },
    {
      id: 'analytics-suite',
      name: 'Development Analytics',
      description: 'Productivity insights and performance monitoring',
      status: 'active',
      version: '2.0.1',
      icon: BarChart3,
      metrics: { usage: 84, performance: 89, health: 95 }
    },
    {
      id: 'cli-tools',
      name: 'Enhanced DCT CLI',
      description: 'Advanced commands with intelligent defaults',
      status: 'active',
      version: '4.1.0',
      icon: Monitor,
      metrics: { usage: 92, performance: 95, health: 97 }
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 95) return 'text-green-600';
    if (health >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Platform Integration Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Unified view of your enhanced agency toolkit platform
          </p>
        </div>
        <Badge variant="outline" className="px-4 py-2">
          <Globe className="w-4 h-4 mr-2" />
          Production Ready
        </Badge>
      </div>

      {/* Platform Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Apps</CardTitle>
            <Rocket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalApps}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployments</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.deployments}</div>
            <p className="text-xs text-muted-foreground">
              +24% this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.uptime}%</div>
            <p className="text-xs text-muted-foreground">
              Uptime last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Platform Performance Overview
          </CardTitle>
          <CardDescription>
            Real-time performance metrics across all platform modules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Performance Score</span>
                <span className="font-medium">{metrics.performance}%</span>
              </div>
              <Progress value={metrics.performance} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Security Rating</span>
                <span className="font-medium">{metrics.security}%</span>
              </div>
              <Progress value={metrics.security} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>System Uptime</span>
                <span className="font-medium">{metrics.uptime}%</span>
              </div>
              <Progress value={metrics.uptime} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Modules */}
      <Tabs defaultValue="modules" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="modules">Feature Modules</TabsTrigger>
          <TabsTrigger value="integration">Integration Status</TabsTrigger>
          <TabsTrigger value="architecture">System Architecture</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <Card key={feature.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <IconComponent className="w-5 h-5" />
                        {feature.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(feature.status)}`} />
                        <Badge variant="secondary">{feature.version}</Badge>
                      </div>
                    </div>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {feature.metrics && (
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Usage</span>
                          <span className="font-medium">{feature.metrics.usage}%</span>
                        </div>
                        <Progress value={feature.metrics.usage} className="h-1" />

                        <div className="flex justify-between text-sm">
                          <span>Performance</span>
                          <span className="font-medium">{feature.metrics.performance}%</span>
                        </div>
                        <Progress value={feature.metrics.performance} className="h-1" />

                        <div className="flex justify-between text-sm">
                          <span>Health</span>
                          <span className={`font-medium ${getHealthColor(feature.metrics.health)}`}>
                            {feature.metrics.health}%
                          </span>
                        </div>
                        <Progress value={feature.metrics.health} className="h-1" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Puzzle className="w-5 h-5" />
                Integration Status
              </CardTitle>
              <CardDescription>
                Cross-module integration health and compatibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'AI Generator ↔ Form Builder', status: 'healthy', compatibility: 98 },
                  { name: 'Security Framework ↔ All Modules', status: 'healthy', compatibility: 99 },
                  { name: 'Analytics ↔ Performance Monitor', status: 'healthy', compatibility: 96 },
                  { name: 'CLI Tools ↔ Development Scripts', status: 'healthy', compatibility: 97 },
                  { name: 'Automation ↔ Webhook System', status: 'healthy', compatibility: 95 }
                ].map((integration, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="font-medium">{integration.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{integration.compatibility}%</span>
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        {integration.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="architecture" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                System Architecture Overview
              </CardTitle>
              <CardDescription>
                Cohesive platform architecture and component relationships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Core Platform Layer
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Unified API Gateway</span>
                        <Badge variant="outline">Active</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Authentication Hub</span>
                        <Badge variant="outline">Active</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Event Bus System</span>
                        <Badge variant="outline">Active</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Configuration Manager</span>
                        <Badge variant="outline">Active</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Security & Compliance
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Guardian Security System</span>
                        <Badge variant="outline">Active</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>RLS Policy Engine</span>
                        <Badge variant="outline">Active</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Audit Logging</span>
                        <Badge variant="outline">Active</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Compliance Monitor</span>
                        <Badge variant="outline">Active</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Cog className="w-4 h-4" />
                    Integration Patterns
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium mb-2">Event-Driven</div>
                      <div className="text-gray-600">Microservice communication via event bus</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium mb-2">API-First</div>
                      <div className="text-gray-600">RESTful APIs with GraphQL support</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium mb-2">Plugin Architecture</div>
                      <div className="text-gray-600">Modular components with hot-reload</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Management</CardTitle>
          <CardDescription>
            Quick actions for platform administration and monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Monitor className="w-5 h-5" />
              <span>System Monitor</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Cog className="w-5 h-5" />
              <span>Configuration</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>Security Audit</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              <span>Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}